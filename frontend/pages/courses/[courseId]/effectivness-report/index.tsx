import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Scatter } from "react-chartjs-2";

const EffectivenessReport = () => {
  const { courseId } = useParams(); // Get course ID from the URL
  const [effectivenessData, setEffectivenessData] = useState(null);

  useEffect(() => {
    axios
      .get(`/progress/effectiveness/${courseId}`)
      .then((response) => setEffectivenessData(response.data))
      .catch((error) => console.error("Error fetching effectiveness report:", error));
  }, [courseId]);

  if (!effectivenessData) return <div>Loading...</div>;

  const data = {
    datasets: [
      {
        label: "Module Ratings",
        data: effectivenessData.modules.map((module) => ({
          x: module.details.moduleOrder,
          y: module.details.moduleRating,
        })),
        backgroundColor: "#4CAF50",
      },
    ],
  };

  return (
    <div>
      <h2>Content Effectiveness Report</h2>
      <Scatter data={data} />
    </div>
  );
};

export default EffectivenessReport;
