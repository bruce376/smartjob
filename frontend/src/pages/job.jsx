import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import "./job.css";

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          <h3>Unable to load job</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => navigate(-1)}>
            Go Back
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
          <h3>Job not found</h3>
          <button className="btn btn-primary" onClick={() => navigate("/jobs")}>
            Browse Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="job-detail-container">
      <button className="btn btn-outline btn-sm" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="job-detail-header">
        <h1>{job.title}</h1>
        <div className="job-meta">
          <span className="job-location">📍 {job.location || "Remote"}</span>
          {job.salary && <span className="job-salary">💰 {job.salary}</span>}
        </div>
      </div>

      {job.category && <span className="job-category">{job.category}</span>}

      <section className="job-section">
        <h2>About this role</h2>
        <p>{job.description || "No description provided."}</p>
      </section>

      <section className="job-section job-requirements">
        <h2>📋 Job Requirements</h2>
        {!job.requirements || job.requirements.length === 0 ? (
          <p className="no-requirements">No specific requirements listed.</p>
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
          <h2>Responsibilities</h2>
          <ul className="job-list">
            {job.responsibilities.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="job-section">
        <h2>Company</h2>
        <p>{job.employer?.name || "Company information not available."}</p>
      </section>

      <div className="job-detail-actions">
        <button className="btn btn-primary" onClick={() => navigate("/jobs")}>
          Browse more jobs
        </button>
      </div>
    </div>
  );
};

export default JobDetail;
