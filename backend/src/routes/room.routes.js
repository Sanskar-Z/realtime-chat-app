import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import {
    createRoom,
    getRooms,
    joinRoom,
    getRoomMessages
} from "../controllers/room.controller.js"

const router = Router()

router.use(verifyJWT) // all room routes require auth

router.post("/create", createRoom)
router.get("/", getRooms)
router.post("/:roomId/join", joinRoom)
router.get("/:roomId/messages", getRoomMessages)

export default router