import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const ModulesPage = () => {
  const router = useRouter();
  const { courseId } = router.query; // Extract courseId from the query
  const [modules, setModules] = useState([]); // Store modules data
  const [loading, setLoading] = useState(true); // For loading state
  const [error, setError] = useState(null); // For error state

  // Fetch modules on page load
  useEffect(() => {
    if (!courseId) return; // Ensure courseId is available

    const fetchModules = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`http://localhost:3000/modules/course/${courseId}/ordered-by-date`);
        console.log('API Response:', response.data); // Debug the response structure
        setModules(response.data?.data || []); // Handle data correctly
      } catch (err) {
        console.error('Error fetching modules:', err);
        setError(err.response?.data?.message || 'Failed to fetch modules.');
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [courseId]);

  if (loading) return <p>Loading modules...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h1>Modules for Course ID: {courseId}</h1>
      {modules.length > 0 ? (
        <ul>
          {modules.map((module) => (
            <li key={module._id}>
              <h3>{module.title}</h3>
              <p>Created At: {new Date(module.created_at).toLocaleDateString()}</p>
              <button onClick={() => router.push(`/modules/${module._id}`)}>
                View Module
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No modules found for this course.</p>
      )}
    </div>
  );
};

export default ModulesPage;
