import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CompletedCourses = () => {
  const [completedCourses, setCompletedCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdBy, setCreatedBy] = useState(''); // Instructor ID will be retrieved from localStorage

  const handleFetchCompletedCourses = async () => {
    setLoading(true);
    setError('');
    try {
      if (!createdBy) {
        throw new Error('Instructor ID is required');
      }

      const token = localStorage.getItem('token'); // Retrieve the token from localStorage

      const response = await axios.get(
        `http://localhost:3000/user/instructor/completed-courses?created_by=${createdBy}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
        }
      );

      setCompletedCourses(response.data.courses || []);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch completed courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Retrieve the instructorId from localStorage when the component mounts
    const instructorId = localStorage.getItem('userId'); // Replace 'userId' with your actual key for instructor ID

    if (instructorId) {
      setCreatedBy(instructorId); // Set the createdBy state with the retrieved instructorId
    } else {
      setError('Instructor ID not found in localStorage');
    }
  }, []);

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: 'auto' }}>
      <h1>📊 Completed Courses</h1>
      <p>View a list of students who have completed your courses.</p>
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="createdBy">Instructor ID:</label>
        <input
          type="text"
          id="createdBy"
          value={createdBy}
          onChange={(e) => setCreatedBy(e.target.value)}
          placeholder="Instructor ID is auto-filled from localStorage"
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          disabled // Making it read-only since it's fetched from localStorage
        />
      </div>

      <button
        onClick={handleFetchCompletedCourses}
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
        {loading ? 'Fetching...' : 'Fetch Completed Courses'}
      </button>

      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}

      <div style={{ marginTop: '2rem' }}>
        {completedCourses.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {completedCourses.map((course: any) => (
              <li
                key={course.course_id}
                style={{
                  border: '1px solid #ccc',
                  padding: '10px',
                  margin: '10px 0',
                  borderRadius: '5px',
                }}
              >
                <h3>{course.title}</h3>
                <p>
                  <strong>Completed Students:</strong> {course.completed_students}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          !loading && <p>No completed courses found.</p>
        )}
      </div>
    </div>
  );
};

export default CompletedCourses;
