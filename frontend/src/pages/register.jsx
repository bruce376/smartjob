import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api, { setAuthToken } from "../utils/api";
import GoogleLoginButton from "../components/GoogleLoginButton";

const Register = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const preSelectedRole = location.state?.role || "JobSeeker";
  const returnTo = location.state?.returnTo || null;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: preSelectedRole
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const requiredFields = [
        { key: "name", label: t('auth.name') },
        { key: "email", label: t('auth.email') },
        { key: "password", label: t('auth.password') },
        { key: "confirmPassword", label: t('auth.confirmPassword') },
        { key: "role", label: t('auth.role') }
      ];

      const missingFields = requiredFields
        .filter(({ key }) => !formData[key] || !formData[key].toString().trim())
        .map(({ label }) => label);

      if (missingFields.length > 0) {
        setError(`${t('auth.fillIn')}: ${missingFields.join(", ")}`);
        setLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError(t('auth.passwordsNotMatch'));
        setLoading(false);
        return;
      }

      if (formData.password && formData.password.length < 6) {
        setError(t('auth.passwordMinLength'));
        setLoading(false);
        return;
      }

      const res = await api.post("/auth/register", formData);
      
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        
        // Set auth token for API requests
        setAuthToken(res.data.token);
        
        setError(t('auth.signupSuccess') + "! " + t('auth.redirecting') + "...");
        
        setTimeout(() => {
          if (returnTo) {
            navigate(returnTo);
          } else if (res.data.user.role === "Employer") {
            navigate("/employer");
          } else {
            navigate("/jobs");
          }
        }, 1500);
      } else {
        setError(res.data.message || t('auth.signupError'));
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 409) {
          setError(t('auth.accountExists'));
        } else if (err.response.data?.message) {
          setError(err.response.data.message);
        }
      } else if (err.request) {
        setError(t('errors.networkError'));
      } else {
        setError(err.message || t('errors.unknownError'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>{t('auth.createAccount')}</h2>
          <p>{t('auth.joinToday')}</p>
        </div>

        {error && (
          <div className="error-message" style={{ whiteSpace: 'pre-line', marginBottom: '1rem', color: '#e74c3c' }}>
            {error}
          </div>
        )}

        <GoogleLoginButton mode="signup" />

        <div className="divider">
          <span>{t('common.or')}</span>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">{t('auth.name')}</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder={t('auth.namePlaceholder')}
              value={formData.name}
              onChange={handleChange}
              autoComplete="name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">{t('auth.emailAddress')}</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder={t('auth.emailPlaceholder')}
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('auth.password')}</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder={t('auth.passwordMinLengthPlaceholder')}
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              minLength="6"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">{t('auth.confirmPassword')}</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder={t('auth.confirmPasswordPlaceholder')}
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              minLength="6"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">{t('auth.role')}</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="JobSeeker">{t('auth.jobSeeker')}</option>
              <option value="Employer">{t('auth.employer')}</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? t('auth.creatingAccount') : t('auth.signup')}
          </button>
        </form>

        <div className="auth-footer">
          <p>{t('auth.alreadyHaveAccount')} <Link to="/login">{t('auth.loginHere')}</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;