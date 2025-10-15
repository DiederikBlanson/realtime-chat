import express from 'express'
import { Request, Response, NextFunction } from 'express'
import amqp from 'amqplib'
import DataModel from '../../model/dataModel'
import { ContactStatus } from '@shared/types'
import { handleHeartbeat} from '../../controller'

const dataModel = new DataModel()
const router = express.Router()
const EXPIRATION_QUEUE_TIMEOUT = 30000

// This route handles a POST request to '/heartbeat' to monitor user activity and online status. When a user's client
// sends a heartbeat, it updates their online status and last active timestamp in the database, indicating they are 'ONLINE'.
router
    .route('/heartbeat')
    .post(async (req: Request, res: Response, next: NextFunction) => {
        try {
            await handleHeartbeat(req.body.uid as string)
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
