# Ma trận phân quyền - Authorization Matrix

## Tổng quan hệ thống phân quyền

Hệ thống sử dụng 3 middleware chính:

1. **`protectedRoute`** - Xác thực user đã đăng nhập (kiểm tra JWT token)
2. **`verifyAdmin`** - Kiểm tra user có quyền Admin
3. **`verifyAuthor`** - Kiểm tra user có phải tác giả của question

---

## 🔐 Ma trận phân quyền chi tiết

### **Authentication Routes** (Public - Không cần đăng nhập)

| Endpoint            | Method | Middleware | Ai được phép? | Mô tả                 |
| ------------------- | ------ | ---------- | ------------- | --------------------- |
| `/api/auth/signup`  | POST   | -          | ✅ Public     | Đăng ký tài khoản mới |
| `/api/auth/signin`  | POST   | -          | ✅ Public     | Đăng nhập             |
| `/api/auth/signout` | POST   | -          | ✅ Public     | Đăng xuất             |

---

### **Quiz Routes** (Yêu cầu đăng nhập)

| Endpoint                         | Method | Middleware                       | Ai được phép?     | Mô tả                                 |
| -------------------------------- | ------ | -------------------------------- | ----------------- | ------------------------------------- |
| `/api/quizzes`                   | GET    | `protectedRoute`                 | ✅ User đã login  | Xem tất cả quiz                       |
| `/api/quizzes`                   | POST   | `protectedRoute` + `verifyAdmin` | 🔒 **Admin only** | Tạo quiz mới                          |
| `/api/quizzes/:quizId`           | GET    | `protectedRoute`                 | ✅ User đã login  | Xem chi tiết quiz                     |
| `/api/quizzes/:quizId`           | PUT    | `protectedRoute` + `verifyAdmin` | 🔒 **Admin only** | Cập nhật quiz                         |
| `/api/quizzes/:quizId`           | DELETE | `protectedRoute` + `verifyAdmin` | 🔒 **Admin only** | Xóa quiz                              |
| `/api/quizzes/:quizId/populate`  | GET    | `protectedRoute`                 | ✅ User đã login  | Xem quiz với questions đã lọc         |
| `/api/quizzes/:quizId/question`  | POST   | `protectedRoute` + `verifyAdmin` | 🔒 **Admin only** | Thêm 1 question vào quiz              |
| `/api/quizzes/:quizId/questions` | POST   | `protectedRoute` + `verifyAdmin` | 🔒 **Admin only** | Thêm nhiều questions vào quiz         |
| `/api/quizzes/:quizId/take`      | GET    | `protectedRoute`                 | ✅ User đã login  | Lấy quiz để làm bài (không có đáp án) |
| `/api/quizzes/:quizId/submit`    | POST   | `protectedRoute`                 | ✅ User đã login  | Submit bài làm và nhận kết quả        |

---

### **Question Routes** (Yêu cầu đăng nhập)

| Endpoint                     | Method | Middleware                        | Ai được phép?      | Mô tả                           |
| ---------------------------- | ------ | --------------------------------- | ------------------ | ------------------------------- |
| `/api/questions`             | GET    | `protectedRoute`                  | ✅ User đã login   | Xem tất cả questions            |
| `/api/questions/:questionId` | GET    | `protectedRoute`                  | ✅ User đã login   | Xem chi tiết question           |
| `/api/questions/:questionId` | PUT    | `protectedRoute` + `verifyAuthor` | 🔒 **Author only** | Cập nhật question (chỉ tác giả) |
| `/api/questions/:questionId` | DELETE | `protectedRoute` + `verifyAuthor` | 🔒 **Author only** | Xóa question (chỉ tác giả)      |

---

### **User Routes** (Yêu cầu đăng nhập)

| Endpoint        | Method | Middleware                       | Ai được phép?     | Mô tả                       |
| --------------- | ------ | -------------------------------- | ----------------- | --------------------------- |
| `/api/users`    | GET    | `protectedRoute` + `verifyAdmin` | 🔒 **Admin only** | Xem danh sách tất cả users  |
| `/api/users/me` | GET    | `protectedRoute`                 | ✅ User đã login  | Xem thông tin user hiện tại |

---

### **Attempt Routes** (Yêu cầu đăng nhập)

| Endpoint                   | Method | Middleware       | Ai được phép?       | Mô tả                                  |
| -------------------------- | ------ | ---------------- | ------------------- | -------------------------------------- |
| `/api/attempts/me`         | GET    | `protectedRoute` | ✅ User đã login    | Xem tất cả attempts của user           |
| `/api/attempts/:attemptId` | GET    | `protectedRoute` | 🔒 Owner hoặc Admin | Xem chi tiết attempt (kết quả bài làm) |

---

## 📊 Tóm tắt theo vai trò

### **Public (Không cần đăng nhập)**

- Đăng ký, đăng nhập, đăng xuất

### **User (Đã đăng nhập)**

- Xem tất cả quiz, questions
- Xem thông tin cá nhân (`/users/me`)
- **Làm quiz:** Lấy quiz (`/quizzes/:quizId/take`) và submit bài (`/quizzes/:quizId/submit`)
- **Xem kết quả:** Xem lịch sử attempts (`/attempts/me`) và chi tiết từng attempt của mình
- **Không thể:** Tạo/sửa/xóa quiz, xem kết quả của người khác

### **Author (Tác giả của question)**

- Tất cả quyền của User
- Sửa/xóa question **của chính mình**
- **Không thể:** Sửa/xóa question của người khác

### **Admin (Quản trị viên)**

- Tất cả quyền của User
- Tạo/sửa/xóa quiz
- Thêm questions vào quiz
- Xem danh sách tất cả users
- **Xem tất cả attempts:** Admin có thể xem kết quả bài làm của bất kỳ user nào
- **Lưu ý:** Admin không tự động có quyền sửa/xóa question của người khác (trừ khi là author)

---

## 🔧 Chi tiết middleware

### 1. `protectedRoute`

```javascript
// Kiểm tra JWT token trong header Authorization
// Gán req.user nếu token hợp lệ
// Return: 401 nếu không có token, 403 nếu token không hợp lệ
```

### 2. `verifyAdmin`

```javascript
// Kiểm tra req.user.isAdmin === true
// Phải đặt sau protectedRoute
// Return: 403 "You are not authorized to perform this operation!"
```

### 3. `verifyAuthor`

```javascript
// Lấy questionId từ req.params
// Tìm question trong DB và so sánh question.authorId với req.user._id
// Phải đặt sau protectedRoute
// Return: 403 "You are not the author of this question"
```

---

## 🚀 Cách sử dụng

### Gửi request với authentication:

```http
# Header cho tất cả protected routes
Authorization: Bearer <access_token>
```

### Ví dụ:

```bash
# Đăng nhập để lấy token
POST /api/auth/signin
Body: { "username": "user1", "password": "pass123" }

# Sử dụng token
GET /api/quizzes
Headers: { "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs..." }
```

---

## ⚠️ Error Codes

| Code | Ý nghĩa      | Trường hợp                                                  |
| ---- | ------------ | ----------------------------------------------------------- |
| 401  | Unauthorized | Không có token hoặc chưa đăng nhập                          |
| 403  | Forbidden    | Token hợp lệ nhưng không đủ quyền (không phải admin/author) |
| 404  | Not Found    | Resource không tồn tại                                      |
| 500  | Server Error | Lỗi server                                                  |

---

**Ngày cập nhật:** 16/12/2025  
**Version:** 1.0
