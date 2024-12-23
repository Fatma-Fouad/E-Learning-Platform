import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const DeleteAccountPage = () => {
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Get the userId and token from localStorage
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    if (!userId || !token) {
      setError('User is not authenticated. Please log in first.');
      return;
    }

    const handleDeleteAccount = async () => {
      try {
        // Making the DELETE request to the API endpoint with userId as parameter
        const response = await axios.delete(`http://localhost:3000/user/${userId}/delete-account`, {
          headers: {
            Authorization: `Bearer ${token}`, // Sending the token for authentication
          },
        });

        setSuccessMessage(response.data.message); // Display success message
        // After successful deletion, redirect the user to the login page or home page
        setTimeout(() => router.push('/login'), 2000); // Redirect after 2 seconds
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to delete account.');
      }
    };

    handleDeleteAccount();
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
