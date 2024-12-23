import { useEffect, useState } from "react";
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

const AllCoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    category: "",
    difficulty_level: "Beginner",
    created_by: "",
    version: 1,
    course_rating: 0,
    ratingCount: 0,
    enrolled_students: 0,
    nom_of_modules: 0,
    keywords: [] as string[],
    isAvailable: true,
    instructor_id: "",
  });

  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const router = useRouter();

  const token = localStorage.getItem("token");
  const storedUserId = localStorage.getItem("userId");
  const storedUserName = localStorage.getItem("name");

  useEffect(() => {
    if (!token || !storedUserId) {
      setError("Unauthorized access. Redirecting to login...");
      router.push("/login");
      return;
    }

    const fetchCoursesByInstructor = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          `http://localhost:3000/courses/instructor-courses/${storedUserId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.data.courses.length === 0) {
          setError("No courses found for this instructor.");
        }
        setCourses(response.data.courses || []);
      } catch (err: any) {
        console.error("Error fetching courses by instructor:", err);
        setError(err.response?.data?.message || "Failed to fetch courses. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCoursesByInstructor();
  }, [router, token, storedUserId]);

  const handleViewDetails = (courseId: string) => {
    localStorage.setItem("courseId", courseId);
    router.push(`/courses/${courseId}`);
  };

  const handleCreateCourse = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError(null);

    const payload = {
      ...newCourse,
      keywords: newCourse.keywords.filter((kw) => kw.trim() !== ""),
      isAvailable: newCourse.isAvailable,
      version: Number(newCourse.version),
      enrolled_students: Number(newCourse.enrolled_students),
      nom_of_modules: Number(newCourse.nom_of_modules || 0),
      course_rating: Number(newCourse.course_rating || 0),
      ratingCount: Number(newCourse.ratingCount || 0),
      created_by: storedUserName,
      instructor_id: storedUserId,
    };

    try {
      const response = await axios.post("http://localhost:3000/courses", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 201 || response.status === 200) {
        setCourses((prevCourses) => [...prevCourses, response.data]);
        setNewCourse({
          title: "",
          description: "",
          category: "",
          difficulty_level: "Beginner",
          created_by: "",
          version: 1,
          course_rating: 0,
          ratingCount: 0,
          enrolled_students: 0,
          nom_of_modules: 0,
          keywords: [],
          isAvailable: true,
          instructor_id: "",
        });
      } else {
        throw new Error("Unexpected server response.");
      }
    } catch (err: any) {
      console.error("Error creating course:", err.response?.data);
      setCreateError(err.response?.data?.message || "Failed to create course.");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  const handleHome = () => {
    router.push("/home");
  };

  if (loading) return <p>Loading courses...</p>;
  if (error && courses.length === 0) return <p style={{ color: "red" }}>{error}</p>;

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

      <h1>All Courses</h1>

      {courses.length > 0 ? (
        <ul>
          {courses.map((course) => (
            <li key={course._id}>
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <p>
                <strong>Category:</strong> {course.category}
              </p>
              <p>
                <strong>Difficulty Level:</strong> {course.difficulty_level}
              </p>
              <button onClick={() => handleViewDetails(course._id)}>View Details</button>
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ color: "orange" }}>Warning: This instructor currently has no courses listed.</p>
      )}

      <h2>Create a New Course</h2>
      <form onSubmit={handleCreateCourse}>
        <label>
          Title:
          <input
            type="text"
            value={newCourse.title}
            onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
            required
          />
        </label>
        <br />
        <label>
          Description:
          <textarea
            value={newCourse.description}
            onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
            required
          />
        </label>
        <br />
        <label>
          Category:
          <input
            type="text"
            value={newCourse.category}
            onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
            required
          />
        </label>
        <br />
        <label>
          Difficulty Level:
          <select
            value={newCourse.difficulty_level}
            onChange={(e) => setNewCourse({ ...newCourse, difficulty_level: e.target.value })}
            required
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </label>
        <br />
        <button type="submit" disabled={createLoading}>
          {createLoading ? "Creating..." : "Create Course"}
        </button>
      </form>
      {createError && <p style={{ color: "red" }}>{createError}</p>}
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

export default AllCoursesPage;
