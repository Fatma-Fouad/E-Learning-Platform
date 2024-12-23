// pages/admin/delete-account.tsx

import React, { useState } from 'react';
import axios from 'axios';

const DeleteAccount = () => {
  const [role, setRole] = useState('student'); // Default role is 'student'
  const [userId, setUserId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle form submission
  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!role || !userId) {
      setError('Both User ID and Role are required.');
      return;
    }

    try {
      const response = await axios.delete(
        `http://localhost:4000/user/accounts/${role}/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setSuccess(response.data.message || 'Account deleted successfully!');
      setUserId('');
      setRole('student');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to delete account.');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
      <h1>🗑️ Delete User Account</h1>
      <form onSubmit={handleDeleteAccount}>
        {/* User ID Input */}
        <div style={{ marginBottom: '1rem' }}>
          <label>User ID:</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter User ID"
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        {/* Role Selection */}
        <div style={{ marginBottom: '1rem' }}>
          <label>Role:</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          >
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          style={{
            backgroundColor: '#ff4d4f',
            color: 'white',
            padding: '10px',
            width: '100%',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1rem',
            borderRadius: '5px',
            marginTop: '1rem',
          }}
        >
          Delete Account
        </button>
      </form>

      {/* Success Message */}
      {success && (
        <p style={{ color: 'green', marginTop: '1rem', textAlign: 'center' }}>{success}</p>
      )}

      {/* Error Message */}
      {error && (
        <p style={{ color: 'red', marginTop: '1rem', textAlign: 'center' }}>{error}</p>
      )}
    </div>
  );
};

export default DeleteAccount;
