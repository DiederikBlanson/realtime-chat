import { Request } from 'express'
import express from 'express'
// @ts-ignore
import api from './api/routes'
import dotenv from 'dotenv'
import cors from 'cors'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import http from 'http'
import WebSocket from 'ws'
import { handleWebSocketConnection } from './ws-connection'
import { CustomWebSocket } from './types'
import { getSummary, getContentType, createMiddleware } from '@promster/express'

const app = express()
const port = process.env.PORT || 1234
dotenv.config()

const middleware = createMiddleware({
    app,
    options: {
        metricBuckets: {
            httpRequestContentLengthInBytes: [100000, 200000, 500000, 1000000, 1500000, 2000000, 3000000, 5000000, 10000000,],
            httpRequestDurationInSeconds: [0.05, 0.1, 0.3, 0.5, 0.8, 1, 1.5, 2, 3, 10],
        },
        metricPercentiles: {
            httpRequestDurationPerPercentileInSeconds: [0.5, 0.9, 0.95, 0.98, 0.99],
            httpResponseContentLengthInBytes: [100000, 200000, 500000, 1000000, 1500000, 2000000, 3000000, 5000000, 10000000],
        }
    }
})
app.use(middleware)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(
    cors()
)
console.log(`The environment is: ${process.env.NODE_ENV}`)

app.get('/metrics', async (req, res) => {
    req.statusCode = 200
    res.setHeader('Content-Type', getContentType())
    res.end(await getSummary())
})

// Connect to API
app.use('/api', api)
app.get('/health-check', (req, res, next) =>
    res.status(200).send('The server is up and running :)')
)
app.get('*', (req, res) =>
    res.status(404).send('404. This endpoint does not exist:')
)

// Create an HTTP server that will handle WebSocket connections
const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

// Handle WebSocket connections using the imported function
wss.on('connection', (ws: CustomWebSocket, req: Request) => {
    handleWebSocketConnection(ws, req)
})

// Start the combined HTTP and WebSocket server
server.listen(port, () => console.log(`Running on port ${port}`))
