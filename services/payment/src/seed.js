let prisma;
try {
  // prefer the project's @prisma/client (Jest will mock this)
  const { PrismaClient } = require('@prisma/client');
  prisma = new PrismaClient();
} catch (e) {
  // fallback to a repo-level helper or local db.js
  try {
    prisma = require('../../prismaClient');
  } catch (e) {
    prisma = require('./db');
  }
}

async function seed() {
  console.log('Seeding minimal data for integration tests...');
  try {
    // create a user if none exists
    const count = await prisma.user.count();
    if (count === 0) {
      await prisma.user.create({ data: { email: 'test@example.com', name: 'Test User' } });
      console.log('Created test user');
    } else {
      console.log('Users already present, skipping creation');
    }
  } catch (e) {
    console.error('Seed failed', e);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
