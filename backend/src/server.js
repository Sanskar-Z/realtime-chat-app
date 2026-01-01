import dotenv from 'dotenv'
dotenv.config({path: './.env'})

import { app } from "./app.js"
import { server } from './socket/socket.js'
import connectDB from './db/connectDB.js'

const port = process.env.PORT


connectDB()
.then((result) => {
    server.listen(port, () => {
        console.log(`Server is running at port: ${port}`)
    })
}).catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
});
