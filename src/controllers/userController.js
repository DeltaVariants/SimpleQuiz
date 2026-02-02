import User from "../models/User.js";
import { successResponse, serverErrorResponse } from "../libs/apiResponse.js";

export const authMe = async (req, res) => {
  try {
    const user = req.user; // lấy từ authMiddleware

    return res
      .status(200)
      .json(successResponse(user, "Lấy thông tin user thành công"));
  } catch (error) {
    console.error("Lỗi khi gọi authMe", error);
    return res.status(500).json(serverErrorResponse("Lỗi hệ thống"));
  }
};

// Lấy danh sách tất cả users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-hashedPassword");
    return res
      .status(200)
      .json(
        successResponse(
          { users, count: users.length },
          "Lấy danh sách users thành công"
        )
      );
  } catch (error) {
    console.error("Lỗi khi lấy danh sách users", error);
    return res.status(500).json(serverErrorResponse("Lỗi server"));
  }
};
