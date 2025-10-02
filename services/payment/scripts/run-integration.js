// Lightweight integration runner: start an in-memory MongoDB, push Prisma schema, seed minimal data, run Jest, teardown.
const { MongoMemoryServer } = require('mongodb-memory-server');
const { execSync } = require('child_process');
const path = require('path');

async function main() {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  console.log('Started in-memory MongoDB at', uri);

  // Set DATABASE_URL for child processes
  process.env.DATABASE_URL = uri;

  // Push schema
  console.log('Running prisma db push...');
  execSync('npx prisma db push --schema=../../prisma/schema.prisma', { stdio: 'inherit' });

  // Seed minimal data
  console.log('Seeding DB...');
  const seedScript = path.join(__dirname, '..', 'src', 'seed.js');
  if (require('fs').existsSync(seedScript)) {
    execSync(`node ${seedScript}`, { stdio: 'inherit' });
  } else {
    console.log('No seed script found at', seedScript, '— skipping seed step');
  }

  // Run Jest integration tests
  console.log('Running integration tests (jest)...');
  execSync('npx jest --runInBand', { stdio: 'inherit' });

  // Teardown
  await mongod.stop();
  console.log('In-memory MongoDB stopped');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
