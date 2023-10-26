import React from 'react'
import { Divider, Badge } from '@mui/material'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import Avatar from '@mui/material/Avatar'
import { Message, User } from '@shared/types'

interface ContactProps {
    contacts: User[]
    messages: Message[]
    convId: string
    setConvFunc: (id: string) => void
}

const Component: React.FC<ContactProps> = ({
    contacts,
    messages,
    convId,
    setConvFunc
}) => {
    return (
        <div id="contacts">
            <List disablePadding>
                {contacts.map((c, i) => {
                    let unreadMessages = 0
                    let latestMessage: Message | undefined

                    messages.forEach((message) => {
                        if (
                            message.from === c.id &&
                            message.status !== 'READ' &&
                            message.from !== convId
                        )
                            unreadMessages++
                        if (message.from === c.id || message.to === c.id)
                            latestMessage = message
                    })

                    const timestamp = latestMessage?.timestamp
                        ? new Date(latestMessage.timestamp)
                        : null
                    const currentChat = c.id === convId

                    return (
                        <div key={i}>
                            <ListItem
                                sx={{
                                    bgcolor: currentChat
                                        ? 'rgb(42, 57, 66)'
                                        : '',
                                    paddingTop: 1.2,
                                    paddingBottom: 1.2,
                                    '&:hover': {
                                        cursor: 'pointer'
                                    }
                                }}
                                onClick={() => setConvFunc(c.id)}
                            >
                                <ListItemAvatar>
                                    <Avatar
                                        alt={c.name}
                                        src={c.image}
                                        sx={{ width: 45, height: 45 }}
                                    />
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between'
                                            }}
                                        >
                                            <span
                                                style={{
                                                    flex: 1,
                                                    color:
                                                        unreadMessages > 0
                                                            ? 'rgba(255, 255, 255, 1.0'
                                                            : 'rgba(255, 255, 255, 0.9'
                                                }}
                                            >
                                                {c.name}
                                            </span>
                                            {latestMessage && (
                                                <span
                                                    style={{
                                                        flex: 1,
                                                        fontSize: '13px',
                                                        color:
                                                            unreadMessages > 0
                                                                ? 'rgba(0, 168, 132)'
                                                                : 'rgba(255, 255, 255, 0.5)',
                                                        textAlign: 'right',
                                                        fontFamily: 'Arial'
                                                    }}
                                                >
                                                    {timestamp
                                                        ? `${timestamp.getHours()}:${timestamp
                                                              .getMinutes()
                                                              .toString()
                                                              .padStart(
                                                                  2,
                                                                  '0'
                                                              )}`
                                                        : ''}
                                                </span>
                                            )}
                                        </div>
                                    }
                                    secondary={
                                        latestMessage &&
                                        'text' in latestMessage && (
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent:
                                                        'space-between'
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        flex: 9,
                                                        color:
                                                            unreadMessages >
                                                                0 ||
                                                            convId === c.id
                                                                ? 'rgba(255, 255, 255, 0.9'
                                                                : 'rgba(255, 255, 255, 0.6',
                                                        overflow: 'hidden',
                                                        textOverflow:
                                                            'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >
                                                    {latestMessage.text}
                                                </span>
                                                <span
                                                    style={{
                                                        flex: 1,
                                                        textAlign: 'right',
                                                        fontFamily: 'Arial'
                                                    }}
                                                >
                                                    {unreadMessages > 0 && (
                                                        <Badge
                                                            badgeContent={
                                                                unreadMessages
                                                            }
                                                            color="primary"
                                                            sx={{
                                                                '& .MuiBadge-badge':
                                                                    {
                                                                        color: 'white',
                                                                        backgroundColor:
                                                                            'rgba(0, 168, 132)',
                                                                        right: '10px'
                                                                    }
                                                            }}
                                                        />
                                                    )}
                                                </span>
                                            </div>
                                        )
                                    }
                                />
                            </ListItem>
                            <Divider
                                sx={{
                                    bgcolor: currentChat
                                        ? ''
                                        : 'rgba(255, 255, 255, 0.1)'
                                }}
                                variant="inset"
                                component="li"
                            />
                        </div>
                    )
                })}
            </List>
        </div>
    )
}

export default Component
