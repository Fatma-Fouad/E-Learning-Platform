import React from 'react';
import Link from 'next/link';

const InstructorDashboard = () => {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: 'auto' }}>
      <h1>👨‍🏫 Instructor Dashboard</h1>
      <p>Welcome to your instructor dashboard. Manage your profile, students, and courses easily.</p>

      <div style={{ marginTop: '2rem' }}>
        <h2>🔧 Actions</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li>
            <Link href="/instructor/update-profile">
              <button style={buttonStyle}>Update Profile</button>
            </Link>
          </li>
          <li>
            <Link href="/instructor/enrollstudent">
              <button style={buttonStyle}>Enroll Student</button>
            </Link>
          </li>
          <li>
            <Link href="/instructor/trackcomplete">
              <button style={buttonStyle}>Track Completed Courses</button>
            </Link>
          </li>
          <li>
            <Link href="/instructor/search-student">
              <button style={buttonStyle}>Search for Students</button>
            </Link>
          </li>
          <li>
            <Link href="/instructor/student-enrolled-courses">
              <button style={buttonStyle}>View Student Enrolled Courses</button>
            </Link>
          </li>
          <li>
            <Link href="/instructor/delete-profile">
              <button style={deleteButtonStyle}>Delete Account</button>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

const buttonStyle = {
  backgroundColor: '#0070f3',
  color: 'white',
  padding: '10px',
  width: '100%',
  border: 'none',
  cursor: 'pointer',
  fontSize: '1rem',
  borderRadius: '5px',
  marginBottom: '1rem',
};

const deleteButtonStyle = {
  ...buttonStyle,
  backgroundColor: '#d9534f',
};

export default InstructorDashboard;
