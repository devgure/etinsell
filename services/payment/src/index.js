require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { createCheckoutSession, constructEvent, stripe } = require('./stripeService');
const prisma = require('./db');
const { sendTip, sendETIWithFee } = require('./etiService');
const { mapPriceToAction } = require('./paymentHelpers');
const processedEvents = require('./processedEvents');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PRICE_IDS = {
  premium: process.env.STRIPE_PREMIUM_PRICE_ID,
  gold: process.env.STRIPE_GOLD_PRICE_ID,
  trusted_badge: process.env.STRIPE_TRUSTED_BADGE_PRICE_ID,
  undo_swipe: process.env.STRIPE_UNDO_SWIPE_PRICE_ID,
  incognito: process.env.STRIPE_INCOGNITO_PRICE_ID,
  super_like: process.env.STRIPE_SUPER_LIKE_PRICE_ID,
  rose_gift: process.env.STRIPE_ROSE_GIFT_PRICE_ID,
  diamond_gift: process.env.STRIPE_DIAMOND_GIFT_PRICE_ID,
};

app.post('/create-checkout-session', async (req, res) => {
  const { priceId, item, successUrl, cancelUrl, customerEmail, mode, userId, receiverId } = req.body;
  const resolvedPriceId = priceId || (item && PRICE_IDS[item]);
  if (!resolvedPriceId) return res.status(400).json({ error: 'priceId or valid item required' });
  try {
    const session = await createCheckoutSession({
      priceId: resolvedPriceId,
      customerEmail,
      successUrl: successUrl || process.env.FRONTEND_URL,
      cancelUrl: cancelUrl || (process.env.FRONTEND_URL + '/cancel'),
      mode: mode || (item === 'undo_swipe' || (item && item.includes('gift')) ? 'payment' : 'subscription'),
      metadata: { userId: userId || customerEmail || 'unknown', item: item || '', receiverId: receiverId || '' },
    });

    // Record a pending transaction placeholder
    try {
      await prisma.transaction.create({
        data: {
          userId: userId || customerEmail || 'unknown',
          type: item && (item.includes('gift') ? 'GIFT' : item === 'undo_swipe' ? 'UNDO_SWIPE' : item === 'trusted_badge' ? 'VERIFIED_BADGE' : 'SUBSCRIPTION'),
          amount: 0,
          currency: 'USD',
          status: 'PENDING',
        },
      });
    } catch (e) {
      console.warn('Could not create pending transaction', e.message);
    }

    res.json({ url: session.url, id: session.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'stripe error' });
  }
});

// Webhook endpoint to handle Stripe events
app.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = constructEvent(req.body, sig);
  } catch (err) {
    console.error('Webhook verification failed', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Idempotency: check if event already processed
  try {
    if (event && event.id) {
      const already = await processedEvents.isProcessed(event.id);
      if (already) {
        console.log('Ignoring already processed event', event.id);
        return res.json({ received: true, skipped: true });
      }
      await processedEvents.markProcessing(event.id, event.type);
    }
  } catch (e) {
    console.warn('ProcessedEvent check failed', e.message);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('checkout.session.completed', session.id);
        const full = await stripe.checkout.sessions.retrieve(session.id, { expand: ['line_items', 'line_items.data.price'] });
        const lineItems = full.line_items?.data || [];

        // identify user
        let user = null;
        const userIdentifier = (full.metadata && full.metadata.userId) || full.client_reference_id || full.customer_email;
        if (full.metadata && full.metadata.userId) {
          user = await prisma.user.findUnique({ where: { id: full.metadata.userId } }).catch(() => null);
        }
        if (!user && full.customer_email) {
          user = await prisma.user.findUnique({ where: { email: full.customer_email } }).catch(() => null);
        }

        for (const li of lineItems) {
          const price = li.price?.id;
          const qty = li.quantity || 1;
          const action = mapPriceToAction(price);
          const amount = (li.amount_total || li.price?.unit_amount || 0) / 100;
          const currency = (li.currency || full.currency || 'USD').toUpperCase();

          // Record transaction (best-effort idempotency check)
          try {
            let tx = await prisma.transaction.findFirst({ where: { userId: user ? user.id : (userIdentifier || 'unknown'), amount: Number(amount), status: 'PENDING' } }).catch(() => null);
            if (!tx) {
              tx = await prisma.transaction.create({ data: {
                userId: user ? user.id : (userIdentifier || 'unknown'),
                type: action.type === 'subscription' ? 'SUBSCRIPTION' : (action.action === 'gift' ? 'GIFT' : (action.action === 'undo_swipe' ? 'UNDO_SWIPE' : 'GIFT')),
                amount: Number(amount),
                currency,
                status: 'SUCCESS'
              }}).catch(e => { console.warn('tx create failed', e.message); return null; });
            } else {
              await prisma.transaction.update({ where: { id: tx.id }, data: { status: 'SUCCESS' } }).catch(() => null);
            }
          } catch (e) { console.warn('transaction handling error', e.message); }

          // Apply business effects
          try {
            if (action.type === 'subscription') {
              const plan = action.plan === 'GOLD' ? 'GOLD' : 'PREMIUM';
              if (user) {
                const existing = await prisma.subscription.findFirst({ where: { userId: user.id, plan } }).catch(() => null);
                if (!existing) {
                  await prisma.subscription.create({ data: { userId: user.id, plan, status: 'ACTIVE' } }).catch(() => null);
                } else {
                  await prisma.subscription.update({ where: { id: existing.id }, data: { status: 'ACTIVE' } }).catch(() => null);
                }
                await prisma.user.update({ where: { id: user.id }, data: { planType: plan, isPremium: true } }).catch(() => null);
                if (action.action === 'incognito') {
                  const expiry = new Date(Date.now() + 30*24*60*60*1000);
                  await prisma.user.update({ where: { id: user.id }, data: { hasIncognito: true, incognitoExpiry: expiry } }).catch(() => null);
                }
              }
            } else if (action.type === 'one_time') {
              if (user) {
                if (action.action === 'undo_swipe') {
                  await prisma.user.update({ where: { id: user.id }, data: { undoCredits: { increment: qty } } }).catch(() => null);
                } else if (action.action === 'trusted_badge') {
                  await prisma.user.update({ where: { id: user.id }, data: { hasBadge: true, badgePurchasedAt: new Date() } }).catch(() => null);
                } else if (action.action === 'gift') {
                  const receiverId = full.metadata?.receiverId;
                  if (receiverId) {
                    await prisma.gift.create({ data: { senderId: user.id, receiverId, giftType: price || 'gift' } }).catch(() => null);
                  }
                }
              }
            }
          } catch (e) { console.warn('business effect error', e.message); }
        }

        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        console.log('invoice.payment_succeeded', invoice.id);
        const custEmail = invoice.customer_email || (invoice.customer && invoice.customer.email) || null;
        if (custEmail) {
          const user = await prisma.user.findUnique({ where: { email: custEmail } }).catch(() => null);
          if (user) {
            await prisma.transaction.updateMany({ where: { userId: user.id, status: 'PENDING' }, data: { status: 'SUCCESS' } }).catch(() => null);
            if (invoice.subscription) {
              const subs = await prisma.subscription.findMany({ where: { userId: user.id } }).catch(() => []);
              for (const s of subs) {
                await prisma.subscription.update({ where: { id: s.id }, data: { status: 'ACTIVE' } }).catch(() => null);
              }
            }
          }
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        console.log('customer.subscription.deleted', sub.id);
        const cust = sub.customer_email || (sub.customer && sub.customer.email) || null;
        if (cust) {
          const user = await prisma.user.findUnique({ where: { email: cust } }).catch(() => null);
          if (user) {
            await prisma.subscription.updateMany({ where: { userId: user.id }, data: { status: 'CANCELED' } }).catch(() => null);
            await prisma.user.update({ where: { id: user.id }, data: { planType: 'FREE', isPremium: false } }).catch(() => null);
          }
        }
        break;
      }
      default:
        console.log('Unhandled event', event.type);
    }
  } catch (err) {
    console.error('Error processing webhook', err);
    if (event && event.id) await processedEvents.markFailed(event.id, err.message).catch(() => null);
  }
  if (event && event.id) await processedEvents.markProcessed(event.id, { success: true }).catch(() => null);
  res.json({ received: true });
});

// Tipping endpoint - Fiat or Crypto as ETI (stub)
app.post('/tip', async (req, res) => {
  const { fromUserId, toAddress, amountETI, currency = 'ETI' } = req.body;
  if (!toAddress || !amountETI) return res.status(400).json({ error: 'toAddress and amountETI required' });
  try {
    const platformAddress = process.env.PLATFORM_WALLET_ADDRESS;
    const platformCut = Number(amountETI) * 0.15;
    const recipientAmount = Number(amountETI) - platformCut;

    // Create parent transaction record for audit
    const parentTx = await prisma.transaction.create({ data: {
      userId: fromUserId || 'unknown', type: 'TIP', amount: Number(amountETI), currency, status: 'PENDING'
    }});

    // Perform token transfer using ERC-20 transfer with fee split
    const { recipientTxHash, platformTxHash } = await sendETIWithFee({ recipientAddress: toAddress, amountETI: String(amountETI), platformAddress });

    // Record recipient transaction (use TIP type and include details in description)
    if (recipientTxHash) {
      await prisma.transaction.create({ data: {
        userId: fromUserId || 'unknown',
        type: 'TIP',
        amount: recipientAmount,
        currency,
        status: 'SUCCESS',
        description: JSON.stringify({ role: 'recipient', txHash: recipientTxHash, to: toAddress })
      }}).catch(() => null);
    }

    // Record platform fee transaction (assign to payer for audit)
    if (platformTxHash) {
      await prisma.transaction.create({ data: {
        userId: fromUserId || 'unknown',
        type: 'TIP',
        amount: platformCut,
        currency,
        status: 'SUCCESS',
        description: JSON.stringify({ role: 'platform_fee', txHash: platformTxHash, to: platformAddress })
      }}).catch(() => null);
    }

    // Mark parent audit tx as success
    await prisma.transaction.update({ where: { id: parentTx.id }, data: { status: 'SUCCESS' } }).catch(() => null);

    res.json({ success: true, recipientTxHash, platformTxHash });
  } catch (err) {
    console.error('Tip failed', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 3010;
  app.listen(PORT, () => console.log(`Payment service listening on ${PORT}`));
}
