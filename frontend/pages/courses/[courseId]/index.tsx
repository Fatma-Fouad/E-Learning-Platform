import { useEffect, useState } from "react";
import React from 'react';
import { useRouter } from "next/router";
import axios from "axios";

const CoursePage = () => {
  const router = useRouter();
  const { courseId } = router.query; // Extract courseId from the route
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true); // Ensure loading starts as true
  const [error, setError] = useState(null);

  
  useEffect(() => {

    if (!courseId) return; // Avoid running if courseId is undefined

    const fetchCourse = async () => {
      if (!courseId) {
        setLoading(false);
        return; // Exit early if courseId is not provided
      }

      setLoading(true); // Reset loading to true before fetching
      setError(null); // Clear previous errors

      try {
        const response = await axios.get(
          `http://localhost:3000/courses/${courseId}`
        );
        console.log("Fetched course data:", response.data); // Debug API response
        setCourseData(response.data); // Update state with the fetched data
      } catch (err) {
        console.error("Error fetching course:", err);
        setError(
          err.response?.data?.message || "Failed to fetch course data."
        );
      } finally {
        setLoading(false); // Ensure loading is set to false
      }
    };

    fetchCourse();
  }, [courseId]); // Re-run effect if courseId changes

  if (loading) return <p>Loading...</p>; // Show loading message
  if (error) return <p style={{ color: "red" }}>{error}</p>; // Show error message


  return (
    <div>
      <h1>{courseData?.title || "Course Page"}</h1>
      <p>Instructor: {courseData?.instructor_name || "Unknown"}</p>
      <p>Rating: {courseData?.course_rating || "No rating yet"} / 5</p>
      <p>Total Modules: {courseData?.nom_of_modules || 0}</p>
      <p>Enrolled Students: {courseData?.enrolled_students || 0}</p>

      <div>
        <h2>Manage Course: {courseId}</h2>
        {/* <button onClick={() => router.push(`/courses/${courseId}/dashboard`)}>
          View Student Dashboard
        </button> */}
        <button onClick={() => router.push(`/progress/engagement/${courseId}`)}>
          Engagement Report
        </button>
        <button onClick={() => router.push(`/progress/effectiveness/${courseId}`)}>
          Content Effectiveness Report
        </button>
        <button onClick={() => router.push(`/progress/quiz-results${courseId}`)}>
          Quiz Results Report
        </button>
        <button onClick={() => router.push(`/courses/${courseId}/modules`)}>
          Manage Modules
        </button>
      </div>
    </div>
  );
};

export default CoursePage;
