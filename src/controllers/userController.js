import User from "../models/User.js";

export const authMe = async (req, res) => {
  try {
    const user = req.user; // lấy từ authMiddleware

    return res.status(200).json({
      user,
    });
  } catch (error) {
    console.error("Lỗi khi gọi authMe", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// Lấy danh sách tất cả users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-hashedPassword");
    return res.status(200).json({
      users,
      count: users.length,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách users", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};
