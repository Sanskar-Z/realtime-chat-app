import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getPrivateMessages } from "../controllers/message.controller.js";

const router = Router();

router.get("/private/:userId", verifyJWT, getPrivateMessages);

export default router;