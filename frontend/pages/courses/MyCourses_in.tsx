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
    difficulty_level: "Beginner", // Default value for dropdown
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
  const storedUserId = localStorage.getItem("userId"); // Fetch user ID from local storage

  useEffect(() => {
    if (!token || !storedUserId) {
      setError("Unauthorized access. Redirecting to login...");
      router.push("/login");
      return;
    }
    console.log("Retrieved Token:", token);
    console.log("Retrieved User ID:", storedUserId);

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
      created_by: storedUserId, // Use user ID from local storage
      instructor_id: storedUserId, // Use user ID from local storage
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
          difficulty_level: "Beginner", // Reset to default
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

  if (loading) return <p>Loading courses...</p>;
  if (error && courses.length === 0) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h1>All Courses for: ${instructorId}</h1>

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

export default AllCoursesPage;
