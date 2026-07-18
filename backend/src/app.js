import dotenv from 'dotenv'
dotenv.config()

import express from 'express';
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

const app = express()

// -- Security Headers
app.use(helmet({
  crossOriginEmbedderPolicy: { policy: "cross-origin" }  // allow images/assets cross-origin
}))


// -- CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));


// -- Rate Limiters
// Auth routes - strict limit to prevent brute force attacks
// 10 requests per 15 minutes per IP on login / register
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 10,
  message: {
    success: false,
    message: "Too many attempts. Please try again in 15 minutes."
  },
  standardHeaders: true,     // sends RateLimit-* headers so client knows the limit
  legacyHeaders: false
})


// General API — generous limit to prevent abuse without affecting normal use
// 100 requests per minute per IP
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 100,
  message: {
    success: false,
    message: "Too many requests. Please slow down."
  },
  standardHeaders: true,
  legacyHeaders: false
})

// -- Body parsers
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"))
app.use(cookieParser())

// -- Routes

import userRouter from './routes/user.routes.js';

// Apply auth rate limiter only to login and register -  not to all user routes
app.use("/api/v1/users/login", authLimiter)
app.use("/api/v1/users/register", authLimiter)
app.use("/api/v1/users", userRouter)

import messageRouter from "./routes/message.route.js"
app.use("/api/v1/messages", apiLimiter, messageRouter);

import roomRouter from "./routes/room.routes.js"
app.use("/api/v1/rooms", apiLimiter, roomRouter)

// -- Error handler --
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    errors: err.errors || []
  });
});

export { app }