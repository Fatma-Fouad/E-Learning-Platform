// File: frontend/pages/modules/[moduleId]/manage-quizzes/page.tsx

import React from 'react';
import { useRouter } from 'next/router';

const ManageQuizzesPage = () => {
  const router = useRouter();
  const { moduleId } = router.query;

  return (
    <div>
      <h1>Manage Quizzes for Module: {moduleId}</h1>
      <button onClick={() => router.push(`/modules/${moduleId}/questionbank`)}>
        Access Question Bank
      </button>
      <button onClick={() => router.push(`/modules/${moduleId}/quizzes`)}>
        Access Quizzes
      </button>
    </div>
  );
};

export default ManageQuizzesPage;
