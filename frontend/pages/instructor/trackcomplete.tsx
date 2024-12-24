import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TrackCompletedCourses = () => {
  const [instructorId, setInstructorId] = useState<string | null>(null); // To hold the instructor ID
  const [courses, setCourses] = useState<any[]>([]); // To hold the courses data
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
   
    // Get the instructor ID from localStorage
    const storedInstructorId = localStorage.getItem('userId');
    if (storedInstructorId) {
      setInstructorId(storedInstructorId);
    } else {
      setError('Instructor ID is not available. Please login.');
    }
  }, []);

  const handleTrackCourses = async () => {
    if (!instructorId) {
      setError('Instructor ID is required.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    const token = localStorage.getItem('token');
    try {
      // Make the GET request to fetch the courses
      const response = await axios.get(`http://localhost:3000/courses/instructor/completed-courses`, {
        params: { instructor_id: instructorId },
         headers: {
          Authorization: `Bearer ${token}`, // Add token in the Authorization header
        },
        
         // Send the instructor ID as a query param
      });

      // Set the response data
      setCourses(response.data.courses);
      setSuccessMessage('Courses tracked successfully.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to track completed courses.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: 'auto' }}>
      <h1>📊 Track Completed Courses</h1>

      {/* Display success or error message */}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}

      {/* Button to trigger tracking of courses */}
      <button
        onClick={handleTrackCourses}
        disabled={loading}
        style={{
          backgroundColor: '#0070f3',
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
        {loading ? 'Tracking Courses...' : 'Track Completed Courses'}
      </button>

      {/* Display the list of courses */}
      <div style={{ marginTop: '20px' }}>
        {courses.length > 0 ? (
          <ul>
            {courses.map((course: any) => (
              <li key={course.course_id}>
                <h3>{course.title}</h3>
                <p>Completed Students: {course.completed_students}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No completed courses found for this instructor.</p>
        )}
      </div>
    </div>
  );
};

export default TrackCompletedCourses;
