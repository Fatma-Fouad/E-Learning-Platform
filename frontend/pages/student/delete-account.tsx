import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const DeleteAccountPage = () => {
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const deleteAccount = async () => {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');

      if (!userId || !token) {
        setError('You are not authenticated.');
        return;
      }

      try {
        // Make a DELETE request to the backend to delete the account
        const response = await axios.delete(
          `http://localhost:3000/user/${userId}/delete-account`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Include token in the request header
            },
          }
        );

        setSuccessMessage('Account deleted successfully. Redirecting to login page...');
        setTimeout(() => {
          router.push('/login'); // Redirect to login page after successful deletion
        }, 2000);
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to delete account.');
      }    };

    deleteAccount(); // Call the function to delete the account
  }, [router]);

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: 'auto' }}>
      <h1>Delete Account</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
    </div>
  );
};

export default DeleteAccountPage;
