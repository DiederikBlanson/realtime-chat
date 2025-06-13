// @ts-ignore
import { ContactStatus } from '@shared/types'

export default function formatLastSeen(contactStatus: ContactStatus) {
    var result = ''
    switch (contactStatus?.status) {
        case 'ONLINE':
            result = 'online'
            break
        case 'OFFLINE':
            result = formatOffline(contactStatus.last_active_at)
            break
        default:
            break
    }
    return result
}

function formatOffline(timestamp: Date) {
    const now = new Date()
    const lastSeen = new Date(timestamp)
    const oneDay: number = 24 * 60 * 60 * 1000

    // Case 1: If the user was online today
    if (now.toDateString() === lastSeen.toDateString()) {
        const hour = lastSeen.getHours().toString().padStart(2, '0')
        const minute = lastSeen.getMinutes().toString().padStart(2, '0')
        return `laatst gezien vandaag om ${hour}:${minute}`
    }

    // Case 2: If the user was online yesterday
    const yesterday = new Date(now.getTime() - oneDay)
    if (lastSeen.toDateString() === yesterday.toDateString()) {
        const hour = lastSeen.getHours().toString().padStart(2, '0')
        const minute = lastSeen.getMinutes().toString().padStart(2, '0')
        return `laatst gezien gisteren om ${hour}:${minute}`
    }

    // Case 3: If the user was online within the last 7 days
    if (now.getTime() - lastSeen.getTime() <= 7 * oneDay) {
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        const day = daysOfWeek[lastSeen.getDay()]
        const hour = lastSeen.getHours().toString().padStart(2, '0')
        const minute = lastSeen.getMinutes().toString().padStart(2, '0')
        return `laats gezien op ${day} om ${hour}:${minute}`
    }

    // Case 4: If the user was online more than a week ago
    const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec'
    ]
    const month = months[lastSeen.getMonth()]
    const dayMonth = lastSeen.getDate()
    return `laatst gezien op ${month} ${dayMonth}`
}
