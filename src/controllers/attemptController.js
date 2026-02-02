import attemptService from "../services/attemptService.js";
import { successResponse, errorResponse } from "../libs/apiResponse.js";

class AttemptController {
  /**
   * GET /api/attempts/me
   * Get all attempts for the current user
   */
  async getMyAttempts(req, res) {
    try {
      const userId = req.user._id;
      const attempts = await attemptService.getUserAttempts(userId);

      return res
        .status(200)
        .json(
          successResponse(attempts, "User attempts retrieved successfully")
        );
    } catch (error) {
      return res.status(500).json(errorResponse(500, error.message));
    }
  }

  /**
   * GET /api/attempts/:attemptId
   * Get a specific attempt (owner or admin only)
   */
  async getAttemptById(req, res) {
    try {
      const { attemptId } = req.params;
      const userId = req.user._id;
      const isAdmin = req.user.admin;

      const attempt = await attemptService.getAttemptById(
        attemptId,
        userId,
        isAdmin
      );

      return res
        .status(200)
        .json(successResponse(attempt, "Attempt retrieved successfully"));
    } catch (error) {
      if (error.message === "Attempt not found") {
        return res.status(404).json(errorResponse(404, error.message));
      }
      if (error.message === "Unauthorized to view this attempt") {
        return res.status(403).json(errorResponse(403, error.message));
      }
      return res.status(500).json(errorResponse(500, error.message));
    }
  }
}

export default new AttemptController();
