import express from "express";
import { signIn, signOut, signUp } from "../controllers/authController.js";

const router = express.Router();

// Routes cho authentication
router.route("/signup").post(signUp); // POST /auth/signup

router.route("/signin").post(signIn); // POST /auth/signin

router.route("/signout").post(signOut); // POST /auth/signout

export default router;
