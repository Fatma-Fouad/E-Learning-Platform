# Progress Management API

This project is a **NestJS** application designed to manage and generate reports for students' progress in various courses. The API provides insights into student engagement, course content effectiveness, quiz performance, and more.

---

## What is Progress?

The term "progress" refers to the status of a student's journey in completing a course. It tracks several key metrics, including:

- **Completion Percentage**: The percentage of the course completed by the student.
- **Quizzes Taken**: The number of quizzes attempted.
- **Last Quiz Score**: The score achieved in the most recent quiz.
- **Average Score**: The student's average score across all quizzes.
- **Course ID**: The unique identifier of the course the student is enrolled in.

Progress is stored in the database with the following schema:
```json
{
  "progress_id": "ObjectId",
  "user_id": "ObjectId",
  "course_id": "ObjectId",
  "completed_modules": 5,
  "completion_percentage": 75,
  "quizzes_taken": 3,
  "last_quiz_score": 85,
  "avg_score": 80
}
