// src/pages/Jobs.js
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../utils/api";
import { getUserRole, getUserFromToken } from "../utils/auth";
import JobMessageModal from "../components/JobMessageModal";

const Jobs = () => {
  const { t } = useTranslation();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingFor, setApplyingFor] = useState(null);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ keywords: "", region: "", category: "" });
  const [userApplications, setUserApplications] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [jobsWithComeInRequests, setJobsWithComeInRequests] = useState(new Set());

  const role = getUserRole();
  const user = getUserFromToken();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
    if (role === "JobSeeker") {
      fetchUserApplications();
    }
    if (role === "Employer") {
      fetchComeInRequests();
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    const stateFilters = location.state || {};
    setFilters({
      keywords: stateFilters.keywords || "",
      region: stateFilters.region || "",
      category: stateFilters.category || ""
    });
  }, [location.state]);

  async function fetchJobs() {
    setLoading(true);
    setError(null);
    
    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setLoading(false);
      setError("Connection timeout. Please check your internet connection and try again.");
    }, 5000); // 5 second timeout
    
    try {
      const res = await api.get("/jobs", { timeout: 5000 });
      clearTimeout(timeoutId);
      setJobs(res.data.items || res.data.jobs || res.data); // backend returns items array
      setLoading(false);
    } catch (err) {
      clearTimeout(timeoutId);
      console.error(err);
      if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        setError("Connection timeout. The server is taking too long to respond.");
      } else if (err.code === 'ERR_NETWORK' || err.message.includes('Network Error')) {
        setError("Cannot connect to server. Please start the backend server.");
      } else {
        setError(err.response?.data?.message || "Unable to load jobs. Please check your connection.");
      }
      setLoading(false);
    }
  }

  async function fetchUserApplications() {
    try {
      const res = await api.get("/applications/my");
      setUserApplications(res.data || []);
    } catch (err) {
      console.error("Error fetching user applications:", err);
      // Don't show error to user, just log it
    }
  }

  const hasApplied = (jobId) => {
    return userApplications.some(app => app.job && app.job._id === jobId);
  };

  const handleMessageEmployer = (job) => {
    setSelectedJob(job);
    setShowMessageModal(true);
  };

  const handleMessageSent = () => {
    // Optionally refresh conversations or show notification
    console.log('Message sent successfully');
  };

  const fetchComeInRequests = async () => {
    try {
      const response = await api.get('/messages/come-in-requests');
      const jobIds = response.data.data.map(req => req.jobRelated);
      setJobsWithComeInRequests(new Set(jobIds));
    } catch (error) {
      console.error('Error fetching come-in requests:', error);
    }
  };

  const hasActiveFilters = useMemo(() => {
    return Boolean(filters.keywords || filters.region || filters.category);
  }, [filters]);

  const filteredJobs = useMemo(() => {
    if (!hasActiveFilters) {
      return jobs;
    }

    return jobs.filter((job) => {
      const title = job.title?.toLowerCase() || "";
      const description = job.description?.toLowerCase() || "";
      const employer = job.employer?.name?.toLowerCase() || "";
      const locationText = job.location?.toLowerCase() || "";
      const category = job.category?.toLowerCase() || "";

      const keywordMatch = filters.keywords
        ? [title, description, employer].some((field) => field.includes(filters.keywords.toLowerCase()))
        : true;

      const regionMatch = filters.region
        ? locationText.includes(filters.region.toLowerCase()) || filters.region === "Remote" && locationText.includes("remote")
        : true;

      const categoryMatch = filters.category
        ? category.includes(filters.category.toLowerCase())
        : true;

      return keywordMatch && regionMatch && categoryMatch;
    });
  }, [jobs, filters, hasActiveFilters]);

  async function apply(jobId) {
    if (role !== "JobSeeker") {
      alert(t('common.mustBeLoggedInAsJobSeeker'));
      return;
    }
    if (!user?.id) {
      alert(t('common.pleaseLoginFirst'));
      return;
    }

    // Get user's CV data
    try {
      const profileRes = await api.get("/auth/profile");
      
      const cvData = profileRes.data.success ? profileRes.data.user : {};

      // Check if CV has meaningful data
      const hasCVData = cvData.phone || cvData.location || cvData.bio || 
                       (cvData.skills && cvData.skills.length > 0) ||
                       (cvData.experience && cvData.experience.length > 0) ||
                       (cvData.education && cvData.education.length > 0) ||
                       (cvData.certifications && cvData.certifications.length > 0) ||
                       (cvData.languages && cvData.languages.length > 0) ||
                       cvData.linkedin || cvData.github || cvData.portfolio;

      if (!hasCVData) {
        const proceed = confirm(
          "Your CV profile appears to be empty. Your application will be submitted with basic information only.\n\n" +
          "Would you like to go to your CV profile page first to fill it out, or proceed with the application anyway?"
        );
        
        if (proceed) {
          // User chose to proceed anyway
          console.log("User proceeding with empty CV");
        } else {
          // Redirect to CV profile
          navigate("/cv-profile");
          return;
        }
      }

      const coverLetter = prompt(t('jobs.coverLetterPrompt')) || "";
      setApplyingFor(jobId);

      // Send application with CV data
      const applicationData = {
        coverLetter,
        cvData: {
          phone: cvData.phone || '',
          location: cvData.location || '',
          bio: cvData.bio || '',
          skills: cvData.skills || [],
          experience: cvData.experience || [],
          education: cvData.education || [],
          certifications: cvData.certifications || [],
          languages: cvData.languages || [],
          linkedin: cvData.linkedin || '',
          github: cvData.github || '',
          portfolio: cvData.portfolio || '',
          resume: cvData.resume || ''
        }
      };

      const res = await api.post(`/applications/${jobId}`, applicationData);
      alert(t('jobs.applicationSuccess'));
      // Refresh user applications to update the UI
      fetchUserApplications();
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message) {
        // Handle specific error messages
        if (err.response.data.message === "You already applied for this job") {
          alert(t('jobs.alreadyApplied'));
          // Refresh applications to ensure UI is updated
          fetchUserApplications();
        } else {
          alert(err.response.data.message);
        }
      }
    } finally {
      setApplyingFor(null);
    }
  }

  return (
    <div className="jobs-container">
      <div className="jobs-header">
        <h1>{t('jobs.title')}</h1>
        <p>{t('jobs.subtitle')}</p>
      </div>

      {error && (
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>{t('jobs.connectionError')}</h3>
          <p>{error}</p>
          <div className="error-actions">
            <button className="btn btn-primary" onClick={fetchJobs}>
              🔄 {t('jobs.tryAgain')}
            </button>
            <div className="error-help">
              <p><strong>{t('jobs.quickFix')}:</strong></p>
              <ol>
                <li>{t('jobs.checkConnection')}</li>
                <li>{t('jobs.refreshPage')}</li>
                <li>{t('jobs.tryAgainLater')}</li>
                <li>{t('jobs.contactSupport')}</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="jobs-grid">
          {/* Skeleton Loading Cards */}
          {[...Array(6)].map((_, index) => (
            <div key={index} className="job-card skeleton">
              <div className="job-card-header">
                <div className="skeleton-line skeleton-title"></div>
                <div className="skeleton-line skeleton-badge"></div>
              </div>
              <div className="job-meta">
                <div className="skeleton-line skeleton-meta"></div>
              </div>
              <div className="skeleton-line skeleton-description"></div>
              <div className="skeleton-line skeleton-description"></div>
              <div className="job-footer">
                <div className="skeleton-line skeleton-employer"></div>
              </div>
              <div className="job-actions">
                <div className="skeleton-line skeleton-button"></div>
                <div className="skeleton-line skeleton-button"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && jobs.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>{t('common.noJobsAvailable')}</h3>
          <p>{t('common.checkBackLater')}</p>
        </div>
      )}

      {!loading && !error && hasActiveFilters && jobs.length > 0 && filteredJobs.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🔎</div>
          <h3>{t('common.noRelatedJobFound')}</h3>
          <p>{t('common.tryDifferentKeywords')}</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setFilters({ keywords: "", region: "", category: "" })}
          >
            Clear filters
          </button>
        </div>
      )}

      <div className="jobs-grid">
        {filteredJobs.map(job => (
          <div key={job._id} className="job-card">
            <div className="job-card-header">
              <h3 className="job-title">{job.title}</h3>
              <span className={`job-type-badge ${job.type?.toLowerCase().replace(/[^a-z]/g, '')}`}>
                {job.type}
              </span>
            </div>
            
            <div className="job-meta">
              <span className="job-location">📍 {job.location || "Remote"}</span>
              {job.salary && <span className="job-salary">💰 {job.salary}</span>}
            </div>

            <p className="job-description">
              {job.description?.length > 150 
                ? `${job.description.substring(0, 150)}...` 
                : job.description}
            </p>

            {job.category && (
              <span className="job-category">{job.category}</span>
            )}

            <div className="job-footer">
              <span className="job-employer">🏢 {job.employer?.name || "Company"}</span>
            </div>

            <div className="job-actions">
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => navigate(`/jobs/${job._id}`)}
              >
                View Details
              </button>
              
              {/* Come-in notification badge for employers */}
              {role === "Employer" && jobsWithComeInRequests.has(job._id) && (
                <div className="come-in-badge" title="Has come-in requests">
                  🤝 Come In Requests
                </div>
              )}
              
              {/* Message button for all logged-in users */}
              {user && (
                <button
                  className="btn btn-outline btn-sm message-btn"
                  onClick={() => handleMessageEmployer(job)}
                  title="Message employer about this job"
                >
                  💬 Message
                </button>
              )}
              
              {role === "JobSeeker" && (
                hasApplied(job._id) ? (
                  <button
                    className="btn btn-success btn-sm"
                    disabled
                  >
                    ✅ Applied
                  </button>
                ) : (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => apply(job._id)}
                    disabled={applyingFor === job._id}
                  >
                    {applyingFor === job._id ? "Applying..." : "Apply Now"}
                  </button>
                )
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Job Message Modal */}
      <JobMessageModal
        job={selectedJob}
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        user={user}
        onMessageSent={handleMessageSent}
      />
    </div>
  );
};

export default Jobs;
