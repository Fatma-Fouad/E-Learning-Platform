import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { io, Socket } from "socket.io-client";
import { getSocket } from "../utils/socket";

const Home = () => {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: string; email: string; userId: string; gpa: string } | null>(null);
  const [notifications, setNotifications] = useState<{ type: string; content: string }[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Fetch user information from localStorage
  useEffect(() => {
    const name = localStorage.getItem("name");
    const role = localStorage.getItem("role");
    const email = localStorage.getItem("email");
    const userId = localStorage.getItem("userId");
    const gpa = localStorage.getItem("gpa") + "";

    if (name || role) {
      setUser({ name, role, email, userId, gpa });
      // Establish WebSocket connection and join notifications room
      const socket = getSocket(userId);
      socket.emit("joinNotifications", { userId });
    } else {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (user?.userId) {
      const socketConnection = io("http://localhost:3001", {
        query: { userId: user.userId },
      });

      // Join the notifications room
      socketConnection.emit("joinNotifications", { userId: user.userId });

      // Log events for debugging
      socketConnection.on("connect", () => {
        console.log("WebSocket connected:", socketConnection.id);
      });

      // Listen for notifications
      socketConnection.on("newNotification", (notification) => {
        console.log("New Notification Received:", notification); // Debugging log
        setNotifications((prev) => [...prev, notification]);
      });

      setSocket(socketConnection);

      // Cleanup on component unmount
      return () => {
        socketConnection.disconnect();
      };
    }
  }, [user?.userId]);

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
      router.push("/admin/dashboard");
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
  
  const handleInstructorCourses = () => {
    router.push("/courses/MyCourses_in");
  };
  
  const backup = () => {
    router.push("/backup/");
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
        {user?.role === "admin" && (<button onClick={backup} style={styles.logoutButton}>
          Backup Data
        </button>)}
      </nav>

      {/* Content */}
      <div style={{ padding: "20px" }}>
        <h1>Welcome to the Home Page!</h1>
        {user ? (
          <div style={userInfoStyle}>
            <p>
              <strong>Name:</strong> {user.name}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Role:</strong> {user.role}
            </p>

            {/* New Button to Navigate to Courses Page */}
            <button
              onClick={() => router.push("/courses")}
              style={{
                backgroundColor: "#0070f3",
                color: "white",
                padding: "10px",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "1rem",
                marginTop: "20px",
              }}
            >
              View Available Courses
            </button>
          </div>
        ) : (
          <p>Loading user information...</p>
        )}

        {/* Notifications */}
        <div style={notificationsContainerStyle}>
          {notifications.map((notification, index) => (
            <div key={index} style={notificationStyle}>
              <strong>{notification.type}:</strong> {notification.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;

const navbarStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: "#0070f3",
  color: "white",
  padding: "1rem 2rem",
};

const logoStyle: React.CSSProperties = {
  margin: 0,
};

const logoutButtonStyle: React.CSSProperties = {
  backgroundColor: "#ff4d4f",
  border: "none",
  color: "white",
  padding: "0.5rem 1rem",
  cursor: "pointer",
  fontSize: "1rem",
  borderRadius: "5px",
};

const userInfoStyle: React.CSSProperties = {
  marginTop: "1rem",
  fontSize: "1.2rem",
};

const notificationsContainerStyle: React.CSSProperties = {
  marginTop: "20px",
  position: "fixed",
  top: "10px",
  right: "10px",
  width: "300px",
  zIndex: 1000,
} as React.CSSProperties;

const notificationStyle: React.CSSProperties = {
  backgroundColor: "#0070f3",
  color: "white",
  padding: "10px",
  marginBottom: "10px",
  borderRadius: "5px",
  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
};
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
