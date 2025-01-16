import clear from 'clear'
const Redis = require('ioredis')
const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
})

/* This is purely for demostration purposes, as we can see the live status of the different
web servers */
export const statusLogger = async () => {
    clear()
    const servers = await redis.keys('localhost:*')
    console.log('server \t \t | status')
    console.log('--------------------------')
    for (let server of servers) {
        const result = await redis.get(server)
        console.log(`${server} \t | ${result}`)
    }
}
