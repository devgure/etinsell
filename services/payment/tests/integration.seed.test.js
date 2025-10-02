jest.mock('@prisma/client');

const prismaModule = require('@prisma/client');
const prismaClientFactory = prismaModule.PrismaClient;

describe('seed script (mocked Prisma)', () => {
  it('runs seed and creates a user when none exist', async () => {
    const prisma = new prismaClientFactory();
    // ensure count returns 0
    prisma.user.count.mockResolvedValue(0);

    // require the seed script which uses ../../prismaClient or ./db
    const seed = require('../src/../src/seed.js');

    // give the script a moment to run (it runs immediately)
    await new Promise((r) => setTimeout(r, 50));

    expect(prisma.user.count).toHaveBeenCalled();
    expect(prisma.user.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ email: 'test@example.com' }) }));
    expect(prisma.$disconnect).toHaveBeenCalled();
  });
});
