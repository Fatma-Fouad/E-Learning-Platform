import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const CreateForumPage = () => {
  const router = useRouter();
  const [courseId, setCourseId] = useState('');
  const [courseName, setCourseName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Retrieve the instructor's ID from localStorage
  const [instructorId, setInstructorId] = useState<string | null>(null);

  

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('role');

    if (!userId || role !== 'instructor') {
      alert('Unauthorized access. Redirecting to home...');
      router.push('/');
    } else {
      setInstructorId(userId);
    }
  }, [router]);

  const handleCreateForum = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    if (!courseId || !courseName || !instructorId) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");
    console.log("Retrieved Token:", token);
    if (!token) {
        setError("Unauthorized access. Redirecting to login...");
        router.push("/login");
        return;
    }

    try {
      const response = await axios.post('http://localhost:3000/forums/create', {
        courseId,
        courseName,
        createdBy: instructorId },
          {headers: {
            Authorization: `Bearer ${token}`,
          }
      },);

      setSuccessMessage('Forum created successfully!');
      setCourseId('');
      setCourseName('');
      setTimeout(() => router.push(`/courses/${courseId}/forums`), 2000); // Redirect to forums page
    } catch (err: any) {
      console.error('Error creating forum:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to create forum. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Create Forum</h1>
      <form onSubmit={handleCreateForum} style={styles.form}>
        {error && <p style={styles.error}>{error}</p>}
        {successMessage && <p style={styles.success}>{successMessage}</p>}
        <div style={styles.field}>
          <label htmlFor="courseId">Course ID:</label>
          <input
            type="text"
            id="courseId"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            placeholder="Enter course ID"
            style={styles.input}
            required
          />
        </div>
        <div style={styles.field}>
          <label htmlFor="courseName">Course Name:</label>
          <input
            type="text"
            id="courseName"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            placeholder="Enter course name"
            style={styles.input}
            required
          />
        </div>
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? 'Creating Forum...' : 'Create Forum'}
        </button>
      </form>
    </div>
  );
};

export default CreateForumPage;

// Styles for the page
const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  title: {
    textAlign: 'center',
    fontSize: '24px',
    color: '#333',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '15px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    gap: '5px',
  },
  input: {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#0070f3',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  error: {
    color: 'red',
    textAlign: 'center' as 'center',
  },
  success: {
    color: 'green',
    textAlign: 'center' as 'center',
  },
};
