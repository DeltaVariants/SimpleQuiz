# Sơ đồ thực thể liên kết (ERD) - SimpleQuiz

Dưới đây là sơ đồ ERD của hệ thống SimpleQuiz được vẽ bằng **Mermaid**, dựa trên các Mongoose Schema hiện tại trong thư mục `src/models`.

```mermaid
erDiagram
    USER ||--o{ QUIZ : "tạo (createdBy)"
    USER ||--o{ QUESTION : "tác giả (authorId)"
    USER ||--o{ ATTEMPT : "thực hiện (user)"
    USER ||--o{ SESSION : "có (userID)"

    QUIZ ||--o{ QUESTION : "chứa (questions)"
    QUIZ ||--o{ ATTEMPT : "được làm (quiz)"

    QUESTION ||--o{ ATTEMPT_ANSWER : "được trả lời (question)"
    ATTEMPT ||--o{ ATTEMPT_ANSWER : "bao gồm (answers)"

    USER {
        ObjectId _id
        string username
        string email
        string hashedPassword
        boolean isAdmin
        string avatarUrl
        string avatarId
        date createdAt
        date updatedAt
    }

    QUIZ {
        ObjectId _id
        string title
        string description
        ObjectId[] questions
        ObjectId createdBy
        date createdAt
        date updatedAt
    }

    QUESTION {
        ObjectId _id
        string text
        string[] options
        string[] keywords
        number correctAnswerIndex
        ObjectId quizId
        ObjectId authorId
        date createdAt
        date updatedAt
    }

    ATTEMPT {
        ObjectId _id
        ObjectId user
        ObjectId quiz
        Attribute_Array answers
        number score
        number totalQuestions
        number correctCount
        date createdAt
    }

    ATTEMPT_ANSWER {
        ObjectId question
        number selectedIndex
    }

    SESSION {
        ObjectId _id
        ObjectId userID
        string refreshToken
        date expiredAt
    }
```

## Mô tả các mối quan hệ:

1.  **User & Quiz:** Một Admin (`User`) có thể tạo nhiều `Quiz`. Một `Quiz` thuộc về một người tạo duy nhất.
2.  **User & Question:** Một người dùng có thể là tác giả của nhiều `Question`.
3.  **User & Attempt:** Một người dùng có thể thực hiện nhiều lượt làm bài (`Attempt`).
4.  **Quiz & Question:** Một `Quiz` chứa danh sách các câu hỏi. Đồng thời mỗi `Question` cũng lưu `quizId` để biết nó thuộc về bộ đề nào.
5.  **Quiz & Attempt:** Một `Attempt` luôn thuộc về một bộ đề `Quiz` cụ thể.
6.  **Attempt & Question:** Một lượt làm bài (`Attempt`) chứa danh sách các câu trả lời (`answers`), mỗi câu trả lời liên kết đến một `Question` và lưu lại vị trí đáp án người dùng chọn (`selectedIndex`).
7.  **User & Session:** Hệ thống quản lý phiên đăng nhập và Refresh Token thông qua bảng `Session`.
