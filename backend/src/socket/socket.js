import cors from 'cors'
import { app } from '../app.js'
import { Server } from 'socket.io'
import { createServer } from 'http'


const server = createServer(app)

const io = new Server(server, 
    cors({
        origin: process.env.CORS_ORIGIN,
    credentials: true
    })
)

io.on('connection', (socket) => {
    console.log("\nUser connected")
    console.log("user ID: ", socket.id)

})

export { server, io }