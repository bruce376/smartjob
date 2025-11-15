import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { getUserRole } from "../utils/auth";

const MyApplications = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const role = getUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (role === "JobSeeker") {
      fetchApplications();
    } else {
      setLoading(false);
    }
  }, [role]);

  async function fetchApplications() {
    try {
      const res = await api.get("/applications/my");
      setApps(res.data);
    } catch (err) {
      console.error(err);
      alert("Error loading applications");
    } finally {
      setLoading(false);
    }
  }

  async function deleteApplication(appId, status) {
    // Prevent deletion if application is already reviewed
    if (status === "Accepted" || status === "Rejected") {
      alert("Cannot delete an application that has already been reviewed by the employer.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this application? This action cannot be undone.")) {
      return;
    }

    try {
      await api.delete(`/applications/${appId}`);
      alert("Application deleted successfully!");
      fetchApplications(); // Refresh the list
    } catch (err) {
      console.error("Error deleting application:", err);
      alert(err.response?.data?.message || "Error deleting application. Please try again.");
    }
  }

  if (role !== "JobSeeker") {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h3>My Applications</h3>
          <p>This page is for Job Seekers only.</p>
          <button className="btn btn-primary" onClick={() => navigate("/login")}>
            Login as Job Seeker
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your applications...</p>
      </div>
    );
  }

  return (
    <div className="applications-page-container">
      <div className="applications-page-header">
        <h1>My Applications</h1>
        <p>Track the status of your job applications</p>
      </div>

      {apps.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No applications yet</h3>
          <p>Start applying to jobs to see them here</p>
          <button className="btn btn-primary" onClick={() => navigate("/jobs")}>
            Browse Jobs
          </button>
        </div>
      ) : (
        <div className="applications-list">
          {apps.map(app => (
            <div key={app._id} className="application-card">
              <div className="application-header">
                <div>
                  <h3 className="application-job-title">{app.job?.title || "Job Title"}</h3>
                  <p className="application-location">
                    📍 {app.job?.location || "Location not specified"}
                  </p>
                </div>
                <span className={`status-badge status-${app.status?.toLowerCase()}`}>
                  {app.status || "Pending"}
                </span>
              </div>

              <div className="application-body">
                {app.coverLetter && (
                  <div className="cover-letter">
                    <strong>Your Cover Letter:</strong>
                    <p>{app.coverLetter}</p>
                  </div>
                )}
                
                <div className="application-meta">
                  <span className="application-date">
                    📅 Applied: {new Date(app.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                  {app.job?.employer?.name && (
                    <span className="application-employer">
                      🏢 {app.job.employer.name}
                    </span>
                  )}
                </div>
              </div>

              <div className="application-actions">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigate(`/jobs/${app.job?._id}`)}
                  disabled={!app.job?._id}
                >
                  View Job
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => deleteApplication(app._id, app.status)}
                  disabled={app.status === "Accepted" || app.status === "Rejected"}
                  title={app.status === "Accepted" || app.status === "Rejected" ? "Cannot delete reviewed applications" : "Delete this application"}
                >
                  Delete Application
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyApplications;
