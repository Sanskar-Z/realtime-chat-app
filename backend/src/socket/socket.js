import { app } from '../app.js'
import { Server } from 'socket.io'
import { createServer } from 'http'
import { Message } from '../models/message.model.js'

const server = createServer(app)

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
})

// userId -> { socketId, username }
const onlineUsers = new Map()

// SOCKET AUTH MIDDLEWARE
io.use((socket, next) => {
  const { userId, username } = socket.handshake.auth
  if (!userId || !username) {
    return next(new Error("Unauthorized socket connection"))
  }

  onlineUsers.set(userId, { socketId: socket.id, username })
  socket.userId = userId
  socket.username = username

  next()
})

// When client connects
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id} (${socket.username})`)

  // system join message
  io.emit("receive-message", {
    type: "system",
    message: `${socket.username} joined the chat`,
  })

  // send online users list
  io.emit(
    "online-users",
    Array.from(onlineUsers.entries()).map(([userId, data]) => ({
      userId,
      username: data.username
    }))
  )

  socket.on("get-online-users", () => {
    socket.emit(
      "online-users",
      Array.from(onlineUsers.entries()).map(([userId, data]) => ({
        userId,
        username: data.username
      }))
    )
  })

  socket.on("private-message", async ({ toUserId, message }) => {
    try {
      const user = onlineUsers.get(toUserId)
      if (!user) return

      const savedMessage = await Message.create({
        sender: socket.userId,
        receiver: toUserId,
        message,
      })

      const msgPayload = {
        _id: savedMessage._id,
        senderId: savedMessage.sender,
        receiverId: toUserId,
        message: savedMessage.message,
        createdAt: savedMessage.createdAt,
      }

      io.to(user.socketId).emit("private-message", msgPayload)
      socket.emit("message-sent", msgPayload)
    } catch (err) {
      console.error("Private message error:", err)
    }
  })

  socket.on("disconnect", () => {
    onlineUsers.delete(socket.userId)

    io.emit(
      "online-users",
      Array.from(onlineUsers.entries()).map(([userId, data]) => ({
        userId,
        username: data.username
      }))
    )

    io.emit("receive-message", {
      type: "system",
      message: `${socket.username} left the chat`,
    })
  })
})

export { server, io }
