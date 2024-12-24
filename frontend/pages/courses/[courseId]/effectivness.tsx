import { useEffect, useState } from "react";
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
        const token = localStorage.getItem("token"); // Retrieve token from localStorage
        const response = await axios.get(
          `http://localhost:3000/progress/effectiveness/${courseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Include the token in the Authorization header
            },
          }
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
    const reportElement = document.getElementById("report");
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

  const hasValidModules =
    contentData.modules &&
    contentData.modules.length > 0 &&
    !contentData.modules.some((mod) => mod.title === "No modules available for this course.");

  return (
    <div className="reportContainer">
      <button
        style={{
          marginBottom: "20px",
          padding: "10px 20px",
          backgroundColor: "#9fcdff",
          color: "black",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
        onClick={generatePDF}
      >
        Download as PDF
      </button>
      <button
        style={{
          marginBottom: "20px",
          padding: "10px 20px",
          backgroundColor: "#9fcdff",
          color: "black",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
        onClick={() => router.push(`/courses/${courseId}`)}
      >
        Return to Course
      </button>

      <div id="report">
        <h1 className="reportTitle">Content Effectiveness Report</h1>
        <p className="reportDetails">Course Rating: {contentData.courseRating} / 5</p>
        <p className="reportDetails">Instructor Rating: {contentData.instructorRating}</p>

        {hasValidModules ? (
          <>
            <h2 className="reportTitle">Module Ratings</h2>
            <table border={1} style={{ width: "100%", marginBottom: "20px" }}>
              <thead>
                <tr>
                  <th>Module Name</th>
                  <th>Order</th>
                  <th>Version</th>
                  <th>Rating</th>
                  <th>Performance</th>
                </tr>
              </thead>
              <tbody>
                {contentData.modules.map((mod, index) => (
                  <tr key={index}>
                    <td>{mod.details?.moduleName || "Unknown"}</td>
                    <td>{mod.details?.moduleOrder || "Unknown"}</td>
                    <td>{mod.details?.moduleVersion || "Unknown"}</td>
                    <td>{mod.details?.moduleRating || "No rating yet"}</td>
                    <td>{mod.details?.performanceMetric || "Unknown"}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="chartContainer">
              <div className="chart">
                <h3 className="reportTitle">Module Ratings</h3>
                <Bar
                  data={{
                    labels: contentData.modules.map(
                      (mod) => mod.details?.moduleName || "Unknown"
                    ),
                    datasets: [
                      {
                        label: "Module Ratings",
                        data: contentData.modules.map(
                          (mod) => mod.details?.moduleRating || 0
                        ),
                        backgroundColor: "rgba(75, 192, 192, 0.6)",
                      },
                    ],
                  }}
                />
              </div>
              <div className="chart">
                <h3 className="reportTitle">Performance Metrics Distribution</h3>
                <Pie
                  data={{
                    labels: Object.keys(
                      contentData.modules.reduce((acc, mod) => {
                        const metric = mod.details?.performanceMetric || "Unknown";
                        acc[metric] = (acc[metric] || 0) + 1;
                        return acc;
                      }, {})
                    ),
                    datasets: [
                      {
                        data: Object.values(
                          contentData.modules.reduce((acc, mod) => {
                            const metric = mod.details?.performanceMetric || "Unknown";
                            acc[metric] = (acc[metric] || 0) + 1;
                            return acc;
                          }, {})
                        ),
                        backgroundColor: ["#FFD700", "#FF8C00", "#DA70D6", "#9370DB"],
                      },
                    ],
                  }}
                />
              </div>
            </div>
          </>
        ) : (
          <p style={{ color: "red", textAlign: "center", marginTop: "20px" }}>
            No modules available for this course.
          </p>
        )}
      </div>

      <style jsx>{`
        .reportContainer {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
          text-align: center;
          background-color: #f9f9f9;
          min-height: 100vh;
        }

        .reportTitle {
          font-size: 2rem;
          font-weight: bold;
          color: #333;
          margin-bottom: 10px;
        }

        .reportDetails {
          font-size: 1.2rem;
          color: #555;
          margin: 5px 0;
        }

        .chartContainer {
          display: flex;
          justify-content: space-around;
          width: 100%;
          max-width: 1200px;
          margin-top: 30px;
          flex-wrap: wrap;
        }

        .chart {
          flex: 1;
          min-width: 300px;
          max-width: 500px;
          margin: 20px;
          padding: 20px;
          border: 2px solid #ddd;
          border-radius: 10px;
          background-color: white;
        }
      `}</style>
    </div>
  );
};

export default ContentEffectivenessReport;
