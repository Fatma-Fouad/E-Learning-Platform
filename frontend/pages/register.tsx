import React, { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

const backend_url = "http://localhost:3001/auth"; // Backend running on port 3000

const Register = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: string
  }>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });

  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match. Please try again.");
      return;
    }

    // Check if role is selected
    if (!formData.role) {
      setError("Please select a role: Student or Instructor.");
      return;
    }

    try {
      // Send registration data to the backend
      const response = await axios.post(
        `${backend_url}/register`,
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      // Successful registration
      if (response.status === 201 || response.status === 200) {
        setSuccess("User registered successfully! Redirecting to login...");
        setTimeout(() => router.push("/login"), 2000); // Redirect to login page
      }
    } catch (error: any) {
      if (error.response) {
        setError(error.response.data.message || "Registration failed. Please try again.");
      } else {
        setError("An unexpected error occurred. Please try again later.");
      }
    }

    // Clear input fields
    setFormData({ name: "", email: "", password: "", confirmPassword: "", role: ""});
  };

  const redirectToLogin = () => {
    router.push("/login");
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "400px", margin: "auto" }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            placeholder="Enter your name"
            onChange={handleChange}
            required
            style={{ width: "95%", padding: "8px", marginTop: "5px" }}
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            placeholder="Enter your email"
            onChange={handleChange}
            required
            style={{ width: "95%", padding: "8px", marginTop: "5px" }}
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            placeholder="Enter your password"
            onChange={handleChange}
            required
            style={{ width: "95%", padding: "8px", marginTop: "5px" }}
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            placeholder="Confirm your password"
            onChange={handleChange}
            required
            style={{ width: "95%", padding: "8px", marginTop: "5px" }}
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="role">Role:</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          >
            <option value="">Select a role</option>
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
          </select>
        </div>
        <button
          type="submit"
          style={{
            backgroundColor: "#0070f3",
            color: "white",
            padding: "10px",
            width: "100%",
            border: "none",
            cursor: "pointer",
            fontSize: "1rem",
            borderRadius: "5px",
            marginBottom: "1rem"
          }}
        >
          Register
        </button>
      </form>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="haveAccount">Already have an account?</label>
          <button
          type="button"
          onClick={redirectToLogin}
          style={{
            backgroundColor: "#0070f3",
            color: "white",
            padding: "10px",
            width: "100%",
            border: "none",
            cursor: "pointer",
            fontSize: "1rem",
            borderRadius: "5px",
            marginBottom: "1rem"
          }}
        >
          Login
        </button>
        </div>

      {/* Success Message */}
      {success && (
        <p style={{ color: "green", marginTop: "1rem", textAlign: "center" }}>{success}</p>
      )}

      {/* Error Message */}
      {error && (
        <p style={{ color: "red", marginTop: "1rem", textAlign: "center" }}>{error}</p>
      )}
    </div>
  );
};

export default Register;
