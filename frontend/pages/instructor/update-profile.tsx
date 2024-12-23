import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const UpdateProfile = () => {
  const router = useRouter();
  const userId = localStorage.getItem("userId"); // Get instructor userId from localStorage
  const token = localStorage.getItem("token"); // Get the token from localStorage

  const [profile, setProfile] = useState<any>(null);
  const [name, setName] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch the instructor's current profile data
  useEffect(() => {
    if (!userId || !token) return; // Ensure we have userId and token

    const fetchProfile = async () => {
      try {
        const response = await axios.get(`/api/user/${userId}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProfile(response.data);
        setName(response.data.name);
        setProfilePicture(response.data.profile_picture); // Assuming profile_picture is part of the response
        setEmail(response.data.email);
        setPhoneNumber(response.data.phone_number);
      } catch (err: any) {
        setError('Failed to fetch profile data');
      }
    };

    fetchProfile();
  }, [userId, token]);

  // Handle form submission to update the profile
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updateData = {
      name,
      profile_picture: profilePicture,
      email,
      phone_number: phoneNumber,
    };

    try {
      const response = await axios.put(`/api/user/${userId}/profile`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`, // Send token for authentication
        },
      });
      setSuccessMessage('Profile updated successfully!');
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
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
