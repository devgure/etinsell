const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Mock verification endpoint
app.post('/verify', (req, res) => {
  const { wallet, signature, payload } = req.body;
  if (!wallet || !signature) return res.status(400).json({ verified: false });
  // In an MVP we don't verify real signatures.
  const verified = signature.startsWith('0x') && wallet.startsWith('0x');
  res.json({ verified });
});

app.get('/', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Blockchain mock listening on ${PORT}`));
