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
          const response = await axios.get(`http://localhost:3000/modules/${moduleId}`)
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

  return (
    <div>
      <h1>{moduleData.title || 'Module Page'}</h1>
      <p>Version: {moduleData.module_version}</p>
      <p>Difficulty Level: {moduleData.module_difficultyLevel}</p>
      <p>Rating: {moduleData.module_rating} / 5</p>
      <button onClick={() => router.push(`/modules/${moduleId}/manage-quizzes`)}>Manage Quizzes</button>
      <button onClick={() => router.push(`/modules/${moduleId}/notes`)}>Notes</button>
      </div>
  );
};

export default ModulePage;
