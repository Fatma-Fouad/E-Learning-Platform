import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

const backend_url = "http://localhost:3000/backup";

const BackupDashboard = () => {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false); // Admin authorization
  const [lastBackupTime, setLastBackupTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Check if the user is an admin
  useEffect(() => {
    const fetchUserRole = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        if (localStorage.getItem("role") === "admin") {
          setIsAdmin(true);
        } else {
          router.push("/unauthorized"); // Redirect non-admin users
        }
      } catch (err) {
        console.error("Error checking role:", err);
        router.push("/login");
      }
    };

    fetchUserRole();
  }, []);

  // Fetch last backup time
  useEffect(() => {
    const fetchLastBackup = async () => {
      try {
        const response = await axios.get(
            `${backend_url}/last`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setLastBackupTime(response.data.lastBackupTime || "No backups yet.");
      } catch (err) {
        console.error("Error fetching last backup:", err);
      }
    };

    if (isAdmin) {
      fetchLastBackup();
    }
  }, [isAdmin]);

  // Trigger manual backup
  const triggerBackup = async () => {
    setLoading(true);
    setMessage(null);
  
    try {
      const response = await axios.get(`${backend_url}/start`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
  
      setLastBackupTime(response.data.timestamp); // Update last backup time
    } catch (err) {
        console.error("Error triggering backup:", err);
        setMessage("Backup failed. Please try again.");
    } finally {
        setLoading(false);
    }
    setMessage("Backup started successfully!");
  };

  // Schedule backup
  const scheduleBackup = async (frequency: string) => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await axios.post(
        `${backend_url}/schedule`,
        { frequency },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setMessage(`Backup scheduled successfully: ${frequency}`);
    } catch (err) {
      console.error("Error scheduling backup:", err);
      setMessage("Failed to schedule backup. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return <p>Loading...</p>;
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "auto" }}>
      <h1>Backup Dashboard</h1>
      <p><strong>Last Backup:</strong> {lastBackupTime}</p>
      {message && <p style={{ color: "green" }}>{message}</p>}

      <button
        onClick={triggerBackup}
        disabled={loading}
        style={{
          backgroundColor: "#0070f3",
          color: "white",
          padding: "10px",
          width: "100%",
          border: "none",
          cursor: "pointer",
          fontSize: "1rem",
          borderRadius: "5px",
          margin: "10px 0",
        }}
      >
        {loading ? "Backing Up..." : "Start Backup"}
      </button>

      <h3>Schedule Backups</h3>
      <div>
        <button
          onClick={() => scheduleBackup("daily")}
          disabled={loading}
          style={{
            backgroundColor: "#28a745",
            color: "white",
            padding: "10px",
            margin: "5px",
            border: "none",
            cursor: "pointer",
            fontSize: "1rem",
            borderRadius: "5px",
          }}
        >
          Schedule Daily Backup
        </button>
        <button
          onClick={() => scheduleBackup("weekly")}
          disabled={loading}
          style={{
            backgroundColor: "#ffc107",
            color: "white",
            padding: "10px",
            margin: "5px",
            border: "none",
            cursor: "pointer",
            fontSize: "1rem",
            borderRadius: "5px",
          }}
        >
          Schedule Weekly Backup
        </button>
      </div>
    </div>
  );
};

export default BackupDashboard;
