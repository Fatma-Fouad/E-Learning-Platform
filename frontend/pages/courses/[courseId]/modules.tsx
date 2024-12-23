import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const ModulesPage = () => {
  const router = useRouter();
  const { courseId } = router.query; // Extract courseId from the query
  const [modules, setModules] = useState([]); // Store modules data
  const [loading, setLoading] = useState(true); // For loading state
  const [error, setError] = useState(null); // For error state
  const [noModulesFound, setNoModulesFound] = useState(false); // State for handling no modules found

  // Fetch modules on page load
  useEffect(() => {
    if (!courseId) return; // Ensure courseId is available

    const fetchModules = async () => {
      setLoading(true);
      setError(null);
      setNoModulesFound(false); // Reset no modules found state
      try {
        const response = await axios.get(`http://localhost:3000/modules/course/${courseId}/ordered-by-date`);
        console.log('API Response:', response.data); // Debug the response structure
        const modulesData = response.data?.data || [];

        if (modulesData.length === 0) {
          setNoModulesFound(true); // Set no modules found if data array is empty
        } else {
          // Sort modules by creation date and module order
          const sortedModules = modulesData.sort((a, b) => {
            if (new Date(a.created_at) < new Date(b.created_at)) return -1;
            if (new Date(a.created_at) > new Date(b.created_at)) return 1;
            return a.module_order - b.module_order;
          });

          setModules(sortedModules);
        }
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
  
  // Handle no modules found
  if (noModulesFound) return <p style={{ color: 'blue' }}>No modules found for this course.</p>;

  // Separate active and outdated modules
  const activeModules = modules.filter((module) => !module.isModuleOutdated);
  const outdatedModules = modules.filter((module) => module.isModuleOutdated);

  return (
    <div>
      <button onClick={() => router.push(`/courses/${courseId}`)}>Back to the Course</button>
      <h1>Modules for Course ID: {courseId}</h1>

      {noModulesFound ? (
        <p style={{ color: 'blue' }}>No modules found for this course.</p>
      ) : (
        <>
          <h2>Active Modules</h2>
          {activeModules.length > 0 ? (
            <ul>
              {activeModules.map((module) => (
                <li key={module._id}>
                  <h3>Module Number : {module.module_order}</h3>
                  <p>Created At: {new Date(module.created_at).toLocaleDateString()}</p>
                  <p>Title: {module.title}</p>
                  <p>Module Version: {module.module_version}</p>
                  <button onClick={() => router.push(`/modules/${module._id}`)}>
                    View Module
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No active modules found for this course.</p>
          )}

          <h2>Outdated Modules</h2>
          {outdatedModules.length > 0 ? (
            <ul>
              {outdatedModules.map((module) => (
                <li key={module._id}>
                  <h3>Module Number : {module.module_order}</h3>
                  <p>Created At: {new Date(module.created_at).toLocaleDateString()}</p>
                  <p>Title: {module.title}</p>
                  <p>Module Version: {module.module_version}</p>
                  <button onClick={() => router.push(`/modules/${module._id}`)}>
                    View Module
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No outdated modules found for this course.</p>
          )}
        </>
      )}

      <button onClick={() => router.push(`/courses/createmodule`)}>Create new Module</button>
    </div>
  );
};

export default ModulesPage;