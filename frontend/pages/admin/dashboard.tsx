// pages/admin/dashboard.tsx

import React from 'react';
import Link from 'next/link';

const AdminDashboard = () => {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: 'auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>🛡️ Admin Dashboard</h1>
      
      {/* User Management Section */}
      <section style={sectionStyle}>
        <h2>👥 User Management</h2>
        <div style={buttonContainerStyle}>
          <Link href="/admin/getusers">
            <button style={buttonStyle}>Get Users</button>
          </Link>
          <Link href="/admin/create-users">
            <button style={buttonStyle}>Create Account</button>
          </Link>
          <Link href="/admin/update-user">
            <button style={buttonStyle}>Update Account</button>
          </Link>
          <Link href="/admin/delete-user">
            <button style={buttonStyle}>Delete Account</button>
          </Link>
        </div>
      </section>


      {/* Enrollment Section */}
      <section style={sectionStyle}>
        <h2>📚 Course Management</h2>
        <div style={buttonContainerStyle}>
          <Link href="/admin/enrollstudent">
            <button style={buttonStyle}>Enroll Student</button>
          </Link>
        </div>
      </section>


      {/* Logout */}
      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <button
          style={{ ...buttonStyle, backgroundColor: 'red' }}
          onClick={() => {
            localStorage.clear();
            window.location.href = '/login';
          }}
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
};

// ✅ Styles
const sectionStyle: React.CSSProperties = {
    marginBottom: '2rem',
    padding: '1rem',
    border: '1px solid #ccc',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9',
  };
  
  const buttonContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginTop: '1rem',
  };
  
  const buttonStyle: React.CSSProperties = {
    backgroundColor: '#0070f3',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1rem',
  };
  
  export default AdminDashboard;