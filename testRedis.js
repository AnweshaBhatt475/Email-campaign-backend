const Redis = require('ioredis');

const redis = new Redis({
  host: '127.0.0.1',
  port: 6379,
  maxRetriesPerRequest: null
});

redis.ping()
  .then(response => {
    console.log('✅ Redis connected:', response); // should print 'PONG'
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Redis connection failed:', error);
    process.exit(1);
  });
