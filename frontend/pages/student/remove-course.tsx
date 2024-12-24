import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const RemoveCourse = () => {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null); // State for userId
  const [courseId, setCourseId] = useState<string>(''); // Input for course ID
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch the userId from localStorage when the component mounts
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId'); // Retrieve userId from localStorage
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      setError('User ID is not available.');
    }
  }, []); // Runs once after the component is mounted

  const handleRemoveCourse = async () => {
    if (!userId || !courseId) {
      setError('Please enter both user ID and course ID.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await axios.delete(
        `http://localhost:3000/user/${userId}/remove-course/${courseId}`
      );

      setSuccessMessage('Successfully removed the course from enrolled courses.');
      setCourseId(''); // Clear the course ID input
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove the course.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: 'auto' }}>
      <h1>📝 Remove Course from Enrolled Courses</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      {loading && <p>Loading...</p>}

      {/* User ID input is not needed anymore because it's automatically taken from localStorage */}

      {/* Course ID Input */}
      <div style={{ marginTop: '1rem' }}>
        <label htmlFor="courseId">Course ID:</label>
        <input
          type="text"
          id="courseId"
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          placeholder="Enter course ID"
          style={{
            width: '100%',
            padding: '8px',
            marginTop: '5px',
          }}
        />
      </div>

      {/* Remove Course Button */}
      <button
        onClick={handleRemoveCourse}
        disabled={loading}
        style={{
          backgroundColor: '#ff4d4f',
          color: 'white',
          padding: '10px',
          width: '100%',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1rem',
          borderRadius: '5px',
          marginTop: '10px',
        }}
      >
        {loading ? 'Removing Course...' : 'Remove Course'}
      </button>
    </div>
  );
};

export default RemoveCourse;
