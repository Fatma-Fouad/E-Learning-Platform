// pages/student/enrolled-courses.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import CourseList from '../../components/Courselist';

const EnrolledCourses: React.FC = () => {
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch enrolled courses on page load
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem("userId");

        if (!token || !userId) {
          throw new Error('User not authenticated. Please log in again.');
        }

        const response = await axios.get(
          `http://localhost:3000/user/${userId}/enrolled-courses`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setEnrolledCourses(response.data);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to fetch enrolled courses.');
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, []);

  // Handle enrolling in a new course
  const handleEnrollCourse = async (courseId: string) => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      if (!token || !userId) {
        throw new Error('User not authenticated. Please log in again.');
      }

      await axios.post(
        `http://localhost:4000/user/${userId}/enroll-course/${courseId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert('Successfully enrolled in the course!');
      // Refresh enrolled courses
      router.reload();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to enroll in the course.');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: 'auto' }}>
      <h1>📚 Enrolled Courses</h1>

      {loading && <p>Loading courses...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {enrolledCourses.length > 0 ? (
        <CourseList courses={enrolledCourses} />
      ) : (
        <p>No courses enrolled yet.</p>
      )}

      <h2>🔗 Enroll in a New Course</h2>
      <button
        onClick={() => handleEnrollCourse('course-id')} // Replace with dynamic course ID
        style={{
          backgroundColor: '#0070f3',
          color: '#fff',
          padding: '10px',
          marginTop: '1rem',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Enroll in Course
      </button>
    </div>
  );
};

export default EnrolledCourses;
