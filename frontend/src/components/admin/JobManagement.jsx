import React, { useState, useEffect } from 'react';
import {
  FaTrash,
  FaEye,
  FaCheck,
  FaTimes,
  FaPlus,
  FaSync,
  FaSearch,
  FaBuilding,
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const JobManagement = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalJobs: 0 });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company: '',
    category: '',
    location: '',
    type: 'Full-Time',
    salary: '',
    requirements: ['']
  });

  const fetchJobs = async (page = 1) => {
    try {
      setLoading(true);
      setError('');
      const params = {
        page,
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        sortBy,
        sortOrder,
      };

      const response = await api.get('/admin/jobs', { params });
      const jobs = Array.isArray(response.data?.jobs) ? response.data.jobs : [];
      const paginationData = response.data?.pagination || {};

      const safeCurrentPage = Number(paginationData.currentPage) || Number(page) || 1;
      const safeTotalPages = Number(paginationData.totalPages) || 1;
      const safeTotalJobs = Number(paginationData.totalJobs ?? jobs.length) || 0;
      const safeLimit = Number(paginationData.limit) || pagination.limit || 10;

      setJobs(jobs.map((job) => ({
        ...job,
        status: job.status || 'active',
        applicationCount: job.applicationCount ?? job.applicationsCount ?? 0,
        postedBy: job.postedBy || job.employer || null,
      })));
      setPagination({
        currentPage: safeCurrentPage,
        totalPages: safeTotalPages,
        totalJobs: safeTotalJobs,
        limit: safeLimit,
      });
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchJobs();
    }, 250);

    return () => clearTimeout(delayDebounce);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter, sortBy, sortOrder]);

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      await api.put(`/admin/jobs/${jobId}/status`, { status: newStatus });
      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job._id === jobId ? { ...job, status: newStatus } : job
        )
      );
      setSelectedJob((prev) =>
        prev && prev._id === jobId ? { ...prev, status: newStatus } : prev
      );
      setActionMessage(`Job ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully.`);
    } catch (err) {
      setError('Failed to update job status');
    }
  };

  const handleDeleteClick = (job) => {
    setJobToDelete(job);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteJob = async () => {
    try {
      await api.delete(`/admin/jobs/${jobToDelete._id}`);
      setJobs((prevJobs) => prevJobs.filter((job) => job._id !== jobToDelete._id));
      setIsDeleteModalOpen(false);
      setIsDrawerOpen((open) => (jobToDelete && open && selectedJob?._id === jobToDelete._id ? false : open));
      setSelectedJob((prev) => (prev && prev._id === jobToDelete._id ? null : prev));
      setActionMessage('Job deleted successfully.');
    } catch (err) {
      setError('Failed to delete job');
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');

    try {
      // Filter out empty requirements
      const cleanRequirements = formData.requirements.filter(req => req.trim() !== '');
      
      if (cleanRequirements.length === 0) {
        setError('At least one requirement is needed');
        setCreating(false);
        return;
      }

      const jobData = {
        ...formData,
        requirements: cleanRequirements
      };

      const response = await api.post('/admin/jobs', jobData);
      
      // Add the new job to the list
      setJobs((prevJobs) => [response.data.job, ...prevJobs]);
      
      // Reset form and close modal
      setFormData({
        title: '',
        description: '',
        company: '',
        category: '',
        location: '',
        type: 'Full-Time',
        salary: '',
        requirements: ['']
      });
      setIsCreateModalOpen(false);
      setActionMessage('Job created successfully.');
      
    } catch (err) {
      console.error('Error creating job:', err);
      setError(err.response?.data?.message || 'Failed to create job');
    } finally {
      setCreating(false);
    }
  };

  const addRequirement = () => {
    setFormData({
      ...formData,
      requirements: [...formData.requirements, '']
    });
  };

  const updateRequirement = (index, value) => {
    const newRequirements = [...formData.requirements];
    newRequirements[index] = value;
    setFormData({
      ...formData,
      requirements: newRequirements
    });
  };

  const removeRequirement = (index) => {
    if (formData.requirements.length > 1) {
      const newRequirements = formData.requirements.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        requirements: newRequirements
      });
    }
  };

  const formatDate = (dateString, includeTime = false) => {
    const options = includeTime
      ? { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }
      : { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleViewJob = (job) => {
    setSelectedJob(job);
    setIsDrawerOpen(true);
  };

  const clearActionMessage = () => setActionMessage('');

  return (
    <div className="admin-section">
      <div className="admin-header">
        <h2>Job Management</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <FaPlus /> Create Job
        </button>
      </div>
      
      <div className="stats-bar">
        <div className="stat-item">
          <div className="stat-label">Total Jobs</div>
          <div className="stat-value">{pagination.totalJobs}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Showing</div>
          <div className="stat-value">{jobs.length}</div>
        </div>
      </div>

      <div className="admin-filters">
        <div className="search-box">
          <FaSearch className="text-muted" />
          <input
            type="text"
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            type="button"
            className="btn-icon"
            title="Refresh"
            onClick={() => fetchJobs(pagination.currentPage)}
          >
            <FaSync />
          </button>
        </div>
        
        <div className="filter-group">
          <label>Status:</label>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="draft">Draft</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Sort By:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="createdAt">Date Created</option>
            <option value="title">Title</option>
            <option value="company">Company</option>
          </select>
          <button
            type="button"
            className="btn-icon"
            onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
            title={`Sort ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      {actionMessage && (
        <div className="message success" role="status">
          {actionMessage}
          <button type="button" className="btn-icon small" onClick={clearActionMessage}>
            ×
          </button>
        </div>
      )}

      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th onClick={() => toggleSort('title')} className="sortable">
                Title {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => toggleSort('company')} className="sortable">
                Company {sortBy === 'company' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>Location</th>
              <th onClick={() => toggleSort('createdAt')} className="sortable">
                Posted On {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>Status</th>
              <th>Type</th>
              <th>Employer</th>
              <th>Applications</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="text-center">Loading jobs...</td>
              </tr>
            ) : jobs.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center">No jobs found</td>
              </tr>
            ) : (
              jobs.map((job) => (
                <tr key={job._id}>
                  <td>
                    <Link to={`/jobs/${job._id}`} className="job-title">
                      {job.title}
                    </Link>
                  </td>
                  <td>{job.company}</td>
                  <td>{job.location}</td>
                  <td>{formatDate(job.createdAt)}</td>
                  <td>
                    <span className={`status-badge status-${job.status}`}>
                      {job.status}
                    </span>
                  </td>
                  <td>{job.type || 'N/A'}</td>
                  <td>{job.postedBy?.name || job.employer?.name || 'System'}</td>
                  <td>{job.applicationCount ?? 0}</td>
                  <td className="actions">
                    <Link 
                      to={`/jobs/${job._id}`}
                      className="btn-icon"
                      title="View Job"
                      target="_blank"
                    >
                      <FaEye />
                    </Link>
                    <button
                      onClick={() => handleViewJob(job)}
                      className="btn-icon"
                      title="View details"
                    >
                      <FaBuilding />
                    </button>
                    <button 
                      onClick={() => handleStatusChange(job._id, job.status === 'active' ? 'inactive' : 'active')}
                      className={`btn-icon ${job.status === 'active' ? 'warning' : 'success'}`}
                      title={job.status === 'active' ? 'Deactivate' : 'Activate'}
                    >
                      {job.status === 'active' ? <FaTimes /> : <FaCheck />}
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(job)}
                      className="btn-icon danger"
                      title="Delete Job"
                    >
                      <FaTrash />
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
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => fetchJobs(pageNum)}
              className={pagination.currentPage === pageNum ? 'active' : ''}
            >
              {pageNum}
            </button>
          ))}
        </div>
      )}

      {/* Create Job Modal */}
      {isCreateModalOpen && (
        <div className="modal-overlay">
          <div className="modal large-modal">
            <h3>Create New Job</h3>
            <form onSubmit={handleCreateJob}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Job Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                    placeholder="e.g. Senior Software Engineer"
                  />
                </div>
                
                <div className="form-group">
                  <label>Company *</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    required
                    placeholder="e.g. Tech Corp Inc."
                  />
                </div>
                
                <div className="form-group">
                  <label>Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    placeholder="e.g. Technology, Finance, Healthcare"
                  />
                </div>
                
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="e.g. New York, NY or Remote"
                  />
                </div>
                
                <div className="form-group">
                  <label>Job Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Remote">Remote</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Salary</label>
                  <input
                    type="text"
                    value={formData.salary}
                    onChange={(e) => setFormData({...formData, salary: e.target.value})}
                    placeholder="e.g. $80,000 - $100,000 per year"
                  />
                </div>
              </div>
              
              <div className="form-group full-width">
                <label>Job Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                  rows="4"
                  placeholder="Describe the job responsibilities, requirements, and what the candidate will be doing..."
                />
              </div>
              
              <div className="form-group full-width">
                <label>Requirements *</label>
                <div className="requirements-list">
                  {formData.requirements.map((req, index) => (
                    <div key={index} className="requirement-item">
                      <input
                        type="text"
                        value={req}
                        onChange={(e) => updateRequirement(index, e.target.value)}
                        placeholder={`Requirement ${index + 1}`}
                        required={index === 0}
                      />
                      {formData.requirements.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => removeRequirement(index)}
                          className="btn-icon danger small"
                        >
                          <FaTimes />
                        </button>
                      )}
                    </div>
                  ))}
                  <button 
                    type="button" 
                    onClick={addRequirement}
                    className="btn btn-outline small"
                  >
                    <FaPlus /> Add Requirement
                  </button>
                </div>
              </div>
              
              <div className="modal-actions">
                <button type="button" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Job'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete the job: {jobToDelete?.title}?</p>
            <p className="text-warning">This action cannot be undone.</p>
            <div className="modal-actions">
              <button onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </button>
              <button onClick={handleDeleteJob} className="danger">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Job Details Drawer */}
      {isDrawerOpen && selectedJob && (
        <div className="drawer-overlay" onClick={() => setIsDrawerOpen(false)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <header className="drawer-header">
              <h3>{selectedJob.title}</h3>
              <button type="button" className="btn-icon" onClick={() => setIsDrawerOpen(false)}>
                ×
              </button>
            </header>
            <div className="drawer-content">
              <section className="drawer-section">
                <h4>Job Details</h4>
                <p><strong>Company:</strong> {selectedJob.company}</p>
                <p><strong>Location:</strong> {selectedJob.location || 'Not specified'}</p>
                <p><strong>Status:</strong> <span className={`status-badge status-${selectedJob.status}`}>{selectedJob.status}</span></p>
                <p><strong>Type:</strong> {selectedJob.type || 'Not specified'}</p>
                <p><strong>Salary:</strong> {selectedJob.salary || 'Not specified'}</p>
                <p><strong>Posted:</strong> {formatDate(selectedJob.createdAt, true)}</p>
                {selectedJob.updatedAt && <p><strong>Updated:</strong> {formatDate(selectedJob.updatedAt, true)}</p>}
              </section>

              <section className="drawer-section">
                <h4>Description</h4>
                <p>{selectedJob.description}</p>
              </section>

              {selectedJob.requirements?.length > 0 && (
                <section className="drawer-section">
                  <h4>Requirements</h4>
                  <ul>
                    {selectedJob.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </section>
              )}

              <section className="drawer-section">
                <h4>Actions</h4>
                <div className="drawer-actions">
                  <Link to={`/jobs/${selectedJob._id}`} className="btn btn-outline" target="_blank" rel="noopener noreferrer">
                    View public listing
                  </Link>
                  <button
                    className="btn btn-outline"
                    onClick={() => handleStatusChange(selectedJob._id, selectedJob.status === 'active' ? 'inactive' : 'active')}
                  >
                    {selectedJob.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDeleteClick(selectedJob)}>
                    Delete job
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobManagement;
