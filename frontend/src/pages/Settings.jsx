import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getCurrentUser, updateProfile, changePassword } from '../services/authService';
import '../styles/Settings.css';

const Settings = () => {
  const { t } = useTranslation();
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
        setMessage({ type: 'success', text: result.message || t('settings.profileUpdateSuccess') });
      } else {
        // Check if it's an authentication error
        const authErrors = ['Not authenticated', 'Access forbidden', 'Session expired', 'token'];
        const isAuthError = authErrors.some(err => result.error?.toLowerCase().includes(err.toLowerCase()));
        
        if (isAuthError) {
          setMessage({ 
            type: 'error', 
            text: t('settings.sessionExpired') 
          });
        } else {
          setMessage({ type: 'error', text: result.error || t('settings.profileUpdateError') });
        }
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage({ type: 'error', text: t('settings.generalError') });
    } finally {
      setSaving(false);
    }
  };

  // Handle password change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setMessage({ type: 'error', text: t('settings.fillAllPasswordFields') });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: t('settings.passwordMinLength') });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: t('settings.passwordsNotMatch') });
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
        setMessage({ type: 'success', text: result.message || t('settings.passwordChangeSuccess') });
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
            text: t('settings.sessionExpiredPassword') 
          });
        } else {
          setMessage({ type: 'error', text: result.error || t('settings.passwordChangeError') });
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('settings.generalError') });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-container">
        <div className="loading">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <div className="settings-wrapper">
        <div className="settings-header">
          <h1>{t('settings.title')}</h1>
          <p>{t('settings.subtitle')}</p>
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
            {t('settings.profileTab')}
          </button>
          <button
            className={`tab-button ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('password');
              setMessage({ type: '', text: '' });
            }}
          >
            <span className="tab-icon">🔒</span>
            {t('settings.passwordTab')}
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
                <h2>{t('settings.personalInfo')}</h2>
                <p className="form-description">{t('settings.personalInfoDesc')}</p>

                <div className="form-group">
                  <label htmlFor="name">{t('settings.fullName')}</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    placeholder={t('settings.fullNamePlaceholder')}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">{t('settings.emailAddress')}</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={profileData.email}
                    readOnly
                    className="readonly-input"
                    title={t('settings.emailCannotBeChanged')}
                  />
                  <small className="form-hint">{t('settings.emailCannotBeChanged')}</small>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? t('settings.saving') : t('settings.saveChanges')}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="settings-form">
              <div className="form-section">
                <h2>{t('settings.changePassword')}</h2>
                <p className="form-description">{t('settings.passwordDesc')}</p>

                <div className="form-group">
                  <label htmlFor="currentPassword">{t('settings.currentPassword')}</label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder={t('settings.currentPasswordPlaceholder')}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">{t('settings.newPassword')}</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder={t('settings.newPasswordPlaceholder')}
                    minLength="6"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">{t('settings.confirmNewPassword')}</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder={t('settings.confirmNewPasswordPlaceholder')}
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
                  {saving ? t('settings.updating') : t('settings.updatePassword')}
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
