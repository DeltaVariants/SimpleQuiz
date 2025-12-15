// src/controllers/quizController.js
import { errorResponse, successResponse } from "../libs/apiResponse.js";
import * as quizService from "../services/quizService.js";

export async function getAllQuizzes(req, res) {
  // GET /quizzes
  try {
    const quizzes = await quizService.getAllQuizzes();
    res.status(200).json(successResponse(quizzes));
  } catch (error) {
    res
      .status(500)
      .json(errorResponse(500, "Internal Server Error", error.message));
  }
}

export async function createQuiz(req, res) {
  // POST /quizzes
  try {
    // Validate required field
    const { title } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json(errorResponse(400, "Title là bắt buộc"));
    }

    // Tự động thêm createdBy từ req.user
    const quizData = {
      ...req.body,
      createdBy: req.user._id,
    };

    const savedQuiz = await quizService.createQuiz(quizData);
    res
      .status(201)
      .json(successResponse(savedQuiz, "Quiz created successfully"));
  } catch (error) {
    res.status(400).json(errorResponse(400, error.message));
  }
}

export async function getQuizById(req, res) {
  // GET /quizzes/:quizId
  try {
    const quiz = await quizService.getQuizById(req.params.quizId);
    if (!quiz) {
      return res.status(404).json(errorResponse(404, "Quiz not found"));
    }
    res.status(200).json(successResponse(quiz));
  } catch (error) {
    res
      .status(500)
      .json(errorResponse(500, "Internal Server Error", error.message));
  }
}

export async function updateQuiz(req, res) {
  // PUT /quizzes/:quizId
  try {
    // Không cho phép update createdBy
    if (req.body.createdBy) {
      return res
        .status(400)
        .json(errorResponse(400, "Không thể thay đổi createdBy"));
    }

    const updatedQuiz = await quizService.updateQuiz(
      req.params.quizId,
      req.body
    );
    if (!updatedQuiz) {
      return res.status(404).json(errorResponse(404, "Quiz not found"));
    }
    res
      .status(200)
      .json(successResponse(updatedQuiz, "Quiz updated successfully"));
  } catch (error) {
    res.status(400).json(errorResponse(400, error.message));
  }
}

export async function deleteQuiz(req, res) {
  // DELETE /quizzes/:quizId
  try {
    const deletedQuiz = await quizService.deleteQuizAndQuestions(
      req.params.quizId
    );
    if (!deletedQuiz) {
      return res.status(404).json(errorResponse(404, "Quiz not found"));
    }
    res
      .status(200)
      .json(
        successResponse(
          null,
          "Quiz and associated questions deleted successfully"
        )
      );
  } catch (error) {
    res
      .status(500)
      .json(errorResponse(500, "Internal Server Error", error.message));
  }
}

export async function createQuestionInQuiz(req, res) {
  // POST /quizzes/:quizId/question
  try {
    // Validate required fields
    const { text, options, correctAnswerIndex } = req.body;

    if (!text || !options || correctAnswerIndex === undefined) {
      return res
        .status(400)
        .json(
          errorResponse(
            400,
            "Các trường text, options và correctAnswerIndex là bắt buộc"
          )
        );
    }

    // Validate options
    if (!Array.isArray(options) || options.length < 2) {
      return res
        .status(400)
        .json(errorResponse(400, "Options phải là mảng có ít nhất 2 phần tử"));
    }

    // Validate correctAnswerIndex
    if (correctAnswerIndex < 0 || correctAnswerIndex >= options.length) {
      return res
        .status(400)
        .json(
          errorResponse(400, "correctAnswerIndex phải nằm trong khoảng options")
        );
    }

    // Tự động thêm authorId và quizId (quizId từ params, KHÔNG từ body)
    const questionData = {
      ...req.body,
      authorId: req.user._id,
      quizId: req.params.quizId, // Tự động từ URL params
    };
    // Xóa quizId từ body nếu có người gửi lên (để tránh conflict)
    delete questionData.quizId;
    questionData.quizId = req.params.quizId;

    const savedQuestion = await quizService.addQuestionToQuiz(
      req.params.quizId,
      questionData
    );
    if (!savedQuestion) {
      return res.status(404).json(errorResponse(404, "Quiz not found"));
    }
    res
      .status(201)
      .json(
        successResponse(savedQuestion, "Question added to quiz successfully")
      );
  } catch (error) {
    res.status(400).json(errorResponse(400, error.message));
  }
}

export async function createManyQuestionsInQuiz(req, res) {
  // POST /quizzes/:quizId/questions
  try {
    // Validate input là array
    if (!Array.isArray(req.body) || req.body.length === 0) {
      return res
        .status(400)
        .json(errorResponse(400, "Request body phải là mảng các questions"));
    }

    // Validate từng question
    for (let i = 0; i < req.body.length; i++) {
      const q = req.body[i];
      if (!q.text || !q.options || q.correctAnswerIndex === undefined) {
        return res
          .status(400)
          .json(errorResponse(400, `Question ${i + 1}: Thiếu trường bắt buộc`));
      }
      if (!Array.isArray(q.options) || q.options.length < 2) {
        return res
          .status(400)
          .json(
            errorResponse(
              400,
              `Question ${i + 1}: Options phải có ít nhất 2 phần tử`
            )
          );
      }
      if (
        q.correctAnswerIndex < 0 ||
        q.correctAnswerIndex >= q.options.length
      ) {
        return res
          .status(400)
          .json(
            errorResponse(
              400,
              `Question ${i + 1}: correctAnswerIndex không hợp lệ`
            )
          );
      }
    }

    // Thêm authorId cho tất cả questions
    const questionsWithAuthor = req.body.map((q) => ({
      ...q,
      authorId: req.user._id,
    }));

    const count = await quizService.addManyQuestionsToQuiz(
      req.params.quizId,
      questionsWithAuthor
    );
    res
      .status(200)
      .json(
        successResponse(
          { count: count },
          `${count} questions added successfully.`
        )
      );
  } catch (error) {
    res.status(400).json(errorResponse(400, error.message));
  }
}

export async function getPopulatedQuizByKeyword(req, res) {
  // GET /quizzes/:quizId/populate
  try {
    const quizWithFilteredQuestions =
      await quizService.filterQuestionsByKeyword(req.params.quizId, "capital");
    if (!quizWithFilteredQuestions) {
      return res.status(404).json(errorResponse(404, "Quiz not found"));
    }
    res
      .status(200)
      .json(
        successResponse(
          quizWithFilteredQuestions,
          "Quiz populated and filtered by keyword: capital"
        )
      );
  } catch (error) {
    res
      .status(500)
      .json(errorResponse(500, "Internal Server Error", error.message));
  }
}
