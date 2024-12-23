import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

const Home = () => {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: string; email: string; gpa?: number } | null>(null);
  const [gpa, setGpa] = useState(null);
  const token = localStorage.getItem("token");
  const storedUserId = localStorage.getItem("userId");

  // Fetch user information from localStorage
  useEffect(() => {
    const name = localStorage.getItem("name");
    const role = localStorage.getItem("role");
    const email = localStorage.getItem("email");

    if (name || role) {
      setUser({
        name,
        role,
        email,
      });
    } else {
      // Redirect to login if no user info exists
      router.push("/login");
    }
  }, [router]);

  // Fetch the GPA for students
  useEffect(() => {
    if (user?.role === "student") {
      const fetchStudentGPA = async () => {
        if (!storedUserId) {
          console.error("No student ID found in local storage.");
          return;
        }

        try {
          const response = await axios.get(
            `http://localhost:3000/user/${storedUserId}/profile`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          console.log("Student data:", response.data); // Log the student data

          const fetchedGpa = response.data?.gpa; // Assuming GPA is under data.gpa
          if (fetchedGpa !== undefined) {
            console.log("Fetched GPA:", fetchedGpa);
            setGpa(fetchedGpa);
          } else {
            console.error("GPA not found for the student.");
          }
        } catch (err) {
          console.error("Error fetching student data:", err);
        }
      };

      fetchStudentGPA();
    }
  }, [user, storedUserId, token]);

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
        <button onClick={Find_Course} style={styles.logoutButton}>
          Find a course
        </button>
        {user?.role === "student" && (
          <button style={styles.logoutButton} onClick={handleStudentCourses}>
            My Courses
          </button>
        )}
        {user?.role === "instructor" && (
          <button style={styles.logoutButton} onClick={handleInstructorCourses}>
            My Courses
          </button>
        )}
      </nav>

      {/* Content */}
      <div>
        <h1>Welcome to the Home Page!</h1>
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
            {user?.role === "student" && (
              <p>
                <strong>GPA:</strong> {gpa !== null ? gpa : "Loading..."}
              </p>
            )}
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
  userInfo: {
    marginTop: "1rem",
    fontSize: "1.2rem",
  },
};
