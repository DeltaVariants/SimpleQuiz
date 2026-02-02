import Attempt from "../models/Attempt.js";
import Quiz from "../models/Quiz.js";
import Question from "../models/Question.js";

class AttemptService {
  /**
   * Get all attempts for a specific user
   */
  async getUserAttempts(userId) {
    const attempts = await Attempt.find({ user: userId })
      .populate("quiz", "title description")
      .sort({ createdAt: -1 });
    return attempts;
  }

  /**
   * Get a specific attempt by ID
   */
  async getAttemptById(attemptId, userId, isAdmin = false) {
    const attempt = await Attempt.findById(attemptId)
      .populate("quiz", "title description")
      .populate("answers.question", "text options correctAnswerIndex");

    if (!attempt) {
      throw new Error("Attempt not found");
    }

    // Authorization check: only owner or admin can view
    if (!isAdmin && attempt.user.toString() !== userId.toString()) {
      throw new Error("Unauthorized to view this attempt");
    }

    return attempt;
  }

  /**
   * Create a new attempt after quiz submission
   */
  async createAttempt(userId, quizId, answers) {
    // Fetch the quiz with populated questions
    const quiz = await Quiz.findById(quizId).populate("questions");

    if (!quiz) {
      throw new Error("Quiz not found");
    }

    // Calculate score
    let correctCount = 0;
    const totalQuestions = quiz.questions.length;

    // Build answers array with validation
    const validatedAnswers = [];

    for (const answer of answers) {
      const question = quiz.questions.find(
        (q) => q._id.toString() === answer.questionId.toString()
      );

      if (!question) {
        throw new Error(`Question ${answer.questionId} not found in quiz`);
      }

      // Check if answer is correct
      if (question.correctAnswerIndex === answer.selectedIndex) {
        correctCount++;
      }

      validatedAnswers.push({
        question: answer.questionId,
        selectedIndex: answer.selectedIndex,
      });
    }

    // Calculate score (percentage)
    const score =
      totalQuestions > 0
        ? Math.round((correctCount / totalQuestions) * 100)
        : 0;

    // Create attempt
    const attempt = new Attempt({
      user: userId,
      quiz: quizId,
      answers: validatedAnswers,
      score,
      totalQuestions,
      correctCount,
    });

    await attempt.save();

    return {
      attemptId: attempt._id,
      score,
      correctCount,
      totalQuestions,
    };
  }
}

export default new AttemptService();
