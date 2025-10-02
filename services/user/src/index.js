const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.post('/users', async (req, res) => {
  const { email, name, password } = req.body;
  if (!email || !name) return res.status(400).json({ error: 'email+name required' });
  const u = await prisma.user.create({ data: { email, name, password } });
  res.status(201).json(u);
});

app.get('/users/:id', async (req, res) => {
  const u = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!u) return res.status(404).json({ error: 'not found' });
  res.json(u);
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`User service listening on ${PORT}`));
