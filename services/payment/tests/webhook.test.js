const request = require('supertest');

// Mock db to avoid requiring @prisma/client in tests
jest.mock('../src/db', () => ({
  transaction: {
    create: async (args) => ({ id: 'tx_mock', ...args }),
    findFirst: async () => null,
    update: async () => null,
    updateMany: async () => null,
  },
  user: {
    findUnique: async () => null
  },
  subscription: {
    findFirst: async () => null,
    create: async () => null,
    update: async () => null,
  },
  gift: { create: async () => null }
}));
jest.mock('../src/processedEvents', () => ({ isProcessed: async () => false, markProcessing: async () => null, markProcessed: async () => null, markFailed: async () => null }));

jest.mock('../src/stripeService', () => ({
  constructEvent: (raw, sig) => {
    // return a fake checkout.session.completed event
    return {
      id: 'evt_test_1',
      type: 'checkout.session.completed',
      data: { object: { id: 'cs_test_1' } }
    };
  },
  stripe: { checkout: { sessions: { retrieve: async () => ({ line_items: { data: [] }, metadata: {} }) } } }
}));

const app = require('../src/index');

describe('webhook', () => {
  it('responds 200 and records processed event', async () => {
    const res = await request(app)
      .post('/webhook')
      .set('stripe-signature', 'sig')
      .send({});
    expect(res.status).toBe(200);
    expect(res.body.received).toBe(true);
  });
});
