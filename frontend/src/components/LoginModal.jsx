import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../utils/api';
import { getUserFromToken } from '../utils/auth';
import GoogleLoginButton from './GoogleLoginButton';

const LoginModal = ({
  isOpen,
  onClose,
  onLoginSuccess,
  targetRole = 'Employer',
  mode = 'login',
  forceRole
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const isSignup = mode === 'signup';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!email || !password || (isSignup && (!name || !confirmPassword))) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      let response;

      if (isSignup) {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setIsLoading(false);
          return;
        }

        const resolvedRole = forceRole || (targetRole === 'Employer' ? 'Employer' : 'JobSeeker');

        response = await register({
          name,
          email,
          password,
          confirmPassword,
          role: resolvedRole
        });
      } else {
        response = await login({ email, password, role: targetRole });
      }

      if (response.token) {
        localStorage.setItem('token', response.token);
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        } else {
          // If user data isn't in the response, try to get it from the token
          const user = getUserFromToken();
          if (user) {
            localStorage.setItem('user', JSON.stringify(user));
          }
        }
        // Call the success handler which will handle the redirection
        onLoginSuccess();
        onClose();
      } else {
        setError('Invalid response from server. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleClose = () => {
    if (isSignup) {
      setName('');
      setPassword('');
      setConfirmPassword('');
      setEmail('');
    }
    onClose();
  };

  return (
    <div className="login-modal-overlay" role="dialog" aria-modal="true">
      <div className="login-modal-content">
        <div className="login-modal-header">
          <h2>{isSignup ? 'Create your account' : 'Login to Continue'}</h2>
          <button
            type="button"
            className="login-modal-close"
            onClick={handleClose}
            disabled={isLoading}
            aria-label="Close login modal"
          >
            ×
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="login-modal-form">
          {isSignup && (
            <label className="login-modal-label" htmlFor="name">
              Full Name
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="login-modal-input"
                required
                disabled={isLoading}
              />
            </label>
          )}

          <label className="login-modal-label" htmlFor="email">
            Email
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-modal-input"
              required
              disabled={isLoading}
            />
          </label>

          <label className="login-modal-label" htmlFor="password">
            Password
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-modal-input"
              required
              disabled={isLoading}
            />
          </label>

          {isSignup && (
            <label className="login-modal-label" htmlFor="confirmPassword">
              Confirm Password
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="login-modal-input"
                required
                disabled={isLoading}
              />
            </label>
          )}

          <button type="submit" className="btn btn-primary login-modal-submit" disabled={isLoading}>
            {isLoading ? (isSignup ? 'Creating account...' : 'Logging in...') : isSignup ? 'Sign Up' : 'Login'}
          </button>
        </form>

        <div className="login-modal-divider">
          <span>or {isSignup ? 'sign up' : 'continue'} with</span>
        </div>

        <div className="login-modal-social">
          <GoogleLoginButton targetRole={targetRole} onSuccess={onLoginSuccess} onClose={handleClose} mode={isSignup ? 'signup' : 'login'} />
        </div>

        <div className="login-modal-footer">
          <p>
            {isSignup ? 'Already have an account?' : "Don't have an account?"}
            <button
              type="button"
              className="login-modal-link"
              onClick={() => {
                handleClose();
                if (isSignup) {
                  navigate('/login', { state: { targetRole: forceRole || targetRole, returnTo: onLoginSuccess ? '/jobs' : null } });
                } else {
                  navigate('/register', { state: { role: forceRole || (targetRole === 'Employer' ? 'Employer' : 'JobSeeker') } });
                }
              }}
              disabled={isLoading}
            >
              {isSignup ? 'Log in' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginModal;
