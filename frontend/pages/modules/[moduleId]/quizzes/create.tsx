import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const CreateQuizPage = () => {
  const router = useRouter();
  const { moduleId, quizId, question_count, type } = router.query;

  const [userId, setUserId] = useState('');
  const [questionCount, setQuestionCount] = useState<string | ''>(
    typeof question_count === 'string' ? question_count : ''
  );
  const [quizType, setQuizType] = useState<string>(
    typeof type === 'string' ? type : 'mcq'
  );

  useEffect(() => {
    if (quizId) {
      console.log(`Editing quiz: ${quizId}`);
    }
  }, [quizId]);

  const handleSubmit = async () => {
    try {
      if (!userId && !quizId) {
        alert('User ID is required for new quizzes.');
        return;
      }

      if (!moduleId || !questionCount || !quizType) {
        alert('Please fill in all fields.');
        return;
      }

      const payload = {
        question_count: parseInt(questionCount, 10), // Ensure questionCount is parsed as an integer
        type: quizType,
      };

      if (quizId) {
        // Update existing quiz
        const response = await axios.patch(`http://localhost:3000/quizzes/${quizId}`, payload);
        alert(response.data.message || 'Quiz updated successfully.');
      } else {
        // Create new quiz
        const response = await axios.post(`http://localhost:3000/quizzes/${moduleId}`, {
          user_id: userId,
          ...payload,
        });
        alert(response.data.message || 'Quiz created successfully.');
      }

      // Redirect to the quizzes page after success
      router.push(`/modules/${moduleId}/quizzes`);
    } catch (err) {
      if (err.response) {
        console.error('Error:', err.response.data);
        alert(`Failed to submit quiz: ${err.response.data.message}`);
      } else {
        console.error('Error:', err.message);
        alert('Failed to submit quiz. Please try again later.');
      }
    }
  };

  return (
    <div>
      <h1>{quizId ? 'Edit Quiz' : 'Create Quiz'} for Module: {moduleId}</h1>
      {!quizId && (
        <label>
          User ID:
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
        </label>
      )}
      <br />
      <label>
        Question Count:
        <input
          type="number"
          value={questionCount}
          onChange={(e) => setQuestionCount(e.target.value)}
        />
      </label>
      <br />
      <label>
        Type:
        <select value={quizType} onChange={(e) => setQuizType(e.target.value)}>
          <option value="mcq">MCQ</option>
          <option value="tf">True/False</option>
          <option value="both">Both</option>
        </select>
      </label>
      <br />
      <button onClick={handleSubmit}>
        {quizId ? 'Update Quiz' : 'Create Quiz'}
      </button>
    </div>
  );
};

export default CreateQuizPage;
