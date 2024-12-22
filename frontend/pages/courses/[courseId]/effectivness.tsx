import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const ContentEffectivenessReport = () => {
  const router = useRouter();
  const { courseId } = router.query;
  const [contentData, setContentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!courseId) return;

    const fetchContentData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/progress/effectiveness/${courseId}`
        );
        setContentData(response.data || {});
      } catch (err) {
        setError("Failed to fetch content effectiveness report.");
      } finally {
        setLoading(false);
      }
    };

    fetchContentData();
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
      pdf.save("ContentEffectivenessReport.pdf");
    });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  const moduleTitles = contentData.modules.map((mod) => mod.details.moduleName);
  const moduleRatings = contentData.modules.map((mod) => mod.details.moduleRating);
  const performanceMetrics = contentData.modules.reduce((acc, mod) => {
    acc[mod.details.performanceMetric] =
      (acc[mod.details.performanceMetric] || 0) + 1;
    return acc;
  }, {});

  const performanceLabels = Object.keys(performanceMetrics);
  const performanceCounts = Object.values(performanceMetrics);

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
      
      <div id="report"> {/* Wrapping the report content for PDF generation */}
        <h1>Content Effectiveness Report</h1>
        <p>Course Rating: {contentData.courseRating}</p>
        <p>Instructor Rating: {contentData.instructorRating}</p>

        <h2>Module Details</h2>
        <table border={1} style={{ width: "100%", marginBottom: "20px" }}>
          <thead>
            <tr>
              <th>Module Name</th>
              <th>Order</th>
              <th>Rating</th>
              <th>Performance</th>
            </tr>
          </thead>
          <tbody>
            {contentData.modules.map((mod, index) => (
              <tr key={index}>
                <td>{mod.details.moduleName}</td>
                <td>{mod.details.moduleOrder}</td>
                <td>{mod.details.moduleRating}</td>
                <td>{mod.details.performanceMetric}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: "flex", justifyContent: "space-around" }}>
          <div style={{ width: "45%" }}>
            <h3>Module Ratings</h3>
            <Bar
              data={{
                labels: moduleTitles,
                datasets: [
                  {
                    label: "Module Ratings",
                    data: moduleRatings,
                    backgroundColor: "rgba(75, 192, 192, 0.6)",
                  },
                ],
              }}
            />
          </div>
          <div style={{ width: "45%" }}>
            <h3>Performance Metrics Distribution</h3>
            <Pie
              data={{
                labels: performanceLabels,
                datasets: [
                  {
                    data: performanceCounts,
                    backgroundColor: ["#FFD700", "#FF8C00", "#DA70D6", "#9370DB"],
                  },
                ],
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentEffectivenessReport;
