import { useState, useEffect } from "react";
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
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Initially loading
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCourses = async () => {
      const token = localStorage.getItem("token");
      const storedUserId = localStorage.getItem("userId");

      console.log("Retrieved Token:", token);
      console.log("Retrieved User ID:", storedUserId);

      if (!token || !storedUserId) {
        setError("Unauthorized access. Redirecting to login...");
        router.push("/login");
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:3000/courses/student-courses/${storedUserId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.courses.length === 0) {
          setWarning("No courses found for this student.");
        }
        setCourses(response.data.courses || []);
      } catch (err: any) {
        console.error("Error fetching courses:", err);
        setWarning(err.response?.data?.message || "Failed to fetch courses.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [router]);

  const handleViewModules = (courseId: string) => {
    router.push(`/courses/${courseId}/modules_st`);
  };

  const handleViewProgress = (courseId: string) => {
    router.push(`/courses/${courseId}/progress`);
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  const handleHome = () => {
    router.push("/home"); // Change this to your home page route
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <h2 style={styles.logo}>E-Learning Platform</h2>
        <div style={styles.buttonContainer}>
          <button onClick={handleHome} style={styles.navButton}>
            Home
          </button>
          <button onClick={handleLogout} style={styles.navButton}>
            Logout
          </button>
        </div>
      </nav>

      <h1>My Courses</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {warning && <p style={{ color: "orange" }}>{warning}</p>}

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
              <button onClick={() => handleViewProgress(course._id)}>
                View Progress
              </button>
            </li>
          ))}
        </ul>
      ) : (
        !error && !loading && (
          <p style={{ color: "orange" }}>
            Warning: No courses are currently associated with this student.
          </p>
        )
      )}
    </div>
  );
};

const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ADD8E6", // Light blue background
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

export default MyCoursesPage;
