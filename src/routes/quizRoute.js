import express from "express";
import * as quizController from "../controllers/quizController.js";
import {
  verifyAdmin,
  protectedRoute,
  validateObjectId,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

// Routes gốc: /quizzes
router
  .route("/")
  .get(quizController.getAllQuizzes) // GET /quizzes - tất cả user
  .post(protectedRoute, verifyAdmin, quizController.createQuiz); // POST /quizzes - chỉ Admin

// Routes theo ID: /quizzes/:quizId
router
  .route("/:quizId")
  .get(validateObjectId("quizId"), quizController.getQuizById) // GET /quizzes/:quizId - tất cả user
  .put(
    validateObjectId("quizId"),
    protectedRoute,
    verifyAdmin,
    quizController.updateQuiz
  ) // PUT /quizzes/:quizId - chỉ Admin
  .delete(
    validateObjectId("quizId"),
    protectedRoute,
    verifyAdmin,
    quizController.deleteQuiz
  ); // DELETE /quizzes/:quizId - chỉ Admin

// Routes đặc biệt để lọc questions: /quizzes/:quizId/populate
router
  .route("/:quizId/populate")
  .get(validateObjectId("quizId"), quizController.getPopulatedQuizByKeyword); // GET /quizzes/:quizId/populate

// Routes để thêm 1 question: /quizzes/:quizId/question
router
  .route("/:quizId/question")
  .post(
    validateObjectId("quizId"),
    protectedRoute,
    verifyAdmin,
    quizController.createQuestionInQuiz
  ); // POST /quizzes/:quizId/question - chỉ Admin

// Routes để thêm nhiều questions: /quizzes/:quizId/questions
router
  .route("/:quizId/questions")
  .post(
    validateObjectId("quizId"),
    protectedRoute,
    verifyAdmin,
    quizController.createManyQuestionsInQuiz
  ); // POST /quizzes/:quizId/questions - chỉ Admin

export default router;
