import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const QuizzesPage = () => {
  const router = useRouter();
  const { moduleId } = router.query;

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem("token");
  console.log("Retrieved Token:", token);
  if (!token) {
    setError("Unauthorized access. Redirecting to login...");
    router.push("/login");
    return;
  }

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/quizzes/module/${moduleId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },});
        setQuiz(response.data.quiz);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          console.warn('Quiz not found, redirecting to create page...');
          router.push(`/modules/${moduleId}/quizzes/create`);
        } else {
          console.error('Error fetching quiz:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    if (moduleId) {
      fetchQuiz();
    }
  }, [moduleId]);

  const handleDeleteQuiz = async () => {
    try {
      await axios.delete(`http://localhost:3000/quizzes/${quiz._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },});
      alert('Quiz deleted successfully.');
      setQuiz(null);
      router.push(`/modules/${moduleId}/quizzes/create`);
    } catch (err) {
      console.error('Error deleting quiz:', err);
      alert('Failed to delete quiz. Please try again later.');
    }
  };

  const handleEditQuiz = () => {
    // Redirect to create page with quiz details as query parameters
    router.push({
      pathname: `/modules/${moduleId}/quizzes/create`,
      query: {
        quizId: quiz._id,
        question_count: quiz.question_count,
        type: quiz.type,
      },
    });
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      {quiz ? (
        <div>
          <h1>Quiz for Module: {moduleId}</h1>
          <p>
            <strong>Type:</strong> {quiz.type}
          </p>
          <p>
            <strong>Question Count:</strong> {quiz.question_count}
          </p>
          <button onClick={handleDeleteQuiz}>Delete Quiz</button>
          <button onClick={handleEditQuiz}>Edit Quiz</button>
        </div>
      ) : (
        <p>No quiz found. Redirecting...</p>
      )}
    </div>
  );
};

export default QuizzesPage;
