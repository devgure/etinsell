const prisma = require('../db');

async function createCheckoutSession(req, res) {
  // stub - integrate Stripe here
  const { userId, priceId } = req.body;
  const tx = await prisma.transaction.create({ data: { userId, type: 'SUBSCRIPTION', amount: 9.99, currency: 'USD', status: 'PENDING' } });
  res.json({ sessionId: 'cs_test_123', tx });
}

async function webhook(req, res) {
  // verify event and update transactions
  res.json({ received: true });
}

async function tip(req, res) {
  const { fromUserId, toUserId, amount } = req.body;
  const tx = await prisma.transaction.create({ data: { userId: fromUserId, type: 'TIP', amount, currency: 'ETI', status: 'SUCCESS', description: `Tip to ${toUserId}` } });
  res.json({ tx });
}

module.exports = { createCheckoutSession, webhook, tip };
