const prisma = require('../db');

async function getUsers(req, res) {
  const users = await prisma.user.findMany();
  res.json(users);
}

async function getUser(req, res) {
  const { id } = req.params;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return res.status(404).send({ error: 'Not found' });
  res.json(user);
}

module.exports = { getUsers, getUser };
