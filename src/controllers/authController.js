import bcrypt from "bcrypt";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Session from "../models/Session.js";
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
  validationErrorResponse,
} from "../libs/apiResponse.js";

// JWT: access token sống ngắn, thư viện jwt hỗ trợ format "30m", "1h", ...
const ACCESS_TOKEN_TTL = "30m"; // thường dưới 15 phút

// Refresh token: sống dài, dùng cho cookie/DB nên cần milliseconds (cookie Max-Age chỉ nhận number)
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; // 14 days (ms)

export const signUp = async (req, res) => {
  try {
    const { username, password, email } = req.body;

    // Validate required fields
    if (!username || !password || !email) {
      return res
        .status(400)
        .json(errorResponse(400, "Vui lòng điền đầy đủ thông tin"));
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json(errorResponse(400, "Email không hợp lệ"));
    }

    // Validate username length
    if (username.length < 3 || username.length > 20) {
      return res
        .status(400)
        .json(errorResponse(400, "Username phải từ 3-20 ký tự"));
    }

    // Validate password length
    if (password.length < 6 || password.length > 8) {
      return res
        .status(400)
        .json(errorResponse(400, "Password phải từ 6-8 ký tự"));
    }

    // Kiem tra username hoac email da ton tai chua
    const duplicate = await User.findOne({ username });
    if (duplicate) {
      return res.status(409).json(errorResponse(409, "User này đã tồn tại!"));
    }

    // Kiểm tra email đã tồn tại chưa
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res
        .status(409)
        .json(errorResponse(409, "Email này đã được sử dụng!"));
    }

    // Neu chua, ma hoa password
    const hashedPassword = await bcrypt.hash(password, 10); // salt =10 là độ phức tạp của mã hóa

    // Tao user moi va luu vao DB
    const newUser = await User.create({
      username,
      hashedPassword,
      email,
    });

    // Tra ve ket qua cho client
    return res
      .status(201)
      .json(
        successResponse(
          { userId: newUser._id, username: newUser.username },
          "Đăng ký thành công"
        )
      );
  } catch (error) {
    console.error("Lỗi khi gọi signUp", error);
    return res.status(500).json(serverErrorResponse("Lỗi server"));
  }
};

export const signIn = async (req, res) => {
  try {
    // lấy input từ request body
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json(errorResponse(400, "Vui lòng điền đầy đủ thông tin"));
    }
    // lấy hashedPassword từ database dựa trên username để so với password input
    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(401)
        .json(errorResponse(401, "Sai username hoặc password"));
    }

    // kiểm tra password
    const passwordCorrect = await bcrypt.compare(password, user.hashedPassword);

    if (!passwordCorrect) {
      return res
        .status(401)
        .json(errorResponse(401, "Sai username hoặc password"));
    }

    // nếu khớp, tạo accessToken với JWT
    const accessToken = jwt.sign(
      //Hàm jwt.sign() dùng để tạo token, có 3 tham số: payload, secret key, options
      { userId: user._id, username: user.username }, //payload: thông tin muốn lưu trữ trong token
      process.env.ACCESS_TOKEN_SECRET, //secret key: dùng để mã hóa token
      { expiresIn: ACCESS_TOKEN_TTL } //options: thời gian hết hạn của token
    );

    // tạo refreshToken
    const refreshToken = crypto.randomBytes(64).toString("hex");

    // tạo session để lưu refreshToken
    await Session.create({
      userID: user._id,
      refreshToken, // --> refreshToken được lưu ở đây
      expiredAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
    });

    // trả refreshToken về cho client thông qua cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none", // cho phép BE và FE khác domain (deploy riêng) có thể gửi cookie, nếu là 'strict' thì chỉ cùng domain mới gửi được
      maxAge: REFRESH_TOKEN_TTL,
    });

    // trả accessToken về cho client thông qua response body
    return res
      .status(200)
      .json(
        successResponse(
          { accessToken },
          `User ${user.username} đăng nhập thành công`
        )
      );
  } catch (error) {
    console.error("Lỗi khi gọi signIn", error);
    return res.status(500).json(serverErrorResponse("Lỗi server"));
  }
};

export const signOut = async (req, res) => {
  try {
    //lấy refreshToken từ cookie
    const token = req.cookies?.refreshToken;

    if (token) {
      // xóa refreshToken trong session DB
      await Session.deleteOne({ refreshToken: token });

      // xóa cookie trên trình duyệt
      res.clearCookie("refreshToken");
    }

    return res.status(200).json(successResponse(null, "Đăng xuất thành công"));
  } catch (error) {
    console.error("Lỗi khi gọi signOut", error);
    return res.status(500).json(serverErrorResponse("Lỗi server"));
  }
};
