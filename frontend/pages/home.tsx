import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { io, Socket } from "socket.io-client";
import { getSocket } from "../utils/socket";

const Home = () => {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: string; email: string; userId: string } | null>(null);
  const [notifications, setNotifications] = useState<{ type: string; content: string }[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Fetch user information from localStorage
  useEffect(() => {
    const name = localStorage.getItem("name");
    const role = localStorage.getItem("role");
    const email = localStorage.getItem("email");
    const userId = localStorage.getItem("userId");

    if (name || role) {
      setUser({ name, role, email, userId });
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

  return (
    <div>
      {/* Navbar */}
      <nav style={navbarStyle}>
        <h2 style={logoStyle}>E-Learning Platform</h2>
        <button onClick={handleLogout} style={logoutButtonStyle}>
          Logout
        </button>
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
