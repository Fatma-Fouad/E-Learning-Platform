import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

interface UpdateCourseForm {
  title: string;
  description: string;
  category: string;
  difficulty_level: string;
  keywords: string[];
}

const UpdateCoursePage = () => {
  const router = useRouter();
  const { courseId } = router.query; // Retrieve courseId from the route
  const [formData, setFormData] = useState<UpdateCourseForm | null>(null);
  const [newKeyword, setNewKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Debugging router query
    console.log("Router query:", router.query);

    // Ensure the router is ready and courseId exists
    if (!router.isReady) {
      console.log("Router not ready");
      return;
    }

    if (!courseId || typeof courseId !== "string") {
      console.log("Invalid or missing courseId:", courseId);
      setError("Invalid course ID.");
      return;
    }

    // Fetch course details
    const fetchCourseDetails = async () => {
      console.log(`Fetching course details for ID: ${courseId}`);
      setLoading(true);
      setError("");

      try {
        const response = await axios.get(
          `http://localhost:3000/courses/${courseId}`
        );
        const { title, description, category, difficulty_level, keywords } =
          response.data;
        setFormData({
          title,
          description,
          category,
          difficulty_level,
          keywords: keywords || [],
        });
        console.log("Course details fetched successfully:", response.data);
      } catch (err: any) {
        console.error("Error fetching course details:", err.response || err.message);
        setError(
          err.response?.data?.message || "Failed to fetch course details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [router.isReady, courseId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewKeyword(e.target.value);
  };

  const handleAddKeyword = () => {
    if (!newKeyword.trim()) {
      setError("Keyword cannot be empty.");
      return;
    }
    setFormData((prev) =>
      prev ? { ...prev, keywords: [...prev.keywords, newKeyword.trim()] } : null
    );
    setNewKeyword("");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!courseId || typeof courseId !== "string") {
      setError("Invalid course ID.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await axios.patch(
        `http://localhost:3000/courses/${courseId}`,
        formData
      );
      if (response.status === 200) {
        setSuccessMessage("Course updated successfully.");
      } else {
        setError("Unexpected server response.");
      }
    } catch (err: any) {
      console.error("Error updating course:", err.response || err.message);
      setError(err.response?.data?.message || "Failed to update course.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h1>Update Course</h1>

      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}

      {formData && (
        <form onSubmit={handleSubmit}>
          <label>
            Title:
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </label>
          <br />
          <label>
            Description:
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </label>
          <br />
          <label>
            Category:
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            />
          </label>
          <br />
          <label>
            Difficulty Level:
            <input
              type="text"
              name="difficulty_level"
              value={formData.difficulty_level}
              onChange={handleChange}
              required
            />
          </label>
          <br />
          <label>
            Keywords:
            <ul>
              {formData.keywords.map((keyword, index) => (
                <li key={index}>{keyword}</li>
              ))}
            </ul>
            <input
              type="text"
              value={newKeyword}
              onChange={handleKeywordChange}
            />
            <button type="button" onClick={handleAddKeyword}>
              Add Keyword
            </button>
          </label>
          <br />
          <button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Course"}
          </button>
        </form>
      )}
    </div>
  );
};

export default UpdateCoursePage;
