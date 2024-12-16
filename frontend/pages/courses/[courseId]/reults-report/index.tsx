import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { Course } from "../types";

interface QuizResult {
  quizNumber: number;
  participants: number;
  details: {
    userId: string;
    userName: string;
    grade: number | string;
  }[];
}

interface QuizResultsData {
  quizzesDetails: QuizResult[];
}

const QuizResultsReportPage = () => {
  const router = useRouter();
  const { courseId } = router.query; // Retrieve courseId from the URL
  const [quizResultsData, setQuizResultsData] = useState<QuizResultsData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Fetch quiz results report for the course
  useEffect(() => {
    const fetchQuizResults = async () => {
      if (!courseId) return;

      setLoading(true);
      setError("");

      try {
        const response = await axios.get(
          `http://localhost:3000/progress/quiz-results/${courseId}`
        );
        setQuizResultsData(response.data);
      } catch (err) {
        console.error("Error fetching quiz results report:", err);
        setError("Failed to fetch quiz results report. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizResults();
  }, [courseId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Quiz Results Report</h1>

      {quizResultsData && (
        <div>
          {quizResultsData.quizzesDetails.map((quiz) => (
            <div key={quiz.quizNumber}>
              <h2>Quiz {quiz.quizNumber}</h2>
              <p>Participants: {quiz.participants}</p>
              <ul>
                {quiz.details.map((student) => (
                  <li key={student.userId}>
                    {student.userName} (ID: {student.userId}): {student.grade}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizResultsReportPage;
