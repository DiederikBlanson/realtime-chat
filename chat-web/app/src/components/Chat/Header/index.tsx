import React, { useState } from 'react'
import { IconButton } from '@mui/material'
import Box from '@mui/material/Box'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import Avatar from '@mui/material/Avatar'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import GroupsIcon from '@mui/icons-material/Groups'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'

interface HeaderProps {
    name: string
    chatServer: string
}

const Component: React.FC<HeaderProps> = ({ name, chatServer }) => {
    const [open, setOpen] = useState(false)

    const handleClickOpen = () => setOpen(true)
    const handleClose = () => setOpen(false)

    return (
        <>
            <Box
                id="header"
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingTop: 0.4,
                    gap: '15px',
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
                            alt={name}
                            src={'sd'}
                            sx={{ width: 37, height: 37 }}
                        />
                    </ListItemAvatar>
                </ListItem>
                <IconButton
                    edge="end"
                    aria-label="search"
                    sx={{ color: 'white', opacity: 0.6 }}
                >
                    <GroupsIcon />
                </IconButton>
                <IconButton
                    onClick={handleClickOpen}
                    edge="end"
                    aria-label="search"
                    sx={{ color: 'white', opacity: 0.6 }}
                >
                    <MoreVertIcon />
                </IconButton>
            </Box>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle> Information </DialogTitle>
                <DialogContent>
                    <p> WebSocket: {chatServer || 'Not Connected'} </p>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default Component
