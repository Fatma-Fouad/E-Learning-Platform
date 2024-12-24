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
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!courseId) return;

    const fetchContentData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:3000/progress/effectiveness/${courseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = response.data || {};
        setContentData(data);

        if (data.modules?.length === 0) {
          setMessage("No students are enrolled in this course.");
        }
      } catch (err) {
        setMessage("Failed to fetch content effectiveness report.");
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
        {message ? (
          <p style={{ color: "red", textAlign: "center", marginTop: "20px" }}>{message}</p>
        ) : (
          <>
            <p className="reportDetails">Course Rating: {contentData.courseRating || "no ratings yet"}  / 5</p>
            <p className="reportDetails">Instructor Rating: {contentData.instructorRating || "no ratings yet"}</p>

            <h2 className="reportTitle">Module Ratings</h2>
            <table border={1} style={{ width: "100%", marginBottom: "20px" }}>
              <thead>
                <tr>
                  <th>Module Name</th>
                  <th>Order</th>
                  <th>Version</th>
                  <th>Rating</th>
                </tr>
              </thead>
              <tbody>
            {(contentData?.modules || []).map((mod, index) => (
              <tr key={index}>
                <td>{mod.details?.moduleName || "Unknown"}</td>
                <td>{mod.details?.moduleOrder || "Unknown"}</td>
                <td>{mod.details?.moduleVersion || "Unknown"}</td>
                <td>{mod.details?.moduleRating || "No rating yet"}</td>
              </tr>
            ))}
          </tbody>

            </table>

           

            <div className="chartContainer">
              <div className="chart">
                <h3 className="reportTitle">Module Ratings</h3>
                <Bar
                  data={{
                    labels: (contentData?.modules || []).map(
                      (mod) => mod.details?.moduleName || "Unknown"
                    ),
                    datasets: [
                      {
                        label: "Module Ratings",
                        data: (contentData?.modules || []).map(
                          (mod) => mod.details?.moduleRating || 0
                        ),
                        backgroundColor: "rgba(75, 192, 192, 0.6)",
                      },
                    ],
                  }}
                />
              </div>
              <div className="chart">
                <h3 className="reportTitle">Valid Modules Distribution</h3>
                <Pie
                  data={{
                    labels: ["Valid Modules", "Invalid Modules"],
                    datasets: [
                      {
                        data: [
                          contentData.validModuleCount,
                          contentData.modules ? contentData.modules.length - contentData.validModuleCount : 0,
                        ],                        
                        backgroundColor: ["#4caf50", "#f44336"],
                      },
                    ],
                  }}
                />
              </div>
            </div>
          </>
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
