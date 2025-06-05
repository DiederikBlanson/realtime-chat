import express from 'express'
// @ts-ignore
import api from './api/routes'
// import { statusLogger } from './statusLogger'
import dotenv from 'dotenv'
import cors from 'cors'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import http from 'http'

const app = express()
const port = process.env.PORT || 8888
dotenv.config()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(
    cors({
        origin: process.env.FRONTEND_URL,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    })
)
console.log(`The environment is: ${process.env.NODE_ENV}`)

// Connect to API
app.use('/api', api)
app.get('/health-check', (req, res, next) =>
    res.status(200).send('The server is up and running :)')
)
app.get('*', (req, res) =>
    res.status(404).send('404. This endpoint does not exist:')
)

// setInterval(statusLogger, 1000)

// Create an HTTP server
const server = http.createServer(app)
server.listen(port, () => console.log(`Running on port ${port}`))
