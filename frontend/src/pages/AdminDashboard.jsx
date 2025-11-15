import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUsers, FaBriefcase, FaFileAlt, FaChartLine, FaCog, FaSignOutAlt, FaHome } from 'react-icons/fa';
import { getUserRole, isLoggedIn, clearAuthData } from '../utils/auth';
import api from '../utils/api';
import './AdminDashboard.css';

// Lazy load admin components with error boundary
const withErrorBoundary = (Component) => {
  return (props) => (
    <ErrorBoundary>
      <Suspense fallback={<div className="loading-spinner">Loading component...</div>}>
        <Component {...props} />
      </Suspense>
    </ErrorBoundary>
  );
};

// Simple error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Admin Dashboard Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h3>Something went wrong with this component.</h3>
          <p>{this.state.error?.message || 'Unknown error occurred'}</p>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Lazy load components with error boundaries
const AdminHome = withErrorBoundary(lazy(() => import('../components/admin/AdminHome')));
const DashboardOverview = withErrorBoundary(lazy(() => import('../components/admin/DashboardOverview')));
const JobManagement = withErrorBoundary(lazy(() => import('../components/admin/JobManagement')));
const UserManagement = withErrorBoundary(lazy(() => import('../components/admin/UserManagement')));
const ActivityLogs = withErrorBoundary(lazy(() => import('../components/admin/ActivityLogs')));
const ApplicationsManagement = withErrorBoundary(lazy(() => import('../components/admin/ApplicationsManagement')));
const Settings = withErrorBoundary(lazy(() => import('../components/admin/Settings')));

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const tabKeys = ['home', 'dashboard', 'jobs', 'users', 'applications', 'activities', 'settings'];

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const requestedTab = params.get('tab');

    if (requestedTab && tabKeys.includes(requestedTab)) {
      setActiveTab(requestedTab);
    } else if (!requestedTab && activeTab !== 'home') {
      setActiveTab('home');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // Check authentication and get user data
  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      try {
        if (!isLoggedIn()) {
          navigate('/login');
          return;
        }
        
        const userRole = getUserRole();
        if (userRole !== 'Admin') {
          console.warn('Non-admin user attempted to access admin dashboard');
          navigate('/dashboard');
          return;
        }
        
        // Try to fetch current user data
        try {
          const response = await api.get('/auth/me');
          if (isMounted && response.data) {
            setUser({
              name: response.data.name || 'Admin User',
              email: response.data.email || 'admin@example.com',
              role: response.data.role || 'Admin'
            });
          }
        } catch (apiError) {
          console.warn('Failed to fetch user data, using fallback:', apiError);
          if (isMounted) {
            setUser({
              name: 'Admin User',
              email: 'admin@example.com',
              role: 'Admin'
            });
          }
        }
      } catch (err) {
        console.error('Authentication check failed:', err);
        if (isMounted) {
          setError('Failed to verify authentication. Please try again.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    checkAuth();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleLogout = () => {
    clearAuthData();
    navigate('/login');
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
    const search = `?tab=${tabId}`;

    if (location.search !== search) {
      navigate(`/admin${search}`);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner">Loading dashboard...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-container">
          <div className="error-message">
            <h3>Error Loading Dashboard</h3>
            <p>{error}</p>
            <button 
              className="retry-button"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    try {
      return (
        <div className="admin-content-wrapper">
          {activeTab === 'home' && (
            <AdminHome user={user} onNavigate={(targetTab) => handleTabChange(targetTab)} />
          )}
          {activeTab === 'dashboard' && <DashboardOverview />}
          {activeTab === 'jobs' && <JobManagement />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'activities' && <ActivityLogs />}
          {activeTab === 'applications' && <ApplicationsManagement />}
          {activeTab === 'settings' && <Settings />}
        </div>
      );
    } catch (error) {
      console.error('Error rendering admin content:', error);
      return (
        <div className="error-container">
          <div className="error-message">
            <h3>Something went wrong</h3>
            <p>Failed to load the requested component. Please try again.</p>
            <button 
              className="retry-button"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
  };

  const menuItems = [
    { id: 'home', label: 'Home', icon: <FaHome /> },
    { id: 'dashboard', label: 'Dashboard', icon: <FaChartLine /> },
    { id: 'jobs', label: 'Manage Jobs', icon: <FaBriefcase /> },
    { id: 'users', label: 'Users', icon: <FaUsers /> },
    { id: 'applications', label: 'Applications', icon: <FaFileAlt /> },
    { id: 'activities', label: 'Activity Logs', icon: <FaFileAlt /> },
    { id: 'settings', label: 'Settings', icon: <FaCog /> },
  ];

  if (loading) {
    return <div className="loading-fullscreen">Loading admin dashboard...</div>;
  }

  return (
    <div className={`admin-dashboard ${!isSidebarOpen ? 'sidebar-collapsed' : ''}`}>
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
          <button 
            className="sidebar-toggle"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isSidebarOpen ? '«' : '»'}
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <ul>
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => handleTabChange(item.id)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {isSidebarOpen && <span className="nav-label">{item.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="mobile-header">
        <button 
          className="menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          ☰
        </button>
        <h1>Admin Dashboard</h1>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <h3>Menu</h3>
              <button onClick={() => setIsMobileMenuOpen(false)}>×</button>
            </div>
            <nav className="mobile-nav">
              <ul>
                {menuItems.map((item) => (
                  <li key={item.id}>
                    <button
                      className={`mobile-nav-link ${activeTab === item.id ? 'active' : ''}`}
                      onClick={() => {
                        handleTabChange(item.id);
                      }}
                    >
                      <span className="mobile-nav-icon">{item.icon}</span>
                      <span className="mobile-nav-label">{item.label}</span>
                    </button>
                  </li>
                ))}
                <li>
                  <button className="mobile-nav-link" onClick={handleLogout}>
                    <span className="mobile-nav-icon"><FaSignOutAlt /></span>
                    <span className="mobile-nav-label">Logout</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-header">
          <h2>
            {menuItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
          </h2>
          <div className="user-info">
            <span className="user-name">{user?.name || 'Admin'}</span>
            <span className="user-role">{user?.role || 'Administrator'}</span>
          </div>
        </div>
        
        <div className="admin-content">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
