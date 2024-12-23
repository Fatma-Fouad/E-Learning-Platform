import React, { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

// Backend URL
const backend_url = "http://localhost:3000/auth";

// Interface for the response
interface LoginResponse {
  user: {
    userid: string; // Ensure this matches your backend field names
    role: string;
    name: string;
    email: string;
  };
}

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
        `${backend_url}/login`,
        { email: formData.email, password: formData.password },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Successful login
      if (response.status === 200 || response.status === 201) {
        console.log("xxxxxxxxxx",response)
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userData", JSON.stringify(response.data.user));
        localStorage.setItem("userId",response.data.user.userid)
        localStorage.setItem("role",response.data.user.role)
        localStorage.setItem("name",response.data.user.name)
        localStorage.setItem("email",response.data.user.email)
        setSuccess("Login successful. Redirecting...");
        setTimeout(() => router.push("/home"), 1000); // Redirect to home
      } else {
        throw new Error("User data is incomplete or missing.");
      }
    } catch (error: any) {
      console.error("Error during login:", error); // Log full error for debugging
      if (error.response) {
        setError(error.response.data.message || "Invalid email or password.");
      } else {
        setError("An unexpected error occurred. Please try again later.");
      }
    }

    setFormData({ email: "", password: "" });
  };


  const redirectToRegister = () => {
    router.push("/register");
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "400px", margin: "auto" }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
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
            marginBottom: "1rem",
          }}
        >
          Login
        </button>
      </form>
      <div style={{ marginBottom: "1rem" }}>
        <label htmlFor="haveAccount">Don't have an account?</label>
        <button
          type="button"
          onClick={redirectToRegister}
          style={{
            backgroundColor: "#0070f3",
            color: "white",
            padding: "10px",
            width: "100%",
            border: "none",
            cursor: "pointer",
            fontSize: "1rem",
            borderRadius: "5px",
            marginBottom: "1rem",
          }}
        >
          Register
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

export default Login;