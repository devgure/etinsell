const jestMock = require('jest-mock');

// singleton mock instance shared across all imports/instantiations
const prismaMock = {
  user: {
    count: jestMock.fn().mockResolvedValue(0),
    create: jestMock.fn().mockResolvedValue({ id: 'mock-id', email: 'test@example.com' }),
  },
  transaction: {
    create: jestMock.fn().mockResolvedValue({ id: 'tx-mock' }),
  },
  $disconnect: jestMock.fn().mockResolvedValue(),
};

class PrismaClient {
  constructor() {
    // return the same singleton object for every `new PrismaClient()`
    return prismaMock;
  }
}

module.exports = { PrismaClient, __prismaMock: prismaMock };
