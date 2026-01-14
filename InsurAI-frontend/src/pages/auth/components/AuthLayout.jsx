import React from "react";
import { Link } from "react-router-dom";
import logoImage from "../../../assets/logo-img.png";

/**
 * AuthLayout – Shared layout for all authentication pages
 * Two-column layout: Left = Form, Right = Image panel
 */
export default function AuthLayout({ 
  children, 
  title = "Welcome",
  subtitle = "",
  switchText = "",
  switchLink = "",
  switchLabel = "",
  footerText = "",
  footerLink = "",
  footerLabel = "",
  image = ""
}) {
  return (
    <div className="auth-page">
      {/* Left Column - Form Area */}
      <div className="auth-page__form">
        {/* Brand */}
        <Link to="/" className="auth-page__brand">
          <img
            src={logoImage}
            alt="InsurAI"
            style={{
              height: "40px",
              width: "auto",
            }}
          />
        </Link>
        <div className="auth-page__form-inner">

          {/* Header */}
          <div className="auth-page__header">
            <h1 className="auth-page__title">{title}</h1>
            {subtitle && <p className="auth-page__subtitle">{subtitle}</p>}
            {switchText && switchLink && switchLabel && (
              <p className="auth-page__switch">
                {switchText} <Link to={switchLink}>{switchLabel}</Link>
              </p>
            )}
          </div>

          {/* Form Content */}
          <div className="auth-page__content">
            {children}
          </div>

          {/* Footer */}
          {footerText && footerLink && footerLabel && (
            <p className="auth-page__footer">
              {footerText} <Link to={footerLink}>{footerLabel}</Link>
            </p>
          )}

          {/* Legal */}
          <div className="auth-page__legal">
            <p>
              By continuing, you agree to InsurAI's{" "}
              <a href="/terms">Terms of Service</a> and{" "}
              <a href="/privacy">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>

      {/* Right Column - Image Panel */}
      <div className="auth-page__visual">
        {image && (
          <img 
            src={image} 
            alt="Insurance illustration" 
            className="auth-page__image"
          />
        )}
      </div>
    </div>
  );
}
