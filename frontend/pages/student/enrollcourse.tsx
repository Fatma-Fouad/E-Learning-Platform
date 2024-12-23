import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const EnrollCourse = () => {
  const [courseId, setCourseId] = useState(''); // Store the entered course ID
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const userId = localStorage.getItem('userId'); // Get userId from localStorage

  // Handle course enrollment by course ID
  const handleEnroll = async () => {
    if (!courseId || !userId) {
      setError('Please enter a valid course ID and ensure you are logged in.');
      return;
    }

    try {
      // Send a POST request to enroll the user in the selected course
      const response = await axios.post(`/api/user/enroll-course/${userId}/${courseId}`);
      console.log("User ID:", userId); // Add this line to check if userId is being retrieved
      setSuccessMessage('Enrolled in the course successfully!');
      setError(''); // Clear error message if successful
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to enroll in course.');
      setSuccessMessage(''); // Clear success message if error occurs
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: 'auto' }}>
      <h1>📚 Enroll in a New Course</h1>

      {/* Display error or success message */}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}

      {/* Input for course ID */}
      <h2>Enter Course ID to Enroll</h2>
      <input
        type="text"
        value={courseId}
        onChange={(e) => setCourseId(e.target.value)} // Update courseId state on input change
        placeholder="Enter Course ID"
        style={{
          width: '100%',
          padding: '8px',
          marginBottom: '10px',
          borderRadius: '5px',
          border: '1px solid #ccc',
        }}
      />
      <button
        onClick={handleEnroll} // Trigger the handleEnroll function when clicked
        style={{
          backgroundColor: '#0070f3',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Enroll in Course
      </button>
    </div>
  );
};

export default EnrollCourse;

