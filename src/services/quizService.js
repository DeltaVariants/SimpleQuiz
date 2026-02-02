// src/services/quizService.js
import Quiz from "../models/Quiz.js";
import Question from "../models/Question.js";

// GET /quizzes
export async function getAllQuizzes() {
  // Sử dụng populate để hiển thị chi tiết questions
  return await Quiz.find({}).populate("questions");
}

// POST /quizzes
export async function createQuiz(quizData) {
  const newQuiz = new Quiz(quizData);
  return await newQuiz.save();
}

// GET /quizzes/:quizId
export async function getQuizById(quizId) {
  return await Quiz.findById(quizId).populate("questions");
}

// PUT /quizzes/:quizId
export async function updateQuiz(quizId, updateData) {
  return await Quiz.findByIdAndUpdate(quizId, updateData, {
    new: true,
    runValidators: true,
  });
}

// DELETE /quizzes/:quizId (Xóa Quiz và Questions liên quan)
export async function deleteQuizAndQuestions(quizId) {
  const quiz = await Quiz.findById(quizId);

  if (!quiz) return null;

  // 1. Xóa tất cả questions thuộc về quiz này
  await Question.deleteMany({ _id: { $in: quiz.questions } });

  // 2. Xóa quiz (dùng instance method để tránh query thêm lần nữa)
  await quiz.deleteOne();
  return quiz;
}

// POST /quizzes/:quizId/question (Thêm 1 câu hỏi)
export async function addQuestionToQuiz(quizId, questionData) {
  const quiz = await Quiz.findById(quizId);
  if (!quiz) return null;

  // Set quizId cho question
  questionData.quizId = quizId;
  const newQuestion = new Question(questionData);
  const savedQuestion = await newQuestion.save();

  // Thêm ID câu hỏi vào mảng questions của Quiz
  quiz.questions.push(savedQuestion._id);
  await quiz.save();

  return savedQuestion;
}

// POST /quizzes/:quizId/questions (Thêm nhiều câu hỏi)
export async function addManyQuestionsToQuiz(quizId, questionsData) {
  const quiz = await Quiz.findById(quizId);
  if (!quiz) return null;

  if (!Array.isArray(questionsData) || questionsData.length === 0) {
    throw new Error("Request body must be an array of questions.");
  }

  // 1. Set quizId cho tất cả questions
  const questionDataWithQuizId = questionsData.map((q) => ({
    ...q,
    quizId: quizId,
  }));

  // 2. Chèn nhiều câu hỏi
  const savedQuestions = await Question.insertMany(questionDataWithQuizId);

  // 3. Lấy IDs và thêm vào Quiz
  const newQuestionIds = savedQuestions.map((q) => q._id);
  quiz.questions.push(...newQuestionIds);
  await quiz.save();

  return savedQuestions.length;
}

// GET /quizzes/:quizId/populate (Lọc theo keyword "capital")
export async function filterQuestionsByKeyword(quizId, keyword) {
  const quiz = await Quiz.findById(quizId);
  if (!quiz) return null;

  // Tìm questions dựa trên ID trong quiz và lọc theo keyword
  const questions = await Question.find({
    _id: { $in: quiz.questions },
    keywords: { $in: [keyword.toLowerCase()] }, // Lọc không phân biệt chữ hoa/thường
  });

  // Trả về Quiz với mảng questions đã lọc
  return {
    ...quiz.toObject(),
    questions: questions,
  };
}

// GET /quizzes/:quizId/take - Get quiz for taking (without correctAnswerIndex)
export async function getQuizForTaking(quizId) {
  const quiz = await Quiz.findById(quizId).populate("questions");

  if (!quiz) return null;

  // Remove correctAnswerIndex from questions for security
  const sanitizedQuestions = quiz.questions.map((q) => ({
    _id: q._id,
    text: q.text,
    options: q.options,
    keywords: q.keywords,
    // correctAnswerIndex is intentionally excluded
  }));

  return {
    _id: quiz._id,
    title: quiz.title,
    description: quiz.description,
    questions: sanitizedQuestions,
  };
}

// POST /quizzes/:quizId/submit - Submit quiz answers
export async function submitQuizAnswers(quizId, userId, answers) {
  const attemptService = await import("./attemptService.js");
  return await attemptService.default.createAttempt(userId, quizId, answers);
}
