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

// 🔐 SOCKET AUTH MIDDLEWARE (IMPORTANT)
io.use((socket, next) => {
  const { userId, username } = socket.handshake.auth;

  if (!userId || !username) {
    return next(new Error("Unauthorized socket connection"));
  }

  socket.userId = userId;
  socket.username = username;

  next();
});

// When client connects
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id} (${socket.username})`);

  // system join message
  io.emit("receive-message", {
    type: "system",
    message: `${socket.username} joined the chat`,
    username: socket.username,
  });

  socket.on("send-message", (data) => {
    io.emit("receive-message", {
      senderId: socket.id,
      username: socket.username,
      message: data.message,
    });
  });

  socket.on("disconnect", () => {
    io.emit("receive-message", {
      type: "system",
      message: `${socket.username} left the chat`,
    });
  });
});

export { server, io };
