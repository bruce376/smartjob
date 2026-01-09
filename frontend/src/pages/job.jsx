import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../utils/api";
import { getUserFromToken } from "../utils/auth";
import JobMessageModal from "../components/JobMessageModal";
import "./job.css";

const JobDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  
  const user = getUserFromToken();

  useEffect(() => {
    async function fetchJob() {
      try {
        console.log('Fetching job with ID:', id);
        const res = await api.get(`/jobs/${id}`);
        console.log('Job data received:', res.data);
        
        // Handle both response formats: direct job object or nested in job property
        const jobData = res.data.job || res.data;
        
        // Ensure requirements is always an array
        if (jobData) {
          jobData.requirements = Array.isArray(jobData.requirements) 
            ? jobData.requirements.filter(req => req && req.trim() !== '') 
            : [];
        }
        
        setJob(jobData);
      } catch (err) {
        console.error('Error fetching job:', err);
        setError(err.response?.data?.message || "Unable to load job details.");
      } finally {
        setLoading(false);
      }
    }

    fetchJob();
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [id]);

  const handleMessageEmployer = () => {
    setShowMessageModal(true);
  };

  const handleMessageSent = () => {
    console.log('Message sent successfully');
  };

  if (loading) {
    return (
      <div className="job-detail-container">
        <div className="loading-container">
          <div className="spinner" />
          <p>Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="job-detail-container">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>{t('jobDetail.unableToLoad')}</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => navigate(-1)}>
            {t('jobDetail.goBack')}
          </button>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="job-detail-container">
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>{t('jobDetail.notFound')}</h3>
          <button className="btn btn-primary" onClick={() => navigate("/jobs")}>
            {t('jobDetail.browseJobs')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="job-detail-container">
      <button className="btn btn-outline btn-sm" onClick={() => navigate(-1)}>
        ← {t('jobDetail.back')}
      </button>

      <div className="job-detail-header">
        <h1>{job.title}</h1>
        <div className="job-meta">
          <span className="job-location">📍 {job.location || t('jobDetail.remote')}</span>
          {job.salary && <span className="job-salary">💰 {job.salary}</span>}
        </div>
      </div>

      {job.category && <span className="job-category">{job.category}</span>}
      
      <section className="job-section">
        <h2>{t('jobDetail.aboutRole')}</h2>
        <p>{job.description || t('jobDetail.noDescription')}</p>
      </section>

      <section className="job-section job-requirements">
        <h2>📋 {t('jobDetail.requirements')}</h2>
        {!job.requirements || job.requirements.length === 0 ? (
          <p className="no-requirements">{t('jobDetail.noRequirements')}</p>
        ) : (
          <div className="requirements-grid">
            {job.requirements.map((item, index) => {
              // Skip empty requirements just in case
              if (!item || typeof item !== 'string' || item.trim() === '') return null;
              
              return (
                <div key={index} className="requirement-item">
                  <span className="requirement-icon">✓</span>
                  <span className="requirement-text">{item}</span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {job.responsibilities?.length > 0 && (
        <section className="job-section">
          <h2>{t('jobDetail.responsibilities')}</h2>
          <ul className="job-list">
            {job.responsibilities.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="job-section">
        <h2>{t('jobDetail.company')}</h2>
        <p>{job.employer?.name || t('jobDetail.companyNotAvailable')}</p>
      </section>

      <div className="job-detail-actions">
        <button className="btn btn-primary" onClick={() => navigate("/jobs")}>
          {t('jobDetail.browseMoreJobs')}
        </button>
        
        {/* Message button for logged-in users */}
        {user && job.employer && (
          <button
            className="btn btn-outline message-btn"
            onClick={handleMessageEmployer}
            title="Message employer about this job"
          >
            💬 Message Employer
          </button>
        )}
      </div>
      
      {/* Job Message Modal */}
      <JobMessageModal
        job={job}
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        user={user}
        onMessageSent={handleMessageSent}
      />
    </div>
  );
};

export default JobDetail;
