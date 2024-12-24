import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

interface Course {
  _id: string;
  title: string;
  description: string;
  created_by: string;  // Instructor's name (from the created_by field)
}

const CompletedCourses = () => {
  const [completedCourses, setCompletedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Initially loading
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCompletedCourses = async () => {
      // Fetch token and userId from localStorage
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      // Log the token and userId to the console for debugging
      console.log('Token:', token);
      console.log('User ID:', userId);

      // Check if token or userId is missing
      if (!token || !userId) {
        setError('Unauthorized access. Redirecting to login...');
        router.push('/login');
        return;
      }

      setLoading(true);
      setError('');

      try {
        // Fetch completed course IDs for the user
        const response = await axios.get(
          `http://localhost:3000/user/${userId}/completed-courses`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Add token in the Authorization header
            },
          }
        );

        const courseIds = response.data;

        if (courseIds.length === 0) {
          setError('No completed courses found.');
          setLoading(false);
          return;
        }

        // Fetch course details for each course ID
        const coursesPromises = courseIds.map((courseId: string) =>
          axios.get(`http://localhost:3000/courses/${courseId}`,{
            headers: {
              Authorization: `Bearer ${token}`, // Add token in the Authorization header
            },
          })
        
        );

        const coursesResponses = await Promise.all(coursesPromises);

        setCompletedCourses(coursesResponses.map((res) => res.data));
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch completed courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedCourses();
  }, [router]);

  const handleViewModules = (courseId: string) => {
    router.push(`/courses/${courseId}/modules_st`);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: 'auto' }}>
      <h1>✅ Completed Courses</h1>

      {completedCourses.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {completedCourses.map((course) => (
            <li
              key={course._id}
              style={{
                padding: '10px',
                border: '1px solid #ccc',
                marginBottom: '10px',
                borderRadius: '5px',
              }}
            >
              <h3>{course.title}</h3>
              {course.description && <p><strong>Description:</strong> {course.description}</p>}
              <p><strong>Instructor:</strong> {course.created_by}</p>
              <button onClick={() => handleViewModules(course._id)}>
                View Modules
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No completed courses found.</p>
      )}
    </div>
  );
};

export default CompletedCourses;
