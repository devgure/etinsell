const prisma = require('./db');

async function isProcessed(eventId) {
  if (!eventId) return false;
  const found = await prisma.processedEvent.findUnique({ where: { eventId } }).catch(() => null);
  return !!found;
}

async function markProcessing(eventId, type) {
  if (!eventId) return null;
  return prisma.processedEvent.create({ data: { eventId, type, status: 'PROCESSING' } }).catch(() => null);
}

async function markProcessed(eventId, result) {
  if (!eventId) return null;
  return prisma.processedEvent.update({ where: { eventId }, data: { status: 'DONE', result, processedAt: new Date() } }).catch(() => null);
}

async function markFailed(eventId, error) {
  if (!eventId) return null;
  return prisma.processedEvent.update({ where: { eventId }, data: { status: 'FAILED', error: String(error), processedAt: new Date() } }).catch(() => null);
}

module.exports = { isProcessed, markProcessing, markProcessed, markFailed };
