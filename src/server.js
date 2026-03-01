import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./libs/db.js";
import authRoute from "./routes/authRoute.js";
import userRoute from "./routes/userRoute.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import quizRoute from "./routes/quizRoute.js";
import questionRoute from "./routes/questionRoute.js";
import attemptRoute from "./routes/attemptRoute.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// CORS configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:3000", // Frontend URL
  credentials: true, // Cho phép gửi cookies
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400, // 24 hours - cache preflight response
};

app.use(cors(corsOptions));

// Middleware to parse JSON requests
app.use(express.json()); //giúp express hiểu và đọc các body dạng JSON
app.use(cookieParser()); // middleware để parse cookie từ request header

// health check endpoint - PHẢI ĐẶT TRƯỚC TẤT CẢ MIDDLEWARE XÁC THỰC
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// public routes - không cần xác thực
app.use("/api/auth", authRoute);

// routes có middleware xác thực được định nghĩa ở từng route cụ thể
app.use("/api/quizzes", quizRoute);
app.use("/api/questions", questionRoute);
app.use("/api/users", userRoute);
app.use("/api/attempts", attemptRoute);

// Connect to the database and start the server
connectDB();
app.listen(PORT, () => {
  console.log(`Server đang hoạt động tại http://localhost:${PORT}`);
});
