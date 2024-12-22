import { useState } from "react";
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

  const router = useRouter();

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
    clearPreviousState(); // Clear the previous results and textboxes
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:3000/courses/course-by-creator/${searchByCreator}`
      );
      setResults(response.data.courses || []);
    } catch (err: any) {
      console.error("Error fetching courses by creator:", err.response || err.message);
      setError(err.response?.data?.message || "Failed to fetch courses by creator.");
    } finally {
      setLoading(false);
      setSearchByCreator(""); // Clear the search textbox
    }
  };

  const handleSearchByTitle = async () => {
    if (!searchByTitle.trim()) {
      setError("Please enter a course title to search.");
      return;
    }
    clearPreviousState(); // Clear the previous results and textboxes
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:3000/courses/course-by-Name/${searchByTitle}`
      );
      setResults(response.data.courses || []);
    } catch (err: any) {
      console.error("Error fetching courses by title:", err.response || err.message);
      setError(err.response?.data?.message || "Failed to fetch courses by title.");
    } finally {
      setLoading(false);
      setSearchByTitle(""); // Clear the search textbox
    }
  };

  const handleSearchByKeyword = async () => {
    if (!searchByKeyword.trim()) {
      setError("Please enter a keyword to search.");
      return;
    }
    clearPreviousState(); // Clear the previous results and textboxes
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:3000/courses/search-by-keyword?keyword=${searchByKeyword}`
      );
      setResults(response.data.courses || []);
    } catch (err: any) {
      console.error("Error fetching courses by keyword:", err.response || err.message);
      setError(err.response?.data?.message || "Failed to fetch courses by keyword.");
    } finally {
      setLoading(false);
      setSearchByKeyword(""); // Clear the search textbox
    }
  };

  const handleDeleteCourse = (courseId: string) => {
    router.push(`/courses/${courseId}/delete`);
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
                <button onClick={() => handleDeleteCourse(course.course_id)}>
                  Delete Course
                </button>
                <button>Enroll Course</button>
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
