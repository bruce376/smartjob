import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserRole, isLoggedIn } from "../utils/auth";
import LoginModal from "../components/LoginModal";

const ForEmployers = () => {
  const navigate = useNavigate();
  const role = getUserRole();

  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleGetStarted = () => {
    console.log('handleGetStarted called');
    console.log('isLoggedIn:', isLoggedIn());
    console.log('user role:', role);
    
    if (isLoggedIn()) {
      console.log('User is logged in, checking role...');
      if (role === "Employer") {
        console.log('User is an employer, navigating to employer dashboard');
        navigate("/employer");
      } else {
        console.log('User is not an employer, redirecting to profile');
        // User is logged in but not as an employer
        navigate("/profile", { 
          state: { 
            message: "You need an employer account to post jobs. Please update your profile to an employer account.",
            showUpgradePrompt: true
          } 
        });
      }
    } else {
      console.log('User not logged in, showing signup modal');
      // Show signup popup for non-logged-in users
      setShowAuthModal(true);
    }
  };

  const handleLoginSuccess = () => {
    if (getUserRole() === "Employer") {
      navigate("/employer");
    } else {
      navigate("/profile", { state: { message: "Please update your profile to an employer account" } });
    }
  };

  return (
    <div className="landing-page employer-page">
      {/* Hero Section */}
      <section className="hero-section employer-hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Find the Perfect <span className="highlight">Talent</span> for Your Team
            </h1>
            <p className="hero-subtitle">
              Post jobs, manage applications, and hire top talent all in one place. 
              SmartJob makes recruiting simple and effective.
            </p>
            <div className="hero-buttons">
              <button className="btn btn-primary btn-lg" onClick={handleGetStarted}>
                {role === "Employer" ? "Go to Dashboard" : "Post Your First Job"}
              </button>
              <button className="btn btn-secondary btn-lg" onClick={() => navigate("/jobs")}>
                Browse Talent Pool
              </button>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-illustration employer-illustration">
              <div className="illustration-card">
                <div className="card-icon">💼</div>
                <h3>Post Jobs</h3>
                <p>Reach thousands of qualified candidates</p>
              </div>
              <div className="illustration-card">
                <div className="card-icon">📊</div>
                <h3>Manage Applications</h3>
                <p>Review and track all applications</p>
              </div>
              <div className="illustration-card">
                <div className="card-icon">✅</div>
                <h3>Hire Fast</h3>
                <p>Connect with top talent quickly</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2>Why Employers Choose SmartJob</h2>
          <p>Everything you need to find and hire the best talent</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🚀</div>
            <h3>Quick Job Posting</h3>
            <p>Create and publish job listings in minutes. Our intuitive interface makes it easy to reach qualified candidates.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Targeted Reach</h3>
            <p>Your jobs are seen by active job seekers looking for opportunities in your industry and location.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📋</div>
            <h3>Application Management</h3>
            <p>Review, accept, or reject applications from a centralized dashboard. Keep track of all candidates easily.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>Direct Communication</h3>
            <p>Connect directly with candidates. Review cover letters and contact information all in one place.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>Track Performance</h3>
            <p>Monitor your job postings and application rates. See which positions attract the most interest.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure & Private</h3>
            <p>Your company information is protected. Only you can see applications for your job postings.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Start hiring in 3 simple steps</p>
        </div>
        <div className="steps-container">
          <div className="step-card">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Create Your Account</h3>
              <p>Sign up as an employer in seconds. Add your company details and you're ready to go.</p>
            </div>
          </div>
          <div className="step-arrow">→</div>
          <div className="step-card">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Post Your Jobs</h3>
              <p>Create detailed job listings with descriptions, requirements, salary, and location.</p>
            </div>
          </div>
          <div className="step-arrow">→</div>
          <div className="step-card">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Review & Hire</h3>
              <p>Receive applications, review candidates, and hire the perfect fit for your team.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">1000+</div>
            <div className="stat-label">Active Job Seekers</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">500+</div>
            <div className="stat-label">Jobs Posted</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">95%</div>
            <div className="stat-label">Satisfaction Rate</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">24/7</div>
            <div className="stat-label">Platform Access</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section employer-cta">
        <div className="cta-content">
          <h2>Ready to Find Your Next Hire?</h2>
          <p>Join hundreds of employers who trust SmartJob to build their teams</p>
          <button className="btn btn-primary btn-lg" onClick={handleGetStarted}>
            {role === "Employer" ? "Go to Dashboard" : "Get Started - It's Free"}
          </button>
        </div>
      </section>
      
      {/* Auth Modal */}
      <LoginModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={handleLoginSuccess}
        targetRole="Employer"
        mode="signup"
      />
    </div>
  );
};

export default ForEmployers;
