import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const MyProfilePage = () => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const userId = localStorage.getItem('userId'); // Get the user ID from local storage

      if (!userId) {
        setError('User ID is not available.');
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:3000/user/${userId}/profile`
        );
        setUserProfile(response.data); // Assuming the response contains the user profile data
      } catch (err: any) {
        setError('Failed to fetch user profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: 'auto' }}>
      <h1>👤 My Profile</h1>
      {userProfile && (
        <div>
          <p><strong>Name:</strong> {userProfile.name}</p>
          <p><strong>Email:</strong> {userProfile.email}</p>
          <p><strong>Role:</strong> {userProfile.role}</p>
          <p><strong>Profile Pic:</strong> {userProfile.profile_picture_url}</p>
          <p><strong>created_at:</strong> {userProfile.created_at}</p>
          <p><strong>password_hash:</strong> {userProfile.password_hash}</p>
          {userProfile.profile_picture_url && (
            <img
              src={userProfile.profile_picture_url}
              alt="Profile Picture"
              style={{ width: '150px', height: '150px', borderRadius: '50%' }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default MyProfilePage;
