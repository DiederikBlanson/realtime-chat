import express from 'express'
// @ts-ignore
import api from './api/routes'
import dotenv from 'dotenv'
import cors from 'cors'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import http from 'http'
import { startWorker } from './worker'
import { ApolloServer } from 'apollo-server-express'
import schema from "./graphql/schema"
import { getSummary, getContentType, createMiddleware } from '@promster/express'
import client from 'prom-client'

const app = express()
const port = process.env.PORT || 5678
dotenv.config()

const graphqlRequestDuration = new client.Histogram({
    name: 'graphql_request_duration_seconds',
    help: 'Duration of GraphQL requests in seconds',
    labelNames: ['operation_name'],
    buckets: [0.01, 0.05, 0.1, 0.2, 0.5, 1, 2, 5]
})

async function startServer() {
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

    const apollo = new ApolloServer({
        schema,
        plugins: [{
            async requestDidStart(requestContext) {
                const end = graphqlRequestDuration.startTimer()
                return {
                    async willSendResponse(ctx) {
                        const opName = ctx.request.operationName || 'Anonymous'
                        end({ operation_name: opName })
                    }
                }
            }
        }]
    })
    await apollo.start()
    apollo.applyMiddleware({ app, path: '/graphql' })

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

    app.get('/metrics', async (req, res) => {
        req.statusCode = 200
        res.setHeader('Content-Type', getContentType())
        const [promsterMetrics, customMetrics] = await Promise.all([
            getSummary(),
            client.register.metrics()
        ])
        res.end(promsterMetrics + '\n' + customMetrics)
    })

    // Connect to API
    app.use('/api', api)
    app.get('/health-check', (req, res, next) =>
        res.status(200).send('The server is up and running :)')
    )
    app.get('*', (req, res) =>
        res.status(404).send('404. This endpoint does not exist:')
    )

    // Start the worker before creating the HTTP server
    startWorker()

    // Create an HTTP server
    const server = http.createServer(app)
    server.listen(port, () => console.log(`Running on port ${port}`))
}

startServer()
