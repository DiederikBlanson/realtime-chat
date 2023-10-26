export type MessageStatus = 'QUEUE' | 'AWAITING' | 'SEND' | 'RECEIVED' | 'READ'

export type Message = {
    id: number
    text: string
    from: string
    to: string
    status: MessageStatus
    timestamp: Date
}

export type User = {
    id: string
    name: string
    image: string
}

export type UserStatus = 'ONLINE' | 'OFFLINE'

export type ContactStatus = {
    user: string
    status: 'ONLINE' | 'OFFLINE'
    last_active_at: Date
}

export type WSMessage = {
    type: 'newMessage'
    data: Message
}

export type WSSend = {
    type: 'send'
    data: Message
}

export type WSReceived = {
    type: 'received'
    data: Message
}

export type WSRead = {
    type: 'read'
    data: Message
}

export type WSStatusUpdate = {
    type: 'statusUpdate'
    data: ContactStatus
}

export type WSRes = WSMessage | WSSend | WSReceived | WSRead | WSStatusUpdate
