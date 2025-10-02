const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// In-memory user store for MVP
const users = new Map();

app.post('/signup', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email+password required' });
  if (users.has(email)) return res.status(409).json({ error: 'user exists' });
  const hash = await bcrypt.hash(password, 10);
  const id = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
  users.set(email, { id, email, name, hash });
  const token = jwt.sign({ sub: id, email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, id });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const u = users.get(email);
  if (!u) return res.status(401).json({ error: 'invalid' });
  const ok = await bcrypt.compare(password, u.hash);
  if (!ok) return res.status(401).json({ error: 'invalid' });
  const token = jwt.sign({ sub: u.id, email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, id: u.id });
});

app.get('/me', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'missing auth' });
  const token = auth.replace(/^Bearer\s+/, '');
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const email = payload.email;
    const u = users.get(email);
    if (!u) return res.status(404).json({ error: 'not found' });
    res.json({ id: u.id, email: u.email, name: u.name });
  } catch (e) {
    res.status(401).json({ error: 'invalid token' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Auth service listening on ${PORT}`));
