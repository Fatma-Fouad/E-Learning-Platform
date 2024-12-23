import React, { useEffect, useState } from 'react';
import CourseList from '../../components/Courselist';
import axios from 'axios';

const RemoveCourse: React.FC = () => {
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Fetch enrolled courses on component mount
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      setLoading(true);
      setError('');
      setSuccessMessage('');

      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');

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

  // Handle removing a course
  const handleRemoveCourse = async (courseId: string) => {
    setError('');
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      if (!token || !userId) {
        throw new Error('User not authenticated. Please log in again.');
      }

      await axios.delete(
        `http://localhost:4000/user/${userId}/remove-course/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEnrolledCourses((prevCourses) =>
        prevCourses.filter((course: any) => course.id !== courseId)
      );
      setSuccessMessage('Course removed successfully.');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to remove the course.');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: 'auto' }}>
      <h1>🗑️ Remove Enrolled Course</h1>
      {loading && <p>Loading courses...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}

      {enrolledCourses.length > 0 ? (
        <CourseList courses={enrolledCourses} onCourseClick={handleRemoveCourse} />
      ) : (
        <p>No enrolled courses available to remove.</p>
      )}
    </div>
  );
};

export default RemoveCourse;
