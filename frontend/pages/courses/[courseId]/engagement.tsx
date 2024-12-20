import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Bar } from "react-chartjs-2";

const EngagementReport = () => {
  const { courseId } = useParams(); // Get course ID from the URL
  const [engagementData, setEngagementData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (courseId) {
      axios
        .get(`http://localhost:3000/progress/engagement/${courseId}`)
        .then((response) => {
          setEngagementData(response.data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching engagement report:", error);
          setError("Failed to load engagement report.");
          setLoading(false);
        });
    }
  }, [courseId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const data = {
    labels: ["Enrolled Students", "Completed Students"],
    datasets: [
      {
        label: "Engagement",
        data: [
          engagementData.totalEnrolledStudents,
          engagementData.completedStudents,
        ],
        backgroundColor: ["#3F51B5", "#009688"],
      },
    ],
  };

  return (
    <div>
      <h2>Engagement Report</h2>
      <Bar data={data} />
    </div>
  );
};

export default EngagementReport;
