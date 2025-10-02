const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test');

const app = express();
app.use(cors());
app.use(bodyParser.json({ type: '*/*' }));

app.post('/webhook', (req, res) => {
  // In production verify stripe signature using STRIPE_WEBHOOK_SECRET
  const event = req.body;
  console.log('stripe event', event.type);
  res.json({ received: true });
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3010;
app.listen(PORT, () => console.log(`Payment service listening on ${PORT}`));
