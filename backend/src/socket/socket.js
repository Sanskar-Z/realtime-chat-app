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


    // message to all users that a new user has joined
    io.emit("receive-message", {
    type: "system",
    message: `${username} joined the chat`
  })


    socket.on("send-message", (data) => {
        console.log("Message from client: ", data)

        io.emit("receive-message", {
            senderId: socket.id,
            username: socket.username,
            message: data.message
        })
    })


    socket.on("join-room", (roomName) => {
        socket.join(roomName)
        console.log(`${socket.username} joined room: ${roomName}`)
    })

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id} (${socket.username})`)

        // message to all users that a user has left
        io.emit("receive-message", {
            type: "system",
            message: `${socket.username} left the chat`
        })
    })

})

export { server, io }