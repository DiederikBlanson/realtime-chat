import express from 'express'
import { Request, Response, NextFunction } from 'express'
import amqp from 'amqplib'
import DataModel from '../../model/dataModel'
import { ContactStatus, UserStatus, WSStatusUpdate } from '@shared/types'

const dataModel = new DataModel()
const router = express.Router()
const onlineStatus: UserStatus = 'ONLINE'
const EXPIRATION_QUEUE_TIMEOUT = 30000

// This route handles a POST request to '/heartbeat' to monitor user activity and online status. When a user's client
// sends a heartbeat, it updates their online status and last active timestamp in the database, indicating they are 'ONLINE'.
router
    .route('/heartbeat')
    .post(async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Update the user's 'ONLINE' status and last active timestamp in the database
            await dataModel.setOnline(req.body.uid)

            // TODO: only if the user was previously OFFLINE, we would need to send an update.
            // Otherwise it might be a waste of resources.

            // Establish a connection to RabbitMQ for messaging.
            const rabbitMQConnection = await amqp.connect(
                "amqp://rabbitmq" // CTODO: create env variable
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
            // Retrieve the status information for the target user
            const user = await dataModel.getStatus(req.body.user)

            // Establish a connection to RabbitMQ for messaging.
            const rabbitMQConnection = await amqp.connect(
                "amqp://rabbitmq" // CTODO: create env variable
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
