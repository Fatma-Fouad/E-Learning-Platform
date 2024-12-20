import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const EngagementReport = () => {
  const router = useRouter();
  const { courseId } = router.query;
  const [engagementData, setEngagementData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!courseId) return;

    const fetchEngagementData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          `http://localhost:3000/progress/engagement/${courseId}`
        );
        console.log("Fetched engagement data:", response.data); // Debug response
        setEngagementData(response.data || {});
      } catch (err) {
        console.error("Error fetching engagement report:", err);
        setError("Failed to fetch engagement report.");
      } finally {
        setLoading(false);
      }
    };

    fetchEngagementData();
  }, [courseId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  const data = {
    labels: ["Enrolled Students", "Completed Students"],
    datasets: [
      {
        label: "Engagement Metrics",
        data: [
          engagementData.totalEnrolledStudents || 0,
          engagementData.completedStudents || 0,
        ],
        backgroundColor: ["#3F51B5", "#009688"],
      },
    ],
  };

  return (
    <div>
      <h1>Engagement Report</h1>
      <p>Total Enrolled Students: {engagementData.totalEnrolledStudents}</p>
      <p>Completed Students: {engagementData.completedStudents}</p>
      <p>
        Average Completion Percentage:{" "}
        {engagementData.averageCompletionPercentage || 0}%
      </p>
      <p>Average Course Score: {engagementData.averageCourseScore || 0}</p>

      <div>
        <h2>Performance Metrics</h2>
        {Array.isArray(engagementData.performanceMetrics) ? (
          <ul>
            {engagementData.performanceMetrics.map((metric, index) => (
              <li key={index}>
                {metric.category}: {metric.count}
              </li>
            ))}
          </ul>
        ) : (
          <p>No performance metrics available.</p>
        )}
      </div>

      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        <Bar data={data} />
      </div>
    </div>
  );
};

export default EngagementReport;
