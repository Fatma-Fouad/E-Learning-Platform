import ProfileCard from '../../components/ProfileCard';
import CourseList from '../../components/Courselist';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Link from 'next/link';

const StudentDashboard = () => {
  const router = useRouter();
  const { studentId } = router.query; // Get the dynamic studentId from the route
  const [profile, setProfile] = useState<any>(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!studentId) return; // Ensure we have a studentId before making requests

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch user profile
        const profileRes = await axios.get(`/api/user/profile/${studentId}`);
        setProfile(profileRes.data);

        // Fetch enrolled courses
        const enrolledRes = await axios.get(`/api/user/enrolled-courses/${studentId}`);
        setEnrolledCourses(enrolledRes.data);

        // Fetch completed courses
        const completedRes = await axios.get(`/api/user/completed-courses/${studentId}`);
        setCompletedCourses(completedRes.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

  const handleEnrollCourseRedirect = () => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      router.push(`/student/enrollcourse`); // Redirect to the EnrollCourse page
    }
  };

  // Remove a course
  const handleRemoveCourse = async (courseId: string) => {
    try {
      await axios.delete(`/api/user/remove-course/${studentId}/${courseId}`);
      setEnrolledCourses((prev) =>
        prev.filter((course: any) => course.id !== courseId)
      );
      setSuccessMessage('Course removed successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove course.');
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    try {
      await axios.delete(`/api/user/delete-account/${studentId}`);
      router.push('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete account.');
    }
  };

  // Redirect to search instructors page
  const handleSearchInstructorRedirect = () => {
    router.push(`/student/search-instructor?studentId=${studentId}`);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: 'auto' }}>
      <h1>🎓 Student Dashboard</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      {loading && <p>Loading...</p>}

      {/* Profile Section */}
      {profile && (
        <div>
          <h2>👤 Your Profile</h2>
          <ProfileCard profile={profile} />
          <Link href={`/student/${studentId}/update-profile`}>
            <button
              style={{
                backgroundColor: '#4caf50',
                color: 'white',
                padding: '10px',
                borderRadius: '5px',
                marginTop: '10px',
                cursor: 'pointer',
              }}
            >
              Update Profile
            </button>
          </Link>
        </div>
      )}

      {/* Enrolled Courses Section */}
      <div style={{ marginTop: '2rem' }}>
        <h2>📚 Enrolled Courses</h2>
        {enrolledCourses.length > 0 ? (
          <CourseList
            courses={enrolledCourses}
            onCourseClick={handleRemoveCourse}
          />
        ) : (
          <p>No enrolled courses available.</p>
        )}
        <button
  onClick={handleEnrollCourseRedirect}
  style={{
    backgroundColor: '#0070f3',
    color: 'white',
    padding: '10px',
    borderRadius: '5px',
    marginTop: '10px',
    cursor: 'pointer',
  }}
>
  Enroll in a New Course
</button>

      </div>

      {/* Completed Courses Section */}
      <div style={{ marginTop: '2rem' }}>
        <h2>✅ Completed Courses</h2>
        {completedCourses.length > 0 ? (
          <CourseList courses={completedCourses} />
        ) : (
          <p>No completed courses available.</p>
        )}
      </div>

      {/* Search Instructors Section */}
      <div style={{ marginTop: '2rem' }}>
        <h2>🔍 Search Instructors</h2>
        <button
          onClick={handleSearchInstructorRedirect}
          style={{
            backgroundColor: '#0070f3',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Search for Instructors
        </button>
      </div>

      {/* Account Deletion */}
      <div style={{ marginTop: '2rem' }}>
        <button
          onClick={handleDeleteAccount}
          style={{
            backgroundColor: '#ff4d4f',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Delete Account
        </button>
      </div>
    </div>
  );
};

export default StudentDashboard;
