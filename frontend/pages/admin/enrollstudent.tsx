// pages/admin/enroll-student.tsx

import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const EnrollStudent = () => {
  const [instructorId, setInstructorId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  // Handle form submission
  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!instructorId || !studentId || !courseId) {
      setError('All fields are required!');
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:3000/user/${instructorId}/enroll-student/${studentId}/${courseId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setSuccess(response.data.message || 'Student successfully enrolled in the course.');
      setInstructorId('');
      setStudentId('');
      setCourseId('');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to enroll student in the course.');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
      <h1>🛠️ Enroll Student in a Course</h1>
      <form onSubmit={handleEnroll}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Instructor ID:</label>
          <input
            type="text"
            value={instructorId}
            onChange={(e) => setInstructorId(e.target.value)}
            placeholder="Enter Instructor ID"
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Student ID:</label>
          <input
            type="text"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder="Enter Student ID"
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Course ID:</label>
          <input
            type="text"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            placeholder="Enter Course ID"
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>
        <button
          type="submit"
          style={{
            backgroundColor: '#0070f3',
            color: 'white',
            padding: '10px',
            width: '100%',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1rem',
            borderRadius: '5px',
            marginTop: '1rem',
          }}
        >
          Enroll Student
        </button>
      </form>

      {/* Success Message */}
      {success && (
        <p style={{ color: 'green', marginTop: '1rem', textAlign: 'center' }}>{success}</p>
      )}

      {/* Error Message */}
      {error && (
        <p style={{ color: 'red', marginTop: '1rem', textAlign: 'center' }}>{error}</p>
      )}
    </div>
  );
};

export default EnrollStudent;
