import React, { useState } from 'react'
import Login from './Login'
// @ts-ignore
import { Message } from '@shared/types'
import Chat from './Chat'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import {client} from "../graphql/connect"
import { MessagesDocument } from '../graphql/generated/graphql'
import getConfig from '../utils/js/getConfig'

const useGraph = getConfig("VITE_APP_ENABLE_GRAPH") == "true"

const getMessages = async (name: string) => {
    if (useGraph){
        const q = await client.query({
            query: MessagesDocument,
            variables: {
                name: name,
            }
        })

        // Read-only so copy the response. Source: https://github.com/apollographql/apollo-client/issues/3255
        return JSON.parse(JSON.stringify(q.data.messages))
    } else {
        const f = await axios.post(
            `${getConfig("VITE_APP_MESSAGING_SERVICE_URL")}/api/messages`, {
                name
            }
        )

        return f.data.messages
    }
}

const Component: React.FC = () => {
    const [isLogged, setLogged] = useState(false) // TODO: we can merge most data objects and put it in one state. and only keep the islogged/isloading separate
    const [name, setName] = useState<string>('')
    const [uuid, setUUID] = useState<string>('')
    const [messages, setMessages] = useState<Message[]>([])

    const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        const name = data.get('username') as string

        const messages = await getMessages(name)

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
