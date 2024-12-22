import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const RateModulePage = () => {
  const router = useRouter();
  const { moduleId } = router.query;

  const [courseId, setCourseId] = useState('');
  const [isCourseCompleted, setIsCourseCompleted] = useState(false);
  const [moduleRating, setModuleRating] = useState(1);
  const [instructorRating, setInstructorRating] = useState(1);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  // Retrieve `token` and `userId` from `localStorage`
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!token || !userId) {
      setError('Unauthorized access. Redirecting to login...');
      router.push('/login');
      return;
    }
    if (moduleId) fetchCourseId();
  }, [moduleId, token, userId, router]);

  const fetchCourseId = async () => {
    try {
      setError('');
      console.log('Fetching course ID for module:', moduleId);

      const moduleResponse = await axios.get(`http://localhost:3000/modules/${moduleId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const fetchedCourseId = moduleResponse.data?.data?.course_id;

      if (fetchedCourseId) {
        setCourseId(fetchedCourseId.toString());
        console.log('Fetched Course ID:', fetchedCourseId.toString());
        await checkCourseCompletion(fetchedCourseId);
      } else {
        console.error('Course ID is missing in the module response.');
        setError('Failed to fetch course ID. Please try again.');
      }
    } catch (err) {
      console.error('Error fetching course ID:', err.response?.data || err.message);
      setError('Failed to fetch course ID. Please try again.');
    }
  };

  const checkCourseCompletion = async (courseIdToCheck) => {
    try {
      const userResponse = await axios.get(`http://localhost:3000/user/${userId}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const completedCourses = userResponse.data.completed_courses || [];

      console.log('Completed Courses:', completedCourses);
      console.log('Course ID to Check:', courseIdToCheck);

      const isCompleted = completedCourses.includes(courseIdToCheck);
      console.log('Is Course Completed:', isCompleted);

      setIsCourseCompleted(isCompleted);
    } catch (err) {
      console.error('Error fetching user data:', err.response?.data || err.message);
      setError('Failed to fetch user data. Please try again.');
    }
  };

  const handleRateModule = async () => {
    try {
      await axios.patch(
        `http://localhost:3000/modules/${moduleId}/rate`,
        { module_rating: moduleRating },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert('Module rating submitted successfully.');
    } catch (err) {
      console.error('Error rating module:', err.response?.data || err.message);
      setError('Failed to rate module. Please try again.');
    }
  };

  const handleRateInstructor = async () => {
    try {
      await axios.patch(
        `http://localhost:3000/courses/${courseId}/rate-instructor`,
        { rating: instructorRating },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert('Instructor rating submitted successfully.');
    } catch (err) {
      console.error('Error rating instructor:', err.response?.data || err.message);
      setError('Failed to rate instructor. Please try again.');
    }
  };

  const handleAddComment = async () => {
    try {
      await axios.post(
        `http://localhost:3000/courses/${courseId}/comments`,
        { comment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert('Comment added successfully.');
    } catch (err) {
      console.error('Error adding comment:', err.response?.data || err.message);
      setError('Failed to add comment. Please try again.');
    }
  };

  return (
    <div>
      <h1>Rate Module</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {isCourseCompleted ? (
        <div>
          <h2>Final Course Rating</h2>
          <label>
            Rate Module:
            <select value={moduleRating} onChange={(e) => setModuleRating(parseInt(e.target.value, 10))}>
              {[1, 2, 3, 4, 5].map((rating) => (
                <option key={rating} value={rating}>
                  {rating}
                </option>
              ))}
            </select>
          </label>
          <br />
          <label>
            Rate Instructor:
            <select value={instructorRating} onChange={(e) => setInstructorRating(parseInt(e.target.value, 10))}>
              {[1, 2, 3, 4, 5].map((rating) => (
                <option key={rating} value={rating}>
                  {rating}
                </option>
              ))}
            </select>
          </label>
          <br />
          <label>
            Add Comment:
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your feedback..."
            />
          </label>
          <br />
          <button onClick={handleRateModule}>Submit Module Rating</button>
          <button onClick={handleRateInstructor}>Submit Instructor Rating</button>
          <button onClick={handleAddComment}>Add Comment</button>
        </div>
      ) : (
        <div>
          <h2>Module Rating</h2>
          <label>
            Rate Module:
            <select value={moduleRating} onChange={(e) => setModuleRating(parseInt(e.target.value, 10))}>
              {[1, 2, 3, 4, 5].map((rating) => (
                <option key={rating} value={rating}>
                  {rating}
                </option>
              ))}
            </select>
          </label>
          <br />
          <button onClick={handleRateModule}>Submit Rating</button>
        </div>
      )}
      <button onClick={() => router.push(`/modules/${moduleId}/all-modules`)}>Go to All Modules</button>
    </div>
  );
};

export default RateModulePage;
