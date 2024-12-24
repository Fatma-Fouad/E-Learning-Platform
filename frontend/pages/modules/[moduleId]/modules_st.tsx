import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const AccessModulePage = () => {
  const router = useRouter();
  const { moduleId } = router.query;

  const [moduleData, setModuleData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModuleData = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');

        if (!token || !userId) {
          setErrorMessage('Unauthorized access. Redirecting to login...');
          router.push('/login');
          return;
        }

        const response = await axios.get(
          `http://localhost:3000/modules/${moduleId}/student`,
          {
            params: {
              user_id: userId, // Send user_id as a query param
            },
            headers: {
              Authorization: `Bearer ${token}`, // Include the token if necessary
            },
          }
        );

        const module = response.data?.module?.module; // Access the nested data
        console.log('Module Data Retrieved:', module);

        if (module) {
          setModuleData(module);
          setInfoMessage(''); // Clear any previous message
        } else {
          const message = response.data?.module?.message;
          setInfoMessage(message || 'You cannot access this module at the moment.');
          setModuleData(null);
        }
      } catch (err) {
        console.error('Error fetching module data:', err.response?.data || err.message);
        setErrorMessage(
          err.response?.data?.message || 'Failed to fetch module data. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    if (moduleId) {
      fetchModuleData();
    }
  }, [moduleId, router]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (errorMessage) {
    return <p style={{ color: 'red' }}>{errorMessage}</p>;
  }

  if (infoMessage) {
    return (
      <div>
        <p style={{ color: 'orange' }}>{infoMessage}</p>
      </div>
    );
  }

  return (
    <div>
      {moduleData ? (
        <div>
          <h1>Module: {moduleData.title}</h1>
          <p><strong>Difficulty:</strong> {moduleData.module_difficultyLevel || 'Not specified'}</p>
          <p><strong>Rating:</strong> {moduleData.module_rating} / 5</p>
          <p><strong>Version:</strong> {moduleData.module_version || 'Not specified'}</p>
          <p><strong>Order:</strong> {moduleData.module_order || 'Not specified'}</p>
          <p><strong>Notes Enabled:</strong> {moduleData.notesEnabled ? 'Yes' : 'No'}</p>
          <p><strong>Created At:</strong> {new Date(moduleData.created_at).toLocaleDateString()}</p>
          <button onClick={() => router.push(`/modules/${moduleId}/take-quiz`)}>Take Quiz</button>
          {/* Notes Button (Conditional Rendering) */}
          {moduleData.notesEnabled && (
            <button 
              onClick={() => router.push(`/modules/${moduleId}/notes`)}
              style={{
                marginTop: '10px',
                padding: '10px 15px',
                background: 'green',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Go to Notes
            </button>
          )}
        </div>
      ) : (
        <p style={{ color: 'red' }}>
          You cannot access this module at the moment. Please check the message for details.
        </p>
      )}
    </div>
  );
};

export default AccessModulePage;