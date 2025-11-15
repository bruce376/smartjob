import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import api, { setAuthToken } from "../utils/api";
import GoogleLoginButton from "../components/GoogleLoginButton";

const Register = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const preSelectedRole = location.state?.role || "JobSeeker";
  const returnTo = location.state?.returnTo || null;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: preSelectedRole
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const requiredFields = [
        { key: "name", label: "Full Name" },
        { key: "email", label: "Email" },
        { key: "password", label: "Password" },
        { key: "confirmPassword", label: "Confirm Password" },
        { key: "role", label: "Role" }
      ];

      const missingFields = requiredFields
        .filter(({ key }) => !formData[key] || !formData[key].toString().trim())
        .map(({ label }) => label);

      if (missingFields.length > 0) {
        setError(`Please fill in: ${missingFields.join(", ")}`);
        setLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }

      if (formData.password && formData.password.length < 6) {
        setError("Password must be at least 6 characters long");
        setLoading(false);
        return;
      }

      const res = await api.post("/auth/register", formData);
      
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        
        // Set auth token for API requests
        setAuthToken(res.data.token);
        
        setError("Registration successful! Redirecting...");
        
        setTimeout(() => {
          if (returnTo) {
            navigate(returnTo);
          } else if (res.data.user.role === "Employer") {
            navigate("/employer");
          } else {
            navigate("/jobs");
          }
        }, 1500);
      } else {
        setError(res.data.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 409) {
          setError("An account with this email already exists.");
        } else if (err.response.data?.message) {
          setError(err.response.data.message);
        }
      } else if (err.request) {
        setError("Unable to connect to the server. Please check your connection.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Join SmartJob today</p>
        </div>

        {error && (
          <div className="error-message" style={{ whiteSpace: 'pre-line', marginBottom: '1rem', color: '#e74c3c' }}>
            {error}
          </div>
        )}

        <GoogleLoginButton mode="signup" />

        <div className="divider">
          <span>or</span>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              autoComplete="name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Password (min 6 characters)"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              minLength="6"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              minLength="6"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">I am a</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="JobSeeker">Job Seeker</option>
              <option value="Employer">Employer</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Login here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;