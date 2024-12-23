import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";

interface Course {
  course_id: string;
  title: string;
  description: string;
  category: string;
  difficulty_level: string;
  created_by: string;
}

const FindCoursePage = () => {
  const [searchByCreator, setSearchByCreator] = useState<string>("");
  const [searchByTitle, setSearchByTitle] = useState<string>("");
  const [searchByKeyword, setSearchByKeyword] = useState<string>("");
  const [results, setResults] = useState<Course[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string>("guest");
  const [token, setToken] = useState<string | null>(null); // Add token state

  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = JSON.parse(localStorage.getItem("userData") || "{}") || { role: "guest" };
      const storedToken = localStorage.getItem("token");
      setUserRole(user.role);
      setToken(storedToken); // Save token from localStorage to state
      console.log("User object:", user);
      console.log("Retrieved Token:", storedToken);

      if (!storedToken) {
        setError("Unauthorized access. Redirecting to login...");
        router.push("/login");
      }
    }
  }, [router]);

  const clearPreviousState = () => {
    setResults([]);
    setError(null);
    setSearchByCreator("");
    setSearchByTitle("");
    setSearchByKeyword("");
  };

  const handleSearchByCreator = async () => {
    if (!searchByCreator.trim()) {
      setError("Please enter a creator name to search.");
      return;
    }
    clearPreviousState();
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:3000/courses/course-by-creator/${searchByCreator}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setResults(response.data.courses || []);
    } catch (err: any) {
      console.error("Error fetching courses by creator:", err.response || err.message);
      setError(err.response?.data?.message || "Failed to fetch courses by creator.");
    } finally {
      setLoading(false);
      setSearchByCreator("");
    }
  };

  const handleSearchByTitle = async () => {
    if (!searchByTitle.trim()) {
      setError("Please enter a course title to search.");
      return;
    }
    clearPreviousState();
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:3000/courses/course-by-Name/${searchByTitle}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setResults(response.data.courses || []);
    } catch (err: any) {
      console.error("Error fetching courses by title:", err.response || err.message);
      setError(err.response?.data?.message || "Failed to fetch courses by title.");
    } finally {
      setLoading(false);
      setSearchByTitle("");
    }
  };

  const handleSearchByKeyword = async () => {
    if (!searchByKeyword.trim()) {
      setError("Please enter a keyword to search.");
      return;
    }
    clearPreviousState();
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:3000/courses/search-by-keyword?keyword=${searchByKeyword}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setResults(response.data.courses || []);
    } catch (err: any) {
      console.error("Error fetching courses by keyword:", err.response || err.message);
      setError(err.response?.data?.message || "Failed to fetch courses by keyword.");
    } finally {
      setLoading(false);
      setSearchByKeyword("");
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (userRole === "instructor" || userRole === "admin") {
      try {
        console.log("Attempting to delete course:", courseId); // Debugging
        const response = await axios.delete(
          `http://localhost:3000/courses/delete-course/${courseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Optional: remove if not needed
            },
          }
        );
        if (response.status === 200) {
          alert("Course deleted successfully.");
          router.reload(); // Reload the page to refresh results
        } else {
          console.error("Unexpected response status:", response.status); // Debugging
          alert("Failed to delete the course. Please try again.");
        }
      } catch (err: any) {
        console.error("Error deleting course:", err.response || err.message);
        if (err.response) {
          alert(`Error: ${err.response.status} - ${err.response.data.message}`);
        } else {
          alert("An unknown error occurred while deleting the course.");
        }
      }
    } else {
      console.error("Only instructors or admins can delete courses.");
      alert("You are not authorized to delete this course.");
    }
  };
  

  const handleEnrollCourse = (courseId: string) => {
    if (userRole === "student") {
      console.log(`Student enrolled in course: ${courseId}`);
    } else {
      console.error("Only students can enroll in courses.");
    }
  };

  return (
    <div>
      <h1>Find a Course</h1>

      {/* Search by Creator */}
      <div>
        <h2>Search by Creator</h2>
        <input
          type="text"
          placeholder="Enter creator name"
          value={searchByCreator}
          onChange={(e) => setSearchByCreator(e.target.value)}
        />
        <button onClick={handleSearchByCreator} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {/* Search by Title */}
      <div>
        <h2>Search by Title</h2>
        <input
          type="text"
          placeholder="Enter course title"
          value={searchByTitle}
          onChange={(e) => setSearchByTitle(e.target.value)}
        />
        <button onClick={handleSearchByTitle} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {/* Search by Keyword */}
      <div>
        <h2>Search by Keyword</h2>
        <input
          type="text"
          placeholder="Enter keyword"
          value={searchByKeyword}
          onChange={(e) => setSearchByKeyword(e.target.value)}
        />
        <button onClick={handleSearchByKeyword} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {/* Display Results */}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {results.length > 0 ? (
        <div>
          <h2>Search Results</h2>
          <ul>
            {results.map((course) => (
              <li key={course.course_id}>
                <h3>{course.title}</h3>
                <p>{course.description}</p>
                <p>
                  <strong>Category:</strong> {course.category}
                </p>
                <p>
                  <strong>Difficulty Level:</strong> {course.difficulty_level}
                </p>
                <p>
                  <strong>Created By:</strong> {course.created_by}
                </p>
                {/* Buttons based on user role */}
                {(userRole === "instructor" || userRole === "admin") && (
                  <button onClick={() => handleDeleteCourse(course.course_id)}>
                    Delete Course
                  </button>
                )}
                {userRole === "student" && (
                  <button onClick={() => handleEnrollCourse(course.course_id)}>
                    Enroll Course
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        !loading && <p>No results found.</p>
      )}
    </div>
  );
};

export default FindCoursePage;
