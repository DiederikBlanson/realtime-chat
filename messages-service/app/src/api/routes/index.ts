import express from 'express'
import { Request, Response, NextFunction } from 'express'
import cassandra from 'cassandra-driver'
import { Message } from '@shared/types'
const router = express.Router()

const client = new cassandra.Client({
    contactPoints: ['127.0.0.1'],
    localDataCenter: 'datacenter1',
    keyspace: 'chat'
})

router
    .route('/messages')
    .post(async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { name } = req.body
            const send_messages = (
                await client.execute(
                    `SELECT * FROM chat.messages WHERE from_user = ?`,
                    [name]
                )
            ).rows
            const received_messages = (
                await client.execute(
                    `SELECT * FROM chat.messages WHERE to_user = ?`,
                    [name]
                )
            ).rows

            const all_messages: Message[] = [
                ...send_messages,
                ...received_messages
            ]
                .map((s) => ({
                    id: parseFloat(s.id),
                    from: s.from_user,
                    to: s.to_user,
                    text: s.message,
                    status: s.status,
                    timestamp: s.created_at
                }))
                .sort((a, b) => a.id - b.id)

            return res.status(200).send({
                messages: all_messages
            })
        } catch (e) {
            console.log(e)
        }
    })

module.exports = router
