import express from 'express';
import cors from 'cors'
import cookieParser from 'cookie-parser'


const app = express()


app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
}));

app.options("*", cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"))
app.use(cookieParser())



import userRouter from './routes/user.routes.js';

app.use("/api/v1/users", userRouter)


import messageRouter from "./routes/message.route.js"

app.use("/api/v1/messages", messageRouter);

// Global error handler (always last)
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    errors: err.errors || []
  });
});

export { app }