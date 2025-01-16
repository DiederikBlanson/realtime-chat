import amqp from 'amqplib'
import DataModel from './model/dataModel'
import { ContactStatus, UserStatus, WSStatusUpdate } from '@shared/types'

const dataModel = new DataModel()
const TIMEOUT_OFFLINE_STATUS = 25000
const offlineStatus: UserStatus = 'OFFLINE'

// On every interval, we check whether users are still online. This is done by
// querying online users, comparing their last_active_at timestamp, and verifying
// whether the time interval is less than TIMEOUT_OFFLINE_STATUS (described in the
// System Design document on page 224).
// TODO: At this point, the current approach may not scale well with an increasing number of users,
// as the loop execution time may grow. Consider refactoring and encapsulating this logic into a class module.

export const statusChecker = async () => {
    // First, we retrieve all the online users from the database.
    const onlineUsers = (await dataModel.getAllOnlineUsers()) as ContactStatus[]

    // Establish a connection to RabbitMQ for messaging.
    const rabbitMQConnection = await amqp.connect(
        process.env.RABBITMQ_URL as string
    )
    const rabbitMQChannel = await rabbitMQConnection.createChannel()

    // We iterate through every online user to determine whether they are still online.
    for (const user of onlineUsers) {
        // To do this, we compare the last_active_at time. If this exceeds the threshold,
        // the user can be considered offline. Otherwise, we proceed to the next user.
        const now = new Date()
        const last_active_at = new Date(user.last_active_at)
        const timeDifferenceInMs = now.getTime() - last_active_at.getTime()
        if (timeDifferenceInMs <= TIMEOUT_OFFLINE_STATUS) continue

        // If the time difference exceeds the offline threshold, mark the user as offline in the database.
        await dataModel.setOffline(user.user)

        // Prepare a fanout message to broadcast the status update to all
        // users interested in this user's activity.
        const fanoutQueue = `${user.user}-activity`
        const msg: WSStatusUpdate = {
            type: 'statusUpdate',
            data: {
                user: user.user,
                status: offlineStatus,
                last_active_at: new Date()
            }
        }

        // Fanout the message to all users subscribed to the fanout queue.
        await rabbitMQChannel.assertExchange(fanoutQueue, 'fanout', {
            durable: false
        })
        await rabbitMQChannel.publish(
            fanoutQueue,
            '',
            Buffer.from(JSON.stringify(msg))
        )
    }
}
