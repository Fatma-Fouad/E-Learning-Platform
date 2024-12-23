import React, { useEffect,useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const TakeQuizPage = () => {
  const router = useRouter();
  const { moduleId } = router.query;

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState(null);

  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!token || !userId) {
      setError('Unauthorized access. Redirecting to login...');
      router.push('/login');
      return;
    }
    console.log('Retrieved Token:', token);
    console.log('Retrieved User ID:', userId);
  }, [router, token, userId]);

  // Fetch the quiz for the student
  const fetchQuiz = async () => {
    setError('');
    setFeedback(null);
    try {
      const response = await axios.post(`http://localhost:3000/quizzes/student/${moduleId}`, 
        {user_id: userId},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
      });
      setQuiz(response.data.quiz); // Store the fetched quiz
      console.log('Fetched Quiz:', response.data.quiz); // Debugging log
    } catch (err) {
      console.error('Error fetching quiz:', err.response?.data || err.message);
      setError('Failed to load quiz. Please try again later.');
    }
  };

  // Handle answer selection
  const handleAnswerChange = (questionId, selectedOption) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: selectedOption,
    }));
  };

  // Submit the quiz
  const handleSubmitQuiz = async () => {
    try {
      if (!quiz || !userId) {
        alert('Quiz data or User ID is missing. Please refresh and try again.');
        return;
      }

      // Build the answers array
      const answersArray = quiz.questions.map((q) => ({
        question_id: q.question_id,
        selected_option: answers[q.question_id] || '',
      }));

      // Validate that all questions are answered
      if (answersArray.some((a) => a.selected_option === '')) {
        alert('Please answer all questions before submitting.');
        return;
      }

      console.log('Submitting Payload:', {
        user_id: userId,
        quiz_id: quiz._id,
        answers: answersArray,
      });

      const response = await axios.post(`http://localhost:3000/responses/submit`, {
        user_id: userId,
        quiz_id: quiz._id,
        answers: answersArray,
      },{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

      console.log('Backend Response:', response.data);

      // Extract feedback from the nested response
      setFeedback(response.data.response.response); // Fix: Access the correct part of the response
    } catch (err) {
      console.error('Error submitting quiz:', err.response?.data || err.message);
      setError('Failed to submit quiz. Please try again later.');
    }
  };

  return (
    <div>
      <h1>Take Quiz for Module: {moduleId}</h1>
      <button onClick={fetchQuiz} disabled={!token || !userId}>
        Take Quiz
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Render Feedback */}
      {feedback && (
        <div>
          <h2>Quiz Feedback</h2>
          <p>Score: {feedback.score}%</p>
          <p>{feedback.recommendation}</p>
          <div>
            {feedback.feedback?.map((fb) => (
              <div key={fb.question_id}>
                <p>
                  <strong>Question:</strong>{' '}
                  {quiz.questions.find((q) => q.question_id === fb.question_id)?.question_text || 'Unknown Question'}
                </p>
                <p>
                  <strong>Your Answer:</strong>{' '}
                  <span style={{ color: fb.is_correct ? 'green' : 'red' }}>
                    {fb.selected_option.toUpperCase()}
                  </span>
                </p>
                {!fb.is_correct && (
                  <p>
                    <strong>Correct Answer:</strong>{' '}
                    <span style={{ color: 'green' }}>{fb.correct_answer.toUpperCase()}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
          <button onClick={() => router.push(`/modules/${moduleId}/rate-module`)}>Rate Module</button>
        </div>
      )}

      {/* Render Quiz */}
      {quiz && !feedback && (
        <div>
          {quiz.questions.map((q) => (
            <div key={q.question_id}>
              <p>{q.question_text}</p>
              {q.type === 'mcq' && (
                <ul>
                  {q.options.map((option, index) => (
                    <li key={index}>
                      <strong>{String.fromCharCode(97 + index).toUpperCase()}:</strong> {option}
                    </li>
                  ))}
                </ul>
              )}
              {q.type === 'tf' && (
                <ul>
                  <li>
                    <strong>True:</strong> True
                  </li>
                  <li>
                    <strong>False:</strong> False
                  </li>
                </ul>
              )}
              <select onChange={(e) => handleAnswerChange(q.question_id, e.target.value)}>
                <option value="">Select an answer</option>
                {q.type === 'mcq' && (
                  <>
                    <option value="a">A</option>
                    <option value="b">B</option>
                    <option value="c">C</option>
                    <option value="d">D</option>
                  </>
                )}
                {q.type === 'tf' && (
                  <>
                    <option value="t">True</option>
                    <option value="f">False</option>
                  </>
                )}
              </select>
            </div>
          ))}
          <button onClick={handleSubmitQuiz}>Submit Quiz</button>
        </div>
      )}
    </div>
  );
};

export default TakeQuizPage;
