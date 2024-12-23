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

  if (loading) return <p>Deleting course...</p>;

  return (
    <div>
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

export default DeleteCoursePage;
