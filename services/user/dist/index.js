const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/users', async (req, res) => {
  try {
    const { email, name, password, birthDate, gender } = req.body;
    const user = await prisma.user.create({ data: { email, name, password, birthDate: new Date(birthDate), gender } });
    res.status(201).json(user);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get('/users/:id', async (req, res) => {
  const u = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!u) return res.status(404).json({ error: 'not found' });
  res.json(u);
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`User service listening on ${PORT}`));
