import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";


ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement);

const QuizResultsReport = () => {
  const router = useRouter();
  const { courseId } = router.query;
  const [quizResults, setQuizResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!courseId) return;

    const fetchQuizResults = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/progress/quiz-results/${courseId}`
        );
        setQuizResults(response.data.quizzesDetails || []);
      } catch (err) {
        console.error("Error fetching quiz results:", err);
        setError("Failed to fetch quiz results.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizResults();
  }, [courseId]);

  const generatePDF = () => {
    const reportElement = document.getElementById("report"); // ID of the report container
    if (!reportElement) return;

    html2canvas(reportElement, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("QuizResultsReport.pdf");
    });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  // Prepare data for Bar Chart and Pie Chart
  const quizNumbers = quizResults.map((quiz) => `Quiz ${quiz.quizNumber}`);
  const participants = quizResults.map((quiz) => {
    // Filter out students who have not attempted the current quiz (i.e., no grade for this quiz)
    return quiz.details.filter((student) => student.grade !== null && student.grade !== "Not Attempted").length;
  });

  const barChartData = {
    labels: quizNumbers,
    datasets: [
      {
        label: "Participants",
        data: participants,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  const performanceData = (quiz) => {
    const total = quiz.details.length;
    // Filter out "Not Attempted" students before calculating passed and failed
    const passed = quiz.details.filter(
      (student) => student.grade !== null && student.grade !== "Not Attempted" && student.grade >= 50
    ).length;
    const failed = quiz.details.filter(
      (student) => student.grade !== null && student.grade !== "Not Attempted" && student.grade < 50
    ).length;

    return {
      labels: ["Passed", "Failed"],
      datasets: [
        {
          data: [passed, failed],
          backgroundColor: ["#4CAF50", "#FF6347"], // Green for passed, Red for failed
        },
      ],
    };
  };

  return (
    <div>
      <button style={{
          display: "block",
          margin: "10px auto 20px auto",
          padding: "10px 20px",
          backgroundColor: "#9fcdff", // Light pastel blue
          color: "black",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }} onClick={generatePDF}>
        Download as PDF
      </button>
      <button style={{
          display: "block",
          margin: "10px auto 20px auto",
          padding: "10px 20px",
          backgroundColor: "#9fcdff", // Light pastel blue
          color: "black",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }} onClick={() => router.push(`/courses/${courseId}`)}>
        Return to Course
      </button>

    <div id="report" style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Quiz Results Report</h1>
      <div style={{ marginBottom: "20px" }}>
        <h2>Participants per Quiz</h2>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <Bar data={barChartData} />
        </div>
      </div>

      <div>
        <h2>Details of Each Quiz</h2>
        {quizResults.map((quiz) => (
          <div key={quiz.quizNumber} style={{ marginBottom: "20px" }}>
            <h3>Quiz {quiz.quizNumber}</h3>
            <p>Participants: {quiz.details.filter((student) => student.grade !== null && student.grade !== "Not Attempted").length}</p>

            <div style={{ width: "300px", margin: "0 auto" }}>
              <Pie data={performanceData(quiz)} />
            </div>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                margin: "10px 0",
              }}
            >
              <thead>
                <tr>
                  <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                    Student Name
                  </th>
                  <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                    Grade
                  </th>
                </tr>
              </thead>
              <tbody>
                {quiz.details
                  .filter((student) => student.grade !== null && student.grade !== "Not Attempted") // Exclude "Not Attempted"
                  .map((student, index) => (
                    <tr key={index}>
                      <td
                        style={{
                          border: "1px solid #ddd",
                          padding: "8px",
                          textAlign: "center",
                        }}
                      >
                        {student.userName}
                      </td>
                      <td
                        style={{
                          border: "1px solid #ddd",
                          padding: "8px",
                          textAlign: "center",
                        }}
                      >
                        {student.grade !== null ? student.grade : "Not Attempted"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
};

export default QuizResultsReport;
