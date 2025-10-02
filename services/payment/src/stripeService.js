const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-08-15' });

async function createCheckoutSession({ priceId, customerEmail, successUrl, cancelUrl, mode = 'subscription' }) {
  const session = await stripe.checkout.sessions.create({
    mode,
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: customerEmail,
  });
  return session;
}

function constructEvent(rawBody, sig) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) return JSON.parse(rawBody);
  return stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
}

module.exports = { createCheckoutSession, constructEvent, stripe };
