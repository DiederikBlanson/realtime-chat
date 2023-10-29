import amqp, { ConsumeMessage } from 'amqplib'
import { WSRes, Message } from '@shared/types'
import DataModel from './model/dataModel'

const dataModel = new DataModel()

export const startWorker = async () => {
    const rabbitMQConnection = await amqp.connect('amqp://localhost')
    const rabbitMQChannel = await rabbitMQConnection.createChannel()

    const workerQueue = `messaging-service-worker`
    await rabbitMQChannel.assertQueue(workerQueue, { durable: false })

    rabbitMQChannel.consume(
        workerQueue,
        async (message: ConsumeMessage | null) => {
            if (message === null) return
            const msg = JSON.parse(message.content.toString()) as WSRes
            const parseBuffer = msg.data as Message

            // Depending on the message type, invoke the corresponding handling function.
            switch (msg.type) {
                case 'newMessage':
                    dataModel.insertMessage(parseBuffer)
                    break
                case 'received':
                    dataModel.setReceived(parseBuffer)
                    break
                case 'read':
                    dataModel.setRead(parseBuffer)
                    break
            }
            rabbitMQChannel.ack(message) // Acknowledge the processed message.
        }
    )
}
