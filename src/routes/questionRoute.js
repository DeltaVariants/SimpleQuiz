import express from "express";
import * as questionController from "../controllers/questionController.js";
import {
  verifyAuthor,
  protectedRoute,
  validateObjectId,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

// Endpoints gốc: /questions
router.route("/").get(questionController.getAllQuestions); // GET /questions
// POST đã bị loại bỏ - chỉ tạo question qua quiz: POST /quizzes/:quizId/question

// Endpoints độc lập cho Question: /questions/:questionId
router
  .route("/:questionId")
  .get(validateObjectId("questionId"), questionController.getQuestionById) // GET /questions/:questionId
  .put(
    validateObjectId("questionId"),
    protectedRoute,
    verifyAuthor,
    questionController.updateQuestion
  ) // PUT /questions/:questionId - chỉ tác giả mới sửa
  .delete(
    validateObjectId("questionId"),
    protectedRoute,
    verifyAuthor,
    questionController.deleteQuestion
  ); // DELETE /questions/:questionId - chỉ tác giả mới xóa

export default router;
