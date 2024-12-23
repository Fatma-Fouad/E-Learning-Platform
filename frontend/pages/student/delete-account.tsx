// pages/student/delete-account.tsx

import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const DeleteAccount: React.FC = () => {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setError(null);
    setSuccess(null);

    try {
      // Retrieve token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('User not authenticated. Please log in again.');
      }

      // API call to delete account
      await axios.delete(`http://localhost:4000/user/delete-account`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess('Account deleted successfully.');
      localStorage.clear(); // Clear local storage on successful deletion

      setTimeout(() => router.push('/login'), 2000); // Redirect to login page
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to delete account.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: 'auto' }}>
      <h1>🗑️ Delete Account</h1>
      <p style={{ marginBottom: '1rem' }}>
        Are you sure you want to delete your account? This action is{' '}
        <strong>irreversible</strong>.
      </p>
      <button
        onClick={handleDeleteAccount}
        disabled={isDeleting}
        style={{
          backgroundColor: '#e53935',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          cursor: isDeleting ? 'not-allowed' : 'pointer',
          fontSize: '1rem',
          borderRadius: '5px',
        }}
      >
        {isDeleting ? 'Deleting...' : 'Delete My Account'}
      </button>
      {success && <p style={{ color: 'green', marginTop: '1rem' }}>{success}</p>}
      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
      <button
        onClick={() => router.push('/student/dashboard')}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          borderRadius: '5px',
          backgroundColor: '#0070f3',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        Cancel
      </button>
    </div>
  );
};

export default DeleteAccount;
