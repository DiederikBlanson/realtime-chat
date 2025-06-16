import winston from 'winston'
import net from 'net'
import { Writable } from 'stream'

const logstashHost = process.env.LOGSTASH_HOST || "0.0.0.0"
const logstashPort = Number(process.env.LOGSTASH_PORT) || 5044

const socket = net.createConnection(logstashPort, logstashHost)
const logstashStream = new Writable({
    write(chunk, encoding, callback) {
        socket.write(chunk.toString() + '\n')
        callback()
    }
})

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.Stream({ stream: logstashStream }),
        new winston.transports.Console()
    ]
})

socket.on('connect', () => {
    console.log('✅ Connected to Logstash')
})

export default logger