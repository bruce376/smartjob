import React from 'react';
import {
  FaBriefcase,
  FaUsers,
  FaFileAlt,
  FaCog,
  FaChartLine,
  FaShieldAlt,
  FaCheckCircle,
} from 'react-icons/fa';
import './AdminHome.css';

const AdminHome = ({ user, onNavigate }) => {
  const firstName = user?.name ? user.name.split(' ')[0] : 'Admin';

  const quickActions = [
    {
      id: 'dashboard',
      title: 'View analytics',
      description: 'Review platform metrics, growth trends, and activity snapshots.',
      icon: <FaChartLine />,
    },
    {
      id: 'jobs',
      title: 'Manage jobs',
      description: 'Approve, update, or remove job postings across the platform.',
      icon: <FaBriefcase />,
    },
    {
      id: 'users',
      title: 'Oversee users',
      description: 'Search, filter, and update user accounts and permissions.',
      icon: <FaUsers />,
    },
    {
      id: 'applications',
      title: 'Track applications',
      description: 'Monitor application flow and follow up on pending reviews.',
      icon: <FaFileAlt />,
    },
  ];

  const platformHighlights = [
    {
      id: 'security',
      title: 'Security first',
      description: 'Robust role-based access control keeps sensitive data protected.',
      icon: <FaShieldAlt />,
    },
    {
      id: 'automation',
      title: 'Powerful automation',
      description: 'Activity logging provides a full audit trail for every critical action.',
      icon: <FaCog />,
    },
  ];

  const nextSteps = [
    'Review latest activity logs to stay ahead of critical changes.',
    'Audit user roles and permissions to ensure least-privilege access.',
    'Encourage employers to refresh stale job postings for better visibility.',
  ];

  const handleNavigate = (targetTab) => {
    if (typeof onNavigate === 'function') {
      onNavigate(targetTab);
    }
  };

  return (
    <div className="admin-home">
      <section className="admin-home-hero">
        <div className="hero-text">
          <h1>Welcome back, {firstName}!</h1>
          <p>
            Use this home page to get a quick overview of the platform and jump straight into the
            management tools you need most.
          </p>
        </div>
        <div className="hero-actions">
          <button className="btn btn-primary" onClick={() => handleNavigate('dashboard')}>
            Go to analytics
          </button>
          <button className="btn btn-outline" onClick={() => handleNavigate('activities')}>
            Review activity logs
          </button>
        </div>
      </section>

      <section className="admin-home-section">
        <div className="section-header">
          <h2>Quick actions</h2>
          <p>Select an area below to manage the SmartJob platform efficiently.</p>
        </div>
        <div className="quick-actions-grid">
          {quickActions.map((action) => (
            <button
              key={action.id}
              className="quick-action-card"
              onClick={() => handleNavigate(action.id)}
              type="button"
            >
              <span className="card-icon">{action.icon}</span>
              <div className="card-content">
                <h3>{action.title}</h3>
                <p>{action.description}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="admin-home-section">
        <div className="section-header">
          <h2>Platform highlights</h2>
          <p>Stay confident knowing the essentials are covered.</p>
        </div>
        <div className="highlights-grid">
          {platformHighlights.map((highlight) => (
            <div key={highlight.id} className="highlight-card">
              <span className="card-icon">{highlight.icon}</span>
              <div className="card-content">
                <h3>{highlight.title}</h3>
                <p>{highlight.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="admin-home-section">
        <div className="section-header">
          <h2>Recommended next steps</h2>
          <p>Keep SmartJob running smoothly with these quick wins.</p>
        </div>
        <ul className="next-steps-list">
          {nextSteps.map((step, index) => (
            <li key={index}>
              <FaCheckCircle />
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default AdminHome;
