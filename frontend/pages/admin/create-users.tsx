import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import bcrypt from 'bcryptjs'; // Import bcrypt for hashing

const CreateAccount = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student'); // Default role is 'student'
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  // Handle form submission
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !email || !password || !role) {
      setError('All fields are required!');
      return;
    }

    try {
      // Hash the password using bcrypt before sending it to the backend
      const passwordHash = await bcrypt.hash(password, 10);

      const response = await axios.post(
        `http://localhost:3000/user/accounts/${role}`,
        { name, email, password_hash: passwordHash, role }, // Send hashed password
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setSuccess(response.data.message || 'Account created successfully!');
      setName('');
      setEmail('');
      setPassword('');
      setRole('student'); // Reset to default role
    } catch (err: any) {
      console.error('Error creating user:', err);
      setError(err.response?.data?.message || 'Failed to create account.');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
      <h1>🛠️ Create User Account</h1>
      <form onSubmit={handleCreateAccount}>
        {/* Name Input */}
        <div style={{ marginBottom: '1rem' }}>
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter full name"
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        {/* Email Input */}
        <div style={{ marginBottom: '1rem' }}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
        </div>

        {/* Password Input */}
        <div style={{ marginBottom: '1rem' }}>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
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
            backgroundColor: '#0070f3',
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
          Create Account
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

export default CreateAccount;
