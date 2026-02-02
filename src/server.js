import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./libs/db.js";
import authRoute from "./routes/authRoute.js";
import userRoute from "./routes/userRoute.js";
import cookieParser from "cookie-parser";
import { protectedRoute } from "./middlewares/authMiddleware.js";
import quizRoute from "./routes/quizRoute.js";
import questionRoute from "./routes/questionRoute.js";
import attemptRoute from "./routes/attemptRoute.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware to parse JSON requests
app.use(express.json()); //giúp express hiểu và đọc các body dạng JSON
app.use(cookieParser()); // middleware để parse cookie từ request header

// health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// public routes
app.use("/api/auth", authRoute);

// private routes - yêu cầu đăng nhập
app.use(protectedRoute); // áp dụng middleware xác thực cho các route ở dưới
app.use("/api/quizzes", quizRoute);
app.use("/api/questions", questionRoute);
app.use("/api/users", userRoute);
app.use("/api/attempts", attemptRoute);

// Connect to the database and start the server
connectDB();
app.listen(PORT, () => {
  console.log(`Server đang chạy trên port ${PORT}`);
});
