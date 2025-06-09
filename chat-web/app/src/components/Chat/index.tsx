import React from 'react'
import { useEffect, useState, useRef } from 'react'
import {
    Message,
    User,
    WSMessage,
    WSRes,
    MessageStatus,
    WSStatusUpdate,
    ContactStatus,
    WSRead,
    WSSend,
    WSReceived
} from '@shared/types'
import Header from './Header'
import Contacts from './Contacts'
import Chat from './Chat'
import axios from 'axios'

const fetchedUsers = [
    {
        // TODO: do this in the backend and retrieve initial sorting!
        id: 'rafa',
        name: 'rafa',
        image: 'https://upload.wikimedia.org/wikipedia/commons/8/85/Rafael_Nadal_10%2C_Aegon_Championships%2C_London%2C_UK_-_Diliff.jpg'
    },
    {
        id: 'roger',
        name: 'roger',
        image: 'https://hips.hearstapps.com/hmg-prod/images/gettyimages-1322028686.jpg'
    },
    {
        id: 'novak',
        name: 'novak',
        image: 'https://www.si.com/.image/ar_1:1%2Cc_fill%2Ccs_srgb%2Cfl_progressive%2Cq_auto:good%2Cw_1200/MjAwNzExMTMyNTgxNzMzNzYy/novak-djokovic-2.jpg'
    },
    {
        id: 'carlos',
        name: 'carlos',
        image: 'https://static.toiimg.com/thumb/msid-99025404,width-1280,height-720,resizemode-4/99025404.jpg'
    },
    {
        id: 'andy',
        name: 'andy',
        image: 'https://img.olympics.com/images/image/private/t_1-1_300/f_auto/primary/x4dwqfx5lne6cg78jkw3'
    }
]

type ChatProps = {
    name: string
    retrievedMessages: Message[]
    uuid: string
}

const App: React.FC<ChatProps> = ({ name, retrievedMessages, uuid }) => {
    const filteredFetchedUsers = fetchedUsers.filter((u) => u.name !== name)
    const uid = name
    const [messages, setMessages] = useState<Message[]>(retrievedMessages)
    const [contacts, setContacts] = useState<User[]>(filteredFetchedUsers)
    const [message, setMessage] = useState<string>('')
    const [ws, setWs] = useState<WebSocket | null>(null)
    const initialConnectRef = useRef(true)
    const [statuses, setStatuses] = useState<{ [key: string]: ContactStatus }>(
        {}
    )
    const [convId, setConvId] = useState<string>('')
    const convIdRef = useRef<string>()
    const [chatServer, setChatServer] = useState<string>('')
    const wsRef = useRef<WebSocket | null>(null)
    const messagesRef = useRef<Message[]>(retrievedMessages)

    useEffect(() => {
        wsRef.current = ws
    }, [ws])

    // As soon as you login, you should mark all the messages
    // with status "SEND" mark as "RECEIVED".
    useEffect(() => {
        const markAsReceived = async () => {
            const read = messages.filter(
                (m) => m.to === name && m.status === 'SEND'
            )
            if (read.length === 0) return

            for (let message of read) {
                await new Promise((resolve) =>
                    setTimeout(resolve, READ_DELAY_INTERVAL)
                )
                wsRef.current?.send(
                    JSON.stringify({
                        type: 'received',
                        data: message
                    })
                )
            }

            setMessages((prevMessages) =>
                prevMessages.map((m) => {
                    if (m.to !== name || m.status !== 'SEND') return m
                    m.status = 'RECEIVED'
                    return m
                })
            )
        }

        markAsReceived()
    }, [])

    // As soon as you select an user, all the messages that you did not read
    // will be marked as read. For now, we send them in increments of
    // 300ms as we do not want to overload the user with messages. If we do not
    // wait 300ms (or similar), many state updates wont be performed on the other user side, resulting
    // in them not seeing that you have read the messages. This needs to be optimized
    const READ_DELAY_INTERVAL = 100
    useEffect(() => {
        convIdRef.current = convId
        if (convId === '') return

        const markAsRead = async () => {
            const unread = messages.filter(
                (m) => m.from === convId && m.status !== 'READ'
            )
            if (unread.length === 0) return

            for (let message of unread) {
                await new Promise((resolve) =>
                    setTimeout(resolve, READ_DELAY_INTERVAL)
                )
                wsRef.current?.send(
                    JSON.stringify({
                        type: 'read',
                        data: message
                    })
                )
            }

            setMessages((prevMessages) =>
                prevMessages.map((m) => {
                    if (m.from !== convId || m.status === 'READ') return m
                    m.status = 'READ'
                    return m
                })
            )
        }

        markAsRead()
    }, [convId, messages])

    // On the sidebar left we maintain a list of all the contacts that we
    // have a conversation with. As soon as the messages state gets updated,  we
    // check the latest message. By doing so, we will put this contact on top
    // of the contact list.
    useEffect(() => {
        messagesRef.current = messages
        const lastMessage = messages[messages.length - 1]
        if (!lastMessage) return

        const user =
            lastMessage.from === uid ? lastMessage.to : lastMessage.from
        setContacts((prevContacts) =>
            prevContacts
                .filter((c) => c.id === user)
                .concat(prevContacts.filter((c) => c.id !== user))
        )
    }, [messages])

    // Users communicate through WebSockets. First, we will retrieve a WebSocket server
    // from the Service Discovery, which maintains a list of valid WebSocket endpoints.
    // As such, we can connect to the websocket. When the connection is interrupted, we
    // try retrieving a new WebSocket server in intervals of 1000ms.
    // For testing purposes, a feature flag is created to disable the call to the
    // Service Discovery, and instead obtain the Websocket from an environment variable.

    const getSocket = async () => {
        if (import.meta.env.VITE_APP_DISABLE_CHAT_SD == "true"){
            return import.meta.env.VITE_APP_WS_URL
        }

        const sd = await fetch(
            `${import.meta.env.VITE_APP_SERVICE_DISCOVERY_URL}/api/ws-server`
        )
        const { ws: wsServer } = await sd.json()
        return wsServer
    }

    const connectWebSocket = async () => {
        const wsServer = await getSocket()
        const newWs = new WebSocket(
            `ws://${wsServer}?name=${name}&initialConnect=${initialConnectRef.current}&uuid=${uuid}`
        )

        newWs.onopen = () => {
            initialConnectRef.current = false
            wsRef.current = newWs
            sendQueuedMessages()
            setWs(newWs)
            setChatServer(wsServer)
        }

        newWs.onclose = () => {
            setChatServer('')
            setTimeout(connectWebSocket, 1000)
        }

        newWs.onmessage = handleWebSocketMessage
    }

    useEffect(() => {
        // Whenever we change the conversation, we want to start listening to status
        // updates from the new user. This allows us to efficiently monitor the status
        // of one user at a time, similar to WhatsApp's approach.

        // Define an asynchronous function to fetch status updates for the selected user.
        const update = async () => {
            const d = await axios.post(
                `${
                    import.meta.env.VITE_APP_PRESENCE_URL
                }/api/subscribe-to-other`,
                {
                    uid,
                    uuid,
                    user: convId
                }
            )
            const { data } = d
            setStatuses((prev) => ({
                ...prev,
                [convId]: data
            }))
        }
        if (convId) update()
    }, [convId])

    useEffect(() => {
        connectWebSocket()
        return () => {
            if (ws) ws.close()
        }
    }, [])

    // We will only send a heartbeat when the user is connected to
    // a WebSocket, which will be done in interval HEARTBEAT_INTERVAL (ms)
    useEffect(() => {
        const HEARTBEAT_INTERVAL = 5000
        const heartbeat = setInterval(async () => {
            if (!(wsRef.current && wsRef.current.readyState === WebSocket.OPEN))
                return

            await axios.post(
                `${import.meta.env.VITE_APP_PRESENCE_URL}/api/heartbeat`,
                {
                    uid
                }
            )
        }, HEARTBEAT_INTERVAL)

        return () => clearTimeout(heartbeat)
    }, [])

    // In case an user is not connected to a WebSocket and still tries to send messages,
    // those messages will be marked as QUEUED (shown with a clock icon in the message status).
    // As soon as we reconnect to a WebSocket, we will try to send the new messages to the
    // recipients. One catch is that we do not want (currently) to send all the messages at once
    // as this causes some rendering issues.
    // There are several solutions, like Batch Sending, but for now we work with Timeouts.
    // First, we wait 3000ms before sending such that the WebSocket connection is properly set.
    // Next, we send messages in intervals of 300ms.
    const QUEUE_DELAY_INITIAL = 3000
    const QUEUE_DELAY_INTERVAL = 300
    const sendQueuedMessages = async () => {
        const queued = messagesRef.current.filter((m) => m.status === 'QUEUE')
        if (queued.length === 0) return
        await new Promise((resolve) => setTimeout(resolve, QUEUE_DELAY_INITIAL))

        for (let message of queued) {
            await new Promise((resolve) =>
                setTimeout(resolve, QUEUE_DELAY_INTERVAL)
            )
            wsRef.current?.send(
                JSON.stringify({
                    type: 'newMessage',
                    data: message
                } as WSMessage)
            )
        }
    }

    // The WebSocket continuously listens to new events. There are several types of
    // events that the user can handle, which are described below.
    const handleWebSocketMessage = async (event: MessageEvent) => {
        try {
            const data: WSRes = JSON.parse(event.data)
            switch (data.type) {
                case 'newMessage':
                    handleNewMessage(data as WSMessage)
                    break
                case 'send':
                    handleStatusUpdate(data, 'SEND')
                    break
                case 'received':
                    handleStatusUpdate(data, 'RECEIVED')
                    break
                case 'read':
                    handleStatusUpdate(data, 'READ')
                    break
                case 'statusUpdate':
                    handleStatus(data)
                    break
                default:
                    throw new Error(
                        'The type of message is not detected: ',
                        data
                    )
            }
        } catch (error) {
            console.error('Error parsing WebSocket message:', error)
        }
    }

    const handleStatus = (msg: WSStatusUpdate) => {
        setStatuses((prev) => ({
            ...prev,
            [msg.data.user]: msg.data
        }))
    }

    // As soon as we retrieve a new message from an user, we will notify them that
    // we have received their message. Here, we will show the sender a received icon.
    // In case we already have messages, we have to check whether we havent received
    // this message before. Such scenario is possible:
    //			- User A sends to User B (who is offline)
    //			- User B goes online and retrieves all messages from the DB
    //			- As User A consumes its queue, the message is still there and send to user A
    //			- User A will see the message twice (undesirable)
    // In case there are now messages yet, or the new message exceeds curr_max_message_id, we
    // will add the message to the state.
    const handleNewMessage = (msg: WSMessage) => {
        const { data } = msg
        wsRef.current?.send(
            JSON.stringify({
                type: 'received',
                data
            })
        )

        // Find the last message's id if messages exist. Page 220 (System Design): we have change this to a local id of the specific 1-to-1 chat
        const curr_max_message_id =
            messages.length > 0 ? messages[messages.length - 1].id : -1

        if (data.id <= curr_max_message_id) {
            setMessages((prevMessages) =>
                prevMessages.map((m) => {
                    if (m.id !== data.id) return m
                    m.status = 'RECEIVED'
                    return m
                })
            )
        } else {
            setMessages((prevMessages) => [
                ...prevMessages,
                {
                    id: data.id,
                    text: data.text,
                    from: data.from,
                    status: 'RECEIVED',
                    to: uid,
                    timestamp: data.timestamp
                }
            ])
        }
    }

    // In many cases, the updates from the WebSocket are simple, meaning that we only
    // need to update the status of a message. This includes "SEND", "RECEIVED" and "READ"
    // updates. Therefore, we can adjust the messages object.
    const handleStatusUpdate = (
        msg: WSRead | WSSend | WSReceived,
        status: MessageStatus
    ) => {
        const { data } = msg
        let messageFound = false

        const updatedMessages = messagesRef.current.map((m) => {
            if (m.id === data.id) {
                m.status = status
                messageFound = true
            }
            return m
        })

        // If the message is not found, append it to the list
        if (!messageFound) updatedMessages.push({ ...data, status })
        setMessages(updatedMessages)
    }

    // A message cannot be empty so that is the first check.
    // Then, we will look whether there is a WebSocket connection.
    // In case there is, we will add the message to the messages array, with status
    // "AWAITING".
    // In case there is no WS connection, we will also add it to the list,
    // only with the status "QEUUE".
    // Finally, the message is send to the WS if there is a connection.
    const sendMessage = async () => {
        if (message === '') return

        const msgObject: Message = {
            id: new Date().getTime(),
            from: uid,
            text: message,
            status:
                ws && ws.readyState === WebSocket.OPEN ? 'AWAITING' : 'QUEUE',
            to: convId,
            timestamp: new Date()
        }
        setMessages((prevMessages) => [...prevMessages, msgObject])
        setMessage('')

        wsRef.current?.send(
            JSON.stringify({
                type: 'newMessage',
                data: msgObject
            })
        )
    }

    return (
        <div id="main">
            <Header name={name} chatServer={chatServer} />
            <Contacts
                contacts={contacts}
                messages={messages}
                convId={convId}
                setConvFunc={(e) => setConvId(e)}
            />
            <Chat
                convId={convId}
                messages={messages}
                uid={uid}
                contact={
                    convId
                        ? (contacts.find((c) => c.id === convId) as User | null)
                        : null
                }
                contactStatus={statuses[convId]}
                message={message}
                setMessage={(e) => setMessage(e)}
                sendMessage={sendMessage}
            />
        </div>
    )
}

export default App
