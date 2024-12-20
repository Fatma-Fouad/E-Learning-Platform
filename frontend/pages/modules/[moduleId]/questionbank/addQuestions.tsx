import React, { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const AddQuestionsPage = () => {
  const router = useRouter();
  const { moduleId, count } = router.query; // Get moduleId and count from query
  const questionCount = Number(count) || 0;

  const [questions, setQuestions] = useState(
    Array.from({ length: questionCount }, () => ({
      question_text: '',
      options: ['', '', '', ''], // Default 4 options for MCQ
      correct_answer: '',
      difficulty: 'easy',
      type: 'mcq',
    }))
  );

  const handleInputChange = (index: number, field: string, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].options[oIndex] = value;
    setQuestions(updatedQuestions);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        module_id: moduleId,
        questions,
      };
      await axios.post('http://localhost:3000/questionbank', payload); // API call
      router.push(`/modules/${moduleId}/questionbank`); // Redirect back to question bank
    } catch (error) {
      console.error('Failed to create question bank:', error);
    }
  };

  return (
    <div>
      <h1>Add Questions</h1>
      {questions.map((q, index) => (
        <div key={index} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
          <h3>Question {index + 1}</h3>
          <label>Question Text:</label>
          <input
            type="text"
            value={q.question_text}
            onChange={(e) => handleInputChange(index, 'question_text', e.target.value)}
            placeholder="Enter question text"
          />

          <label>Type:</label>
          <select
            value={q.type}
            onChange={(e) => handleInputChange(index, 'type', e.target.value)}
          >
            <option value="mcq">MCQ</option>
            <option value="tf">True/False</option>
          </select>

          <label>Difficulty:</label>
          <select
            value={q.difficulty}
            onChange={(e) => handleInputChange(index, 'difficulty', e.target.value)}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          {q.type === 'mcq' ? (
            <div>
              <h4>Options</h4>
              {q.options.map((option, oIndex) => (
                <div key={oIndex}>
                  <label>Option {oIndex + 1}:</label>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, oIndex, e.target.value)}
                    placeholder={`Enter option ${oIndex + 1}`}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div>
              <label>Options for True/False:</label>
              <input
                type="text"
                value="True"
                disabled
              />
              <input
                type="text"
                value="False"
                disabled
              />
            </div>
          )}

          <label>Correct Answer:</label>
          <input
            type="text"
            value={q.correct_answer}
            onChange={(e) => handleInputChange(index, 'correct_answer', e.target.value)}
            placeholder="Enter correct answer"
          />
        </div>
      ))}
      <button onClick={handleSubmit}>Create Question Bank</button>
    </div>
  );
};

export default AddQuestionsPage;
