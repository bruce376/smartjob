import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isLoggedIn, getUserRole } from "../utils/auth";
import LoginModal from "../components/LoginModal";
function Home() {
  const loggedIn = isLoggedIn();
  const role = getUserRole();
  const navigate = useNavigate();
  const [searchKeywords, setSearchKeywords] = useState("");
  const [searchRegion, setSearchRegion] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const heroStats = [
    { value: "85%", label: "Interviews scheduled", detail: "within 10 days on SmartJob" },
    { value: "1020", label: "Open positions today", detail: "screened by our talent team" },
    { value: "4.9/5", label: "Candidate satisfaction", detail: "based on 2,400+ reviews" }
  ];
  const handleLoginSuccess = () => {
    if (getUserRole() === "Employer") {
      navigate("/employer");
    } else {
      navigate("/jobs");
    }
  };
  const featuredQuestions = [
    {
      question: "What industries are hiring remote talent right now?",
      answer: "SmartJob curates daily insights across tech, healthcare, finance, and creative sectors so you can spot remote-friendly roles first."
    },
    {
      question: "How can SmartJob help me level up my applications?",
      answer: "Access tailored resume tips, interview checklists, and application tracking tools built to boost your response rate."
    },
    {
      question: "I want to pivot careers—where should I start?",
      answer: "Use SmartJob Pathways to match transferable skills with fast-growing roles and get guided learning plans to prepare."
    },
    {
      question: "What is applicant tracking software and why does it matter?",
      answer: "Many employers use ATS to screen candidates. SmartJob formats your profile to stay on the shortlist and flags keywords recruiters expect."
    }
  ];

  const successStories = [
    {
      quote: "SmartJob surfaced a remote data role that matched my exact tech stack—hired within three weeks!",
      name: "Amelia K.",
      location: "Austin, TX",
      role: "Data Analyst at Umbra Labs",
      date: "Oct 18, 2025"
    },
    {
      quote: "The interview prep hub helped me feel confident. I landed my first UX position fully remote.",
      name: "Ravi S.",
      location: "Seattle, WA",
      role: "Product Designer at Brightwave",
      date: "Oct 11, 2025"
    },
    {
      quote: "Application tracking and alerts meant I never missed a recruiter message—got two offers in one week.",
      name: "Lina G.",
      location: "Chicago, IL",
      role: "Customer Success Lead at Flowspace",
      date: "Oct 7, 2025"
    },
    {
      quote: "SmartJob's coaching resources guided my career change from healthcare to project management.",
      name: "Marcus T.",
      location: "Atlanta, GA",
      role: "Project Manager at Meridian Health",
      date: "Oct 3, 2025"
    }
  ];
  const insightHighlights = [
    {
      title: "Personalized job intelligence",
      description: "Track salary curves, demand signals, and hot skills tailored to your profile.",
      icon: "📈"
    },
    {
      title: "Real-time application coaching",
      description: "AI prompts refine every resume, cover letter, and recruiter reply before you hit send.",
      icon: "🧠"
    },
    {
      title: "Collaboration workspace",
      description: "Share progress with mentors or teammates and keep resources in one place.",
      icon: "🤝"
    }
  ];
  const journeySteps = [
    {
      step: "Discover",
      description: "Tell us your goals and instantly receive curated roles and learning paths.",
      accent: "01"
    },
    {
      step: "Prepare",
      description: "Optimize your profile, portfolio, and outreach with guided playbooks.",
      accent: "02"
    },
    {
      step: "Connect",
      description: "Chat with hiring teams, schedule interviews, and negotiate offers on-platform.",
      accent: "03"
    }
  ];

  return (
    <div className="home-container">
      <section className="hero-section decorated-hero">
        <div className="hero-grid">
          <div className="hero-content">
            <span className="hero-pill">Smarter career moves, delivered daily</span>
            <h1 className="hero-title">Find Your Dream Job with Smart Insights & Human Support</h1>
            <p className="hero-subtitle">
              SmartJob connects ambitious professionals with vetted opportunities, real-time market data, and coaching tools that keep you interview-ready.
            </p>
            <div className="hero-buttons">
              {!loggedIn ? (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg">
                    Create Free Profile
                  </Link>
                  <Link to="/jobs" className="btn btn-outline btn-lg hero-outline">
                    Explore Open Roles
                  </Link>
                </>
              ) : role === "Employer" ? (
                <Link to="/employer" className="btn btn-primary btn-lg">
                  Post a Job
                </Link>
              ) : (
                <Link to="/jobs" className="btn btn-primary btn-lg">
                  Continue Job Search
                </Link>
              )}
            </div>
            <div className="hero-trust">
              <span>Trusted by teams at</span>
              <div className="hero-logos">
                <span>NovaTech</span>
                <span>Brightwave</span>
                <span>AtlasCare</span>
                <span>Flowspace</span>
              </div>
            </div>
          </div>
          <div className="hero-stats">
            {heroStats.map((item) => (
              <div className="hero-stat-card" key={item.label}>
                <span className="hero-stat-value">{item.value}</span>
                <span className="hero-stat-label">{item.label}</span>
                <span className="hero-stat-detail">{item.detail}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-search-container">
          <div className="hero-search-card">
            <div className="hero-search-tabs">
            <button
              type="button"
              className="hero-tab"
              onClick={() => navigate('/login', { state: { targetRole: 'JobSeeker' } })}
            >
              Candidate · Post your CV
            </button>
            <button
              type="button"
              className="hero-tab"
              onClick={() => setShowLoginModal(true)}
            >
              Recruiter · Post a Job
            </button>
          </div>

          <div className="hero-search-body">
            <h2>
              Find your Future Job among
              <span> {heroStats[1].value} </span>
              Open Positions
            </h2>
            <form className="hero-search-form" onSubmit={(e) => {
              e.preventDefault();
              navigate('/jobs', {
                state: {
                  keywords: searchKeywords,
                  region: searchRegion,
                  category: searchCategory
                }
              });
            }}>
              <div className="hero-input">
                <label htmlFor="search-keywords">Keywords</label>
                <input
                  id="search-keywords"
                  type="text"
                  placeholder="Job title, skills"
                  value={searchKeywords}
                  onChange={(e) => setSearchKeywords(e.target.value)}
                />
              </div>
              <div className="hero-input">
                <label htmlFor="search-region">Regions</label>
                <select
                  id="search-region"
                  value={searchRegion}
                  onChange={(e) => setSearchRegion(e.target.value)}
                >
                  <option value="">Any location</option>
                  <option value="Northern Province">Northern Province</option>
                  <option value="Southern Province">Southern Province</option>
                  <option value="Western Province">Western Province</option>
                  <option value="Eastern Province">Eastern Province</option>
                  <option value="Kigali City">Kigali City</option>
                </select>
              </div>
              <div className="hero-input">
                <label htmlFor="search-category">Job category</label>
                <select
                  id="search-category"
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                >
                  <option value="">All categories</option>
                  <option value="Technology">Technology</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Design">Design</option>
                  <option value="Customer Success">Customer Success</option>
                  <option value="Healthcare">Healthcare</option>
                </select>
              </div>
              <button type="submit" className="hero-search-button" aria-label="Search jobs">
                <span role="img" aria-hidden="true">🔍</span>
              </button>
            </form>
          </div>
          </div>
        </div>
      </section>

      <section className="insight-section">
        <div className="insight-grid">
          {insightHighlights.map((insight) => (
            <div className="insight-card" key={insight.title}>
              <div className="insight-icon">{insight.icon}</div>
              <h3>{insight.title}</h3>
              <p>{insight.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="features-section">
        <h2 className="section-title">Why Choose SmartJob?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Smart Matching</h3>
            <p>Our intelligent system matches you with the perfect opportunities based on your skills and preferences.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Quick Apply</h3>
            <p>Apply to multiple jobs with just a few clicks. No more repetitive form filling.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure & Private</h3>
            <p>Your data is protected with industry-standard security measures.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Track Progress</h3>
            <p>Monitor your applications and get real-time updates on your job search.</p>
          </div>
        </div>
      </section>

      <section className="questions-section">
        <div className="section-header">
          <h2>Featured Questions</h2>
          <p>Get quick answers to the most common job search challenges</p>
        </div>
        <div className="questions-grid">
          {featuredQuestions.map((item) => (
            <div className="question-card" key={item.question}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="journey-section">
        <div className="journey-wrapper">
          <div className="journey-header">
            <h2>Your SmartJob Journey</h2>
            <p>From first discovery to final offer, we guide every milestone.</p>
          </div>
          <div className="journey-timeline">
            {journeySteps.map((step) => (
              <div className="journey-card" key={step.step}>
                <span className="journey-accent">{step.accent}</span>
                <h3>{step.step}</h3>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="success-section" id="success-stories">
        <div className="section-header">
          <h2>Success Stories Fresh from the Community</h2>
          <p>Real professionals securing remote and hybrid roles with SmartJob</p>
        </div>
        <div className="testimonial-widget">
          <div className="testimonial-top">
            <div className="testimonial-rating">
              <span className="testimonial-stars">★★★★★</span>
              <span>Rated 4.9/5 by SmartJob candidates</span>
            </div>
            <div className="testimonial-counter">6,200+ offers accepted through SmartJob this year</div>
          </div>
          <div className="testimonial-slider" aria-live="polite">
            <div className="testimonial-track">
              {[...successStories, ...successStories].map((story, index) => (
                <div
                  className="testimonial-card"
                  key={`${story.name}-${index}`}
                  aria-hidden={index >= successStories.length}
                >
                  <p className="testimonial-quote">“{story.quote}”</p>
                  <div className="testimonial-meta">
                    <span className="testimonial-name">{story.name}</span>
                    <span className="testimonial-role">{story.role}</span>
                    <span className="testimonial-location">{story.location}</span>
                    <span className="testimonial-date">{story.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="testimonial-footer">
            <p>Ready to write your own SmartJob success story?</p>
            <Link to="/register" className="btn btn-primary btn-lg">
              Create Your Free Profile
            </Link>
          </div>
        </div>
      </section>

      <section className="cta-section cta-section--home">
        <div className="cta-content">
          <h2>Stay ahead with SmartJob</h2>
          <p>Track roles, collaborate with mentors, and manage every application in one place</p>
          {!loggedIn && (
            <Link to="/register" className="btn btn-primary btn-lg">
              Create Free Account
            </Link>
          )}
        </div>
      </section>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
        targetRole="Employer"
      />
    </div>
  );
}

export default Home;
