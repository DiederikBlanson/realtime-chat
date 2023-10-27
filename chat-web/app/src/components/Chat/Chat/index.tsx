import React from 'react'
import TextField from '@mui/material/TextField'
import { IconButton } from '@mui/material'
import Box from '@mui/material/Box'
import { ContactStatus } from '@shared/types'
import { Typography, Paper } from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import { Message, User } from '@shared/types'
import MsgStatusIcon from './msgStatusIcon'
import WelcomeScreen from './WelcomeScreen'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import Avatar from '@mui/material/Avatar'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import formatLastSeen from '../../../utils/js/formatLastSeen'

interface ChatProps {
    convId: string
    messages: Message[]
    contactStatus: ContactStatus
    uid: string
    contact: User | null
    message: string
    setMessage: (e: string) => void
    sendMessage: () => void
}

const Component: React.FC<ChatProps> = ({
    convId,
    messages,
    uid,
    message,
    setMessage,
    sendMessage,
    contactStatus,
    contact
}) => {
    if (!convId) return <WelcomeScreen />

    const filteredMessages = messages.filter(
        (m) => m.to === convId || m.from === convId
    )

    return (
        <div id="chat-wrapper">
            <Box
                id="chat-header"
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingTop: 0.4,
                    paddingBottom: 0.3,
                    alignItems: 'center',
                    paddingRight: 3.0
                }}
            >
                <ListItem
                    sx={{
                        '&:hover': {
                            cursor: 'pointer'
                        }
                    }}
                >
                    <ListItemAvatar>
                        <Avatar
                            alt={'test'}
                            src={contact?.image}
                            sx={{ width: 45, height: 45 }}
                        />
                    </ListItemAvatar>
                    <ListItemText
                        sx={{
                            margin: '0px'
                        }}
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
                                        color: 'rgba(255, 255, 255, 1.0'
                                    }}
                                >
                                    {convId}
                                </span>
                            </div>
                        }
                        secondary={
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between'
                                }}
                            >
                                <span
                                    style={{
                                        flex: 9,
                                        color: 'rgba(255, 255, 255, 0.6',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        minHeight: '20px'
                                    }}
                                >
                                    {formatLastSeen(contactStatus)}
                                </span>
                            </div>
                        }
                    />
                </ListItem>
                <IconButton
                    edge="end"
                    aria-label="search"
                    sx={{ color: 'white', opacity: 0.6 }}
                >
                    <MoreVertIcon />
                </IconButton>
            </Box>
            <Box id="chat-messages">
                {filteredMessages.map((m: Message, i: number) => {
                    const timestamp = new Date(m.timestamp)

                    // Lets say user A sends 3 messages after each other, we would like to group
                    // them a bit by having a small distance in between. If user B then sends a message,
                    // we would like to increase the margin with the first group.
                    const prevChanged =
                        i === 0
                            ? false
                            : filteredMessages[i - 1].from !== m.from
                    return (
                        <Box
                            key={i}
                            sx={{
                                display: 'flex',
                                justifyContent:
                                    m.from === uid ? 'flex-end' : 'flex-start',
                                mt: prevChanged ? 2 : 0.3
                            }}
                            className={
                                m.from !== uid ? 'receiving-message' : ''
                            }
                        >
                            <Paper
                                variant="outlined"
                                sx={{
                                    p: 1,
                                    borderRadius: '8px',
                                    color: 'white',
                                    position: 'relative',
                                    paddingRight: '60px',
                                    textAlign: 'left',
                                    maxWidth: '70%',
                                    backgroundColor:
                                        m.from === uid
                                            ? 'rgb(4,92,76)'
                                            : 'rgb(42,57,65)'
                                }}
                            >
                                <Typography
                                    sx={{ fontSize: '14px' }}
                                    variant="body1"
                                >
                                    {m.text}
                                    <span className="timestamp">
                                        {timestamp.getHours() < 10 && '0'}
                                        {timestamp.getHours()}:
                                        {timestamp.getMinutes() < 10 && '0'}
                                        {timestamp.getMinutes()}
                                    </span>
                                    <MsgStatusIcon status={m.status} />
                                </Typography>
                            </Paper>
                        </Box>
                    )
                })}
            </Box>
            <Box
                display="flex"
                className="chat-field"
                alignItems="center"
                bgcolor="rgb(32, 44, 51)"
                style={{
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                    boxSizing: 'border-box'
                }}
                p={1.5}
            >
                <TextField
                    label={message.length > 0 ? '' : 'Typ een bericht'}
                    variant="outlined"
                    fullWidth
                    sx={{
                        border: 'none',
                        '& fieldset': {
                            border: 'none'
                        }
                    }}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    style={{ marginRight: '8px' }}
                    InputProps={{
                        style: {
                            color: 'white',
                            height: '45px',
                            fontSize: '15px',
                            backgroundColor: 'rgba(42,57,65)'
                        }
                    }}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault()
                            sendMessage()
                        }
                    }}
                    InputLabelProps={{
                        shrink: false,
                        style: {
                            color: 'rgba(255, 255, 255, 0.5)',
                            fontSize: '15px',
                            top: '-4px'
                        }
                    }}
                />
                <IconButton
                    disabled={message === ''}
                    onClick={() => sendMessage()}
                    color="primary"
                    style={{
                        color: 'rgba(255, 255, 255, 0.42)'
                    }}
                    aria-label="Send"
                >
                    <SendIcon />
                </IconButton>
            </Box>
        </div>
    )
}

export default Component
