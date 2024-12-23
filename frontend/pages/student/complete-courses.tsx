// pages/student/completed-courses.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

// Interface for completed courses
interface Course {
  id: string;
  title: string;
  description?: string;
}

const CompletedCourses: React.FC = () => {
  const [completedCourses, setCompletedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCompletedCourses = async () => {
      try {
        setLoading(true);

        // Fetch userId and token from localStorage
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');

        if (!userId) {
          throw new Error('User ID not found. Please log in.');
        }
        if (!token) {
          throw new Error('Authorization token not found. Please log in.');
        }

        // Fetch completed courses
        const response = await axios.get(
          `http://localhost:4000/user/${userId}/completed-courses`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setCompletedCourses(response.data);
        setLoading(false);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to fetch completed courses');
        setLoading(false);
      }
    };

    fetchCompletedCourses();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>✅ Completed Courses</h1>
      
      {loading && <p>Loading...</p>}
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      {!loading && !error && completedCourses.length === 0 && (
        <p>No completed courses found.</p>
      )}
      
      {!loading && !error && completedCourses.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {completedCourses.map((course) => (
            <li
              key={course.id}
              style={{
                border: '1px solid #ccc',
                padding: '10px',
                margin: '10px 0',
                borderRadius: '5px',
              }}
            >
              <h3>{course.title}</h3>
              {course.description && <p>{course.description}</p>}
            </li>
          ))}
        </ul>
      )}
      
      <button
        onClick={() => router.push('/student/dashboard')}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          borderRadius: '5px',
          backgroundColor: '#0070f3',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        Back to Dashboard
      </button>
    </div>
  );
};

export default CompletedCourses;
