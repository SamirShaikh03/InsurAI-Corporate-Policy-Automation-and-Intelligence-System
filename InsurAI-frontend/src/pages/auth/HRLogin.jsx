import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "./components/AuthLayout";
import empAuthImage from "../../assets/emp-auth-image1.jpg";
import { InlineSpinner } from "../../components/loading";
import "bootstrap/dist/css/bootstrap.min.css";

export default function HrLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8080/hr/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        if (res.status === 404) {
          setError("HR account not found. Please check your email or register.");
        } else if (res.status === 401) {
          setError("Invalid password. Please try again.");
        } else {
          setError(text || "Login failed. Please try again.");
        }
        throw new Error(text || "Authentication failed");
      }

      const data = await res.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", "hr");
      localStorage.setItem("name", data.name);
      localStorage.setItem("id", data.id);
      navigate("/hr/dashboard");
    } catch (err) {
      // Error already set above
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="HR Sign In"
      subtitle="Access the human resources management portal"
      switchText="Don't have an account?"
      switchLink="/hr/register"
      switchLabel="Sign up"
      image={empAuthImage}
    >
      {error && (
        <div className="auth-alert auth-alert--error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} autoComplete="on">
        <div className="auth-field">
          <label className="auth-field__label" htmlFor="hr-email">
            Email address
          </label>
          <input
            id="hr-email"
            name="username"
            type="email"
            autoComplete="username"
            className={`auth-field__input ${error ? "auth-field__input--error" : ""}`}
            placeholder="hr@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="auth-field">
          <label className="auth-field__label" htmlFor="hr-password">
            Password
          </label>
          <div className="auth-field__password-wrapper">
            <input
              id="hr-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              className="auth-field__input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="auth-field__toggle"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {showPassword ? (
                  <>
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8s-4 8-11 8" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </>
                ) : (
                  <>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        <div className="auth-actions">
          <label className="auth-checkbox">
            <input
              type="checkbox"
              className="auth-checkbox__input"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span className="auth-checkbox__label">Remember me</span>
          </label>
          <Link to="/forgot-password" className="auth-link">
            Forgot password?
          </Link>
        </div>

        <button type="submit" className="auth-btn auth-btn--primary" disabled={loading}>
          {loading ? (
            <>
              <InlineSpinner size="sm" variant="white" />
              <span style={{ marginLeft: '8px' }}>Signing in...</span>
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
