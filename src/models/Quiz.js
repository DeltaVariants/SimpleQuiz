// src/models/Quiz.js
import { Schema, model } from "mongoose";

const quizSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title là bắt buộc"],
      trim: true,
      minlength: [3, "Title phải có ít nhất 3 ký tự"],
      maxlength: [200, "Title không được vượt quá 200 ký tự"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description không được vượt quá 1000 ký tự"],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Thiết lập quan hệ 1-nhiều với Question
    questions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Question",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default model("Quiz", quizSchema);
