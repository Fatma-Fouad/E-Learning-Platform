import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const QuestionBankPage = () => {
  const router = useRouter();
  const { moduleId } = router.query; // Get moduleId from URL

  const [questionBank, setQuestionBank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newQuestion, setNewQuestion] = useState({
    question_text: '',
    options: ['', '', '', ''],
    correct_answer: '',
    difficulty: 'easy',
    type: 'mcq',
  });

  useEffect(() => {
    const fetchQuestionBank = async () => {
        try {
          const response = await axios.get(`http://localhost:3000/questionbank/${moduleId}`);
          
          // Check if the response contains a valid question bank
          if (!response.data.questionBank || response.data.questionBank.questions.length === 0) {
            console.warn('No Question Bank exists, redirecting to Create Question Bank page...');
            router.push(`/modules/${moduleId}/questionbank/create`);
          } else {
            setQuestionBank(response.data.questionBank);
          }
        } catch (err) {
          // Handle 404 error explicitly
          if (err.response && err.response.status === 404) {
            console.warn('Question bank not found, redirecting to create page...');
            router.push(`/modules/${moduleId}/questionbank/create`);
          } else {
            console.error('Error fetching question bank:', err);
          }
        } finally {
          setLoading(false);
        }
      };
      

    if (moduleId) {
      fetchQuestionBank();
    }
  }, [moduleId, router]);

  // Handle delete question
  const handleDeleteQuestion = async (questionId: string) => {
    try {
      await axios.delete(`http://localhost:3000/questionbank/${moduleId}/questions/${questionId}`);
      setQuestionBank((prev) => ({
        ...prev,
        questions: prev.questions.filter((q: any) => q.question_id !== questionId),
      }));
    } catch (err) {
      console.error('Failed to delete question:', err);
    }
  };

  // Handle input change for new question form
  const handleInputChange = (field: string, value: any) => {
    const updatedQuestion = { ...newQuestion, [field]: value };

    // Reset options when switching type to True/False
    if (field === 'type' && value === 'tf') {
      updatedQuestion.options = ['True', 'False'];
    } else if (field === 'type' && value === 'mcq') {
      updatedQuestion.options = ['', '', '', ''];
    }

    setNewQuestion(updatedQuestion);
  };

  // Handle options change for MCQ
  const handleOptionChange = (index: number, value: string) => {
    const updatedOptions = [...newQuestion.options];
    updatedOptions[index] = value;
    setNewQuestion({ ...newQuestion, options: updatedOptions });
  };

  // Handle submit new question
  const handleAddQuestion = async () => {
    try {
      if (!moduleId) {
        console.error('Module ID is missing!');
        return;
      }
  
      const payload = {
        questions: [newQuestion], // Ensure the question format matches your backend schema
      };
  
      console.log('Sending PATCH request with payload:', payload);
  
      const response = await axios.patch(
        `http://localhost:3000/questionbank/${moduleId}`,
        payload
      );
  
      console.log('Response from backend:', response.data);
  
      // Update question bank state with the new question
      setQuestionBank((prev) => ({
        ...prev,
        questions: [...prev.questions, newQuestion],
      }));
  
      // Clear the form
      setNewQuestion({
        question_text: '',
        options: ['', '', '', ''],
        correct_answer: '',
        difficulty: 'easy',
        type: 'mcq',
      });
    } catch (err) {
      console.error('Error adding question:', err);
    }
  };
  

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Question Bank for Module: {moduleId}</h1>
      {questionBank && questionBank.questions.length > 0 ? (
        <ul>
          {questionBank.questions.map((question: any, index: number) => (
            <li key={index}>
              <strong>Question:</strong> {question.question_text}
              <br />
              <strong>Options:</strong> {question.options.join(', ')}
              <br />
              <strong>Correct Answer:</strong> {question.correct_answer}
              <br />
              <strong>Difficulty:</strong> {question.difficulty}
              <br />
              <strong>Type:</strong> {question.type}
              <br />
              <button onClick={() => handleDeleteQuestion(question.question_id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No questions available in this question bank.</p>
      )}

      {/* Add New Question Form */}
      <h2>Add New Question</h2>
      <div style={{ border: '1px solid #ccc', padding: '10px', marginTop: '20px' }}>
        <label>Question Text:</label>
        <input
          type="text"
          value={newQuestion.question_text}
          onChange={(e) => handleInputChange('question_text', e.target.value)}
          placeholder="Enter question text"
        />

        <label>Type:</label>
        <select
          value={newQuestion.type}
          onChange={(e) => handleInputChange('type', e.target.value)}
        >
          <option value="mcq">MCQ</option>
          <option value="tf">True/False</option>
        </select>

        <label>Difficulty:</label>
        <select
          value={newQuestion.difficulty}
          onChange={(e) => handleInputChange('difficulty', e.target.value)}
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        {/* Options for MCQ */}
        {newQuestion.type === 'mcq' && (
          <div>
            <h4>Options:</h4>
            {newQuestion.options.map((option, index) => (
              <div key={index}>
                <label>Option {index + 1}:</label>
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Enter option ${index + 1}`}
                />
              </div>
            ))}
          </div>
        )}

        {/* Correct Answer */}
        <label>Correct Answer:</label>
        <input
          type="text"
          value={newQuestion.correct_answer}
          onChange={(e) => handleInputChange('correct_answer', e.target.value)}
          placeholder="Enter correct answer"
        />

        <button onClick={handleAddQuestion} style={{ marginTop: '10px' }}>
          Add Question
        </button>
      </div>
    </div>
  );
};

export default QuestionBankPage;
