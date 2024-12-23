import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

const Home = () => {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: string; email: string } | null>(null);

  // Fetch user information from localStorage
  useEffect(() => {
    const name = localStorage.getItem("name");
    const role = localStorage.getItem("role");
    const email = localStorage.getItem("email");

    if (name && role && email) {
      setUser({ name, role, email });
    } else {
      // Redirect to login if no user info exists
      router.push("/login");
    }
  }, [router]);

  // Handle logout
  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  // Handle Dashboard Redirection based on Role
  const handleDashboardRedirect = () => {
    if (user?.role === "student") {
      router.push("/student/dashboard");
    } else if (user?.role === "instructor") {
      router.push("/instructor/dashborad");
    } else if (user?.role === "admin") {
      router.push("/admin/[adminId]/dashboard");
    }
  };

  // Handle Courses
  const Courses = () => {
    router.push("/courses");
  };

  // Handle Find-Course
  const Find_Course = () => {
    router.push("/courses/FindCourse");
  };

  // Handle Student Courses
  const handleStudentCourses = () => {
    router.push("/courses/MyCourses_st");
  };

  // Handle Instructor Courses
  const handleInstructorCourses = () => {
    router.push("/courses/MyCourses_in");
  };

  return (
    <div>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <h2 style={styles.logo}>E-Learning Platform</h2>
        <button onClick={Find_Course} style={styles.button}>
          Find a Course
        </button>
        {user?.role === "student" && (
          <button style={styles.button} onClick={handleStudentCourses}>
            My Courses (Student)
          </button>
        )}
        {user?.role === "instructor" && (
          <button style={styles.button} onClick={handleInstructorCourses}>
            My Courses (Instructor)
          </button>
        )}
        {user && (
          <button onClick={handleDashboardRedirect} style={styles.dashboardButton}>
            Go to {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard
          </button>
        )}
        <button onClick={handleLogout} style={styles.logoutButton}>
          Logout
        </button>
      </nav>

      {/* Content */}
      <div style={styles.content}>
        <h1 style={styles.textCenter}>Welcome to the Home Page!</h1>
        {user ? (
          <div style={styles.userInfo}>
            <p>
              <strong>Name:</strong> {user.name}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Role:</strong> {user.role}
            </p>
          </div>
        ) : (
          <p>Loading user information...</p>
        )}
      </div>
    </div>
  );
};

export default Home;

// Inline styles for simplicity
const styles: { [key: string]: React.CSSProperties } = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#0070f3",
    color: "white",
    padding: "1rem 2rem",
    flexWrap: "wrap", // 'flexWrap' is valid CSS here
  },
  logo: {
    margin: 0,
    fontSize: "1.5rem",
  },
  dashboardButton: {
    backgroundColor: "#34D399",
    border: "none",
    color: "white",
    padding: "0.5rem 1rem",
    cursor: "pointer",
    fontSize: "1rem",
    borderRadius: "5px",
    marginRight: "1rem",
    transition: "background-color 0.3s",
  },
  logoutButton: {
    backgroundColor: "#ff4d4f",
    border: "none",
    color: "white",
    padding: "0.5rem 1rem",
    cursor: "pointer",
    fontSize: "1rem",
    borderRadius: "5px",
    marginRight: "1rem",
    transition: "background-color 0.3s",
  },
  content: {
    padding: "2rem",
    textAlign: "center" as React.CSSProperties["textAlign"], // Fixed textAlign type
  },
  textCenter: {
    textAlign: "center" as "center", // Explicitly cast to the correct type
  },
  userInfo: {
    marginTop: "1rem",
    fontSize: "1.2rem",
    lineHeight: "1.5",
    color: "#333",
  },
  button: {
    padding: "10px 15px",
    fontSize: "1rem",
    backgroundColor: "#4caf50",
    color: "#ffffff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    marginRight: "1rem",
  },
};
