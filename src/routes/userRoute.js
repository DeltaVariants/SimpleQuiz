import express from "express";
import { authMe, getAllUsers } from "../controllers/userController.js";
import { verifyAdmin, protectedRoute } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Routes cho user
router.route("/").get(verifyAdmin, getAllUsers); // GET /users - chỉ Admin
router.route("/me").get(protectedRoute, authMe); // GET /users/me - user hiện tại

export default router;
