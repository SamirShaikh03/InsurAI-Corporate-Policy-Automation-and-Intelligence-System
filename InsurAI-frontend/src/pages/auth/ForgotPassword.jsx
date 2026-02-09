// @ts-nocheck
import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../../config";
import AuthLayout from "./components/AuthLayout";
import empAuthImage from "../../assets/emp-auth-image.jpg";
import { InlineSpinner } from "../../components/loading";
import "bootstrap/dist/css/bootstrap.min.css";
import "../../styles/enterprise-theme.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/auth/forgot-password`, {
        email: email.trim().toLowerCase()
      });

      // Backend now returns a plain string message, so handle accordingly
      setMessage(res.data || "Password reset link sent! Check your email.");
    } catch (err) {
      if (err.response?.status === 404) {
        setError("Email not found. Please check or register.");
      } else {
        setError("Failed to send reset link. Try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a reset link"
      footerText="Remember your password?"
      footerLink="/employee/login"
      footerLabel="Sign in"
      image={empAuthImage}
    >
      {/* Info notice */}
      <div className="auth-notice">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <span>Reset links expire in 15 minutes and can only be used once.</span>
      </div>

      {/* Error message */}
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

      {/* Success message */}
      {message && (
        <div className="auth-success" role="status">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22,4 12,14.01 9,11.01" />
          </svg>
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} autoComplete="off">
        {/* Email field */}
        <div className="auth-field">
          <label className="auth-field__label" htmlFor="reset-email">Email address</label>
          <input
            id="reset-email"
            type="email"
            className="auth-field__input"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />
        </div>

        {/* Submit button */}
        <button type="submit" className="auth-btn auth-btn--primary" disabled={loading}>
          {loading ? (
            <>
              <InlineSpinner size="sm" variant="white" />
              <span style={{ marginLeft: '8px' }}>Sending link...</span>
            </>
          ) : (
            "Send reset link"
          )}
        </button>
      </form>

      {/* Additional links */}
      <div className="auth-links">
        <Link to="/employee/login" className="auth-link">Back to sign in</Link>
        <span className="auth-links__divider">•</span>
        <Link to="/employee/register" className="auth-link">Create an account</Link>
      </div>
    </AuthLayout>
  );
}
