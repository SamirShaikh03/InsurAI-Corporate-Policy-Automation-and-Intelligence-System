import React from "react";
import "./NotificationPopup.css";

/**
 * NotificationPopup Component
 * 
 * A reusable notification popup that displays a list of notifications
 * with headline, time, and read status. Shows on bell icon click.
 * 
 * @param {boolean} isOpen - Controls popup visibility
 * @param {function} onClose - Callback to close the popup
 * @param {Array} notifications - Array of notification objects
 * @param {function} onNotificationClick - Callback when clicking a notification
 * @param {function} onMarkAsRead - Callback to mark a notification as read
 * @param {string} role - User role (for styling variants)
 */
const NotificationPopup = ({
  isOpen,
  onClose,
  notifications = [],
  onNotificationClick,
  onMarkAsRead,
  role = "default"
}) => {
  if (!isOpen) return null;

  const formatTime = (timestamp) => {
    if (!timestamp) return "Just now";
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (error) {
      return "Recently";
    }
  };

  const getNotificationIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'claim':
        return 'bi-file-earmark-check';
      case 'policy':
        return 'bi-card-list';
      case 'alert':
      case 'warning':
        return 'bi-exclamation-triangle';
      case 'success':
        return 'bi-check-circle';
      case 'info':
        return 'bi-info-circle';
      default:
        return 'bi-bell';
    }
  };

  const unreadCount = notifications.filter(n => !n.readStatus && !n.read).length;

  return (
    <>
      {/* Backdrop */}
      <div className="notification-popup-backdrop" onClick={onClose} />
      
      {/* Popup Container */}
      <div className={`notification-popup ${role}`}>
        {/* Header */}
        <div className="notification-popup-header">
          <div className="notification-popup-title">
            <i className="bi bi-bell"></i>
            <span>Notifications</span>
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </div>
          <button 
            className="notification-popup-close"
            onClick={onClose}
            aria-label="Close notifications"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* Notifications List */}
        <div className="notification-popup-body">
          {notifications.length === 0 ? (
            <div className="notification-empty">
              <i className="bi bi-inbox"></i>
              <p>No notifications</p>
              <small>You're all caught up!</small>
            </div>
          ) : (
            <div className="notification-list">
              {notifications.map((notification) => {
                const isUnread = !notification.readStatus && !notification.read;
                
                return (
                  <div
                    key={notification.id}
                    className={`notification-item ${isUnread ? 'unread' : ''}`}
                    onClick={() => {
                      if (onNotificationClick) {
                        onNotificationClick(notification);
                      }
                      if (isUnread && onMarkAsRead) {
                        onMarkAsRead(notification.id);
                      }
                    }}
                  >
                    <div className="notification-item-icon">
                      <i className={`bi ${getNotificationIcon(notification.type || notification.notificationType)}`}></i>
                    </div>
                    <div className="notification-item-content">
                      <div className="notification-item-header">
                        <h4 className="notification-item-title">
                          {notification.title || notification.message || "Notification"}
                        </h4>
                        {isUnread && <span className="notification-unread-dot"></span>}
                      </div>
                      <p className="notification-item-time">
                        <i className="bi bi-clock"></i>
                        {formatTime(notification.createdAt || notification.timestamp || notification.time)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="notification-popup-footer">
            <button 
              className="notification-view-all"
              onClick={() => {
                onClose();
                // The parent component should handle navigation to full notifications page
              }}
            >
              View all notifications
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationPopup;
