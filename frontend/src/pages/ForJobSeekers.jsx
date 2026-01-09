import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getUserRole, isLoggedIn } from "../utils/auth";
import LoginModal from "../components/LoginModal";

const ForJobSeekers = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const role = getUserRole();
  const [showSignupModal, setShowSignupModal] = useState(false);

  const handleGetStarted = () => {
    if (isLoggedIn() && role === "JobSeeker") {
      navigate("/jobs");
    } else if (isLoggedIn()) {
      navigate("/profile", {
        state: {
          message: t('forJobSeekers.switchToJobSeeker'),
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
          message: t('forJobSeekers.switchToJobSeeker'),
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
              {t('forJobSeekers.heroTitle')}
            </h1>
            <p className="hero-subtitle">
              {t('forJobSeekers.heroSubtitle')}
            </p>
            <div className="hero-buttons">
              <button className="btn btn-primary btn-lg" onClick={handleGetStarted}>
                {role === "JobSeeker" ? t('forJobSeekers.browseJobs') : t('forJobSeekers.startJobSearch')}
              </button>
              {role === "JobSeeker" && (
                <button className="btn btn-outline btn-lg" onClick={() => navigate("/cv-profile")}>
                  📄 {t('forJobSeekers.manageCV')}
                </button>
              )}
              <button className="btn btn-secondary btn-lg" onClick={() => navigate("/jobs")}>
                {t('forJobSeekers.viewAllJobs')}
              </button>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-illustration jobseeker-illustration">
              <div className="illustration-card">
                <div className="card-icon">🔍</div>
                <h3>{t('forJobSeekers.searchJobs')}</h3>
                <p>{t('forJobSeekers.findOpportunities')}</p>
              </div>
              <div className="illustration-card">
                <div className="card-icon">📝</div>
                <h3>{t('forJobSeekers.easyApply')}</h3>
                <p>{t('forJobSeekers.applyFewClicks')}</p>
              </div>
              <div className="illustration-card">
                <div className="card-icon">🎉</div>
                <h3>{t('forJobSeekers.getHired')}</h3>
                <p>{t('forJobSeekers.landDreamJob')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2>{t('forJobSeekers.whyLove')}</h2>
          <p>{t('forJobSeekers.everythingNeeded')}</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>{t('forJobSeekers.personalizedMatches')}</h3>
            <p>{t('forJobSeekers.personalizedMatchesDesc')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>{t('forJobSeekers.quickApplications')}</h3>
            <p>{t('forJobSeekers.quickApplicationsDesc')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>{t('forJobSeekers.trackApplications')}</h3>
            <p>{t('forJobSeekers.trackApplicationsDesc')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔔</div>
            <h3>{t('forJobSeekers.instantNotifications')}</h3>
            <p>{t('forJobSeekers.instantNotificationsDesc')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💼</div>
            <h3>{t('forJobSeekers.diverseOpportunities')}</h3>
            <p>{t('forJobSeekers.diverseOpportunitiesDesc')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔐</div>
            <h3>{t('forJobSeekers.privacyProtected')}</h3>
            <p>{t('forJobSeekers.privacyProtectedDesc')}</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="section-header">
          <h2>{t('forJobSeekers.howItWorks')}</h2>
          <p>{t('forJobSeekers.simpleSteps')}</p>
        </div>
        <div className="steps-container">
          <div className="step-card">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>{t('forJobSeekers.createProfile')}</h3>
              <p>{t('forJobSeekers.createProfileDesc')}</p>
            </div>
          </div>
          <div className="step-arrow">→</div>
          <div className="step-card">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>{t('forJobSeekers.browseApply')}</h3>
              <p>{t('forJobSeekers.browseApplyDesc')}</p>
            </div>
          </div>
          <div className="step-arrow">→</div>
          <div className="step-card">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>{t('forJobSeekers.getHired')}</h3>
              <p>{t('forJobSeekers.getHiredDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Job Categories Section */}
      <section className="categories-section">
        <div className="section-header">
          <h2>{t('forJobSeekers.popularCategories')}</h2>
          <p>{t('forJobSeekers.exploreIndustries')}</p>
        </div>
        <div className="categories-grid">
          <div className="category-card" onClick={() => navigate("/jobs")}>
            <div className="category-icon">💻</div>
            <h3>{t('forJobSeekers.technology')}</h3>
            <p>{t('forJobSeekers.technologyDesc')}</p>
          </div>
          <div className="category-card" onClick={() => navigate("/jobs")}>
            <div className="category-icon">🎨</div>
            <h3>{t('forJobSeekers.design')}</h3>
            <p>{t('forJobSeekers.designDesc')}</p>
          </div>
          <div className="category-card" onClick={() => navigate("/jobs")}>
            <div className="category-icon">📈</div>
            <h3>{t('forJobSeekers.marketing')}</h3>
            <p>{t('forJobSeekers.marketingDesc')}</p>
          </div>
          <div className="category-card" onClick={() => navigate("/jobs")}>
            <div className="category-icon">💼</div>
            <h3>{t('forJobSeekers.business')}</h3>
            <p>{t('forJobSeekers.businessDesc')}</p>
          </div>
          <div className="category-card" onClick={() => navigate("/jobs")}>
            <div className="category-icon">🏥</div>
            <h3>{t('forJobSeekers.healthcare')}</h3>
            <p>{t('forJobSeekers.healthcareDesc')}</p>
          </div>
          <div className="category-card" onClick={() => navigate("/jobs")}>
            <div className="category-icon">🎓</div>
            <h3>{t('forJobSeekers.education')}</h3>
            <p>{t('forJobSeekers.educationDesc')}</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">5000+</div>
            <div className="stat-label">{t('forJobSeekers.activeJobs')}</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">200+</div>
            <div className="stat-label">{t('forJobSeekers.companiesHiring')}</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">10k+</div>
            <div className="stat-label">{t('forJobSeekers.successfulHires')}</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">98%</div>
            <div className="stat-label">{t('forJobSeekers.userSatisfaction')}</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section jobseeker-cta">
        <div className="cta-content">
          <h2>{t('forJobSeekers.readyToSearch')}</h2>
          <p>{t('forJobSeekers.joinThousands')}</p>
          <button className="btn btn-primary btn-lg" onClick={handleGetStarted}>
            {role === "JobSeeker" ? t('forJobSeekers.browseJobsNow') : t('forJobSeekers.createFreeAccount')}
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
