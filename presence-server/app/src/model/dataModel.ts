import cassandra from 'cassandra-driver'
import { UserStatus } from '@shared/types'

const client = new cassandra.Client({
    contactPoints: ['127.0.0.1'],
    localDataCenter: 'datacenter1',
    keyspace: 'presence'
})
const onlineStatus: UserStatus = 'ONLINE'
const offlineStatus: UserStatus = 'OFFLINE'

export default class Model {
    setOffline = async (uid: string) => {
        await client.execute(
            'INSERT INTO presence.status (user, status) VALUES (?, ?)',
            [uid, offlineStatus]
        )
    }

    setOnline = async (uid: string) => {
        await client.execute(
            'INSERT INTO presence.status (user, status, last_active_at) VALUES (?, ?, toTimestamp(now()))',
            [uid, onlineStatus]
        )
    }

    getStatus = async (uid: string) => {
        return (
            await client.execute(
                'SELECT * FROM presence.status WHERE user = ?',
                [uid]
            )
        ).rows[0]
    }

    getAllOnlineUsers = async () => {
        const result: any = (
            await client.execute('SELECT * FROM presence.status')
        ).rows.filter((u) => u.status === onlineStatus)
        return result
    }
}
