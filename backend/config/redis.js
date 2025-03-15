const redis = require('redis');
require('dotenv').config();

const redisClient = redis.createClient({
  url: process.env.REDIS_URL,
  legacyMode: true,
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
  },
});

redisClient.on('error', (err) => console.error('Redis error:', err));
redisClient.on('connect', () => console.log('Redis connected'));

const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
  return redisClient;
};

const cacheFirestoreQuery = async (key, queryFn, ttl = 3600) => {
  const cached = await redisClient.get(key);
  if (cached) return JSON.parse(cached);

  const result = await queryFn();
  await redisClient.setEx(key, ttl, JSON.stringify(result));
  return result;
};

module.exports = { redisClient, connectRedis, cacheFirestoreQuery };