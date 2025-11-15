import React, { useState, useEffect } from 'react';
import { FaDownload, FaFilter, FaSearch } from 'react-icons/fa';
import api from '../../utils/api';

const ActivityLogs = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateRange, setDateRange] = useState('30days');
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
  const [error, setError] = useState('');

  const fetchActivities = async (page = 1) => {
    try {
      setLoading(true);
      const response = await api.get('/admin/activities', {
        params: {
          page,
          search: searchTerm,
          action: actionFilter !== 'all' ? actionFilter : undefined,
          days: dateRange === '7days' ? 7 : dateRange === '30days' ? 30 : 365,
        },
      });
      setActivities(response.data.activities);
      setPagination({
        currentPage: response.data.page,
        totalPages: response.data.totalPages,
      });
    } catch (err) {
      console.error('Error fetching activity logs:', err);
      setError('Failed to load activity logs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [searchTerm, actionFilter, dateRange]);

  const handleExport = async () => {
    try {
      const response = await api.get('/admin/activities/export', {
        params: {
          format: 'csv',
          days: dateRange === '7days' ? 7 : dateRange === '30days' ? 30 : 365,
        },
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `activity-logs-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error exporting activity logs:', err);
      setError('Failed to export activity logs. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getActionClass = (action) => {
    switch (action.toLowerCase()) {
      case 'create':
        return 'success';
      case 'update':
        return 'info';
      case 'delete':
        return 'danger';
      default:
        return 'default';
    }
  };

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>Activity Logs</h2>
        <div className="header-actions">
          <button 
            onClick={handleExport}
            className="btn btn-primary"
            disabled={activities.length === 0}
          >
            <FaDownload /> Export Logs
          </button>
        </div>
      </div>
      
      <div className="admin-filters">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <label>Action:</label>
          <select 
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          >
            <option value="all">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Date Range:</label>
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Details</th>
              <th>IP Address</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center">Loading activities...</td>
              </tr>
            ) : activities.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center">No activities found</td>
              </tr>
            ) : (
              activities.map((activity) => (
                <tr key={activity._id}>
                  <td>{formatDate(activity.timestamp)}</td>
                  <td>
                    {activity.user?.name || 'System'}
                    {activity.user?.email && <div className="text-muted">{activity.user.email}</div>}
                  </td>
                  <td>
                    <span className={`status-badge ${getActionClass(activity.action)}`}>
                      {activity.action}
                    </span>
                  </td>
                  <td>{activity.entity}</td>
                  <td className="details-cell">
                    <div className="details-content">
                      {JSON.stringify(activity.details || {})}
                    </div>
                  </td>
                  <td>{activity.ipAddress || 'N/A'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => fetchActivities(pageNum)}
              className={pagination.currentPage === pageNum ? 'active' : ''}
            >
              {pageNum}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityLogs;
