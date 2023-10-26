import amqp, { ConsumeMessage } from 'amqplib'
import { Request } from 'express'
import {
    WSMessage,
    Message,
    WSRes,
    WSSend,
    WSReceived,
    WSRead
} from '@shared/types'
import { CustomWebSocket } from './types'
import cassandra from 'cassandra-driver'

const client = new cassandra.Client({
    contactPoints: ['127.0.0.1'],
    localDataCenter: 'datacenter1',
    keyspace: 'chat'
})
const EXPIRATION_QUEUE_TIMEOUT = 30000

export const handleWebSocketConnection = async (
    ws: CustomWebSocket,
    req: Request
) => {
    // Configure the WebSocket with custom data
    const urlParams = new URLSearchParams(req.url.split('?')[1])
    const name = urlParams.get('name') as string
    const uuid = urlParams.get('uuid') as string
    const id = name
    ws.id = id
    ws.username = name

    // Establishing a connection to RabbitMQ and setting up communication channels.
    const rabbitMQConnection = await amqp.connect(
        process.env.RABBITMQ_URL as string
    )
    const rabbitMQChannel = await rabbitMQConnection.createChannel()

    /*----------------------------------------------------
        Defining Queues and Exchanges for User Messaging
    -----------------------------------------------------*/

    // 1. User Queue:
    //    - All new messages from other users are sent to this queue.
    //    - Each user has a unique queue named after their 'id' to receive messages.
    const userQueue = `${id}-messages`
    await rabbitMQChannel.assertQueue(userQueue, { durable: false })

    // 2. Fanout Exchange:
    //    - To broadcast messages to all devices of a user, we create a fanout exchange.
    //    - Fanout queues distribute messages to all bound queues, ensuring broad delivery.
    const fanoutQueue = userQueue
    await rabbitMQChannel.assertExchange(fanoutQueue, 'fanout', {
        durable: false
    })

    // 3. Unique User Queue:
    //    - Each user's unique queue is defined as a combination of 'id' and 'uuid'.
    //    - 'uuid' is generated for each user connection.
    //    - Messages from the fanout exchange are bound to these unique queues for individual delivery.
    const uniqueQueue = `${id}-${uuid}-messages`
    await rabbitMQChannel.assertQueue(uniqueQueue, {
        durable: false,
        expires: EXPIRATION_QUEUE_TIMEOUT // Optional: Set an expiration time for the unique queue.
    })
    await rabbitMQChannel.bindQueue(uniqueQueue, fanoutQueue, '')

    // Consumer Functions

    // 1. User Queue Consumer:
    //    - Listens to messages in the user queue.
    //    - If there are N devices for a user, N consumers will try to pull from the queue.
    //    - When a message is received, it is published to the fanout exchange for broadcast.
    rabbitMQChannel.consume(
        userQueue,
        async (message: ConsumeMessage | null) => {
            if (message === null) return // Skip if there's no message.
            await rabbitMQChannel.publish(
                fanoutQueue,
                '',
                Buffer.from(message.content.toString())
            )
            rabbitMQChannel.ack(message) // Acknowledge the processed message.
        }
    )

    // 2. Unique Queue Consumer:
    //    - Listens to the unique user queue for messages specific to a user's connection.
    //    - When a message is received, it is sent to the frontend via WebSocket (ws.send).
    rabbitMQChannel.consume(uniqueQueue, (message: ConsumeMessage | null) => {
        if (message === null) return // Skip if there's no message.
        ws.send(message.content.toString())
        rabbitMQChannel.ack(message) // Acknowledge the processed message.
    })

    /*----------------------------------------------------
       WebSocket Message Handling and Message Processing
    -----------------------------------------------------*/

    // WebSocket message handler function.
    const handleMessage = async (message: Buffer) => {
        // Parse the WebSocket message as a WSRes object.
        const buffer = JSON.parse(message.toString('utf8')) as WSRes
        const parseBuffer = buffer.data as Message

        // Depending on the message type, invoke the corresponding handling function.
        switch (buffer.type) {
            case 'newMessage':
                handleNewMessage(parseBuffer)
                break
            case 'received':
                handleReceived(parseBuffer)
                break
            case 'read':
                handleRead(parseBuffer)
                break
        }
    }

    // Set up a WebSocket event listener to handle incoming messages.
    ws.on('message', handleMessage)

    // New Message Handling:
    // - Acknowledge the sent message receipt to the sender via RabbitMQ.
    // - Add the message to the queue of the receiver.
    // - Store the message in the database.
    const handleNewMessage = async (parseBuffer: Message) => {
        const msg_sender: WSSend = {
            type: 'send',
            data: parseBuffer
        }
        // Send the acknowledgment message to the sender's message queue.
        await rabbitMQChannel.sendToQueue(
            `${msg_sender.data.from}-messages`,
            Buffer.from(JSON.stringify(msg_sender))
        )

        // Send the new message to the recipient.
        const msg_receiver: WSMessage = {
            type: 'newMessage',
            data: parseBuffer
        }
        await rabbitMQChannel.sendToQueue(
            `${msg_receiver.data.to}-messages`,
            Buffer.from(JSON.stringify(msg_receiver))
        )

        // Store the message in the database.
        await client.execute(
            "INSERT INTO chat.messages (from_user, to_user, message, id, status, created_at) VALUES (?, ?, ?, ?, 'SEND', ?)",
            [
                parseBuffer.from.toString(),
                parseBuffer.to.toString(),
                parseBuffer.text.toString(),
                parseBuffer.id.toString(),
                new Date(parseBuffer.timestamp)
            ]
        )
    }

    // Received Message Handling:
    // - Notify the sender that the message has been received.
    // - Update the message status in the database to 'RECEIVED'.
    const handleReceived = async (parseBuffer: Message) => {
        const msg: WSReceived = {
            type: 'received',
            data: parseBuffer
        }
        // Send the receipt acknowledgment to the sender's message queue.
        await rabbitMQChannel.sendToQueue(
            `${msg.data.from}-messages`,
            Buffer.from(JSON.stringify(msg))
        )

        // Update the message status in the database to 'RECEIVED'.
        await client.execute(
            `UPDATE chat.messages SET status = 'RECEIVED' WHERE from_user = ? AND to_user = ? AND id = ?`,
            [
                parseBuffer.from.toString(),
                parseBuffer.to.toString(),
                parseBuffer.id.toString()
            ]
        )
    }

    // Read Message Handling:
    // - Notify both sender and receiver that the message has been read.
    // - Update the message status in the database to 'READ'.
    const handleRead = async (parseBuffer: Message) => {
        const msg: WSRead = {
            type: 'read',
            data: parseBuffer
        }

        // Send the read acknowledgment to both sender's and receiver's message queues.
        await rabbitMQChannel.sendToQueue(
            `${msg.data.to}-messages`,
            Buffer.from(JSON.stringify(msg))
        )

        // Update the message status in the database to 'READ'.
        await rabbitMQChannel.sendToQueue(
            `${msg.data.from}-messages`,
            Buffer.from(JSON.stringify(msg))
        )
        await client.execute(
            `UPDATE chat.messages SET status = 'READ' WHERE from_user = ? AND to_user = ? AND id = ?`,
            [
                parseBuffer.from.toString(),
                parseBuffer.to.toString(),
                parseBuffer.id.toString()
            ]
        )
    }

    // On close of the WebSocket connection, close the RabbitMQ channel. TODO: make a KV store with online of offline, set it here offline. Might be useful for knowing whether to send a push notification
    ws.on('close', () => rabbitMQChannel.close())
}
