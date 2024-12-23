import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const EnrollStudent = () => {
  const [studentId, setStudentId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [instructorId, setInstructorId] = useState<string | null>(null);
  const router = useRouter();

  // Fetch the instructor ID from localStorage
  useEffect(() => {
    const storedInstructorId = localStorage.getItem("userId"); 
    localStorage.setItem("userId", instructorId);

    if (storedInstructorId) {
      setInstructorId(storedInstructorId);
    } else {
      setError('Instructor ID not found in localStorage.');
    }
  }, []);

  const handleEnrollStudent = async () => {
    if (!instructorId) {
      setError('Instructor ID is missing.');
      return;
    }

    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const response = await axios.post(
        `http://localhost:3000/user/${instructorId}/enroll-student/${studentId}/${courseId}`
      );

      setSuccessMessage(response.data.message || 'Student enrolled successfully!');
      setStudentId('');
      setCourseId('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to enroll student.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
      <h1>📚 Enroll Student in Course</h1>
      <p>Enter the student ID and course ID to enroll the student into the selected course.</p>

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

      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="courseId">Course ID:</label>
        <input
          type="text"
          id="courseId"
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          placeholder="Enter Course ID"
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        />
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      {loading && <p>Processing...</p>}

      <button
        onClick={handleEnrollStudent}
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
        {loading ? 'Enrolling...' : 'Enroll Student'}
      </button>

      <button
        onClick={() => router.push('/instructor/dashboard')}
        style={{
          backgroundColor: '#ccc',
          color: 'black',
          padding: '10px',
          width: '100%',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1rem',
          borderRadius: '5px',
          marginTop: '10px',
        }}
      >
        Back to Dashboard
      </button>
    </div>
  );
};

export default EnrollStudent;
