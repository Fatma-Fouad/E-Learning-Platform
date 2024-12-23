// pages/student/search-instructor.tsx
import React, { useState } from 'react';
import axios from 'axios';

interface Instructor {
  id: string;
  name: string;
  email: string;
}

const SearchInstructor: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError('Please enter an instructor name.');
      return;
    }

    setLoading(true);
    setError(null);
    setInstructors([]);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('User not authenticated. Please log in again.');
      }

      const response = await axios.get(
        `http://localhost:3000/user/student/search-instructors?name=${encodeURIComponent(searchTerm)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setInstructors(response.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to search for instructors.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
      <h1>🔍 Search for Instructors</h1>
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          placeholder="Enter instructor name"
          style={{
            width: '100%',
            padding: '8px',
            marginBottom: '10px',
            borderRadius: '5px',
            border: '1px solid #ccc',
          }}
        />
        <button
          onClick={handleSearch}
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
          Search
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {instructors.length > 0 && (
        <div>
          <h2>📋 Instructor Results:</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {instructors.map((instructor) => (
              <li
                key={instructor.id}
                style={{
                  border: '1px solid #ccc',
                  padding: '10px',
                  margin: '10px 0',
                  borderRadius: '5px',
                }}
              >
                <strong>Name:</strong> {instructor.name}
                <br />
                <strong>Email:</strong> {instructor.email}
              </li>
            ))}
          </ul>
        </div>
      )}

      {instructors.length === 0 && !loading && !error && (
        <p>No instructors found. Please try another search term.</p>
      )}
    </div>
  );
};

export default SearchInstructor;
