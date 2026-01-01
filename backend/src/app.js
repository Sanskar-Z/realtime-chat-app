import express from 'express';
import cors from 'cors'
import { Server } from 'socket.io'
import { createServer } from 'http'

const app = express()


app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))



export { app }