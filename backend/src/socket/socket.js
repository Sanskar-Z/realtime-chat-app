import { app } from '../app.js'
import { Server } from 'socket.io'
import { createServer } from 'http'
import { log } from 'console'

const server = createServer(app)

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
})

const onlineUsers = new Map();  //  UserId -> socketId

// 🔐 SOCKET AUTH MIDDLEWARE (IMPORTANT)
io.use((socket, next) => {
  const { userId, username } = socket.handshake.auth;
  
  if (!userId || !username) {
    return next(new Error("Unauthorized socket connection"));
  }

  onlineUsers.set(userId, socket.id);

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
  });

  socket.on("send-message", (data) => {
    io.emit("receive-message", {
      senderId: socket.id,
      username: socket.username,
      message: data.message,
    });
  });


  console.log(onlineUsers);
  io.emit("online-users", Array.from(onlineUsers.keys()));
  
  socket.on("private-message", ({ toUserId, message }) => {
    const receivedSockedId = onlineUsers.get(toUserId);

    if(!receivedSockedId) return;

    const msgPayload = {
      senderId: socket.userId,
      senderName: socket.username,
      message,
    };

    io.to(receivedSockedId).emit("private-message", msgPayload)

    socket.emit("private-message", msgPayload)
  })

  socket.on("disconnect", () => {
    onlineUsers.delete(socket.userId);
    io.emit("online-users", Array.from(onlineUsers.keys()));
    
    io.emit("receive-message", {
      type: "system",
      message: `${socket.username} left the chat`,
    });
  });
});

export { server, io };
