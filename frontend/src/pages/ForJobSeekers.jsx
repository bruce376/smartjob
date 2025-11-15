import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserRole, isLoggedIn } from "../utils/auth";
import LoginModal from "../components/LoginModal";

const ForJobSeekers = () => {
  const navigate = useNavigate();
  const role = getUserRole();
  const [showSignupModal, setShowSignupModal] = useState(false);

  const handleGetStarted = () => {
    if (isLoggedIn() && role === "JobSeeker") {
      navigate("/jobs");
    } else if (isLoggedIn()) {
      navigate("/profile", {
        state: {
          message: "Switch to a job seeker account to start your search.",
          showUpgradePrompt: true,
        },
      });
    } else {
      setShowSignupModal(true);
    }
  };

  const handleSignupSuccess = () => {
    if (getUserRole() === "JobSeeker") {
      navigate("/jobs");
    } else {
      navigate("/profile", {
        state: {
          message: "Switch to a job seeker account to start your search.",
          showUpgradePrompt: true,
        },
      });
    }
  };

  return (
    <div className="landing-page jobseeker-page">
      {/* Hero Section */}
      <section className="hero-section jobseeker-hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Discover Your <span className="highlight">Dream Job</span> Today
            </h1>
            <p className="hero-subtitle">
              Browse thousands of job opportunities, apply with one click, and track your applications. 
              Your next career move starts here.
            </p>
            <div className="hero-buttons">
              <button className="btn btn-primary btn-lg" onClick={handleGetStarted}>
                {role === "JobSeeker" ? "Browse Jobs" : "Start Your Job Search"}
              </button>
              {role === "JobSeeker" && (
                <button className="btn btn-outline btn-lg" onClick={() => navigate("/cv-profile")}>
                  📄 Manage My CV
                </button>
              )}
              <button className="btn btn-secondary btn-lg" onClick={() => navigate("/jobs")}>
                View All Jobs
              </button>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-illustration jobseeker-illustration">
              <div className="illustration-card">
                <div className="card-icon">🔍</div>
                <h3>Search Jobs</h3>
                <p>Find opportunities that match your skills</p>
              </div>
              <div className="illustration-card">
                <div className="card-icon">📝</div>
                <h3>Easy Apply</h3>
                <p>Apply with just a few clicks</p>
              </div>
              <div className="illustration-card">
                <div className="card-icon">🎉</div>
                <h3>Get Hired</h3>
                <p>Land your dream job faster</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2>Why Job Seekers Love SmartJob</h2>
          <p>Everything you need to find your perfect job</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Personalized Job Matches</h3>
            <p>Find jobs that match your skills, experience, and career goals. Filter by location, salary, and job type.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Quick Applications</h3>
            <p>Apply for jobs in seconds. No complicated forms - just your profile and a cover letter.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Track Your Applications</h3>
            <p>See all your applications in one place. Know exactly where you stand with each employer.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔔</div>
            <h3>Instant Notifications</h3>
            <p>Get notified when employers review your application. Never miss an opportunity.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💼</div>
            <h3>Diverse Opportunities</h3>
            <p>From startups to enterprises, full-time to remote - find jobs across all industries and types.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔐</div>
            <h3>Privacy Protected</h3>
            <p>Your information is secure. Control what employers see and when they see it.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Land your dream job in 3 simple steps</p>
        </div>
        <div className="steps-container">
          <div className="step-card">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Create Your Profile</h3>
              <p>Sign up as a job seeker and create your profile. It takes less than a minute.</p>
            </div>
          </div>
          <div className="step-arrow">→</div>
          <div className="step-card">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Browse & Apply</h3>
              <p>Search for jobs that match your skills. Apply with one click and add a personalized cover letter.</p>
            </div>
          </div>
          <div className="step-arrow">→</div>
          <div className="step-card">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Get Hired</h3>
              <p>Track your applications and get notified when employers respond. Land your dream job!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Job Categories Section */}
      <section className="categories-section">
        <div className="section-header">
          <h2>Popular Job Categories</h2>
          <p>Explore opportunities across various industries</p>
        </div>
        <div className="categories-grid">
          <div className="category-card" onClick={() => navigate("/jobs")}>
            <div className="category-icon">💻</div>
            <h3>Technology</h3>
            <p>Software, IT, Development</p>
          </div>
          <div className="category-card" onClick={() => navigate("/jobs")}>
            <div className="category-icon">🎨</div>
            <h3>Design</h3>
            <p>UI/UX, Graphics, Creative</p>
          </div>
          <div className="category-card" onClick={() => navigate("/jobs")}>
            <div className="category-icon">📈</div>
            <h3>Marketing</h3>
            <p>Digital, Content, SEO</p>
          </div>
          <div className="category-card" onClick={() => navigate("/jobs")}>
            <div className="category-icon">💼</div>
            <h3>Business</h3>
            <p>Management, Sales, Finance</p>
          </div>
          <div className="category-card" onClick={() => navigate("/jobs")}>
            <div className="category-icon">🏥</div>
            <h3>Healthcare</h3>
            <p>Medical, Nursing, Therapy</p>
          </div>
          <div className="category-card" onClick={() => navigate("/jobs")}>
            <div className="category-icon">🎓</div>
            <h3>Education</h3>
            <p>Teaching, Training, Research</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">5000+</div>
            <div className="stat-label">Active Jobs</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">200+</div>
            <div className="stat-label">Companies Hiring</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">10k+</div>
            <div className="stat-label">Successful Hires</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">98%</div>
            <div className="stat-label">User Satisfaction</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section jobseeker-cta">
        <div className="cta-content">
          <h2>Ready to Start Your Job Search?</h2>
          <p>Join thousands of job seekers who found their dream jobs on SmartJob</p>
          <button className="btn btn-primary btn-lg" onClick={handleGetStarted}>
            {role === "JobSeeker" ? "Browse Jobs Now" : "Create Free Account"}
          </button>
        </div>
      </section>

      <LoginModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onLoginSuccess={handleSignupSuccess}
        targetRole="JobSeeker"
        mode="signup"
        forceRole="JobSeeker"
      />
    </div>
  );
};

export default ForJobSeekers;
