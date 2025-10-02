const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const AUTH_URL = process.env.AUTH_URL || 'http://auth:3001';
const MATCH_URL = process.env.MATCH_URL || 'http://match:5000';

// Auth proxy
app.post('/api/signup', async (req, res) => {
  const r = await fetch(`${AUTH_URL}/signup`, { method: 'POST', body: JSON.stringify(req.body), headers: { 'Content-Type':'application/json' } });
  const data = await r.json();
  res.status(r.status).json(data);
});

app.post('/api/login', async (req, res) => {
  const r = await fetch(`${AUTH_URL}/login`, { method: 'POST', body: JSON.stringify(req.body), headers: { 'Content-Type':'application/json' } });
  const data = await r.json();
  res.status(r.status).json(data);
});

app.get('/api/me', async (req, res) => {
  const headers = {}; if (req.headers.authorization) headers.authorization = req.headers.authorization;
  const r = await fetch(`${AUTH_URL}/me`, { headers });
  const data = await r.json();
  res.status(r.status).json(data);
});

// Match proxy (example search)
app.get('/api/search', async (req, res) => {
  const qs = new URLSearchParams(req.query).toString();
  const r = await fetch(`${MATCH_URL}/search?${qs}`);
  const data = await r.json();
  res.status(r.status).json(data);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Gateway listening on ${PORT}`));
