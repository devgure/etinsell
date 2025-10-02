const request = require('supertest');

// Mock db and processedEvents to avoid Prisma
jest.mock('../src/db', () => ({
  transaction: {
    create: async (args) => ({ id: 'tx_mock', ...args }),
    update: async (args) => ({ id: args.where.id, ...args }),
  }
}));
jest.mock('../src/processedEvents', () => ({ isProcessed: async () => false, markProcessing: async () => null, markProcessed: async () => null, markFailed: async () => null }));

jest.mock('../src/etiService', () => ({
  sendETIWithFee: async ({ recipientAddress }) => ({ recipientTxHash: '0xabc', platformTxHash: '0xdef' }),
}));

const app = require('../src/index');

describe('tip', () => {
  it('processes tip and returns tx hashes', async () => {
    const res = await request(app)
      .post('/tip')
      .send({ fromUserId: 'user1', toAddress: '0xRecipient', amountETI: 10 });
    expect(res.status).toBe(200);
    expect(res.body.recipientTxHash).toBe('0xabc');
    expect(res.body.platformTxHash).toBe('0xdef');
  });
});
