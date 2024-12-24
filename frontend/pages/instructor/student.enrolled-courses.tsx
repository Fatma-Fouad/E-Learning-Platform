import React, { useState } from 'react';
import axios from 'axios';

const StudentEnrolledCourses = () => {
  const [studentId, setStudentId] = useState('');
  const [instructorId, setInstructorId] = useState(''); // Replace with real instructor ID from auth/session
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFetchEnrolledCourses = async () => {
    if (!studentId || !instructorId) {
      setError('Instructor ID and Student ID are required.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token'); // Retrieve the token from localStorage

      const response = await axios.get(
        `/api/user/${instructorId}/student/${studentId}/enrolled-courses`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
        }
      );

      setEnrolledCourses(response.data.enrolledCourses || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch enrolled courses.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: 'auto' }}>
      <h1>📚 Student Enrolled Courses</h1>
      <p>View the enrolled courses of a specific student.</p>

      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="instructorId">Instructor ID:</label>
        <input
          type="text"
          id="instructorId"
          value={instructorId}
          onChange={(e) => setInstructorId(e.target.value)}
          placeholder="Enter your Instructor ID"
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="studentId">Student ID:</label>
        <input
          type="text"
          id="studentId"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          placeholder="Enter Student ID"
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        />
      </div>

      <button
        onClick={handleFetchEnrolledCourses}
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
        disabled={loading}
      >
        {loading ? 'Fetching...' : 'Get Enrolled Courses'}
      </button>

      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}

      <div style={{ marginTop: '2rem' }}>
        {enrolledCourses.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {enrolledCourses.map((course: any, index: number) => (
              <li
                key={index}
                style={{
                  border: '1px solid #ccc',
                  padding: '10px',
                  margin: '10px 0',
                  borderRadius: '5px',
                }}
              >
                <h3>Course ID: {course}</h3>
              </li>
            ))}
          </ul>
        ) : (
          !loading && <p>No enrolled courses found for this student.</p>
        )}
      </div>
    </div>
  );
};

export default StudentEnrolledCourses;
