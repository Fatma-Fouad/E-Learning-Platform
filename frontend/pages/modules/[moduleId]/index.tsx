import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const ModulePage = () => {
  const router = useRouter();
  const { moduleId } = router.query; // Fetch moduleId from the URL

  const [moduleData, setModuleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchModule = async () => {
      if (moduleId) {
        try {
          const response = await axios.get(`http://localhost:3000/modules/${moduleId}`);
          console.log(response.data); // Log the response
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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!moduleData) return <p>No module data available.</p>;

  return (
    <div style={containerStyle}>
      <h1 style={headerStyle}>{moduleData.title || 'Module Page'}</h1>
      <p><strong>Version:</strong> {moduleData.module_version}</p>
      <p><strong>Difficulty Level:</strong> {moduleData.module_difficultyLevel}</p>
      <p><strong>Rating:</strong> {moduleData.module_rating} / 5</p>

      <div style={buttonContainerStyle}>
        <button
          style={buttonStyle}
          onClick={() => router.push(`/modules/${moduleId}/manage-quizzes`)}
        >
          Manage Quizzes
        </button>
        
        {/* Conditionally render Notes button based on notesEnabled */}
        {moduleData.notesEnabled && (
          <button
            style={buttonStyle}
            onClick={() => router.push(`/modules/${moduleId}/notes`)}
          >
            Notes
          </button>
        )}
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
  backgroundColor: '#4CAF50',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};

export default ModulePage;
