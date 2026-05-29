import { app } from '../app.js'
import { Server } from 'socket.io'
import { createServer } from 'http'
import { Message } from '../models/message.model.js'
import { User } from '../models/user.model.js'

const server = createServer(app)

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
})

// userId => { socketId, username }
const onlineUsers = new Map()

const getOnlineUsersList = () =>
  Array.from(onlineUsers.entries()).map(([userId, data]) => ({
    userId,
    username: data.username
  }))

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

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id} (${socket.username})`)

  // Notify everyone someone joined
  io.emit("receive-message", {
    type: "system",
    message: `${socket.username} joined the chat`,
  })

  // Broadcast updated online users list to everyone
  io.emit("online-users", getOnlineUsersList())

  // Let a single client request the list on demand
  socket.on("get-online-users", () => {
    socket.emit("online-users", getOnlineUsersList())
  })

  socket.on("private-message", async ({ toUserId, message }) => {
    if (!message?.trim()) return

    try {
      const savedMessage = await Message.create({
        sender: socket.userId,
        receiver: toUserId,
        message,
      })

      const msgPayload = {
        _id: savedMessage._id,
        senderId: String(savedMessage.sender),
        receiverId: toUserId,
        message: savedMessage.message,
        createdAt: savedMessage.createdAt,
      }

      // Deliver to receiver if they are online
      const receiver = onlineUsers.get(toUserId)
      if (receiver) {
        io.to(receiver.socketId).emit("private-message", msgPayload)
      }

      // FIX: was "private-sent" — must match what Chat.jsx listens for
      socket.emit("message-sent", msgPayload)

    } catch (err) {
      console.error("Private message error:", err)
    }
  })

  socket.on("disconnect", async () => {
    onlineUsers.delete(socket.userId)

    // Save lastSeen timestamp so ConversationList can show "5 min ago"
    try {
      await User.findByIdAndUpdate(socket.userId, { lastSeen: new Date() })
    } catch (err) {
      console.error("Failed to update lastSeen:", err)
    }

    io.emit("online-users", getOnlineUsersList())
    io.emit("receive-message", {
      type: "system",
      message: `${socket.username} left the chat`,
    })
  })
})

export { server, io }