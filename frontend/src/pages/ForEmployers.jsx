import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getUserRole, isLoggedIn } from "../utils/auth";
import LoginModal from "../components/LoginModal";

const ForEmployers = () => {
  const { t } = useTranslation();
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
            message: t('forEmployers.needEmployerAccount'),
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
      navigate("/profile", { state: { message: t('forEmployers.updateToEmployer') } });
    }
  };

  return (
    <div className="landing-page employer-page">
      {/* Hero Section */}
      <section className="hero-section employer-hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              {t('forEmployers.heroTitle')}
            </h1>
            <p className="hero-subtitle">
              {t('forEmployers.heroSubtitle')}
            </p>
            <div className="hero-buttons">
              <button className="btn btn-primary btn-lg" onClick={handleGetStarted}>
                {role === "Employer" ? t('forEmployers.goToDashboard') : t('forEmployers.postFirstJob')}
              </button>
              <button className="btn btn-secondary btn-lg" onClick={() => navigate("/jobs")}>
                {t('forEmployers.browseTalent')}
              </button>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-illustration employer-illustration">
              <div className="illustration-card">
                <div className="card-icon">💼</div>
                <h3>{t('forEmployers.postJobs')}</h3>
                <p>{t('forEmployers.reachCandidates')}</p>
              </div>
              <div className="illustration-card">
                <div className="card-icon">📊</div>
                <h3>{t('forEmployers.manageApplications')}</h3>
                <p>{t('forEmployers.reviewTrack')}</p>
              </div>
              <div className="illustration-card">
                <div className="card-icon">✅</div>
                <h3>{t('forEmployers.hireFast')}</h3>
                <p>{t('forEmployers.connectQuickly')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2>{t('forEmployers.whyChoose')}</h2>
          <p>{t('forEmployers.everythingNeeded')}</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🚀</div>
            <h3>{t('forEmployers.quickPosting')}</h3>
            <p>{t('forEmployers.quickPostingDesc')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>{t('forEmployers.targetedReach')}</h3>
            <p>{t('forEmployers.targetedReachDesc')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📋</div>
            <h3>{t('forEmployers.applicationManagement')}</h3>
            <p>{t('forEmployers.applicationManagementDesc')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>{t('forEmployers.directCommunication')}</h3>
            <p>{t('forEmployers.directCommunicationDesc')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>{t('forEmployers.trackPerformance')}</h3>
            <p>{t('forEmployers.trackPerformanceDesc')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>{t('forEmployers.securePrivate')}</h3>
            <p>{t('forEmployers.securePrivateDesc')}</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="section-header">
          <h2>{t('forEmployers.howItWorks')}</h2>
          <p>{t('forEmployers.simpleSteps')}</p>
        </div>
        <div className="steps-container">
          <div className="step-card">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>{t('forEmployers.createAccount')}</h3>
              <p>{t('forEmployers.createAccountDesc')}</p>
            </div>
          </div>
          <div className="step-arrow">→</div>
          <div className="step-card">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>{t('forEmployers.postJobs')}</h3>
              <p>{t('forEmployers.postJobsDesc')}</p>
            </div>
          </div>
          <div className="step-arrow">→</div>
          <div className="step-card">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>{t('forEmployers.reviewHire')}</h3>
              <p>{t('forEmployers.reviewHireDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">1000+</div>
            <div className="stat-label">{t('forEmployers.activeJobSeekers')}</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">500+</div>
            <div className="stat-label">{t('forEmployers.jobsPosted')}</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">95%</div>
            <div className="stat-label">{t('forEmployers.satisfactionRate')}</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">24/7</div>
            <div className="stat-label">{t('forEmployers.platformAccess')}</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section employer-cta">
        <div className="cta-content">
          <h2>{t('forEmployers.readyToHire')}</h2>
          <p>{t('forEmployers.joinHundreds')}</p>
          <button className="btn btn-primary btn-lg" onClick={handleGetStarted}>
            {role === "Employer" ? t('forEmployers.goToDashboard') : t('forEmployers.getStartedFree')}
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
