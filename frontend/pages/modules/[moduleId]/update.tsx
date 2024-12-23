import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const UpdateModule = () => {
  const router = useRouter();
  const { moduleId } = router.query; // Get the moduleId from the URL
  const [formData, setFormData] = useState({
    title: '',
    content: [],
    module_difficultyLevel: '',
  });
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [moduleDetails, setModuleDetails] = useState({ courseId: '', moduleOrder: 0 });

  useEffect(() => {
    const fetchModuleDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/modules/${moduleId}`);
        const moduleData = response.data.data;
        setModuleDetails({
          courseId: moduleData.course_id,
          moduleOrder: moduleData.module_order,
        });
      } catch (err) {
        console.error('Error fetching module details:', err);
        setError('Failed to fetch module details.');
      }
    };

    if (moduleId) {
      fetchModuleDetails();
    }
  }, [moduleId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleUpdate = async () => {
    if (!formData.title || !formData.module_difficultyLevel) {
      setError('Title and Difficulty Level are required.');
      return;
    }
  
    setUpdating(true);
    setError('');
    setMessage('');
  
    try {
      // Step 1: Update the module
      const updateResponse = await axios.patch(
        `http://localhost:3000/modules/${moduleId}/version-control`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
  
      console.log('Update Response:', updateResponse);
  
      // Ensure the update was successful
      if (!updateResponse || updateResponse.status !== 200) {
        throw new Error('Failed to update the module.');
      }
  
      setMessage('Module updated successfully.');
  
      // Step 2: Fetch all modules to find the latest version
      const newModuleResponse = await axios.get(`http://localhost:3000/modules`, {
        params: {
          courseId: moduleDetails.courseId,
          moduleOrder: moduleDetails.moduleOrder,
        },
      });
  
      console.log('Modules fetched:', newModuleResponse);
  
      const modules = Array.isArray(newModuleResponse?.data)
        ? newModuleResponse.data
        : [];
  
      if (modules.length > 0) {
        // Step 3: Filter and find the latest module version
        const filteredModules = modules.filter(
          (mod) =>
            mod.course_id === moduleDetails.courseId &&
            mod.module_order === moduleDetails.moduleOrder &&
            mod.isModuleOutdated === false
        );
  
        console.log('Filtered modules:', filteredModules);
  
        const latestModule = filteredModules.reduce((latest, current) =>
          current.module_version > (latest?.module_version || 0) ? current : latest,
          null
        );
  
        if (latestModule && latestModule._id) {
          router.push(`/modules/${latestModule._id}/update`); // Navigate to the new module ID
        } else {
          setError('Failed to find the new module. Please refresh the page.');
        }
      } else {
        setError('No modules found matching the criteria.');
      }
    } catch (err) {
      console.error('Error updating module:', err);
      setError('Failed to update the module. Please try again.');
    } finally {
      setUpdating(false);
    }
  };
  
  
  
  
  

  return (
    <div>
      <h1>Update Module</h1>
      <p>Module ID: {moduleId}</p>

      <form>
        <div>
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="module_difficultyLevel">Difficulty Level:</label>
          <select
            id="module_difficultyLevel"
            name="module_difficultyLevel"
            value={formData.module_difficultyLevel}
            onChange={handleChange}
          >
            <option value="">Select Difficulty</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <button
          type="button"
          onClick={handleUpdate}
          disabled={updating}
        >
          {updating ? 'Updating...' : 'Update Module'}
        </button>
      </form>

      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={() => router.push(`/modules/${moduleId}`)}>Back to Module</button>
    </div>
  );
};

export default UpdateModule;
