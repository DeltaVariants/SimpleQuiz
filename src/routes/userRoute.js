import express from "express";
import { authMe, getAllUsers } from "../controllers/userController.js";
import { verifyAdmin, protectedRoute } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/me").get(protectedRoute, authMe); // GET /users/me - user hiện tại
router.route("/").get(protectedRoute, verifyAdmin, getAllUsers); // GET /users - chỉ Admin

export default router;
