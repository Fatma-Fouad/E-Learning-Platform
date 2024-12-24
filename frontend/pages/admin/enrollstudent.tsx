import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const EnrollStudent = () => {
  const [studentId, setStudentId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleEnrollStudent = async () => {
    const instructorId = localStorage.getItem('userId');  // Get the instructorId from localStorage
    const token = localStorage.getItem('token');  // Get the token from localStorage
    const studentIdInput = studentId; 

    if (!instructorId || !token) {
      setErrorMessage('Instructor ID or Token not found. Please login.');
      return;
    }

    if (!studentIdInput || !courseId) {
      setErrorMessage('Please fill in all the fields.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      // Making the POST request to enroll the student in the course
      const response = await axios.post(
        `http://localhost:3000/user/${instructorId}/enroll-student/${studentId}/${courseId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`, // Sending the token for authorization
          },
        }
      );

      setSuccessMessage(`Successfully enrolled in the course: ${response.data.message}`);
      setStudentId(''); // Clear the studentId input
      setCourseId(''); // Clear the courseId input
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to enroll student.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
      <h1>Enroll Student in a Course</h1>

      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}

      <div>
        <label htmlFor="studentId">Student ID:</label>
        <input
          type="text"
          id="studentId"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          placeholder="Enter student ID"
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        />
      </div>

      <div style={{ marginTop: '1rem' }}>
        <label htmlFor="courseId">Course ID:</label>
        <input
          type="text"
          id="courseId"
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          placeholder="Enter course ID"
          style={{ width: '100%', padding: '8px', marginTop: '5px' }}
        />
      </div>

      <button
        onClick={handleEnrollStudent}
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
        {loading ? 'Enrolling...' : 'Enroll Student'}
      </button>
    </div>
  );
};

export default EnrollStudent;
