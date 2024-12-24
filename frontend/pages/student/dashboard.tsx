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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!studentId) return; // Ensure we have a studentId before making requests

    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token'); // Retrieve the token from localStorage

        // Fetch user profile
        const profileRes = await axios.get(
          `http://localhost:3000/user/profile/${studentId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Include token in the Authorization header
            },
          }
        );
        setProfile(profileRes.data);

        // Fetch enrolled courses
        const enrolledRes = await axios.get(
          `http://localhost:3000/user/enrolled-courses/${studentId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Include token in the Authorization header
            },
          }
        );
        setEnrolledCourses(enrolledRes.data);
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
      const token = localStorage.getItem('token'); // Retrieve the token from localStorage

      await axios.delete(
        `http://localhost:3000/user/remove-course/${studentId}/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include token in the Authorization header
          },
        }
      );
      setEnrolledCourses((prev) =>
        prev.filter((course: any) => course.id !== courseId)
      );
      setSuccessMessage('Course removed successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove course.');
    }
  };

  // Redirect to the Delete Account Page
  const handleDeleteAccountRedirect = () => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      router.push(`/student/delete-account`); // Redirect to the Delete Account page
    } else {
      setError('Student ID not found in localStorage.');
    }
  };

  // Redirect to search instructors page
  const handleSearchInstructorRedirect = () => {
    router.push(`/student/search-instructor?studentId=${studentId}`);
  };

  // Redirect to completed courses page
  const handleCompletedCoursesRedirect = () => {
    router.push(`/student/complete-courses`);
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

      {/* Redirect to Completed Courses Section */}
      <div style={{ marginTop: '2rem' }}>
        <h2>✅ Completed Courses</h2>
        <button
          onClick={handleCompletedCoursesRedirect}
          style={{
            backgroundColor: '#0070f3',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          View Completed Courses
        </button>
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

      {/* Account Deletion Button */}
      <div style={{ marginTop: '2rem' }}>
        <button
          onClick={handleDeleteAccountRedirect}
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
