import React from "react";
import { Bar } from "react-chartjs-2";

const QuizPerformanceChart = ({ quizGrades }) => {
  const data = {
    labels: quizGrades.map((_, index) => `Quiz ${index + 1}`),
    datasets: [
      {
        label: "Quiz Grades",
        data: quizGrades.map((q) => (q.grade !== "Not Attempted" ? q.grade : 0)),
        backgroundColor: "#2196F3",
      },
    ],
  };

  return (
    <div>
      <h4>Quiz Performance</h4>
      <Bar data={data} />
    </div>
  );
};

export default QuizPerformanceChart;
