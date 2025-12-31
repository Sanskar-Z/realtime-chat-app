import dotenv from 'dotenv'
dotenv.config({path: './.env'})

import { app } from "./app.js"
import { server } from './socket/socket.js'

const port = process.env.PORT

server.listen(port, () => {
    console.log(`Server is running at port: ${port}`)
})