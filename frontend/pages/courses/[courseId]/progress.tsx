import React, { useEffect, useState } from 'react';
import { useRouter } from "next/router";
import axios from 'axios';
import { Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from 'chart.js';

import styles from '../../../styles/StudentCourseReport.module.css';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);

interface StudentReport {
  studentName: string;
  course: {
    courseName: string;
    progress: {
      completionPercentage: number;
      quizzesTaken: number;
      lastQuizScore: number;
      avgScore: number;

    };
    quizGrades: { quizNumber: number; grade: string | number }[];
    performanceMetric: string;
  };
}

const StudentCourseReport: React.FC = () => {
  const router = useRouter();
  const { courseId } = router.query;
  const [report, setReport] = useState<StudentReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUserId = localStorage.getItem('userId');

        if (!storedUserId) throw new Error('User ID not found in local storage');

        const response = await axios.get(`http://localhost:3000/progress/student-report/${storedUserId}/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReport(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch the report');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [courseId]);

  if (loading) return <div className={styles.message}>Loading...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;
  if (!report) return <div className={styles.message}>No data available.</div>;

  const completionData = {
    labels: ['Completed', 'Remaining'],
    datasets: [
      {
        data: [
          report.course.progress.completionPercentage,
          100 - report.course.progress.completionPercentage,
        ],
        backgroundColor: ['#4CAF50', '#FFC107'],
        hoverBackgroundColor: ['#45A049', '#FFB300'],
      },
    ],
  };

  const quizGradesFiltered = report.course.quizGrades.filter(
    (q) => typeof q.grade === 'number'
  );

  const quizGradesData = quizGradesFiltered.map((q) => q.grade);

  const lineChartData = {
    labels: quizGradesFiltered.map((q) => `Quiz ${q.quizNumber}`),
    datasets: [
      {
        label: 'Quiz Grades',
        data: quizGradesData,
        borderColor: '#42A5F5',
        backgroundColor: '#90CAF9',
        fill: false,
        tension: 0.1,
      },
    ],
  };

  const lineChartOptions = {
    scales: {
      y: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 10,
        },
      },
    },
  };

  return (
    <div className={styles.reportContainer}>
      <button
        style={{
          display: "block",
          margin: "10px auto 20px auto",
          padding: "10px 20px",
          backgroundColor: "#9fcdff",
          color: "black",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontSize: "1rem",
        }}
        onClick={() => router.push(`/courses/MyCourses_st`)}
      >
        Return to Course
      </button>
      <h1 className={styles.reportTitle}>Your Dashboard for {report.course.courseName}</h1>
      <p className={styles.reportDetails}>Average Score in the Subject: {report.course.progress.avgScore}</p>
      <p className={styles.reportDetails}>Quizzes Taken: {report.course.progress.quizzesTaken}</p>
      <p className={styles.reportDetails}>Last Quiz's Score: {report.course.progress.lastQuizScore}</p>
      <p className={styles.reportDetails}>Overall Performance: {report.course.performanceMetric || 'No performance data available'}</p>

      <div className={styles.chartContainer}>
        <div className={styles.chart}>
          <h2>Completion Percentage</h2>
          <Pie data={completionData} />
        </div>

        <div className={styles.chart}>
          <h2>Quiz Grades Over Time</h2>
          <Line data={lineChartData} options={lineChartOptions} />
          <ul className={styles.quizGradesList}>
            {quizGradesFiltered.map((quiz) => (
              <li key={quiz.quizNumber}>
                Quiz {quiz.quizNumber}: {quiz.grade}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StudentCourseReport;
