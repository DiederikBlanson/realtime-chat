import express from 'express'
import { Request, Response, NextFunction } from 'express'
import DataModel from '../../model/dataModel'
const dataModel = new DataModel()
const router = express.Router()

router
    .route('/messages')
    .post(async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { name } = req.body
            const messages = await dataModel.getInitialMessages(name)

            return res.status(200).send({
                messages
            })
        } catch (e) {
            console.log(e)
        }
    })

module.exports = router
