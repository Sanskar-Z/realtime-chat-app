import { app } from '../app.js'
import { Server } from 'socket.io'
import { createServer } from 'http'
import { Message } from '../models/message.model.js'
import { User } from '../models/user.model.js'
import { RoomMessage } from '../models/roomMessage.model.js'

const server = createServer(app)

const MAX_MESSAGE_LENGTH = 500

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
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

  // Typing indicators
  socket.on("typing-start", ({ toUserId }) => {
    const receiver = onlineUsers.get(toUserId);
    if (receiver) {
      io.to(receiver.socketId).emit("typing-start", {
        fromUserId: socket.userId,
      })
    }
  })

  socket.on("typing-stop", ({ toUserId }) => {
    const receiver = onlineUsers.get(toUserId);
    if (receiver) {
      io.to(receiver.socketId).emit("typing-stop", {
        fromUserId: socket.userId,
      })
    }
  })

  socket.on("message-read", async ({ fromUserId }) => {
    try {
      // Mark all messages from fromUserId to this user as read
      await Message.updateMany(
        { sender: fromUserId, receiver: socket.userId, read: false },
        { $set: { read: true } }
      )

      // Notify the original sender their messages were read
      const sender = onlineUsers.get(fromUserId)
      if (sender) {
        io.to(sender.socketId).emit("messages-read", { byUserId: socket.userId })
      }
    } catch (err) {
      console.error("message-read error:", err)
    }
  })

  socket.on("private-message", async ({ toUserId, message }) => {
    if (!message?.trim()) return
    if (message.length > MAX_MESSAGE_LENGTH) return // reject oversized messages

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
        read: false,
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


  // Group room ───────────────────────────────────────────────────────

  // User joins a room
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
  })

  // leave a socket.io room - called when user closes a room
  socket.on("leave-room", (roomId) => {
    socket.leave(roomId)
  })

  // send a message to a room

  socket.on("room-message", async ({ roomId, message }) => {
    if (!message?.trim()) return
    if (message.length > MAX_MESSAGE_LENGTH) return // reject oversized messages

    try {
      const savedMessage = await RoomMessage.create({
        room: roomId,
        sender: socket.userId,
        message: message.trim()
      })

      const msgPayload = {
        _id: savedMessage._id,
        roomId,
        senderId: String(socket.userId),
        senderName: socket.username,
        message: savedMessage.message,
        createdAt: savedMessage.createdAt
      }

      // Broadcast to everyone in the room
      io.to(roomId).emit("room-message", msgPayload)

    } catch (err) {
      console.log("Room message error:", err)
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