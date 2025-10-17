import amqp from 'amqplib'
import DataModel from './model/dataModel'
import { UserStatus, WSStatusUpdate } from '@shared/types'
import { Contact } from './generated/graphql'

const dataModel = new DataModel()
const onlineStatus: UserStatus = 'ONLINE'
const EXPIRATION_QUEUE_TIMEOUT = 30000

export async function handleHeartbeat(uid: string): Promise<void> {
    try {
        // Update the user's 'ONLINE' status and last active timestamp in the database
        await dataModel.setOnline(uid)

        // TODO: only if the user was previously OFFLINE, we would need to send an update.
        // Otherwise it might be a waste of resources.

        // Establish a connection to RabbitMQ for messaging.
        const rabbitMQConnection = await amqp.connect(
            process.env.RABBITMQ_URL as string
        )
        const rabbitMQChannel = await rabbitMQConnection.createChannel()

        // Define the fanout exchange for this user's activity updates.
        const fanoutQueue = `${uid}-activity`
        await rabbitMQChannel.assertExchange(fanoutQueue, 'fanout', {
            durable: false
        })

        // Prepare a status update message with the user's new 'ONLINE' status and current timestamp.
        // Publish the status update to the fanout exchange, ensuring it reaches all interested parties.
        const msg: WSStatusUpdate = {
            type: 'statusUpdate',
            data: {
                user: uid,
                status: onlineStatus,
                last_active_at: new Date()
            }
        }
        await rabbitMQChannel.publish(
            fanoutQueue,
            '',
            Buffer.from(JSON.stringify(msg))
        )
    } catch (e) {
        console.log(e)
    }
}

export async function subscribeToOther(user: string, uuid: string, to: string): Promise<Contact | null> {
    try {
        // Retrieve the status information for the target user
        const subscribingUser = await dataModel.getStatus(to)

        // Establish a connection to RabbitMQ for messaging.
        const rabbitMQConnection = await amqp.connect(
            process.env.RABBITMQ_URL as string
        )
        const rabbitMQChannel = await rabbitMQConnection.createChannel()

        // Define the fanout exchange for the target user's activity updates.
        // In case the target user is ONLINE, this fanout queue is already defined.
        const fanoutQueue = `${to}-activity`
        await rabbitMQChannel.assertExchange(fanoutQueue, 'fanout', {
            durable: false
        })

        // Set up a unique queue for the user's subscription, which is a combination of 'uid' and 'uuid'.
        // For example: 'rafa-7667df67sf67df0-messages'.
        const uniqueQueue = `${user}-${uuid}-messages`
        await rabbitMQChannel.assertQueue(uniqueQueue, {
            durable: false,
            expires: EXPIRATION_QUEUE_TIMEOUT // Optional: Set an expiration time for the unique queue.
        })
        await rabbitMQChannel.bindQueue(uniqueQueue, fanoutQueue, '')

        // TODO: If the user was previously connected to another user's status, unbind from that connection (not implemented here).

        // Return a successful response to the client with the status and last active timestamp of the target user.
        const msg: Contact = {
            user: to,
            status: subscribingUser.status,
            last_active_at: subscribingUser.last_active_at
        }
        return msg
    } catch (e) {
        console.log(e)
        return null
    }
}