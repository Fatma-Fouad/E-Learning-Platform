import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
} from "chart.js";
import { Bar, Pie, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
);

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
        console.log("Fetched engagement data:", response.data);
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

  const generatePDF = () => {
    const reportElement = document.getElementById("report"); // ID of the report container
    if (!reportElement) return;

    html2canvas(reportElement, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("EngagementReport.pdf");
    });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  const barData = {
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

  const pieData = {
    labels: ["Below Average", "Average", "Above Average", "Excellent"],
    datasets: [
      {
        label: "Performance Metrics",
        data: [
          engagementData.performanceMetrics?.below_average || 0,
          engagementData.performanceMetrics?.average || 0,
          engagementData.performanceMetrics?.above_average || 0,
          engagementData.performanceMetrics?.excellent || 0,
        ],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
      },
    ],
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
      <h1>Engagement Report</h1>
      <section style={{ margin: "20px 0" }}>
        <h2>Summary</h2>
        <p>Total Enrolled Students: {engagementData.totalEnrolledStudents}</p>
        <p>Completed Students: {engagementData.completedStudents}</p>
        <p>
          Average Completion Percentage:{" "}
          {engagementData.averageCompletionPercentage || 0}%
        </p>
        <p>Average Course Score: {engagementData.averageCourseScore || 0}</p>
      </section>

      <section style={{ margin: "20px 0" }}>
        <h2>Performance Metrics</h2>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "20px",
          }}
        >
          <thead>
            <tr>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                Category
              </th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                Count
              </th>
            </tr>
          </thead>
          <tbody>
            {engagementData.performanceMetrics && (
              <>
                <tr>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    Below Average
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {engagementData.performanceMetrics.below_average || 0}
                  </td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    Average
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {engagementData.performanceMetrics.average || 0}
                  </td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    Above Average
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {engagementData.performanceMetrics.above_average || 0}
                  </td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    Excellent
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {engagementData.performanceMetrics.excellent || 0}
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </section>

      <section style={{ display: "flex", justifyContent: "space-around" }}>
        <div style={{ maxWidth: "45%" }}>
          <h3>Engagement Metrics</h3>
          <Bar data={barData} />
        </div>
        <div style={{ maxWidth: "45%" }}>
          <h3>Performance Metrics</h3>
          <Pie data={pieData} />
        </div>
      </section>
    </div>
    </div>
  );
};

export default EngagementReport;
