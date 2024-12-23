import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AllUsers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/user/admin');
        setUsers(response.data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: 'auto' }}>
      <h1>👥 All Users</h1>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {users.map((user: any) => (
          <li
            key={user.id}
            style={{
              border: '1px solid #ccc',
              padding: '10px',
              margin: '10px 0',
              borderRadius: '5px',
              backgroundColor: '#f9f9f9',
            }}
          >
            <strong>Name:</strong> {user.name} <br />
            <strong>Email:</strong> {user.email} <br />
            <strong>Role:</strong> {user.role}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AllUsers;
