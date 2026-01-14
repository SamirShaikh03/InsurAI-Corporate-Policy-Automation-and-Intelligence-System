import React, { useState } from "react";
import NotificationPopup from "../../shared/NotificationPopup";

const EmployeeNavbar = ({
  employeeName,
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
    <header className="emp-header" role="banner">
      <div className="emp-header-inner">
        <div className="emp-header-left">
          <button
            type="button"
            className="emp-header-toggle d-md-none"
            aria-label="Toggle navigation"
            aria-expanded={isMobileMenuOpen}
            onClick={onToggleMenu}
          >
            <i className="bi bi-list" />
          </button>
          <div className="emp-header-brand">
            <span className="emp-brand-icon" aria-hidden="true">
              <i className="bi bi-shield-check"></i>
            </span>
            <div className="emp-brand-copy">
              <h1 className="mb-0">Employee Portal</h1>
              <small>Secure access • InsurAI</small>
            </div>
          </div>
        </div>

        <div className="emp-header-right">
          <button 
            type="button" 
            className="emp-header-icon" 
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
            role="employee"
          />
          
        <button 
          type="button" 
          className="emp-header-icon" 
          aria-label="Settings"
          title="Settings"
        >
          <i className="bi bi-gear"></i>
        </button>

        <div className="emp-user-chip" aria-live="polite">
          <div className="emp-user-chip__avatar" aria-hidden="true">
            {userInitial}
          </div>
          <div className="emp-user-chip__meta">
            <span>Employee</span>
            <strong>{employeeName}</strong>
          </div>
          <button
            type="button"
            className="emp-logout-btn"
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

export default EmployeeNavbar;
