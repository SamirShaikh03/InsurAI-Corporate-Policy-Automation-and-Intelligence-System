// @ts-nocheck
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import AuthLayout from "./components/AuthLayout";
import empAuthImage from "../../assets/emp-auth-image.jpg";
import { InlineSpinner } from "../../components/loading";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/enterprise-theme.css";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const passwordRules = [
    { label: "12+ characters", check: (value) => value.length >= 12 },
    { label: "Uppercase letter", check: (value) => /[A-Z]/.test(value) },
    { label: "Lowercase letter", check: (value) => /[a-z]/.test(value) },
    { label: "Number", check: (value) => /[0-9]/.test(value) },
    { label: "Special character", check: (value) => /[^A-Za-z0-9]/.test(value) },
  ];

  const updateStrength = (value) => {
    let score = 0;
    passwordRules.forEach((rule) => {
      if (rule.check(value)) score += 20;
    });
    setPasswordStrength(score);
  };

  const isPasswordCompliant = (value) => passwordRules.every((rule) => rule.check(value));

  const getStrengthLabel = () => {
    if (passwordStrength >= 80) return "Strong";
    if (passwordStrength >= 60) return "Medium";
    if (passwordStrength >= 40) return "Weak";
    return "Very weak";
  };

  const getStrengthColor = () => {
    if (passwordStrength >= 80) return "#16a34a";
    if (passwordStrength >= 60) return "#fbbf24";
    return "#f97316";
  };

  useEffect(() => {
    if (!token) {
      setError("Reset token is missing.");
      setTokenValid(false);
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("Reset token is missing.");
      setTokenValid(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!isPasswordCompliant(password)) {
      setError("Password must be 12+ characters and include upper, lower, number, and symbol.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/auth/reset-password/${token}`,
        { newPassword: password }
      );

      setMessage(res.data || "Password reset successfully!");
      setTokenValid(false);
      setTimeout(() => navigate("/employee/login"), 2000);
    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data;

      if (status === 400) {
        setError(typeof data === "string" ? data : "Invalid or expired reset token.");
        setTokenValid(false);
      } else {
        setError("Failed to reset password. Try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create new password"
      subtitle="Choose a strong password to secure your account"
      footerText="Remember your password?"
      footerLink="/employee/login"
      footerLabel="Sign in"
      image={empAuthImage}
    >
      {error && (
        <div className="auth-error" role="alert">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div className="auth-success" role="status">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22,4 12,14.01 9,11.01" />
          </svg>
          <span>{message}</span>
        </div>
      )}

      {tokenValid && (
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="auth-field">
            <label className="auth-field__label" htmlFor="new-password">New password</label>
            <div className="auth-field__password-wrapper">
              <input
                id="new-password"
                type={showPassword ? "text" : "password"}
                className="auth-field__input"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  updateStrength(e.target.value);
                }}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="auth-field__toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-field__label" htmlFor="confirm-password">Confirm password</label>
            <div className="auth-field__password-wrapper">
              <input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                className="auth-field__input"
                placeholder="Retype your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="auth-field__toggle"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {password && (
            <div className="auth-strength">
              <div className="auth-strength__header">
                <span className="auth-strength__label">Password strength</span>
                <span className="auth-strength__value" style={{ color: getStrengthColor() }}>{getStrengthLabel()}</span>
              </div>
              <div className="auth-strength__bar">
                <div
                  className="auth-strength__fill"
                  style={{ width: `${passwordStrength}%`, backgroundColor: getStrengthColor() }}
                />
              </div>
            </div>
          )}

          <div className="auth-requirements">
            {passwordRules.map((rule) => (
              <div
                key={rule.label}
                className={`auth-requirements__item ${rule.check(password) ? "auth-requirements__item--valid" : ""}`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {rule.check(password) ? <path d="m5 13 4 4L19 7" /> : <circle cx="12" cy="12" r="4" />}
                </svg>
                <span>{rule.label}</span>
              </div>
            ))}
          </div>

          <button type="submit" className="auth-btn auth-btn--primary" disabled={loading}>
            {loading ? (
              <>
                <InlineSpinner size="sm" variant="white" />
                <span style={{ marginLeft: '8px' }}>Resetting password...</span>
              </>
            ) : (
              "Reset password"
            )}
          </button>
        </form>
      )}

      {!tokenValid && message && (
        <div className="auth-links" style={{ textAlign: "center" }}>
          <Link to="/employee/login" className="auth-link">Continue to sign in</Link>
        </div>
      )}
    </AuthLayout>
  );
}
