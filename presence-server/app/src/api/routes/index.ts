import express from 'express'
import { Request, Response, NextFunction } from 'express'
import cassandra from 'cassandra-driver'
import amqp from 'amqplib'
import { ContactStatus, UserStatus, WSStatusUpdate } from '@shared/types'

const client = new cassandra.Client({
    contactPoints: ['127.0.0.1'],
    localDataCenter: 'datacenter1',
    keyspace: 'presence'
})
const router = express.Router()
const STATUS_CHECK_INTERVAL = 4000
const TIMEOUT_OFFLINE_STATUS = 25000
const offlineStatus: UserStatus = 'OFFLINE'
const onlineStatus: UserStatus = 'ONLINE'
const EXPIRATION_QUEUE_TIMEOUT = 30000

// On every interval, we check whether users are still online. This is done by
// querying online users, comparing their last_active_at timestamp, and verifying
// whether the time interval is less than TIMEOUT_OFFLINE_STATUS (described in the
// System Design document on page 224).
// TODO: At this point, the current approach may not scale well with an increasing number of users,
// as the loop execution time may grow. Consider refactoring and encapsulating this logic into a class module.
const checkStatusUsers = async () => {
    // First, we retrieve all the online users from the database.
    const cassandraOnlineUsers: unknown = (
        await client.execute('SELECT * FROM presence.status')
    ).rows.filter((u) => u.status === onlineStatus)
    const onlineUsers = cassandraOnlineUsers as ContactStatus[]

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
        await client.execute(
            'INSERT INTO presence.status (user, status) VALUES (?, ?)',
            [user.user, offlineStatus]
        )

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
setInterval(checkStatusUsers, STATUS_CHECK_INTERVAL)

// This route handles a POST request to '/heartbeat' to monitor user activity and online status. When a user's client
// sends a heartbeat, it updates their online status and last active timestamp in the database, indicating they are 'ONLINE'.
router
    .route('/heartbeat')
    .post(async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Update the user's 'ONLINE' status and last active timestamp in the database using a Cassandra query.
            await client.execute(
                'INSERT INTO presence.status (user, status, last_active_at) VALUES (?, ?, toTimestamp(now()))',
                [req.body.uid, onlineStatus]
            )

            // TODO: only if the user was previously OFFLINE, we would need to send an update. Otherwise it
            // might be a waste of resources.

            // Establish a connection to RabbitMQ for messaging.
            const rabbitMQConnection = await amqp.connect(
                process.env.RABBITMQ_URL as string
            )
            const rabbitMQChannel = await rabbitMQConnection.createChannel()

            // Define the fanout exchange for this user's activity updates.
            const fanoutQueue = `${req.body.uid}-activity`
            await rabbitMQChannel.assertExchange(fanoutQueue, 'fanout', {
                durable: false
            })

            // Prepare a status update message with the user's new 'ONLINE' status and current timestamp.
            // Publish the status update to the fanout exchange, ensuring it reaches all interested parties.
            const msg: WSStatusUpdate = {
                type: 'statusUpdate',
                data: {
                    user: req.body.uid,
                    status: onlineStatus,
                    last_active_at: new Date()
                }
            }
            await rabbitMQChannel.publish(
                fanoutQueue,
                '',
                Buffer.from(JSON.stringify(msg))
            )
            return res.status(200).send()
        } catch (e) {
            console.log(e)
        }
    })

// This route handles a POST request to '/subscribe-to-other' to set up and manage the user's
// subscription to another user's status.
router
    .route('/subscribe-to-other')
    .post(async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Retrieve the status information for the target user from the Cassandra database.
            const user = (
                await client.execute(
                    'SELECT * FROM presence.status WHERE user = ?',
                    [req.body.user]
                )
            ).rows[0]

            // Establish a connection to RabbitMQ for messaging.
            const rabbitMQConnection = await amqp.connect(
                process.env.RABBITMQ_URL as string
            )
            const rabbitMQChannel = await rabbitMQConnection.createChannel()

            // Define the fanout exchange for the target user's activity updates.
            // In case the target user is ONLINE, this fanout queue is already defined.
            const fanoutQueue = `${req.body.user}-activity`
            await rabbitMQChannel.assertExchange(fanoutQueue, 'fanout', {
                durable: false
            })

            // Set up a unique queue for the user's subscription, which is a combination of 'uid' and 'uuid'.
            // For example: 'rafa-7667df67sf67df0-messages'.
            const uniqueQueue = `${req.body.uid}-${req.body.uuid}-messages`
            await rabbitMQChannel.assertQueue(uniqueQueue, {
                durable: false,
                expires: EXPIRATION_QUEUE_TIMEOUT // Optional: Set an expiration time for the unique queue.
            })
            await rabbitMQChannel.bindQueue(uniqueQueue, fanoutQueue, '')

            // TODO: If the user was previously connected to another user's status, unbind from that connection (not implemented here).

            // Return a successful response to the client with the status and last active timestamp of the target user.
            const msg: ContactStatus = {
                user: req.body.user,
                status: user.status,
                last_active_at: user.last_active_at
            }
            return res.status(200).send(msg)
        } catch (e) {
            console.log(e)
        }
    })

module.exports = router
