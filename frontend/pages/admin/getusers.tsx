import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const backend_url = "http://localhost:3000/user";


const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('token'); // Retrieve token from localStorage
      if (!token) {
        setError('Unauthorized. Please log in.');
        router.push('/login'); // Redirect to login if no token
        return;
      }

      try {
        const response = await axios.get(`${backend_url}/`, {
          headers: {
            Authorization: `Bearer ${token}`, // Attach the token in the request header
          },
        });
        setUsers(response.data);
      } catch (err: any) {
        console.error('Failed to fetch users:', err);
        setError(err.response?.data?.message || 'Failed to fetch users.');
        if (err.response?.status === 403 || err.response?.status === 401) {
          router.push('/unauthorized'); // Redirect to unauthorized page for non-admins
        }
      }
    };
    fetchUsers();
  }, [router]);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>👥 All Users</h1>
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <ul>
          {users.map((user: any) => (
            <li key={user.id}>
              {user.name} - {user.email} ({user.role})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AllUsers;
