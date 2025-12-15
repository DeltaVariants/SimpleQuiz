// src/controllers/questionController.js
import { errorResponse, successResponse } from "../libs/apiResponse.js";
import * as questionService from "../services/questionService.js";

export async function getAllQuestions(req, res) {
  try {
    const questions = await questionService.getAllQuestions();
    res.status(200).json(successResponse(questions));
  } catch (error) {
    res
      .status(500)
      .json(errorResponse(500, "Internal Server Error", error.message));
  }
}

export async function createQuestion(req, res) {
  try {
    // Validate required fields
    const { text, options, correctAnswerIndex, quizId } = req.body;

    if (!text || !options || correctAnswerIndex === undefined || !quizId) {
      return res
        .status(400)
        .json(
          errorResponse(
            400,
            "Các trường text, options, correctAnswerIndex và quizId là bắt buộc"
          )
        );
    }

    // Validate options is array with at least 2 items
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

    // Tự động thêm authorId từ req.user
    const questionData = {
      ...req.body,
      authorId: req.user._id,
    };

    const newQuestion = await questionService.createQuestion(questionData);
    res
      .status(201)
      .json(successResponse(newQuestion, "Question created successfully"));
  } catch (error) {
    res.status(400).json(errorResponse(400, error.message));
  }
}

export async function getQuestionById(req, res) {
  try {
    const question = await questionService.getQuestionById(
      req.params.questionId
    );
    if (!question) {
      return res.status(404).json(errorResponse(404, "Question not found"));
    }
    res.status(200).json(successResponse(question));
  } catch (error) {
    res
      .status(500)
      .json(errorResponse(500, "Internal Server Error", error.message));
  }
}

export async function updateQuestion(req, res) {
  try {
    // Validate nếu có update options và correctAnswerIndex
    const { options, correctAnswerIndex } = req.body;

    if (options && (!Array.isArray(options) || options.length < 2)) {
      return res
        .status(400)
        .json(errorResponse(400, "Options phải là mảng có ít nhất 2 phần tử"));
    }

    const updatedQuestion = await questionService.updateQuestion(
      req.params.questionId,
      req.body
    );
    if (!updatedQuestion) {
      return res.status(404).json(errorResponse(404, "Question not found"));
    }
    res
      .status(200)
      .json(successResponse(updatedQuestion, "Question updated successfully"));
  } catch (error) {
    res.status(400).json(errorResponse(400, error.message));
  }
}

export async function deleteQuestion(req, res) {
  try {
    const deletedQuestion = await questionService.deleteQuestion(
      req.params.questionId
    );
    if (!deletedQuestion) {
      return res.status(404).json(errorResponse(404, "Question not found"));
    }
    res
      .status(200)
      .json(
        successResponse(null, "Question and references deleted successfully")
      );
  } catch (error) {
    res
      .status(500)
      .json(errorResponse(500, "Internal Server Error", error.message));
  }
}
