import amqp, { Connection } from 'amqplib'
import dotenv from 'dotenv'

dotenv.config()

let connection: Connection | null = null

export const connectRabbitMQ = async () => {
    if (!connection) {
        connection = await amqp.connect(process.env.RABBITMQ_URL as string)
    }
    return { connection }
}

export const getRabbitConnection = () => {
    if (!connection) throw new Error('RabbitMQ channel not initialized')
    return connection
}
