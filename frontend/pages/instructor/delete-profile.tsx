import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const DeleteInstructorAccount = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();

  // Handle account deletion
  const handleDeleteAccount = async () => {
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      await axios.delete('/api/user/delete-account');
      setSuccessMessage('Account deleted successfully. Redirecting to login...');
      
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
      <h1>🛑 Delete Account</h1>
      <p>
        Warning: Deleting your account is permanent and cannot be undone. All your data will be
        removed from the system.
      </p>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      {loading && <p>Deleting your account...</p>}

      <button
        onClick={handleDeleteAccount}
        style={{
          backgroundColor: '#ff4d4f',
          color: 'white',
          padding: '10px',
          width: '100%',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1rem',
          borderRadius: '5px',
          marginTop: '20px',
        }}
        disabled={loading}
      >
        {loading ? 'Deleting...' : 'Delete My Account'}
      </button>

      <button
        onClick={() => router.push('/instructor/dashboard')}
        style={{
          backgroundColor: '#0070f3',
          color: 'white',
          padding: '10px',
          width: '100%',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1rem',
          borderRadius: '5px',
          marginTop: '10px',
        }}
      >
        Cancel
      </button>
    </div>
  );
};

export default DeleteInstructorAccount;