require('dotenv').config();
const express = require('express');
const { ethers } = require('ethers');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.post('/mint', async (req, res) => {
  // placeholder: mint logic using ethers
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3060;
app.listen(PORT, () => console.log('Blockchain service listening', PORT));
