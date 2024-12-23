import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

const DeleteCoursePage = () => {
  const router = useRouter();
  const { courseId } = router.query; // Retrieve courseId from the URL
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (!courseId) {
      setError("Invalid course ID.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await axios.delete(
        `http://localhost:3000/courses/delete-course/${courseId}`
      );

      if (response.status === 200) {
        setSuccessMessage("Course deleted successfully.");
        setTimeout(() => {
          router.push("/courses/MyCourses_in"); // Explicitly redirect to MyCourses_in.tsx
        }, 2000); // Redirect after 2 seconds
      } else {
        setError("Unexpected response from the server.");
      }
    } catch (err: any) {
      console.error("Error deleting course:", err.response || err.message);
      setError(err.response?.data?.message || "Failed to delete course. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!courseId) {
      setError("Course ID is required.");
    }
  }, [courseId]);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  const handleHome = () => {
    router.push("/home");
  };

  const handleMyCourses = () => {
    router.push("/courses/MyCourses_in");
  };

  if (loading) return <p>Deleting course...</p>;

  return (
    <div>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <h2 style={styles.logo}>E-Learning Platform</h2>
        <div style={styles.buttonContainer}>
          <button onClick={handleHome} style={styles.navButton}>
            Home
          </button>
          <button onClick={handleMyCourses} style={styles.navButton}>
            My Courses
          </button>
          <button onClick={handleLogout} style={styles.navButton}>
            Logout
          </button>
        </div>
      </nav>

      <h1>Delete Course</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
      <p>Are you sure you want to delete this course?</p>
      <button onClick={handleDelete} disabled={loading}>
        {loading ? "Deleting..." : "Confirm Delete"}
      </button>
      <button onClick={() => router.push("/courses/MyCourses_in")} disabled={loading}>
        Cancel
      </button>
    </div>
  );
};

const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ADD8E6",
    padding: "10px 20px",
    borderBottom: "2px solid #ccc",
  },
  logo: {
    color: "#000",
    fontSize: "24px",
    fontWeight: "bold",
  },
  buttonContainer: {
    display: "flex",
    gap: "10px",
  },
  navButton: {
    backgroundColor: "#000",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    padding: "8px 15px",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
};

export default DeleteCoursePage;
