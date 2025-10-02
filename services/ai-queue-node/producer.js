import { Queue } from 'bullmq';
import Redis from 'ioredis';
import 'dotenv/config';

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const queue = new Queue('ai-embeddings', { connection });

async function enqueue(texts) {
  await queue.add('embed-job', { texts });
  console.log('Enqueued', texts.length, 'texts');
}

if (process.argv.length > 2) {
  const texts = process.argv.slice(2);
  enqueue(texts).then(() => process.exit(0));
}

export { enqueue };
