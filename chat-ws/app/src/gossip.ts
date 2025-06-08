import axios from 'axios'
import Redis from 'ioredis'
import dotenv from 'dotenv'

dotenv.config()

interface Membership {
    lastIncreased: Date | undefined
    attempts_offline: number
}

type MembershipList = {
    [id: string]: Membership
}

export default class Gossip {
    members: MembershipList = {}
    HEARTBEAT_TARGET_NODE_COUNT: number = 3
    HEARTBEAT_INTERVAL_MS: number = 1000
    MAXIMUM_ATTEMPTS_NODE_OFFLINE: number = 15
    CONSIDERED_OFFLINE_MS: number = 3000
    CLEANUP_MEMBERLIST_MS: number = 10000
    CHECK_NODES_TIMEOUT_MS: number = 4000
    SERVER_HOST: string = ''
    redis: Redis

    constructor() {
        this.SERVER_HOST = `localhost:${process.env.PORT}`
        this.redis = new Redis({
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT)
        })
        this.initializeWS()
    }

    // Add Websocket node to the ServiceDiscovery key-value store 'Redis'
    initializeWS = async () => {
        await this.redis.set(this.SERVER_HOST, 'ACTIVE')

        // Get the list of WebSocket nodes and initialize member data. If the
        // status is not deleted, add it to the memberslist
        const keys = (await this.redis.keys('localhost:*')).filter(
            (c) => c !== this.SERVER_HOST
        )
        for (let server of keys) {
            const status = await this.redis.get(server)
            if (status !== 'DELETED' && !this.members[server]) {
                this.members[server] = {
                    lastIncreased: undefined,
                    attempts_offline: 0
                }
            }
        }
    }

    getMembers = () => this.members

    // Start the Gossip service with periodic tasks
    start = () => {
        setInterval(this.heartbeatSend, this.HEARTBEAT_INTERVAL_MS) // Send heartbeats every HEARTBEAT_INTERVAL_MS milliseconds
        setInterval(this.checkStatusNodes, this.CHECK_NODES_TIMEOUT_MS) // Check the status of other nodes every 4 seconds
        setInterval(this.cleanup, this.CLEANUP_MEMBERLIST_MS) // Cleanup the member list every CLEANUP_MEMBERLIST_MS milliseconds
    }

    // 1. Send and receive heartbeats to/from random nodes
    heartbeatSend = async () => {
        const randomNodes = (arr: string[], maxCount: number) => {
            const shuffled = arr.slice().sort(() => 0.5 - Math.random())
            const selected = shuffled.slice(0, Math.min(maxCount, arr.length))
            return selected
        }

        const targetNodes = randomNodes(
            Object.keys(this.getMembers()),
            this.HEARTBEAT_TARGET_NODE_COUNT
        )
        for (let member of targetNodes) {
            try {
                await axios.post(`http://${member}/api/heartbeat`, {
                    node: this.SERVER_HOST
                })
            } catch (e) {}
        }
    }

    heartbeatReceive = async (node: string) => {
        this.members[node] = {
            attempts_offline: 0,
            lastIncreased: new Date()
        }
    }

    // 2. Check the status of other nodes and take action if needed
    checkStatusNodes = async () => {
        for (let member of Object.keys(this.getMembers())) {
            if (await this.candidateOffline(member)) {
                await this.considerOffline(member)
            }
        }
    }

    candidateOffline = async (node: string) => {
        const member = this.getMembers()[node]
        if (!member) return false

        const dt = new Date().getTime()
        const lastIncreased = member.lastIncreased?.getTime()
        return !lastIncreased || dt - lastIncreased > this.CONSIDERED_OFFLINE_MS
    }

    considerOffline = async (node: string) => {
        const checkingNodes = Object.entries(this.getMembers()).filter(
            (m) => m[0] !== node
        )
        if (checkingNodes.length === 0) {
            await this.setNodeOffline(node)
        } else {
            await this.resultCheckingNodes(node, checkingNodes)
        }
    }

    resultCheckingNodes = async (node: string, checkingNodes: any[]) => {
        // If one of the nodes says that the node is not offline, we should
        // not consider it offline anymore.
        for (let [member, _] of checkingNodes) {
            try {
                const result = await axios.post(
                    `http://${member}/api/ask-offline`,
                    {
                        node
                    }
                )
                if (!result.data.offline) return
            } catch {}
        }

        // All checked nodes either agreed that the node was down,
        // or did not store this information. Therefore, we can set it
        // offline.
        await this.setNodeOffline(node)
    }

    setNodeOffline = async (node: string) => {
        this.members[node].attempts_offline += 1
        if (
            this.members[node].attempts_offline >=
            this.MAXIMUM_ATTEMPTS_NODE_OFFLINE
        ) {
            await this.redis.set(node, 'DELETED')
        } else {
            await this.redis.set(node, 'OFFLINE')
        }
    }

    // 3. Cleanup the member list by removing nodes marked as "DELETED" in Redis
    cleanup = async () => {
        for (let member of Object.keys(this.getMembers())) {
            const status = await this.redis.get(member)
            if (status === 'DELETED') {
                delete this.members[member]
            }
        }
    }
}
