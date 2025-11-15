import React, { useState, useEffect } from 'react';
import { FaUser, FaLock, FaBell, FaShieldAlt } from 'react-icons/fa';
import api from '../../utils/api';

const Settings = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
      setFormData({
        ...formData,
        name: response.data.name || '',
        email: response.data.email || ''
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      setMessage('Failed to load user information');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const response = await api.put('/auth/profile', {
        name: formData.name,
        email: formData.email
      });

      setUser(response.data.user);
      setMessage('Profile updated successfully');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage('New passwords do not match');
      setSaving(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage('Password must be at least 6 characters long');
      setSaving(false);
      return;
    }

    try {
      await api.post('/auth/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });

      setMessage('Password changed successfully');
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading settings...</div>;
  }

  return (
    <div className="admin-section">
      <h2>Admin Settings</h2>

      {message && (
        <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <div className="settings-container">
        {/* Profile Settings */}
        <div className="settings-card">
          <div className="card-header">
            <FaUser />
            <h3>Profile Information</h3>
          </div>
          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Role</label>
              <input
                type="text"
                value={user?.role || 'Admin'}
                disabled
                className="disabled-input"
              />
            </div>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>

        {/* Password Settings */}
        <div className="settings-card">
          <div className="card-header">
            <FaLock />
            <h3>Change Password</h3>
          </div>
          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                value={formData.currentPassword}
                onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                required
                minLength="6"
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                required
                minLength="6"
              />
            </div>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>

        {/* Account Security Info */}
        <div className="settings-card">
          <div className="card-header">
            <FaShieldAlt />
            <h3>Account Security</h3>
          </div>
          <div className="security-info">
            <div className="info-item">
              <label>Last Login:</label>
              <span>{user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</span>
            </div>
            <div className="info-item">
              <label>Account Created:</label>
              <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}</span>
            </div>
            <div className="info-item">
              <label>Two-Factor Authentication:</label>
              <span className="status-disabled">Not Enabled</span>
            </div>
          </div>
        </div>

        {/* Notifications (Placeholder) */}
        <div className="settings-card">
          <div className="card-header">
            <FaBell />
            <h3>Notifications</h3>
          </div>
          <div className="notification-settings">
            <div className="setting-item">
              <label>
                <input type="checkbox" defaultChecked disabled />
                Email notifications for new applications
              </label>
            </div>
            <div className="setting-item">
              <label>
                <input type="checkbox" defaultChecked disabled />
                Email notifications for system alerts
              </label>
            </div>
            <div className="setting-item">
              <label>
                <input type="checkbox" disabled />
                SMS notifications (Coming Soon)
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
