import express from "express";
import attemptController from "../controllers/attemptController.js";
import {
  protectedRoute,
  validateObjectId,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

// Get all attempts for current user
router.get("/me", protectedRoute, attemptController.getMyAttempts);

// Get specific attempt by ID
router.get(
  "/:attemptId",
  validateObjectId("attemptId"),
  protectedRoute,
  attemptController.getAttemptById
);

export default router;
