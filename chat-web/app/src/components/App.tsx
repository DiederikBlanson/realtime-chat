import React, { useState } from 'react'
import Login from './Login'
import { Message } from '@shared/types'
import Chat from './Chat'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'

const Component: React.FC = () => {
    const [isLogged, setLogged] = useState(false) // TODO: we can merge most data objects and put it in one state. and only keep the islogged/isloading separate
    const [name, setName] = useState<string>('')
    const [uuid, setUUID] = useState<string>('')
    const [messages, setMessages] = useState<Message[]>([])

    const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        const name = data.get('username') as string

        // request initial data
        const f = await axios.post(
            `${import.meta.env.VITE_APP_MESSAGING_SERVICE_URL}/api/messages`,
            {
                name
            }
        )
        const { messages } = f.data
        setName(data.get('username') as string)
        setUUID(uuidv4())
        setLogged(true)
        setMessages(messages)
    }

    if (isLogged)
        return <Chat name={name} retrievedMessages={messages} uuid={uuid} />

    return <Login login={(e) => handleLogin(e)} />
}

export default Component
