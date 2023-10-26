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

const app = express()
const port = process.env.PORT || 1234
dotenv.config()
console.log(`The environment is: ${process.env.NODE_ENV}`)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(
    cors(/*{
    origin: "http://localhost:3000",
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}*/)
)

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
