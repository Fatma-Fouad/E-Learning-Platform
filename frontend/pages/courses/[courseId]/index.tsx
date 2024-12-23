import { useEffect, useState } from "react";
import React from 'react';
import { useRouter } from "next/router";
import axios from "axios";

const CoursePage = () => {
  const router = useRouter();
  const { courseId } = router.query;
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!courseId) return;

    const fetchCourse = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`http://localhost:3000/courses/${courseId}`);
        setCourseData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch course data.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

   // Handle Update
   const Update = () => {
    const courseId = localStorage.getItem("courseId");
    if (courseId) {
      router.push(`/courses/${courseId}/update`);
    } else {
      alert("Course ID not found!");
    }
  };

  // Handle Delete
  const Delete = () => {
    const courseId = localStorage.getItem("courseId");
    if (courseId) {
      router.push(`/courses/${courseId}/delete`);
    } else {
      alert("Course ID not found!");
    }
  };
  
  
  return (
    <div style={styles.page}>

      <div style={styles.header}>
        <h1 style={styles.title}>{courseData?.title || "Course Page"}</h1>
        <p style={styles.subtitle}>Instructor: {courseData?.instructor_name || "Unknown"}</p>
        <p style={styles.subtitle}>Total Modules: {courseData?.nom_of_modules || 0}</p>
        <p style={styles.subtitle}>Enrolled Students: {courseData?.enrolled_students || 0}</p>
      </div>

      <div style={styles.buttonContainer}>
        <div style={styles.buttonGroup}>
          <button style={styles.button} onClick={() => router.push(`/courses/${courseId}/engagement`)}>
            Engagement Report
          </button>
          <button style={styles.button} onClick={() => router.push(`/courses/${courseId}/effectivness`)}>
            Content Effectiveness Report
          </button>
          <button style={styles.button} onClick={() => router.push(`/courses/${courseId}/results`)}>
            Quiz Results Report
          </button>
          <button style={styles.button} onClick={() => router.push(`/courses/${courseId}/modules`)}>
            Manage Modules
          </button>
          <button style={styles.button} onClick={Update}>
            Update Course
          </button>
          <button style={styles.button} onClick={Delete}>
            Delete Course
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    backgroundColor: "#f1f5f8", // Soft pastel background color
    padding: "30px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    maxWidth: "1100px",
    margin: "0 auto",
    borderRadius: "12px",
    boxShadow: "0 6px 15px rgba(0, 0, 0, 0.1)",
  },
  header: {
    textAlign: "center" as "center",
    marginBottom: "40px",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    color: "#4a4a4a",
  },
  subtitle: {
    fontSize: "1.1rem",
    color: "#6b6b6b",
    margin: "8px 0",
  },
  buttonContainer: {
    textAlign: "center" as "center",
  },
  sectionTitle: {
    fontSize: "1.7rem",
    fontWeight: "600",
    marginBottom: "25px",
    color: "#4a4a4a",
  },
  buttonGroup: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "20px",
    justifyItems: "center",
    width: "100%",
    maxWidth: "850px",
    margin: "0 auto",
  },
  button: {
    padding: "15px 25px",
    fontSize: "1.1rem",
    backgroundColor: "#9fcdff", // Light pastel blue
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
};

export default CoursePage;
