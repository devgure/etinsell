import { Worker } from 'bullmq';
import Redis from 'ioredis';
import fetch from 'node-fetch';
import 'dotenv/config';

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const worker = new Worker('ai-embeddings', async job => {
  const { texts } = job.data;
  console.log('Processing job', job.id, texts.length, 'texts');

  const res = await fetch((process.env.AI_SERVICE_URL || 'http://localhost:8000') + '/embeddings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texts }),
  });
  if (!res.ok) throw new Error('AI service failed ' + res.statusText);
  const data = await res.json();
  console.log('Got embeddings for job', job.id);
  return data;
}, { connection });

worker.on('failed', (job, err) => console.error('Job failed', job.id, err));
worker.on('completed', (job, ret) => console.log('Job completed', job.id));
