// src/services/questionService.js
import Question from "../models/Question.js";
import Quiz from "../models/Quiz.js";

// Lấy tất cả Questions
export async function getAllQuestions() {
  return await Question.find().select("-__v");
}

// Tạo mới Question
export async function createQuestion(questionData) {
  const newQuestion = new Question(questionData);
  return await newQuestion.save();
}

// Lấy 1 Question
export async function getQuestionById(questionId) {
  return await Question.findById(questionId).select("-__v");
}

// Cập nhật 1 Question
export async function updateQuestion(questionId, updateData) {
  // Lấy question hiện tại để validate correctAnswerIndex
  const currentQuestion = await Question.findById(questionId);
  if (!currentQuestion) return null;

  // Nếu có update correctAnswerIndex, check với options
  const optionsLength =
    updateData.options?.length || currentQuestion.options.length;
  if (updateData.correctAnswerIndex !== undefined) {
    if (
      updateData.correctAnswerIndex < 0 ||
      updateData.correctAnswerIndex >= optionsLength
    ) {
      throw new Error(
        "correctAnswerIndex must be a valid index of options array"
      );
    }
  }

  // Cập nhật trực tiếp trên instance (tránh query thêm lần nữa)
  Object.assign(currentQuestion, updateData);
  return await currentQuestion.save();
}

// Xóa 1 Question và loại bỏ tham chiếu khỏi tất cả Quiz
export async function deleteQuestion(questionId) {
  const deletedQuestion = await Question.findByIdAndDelete(questionId);

  if (deletedQuestion) {
    // Loại bỏ tham chiếu ID này khỏi mảng 'questions' của tất cả Quiz
    await Quiz.updateMany(
      { questions: questionId },
      { $pull: { questions: questionId } }
    );
  }
  return deletedQuestion;
}
