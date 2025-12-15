import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Question from "../models/Question.js";
import mongoose from "mongoose";

// Middleware kiểm tra ObjectId hợp lệ
export const validateObjectId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];

    if (!id) {
      return res.status(400).json({ message: `${paramName} is required` });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: `Invalid ${paramName} format` });
    }

    next();
  };
};

// xác minh user hợp lệ hay không
export const protectedRoute = (req, res, next) => {
  try {
    // lấy token từ header
    const authHeader = req.headers["authorization"]; //dùng bracket notation để tránh lỗi khi header có dấu gạch ngang
    const token = authHeader && authHeader.split(" ")[1]; // kiểm tra xem có token không và lấy token từ "Bearer <token>"

    if (!token) {
      return res.status(401).json({ message: "Không tìm thấy access token" });
    }

    // xác thực token hợp lệ
    jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET,
      async (err, decodedUser) => {
        if (err) {
          //nếu xác thực bị lỗi, trả về 403
          return res
            .status(403)
            .json({ message: "Access token không hợp lệ hoặc hết hạn" });
        }
        // nếu tìm được thông tin user từ token
        const user = await User.findById(decodedUser.userId).select(
          "-hashedPassword"
        ); // loại bỏ trường password

        if (!user) {
          return res.status(404).json({ message: "User không tồn tại" });
        }
        // gán thông tin user vào req.user để các controller sử dụng mà không cần phải truy vấn lại db
        req.user = user;
        next(); // cho phép tiếp tục xử lý request
      }
    );
  } catch (error) {
    console.error("Lỗi khi xác thực JWT trong authMiddleware:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

// kiểm tra user có quyền admin hay không (yêu cầu protectedRoute chạy trước)
export const verifyAdmin = (req, res, next) => {
  try {
    // req.user đã được gán từ protectedRoute middleware
    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Chưa xác thực, vui lòng đăng nhập" });
    }

    // kiểm tra admin flag
    if (req.user.isAdmin === true) {
      next(); // cho phép tiếp tục nếu là admin
    } else {
      return res.status(403).json({
        message: "Bạn không có quyền thực hiện thao tác này!",
      });
    }
  } catch (error) {
    console.error("Lỗi khi verify admin:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

// kiểm tra user có phải là author của question hay không (yêu cầu protectedRoute chạy trước)
export const verifyAuthor = async (req, res, next) => {
  try {
    // req.user đã được gán từ protectedRoute middleware
    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Chưa xác thực, vui lòng đăng nhập" });
    }

    // lấy questionId từ params
    const { questionId } = req.params;

    if (!questionId) {
      return res.status(400).json({ message: "Question ID là bắt buộc" });
    }

    // tìm question trong database
    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({ message: "Không tìm thấy question" });
    }

    // so sánh authorId của question với _id của user hiện tại
    if (question.authorId.toString() === req.user._id.toString()) {
      next(); // cho phép tiếp tục nếu là tác giả
    } else {
      return res.status(403).json({
        message: "Bạn không phải là tác giả của question này",
      });
    }
  } catch (error) {
    console.error("Lỗi khi verify author:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};
