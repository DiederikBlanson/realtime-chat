import express from 'express'
import { Request, Response, NextFunction } from 'express'
import { handleHeartbeat, subscribeToOther } from '../../controller'

const router = express.Router()

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
            const result = await subscribeToOther(req.body.uid, req.body.uuid, req.body.user)
            return res.status(200).send(result)
        } catch (e) {
            console.log(e)
        }
    })

module.exports = router
