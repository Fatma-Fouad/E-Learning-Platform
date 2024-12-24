import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const EnrollCourse = () => {
  const router = useRouter();
  const [studentId, setStudentId] = useState<string>(''); // Student ID input
  const [courseInput, setCourseInput] = useState<string>(''); // Input for course ID
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleEnrollCourse = async () => {
    if (!studentId || !courseInput) {
      setError('Please enter both student ID and course ID.');
      return;
    }

    // Fetch token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication token not found. Please log in.');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `http://localhost:3000/user/${studentId}/enroll-course/${courseInput}`,
        {}, // No body needed, so an empty object
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add token in the Authorization header
          },
        }
      );

      if (response.data && response.data.message) {
        setSuccessMessage(response.data.message);
      } else {
        setSuccessMessage('Successfully enrolled in the course.');
      }

      setCourseInput(''); // Clear the input field after successful enrollment
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to enroll in the course.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: 'auto' }}>
      <h1>🎓 Enroll in a New Course</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      {loading && <p>Loading...</p>}

      {/* Input for Student ID */}
      <div>
        <h2>Enter Student ID</h2>
        <input
          type="text"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          placeholder="Enter the student ID"
          style={{
            padding: '10px',
            width: '100%',
            marginBottom: '20px',
            borderRadius: '5px',
            border: '1px solid #ccc',
          }}
        />
      </div>

      {/* Input for Course Enrollment */}
      <div>
        <h2>Enter Course ID</h2>
        <input
          type="text"
          value={courseInput}
          onChange={(e) => setCourseInput(e.target.value)}
          placeholder="Enter the course ID"
          style={{
            padding: '10px',
            width: '100%',
            marginBottom: '20px',
            borderRadius: '5px',
            border: '1px solid #ccc',
          }}
        />
        <button
          onClick={handleEnrollCourse}
          style={{
            backgroundColor: '#0070f3',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            cursor: 'pointer',
            width: '100%',
          }}
        >
          Enroll in Course
        </button>
      </div>
    </div>
  );
};

export default EnrollCourse;
