import express from 'express'
import { Request, Response, NextFunction } from 'express'
import Gossip from '../../gossip'
const router = express.Router()

// Start Gossip module
const gossip = new Gossip()
gossip.start()

router
    .route('/heartbeat')
    .post(async (req: Request, res: Response, next: NextFunction) => {
        await gossip.heartbeatReceive(req.body.node)
        return res.status(200).send()
    })

router
    .route('/ask-offline')
    .post(async (req: Request, res: Response, next: NextFunction) => {
        return res.status(200).json({
            offline: await gossip.candidateOffline(req.body.node)
        })
    })

module.exports = router
