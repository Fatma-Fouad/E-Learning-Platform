import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

interface Course {
  _id: string;
  title: string;
  description: string;
  category: string;
  difficulty_level: string;
  isAvailable: boolean;
}

const MyCoursesPage = () => {
  const [studentId, setStudentId] = useState<string>("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const handleFetchCourses = async () => {
    if (!studentId.trim()) {
      setError("Please enter a valid student ID.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `http://localhost:3000/courses/student-courses/${studentId}`
      );
      setCourses(response.data.courses || []);
    } catch (err: any) {
      console.error("Error fetching courses:", err);
      setError(err.response?.data?.message || "Failed to fetch courses.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewModules = (courseId: string) => {
    router.push(`/courses/${courseId}/modules`);
  };

  return (
    <div>
      <h1>My Courses</h1>
      <div>
        <label htmlFor="studentIdInput">
          Student ID:
          <input
            id="studentIdInput"
            type="text"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder="Enter your Student ID"
          />
        </label>
        <button onClick={handleFetchCourses} disabled={loading}>
          {loading ? "Fetching..." : "Fetch Courses"}
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {courses.length > 0 ? (
        <ul>
          {courses.map((course) => (
            <li key={course._id}>
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <p>
                <strong>Category:</strong> {course.category}
              </p>
              <button onClick={() => handleViewModules(course._id)}>
                View Modules
              </button>
            </li>
          ))}
        </ul>
      ) : (
        !loading && <p>No courses found for this student.</p>
      )}
    </div>
  );
};

export default MyCoursesPage;
