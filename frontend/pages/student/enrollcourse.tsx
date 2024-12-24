import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const EnrollCourse = () => {
  const router = useRouter();
  const [studentId, setStudentId] = useState<string | null>(null);
  const [courseInput, setCourseInput] = useState<string>(''); // Input for course ID
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch the studentId from localStorage
  useEffect(() => {
    const storedStudentId = localStorage.getItem('userId');
    if (storedStudentId) {
      setStudentId(storedStudentId);
    } else {
      setError('Student ID is not available.');
    }
  }, []); // Runs once after the component is mounted

  const handleEnrollCourse = async () => {
    if (!studentId || !courseInput) {
      setError('Please enter a valid course ID.');
      return;
    }

    console.log('Student ID:', studentId); // Debugging line
    console.log('Course ID:', courseInput); // Debugging line

    try {
      setLoading(true);
      const token = localStorage.getItem('token'); // Retrieve the token from localStorage
      const response = await axios.post(
        `http://localhost:3000/user/${studentId}/enroll-course/${courseInput}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
        }
      );

      console.log('Response:', response); // Debugging line
      console.log('Response Data:', response.data); // Debugging line

      if (response.data && response.data.message) {
        setSuccessMessage(response.data.message);
      } else {
        setSuccessMessage('Successfully enrolled in the course.');
      }

      setCourseInput(''); // Clear the input field after successful enrollment
    } catch (err: any) {
      console.error('Error enrolling course:', err); // Debugging line
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
