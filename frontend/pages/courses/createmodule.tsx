import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const CreateModulePage = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    course_id: '',
    title: '',
    content: [],
    module_difficultyLevel: 'Medium', // Default difficulty level
  });

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]); // Store available courses

  // Fetch available courses on mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('token'); // Retrieve the token from localStorage

        const response = await axios.get('http://localhost:3000/courses/available-courses', {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
        });

        if (Array.isArray(response.data)) {
          const uniqueCourses = response.data
            .filter((course) => course?._id && course?.title)
            .map((course) => ({ id: course._id, title: course.title }));
          setCourses(uniqueCourses);
        } else {
          throw new Error('Unexpected response format.');
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to fetch courses. Please try again later.');
      }
    };

    fetchCourses();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.course_id) {
      setError('Course ID is required.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('token'); // Retrieve the token from localStorage

      const response = await axios.post('http://localhost:3000/modules', formData, {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the Authorization header
        },
      });

      setSuccessMessage('Module created successfully!');
      console.log('Created module:', response.data);

      // Redirect to modules page after creation
      router.push(`/courses/${formData.course_id}/modules`);
    } catch (err) {
      console.error('Error creating module:', err);
      setError(err.response?.data?.message || 'Failed to create module.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Create New Module</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="course_id">Select Course:</label>
          <select
            id="course_id"
            name="course_id"
            value={formData.course_id}
            onChange={handleChange}
            required
          >
            <option value="">-- Select a Course --</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.id}: {course.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="title">Module Title:</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
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
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Module'}
        </button>
      </form>

      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button onClick={() => router.push('/courses')}>Back to Courses</button>
    </div>
  );
};

export default CreateModulePage;
