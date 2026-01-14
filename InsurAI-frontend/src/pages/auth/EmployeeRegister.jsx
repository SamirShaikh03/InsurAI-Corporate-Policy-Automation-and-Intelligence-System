import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "./components/AuthLayout";
import empAuthImage from "../../assets/emp-auth-image1.jpg";
import API from "../../api";
import { InlineSpinner } from "../../components/loading";
import "bootstrap/dist/css/bootstrap.min.css";

const initialFormData = {
  employeeId: "",
  name: "",
  email: "",
  password: "",
};

export default function EmployeeRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState({ text: "", tone: "success" });
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

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

  const handleRegister = async (event) => {
    event.preventDefault();
    setLoading(true);
    setAlert({ text: "", tone: "success" });

    try {
      // Call the backend registration API
      const response = await API.post("/auth/register", {
        employeeId: formData.employeeId,
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      // Show success message
      setAlert({
        text: response.data || "Employee account created successfully! Redirecting to login...",
        tone: "success",
      });

      // Reset form
      setFormData(initialFormData);
      setPasswordStrength(0);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/employee/login");
      }, 2000);

    } catch (error) {
      console.error("Registration error:", error);

      // Show error message
      const errorMessage = error.response?.data || "Registration failed. Please try again.";
      setAlert({
        text: typeof errorMessage === "string" ? errorMessage : "Registration failed. Please try again.",
        tone: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (value) => {
    setFormData({ ...formData, password: value });
    checkPasswordStrength(value);
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join InsurAI to manage your insurance policies"
      switchText="Already have an account?"
      switchLink="/employee/login"
      switchLabel="Sign in"
      image={empAuthImage}
    >
      {alert.text && (
        <div className={`auth-alert ${alert.tone === "success" ? "auth-alert--success" : "auth-alert--error"}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {alert.tone === "success" ? (
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            ) : (
              <circle cx="12" cy="12" r="10" />
            )}
            {alert.tone === "success" ? (
              <polyline points="22 4 12 14.01 9 11.01" />
            ) : (
              <>
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </>
            )}
          </svg>
          {alert.text}
        </div>
      )}

      <form onSubmit={handleRegister} autoComplete="off">
        <div className="auth-form-row">
          <div className="auth-field">
            <label className="auth-field__label" htmlFor="employee-id">
              Employee ID
            </label>
            <input
              id="employee-id"
              type="text"
              className="auth-field__input"
              placeholder="EMP-2041"
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              required
            />
          </div>

          <div className="auth-field">
            <label className="auth-field__label" htmlFor="employee-name">
              Full name
            </label>
            <input
              id="employee-name"
              type="text"
              className="auth-field__input"
              placeholder="Alex Carter"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="auth-field">
          <label className="auth-field__label" htmlFor="employee-email">
            Email address
          </label>
          <input
            id="employee-email"
            type="email"
            className="auth-field__input"
            placeholder="you@company.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        <div className="auth-field">
          <label className="auth-field__label" htmlFor="employee-password">
            Password
          </label>
          <div className="auth-field__password-wrapper">
            <input
              id="employee-password"
              type={showPassword ? "text" : "password"}
              className="auth-field__input"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={(e) => handlePasswordChange(e.target.value)}
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

          {formData.password && (
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
                  { label: "8+ characters", condition: formData.password.length >= 8 },
                  { label: "Uppercase letter", condition: /[A-Z]/.test(formData.password) },
                  { label: "Number", condition: /[0-9]/.test(formData.password) },
                  { label: "Special character", condition: /[^A-Za-z0-9]/.test(formData.password) },
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

        <button type="submit" className="auth-btn auth-btn--primary" disabled={loading}>
          {loading ? (
            <>
              <InlineSpinner size="sm" variant="white" />
              <span style={{ marginLeft: '8px' }}>Creating account...</span>
            </>
          ) : (
            "Create account"
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
