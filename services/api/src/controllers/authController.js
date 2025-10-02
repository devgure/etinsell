const crypto = require('crypto');

// In-memory user store for smoke tests only
const users = new Map();

// seed a test user
const seedUser = {
  id: 'user-test-1',
  email: 'test@local',
  name: 'Test User',
  password: 'password' // plain-text for smoke test only
};
users.set(seedUser.email, seedUser);

function generateToken() {
  return crypto.randomBytes(16).toString('hex');
}

async function signup(req, res) {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  if (users.has(email)) return res.status(409).json({ error: 'user exists' });
  const id = `user-${Date.now()}`;
  const user = { id, email, name: name || email.split('@')[0], password };
  users.set(email, user);
  const token = generateToken();
  // attach token to user for simple validation
  user._token = token;
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
}

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const user = users.get(email);
  if (!user || user.password !== password) return res.status(401).json({ error: 'invalid credentials' });
  const token = generateToken();
  user._token = token;
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
}

async function getProfile(req, res) {
  const auth = req.headers.authorization || '';
  const token = auth.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'missing token' });
  const user = Array.from(users.values()).find(u => u._token === token);
  if (!user) return res.status(401).json({ error: 'invalid token' });
  res.json({ id: user.id, email: user.email, name: user.name });
}

module.exports = { signup, login, getProfile, _users: users };
