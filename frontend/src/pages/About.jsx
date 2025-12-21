import React from "react";
import { Link } from "react-router-dom";
import "./About.css";

function About() {
  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="about-hero-content">
          <span className="about-badge">About SmartJob</span>
          <h1 className="about-title">Connecting talent with real opportunities</h1>
          <p className="about-subtitle">
            SmartJob brings together ambitious professionals and hiring teams with
            curated roles, real-time insights, and tools that make every application
            smarter and more effective.
          </p>
        </div>
      </section>

      <section className="about-section">
        <div className="about-two-column">
          <div className="about-card">
            <h2 className="about-section-title">Our mission</h2>
            <p>
              Our mission is to make job discovery simple, transparent, and efficient
              for both sides of the hiring table. SmartJob helps candidates move from
              search to signed offer faster, while giving employers a focused way to
              meet qualified talent.
            </p>
          </div>

          <div className="about-card">
            <h2 className="about-section-title">Who we serve</h2>
            <ul>
              <li>Job seekers who want clear, relevant opportunities and better tools.</li>
              <li>Employers who need a reliable place to post roles and review candidates.</li>
              <li>Teams who care about a streamlined, modern hiring experience.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="about-section">
        <h2 className="about-section-title">How SmartJob helps your journey</h2>
        <div className="about-grid">
          <div className="about-value-card">
            <h3>For job seekers</h3>
            <ul>
              <li>Personalized job matches aligned with your skills and goals.</li>
              <li>Application tracking so you always know where you stand.</li>
              <li>Support for managing your CV and preparing for interviews.</li>
            </ul>
          </div>

          <div className="about-value-card">
            <h3>For employers</h3>
            <ul>
              <li>Post jobs and receive applications in a central dashboard.</li>
              <li>Tools to review, shortlist, and communicate with candidates.</li>
              <li>Access to active job seekers across key categories and regions.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="about-section">
        <h2 className="about-section-title">SmartJob at a glance</h2>
        <div className="about-stats">
          <div className="about-stat-card">
            <span className="about-stat-value">5000+</span>
            <span className="about-stat-label">Active jobs</span>
          </div>
          <div className="about-stat-card">
            <span className="about-stat-value">200+</span>
            <span className="about-stat-label">Companies hiring</span>
          </div>
          <div className="about-stat-card">
            <span className="about-stat-value">10k+</span>
            <span className="about-stat-label">Successful hires</span>
          </div>
          <div className="about-stat-card">
            <span className="about-stat-value">98%</span>
            <span className="about-stat-label">User satisfaction</span>
          </div>
        </div>
      </section>

      <section className="about-section">
        <h2 className="about-section-title">The team behind SmartJob</h2>
        <div className="about-grid">
          <div className="about-value-card">
            <h3>Product & Engineering</h3>
            <ul>
              <li>Design and build the SmartJob platform experience.</li>
              <li>Ensure the site is fast, reliable, and secure for everyone.</li>
              <li>Ship new features that support modern job search and hiring.</li>
            </ul>
          </div>
          <div className="about-value-card">
            <h3>Talent & Success</h3>
            <ul>
              <li>Support job seekers as they discover and apply for roles.</li>
              <li>Help employers make the most of their job postings.</li>
              <li>Collect feedback to keep improving matches and outcomes.</li>
            </ul>
          </div>
          <div className="about-value-card">
            <h3>Community & Partnerships</h3>
            <ul>
              <li>Build relationships with companies and career communities.</li>
              <li>Share best practices, resources, and success stories.</li>
              <li>Keep SmartJob aligned with real hiring needs and trends.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="about-section about-cta">
        <h2 className="about-section-title">Ready to write your own SmartJob story?</h2>
        <p>
          Whether you are exploring your next role or building your team, SmartJob is
          here to support every step: from discovery and applications to offers and
          beyond.
        </p>
        <div className="about-cta-buttons">
          <Link to="/register" className="btn btn-primary btn-lg">
            Create free account
          </Link>
          <Link to="/jobs" className="btn btn-outline btn-lg">
            Browse jobs
          </Link>
        </div>
      </section>
    </div>
  );
}

export default About;
