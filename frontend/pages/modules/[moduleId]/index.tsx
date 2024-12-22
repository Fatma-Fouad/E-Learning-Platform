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
      const token = localStorage.getItem("token");
      console.log("Retrieved Token:", token);
      if (!token) {
        setError("Unauthorized access. Redirecting to login...");
        router.push("/login");
        return;
      }
      if (moduleId) {
        try {
          const response = await axios.get(`http://localhost:3000/modules/${moduleId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },})
          console.log("Response data:",response.data); // Log the response
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
    <div>
      <h1>{moduleData.title || 'Module Page'}</h1>
      <p>Version: {moduleData.module_version}</p>
      <p>Difficulty Level: {moduleData.module_difficultyLevel}</p>
      <p>Rating: {moduleData.module_rating} / 5</p>
      <p>Order: {moduleData.module_order}</p>
      <p>Uploaded Content:</p>
      {moduleData.content && moduleData.content.length > 0 ? (
        <ul>
          {moduleData.content.map((filePath, index) => (
            <li key={index}>
              <a href={`http://localhost:3000/${filePath}`} target="_blank" rel="noopener noreferrer">
                {filePath.split('/').pop()}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p>No content uploaded yet.</p>
      )}
      <button onClick={() => router.push(`/modules/${moduleId}/manage-quizzes`)}>Manage Quizzes</button>
      <button onClick={() => router.push(`/modules/${moduleId}/update`)}>Update Module</button>
      <button onClick={() => router.push(`/modules/${moduleId}/upload`)}>Upload Media</button>
      <button onClick={() => router.push(`/courses/${moduleData.course_id}/modules`)}>Back to Modules</button>
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
