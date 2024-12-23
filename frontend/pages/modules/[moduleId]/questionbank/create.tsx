import React, { useState } from 'react';
import { useRouter } from 'next/router';

const CreateQuestionBankPage = () => {
  const router = useRouter();
  const { moduleId } = router.query;

  const [questionCount, setQuestionCount] = useState(0);

  const handleRedirectToAddQuestions = () => {
    // Pass the number of questions as a query parameter
    router.push(`/modules/${moduleId}/questionbank/addQuestions?count=${questionCount}`);
  };

  return (
    <div>
      <h1>Create Question Bank</h1>
      <p>Module ID: {moduleId}</p>
      <input
        type="number"
        placeholder="Number of Questions"
        value={questionCount}
        onChange={(e) => setQuestionCount(Number(e.target.value))}
      />
      <button onClick={handleRedirectToAddQuestions}>Add Your Questions</button>
    </div>
  );
};

export default CreateQuestionBankPage;
