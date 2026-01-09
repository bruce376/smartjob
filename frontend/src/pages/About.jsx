import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./About.css";

function About() {
  const { t } = useTranslation();
  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="about-hero-content">
          <span className="about-badge">{t('about.badge')}</span>
          <h1 className="about-title">{t('about.title')}</h1>
          <p className="about-subtitle">
            {t('about.subtitle')}
          </p>
        </div>
      </section>

      <section className="about-section">
        <div className="about-two-column">
          <div className="about-card">
            <h2 className="about-section-title">{t('about.mission')}</h2>
            <p>
              {t('about.missionDescription')}
            </p>
          </div>

          <div className="about-card">
            <h2 className="about-section-title">{t('about.whoWeServe')}</h2>
            <ul>
              <li>{t('about.jobSeekersDesc')}</li>
              <li>{t('about.employersDesc')}</li>
              <li>{t('about.teamsDesc')}</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="about-section">
        <h2 className="about-section-title">{t('about.howItHelps')}</h2>
        <div className="about-grid">
          <div className="about-value-card">
            <h3>{t('about.forJobSeekers')}</h3>
            <ul>
              <li>{t('about.personalizedMatches')}</li>
              <li>{t('about.applicationTracking')}</li>
              <li>{t('about.cvSupport')}</li>
            </ul>
          </div>

          <div className="about-value-card">
            <h3>{t('about.forEmployers')}</h3>
            <ul>
              <li>{t('about.postJobs')}</li>
              <li>{t('about.reviewTools')}</li>
              <li>{t('about.accessTalent')}</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="about-section">
        <h2 className="about-section-title">{t('about.atAGlance')}</h2>
        <div className="about-stats">
          <div className="about-stat-card">
            <span className="about-stat-value">5000+</span>
            <span className="about-stat-label">{t('about.activeJobs')}</span>
          </div>
          <div className="about-stat-card">
            <span className="about-stat-value">200+</span>
            <span className="about-stat-label">{t('about.companiesHiring')}</span>
          </div>
          <div className="about-stat-card">
            <span className="about-stat-value">10k+</span>
            <span className="about-stat-label">{t('about.successfulHires')}</span>
          </div>
          <div className="about-stat-card">
            <span className="about-stat-value">98%</span>
            <span className="about-stat-label">{t('about.userSatisfaction')}</span>
          </div>
        </div>
      </section>

      <section className="about-section">
        <h2 className="about-section-title">{t('about.teamTitle')}</h2>
        <div className="about-grid">
          <div className="about-value-card">
            <h3>{t('about.productEngineering')}</h3>
            <ul>
              <li>{t('about.designBuild')}</li>
              <li>{t('about.ensureReliable')}</li>
              <li>{t('about.shipFeatures')}</li>
            </ul>
          </div>
          <div className="about-value-card">
            <h3>{t('about.talentSuccess')}</h3>
            <ul>
              <li>{t('about.supportJobSeekers')}</li>
              <li>{t('about.helpEmployers')}</li>
              <li>{t('about.collectFeedback')}</li>
            </ul>
          </div>
          <div className="about-value-card">
            <h3>{t('about.communityPartnerships')}</h3>
            <ul>
              <li>{t('about.buildRelationships')}</li>
              <li>{t('about.sharePractices')}</li>
              <li>{t('about.keepAligned')}</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="about-section about-cta">
        <h2 className="about-section-title">{t('about.ctaTitle')}</h2>
        <p>
          {t('about.ctaDescription')}
        </p>
        <div className="about-cta-buttons">
          <Link to="/register" className="btn btn-primary btn-lg">
            {t('about.createAccount')}
          </Link>
          <Link to="/jobs" className="btn btn-outline btn-lg">
            {t('about.browseJobs')}
          </Link>
        </div>
      </section>
    </div>
  );
}

export default About;
