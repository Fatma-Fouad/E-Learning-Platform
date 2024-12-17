import React, { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

const backend_url = "http://localhost:3000/auth"; // Backend running on port 3000

const Login = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<{ email: string; password: string }>({
    email: "",
    password: "",
  });

  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    try {
      // Send login request to backend
      const response = await axios.post(
        `${backend_url}/login`, // Backend endpoint
        { email: formData.email, password: formData.password },
        {
          withCredentials: true, // Allow cookies to be sent
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Successful login
      if (response.status === 200 || response.status === 201) {
        localStorage.setItem("userId",response.data.user._id)
        localStorage.setItem("role",response.data.user.role)
        localStorage.setItem("name",response.data.user.name)
        localStorage.setItem("email",response.data.user.email)
        setSuccess("Login successful. Redirecting...");
        console.log("User Data:", response.data.user); // Optional: log user data
        setTimeout(() => router.push("/home"), 1000); // Redirect to home page
      }
    } catch (error: any) {
      if (error.response) {
        setError(error.response.data.message || "Invalid email or password.");
      } else {
        setError("An unexpected error occurred. Please try again later.");
      }
    }

    // Clear input fields
    setFormData({ email: "", password: "" });
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            placeholder="Enter your email"
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            placeholder="Enter your password"
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
    </div>
  );
};

export default Login;
