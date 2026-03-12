# API Documentation

Base URL: `http://localhost:5001/api`

## API Summary

| Endpoint | Auth | Description |
|----------|------|-------------|
| `POST /api/auth/signup` | None | Đăng ký tài khoản mới |
| `POST /api/auth/signin` | None | Đăng nhập vào hệ thống |
| `POST /api/auth/signout` | None | Đăng xuất khỏi hệ thống |
| `GET /api/users` | Admin | Lấy danh sách tất cả users |
| `GET /api/users/me` | User | Lấy thông tin user hiện tại |
| `GET /api/quizzes` | None | Lấy danh sách tất cả quiz |
| `POST /api/quizzes` | Admin | Tạo quiz mới |
| `GET /api/quizzes/:quizId` | None | Lấy thông tin chi tiết quiz |
| `PUT /api/quizzes/:quizId` | Admin | Cập nhật thông tin quiz |
| `DELETE /api/quizzes/:quizId` | Admin | Xóa quiz |
| `GET /api/quizzes/:quizId/populate` | None | Lấy quiz với questions được lọc |
| `POST /api/quizzes/:quizId/question` | Admin | Thêm 1 câu hỏi vào quiz |
| `POST /api/quizzes/:quizId/questions` | Admin | Thêm nhiều câu hỏi vào quiz |
| `GET /api/quizzes/:quizId/take` | User | Lấy quiz để làm bài |
| `POST /api/quizzes/:quizId/submit` | User | Nộp bài làm quiz |
| `GET /api/questions` | None | Lấy danh sách tất cả questions |
| `GET /api/questions/:questionId` | None | Lấy thông tin chi tiết question |
| `PUT /api/questions/:questionId` | Admin (Author) | Cập nhật question (chỉ tác giả) |
| `DELETE /api/questions/:questionId` | Admin (Author) | Xóa question (chỉ tác giả) |
| `GET /api/attempts/me` | User | Lấy danh sách attempts của user |
| `GET /api/attempts/:attemptId` | User | Lấy chi tiết attempt |
| `GET /api/health` | None | Kiểm tra trạng thái server |


## Table of Contents

- [Authentication](#authentication)
- [Users](#users)
- [Quizzes](#quizzes)
- [Questions](#questions)
- [Attempts](#attempts)

---

## Authentication

### 1. Sign Up

- **Endpoint:** `POST /api/auth/signup`
- **Authentication:** None
- **Permission:** Public
- **Description:** Đăng ký tài khoản mới
- **Request Body:**

```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "isAdmin": true
}
```

- **Response:** User object và JWT token

---

### 2. Sign In

- **Endpoint:** `POST /api/auth/signin`
- **Authentication:** None
- **Permission:** Public
- **Description:** Đăng nhập vào hệ thống
- **Request Body:**

```json
{
  "username": "string",
  "password": "string"
}
```

- **Response:** User object và JWT token (được lưu trong cookie)

---

### 3. Sign Out

- **Endpoint:** `POST /api/auth/signout`
- **Authentication:** None
- **Permission:** Public
- **Description:** Đăng xuất khỏi hệ thống
- **Response:** Success message

---

## Users

### 1. Get All Users

- **Endpoint:** `GET /api/users`
- **Authentication:** Required (Bearer Token)
- **Permission:** Admin only
- **Description:** Lấy danh sách tất cả users
- **Response:** Array of user objects

---

### 2. Get Current User

- **Endpoint:** `GET /api/users/me`
- **Authentication:** Required (Bearer Token)
- **Permission:** Authenticated users
- **Description:** Lấy thông tin user hiện tại đang đăng nhập
- **Response:** User object

---

## Quizzes

### 1. Get All Quizzes

- **Endpoint:** `GET /api/quizzes`
- **Authentication:** None
- **Permission:** Public
- **Description:** Lấy danh sách tất cả các quiz
- **Query Parameters:**
  - `page`: number (optional)
  - `limit`: number (optional)
- **Response:** Array of quiz objects

---

### 2. Create Quiz

- **Endpoint:** `POST /api/quizzes`
- **Authentication:** Required (Bearer Token)
- **Permission:** Admin only
- **Description:** Tạo quiz mới
- **Request Body:**

```json
{
  "title": "string",
  "description": "string",
  "duration": "number (minutes)",
  "passingScore": "number"
}
```

- **Response:** Created quiz object

---

### 3. Get Quiz By ID

- **Endpoint:** `GET /api/quizzes/:quizId`
- **Authentication:** None
- **Permission:** Public
- **Description:** Lấy thông tin chi tiết của 1 quiz
- **Response:** Quiz object

---

### 4. Update Quiz

- **Endpoint:** `PUT /api/quizzes/:quizId`
- **Authentication:** Required (Bearer Token)
- **Permission:** Admin only
- **Description:** Cập nhật thông tin quiz
- **Request Body:**

```json
{
  "title": "string",
  "description": "string",
  "duration": "number",
  "passingScore": "number"
}
```

- **Response:** Updated quiz object

---

### 5. Delete Quiz

- **Endpoint:** `DELETE /api/quizzes/:quizId`
- **Authentication:** Required (Bearer Token)
- **Permission:** Admin only
- **Description:** Xóa quiz
- **Response:** Success message

---

### 6. Get Quiz with Filtered Questions

- **Endpoint:** `GET /api/quizzes/:quizId/populate`
- **Authentication:** None
- **Permission:** Public
- **Description:** Lấy quiz với danh sách câu hỏi được lọc theo keyword
- **Query Parameters:**
  - `keyword`: string (optional)
- **Response:** Quiz object with populated questions

---

### 7. Create Single Question in Quiz

- **Endpoint:** `POST /api/quizzes/:quizId/question`
- **Authentication:** Required (Bearer Token)
- **Permission:** Admin only
- **Description:** Thêm 1 câu hỏi mới vào quiz
- **Request Body:**

```json
{
  "text": "string",
  "options": ["string", "string", "string", "string"],
  "correctAnswerIndex": 0,
  "keywords": ["string", "string"]
}
```

- **Response:** Created question object

---

### 8. Create Multiple Questions in Quiz

- **Endpoint:** `POST /api/quizzes/:quizId/questions`
- **Authentication:** Required (Bearer Token)
- **Permission:** Admin only
- **Description:** Thêm nhiều câu hỏi vào quiz cùng lúc
- **Request Body:**

```json
{
  "questions": [
    {
      "text": "string",
      "options": ["string", "string", "string", "string"],
      "correctAnswerIndex": 0,
      "keywords": ["string", "string"]
    }
  ]
}
```

- **Response:** Array of created question objects

---

### 9. Take Quiz (Get Questions for Attempting)

- **Endpoint:** `GET /api/quizzes/:quizId/take`
- **Authentication:** Required (Bearer Token)
- **Permission:** Authenticated users
- **Description:** Lấy câu hỏi của quiz để làm bài (không hiển thị đáp án đúng)
- **Response:** Quiz object with questions (without correct answers)

---

### 10. Submit Quiz

- **Endpoint:** `POST /api/quizzes/:quizId/submit`
- **Authentication:** Required (Bearer Token)
- **Permission:** Authenticated users
- **Description:** Nộp bài làm quiz và nhận kết quả
- **Request Body:**

```json
{
  "answers": [
    {
      "questionId": "string",
      "selectedAnswers": ["string"]
    }
  ]
}
```

- **Response:** Attempt object with score and detailed results

---

## Questions

### 1. Get All Questions

- **Endpoint:** `GET /api/questions`
- **Authentication:** Required (Bearer Token)
- **Permission:** Authenticated users
- **Description:** Lấy danh sách tất cả câu hỏi
- **Response:** Array of question objects

---

### 2. Get Question By ID

- **Endpoint:** `GET /api/questions/:questionId`
- **Authentication:** Required (Bearer Token)
- **Permission:** Authenticated users
- **Description:** Lấy thông tin chi tiết của 1 câu hỏi
- **Response:** Question object

---

### 3. Update Question

- **Endpoint:** `PUT /api/questions/:questionId`
- **Authentication:** Required (Bearer Token)
- **Permission:** Author only (Admin who created the question)
- **Description:** Cập nhật câu hỏi (chỉ tác giả mới được sửa)
- **Request Body:**

```json
{
  "text": "string",
  "options": ["string", "string", "string", "string"],
  "correctAnswerIndex": 0,
  "keywords": ["string", "string"]
}
```

- **Response:** Updated question object

---

### 4. Delete Question

- **Endpoint:** `DELETE /api/questions/:questionId`
- **Authentication:** Required (Bearer Token)
- **Permission:** Author only (Admin who created the question)
- **Description:** Xóa câu hỏi (chỉ tác giả mới được xóa)
- **Response:** Success message

---

## Attempts

### 1. Get My Attempts

- **Endpoint:** `GET /api/attempts/me`
- **Authentication:** Required (Bearer Token)
- **Permission:** Authenticated users
- **Description:** Lấy danh sách tất cả các lần làm bài của user hiện tại
- **Response:** Array of attempt objects

---

### 2. Get Attempt By ID

- **Endpoint:** `GET /api/attempts/:attemptId`
- **Authentication:** Required (Bearer Token)
- **Permission:** Authenticated users (own attempts only)
- **Description:** Lấy thông tin chi tiết của 1 lần làm bài
- **Response:** Attempt object with detailed results

---

## Health Check

### Health Check

- **Endpoint:** `GET /api/health`
- **Authentication:** None
- **Permission:** Public
- **Description:** Kiểm tra trạng thái server
- **Response:**

```json
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "ISO datetime string"
}
```

---

## Common Response Formats

### Success Response

```json
{
  "success": true,
  "message": "string",
  "data": {}
}
```

### Error Response

```json
{
  "success": false,
  "message": "string",
  "error": "string"
}
```

---

## Authentication

- Sử dụng JWT token để xác thực
- Token được gửi qua HTTP-only cookie sau khi đăng nhập
- Token cũng có thể gửi qua header: `Authorization: Bearer <token>`

## Permissions

- **Public**: Không cần đăng nhập
- **Authenticated**: Cần đăng nhập
- **Admin**: Chỉ admin mới có quyền
- **Author**: Chỉ tác giả (người tạo) mới có quyền

## Notes

- Tất cả các `:id` params phải là ObjectId hợp lệ của MongoDB
- Các endpoint có `protectedRoute` cần JWT token
- Các endpoint có `verifyAdmin` chỉ dành cho admin
- Các endpoint có `verifyAuthor` chỉ dành cho tác giả của resource đó
