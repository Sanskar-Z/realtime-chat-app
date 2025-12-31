import express from 'express';
import cors from 'cors'
import { Server } from 'socket.io'
import { createServer } from 'http'

const app = express()
// const server = createServer(app)

// const io = new Server(server, 
//     cors({
//         origin: process.env.CORS_ORIGIN,
//     credentials: true
//     })
// )

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))


// io.on('connection', (socket) => {
//     console.log("\nUser connected")
//     console.log("user ID: ", socket.id)

// })

app.get('/', (req, res) => {
    res.send("hello")
})

export { app }