import React, { useState } from "react";
import NotificationPopup from "../../shared/NotificationPopup";

const HRNavbar = ({
  hrName,
  userInitial,
  onLogout,
  onToggleMenu,
  isMobileMenuOpen,
  notificationCount = 0,
  notifications = [],
  onNotificationClick,
  onMarkAsRead,
}) => {
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);

  return (
    <header className="hr-header" role="banner">
      <div className="hr-header-inner">
        <div className="hr-header-left">
          <button
            type="button"
            className="hr-header-toggle d-md-none"
            aria-label="Toggle navigation"
            aria-expanded={isMobileMenuOpen}
            onClick={onToggleMenu}
          >
            <i className="bi bi-list" />
          </button>
          <div className="hr-header-brand">
            <span className="hr-brand-icon" aria-hidden="true">
              <i className="bi bi-people-fill"></i>
            </span>
            <div className="hr-brand-copy">
              <h1 className="mb-0">HR Portal</h1>
              <small>Human Resources • InsurAI</small>
            </div>
          </div>
        </div>

        <div className="hr-header-right">
          <button 
            type="button" 
            className="hr-header-icon" 
            aria-label="Notifications"
            title="Notifications"
            onClick={() => setShowNotificationPopup(!showNotificationPopup)}
          >
            <i className="bi bi-bell"></i>
            {notificationCount > 0 && <span className="badge-dot" />}
          </button>

          {/* Notification Popup */}
          <NotificationPopup
            isOpen={showNotificationPopup}
            onClose={() => setShowNotificationPopup(false)}
            notifications={notifications}
            onNotificationClick={onNotificationClick}
            onMarkAsRead={onMarkAsRead}
            role="hr"
          />
          
        <button 
          type="button" 
          className="hr-header-icon" 
          aria-label="Settings"
          title="Settings"
        >
          <i className="bi bi-gear"></i>
        </button>

        <div className="hr-user-chip" aria-live="polite">
          <div className="hr-user-chip__avatar" aria-hidden="true">
            {userInitial}
          </div>
          <div className="hr-user-chip__meta">
            <span>HR Staff</span>
          </div>
          <button
            type="button"
            className="hr-logout-btn"
            aria-label="Logout"
            title="Sign out"
            onClick={onLogout}
          >
            <i className="bi bi-box-arrow-right" aria-hidden="true"></i>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  </header>
);
};

export default HRNavbar;
