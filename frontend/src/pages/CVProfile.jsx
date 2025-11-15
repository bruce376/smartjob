import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiUpload, FiTrash2, FiEye } from "react-icons/fi";
import { uploadCV } from '../utils/api';
import api from "../utils/api";
import { getUserRole, getUserFromToken, isLoggedIn } from "../utils/auth";
import { openFileInNewTab } from "../utils/fileHelpers";
import "./CVProfile.css";

const CVProfile = () => {
  const navigate = useNavigate();
  const role = getUserRole();
  const user = getUserFromToken();

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [profile, setProfile] = useState({
    phone: '',
    location: '',
    bio: '',
    skills: [],
    experience: [],
    education: [],
    certifications: [],
    languages: [],
    linkedin: '',
    github: '',
    portfolio: '',
    resume: ''
  });

  // Fetch profile data on component mount
  useEffect(() => {
    if (isLoggedIn()) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/auth/profile");
      if (res.data.success) {
        const userData = res.data.user;
        const cvData = userData.currentCVData || userData;
        
        setProfile({
          phone: cvData.phone || '',
          location: cvData.location || '',
          bio: cvData.bio || '',
          skills: Array.isArray(cvData.skills) ? cvData.skills : [],
          experience: Array.isArray(cvData.experience) ? cvData.experience : [],
          education: Array.isArray(cvData.education) ? cvData.education : [],
          certifications: Array.isArray(cvData.certifications) ? cvData.certifications : [],
          languages: Array.isArray(cvData.languages) ? cvData.languages : [],
          linkedin: cvData.linkedin || '',
          github: cvData.github || '',
          portfolio: cvData.portfolio || '',
          resume: cvData.resume || ''
        });
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    const validTypes = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/octet-stream' // For some .docx files
    ];
    
    const validExtensions = ['.pdf', '.doc', '.docx'];
    const fileExtension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    
    // Check file type by both MIME type and extension
    const isValidType = validTypes.includes(file.type) || 
                       validExtensions.includes(fileExtension) ||
                       file.name.endsWith('.docx') || 
                       file.name.endsWith('.doc') || 
                       file.name.endsWith('.pdf');

    if (!isValidType) {
      alert('Please upload a valid PDF or Word document (PDF, DOC, or DOCX)');
      e.target.value = '';
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      e.target.value = '';
      return;
    }

    setSelectedFile(file);
    setUploading(true);
    const formData = new FormData();
    formData.append('cv', file);

    try {
      const response = await uploadCV(formData);
      
      setProfile(prev => ({
        ...prev,
        resume: response.filePath || response.url || 'Uploaded successfully'
      }));
      
      // Update user data in localStorage if available
      if (response.user) {
        localStorage.setItem('user', JSON.stringify({
          ...JSON.parse(localStorage.getItem('user') || '{}'),
          ...response.user
        }));
      }
      
      alert('CV uploaded successfully!');
      setSelectedFile(null);
    } catch (err) {
      console.error('Error uploading CV:', err);
      
      let errorMessage = 'Error uploading CV. Please try again.';
      
      // Handle authentication errors
      if (err.message && err.message.includes('session has expired')) {
        errorMessage = err.message;
        // Clear auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Redirect to login page after a short delay
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              from: window.location.pathname,
              message: 'Please log in to continue'
            } 
          });
        }, 1000);
      } 
      // Use error message from the thrown error
      else if (err.message) {
        errorMessage = err.message;
      }
      
      alert(errorMessage);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setSelectedFile(null);
      // Reset the file input
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const viewCV = () => {
    if (!profile.resume) {
      alert('No CV uploaded yet');
      return;
    }

    openFileInNewTab(profile.resume);
  };

  const deleteCV = async () => {
    if (!profile.resume) return;
    
    if (!window.confirm('Are you sure you want to delete your uploaded CV?')) {
      return;
    }
    
    try {
      setUploading(true);
      
      // Extract the filename from the resume path
      const filename = profile.resume.split('/').pop();
      if (!filename) throw new Error('Invalid file path');
      
      const res = await api.delete(`/file-upload/delete-cv?filename=${encodeURIComponent(filename)}`);
      
      if (res.data.success) {
        // Update the profile to remove the resume
        setProfile(prev => ({
          ...prev,
          resume: ''
        }));
        
        // Also update the user data in localStorage if available
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user) {
          user.resume = '';
          if (user.currentCVData) {
            user.currentCVData.resume = '';
          }
          localStorage.setItem('user', JSON.stringify(user));
        }
        
        alert('CV deleted successfully');
      } else {
        throw new Error(res.data.message || 'Failed to delete CV');
      }
    } catch (err) {
      console.error('Error deleting CV:', err);
      const errorMessage = err.response?.data?.message || 
                         err.message || 
                         'Error deleting CV. Please try again.';
      alert(errorMessage);
    } finally {
      setUploading(false);
    }

    try {
      await api.delete(`/delete-cv?filename=${profile.resume.split('/').pop()}`);
      
      const updatedProfile = { ...profile, resume: '' };
      await api.put("/auth/profile", {
        ...updatedProfile,
        currentCVData: {
          ...updatedProfile,
          updatedAt: new Date().toISOString()
        }
      });

      setProfile(prev => ({
        ...prev,
        resume: ''
      }));
      
      alert('CV deleted successfully!');
    } catch (err) {
      console.error('Error deleting CV:', err);
      alert('Failed to delete CV. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="cv-profile-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="cv-profile-container">
      <header className="cv-header">
        <div>
          <h1>My CV Profile</h1>
          <p className="text-muted">Upload and manage your CV document</p>
        </div>
        <div className="cv-actions">
          <button 
            className="btn btn-outline"
            onClick={() => navigate('/my-applications')}
          >
            My Applications
          </button>
        </div>
      </header>

      <section className="cv-section">
        <h2>CV </h2>
        <div className="form-group">
          <label>Upload Your CV</label>
          <div className="cv-upload-container">
            <div className="file-input-wrapper">
              <input
                type="file"
                id="cv-upload"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="cv-upload-input"
                disabled={uploading}
              />
              <label htmlFor="cv-upload" className="cv-upload-label">
                <FiUpload className="mr-2" />
                {uploading ? `Uploading... ${uploadProgress}%` : 'Choose File'}
              </label>
              <span className="file-name">
                {selectedFile ? selectedFile.name : (profile.resume ? 'Current file: ' + profile.resume.split('/').pop() : 'No file chosen')}
              </span>
            </div>
            
            {profile.resume && (
              <div className="cv-actions">
                <button
                  type="button"
                  onClick={viewCV}
                  className="cv-action-btn view"
                  title="View CV"
                >
                  <FiEye />
                </button>
                <button
                  type="button"
                  onClick={deleteCV}
                  className="cv-action-btn delete"
                  title="Delete CV"
                  disabled={uploading}
                >
                  <FiTrash2 />
                </button>
            </div>
          )}
        </div>
        <p className="form-hint">
          Accepted formats: PDF, DOC, DOCX (max 5MB). Your CV will be visible to employers.
        </p>
        </div>
      </section>
      
    </div>
  );
};

export default CVProfile;
