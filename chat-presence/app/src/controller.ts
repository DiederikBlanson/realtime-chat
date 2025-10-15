import amqp from 'amqplib'
import DataModel from './model/dataModel'
import { UserStatus, WSStatusUpdate } from '@shared/types'

const dataModel = new DataModel()
const onlineStatus: UserStatus = 'ONLINE'

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