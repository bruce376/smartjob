import React, { useState } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import api, { setAuthToken } from "../utils/api";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

// Check if Google Client ID is configured
const isGoogleConfigured = GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== "" && !GOOGLE_CLIENT_ID.includes("YOUR_");

const GoogleLoginButton = ({ mode = "login" }) => {
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [googleCredential, setGoogleCredential] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleGoogleError = (error) => {
    console.error("Google Sign-In Error:", error);
    setError("Google Sign-In is not available. Please try signing up with email instead.");
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    setLoading(true);

    try {
      const credential = credentialResponse.credential;

      // First, try to login/register without role
      // The backend expects this at /api/auth/google
      const response = await api.post("/auth/google", { credential });

      // Success - user exists or was created
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      
      // Set auth token for API requests
      setAuthToken(response.data.token);

      // Redirect based on role
      if (response.data.user.role === "Employer") {
        navigate("/employer");
      } else {
        navigate("/jobs");
      }
    } catch (err) {
      // Check if we need role selection
      if (err.response?.data?.needsRole) {
        setGoogleCredential(credentialResponse.credential);
        setShowRoleSelection(true);
      } else {
        setError(err.response?.data?.message || "Google sign-in failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // The backend expects this at /api/auth/google
      const response = await api.post("/auth/google", {
        credential: googleCredential,
        role: selectedRole,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      
      // Set auth token for API requests
      setAuthToken(response.data.token);

      // Redirect based on role
      if (response.data.user.role === "Employer") {
        navigate("/employer");
      } else {
        navigate("/jobs");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  if (showRoleSelection) {
    return (
      <div className="role-selection-modal">
        <div className="role-selection-content">
          <h3>Choose Your Role</h3>
          <p>Select how you want to use SmartJob:</p>

          <form onSubmit={handleRoleSubmit}>
            <div className="role-options">
              <label className={`role-option ${selectedRole === "JobSeeker" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="role"
                  value="JobSeeker"
                  checked={selectedRole === "JobSeeker"}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  required
                />
                <div className="role-info">
                  <span className="role-icon">👤</span>
                  <div>
                    <strong>Job Seeker</strong>
                    <p>Find and apply for jobs</p>
                  </div>
                </div>
              </label>

              <label className={`role-option ${selectedRole === "Employer" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="role"
                  value="Employer"
                  checked={selectedRole === "Employer"}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  required
                />
                <div className="role-info">
                  <span className="role-icon">💼</span>
                  <div>
                    <strong>Employer</strong>
                    <p>Post jobs and hire talent</p>
                  </div>
                </div>
              </label>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="role-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowRoleSelection(false);
                  setGoogleCredential(null);
                  setSelectedRole("");
                }}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading || !selectedRole}>
                {loading ? "Creating Account..." : "Continue"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Don't render if Google is not configured
  if (!isGoogleConfigured) {
    return (
      <div className="google-login-container">
        <div className="google-not-configured">
          <p style={{ fontSize: '13px', color: '#999', textAlign: 'center', padding: '10px' }}>
            Google Sign-In not configured yet
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="google-login-container" style={{ width: '100%', maxWidth: '300px', margin: '0 auto' }}>
      {error && <div className="error-message">{error}</div>}
      
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            text={mode === "signup" ? "signup_with" : "signin_with"}
            theme="outline"
            size="large"
            width="300"
            useOneTap={false}
            auto_select={false}
          />
        </div>
      </GoogleOAuthProvider>

      {loading && <p className="loading-text">Processing...</p>}
      
      <div style={{ marginTop: '10px', fontSize: '12px', color: '#666', textAlign: 'center' }}>
        If Google Sign-In doesn't work, please use email registration
      </div>
    </div>
  );
};

export default GoogleLoginButton;
