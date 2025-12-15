// src/models/Question.js
import { Schema, model } from "mongoose";

const questionSchema = new Schema(
  {
    text: {
      type: String,
      required: [true, "Text là bắt buộc"],
      trim: true,
      minlength: [5, "Text phải có ít nhất 5 ký tự"],
      maxlength: [500, "Text không được vượt quá 500 ký tự"],
    },
    options: {
      type: [String],
      required: [true, "Options là bắt buộc"],
      validate: {
        validator: (v) => Array.isArray(v) && v.length >= 2,
        message: "Options phải là mảng có ít nhất 2 phần tử",
      },
    },
    keywords: {
      type: [String],
      default: [],
      lowercase: true,
    },
    correctAnswerIndex: {
      type: Number,
      required: true,
      validate: {
        validator: function (v) {
          // Sử dụng this.options hoặc this.$locals.options nếu có thay đổi
          const options = this.options || this.$locals?.options || [];
          return options.length > 0 && v >= 0 && v < options.length;
        },
        message: "correctAnswerIndex must be a valid index of options array",
      },
    },
    quizId: {
      type: Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default model("Question", questionSchema);
