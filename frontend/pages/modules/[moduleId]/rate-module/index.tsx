import React from 'react';
import { useRouter } from 'next/router';

const RateModulePage = () => {
  const router = useRouter();
  const { moduleId } = router.query;

  return (
    <div>
      <h1>Rate Module: {moduleId}</h1>
      <p>This is the Rate Module page. You can implement the rating logic here later.</p>
    </div>
  );
};

export default RateModulePage;
