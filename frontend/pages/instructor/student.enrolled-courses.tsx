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
  const [loading, setLoading] = useState<boolean>(false); // Initially loading
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>(''); // State to store user ID
  const router = useRouter();

  useEffect(() => {
    if (!userId) return; // Do not fetch courses if userId is not provided

    const fetchCourses = async () => {
      setLoading(true);
      setError(null); // Reset error on each request

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Unauthorized access. Please login.");
          router.push("/login");
          return;
        }

        const response = await axios.get(
          `http://localhost:3000/courses/student-courses/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setCourses(response.data.courses || []);
      } catch (err: any) {
        console.error("Error fetching courses:", err);
        setError(err.response?.data?.message || "Failed to fetch courses.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [userId, router]); // Fetch courses whenever the userId changes

  const handleViewModules = (courseId: string) => {
    router.push(`/courses/${courseId}/modules_st`);
  };

  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserId(e.target.value); // Update userId state when input changes
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h1>student Courses</h1>

      {/* Input field to enter userId */}
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="userId">Enter User ID:</label>
        <input
          type="text"
          id="userId"
          value={userId}
          onChange={handleUserIdChange}
          placeholder="Enter the student ID"
          style={{ padding: '10px', width: '100%', marginTop: '5px' }}
        />
      </div>

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
        <p>No courses found for this student.</p>
      )}
    </div>
  );
};

export default MyCoursesPage;
