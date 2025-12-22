import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { getUserRole } from "../utils/auth";
import { getFileUrl } from "../utils/fileHelpers";
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { FaPlus, FaTimes } from "react-icons/fa";
import "./EmployerJobs.css";

const EmployerDashboard = () => {
  const navigate = useNavigate();
  const createInitialFormState = () => ({
    title: "",
    description: "",
    category: "",
    location: "",
    type: "Full-Time",
    salary: "",
    requirements: [""],
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creatingJob, setCreatingJob] = useState(false);
  const [postError, setPostError] = useState("");
  const [form, setForm] = useState(createInitialFormState());

  const addRequirementField = () => {
    setForm(prev => ({
      ...prev,
      requirements: [...prev.requirements, ""],
    }));
  };

  const handleRequirementChange = (index, value) => {
    setForm(prev => {
      const updated = [...prev.requirements];
      updated[index] = value;
      return { ...prev, requirements: updated };
    });
  };

  const removeRequirement = (index) => {
    setForm(prev => {
      if (prev.requirements.length <= 1) return prev;
      const updated = prev.requirements.filter((_, idx) => idx !== index);
      return { ...prev, requirements: updated };
    });
  };
  const [myJobs, setMyJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState("jobs");
  const [cvModalOpen, setCvModalOpen] = useState(false);
  const [selectedCV, setSelectedCV] = useState(null);
  const role = getUserRole();

  useEffect(() => {
    if (role === "Employer") {
      fetchMyJobs();
      fetchApplications();
    }
  }, [role]);

  async function fetchMyJobs() {
    setLoadingJobs(true);
    try {
      const res = await api.get("/jobs/mine");
      const items = res.data?.items || [];
      setMyJobs(items);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 403) {
        setMyJobs([]);
      }
    } finally {
      setLoadingJobs(false);
    }
  }

  async function fetchApplications() {
    try {
      console.log("Fetching applications for employer...");
      const res = await api.get("/applications/employer");
      console.log("Applications received:", res.data);
      setApplications(res.data);
    } catch (err) {
      console.error("Error fetching applications:", err);
      console.error("Error response:", err.response?.data);
    }
  }

  async function handleDeleteJob(jobId) {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    try {
      await api.delete(`/jobs/${jobId}`);
      alert("Job deleted successfully");
      fetchMyJobs();
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting job");
    }
  }

  async function updateApplicationStatus(appId, status) {
    try {
      await api.put(`/applications/${appId}/status`, { status });
      alert("Application status updated");
      fetchApplications();
    } catch (err) {
      alert(err.response?.data?.message || "Error updating status");
    }
  }

  const openCVModal = (application) => {
    setSelectedCV(application);
    setCvModalOpen(true);
  };

  const downloadCVasPDF = async () => {
    if (!selectedCV) return;
    
    const cvContent = document.querySelector('.cv-content');
    if (!cvContent) return;
    
    try {
      const canvas = await html2canvas(cvContent, {
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        scrollY: -window.scrollY // Fix for scrolling issues
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 190; // A4 width in mm (with margins)
      const pageHeight = 277; // A4 height in mm (with margins)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 10; // Top margin
      
      // Add first page
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 20; // Subtract page height (with margins)
      
      // Add new pages if content is longer than one page
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - 20;
      }
      
      // Download the PDF
      pdf.save(`${selectedCV.applicant?.name || 'CV'}_${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const closeCVModal = () => {
    setCvModalOpen(false);
    setSelectedCV(null);
  };

  if (role !== "Employer") {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h3>Employer Dashboard</h3>
          <p>You must be signed in as an Employer to access this page.</p>
          <button className="btn btn-primary" onClick={() => navigate("/login")}>
            Login
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPostError("");
    setCreatingJob(true);

    try {
      const cleanRequirements = form.requirements
        .map(req => req.trim())
        .filter(req => req.length > 0);

      if (cleanRequirements.length === 0) {
        setPostError("Please add at least one job requirement");
        setCreatingJob(false);
        return;
      }

      const jobData = {
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        location: form.location.trim(),
        salary: form.salary.trim(),
        requirements: cleanRequirements,
      };

      if (!jobData.title || !jobData.description) {
        setPostError("Title and description are required");
        setCreatingJob(false);
        return;
      }

      await api.post("/jobs", jobData);

      setForm(createInitialFormState());
      setIsCreateModalOpen(false);
      alert("Job posted successfully!");
      await fetchMyJobs();
      setActiveTab("jobs");
    } catch (err) {
      console.error("Error posting job:", err);
      setPostError(err.response?.data?.message || "Failed to post job");
    } finally {
      setCreatingJob(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Employer Dashboard</h1>
        <p>Manage your job postings and applications</p>
      </div>

      <div className="employer-toolbar">
        <div className="toolbar-left">
          <h2>Job Postings</h2>
          <p>View, create, and manage your jobs in one place.</p>
        </div>
        <div className="toolbar-actions">
          <button
            className="btn btn-primary"
            onClick={() => {
              setForm(createInitialFormState());
              setPostError("");
              setIsCreateModalOpen(true);
            }}
          >
            <FaPlus /> Create Job
          </button>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === "jobs" ? "active" : ""}`}
          onClick={() => setActiveTab("jobs")}
        >
          My Jobs ({myJobs.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "applications" ? "active" : ""}`}
          onClick={() => setActiveTab("applications")}
        >
          Applications ({applications.length})
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === "jobs" && (
          <div className="my-jobs-section">
            <h2>My Posted Jobs</h2>
            {loadingJobs ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading your jobs...</p>
              </div>
            ) : myJobs.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h3>No jobs posted yet</h3>
                <p>Start by posting your first job</p>
                <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
                  Create Job
                </button>
              </div>
            ) : (
              <div className="jobs-grid">
                {myJobs.map(job => (
                  <div key={job._id} className="job-card">
                    <div className="job-card-header">
                      <h3 className="job-title">{job.title}</h3>
                      <span className={`job-type-badge ${job.type?.toLowerCase().replace(/[^a-z]/g, '')}`}>
                        {job.type}
                      </span>
                    </div>
                    <div className="job-meta">
                      <span>📍 {job.location || "Remote"}</span>
                      {job.salary && <span>💰 {job.salary}</span>}
                    </div>
                    <p className="job-description">
                      {job.description?.length > 100
                        ? `${job.description.substring(0, 100)}...`
                        : job.description}
                    </p>
                    <div className="job-actions">
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate(`/jobs/${job._id}`)}
                      >
                        View
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate(`/jobs/${job._id}/edit`)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteJob(job._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "applications" && (
          <div className="applications-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Job Applications</h2>
              <button className="btn btn-secondary" onClick={fetchApplications}>
                🔄 Refresh
              </button>
            </div>
            {applications.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <h3>No applications yet</h3>
                <p>Applications will appear here when candidates apply</p>
              </div>
            ) : (
              <div className="applications-list">
                {applications.map(app => (
                  <div key={app._id} className="application-card">
                    <div className="application-header">
                      <div>
                        <h3>{app.applicant?.name}</h3>
                        <p className="application-email">📧 {app.applicant?.email}</p>
                      </div>
                      <span className={`status-badge status-${app.status?.toLowerCase()}`}>
                        {app.status}
                      </span>
                    </div>
                    <div className="application-body">
                      <p><strong>Job:</strong> {app.job?.title}</p>
                      {app.coverLetter && (
                        <div className="cover-letter">
                          <strong>Cover Letter:</strong>
                          <p>{app.coverLetter}</p>
                        </div>
                      )}
                      
                      {/* CV Toggle Button */}
                      {app.currentCVData && (
                        <div style={{ marginTop: '10px' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => openCVModal(app)}
                          >
                            View CV
                          </button>
                        </div>
                      )}
                      
                      <p className="application-date">
                        Applied: {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="application-actions">
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => updateApplicationStatus(app._id, "Accepted")}
                        disabled={app.status === "Accepted"}
                      >
                        Accept
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => updateApplicationStatus(app._id, "Rejected")}
                        disabled={app.status === "Rejected" || app.status === "Accepted"}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* CV Modal */}
      {cvModalOpen && selectedCV && (
        <div className="modal-overlay" onClick={closeCVModal}>
          <div className="modal-content cv-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>📄 {selectedCV.applicant?.name}'s CV</h3>
              <button className="modal-close" onClick={closeCVModal}>×</button>
            </div>
            <div className="modal-body">
              {/* Check if there's an uploaded CV file */}
              {(selectedCV.currentCVData?.resume || selectedCV.applicant?.resume) ? (
                <div className="cv-content">
                  <div className="cv-section" style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <div style={{ fontSize: '64px', marginBottom: '20px' }}>📄</div>
                    <h4 style={{ marginBottom: '10px' }}>CV Document</h4>
                    <p style={{ color: '#666', marginBottom: '30px' }}>
                      {selectedCV.applicant?.name}'s uploaded CV is available for viewing
                    </p>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button 
                        className="btn btn-primary"
                        onClick={() => {
                          const cvUrl = getFileUrl(selectedCV.currentCVData?.resume || selectedCV.applicant?.resume);
                          window.open(cvUrl, '_blank');
                        }}
                      >
                        📖 Open CV in New Tab
                      </button>
                      <button 
                        className="btn btn-secondary"
                        onClick={() => {
                          try {
                            const cvPath = selectedCV.currentCVData?.resume || selectedCV.applicant?.resume;
                            if (!cvPath) {
                              alert('No CV file found');
                              return;
                            }
                            
                            // Extract filename from path
                            const filename = cvPath.split('/').pop();
                            if (!filename) {
                              alert('Invalid CV file path');
                              return;
                            }
                            
                            // Use the dedicated download endpoint
                            const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'https://smartjob-3.onrender.com';
                            const downloadUrl = `${baseUrl}/api/upload/download-cv/${filename}`;
                            
                            console.log('Downloading CV:', { cvPath, filename, downloadUrl });
                            
                            // Create a temporary link and trigger download
                            const link = document.createElement('a');
                            link.href = downloadUrl;
                            link.style.display = 'none';
                            document.body.appendChild(link);
                            link.click();
                            
                            // Clean up
                            setTimeout(() => {
                              document.body.removeChild(link);
                            }, 100);
                            
                            console.log('Download triggered for:', filename);
                            
                          } catch (error) {
                            console.error('Error downloading CV:', error);
                            alert(`Failed to download CV: ${error.message}`);
                          }
                        }}
                      >
                        ⬇️ Download CV
                      </button>
                    </div>
                    <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                      <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                        <strong>Applicant Contact:</strong><br/>
                        📧 {selectedCV.applicant?.email}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="cv-content">
                  <div className="cv-section" style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '20px' }}>📭</div>
                    <h4>No CV Uploaded</h4>
                    <p style={{ color: '#666' }}>This applicant hasn't uploaded a CV document yet.</p>
                    <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '8px', border: '1px solid #ffc107' }}>
                      <p style={{ margin: 0, fontSize: '14px' }}>
                        <strong>Contact Information:</strong><br/>
                        📧 {selectedCV.applicant?.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Keep the old CV modal content below for reference - can be deleted later */}
      {false && cvModalOpen && selectedCV && (
        <div className="modal-overlay" onClick={closeCVModal}>
          <div className="modal-content cv-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>📄 {selectedCV.applicant?.name}'s CV (OLD)</h3>
              <button className="modal-close" onClick={closeCVModal}>×</button>
            </div>
            <div className="modal-body">
              {selectedCV.currentCVData && (
                <div className="cv-content">
                  {/* Basic Info */}
                  {(selectedCV.currentCVData.phone || selectedCV.currentCVData.location || selectedCV.currentCVData.bio) && (
                    <div className="cv-section">
                      <h4>Basic Information</h4>
                      {selectedCV.currentCVData.phone && <p><strong>Phone:</strong> {selectedCV.currentCVData.phone}</p>}
                      {selectedCV.currentCVData.location && <p><strong>Location:</strong> {selectedCV.currentCVData.location}</p>}
                      {selectedCV.currentCVData.bio && <p><strong>Bio:</strong> {selectedCV.currentCVData.bio}</p>}
                    </div>
                  )}

                  {/* Skills */}
                  {selectedCV.currentCVData.skills && selectedCV.currentCVData.skills.length > 0 && (
                    <div className="cv-section">
                      <h4>Skills</h4>
                      <div className="skills-list">
                        {selectedCV.currentCVData.skills.map((skill, index) => (
                          <span key={index} className="skill-badge">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Experience */}
                  {selectedCV.currentCVData.experience && selectedCV.currentCVData.experience.length > 0 && (
                    <div className="cv-section">
                      <h4>Work Experience</h4>
                      {selectedCV.currentCVData.experience.map((exp, index) => (
                        <div key={index} className="cv-item">
                          <h5>{exp.title} at {exp.company}</h5>
                          <p className="cv-meta">
                            {exp.location && `${exp.location} • `}
                            {new Date(exp.startDate).toLocaleDateString()} - {exp.current ? 'Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'Present'}
                          </p>
                          {exp.description && <p>{exp.description}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Education */}
                  {selectedCV.currentCVData.education && selectedCV.currentCVData.education.length > 0 && (
                    <div className="cv-section">
                      <h4>Education</h4>
                      {selectedCV.currentCVData.education.map((edu, index) => (
                        <div key={index} className="cv-item">
                          <h5>{edu.degree} at {edu.institution}</h5>
                          <p className="cv-meta">
                            {edu.location && `${edu.location} • `}
                            {edu.graduationDate && `Graduated: ${new Date(edu.graduationDate).toLocaleDateString()}`}
                            {edu.gpa && ` • GPA: ${edu.gpa}`}
                          </p>
                          {edu.description && <p>{edu.description}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Certifications */}
                  {selectedCV.currentCVData.certifications && selectedCV.currentCVData.certifications.length > 0 && (
                    <div className="cv-section">
                      <h4>Certifications</h4>
                      {selectedCV.currentCVData.certifications.map((cert, index) => (
                        <div key={index} className="cv-item">
                          <h5>{cert.name} by {cert.issuer}</h5>
                          <p className="cv-meta">
                            Issued: {new Date(cert.issueDate).toLocaleDateString()}
                            {cert.expiryDate && ` • Expires: ${new Date(cert.expiryDate).toLocaleDateString()}`}
                            {cert.credentialId && ` • ID: ${cert.credentialId}`}
                          </p>
                          {cert.description && <p>{cert.description}</p>}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Languages */}
                  {selectedCV.currentCVData.languages && selectedCV.currentCVData.languages.length > 0 && (
                    <div className="cv-section">
                      <h4>Languages</h4>
                      <div className="languages-list">
                        {selectedCV.currentCVData.languages.map((lang, index) => (
                          <span key={index} className="language-item">
                            {lang.language} ({lang.proficiency})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Links */}
                  {(selectedCV.currentCVData.linkedin || selectedCV.currentCVData.github || selectedCV.currentCVData.portfolio) && (
                    <div className="cv-section">
                      <h4>Professional Links</h4>
                      {selectedCV.currentCVData.linkedin && (
                        <p><strong>LinkedIn:</strong> <a href={selectedCV.currentCVData.linkedin} target="_blank" rel="noopener noreferrer">{selectedCV.currentCVData.linkedin}</a></p>
                      )}
                      {selectedCV.currentCVData.github && (
                        <p><strong>GitHub:</strong> <a href={selectedCV.currentCVData.github} target="_blank" rel="noopener noreferrer">{selectedCV.currentCVData.github}</a></p>
                      )}
                      {selectedCV.currentCVData.portfolio && (
                        <p><strong>Portfolio:</strong> <a href={selectedCV.currentCVData.portfolio} target="_blank" rel="noopener noreferrer">{selectedCV.currentCVData.portfolio}</a></p>
                      )}
                    </div>
                  )}

                  {/* Check if all sections are empty */}
                  {!selectedCV.currentCVData.phone && !selectedCV.currentCVData.location && !selectedCV.currentCVData.bio &&
                   (!selectedCV.currentCVData.skills || selectedCV.currentCVData.skills.length === 0) &&
                   (!selectedCV.currentCVData.experience || selectedCV.currentCVData.experience.length === 0) &&
                   (!selectedCV.currentCVData.education || selectedCV.currentCVData.education.length === 0) &&
                   (!selectedCV.currentCVData.certifications || selectedCV.currentCVData.certifications.length === 0) &&
                   (!selectedCV.currentCVData.languages || selectedCV.currentCVData.languages.length === 0) &&
                   !selectedCV.currentCVData.linkedin && !selectedCV.currentCVData.github && !selectedCV.currentCVData.portfolio && (
                    <div className="cv-section">
                      <div className="empty-state" style={{ textAlign: 'center', padding: '2rem' }}>
                        <div className="empty-icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
                        <h3>CV Not Complete</h3>
                        <p>This job seeker hasn't filled out their CV profile yet. They may have applied with basic information only.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {!selectedCV.currentCVData && (
                <div className="empty-state" style={{ textAlign: 'center', padding: '2rem' }}>
                  <div className="empty-icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
                  <h3>No CV Data Available</h3>
                  <p>This application doesn't contain CV information.</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeCVModal}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Job Modal */}
      {isCreateModalOpen && (
        <div className="modal-overlay" onClick={() => !creatingJob && setIsCreateModalOpen(false)}>
          <div className="modal large-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Create New Job</h3>
            {postError && <div className="error-message">{postError}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Job Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Senior Software Engineer"
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <input
                    type="text"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    placeholder="e.g. Technology, Finance"
                  />
                </div>

                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="e.g. Remote or New York, NY"
                  />
                </div>

                <div className="form-group">
                  <label>Job Type</label>
                  <select name="type" value={form.type} onChange={handleChange}>
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
                    name="salary"
                    value={form.salary}
                    onChange={handleChange}
                    placeholder="e.g. $80,000 - $100,000"
                  />
                </div>
              </div>

              <div className="form-group full-width">
                <label>Job Description *</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="4"
                  required
                  placeholder="Describe key responsibilities, goals, and what success looks like in this role"
                />
              </div>

              <div className="form-group full-width">
                <label>Requirements *</label>
                <div className="requirements-list">
                  {form.requirements.map((req, index) => (
                    <div key={`requirement-${index}`} className="requirement-item">
                      <input
                        type="text"
                        value={req}
                        onChange={(e) => handleRequirementChange(index, e.target.value)}
                        placeholder={`Requirement ${index + 1}`}
                        required={index === 0}
                      />
                      {form.requirements.length > 1 && (
                        <button
                          type="button"
                          className="btn-icon danger"
                          onClick={() => removeRequirement(index)}
                          aria-label="Remove requirement"
                        >
                          <FaTimes />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn btn-outline small"
                    onClick={addRequirementField}
                  >
                    <FaPlus /> Add Requirement
                  </button>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => !creatingJob && setIsCreateModalOpen(false)}
                  className="btn"
                >
                  Cancel
                </button>
                <button type="submit" className="primary" disabled={creatingJob}>
                  {creatingJob ? "Creating..." : "Create Job"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerDashboard;
