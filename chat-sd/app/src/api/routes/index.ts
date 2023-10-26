import express from 'express'
import { Request, Response, NextFunction } from 'express'
import clear from 'clear'

const router = express.Router()
const Redis = require('ioredis')
const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
})
var i = 0

/* This is purely for demostration purposes, as we can see the live status of the different
web servers */
setInterval(async () => {
    clear()
    const servers = await redis.keys('localhost:*')
    console.log('server \t \t | status')
    console.log('--------------------------')
    for (let server of servers) {
        const result = await redis.get(server)
        console.log(`${server} \t | ${result}`)
    }
}, 1000)

router
    .route('/ws-server')
    .get(async (req: Request, res: Response, next: NextFunction) => {
        try {
            const servers = await redis.keys('localhost:*')
            const max_attempts = servers.length
            var attempt = 0

            // max_attempts equal to the length of the servers means
            // that we exactly check one full round for available servers.
            // this is done in a round-robin fashion.
            while (attempt <= max_attempts) {
                const server = servers[i]
                i = (i + 1) % servers.length

                // if the servers has status 'ACTIVE', we return it
                // back to the client.
                if ((await redis.get(server)) === 'ACTIVE') {
                    return res.status(200).send({
                        ws: server
                    })
                }
                attempt += 1
            }

            return res.status(500).send('No server available!!')
        } catch (e) {
            console.log(e)
        }
    })

module.exports = router
