import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import api, { setAuthToken } from "../utils/api";
import GoogleLoginButton from "../components/GoogleLoginButton";

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const returnTo = location.state?.returnTo || null;
  const targetRole = location.state?.targetRole || null;
  
  // Set default role based on targetRole or URL
  const getDefaultRole = () => {
    if (targetRole) return targetRole;
    // Check if URL contains /admin
    if (window.location.pathname.includes('/admin')) return 'Admin';
    return 'JobSeeker';
  };
  
  const [selectedRole, setSelectedRole] = useState(getDefaultRole());
  const [formData, setFormData] = useState({ email: "", password: "" });
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
      // Client-side validation
      const { email, password } = formData;
      
      if (!email || !password) {
        throw new Error("Please enter both email and password");
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Please enter a valid email address");
      }

      console.log('Attempting login with:', { email, role: selectedRole });
      
      console.log('Attempting login with role:', selectedRole);
      
      // Make API call with credentials
      const res = await api.post("/auth/login", 
        { 
          email: email.trim(), 
          password: password.trim(), 
          role: selectedRole 
        },
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
      
      console.log('Login response data:', res.data);
      
      console.log('Login response:', res.data);
      
      // Handle successful login
      if (res.data.success && res.data.token) {
        // Store token and user data
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        
        // Set auth token for API requests
        setAuthToken(res.data.token);
        
        // Set default headers for future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        
        // Show success message
        setError("Login successful! Redirecting...");
        
        // Get the user role from response (case-insensitive check)
        const userRole = res.data.user?.role?.toLowerCase();
        console.log('User role from response:', userRole);
        
        // Redirect after a short delay
        setTimeout(() => {
          if (returnTo && !returnTo.startsWith('/admin')) {
            navigate(returnTo);
          } else if (userRole === 'admin') {
            console.log('Redirecting to admin dashboard');
            navigate("/admin", { replace: true });
          } else if (userRole === 'employer') {
            navigate("/employer", { replace: true });
          } else {
            navigate("/jobs", { replace: true });
          }
        }, 1000);
      } else {
        // Handle API response with success: false
        setError(res.data.message || "Login failed. Please try again.");
      }
    } catch (err) {
      // Handle API errors and validation errors
      if (err.response) {
        // Server responded with an error status code
        setError(err.response.data?.message || "");
      } else if (err.request) {
        // Request was made but no response received
        setError("Unable to connect to the server. Please check your internet connection.");
      } else {
        // Something happened in setting up the request
        setError(err.message || "An error occurred during login. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container auth-container--login">
      <div className="login-page">
        <div className="login-header">
          <h1>Welcome Back to SmartJob</h1>
          <p>Choose your account type to continue</p>
        </div>

        {/* Role Selection Tabs */}
        <div className="role-tabs">
          <button
            className={`role-tab ${selectedRole === "JobSeeker" ? "active" : ""}`}
            onClick={() => {
              setSelectedRole("JobSeeker");
              setError("");
            }}
          >
            <div className="role-icon">🔍</div>
            <div className="role-info">
              <h3>Job Seeker</h3>
              <p>Find and apply for jobs</p>
            </div>
          </button>

          <button
            className={`role-tab ${selectedRole === "Employer" ? "active" : ""}`}
            onClick={() => {
              setSelectedRole("Employer");
              setError("");
            }}
          >
            <div className="role-icon">💼</div>
            <div className="role-info">
              <h3>Employer</h3>
              <p>Post jobs and hire talent</p>
            </div>
          </button>

          <button
            className={`role-tab ${selectedRole === "Admin" ? "active" : ""}`}
            onClick={() => {
              setSelectedRole("Admin");
              setError("");
            }}
          >
            <div className="role-icon">🛡️</div>
            <div className="role-info">
              <h3>Admin</h3>
              <p>Manage platform & users</p>
            </div>
          </button>
        </div>

        {/* Login Form */}
        <div className="auth-card">
          <div className="auth-header">
            <h2>
              {selectedRole === "Admin" 
                ? "Admin Login" 
                : selectedRole === "Employer" 
                ? "Employer Login" 
                : "Job Seeker Login"}
            </h2>
            <p>
              {selectedRole === "Admin"
                ? "Login to manage platform and users"
                : selectedRole === "Employer"
                ? "Login to post jobs and manage applications"
                : "Login to browse jobs and track applications"}
            </p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <GoogleLoginButton mode="login" />

          <div className="divider">
            <span>or</span>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
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

            {/* Removed sex field from login form as it's not needed for login */}

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading 
                ? "Logging in..." 
                : selectedRole === "Admin" 
                ? "Login as Admin" 
                : `Login as ${selectedRole === "Employer" ? "Employer" : "Job Seeker"}`}
            </button>
          </form>

          <div className="auth-footer">
            {selectedRole === "Admin" ? (
              <p style={{ textAlign: 'center', color: '#666', fontSize: '14px' }}>
                Admin accounts are managed by system administrators
              </p>
            ) : (
              <p>
                Don't have an account?
                <Link
                  to="/register"
                  state={{ role: selectedRole, returnTo }}
                >
                  Register as {selectedRole === "Employer" ? "Employer" : "Job Seeker"}
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
