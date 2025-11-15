import React, { useState, useEffect } from 'react';
import { FaEye, FaFilter, FaSearch } from 'react-icons/fa';
import api from '../../utils/api';

const ApplicationsManagement = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
  const [error, setError] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchApplications = async (page = 1) => {
    try {
      setLoading(true);
      const response = await api.get('/admin/applications', {
        params: {
          page,
          limit: 20,
          search: searchTerm,
          status: statusFilter !== 'all' ? statusFilter : undefined,
        },
      });
      setApplications(response.data.applications);
      setPagination({
        currentPage: response.data.pagination.currentPage,
        totalPages: response.data.pagination.totalPages,
        totalApplications: response.data.pagination.totalApplications,
      });
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to load applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [searchTerm, statusFilter]);

  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setIsDetailModalOpen(true);
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'status-pending';
      case 'reviewed':
        return 'status-reviewed';
      case 'accepted':
        return 'status-accepted';
      case 'rejected':
        return 'status-rejected';
      default:
        return 'status-default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="admin-section">
      <h2>Applications Management</h2>

      <div className="admin-filters">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Search by applicant name, email, or job title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-label">Total Applications:</span>
          <span className="stat-value">{pagination.totalApplications || 0}</span>
        </div>
      </div>

      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Applicant</th>
              <th>Job Title</th>
              <th>Company</th>
              <th>Status</th>
              <th>Applied Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center">Loading applications...</td>
              </tr>
            ) : applications.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center">No applications found</td>
              </tr>
            ) : (
              applications.map((application) => (
                <tr key={application._id}>
                  <td>
                    <div className="applicant-info">
                      <div className="applicant-name">{application.applicant?.name || 'N/A'}</div>
                      <div className="applicant-email">{application.applicant?.email || 'N/A'}</div>
                    </div>
                  </td>
                  <td>{application.job?.title || 'N/A'}</td>
                  <td>{application.job?.company || 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(application.status)}`}>
                      {application.status || 'Pending'}
                    </span>
                  </td>
                  <td>{formatDate(application.appliedAt || application.createdAt)}</td>
                  <td className="actions">
                    <button
                      onClick={() => handleViewApplication(application)}
                      className="btn-icon"
                      title="View Application Details"
                    >
                      <FaEye />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => fetchApplications(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
          >
            Previous
          </button>

          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => fetchApplications(pageNum)}
              className={pagination.currentPage === pageNum ? 'active' : ''}
            >
              {pageNum}
            </button>
          ))}

          <button
            onClick={() => fetchApplications(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
          >
            Next
          </button>
        </div>
      )}

      {/* Application Detail Modal */}
      {isDetailModalOpen && selectedApplication && (
        <div className="modal-overlay">
          <div className="modal large-modal">
            <h3>Application Details</h3>

            <div className="application-details">
              <div className="detail-section">
                <h4>Applicant Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Name:</label>
                    <span>{selectedApplication.applicant?.name || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Email:</label>
                    <span>{selectedApplication.applicant?.email || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Role:</label>
                    <span>{selectedApplication.applicant?.role || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Job Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Job Title:</label>
                    <span>{selectedApplication.job?.title || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Company:</label>
                    <span>{selectedApplication.job?.company || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Location:</label>
                    <span>{selectedApplication.job?.location || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Application Details</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Status:</label>
                    <span className={`status-badge ${getStatusBadgeClass(selectedApplication.status)}`}>
                      {selectedApplication.status || 'Pending'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Applied Date:</label>
                    <span>{formatDate(selectedApplication.appliedAt || selectedApplication.createdAt)}</span>
                  </div>
                  <div className="detail-item full-width">
                    <label>Cover Letter:</label>
                    <div className="cover-letter">
                      {selectedApplication.coverLetter ? (
                        <pre>{selectedApplication.coverLetter}</pre>
                      ) : (
                        <span className="no-data">No cover letter provided</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={() => setIsDetailModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationsManagement;
