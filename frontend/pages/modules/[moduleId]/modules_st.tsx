import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const ViewModuleForStudentPage = () => {
  const router = useRouter();
  const { moduleId } = router.query; // Fetch moduleId from the URL
  const [moduleData, setModuleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchModule = async () => {
      if (moduleId) {
        try {
          const response = await axios.get(`http://localhost:3000/modules/${moduleId}/student`, {
            data: { user_id: '12345' }, // Simulating a user ID, replace with dynamic fetching if needed
          });
          console.log(response.data); // Log the response
          setModuleData(response.data.module);
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

  return (
    <div>
      <h1>{moduleData.title || 'Module Page'}</h1>
      <p><strong>Version:</strong> {moduleData.module_version}</p>
      <p><strong>Difficulty Level:</strong> {moduleData.module_difficultyLevel}</p>
      <p><strong>Rating:</strong> {moduleData.module_rating} / 5</p>
      <p><strong>Order:</strong> {moduleData.module_order}</p>
      <p><strong>Uploaded Content:</strong></p>
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
    </div>
  );
};

export default ViewModuleForStudentPage;

