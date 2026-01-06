import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

// public routes
router.route("/register").post(registerUser)
router.route("/login").post(loginUser)

// secured routes
router.route("/me").get(verifyJWT, (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user
  })
})


router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)




export default router

