import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { isLoggedIn, getUserRole, getUserFromToken } from '../utils/auth';
import { logout } from '../services/authService';
import '../styles/ProfileDropdown.css';

const DropdownItem = ({ to, onClick, icon, children }) => {
  const navigate = useNavigate();
  
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Navigate first, then call onClick
    if (to) {
      navigate(to);
    }
    
    // Call onClick after navigation (for closing dropdown)
    if (onClick) {
      setTimeout(() => onClick(), 0);
    }
  };

  return (
    <button className="dropdown-item" onClick={handleClick}>
      <span className="dropdown-icon">{icon}</span>
      <span className="dropdown-text">{children}</span>
    </button>
  );
};

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const user = getUserFromToken();
  const role = getUserRole();
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    logout();
    setIsOpen(false);
    navigate('/');
  }, [navigate]);

  // Close dropdown when clicking outside or when navigating
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    // Close dropdown when route changes
    const unlisten = () => {
      setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('popstate', unlisten);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('popstate', unlisten);
    };
  }, []);

  const toggleDropdown = useCallback((e) => {
    e.stopPropagation();
    setIsOpen(prev => !prev);
  }, []);

  if (!isLoggedIn()) return null;

  return (
    <div className="profile-dropdown" ref={dropdownRef}>
      <button 
        className="profile-button"
        onClick={toggleDropdown}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="user-avatar">👤</span>
        <span className="user-name">{user?.name || 'User'}</span>
        <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </button>
      
      {isOpen && (
        <div className="dropdown-menu">
          <div className="dropdown-header">
            <div className="user-email" title={user?.email || ''}>
              {user?.email || ''}
            </div>
            <div className="user-role">
              {role === 'JobSeeker' ? 'Job Seeker' : 'Employer'}
            </div>
          </div>
          
          <div className="dropdown-divider" />
          
          <DropdownItem 
            to="/settings" 
            icon="⚙️"
            onClick={() => setIsOpen(false)}
          >
            Account Settings
          </DropdownItem>
          
          {role === 'JobSeeker' && (
            <DropdownItem 
              to="/cv-profile" 
              icon="📄"
              onClick={() => setIsOpen(false)}
            >
              My CV Profile
            </DropdownItem>
          )}
          
          <div className="dropdown-divider" />
          
          <button 
            className="dropdown-item logout-button" 
            onClick={handleLogout}
          >
            <span className="dropdown-icon">🚪</span>
            <span className="dropdown-text">Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
