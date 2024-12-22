import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const ModulesForStudentPage = () => {
  const router = useRouter();
  const { courseId } = router.query; // Fetch courseId from the URL
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchModules = async () => {
      try {
        if (!courseId) return;

        const token = localStorage.getItem('token');
        if (!token) {
          setError('Unauthorized access. Redirecting to login...');
          router.push('/login');
          return;
        }

        const response = await axios.get(
          `http://localhost:3000/modules/course/${courseId}/for-student`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setModules(response.data.data); // Store the fetched modules
        console.log('Fetched Modules:', response.data.data); // Debug log
      } catch (err) {
        console.error('Error fetching modules:', err.response?.data || err.message);
        setError('Failed to load modules. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [courseId, router]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h1>Modules for Course: {courseId}</h1>
      {modules.length > 0 ? (
        <ul>
          {modules.map((module) => (
            <li key={module._id} style={{ marginBottom: '1rem' }}>
              <h2>{module.title}</h2>
              <p>
                Difficulty:{' '}
                {module[' module_difficultyLevel']?.trim() || 'Not specified'}
              </p>
              <button
                onClick={() => router.push(`/modules/${module._id}/modules_st`)}
                style={{
                  backgroundColor: '#0070f3',
                  color: 'white',
                  padding: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  borderRadius: '5px',
                }}
              >
                Access Module
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No modules available for this course.</p>
      )}
    </div>
  );
};

export default ModulesForStudentPage;
