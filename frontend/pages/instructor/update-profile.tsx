import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const UpdateProfile = () => {
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [name, setName] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [userId, setUserId] = useState<string | null>(null); // state for userId
  const [token, setToken] = useState<string | null>(null); // state for token

  // Fetch user ID and token from localStorage only on the client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUserId = localStorage.getItem('userId');
      const storedToken = localStorage.getItem('token');

      if (!storedUserId || !storedToken) {
        setError('No token or userId, please login');
        router.push('/login'); // Redirect to login page if no token or userId
      } else {
        setUserId(storedUserId);
        setToken(storedToken);
      }
    }
  }, [router]);

  // Fetch the user's current profile data
  useEffect(() => {
    if (userId && token) {
      const fetchProfile = async () => {
        try {
          const response = await axios.get(`http://localhost:3000/user/${userId}/profile`, {
            headers: {
              Authorization: `Bearer ${token}`, // Include token in the request header
            },
          });
          setProfile(response.data);
          setName(response.data.name);
          setProfilePicture(response.data.profile_picture);
          setEmail(response.data.email);
          setPhoneNumber(response.data.phone_number);
        } catch (err: any) {
          console.error(err);
          setError(err.response?.data?.message || 'Failed to fetch profile data.');
        }
      };

      fetchProfile();
    }
  }, [userId, token]);

  // Handle form submission to update the profile
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updateData = {
      name,
      profile_picture: profilePicture,
      phone_number: phoneNumber,
    };

    try {
      const response = await axios.put(
        `http://localhost:3000/user/${userId}/profile`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include token in the request header
          },
        }
      );
      setSuccessMessage('Profile updated successfully!');
      setError('');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update profile.');
      setSuccessMessage('');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: 'auto' }}>
      <h1>Update Your Profile</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}

      {profile ? (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label>
              Name:
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '5px',
                  border: '1px solid #ccc',
                }}
              />
            </label>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label>
              Profile Picture URL:
              <input
                type="text"
                value={profilePicture}
                onChange={(e) => setProfilePicture(e.target.value)}
                placeholder="Enter the URL for your profile picture"
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '5px',
                  border: '1px solid #ccc',
                }}
              />
            </label>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label>
              Email:
              <input
                type="email"
                value={email}
                readOnly
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '5px',
                  border: '1px solid #ccc',
                  backgroundColor: '#f5f5f5',
                  cursor: 'not-allowed',
                }}
              />
            </label>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label>
              Phone Number:
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter your phone number"
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '5px',
                  border: '1px solid #ccc',
                }}
              />
            </label>
          </div>

          <button
            type="submit"
            style={{
              backgroundColor: '#0070f3',
              color: 'white',
              padding: '10px',
              width: '100%',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              borderRadius: '5px',
            }}
          >
            Save Changes
          </button>
        </form>
      ) : (
        <p>Loading profile data...</p>
      )}
    </div>
  );
};

export default UpdateProfile;
