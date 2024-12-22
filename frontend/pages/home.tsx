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

    if (name || role) {
      setUser({ name, role , email});
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

  // Handle Courses
  const Courses = () => {
    router.push("/courses");
  };

  // Handle Find-Course
  const Find_Course = () => {
    router.push("courses/FindCourse");
  };

  // Handle Student courses
  const StudentCourses = () => {
    router.push("courses/MyCourses_st");
  };

  const handleStudentCourses = () => {
    router.push("/courses/MyCourses_st");
  };
  
  const handleInstructorCourses = () => {
    router.push("/courses/MyCourses_in");
  };
  


  return (
    <div>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <h2 style={styles.logo}>E-Learning Platform</h2>
        <button onClick={handleLogout} style={styles.logoutButton}>
          Logout
        </button>
        <button onClick={handleLogout} style={styles.logoutButton}>
          Logout
        </button>
        <button onClick={handleLogout} style={styles.logoutButton}>
          Logout
        </button>
        <button onClick={Find_Course} style={styles.logoutButton}>
          Find a course
        </button>
        {user?.role === "student" && (
          <button style={styles.logoutButton} onClick={handleStudentCourses}>
            My Courses (stud)
          </button>
        )}
        {user?.role === "instructor" && (
          <button style={styles.logoutButton} onClick={handleInstructorCourses}>
            My Courses (inst)
          </button>
        )}
      </nav>

      {/* Content */}
      <div>
        <h1>Welcome to the Home Page!</h1>
        {user ? (
          <div style={styles.userInfo}>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
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
const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#0070f3",
    color: "white",
    padding: "1rem 2rem",
  },
  logo: {
    margin: 0,
  },
  logoutButton: {
    backgroundColor: "#ff4d4f",
    border: "none",
    color: "white",
    padding: "0.5rem 1rem",
    cursor: "pointer",
    fontSize: "1rem",
    borderRadius: "5px",
  },
  content: {
    padding: "2rem",
    textAlign: "center",
  },
  userInfo: {
    marginTop: "1rem",
    fontSize: "1.2rem",
  },
  button: {
    padding: "15px 25px",
    fontSize: "1.1rem",
    backgroundColor: "#9fcdff", // Light pastel blue
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
};
