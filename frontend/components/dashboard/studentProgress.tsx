import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import CompletionChart from "./completionChart";
import QuizPerformanceChart from "./quizPerformance";
import { ProgressData } from "../../pages/courses/[courseId]/types";

const StudentProgressDashboard: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [studentId, setStudentId] = useState<string>("");
  const [progressData, setProgressData] = useState<ProgressData | null>(null);

  const fetchProgressData = () => {
    axios
      .get(`/progress/${studentId}`)
      .then((response) => setProgressData(response.data))
      .catch((error) => console.error("Error fetching progress data:", error));
  };

  if (!progressData) {
    return (
      <div>
        <h1>Enter Student ID</h1>
        <input
          type="text"
          placeholder="Enter Student ID"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
        />
        <button onClick={fetchProgressData}>Fetch Data</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Welcome, {progressData.studentName}</h1>
      <h2>GPA: {progressData.gpa}</h2>
      {progressData.courses.map((course) => (
        <div key={course.courseId}>
          <h3>{course.courseName}</h3>
          <CompletionChart
            completionPercentage={course.progress.completionPercentage}
          />
          <QuizPerformanceChart quizGrades={course.quizGrades} />
          <p>Average Course Score: {course.averageCourseScore}</p>
          <p>Performance: {course.performanceMetric}</p>
        </div>
      ))}
    </div>
  );
};

export default StudentProgressDashboard;
