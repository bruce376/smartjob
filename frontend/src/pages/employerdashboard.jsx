import React from "react";

function EmployerDashboard() {
  return (
    <div className="employer-dashboard">
      <div className="dashboard-header">
        <h2>Employer Dashboard</h2>
        <p>Manage your job postings here.</p>
      </div>
      <div className="dashboard-content">
        <div className="dashboard-card">
          <h3>Job Postings</h3>
          <p>Create and manage your job listings</p>
        </div>
        <div className="dashboard-card">
          <h3>Applications</h3>
          <p>Review and manage candidate applications</p>
        </div>
        <div className="dashboard-card">
          <h3>Analytics</h3>
          <p>View job performance metrics</p>
        </div>
      </div>
    </div>
  );
}

export default EmployerDashboard;
