import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, updateProfile, changePassword } from '../services/authService';
import '../styles/Settings.css';

const Settings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    name: '',
    email: ''
  });
  
  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Load user data on mount
  useEffect(() => {
    const loadUserData = () => {
      // First, check if user is logged in by checking localStorage
      const token = localStorage.getItem('token');
      const cachedUser = localStorage.getItem('user');
      
      if (!token) {
        setMessage({ type: 'error', text: 'Please log in to access settings' });
        setLoading(false);
        setTimeout(() => navigate('/login'), 1500);
        return;
      }
      
      // If we have cached user data, use it immediately
      if (cachedUser) {
        try {
          const user = JSON.parse(cachedUser);
          setProfileData({
            name: user.name || '',
            email: user.email || ''
          });
          setLoading(false);
          return;
        } catch (error) {
          console.error('Error parsing cached user:', error);
        }
      }
      
      // If no cached data, show error
      setMessage({ type: 'error', text: 'No user data found. Please log in again.' });
      setLoading(false);
      setTimeout(() => navigate('/login'), 2000);
    };

    loadUserData();
  }, [navigate]);

  // Handle profile form changes
  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
    setMessage({ type: '', text: '' });
  };

  // Handle password form changes
  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
    setMessage({ type: '', text: '' });
  };

  // Handle profile update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (!profileData.name.trim()) {
      setMessage({ type: 'error', text: 'Name cannot be empty' });
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await updateProfile({ name: profileData.name.trim() });
      
      if (result.success) {
        // Update the displayed data with the server response
        if (result.user) {
          setProfileData({
            name: result.user.name || '',
            email: result.user.email || ''
          });
        }
        setMessage({ type: 'success', text: result.message || 'Profile updated successfully!' });
      } else {
        // Check if it's an authentication error
        const authErrors = ['Not authenticated', 'Access forbidden', 'Session expired', 'token'];
        const isAuthError = authErrors.some(err => result.error?.toLowerCase().includes(err.toLowerCase()));
        
        if (isAuthError) {
          setMessage({ 
            type: 'error', 
            text: 'Your session has expired. Please log out and log back in to save changes.' 
          });
        } else {
          setMessage({ type: 'error', text: result.error || 'Failed to update profile' });
        }
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  // Handle password change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Please fill in all password fields' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters long' });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'Password changed successfully!' });
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        // Check if it's an authentication error
        const authErrors = ['Not authenticated', 'Access forbidden', 'Session expired', 'token'];
        const isAuthError = authErrors.some(err => result.error?.toLowerCase().includes(err.toLowerCase()));
        
        if (isAuthError) {
          setMessage({ 
            type: 'error', 
            text: 'Your session has expired. Please log out and log back in to change your password.' 
          });
        } else {
          setMessage({ type: 'error', text: result.error || 'Failed to change password' });
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <div className="settings-wrapper">
        <div className="settings-header">
          <h1>Account Settings</h1>
          <p>Manage your account information and security</p>
        </div>

        {/* Tab Navigation */}
        <div className="settings-tabs">
          <button
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('profile');
              setMessage({ type: '', text: '' });
            }}
          >
            <span className="tab-icon">👤</span>
            Profile Information
          </button>
          <button
            className={`tab-button ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('password');
              setMessage({ type: '', text: '' });
            }}
          >
            <span className="tab-icon">🔒</span>
            Change Password
          </button>
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`message ${message.type}`}>
            <span className="message-icon">
              {message.type === 'success' ? '✓' : '⚠'}
            </span>
            {message.text}
          </div>
        )}

        {/* Tab Content */}
        <div className="settings-content">
          {activeTab === 'profile' ? (
            <form onSubmit={handleProfileSubmit} className="settings-form">
              <div className="form-section">
                <h2>Personal Information</h2>
                <p className="form-description">Update your personal details</p>

                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={profileData.email}
                    readOnly
                    className="readonly-input"
                    title="Email cannot be changed"
                  />
                  <small className="form-hint">Email address cannot be changed</small>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="settings-form">
              <div className="form-section">
                <h2>Change Password</h2>
                <p className="form-description">Ensure your account is using a strong password</p>

                <div className="form-group">
                  <label htmlFor="currentPassword">Current Password</label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password (min. 6 characters)"
                    minLength="6"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirm new password"
                    minLength="6"
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
