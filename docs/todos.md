PROJECT CONTEXT: SIMPLEQUIZ BACKEND

This is a Node.js + Express + MongoDB backend for a Quiz application named "SimpleQuiz".

The project already implements:

- JWT authentication
- Role-based authorization (User, Author, Admin)
- Quiz and Question CRUD (partially)
- Authorization matrix is strictly enforced

---

## TECH STACK

- Node.js
- Express
- MongoDB with Mongoose
- JWT Authentication
- REST API (JSON)
- Middleware-based authorization

---

## EXISTING MODELS

User

- \_id: ObjectId
- username: String
- password: String (hashed)
- admin: Boolean (default false)

Quiz

- \_id: ObjectId
- title: String
- description: String
- questions: [ObjectId] (ref Question)

Question

- \_id: ObjectId
- text: String
- options: [String]
- correctAnswerIndex: Number
- keywords: [String]
- author: ObjectId (ref User)

---

## EXISTING MIDDLEWARE

- protectedRoute

  - verifies JWT
  - attaches req.user

- verifyAdmin

  - allows only admin users

- verifyAuthor
  - allows only the author of a question
  - admin CANNOT edit/delete other authors' questions

---

## EXISTING API ENDPOINTS (ALREADY IMPLEMENTED)

Auth:
POST /api/auth/signup
POST /api/auth/signin
POST /api/auth/signout

Quiz:
GET /api/quizzes
POST /api/quizzes (admin only)
GET /api/quizzes/:quizId
PUT /api/quizzes/:quizId (admin only)
DELETE /api/quizzes/:quizId (admin only)
GET /api/quizzes/:quizId/populate
POST /api/quizzes/:quizId/question
POST /api/quizzes/:quizId/questions

Question:
GET /api/questions
GET /api/questions/:questionId
PUT /api/questions/:questionId (author only)
DELETE /api/questions/:questionId (author only)

User:
GET /api/users (admin only)
GET /api/users/me

---

## MISSING FUNCTIONALITY (IMPORTANT)

The backend currently DOES NOT support:

- Taking a quiz
- Submitting answers
- Calculating score
- Viewing quiz results
- Storing quiz attempts

These APIs MUST be implemented.

---

## NEW REQUIRED DOMAIN MODEL

Create a new model: Attempt (or QuizAttempt)

Attempt

- \_id: ObjectId
- user: ObjectId (ref User)
- quiz: ObjectId (ref Quiz)
- answers: [
  {
  question: ObjectId,
  selectedIndex: Number
  }
  ]
- score: Number
- totalQuestions: Number
- correctCount: Number
- createdAt: Date

---

## REQUIRED NEW API ENDPOINTS

1. Start quiz (optional but recommended)
   POST /api/quizzes/:quizId/start

- protectedRoute
- returns quiz metadata
- does NOT return correctAnswerIndex

2. Take quiz (fetch questions for user)
   GET /api/quizzes/:quizId/take

- protectedRoute
- returns:
  - quiz info
  - questions WITHOUT correctAnswerIndex

3. Submit quiz
   POST /api/quizzes/:quizId/submit

- protectedRoute
- request body:
  {
  answers: [
  { questionId, selectedIndex }
  ]
  }
- server must:
  - compare answers with correctAnswerIndex
  - calculate score
  - create Attempt document
- response:
  - score
  - correctCount
  - totalQuestions
  - attemptId

4. View quiz result
   GET /api/attempts/:attemptId

- protectedRoute
- only owner of attempt or admin can view

5. View my attempts
   GET /api/attempts/me

- protectedRoute
- returns all attempts of current user

---

## SECURITY RULES

- correctAnswerIndex MUST NEVER be sent to client when taking quiz
- Only logged-in users can take quiz
- User can only view their own attempts
- Admin can view any attempt (read-only)

---

## ARCHITECTURE NOTES

- Use separate router: routes/attemptRouter.js
- Use Mongoose populate where appropriate
- Follow REST conventions
- Use async/await
- Use proper HTTP status codes:
  - 200 OK
  - 201 Created
  - 401 Unauthorized
  - 403 Forbidden
  - 404 Not Found

---

## GOAL

Implement a complete quiz flow:
Quiz List → Take Quiz → Submit → View Result

All new code must integrate cleanly with existing middleware and authorization rules.
