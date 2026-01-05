import express from 'express';
import cors from 'cors'
import { Server } from 'socket.io'
import { createServer } from 'http'
import cookieParser from 'cookie-parser'
import { errorHandler } from "./middlewares/error.middleware.js"


const app = express()


app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true, limit: "16kb"}));
app.use(express.static("public"))
app.use(cookieParser())



import userRouter from './routes/user.routes.js';

app.use("/api/v1/users", userRouter)

app.use(errorHandler)


export { app }