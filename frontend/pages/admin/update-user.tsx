import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const UpdateProfile = () => {
  const router = useRouter();
  const [userId, setUserId] = useState<string>(''); // User ID entered by the user
  const [profile, setProfile] = useState<any>(null);
  const [name, setName] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch the user's current profile data when the userId is entered
  useEffect(() => {
    if (!userId) return; // Ensure we have a userId

    const fetchProfile = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/user/${userId}/profile`);
        setProfile(response.data);
        setName(response.data.name);
        setProfilePicture(response.data.profile_picture_url);
        setEmail(response.data.email);
        setPhoneNumber(response.data.phone_number);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch profile data.');
      }
    };

    if (userId) fetchProfile();
  }, [userId]); // Trigger when userId changes

  // Handle form submission to update the profile
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updateData = {
      name,
      profile_picture_url: profilePicture,
      phone_number: phoneNumber,
      email, // Include email in the update data
    };

    try {
      const response = await axios.put(
        `http://localhost:3000/user/${userId}/profiles`,
        updateData
      );
      setSuccessMessage('Profile updated successfully!');
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile.');
      setSuccessMessage('');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: 'auto' }}>
      <h1>Update Your Profile</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}

      {/* User ID Input */}
      <div style={{ marginBottom: '1rem' }}>
        <label>
          User ID:
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter your user ID"
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '5px',
              border: '1px solid #ccc',
            }}
          />
        </label>
      </div>

      {/* If the profile is loaded, show the form */}
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
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
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
