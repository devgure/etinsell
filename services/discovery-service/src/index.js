require('dotenv').config();
const express = require('express');
const { Client } = require('@elastic/elasticsearch');
const Redis = require('ioredis');

const es = new Client({ node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200' });
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const app = express();
app.use(express.json());
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.get('/search', async (req, res) => {
  const q = req.query.q || '';
  const cacheKey = `search:${q}`;
  const cached = await redis.get(cacheKey);
  if (cached) return res.json(JSON.parse(cached));
  const result = await es.search({ index: process.env.ES_INDEX || 'profiles', q });
  await redis.set(cacheKey, JSON.stringify(result.body), 'EX', 30);
  res.json(result.body);
});

const PORT = process.env.PORT || 3040;
app.listen(PORT, () => console.log('Discovery service listening', PORT));
