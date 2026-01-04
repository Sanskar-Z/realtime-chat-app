import cors from 'cors'
import { app } from '../app.js'
import { Server } from 'socket.io'
import { createServer } from 'http'


const server = createServer(app)

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    }
})

// When client connects
io.on('connection', (socket) => {
    const username = socket.handshake.auth.username

    socket.username = username || "Anonymous"


    console.log(`\nUser connected: ${socket.id} (${socket.username})`)

    socket.on("send-message", (data) => {
        console.log("Message from client: ", data)

        io.emit("receive-message", {
            senderId: socket.id,
            username: socket.username,
            message: data.message
        })
    })

})

export { server, io }