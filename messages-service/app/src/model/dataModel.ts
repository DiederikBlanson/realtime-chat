import cassandra from 'cassandra-driver'
import { Message } from '@shared/types'
const client = new cassandra.Client({
    contactPoints: ['127.0.0.1'],
    localDataCenter: 'datacenter1',
    keyspace: 'chat'
})

export default class Model {
    insertMessage = async (parseBuffer: any) => {
        await client.execute(
            "INSERT INTO chat.messages (from_user, to_user, message, id, status, created_at) VALUES (?, ?, ?, ?, 'SEND', ?)",
            [
                parseBuffer.from.toString(),
                parseBuffer.to.toString(),
                parseBuffer.text.toString(),
                parseBuffer.id.toString(),
                new Date(parseBuffer.timestamp)
            ]
        )
    }

    setReceived = async (parseBuffer: any) => {
        await client.execute(
            `UPDATE chat.messages SET status = 'RECEIVED' WHERE from_user = ? AND to_user = ? AND id = ?`,
            [
                parseBuffer.from.toString(),
                parseBuffer.to.toString(),
                parseBuffer.id.toString()
            ]
        )
    }

    setRead = async (parseBuffer: any) => {
        await client.execute(
            `UPDATE chat.messages SET status = 'READ' WHERE from_user = ? AND to_user = ? AND id = ?`,
            [
                parseBuffer.from.toString(),
                parseBuffer.to.toString(),
                parseBuffer.id.toString()
            ]
        )
    }

    getInitialMessages = async (name: string) => {
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

        const result: Message[] = [...send_messages, ...received_messages]
            .map((s) => ({
                id: parseFloat(s.id),
                from: s.from_user,
                to: s.to_user,
                text: s.message,
                status: s.status,
                timestamp: s.created_at
            }))
            .sort((a, b) => a.id - b.id)

        return result
    }
}
