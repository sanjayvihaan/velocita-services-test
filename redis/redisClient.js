const redisPort = process.env.REDISPORT || 6379
const redisHost = process.env.REDISHOST || '172.17.0.2'
// const redisHost = process.env.REDISHOST || '1727.0.0.1'

// creating redis client
const redis = require('redis');
const redisClient = redis.createClient({
  port: redisPort,
  host: redisHost
})

// connecting to redis client
redisClient.connect()
.then(() => {
  console.log(`REDIS SUCCESS: Redis server connected`) 
})
.catch((err) => {
  console.log(`REDIS ERROR: Redis server not connected, ${err}`)
})

module.exports = { redisClient }