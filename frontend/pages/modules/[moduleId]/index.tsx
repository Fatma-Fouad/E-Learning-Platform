import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const ModulePage = () => {
  const router = useRouter();
  const { moduleId } = router.query; // Fetch moduleId from the URL

  const [moduleData, setModuleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isToggling, setIsToggling] = useState(false);

  // Fetch Module Data
  useEffect(() => {
    const fetchModule = async () => {
      const token = localStorage.getItem('token');
      console.log('Retrieved Token:', token);
      if (!token) {
        setError('Unauthorized access. Redirecting to login...');
        router.push('/login');
        return;
      }
      if (moduleId) {
        try {
          const response = await axios.get(
            `http://localhost:3000/modules/${moduleId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          console.log('Response data:', response.data); // Log the response
          setModuleData(response.data.data);
        } catch (err) {
          console.error('Error fetching module:', err);
          setError('Failed to fetch module data.');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchModule();
  }, [moduleId]);

  // Toggle Notes Feature
  const handleToggleNotes = async () => {
    if (!moduleId) return;

    try {
      setIsToggling(true);
      const token = localStorage.getItem('token');
      const updatedNotesState = !moduleData.notesEnabled; // Toggle the current state

      const response = await axios.patch(
        `http://localhost:3000/modules/${moduleId}/notes-toggle`,
        { enabled: updatedNotesState },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setModuleData((prev) => ({
        ...prev,
        notesEnabled: updatedNotesState,
      }));

      console.log('Notes feature toggled successfully:', response.data);
    } catch (err) {
      console.error('Error toggling notes feature:', err);
      setError('Failed to toggle notes feature. Please try again.');
    } finally {
      setIsToggling(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!moduleData) return <p>No module data available.</p>;

  return (
    <div style={containerStyle}>
      <h1 style={headerStyle}>{moduleData.title || 'Module Page'}</h1>
      <p>
        <strong>Version:</strong> {moduleData.module_version}
      </p>
      <p>
        <strong>Difficulty Level:</strong> {moduleData.module_difficultyLevel}
      </p>
      <p>
        <strong>Rating:</strong> {moduleData.module_rating} / 5
      </p>
      <p>
        <strong>Order:</strong> {moduleData.module_order}
      </p>
      <p>
        <strong>Notes Enabled:</strong>{' '}
        {moduleData.notesEnabled ? '✅ Enabled' : '❌ Disabled'}
      </p>

      {/* Toggle Notes Feature */}
      <div style={buttonContainerStyle}>
        <button
          onClick={handleToggleNotes}
          style={{
            ...buttonStyle,
            backgroundColor: moduleData.notesEnabled ? '#f44336' : '#4CAF50',
          }}
          disabled={isToggling}
        >
          {isToggling
            ? 'Processing...'
            : moduleData.notesEnabled
            ? 'Disable Notes'
            : 'Enable Notes'}
        </button>
      </div>

      <div style={buttonContainerStyle}>
        <button
          style={buttonStyle}
          onClick={() => router.push(`/modules/${moduleId}/manage-quizzes`)}
        >
          Manage Quizzes
        </button>
        <button
          style={buttonStyle}
          onClick={() => router.push(`/modules/${moduleId}/update`)}
        >
          Update Module
        </button>
        <button
          style={buttonStyle}
          onClick={() => router.push(`/modules/${moduleId}/upload`)}
        >
          Upload Media
        </button>
        <button
          style={buttonStyle}
          onClick={() => router.push(`/courses/${moduleData.course_id}/modules`)}
        >
          Back to Modules
        </button>
      </div>
    </div>
  );
};

// ✅ Styles
const containerStyle: React.CSSProperties = {
  maxWidth: '600px',
  margin: '50px auto',
  padding: '20px',
  border: '1px solid #ddd',
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  backgroundColor: '#fff',
  fontFamily: 'Arial, sans-serif',
};

const headerStyle: React.CSSProperties = {
  textAlign: 'center' as const,
  marginBottom: '20px',
  color: '#333',
};

const buttonContainerStyle: React.CSSProperties = {
  marginTop: '30px',
  display: 'flex',
  gap: '10px',
  justifyContent: 'center',
};

const buttonStyle: React.CSSProperties = {
  padding: '10px 20px',
  fontSize: '14px',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};

export default ModulePage;
