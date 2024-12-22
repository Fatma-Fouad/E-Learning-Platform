import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const RateModulePage = () => {
  const router = useRouter();
  const { moduleId } = router.query;

  const [userId, setUserId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [isCourseCompleted, setIsCourseCompleted] = useState(false);
  const [moduleRating, setModuleRating] = useState(1);
  const [instructorRating, setInstructorRating] = useState(1);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (moduleId) fetchCourseId();
  }, [moduleId]);

  const fetchCourseId = async () => {
    try {
      setError('');
      console.log('Fetching course ID for module:', moduleId);
  
      const moduleResponse = await axios.get(`http://localhost:3000/modules/${moduleId}`);
      if (moduleResponse.data.course_id) {
        setCourseId(moduleResponse.data.course_id.toString());
        console.log('Fetched Course ID:', moduleResponse.data.course_id.toString());
      } else {
        console.error('Course ID is missing in the module response.');
        setError('Failed to fetch course ID. Please try again.');
      }
    } catch (err) {
      console.error('Error fetching course ID:', err.response?.data || err.message);
      setError('Failed to fetch course ID. Please try again.');
    }
  };
  

  const checkCourseCompletion = async () => {
    try {
      if (!userId) {
        setError('User ID is required.');
        return;
      }
      if (!courseId) {
        setError('Course ID is not available. Please refresh the page.');
        return;
      }
  
      setError('');
      const userResponse = await axios.get(`http://localhost:3000/user/${userId}/profile`);
      const completedCourses = userResponse.data.completed_courses || [];
  
      console.log('Completed Courses:', completedCourses);
      console.log('Course ID to Check:', courseId);
  
      // Ensure courseId is a string and compare
      const isCompleted = completedCourses.includes(courseId);
      console.log('Is Course Completed:', isCompleted);
  
      setIsCourseCompleted(isCompleted);
      if (!isCompleted) alert('Course is not completed. Only module rating is available.');
    } catch (err) {
      console.error('Error fetching user data:', err.response?.data || err.message);
      setError('Failed to fetch user data. Please try again.');
    }
  };
  
  

  const handleRateModule = async () => {
    try {
      await axios.patch(`http://localhost:3000/modules/${moduleId}/rate`, {
        module_rating: moduleRating,
      });
      alert('Module rating submitted successfully.');
      router.push(`/modules/${moduleId}/all-modules`);
    } catch (err) {
      console.error('Error rating module:', err.response?.data || err.message);
      setError('Failed to rate module. Please try again.');
    }
  };

  const handleRateInstructor = async () => {
    try {
      await axios.patch(`http://localhost:3000/courses/${courseId}/rate-instructor`, {
        rating: instructorRating,
      });
      alert('Instructor rating submitted successfully.');
      router.push(`/modules/${moduleId}/all-modules`);
    } catch (err) {
      console.error('Error rating instructor:', err.response?.data || err.message);
      setError('Failed to rate instructor. Please try again.');
    }
  };

  const handleAddComment = async () => {
    try {
      await axios.post(`http://localhost:3000/courses/${courseId}/comments`, {
        comment,
      });
      alert('Comment added successfully.');
      router.push(`/modules/${moduleId}/all-modules`);
    } catch (err) {
      console.error('Error adding comment:', err.response?.data || err.message);
      setError('Failed to add comment. Please try again.');
    }
  };

  return (
    <div>
      <h1>Rate Module</h1>
      <label>
        User ID:
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Enter your User ID"
        />
      </label>
      <button onClick={checkCourseCompletion}>
        Check Completion
      </button>
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
    </div>
  );
};

export default RateModulePage;
