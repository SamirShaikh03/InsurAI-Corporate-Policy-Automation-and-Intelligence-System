// @ts-nocheck
import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import AuthLayout from "./components/AuthLayout";
import empAuthImage from "../../assets/emp-auth-image1.jpg";
import { InlineSpinner } from "../../components/loading";
import "bootstrap/dist/css/bootstrap.min.css";

export default function HrRegister({ onBack }) {
  const [newHr, setNewHr] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    hrId: "",
    password: ""
  });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const validatePhone = (phone) => {
    const digits = phone.replace(/\D/g, '');
    const re = /^[6-9]\d{9}$/;
    return re.test(digits);
  };

  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    setPasswordStrength(strength);
  };

  const strengthLabel = () => {
    if (passwordStrength >= 75) return "Strong";
    if (passwordStrength >= 50) return "Medium";
    if (passwordStrength >= 25) return "Weak";
    return "Very weak";
  };

  const strengthColor = () => {
    if (passwordStrength >= 75) return "#16a34a";
    if (passwordStrength >= 50) return "#fbbf24";
    if (passwordStrength >= 25) return "#f97316";
    return "#94a3b8";
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 10) value = value.slice(0, 10);
    const formattedValue = value.length > 5 ? value.slice(0, 5) + ' ' + value.slice(5) : value;
    setNewHr({ ...newHr, phoneNumber: formattedValue });
  };

  const handlePasswordChange = (e) => {
    setNewHr({ ...newHr, password: e.target.value });
    checkPasswordStrength(e.target.value);
  };

  const handleRegisterHr = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!validateEmail(newHr.email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    if (!validatePhone(newHr.phoneNumber)) {
      setError("Please enter a valid 10-digit phone number");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login as Admin first.");
        setLoading(false);
        return;
      }

      const response = await axios.post(
        "http://localhost:8080/admin/hr/register",
        newHr,
        {
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          withCredentials: true,
        }
      );

      setSuccess(response.data || "HR staff registered successfully!");
      setNewHr({ name: "", email: "", phoneNumber: "", hrId: "", password: "" });
      setPasswordStrength(0);
    } catch (err) {
      setError(err.response?.data || "Failed to register HR staff");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create HR account"
      subtitle="Register human resources staff"
      switchText="Already have an account?"
      switchLink="/hr/login"
      switchLabel="Sign in"
      image={empAuthImage}
    >
      {success && (
        <div className="auth-alert auth-alert--success">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          {success}
        </div>
      )}

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

      <form onSubmit={handleRegisterHr} autoComplete="off">
        <div className="auth-field">
          <label className="auth-field__label" htmlFor="hr-name">
            Full name
          </label>
          <input
            id="hr-name"
            type="text"
            className="auth-field__input"
            placeholder="Enter full name"
            value={newHr.name}
            onChange={(e) => setNewHr({ ...newHr, name: e.target.value })}
            required
          />
        </div>

        <div className="auth-field">
          <label className="auth-field__label" htmlFor="hr-email">
            Email address
          </label>
          <input
            id="hr-email"
            type="email"
            className="auth-field__input"
            placeholder="hr@company.com"
            value={newHr.email}
            onChange={(e) => setNewHr({ ...newHr, email: e.target.value })}
            required
          />
        </div>

        <div className="auth-field">
          <label className="auth-field__label" htmlFor="hr-phone">
            Phone number
          </label>
          <input
            id="hr-phone"
            type="tel"
            className="auth-field__input"
            placeholder="98765 43210"
            value={newHr.phoneNumber}
            onChange={handlePhoneChange}
            required
            maxLength={11}
          />
        </div>

        <div className="auth-field">
          <label className="auth-field__label" htmlFor="hr-id">
            HR ID
          </label>
          <input
            id="hr-id"
            type="text"
            className="auth-field__input"
            placeholder="HR-OPS-01"
            value={newHr.hrId}
            onChange={(e) => setNewHr({ ...newHr, hrId: e.target.value })}
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
              type={showPassword ? "text" : "password"}
              className="auth-field__input"
              placeholder="Create a secure password"
              value={newHr.password}
              onChange={handlePasswordChange}
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

          {newHr.password && (
            <div className="auth-strength">
              <div className="auth-strength__header">
                <span>Password strength</span>
                <span className="auth-strength__label">{strengthLabel()}</span>
              </div>
              <div className="auth-strength__bar">
                <div
                  className="auth-strength__fill"
                  style={{ width: `${passwordStrength}%`, background: strengthColor() }}
                />
              </div>
              <div className="auth-requirements">
                {[
                  { label: "8+ characters", condition: newHr.password.length >= 8 },
                  { label: "Uppercase letter", condition: /[A-Z]/.test(newHr.password) },
                  { label: "Number", condition: /[0-9]/.test(newHr.password) },
                  { label: "Special character", condition: /[^A-Za-z0-9]/.test(newHr.password) },
                ].map((rule) => (
                  <div key={rule.label} className={`auth-requirements__item ${rule.condition ? "auth-requirements__item--valid" : ""}`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {rule.condition ? <path d="m5 13 4 4L19 7" /> : <circle cx="12" cy="12" r="4" />}
                    </svg>
                    {rule.label}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button type="submit" className="auth-btn auth-btn--primary" disabled={loading} style={{ flex: 1 }}>
            {loading ? (
              <>
                <InlineSpinner size="sm" variant="white" />
                <span style={{ marginLeft: '8px' }}>Registering...</span>
              </>
            ) : (
              "Create account"
            )}
          </button>
          {onBack && (
            <button type="button" className="auth-btn auth-btn--secondary" onClick={onBack} disabled={loading}>
              Back
            </button>
          )}
        </div>
      </form>
    </AuthLayout>
  );
}