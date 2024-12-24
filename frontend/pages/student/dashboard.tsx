import { useRouter } from 'next/router';
import React from 'react';

const StudentDashboard = () => {
  const router = useRouter();

  const handleUpdateProfileRedirect = () => {
    router.push('/student/update-profile'); // Redirect to update profile page
  };

  const handleSearchInstructorRedirect = () => {
    router.push('/student/search-instructor'); // Redirect to search instructors page
  };

  const handleCompletedCoursesRedirect = () => {
    router.push('/student/complete-courses'); // Redirect to completed courses page
  };

  const handleRemoveCourseRedirect = () => {
    router.push('/student/remove-course'); // Redirect to remove course page
  };

  const handleEnrollCourseRedirect = () => {
    router.push('/student/enrollcourse'); // Redirect to enroll course page
  };

  const handleDeleteAccount = async () => {
    // Handle account deletion logic here (e.g., send API request)
    router.push('/student/delete-account');
  };

  const handleMyProfileRedirect = () => {
    router.push('/student/my-profile'); // Redirect to my profile page
  };

  const buttonStyle = {
    backgroundColor: '#0070f3',
    color: 'white',
    padding: '8px 12px', // Smaller padding
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '0.9rem', // Smaller font size
    marginBottom: '1rem',
    width: 'auto', // Auto width to fit content
  };

  const deleteButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#ff4d4f',
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#4caf50', // Green for positive actions
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: 'auto' }}>
      <h1>🎓 Student Dashboard</h1>

      {/* Update Profile Section */}
      <div style={{ marginTop: '2rem' }}>
        <h2>👤 Update Profile</h2>
        <button onClick={handleUpdateProfileRedirect} style={secondaryButtonStyle}>
          Update Profile
        </button>
      </div>

      {/* My Profile Section */}
      <div style={{ marginTop: '2rem' }}>
        <h2>👤 My Profile</h2>
        <button onClick={handleMyProfileRedirect} style={secondaryButtonStyle}>
          View My Profile
        </button>
      </div>

      {/* Completed Courses Section */}
      <div style={{ marginTop: '2rem' }}>
        <h2>✅ Completed Courses</h2>
        <button onClick={handleCompletedCoursesRedirect} style={buttonStyle}>
          View Completed Courses
        </button>
      </div>

      {/* Search Instructors Section */}
      <div style={{ marginTop: '2rem' }}>
        <h2>🔍 Search Instructors</h2>
        <button onClick={handleSearchInstructorRedirect} style={buttonStyle}>
          Search for Instructors
        </button>
      </div>

      {/* Remove Course Section */}
      <div style={{ marginTop: '2rem' }}>
        <h2>🗑️ Remove Course</h2>
        <button onClick={handleRemoveCourseRedirect} style={buttonStyle}>
          Remove a Course
        </button>
      </div>

      {/* Enroll in a Course Section */}
      <div style={{ marginTop: '2rem' }}>
        <h2>📚 Enroll in a New Course</h2>
        <button onClick={handleEnrollCourseRedirect} style={buttonStyle}>
          Enroll in Course
        </button>
      </div>

      {/* Account Deletion */}
      <div style={{ marginTop: '2rem' }}>
        <button onClick={handleDeleteAccount} style={deleteButtonStyle}>
          Delete Account
        </button>
      </div>
    </div>
  );
};

export default StudentDashboard;
