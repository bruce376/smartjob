import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  FaUsers, FaBriefcase, FaFileAlt, FaChartLine, 
  FaUserPlus, FaClipboardCheck, FaClock, FaUserCheck,
  FaSpinner, FaSync, FaArrowUp, FaArrowDown, FaExclamationCircle
} from 'react-icons/fa';
import './DashboardOverview.css';
import api from '../../utils/api';

// Helper components
const LoadingSpinner = ({ message = 'Loading...' }) => (
  <div className="d-flex flex-column align-items-center justify-content-center p-5">
  </div>
);

const ErrorMessage = ({ message, onRetry }) => (
  <div className="error-state">
    <FaExclamationCircle />
    <p>{message}</p>
    <button onClick={onRetry} className="retry-btn">
      <FaSync /> Try Again
    </button>
  </div>
);

const StatCard = ({ icon, title, value, change, isPositive }) => (
  <div className="stat-card">
    <div className="stat-icon">{icon}</div>
    <div className="stat-content">
      <h3>{title}</h3>
      <div className="stat-value">{value}</div>
      {change !== undefined && (
        <div className={`stat-change ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? <FaArrowUp /> : <FaArrowDown />}
          {Math.abs(change)}%
        </div>
      )}
    </div>
  </div>
);

const formatActivityTimestamp = (timestamp) => {
  if (!timestamp) return 'No timestamp available';

  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) {
    return typeof timestamp === 'string' ? timestamp : 'Invalid date';
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(parsed);
};

const DashboardOverview = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('7days');

  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsers: 0,
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    recentActivities: [],
    userGrowth: { labels: [], data: [] },
    jobTrends: { labels: [], data: [] }
  });
  
  const buildSummaryRows = useCallback((labels = [], data = []) => {
    return labels.map((label, index) => ({
      label,
      value: typeof data[index] === 'number' ? data[index] : 0,
    })).slice(0, 10);
  }, []);
  
  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/admin/stats', {
        params: { days: timeRange === '7days' ? 7 : 30 }
      });
      
      const data = response.data || {};
      
      // Prepare stats with defaults
      const dashboardData = {
        totalUsers: data.totalUsers || 0,
        newUsers: data.newUsers || 0,
        totalJobs: data.totalJobs || 0,
        activeJobs: data.activeJobs || 0,
        totalApplications: data.totalApplications || 0,
        pendingApplications: data.pendingApplications || 0,
        recentActivities: Array.isArray(data.recentActivities) ? data.recentActivities : [],
        userGrowth: data.userGrowth || { labels: [], data: [] },
        jobTrends: data.jobTrends || { labels: [], data: [] }
      };
      
      setStats(dashboardData);
      
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
      
      // Set empty state on error
      const emptyData = {
        totalUsers: 0,
        newUsers: 0,
        totalJobs: 0,
        activeJobs: 0,
        totalApplications: 0,
        pendingApplications: 0,
        recentActivities: [],
        userGrowth: { labels: [], data: [] },
        jobTrends: { labels: [], data: [] }
      };
      
      setStats(emptyData);
      
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  // Fetch data on component mount and when timeRange changes
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const userGrowthRows = useMemo(
    () => buildSummaryRows(stats.userGrowth?.labels, stats.userGrowth?.data),
    [buildSummaryRows, stats.userGrowth]
  );

  const jobTrendRows = useMemo(
    () => buildSummaryRows(stats.jobTrends?.labels, stats.jobTrends?.data),
    [buildSummaryRows, stats.jobTrends]
  );

  // Calculate changes for stats
  const calculateChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  // Render the component
  return (
    <div className="dashboard-overview">
      <div className="dashboard-header">
        <h2>Dashboard Overview</h2>
        <div className="time-range-selector">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            disabled={loading}
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="alert alert-warning">
          {error}
          <button 
            onClick={fetchDashboardData} 
            className="btn btn-link btn-sm p-0 ms-2"
          >
            <FaSync className="me-1" /> Retry
          </button>
        </div>
      )}

      <div className="stats-grid">
        <StatCard 
          icon={<FaUsers className="stat-icon-primary" />}
          title="Total Users"
          value={stats.totalUsers}
          change={calculateChange(stats.newUsers, stats.totalUsers - stats.newUsers)}
          isPositive={stats.newUsers > 0}
        />
        <StatCard 
          icon={<FaUserPlus className="stat-icon-success" />}
          title="New Users"
          value={stats.newUsers}
          change={stats.newUsers > 0 ? calculateChange(stats.newUsers, stats.totalUsers - stats.newUsers) : 0}
          isPositive={stats.newUsers > 0}
        />
        <StatCard 
          icon={<FaBriefcase className="stat-icon-warning" />}
          title="Active Jobs"
          value={stats.activeJobs}
          change={stats.totalJobs > 0 ? calculateChange(stats.activeJobs, stats.totalJobs - stats.activeJobs) : 0}
          isPositive={stats.activeJobs > 0}
        />
        <StatCard 
          icon={<FaFileAlt className="stat-icon-info" />}
          title="Applications"
          value={stats.totalApplications}
          change={stats.pendingApplications > 0 ? 
            Math.round((stats.pendingApplications / stats.totalApplications) * 100) : 0}
          isPositive={stats.pendingApplications > 0}
        />
      </div>

      <div className="charts-row">
        <div className="chart-container">
          <div className="chart-header">
            <h3>User Growth</h3>
            <div className="chart-legend">
              <span className="legend-dot" style={{ backgroundColor: 'rgba(75, 192, 192, 0.7)' }}></span>
              New Users
            </div>
          </div>
          <div className="chart-wrapper">
            {loading ? (
              <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
                <LoadingSpinner message="Loading user data..." />
              </div>
            ) : error ? (
              <div className="d-flex flex-column justify-content-center align-items-center p-4" style={{ minHeight: '200px' }}>
                <ErrorMessage 
                  message="Failed to load user growth data" 
                  onRetry={fetchDashboardData}
                />
              </div>
            ) : userGrowthRows.length > 0 ? (
              <ul className="chart-summary-list">
                {userGrowthRows.map(({ label, value }) => (
                  <li key={`user-growth-${label}`}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="d-flex flex-column justify-content-center align-items-center p-4 text-muted" style={{ minHeight: '200px' }}>
                <FaChartLine size={32} className="mb-2" />
                <p>No user data available for the selected period</p>
              </div>
            )}
          </div>
        </div>

        <div className="chart-container">
          <div className="chart-header">
            <h3>Job Postings</h3>
            <div className="chart-legend">
              <span className="legend-dot" style={{ background: 'linear-gradient(to right, rgba(54, 162, 235, 0.4), rgba(54, 162, 235, 0.1))' }}></span>
              Job Postings
            </div>
          </div>
          <div className="chart-wrapper">
            {loading ? (
              <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
                <LoadingSpinner message="Loading job data..." />
              </div>
            ) : error ? (
              <div className="d-flex flex-column justify-content-center align-items-center p-4" style={{ minHeight: '200px' }}>
                <ErrorMessage 
                  message="Failed to load job postings data" 
                  onRetry={fetchDashboardData}
                />
              </div>
            ) : jobTrendRows.length > 0 ? (
              <ul className="chart-summary-list">
                {jobTrendRows.map(({ label, value }) => (
                  <li key={`job-trend-${label}`}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="d-flex flex-column justify-content-center align-items-center p-4 text-muted" style={{ minHeight: '200px' }}>
                <FaBriefcase size={32} className="mb-2" />
                <p>No job posting data available for the selected period</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="recent-activities">
        <div className="section-header">
          <h3>Recent Activities</h3>
          <button 
            onClick={fetchDashboardData} 
            className="retry-btn"
            disabled={loading}
            title="Refresh activities"
          >
            <FaSync className={loading ? 'spinning' : ''} />
            Refresh
          </button>
        </div>
        
        {loading && (!stats.recentActivities || stats.recentActivities.length === 0) ? (
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '150px' }}>
            <LoadingSpinner message="Loading activities..." />
          </div>
        ) : error ? (
          <div className="d-flex flex-column justify-content-center align-items-center p-4" style={{ minHeight: '150px' }}>
            <ErrorMessage 
              message="Failed to load recent activities" 
              onRetry={fetchDashboardData}
            />
          </div>
        ) : (
          <div className="activity-list-container">
            {stats.recentActivities?.length > 0 ? (
              <ul className="activity-list">
                {stats.recentActivities.map((activity, index) => (
                  <li key={`activity-${index}`} className="activity-item">
                    <div className="activity-icon">
                      {activity.action === 'login' && <FaUserCheck className="text-success" />}
                      {activity.action === 'create' && <FaClipboardCheck className="text-primary" />}
                      {activity.action === 'update' && <FaClock className="text-warning" />}
                      {!['login', 'create', 'update'].includes(activity.action) && (
                        <FaFileAlt className="text-info" />
                      )}
                    </div>
                    <div className="activity-details">
                      <div className="activity-message">
                        <strong>{activity.user?.name || 'System'}</strong> {activity.description || 'Performed an action'}
                      </div>
                      <div className="activity-time">
                        {formatActivityTimestamp(activity.timestamp)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="no-activities">
                <FaFileAlt size={32} className="mb-2" />
                <p>No recent activities found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardOverview;

// Developer Notes (Optional Next Steps)
// 1. If you later want charts again, add `chart.js` and `react-chartjs-2` to package.json and
//    reintroduce the chart components that were previously removed.
// 2. Consider updating `DashboardOverview.css` to include styles tailored specifically to the new
//    summary lists. The current styling works, but custom rules could enhance the presentation.
