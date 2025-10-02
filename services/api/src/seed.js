const prisma = require('./db');

async function seed() {
  console.log('Seeding API DB...');
  await prisma.user.create({ data: { email: 'seed@example.com', name: 'Seed User' } });
  console.log('Seed complete');
  await prisma.$disconnect();
}

seed().catch(e => { console.error(e); process.exit(1); });
