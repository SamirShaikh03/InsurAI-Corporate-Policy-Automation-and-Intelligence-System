// src/components/hr/HRNotification.jsx
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../../config";

export default function HRNotification({ currentHrId }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());

  useEffect(() => {
    if (!currentHrId) {
      setError("HR ID is not provided");
      setLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication token not found. Please login.");
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `${API_BASE_URL}/notifications/user/${currentHrId}`,
          {
            params: { role: "HR" },
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setNotifications(response.data || []);
      } catch (err) {
        if (err.response && err.response.status === 403) {
          setError("Access denied. You are not authorized to view these notifications.");
        } else {
          setError("Failed to fetch notifications");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [currentHrId]);

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication token not found. Please login.");
        return;
      }

      const response = await axios.put(
        `${API_BASE_URL}/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, readStatus: response.data.readStatus } : n
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to mark notification as read.");
    }
  };

  const markMultipleAsRead = async () => {
    if (selectedNotifications.size === 0) return;

    try {
      const token = localStorage.getItem("token");
      const promises = Array.from(selectedNotifications).map(id =>
        axios.put(
          `${API_BASE_URL}/notifications/${id}/read`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )
      );

      await Promise.all(promises);
      setNotifications(prev =>
        prev.map(n =>
          selectedNotifications.has(n.id) ? { ...n, readStatus: true } : n
        )
      );
      setSelectedNotifications(new Set());
    } catch (err) {
      console.error(err);
      alert("Failed to mark notifications as read.");
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.readStatus);
    if (unreadNotifications.length === 0) return;

    try {
      const token = localStorage.getItem("token");
      const promises = unreadNotifications.map(notification =>
        axios.put(
          `${API_BASE_URL}/notifications/${notification.id}/read`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )
      );

      await Promise.all(promises);
      setNotifications(prev =>
        prev.map(n => ({ ...n, readStatus: true }))
      );
    } catch (err) {
      console.error(err);
      alert("Failed to mark all notifications as read.");
    }
  };

  const toggleNotificationSelection = (id) => {
    const newSelected = new Set(selectedNotifications);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedNotifications(newSelected);
  };

  const selectAll = () => {
    const allIds = filteredNotifications.map(n => n.id);
    setSelectedNotifications(new Set(allIds));
  };

  const filteredNotifications = useMemo(() => {
    if (filter === "all") return notifications;
    if (filter === "unread") return notifications.filter(n => !n.readStatus);
    if (filter === "read") return notifications.filter(n => n.readStatus);
    return notifications;
  }, [notifications, filter]);

  const unreadCount = useMemo(() => notifications.filter(n => !n.readStatus).length, [notifications]);
  const readCount = useMemo(() => notifications.filter(n => n.readStatus).length, [notifications]);

  if (loading) {
    return (
      <div className="hr-loading-state">
        <div className="hr-loading-spinner"></div>
        <p>Loading notifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hr-error-state">
        <div className="hr-error-icon"><i className="bi bi-exclamation-triangle"></i></div>
        <h4>Error</h4>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="hr-notification-page">
      {/* Page Header */}
      <div className="hr-page-header">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <h1 className="hr-page-title">Notifications</h1>
            <p className="hr-page-subtitle">View important updates, alerts, and reminders</p>
          </div>
          {unreadCount > 0 && (
            <span className="hr-badge hr-badge--danger" style={{ padding: '10px 20px', fontSize: '0.95rem' }}>
              <i className="bi bi-exclamation-circle me-2"></i>
              {unreadCount} Unread
            </span>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="hr-stats-grid hr-notif-stats" style={{ marginBottom: '24px' }}>
        <div className="hr-stat-card hr-stat-card--primary">
          <div className="hr-stat-header">
            <div className="hr-stat-icon hr-stat-icon--primary"><i className="bi bi-bell"></i></div>
          </div>
          <div className="hr-stat-value">{notifications.length}</div>
          <div className="hr-stat-label">Total Notifications</div>
        </div>
        <div className="hr-stat-card hr-stat-card--warning">
          <div className="hr-stat-header">
            <div className="hr-stat-icon hr-stat-icon--warning"><i className="bi bi-envelope"></i></div>
          </div>
          <div className="hr-stat-value">{unreadCount}</div>
          <div className="hr-stat-label">Unread</div>
        </div>
        <div className="hr-stat-card hr-stat-card--success">
          <div className="hr-stat-header">
            <div className="hr-stat-icon hr-stat-icon--success"><i className="bi bi-envelope-open"></i></div>
          </div>
          <div className="hr-stat-value">{readCount}</div>
          <div className="hr-stat-label">Read</div>
        </div>
      </div>

      {/* Filter & Actions */}
      <div className="hr-card" style={{ marginBottom: '24px' }}>
        <div className="hr-card-body">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div className="hr-filter-tabs">
              <button className={`hr-filter-tab ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>
                All <span className="hr-filter-count">{notifications.length}</span>
              </button>
              <button className={`hr-filter-tab ${filter === "unread" ? "active" : ""}`} onClick={() => setFilter("unread")}>
                Unread <span className="hr-filter-count">{unreadCount}</span>
              </button>
              <button className={`hr-filter-tab ${filter === "read" ? "active" : ""}`} onClick={() => setFilter("read")}>
                Read <span className="hr-filter-count">{readCount}</span>
              </button>
            </div>

            <div className="d-flex gap-2">
              {filteredNotifications.length > 0 && (
                <button className="hr-btn hr-btn--outline" onClick={selectAll}>
                  <i className="bi bi-check2-square me-1"></i>Select All
                </button>
              )}
              {selectedNotifications.size > 0 && (
                <button className="hr-btn hr-btn--primary" onClick={markMultipleAsRead}>
                  <i className="bi bi-check2-all me-1"></i>Mark Selected ({selectedNotifications.size})
                </button>
              )}
              {unreadCount > 0 && (
                <button className="hr-btn hr-btn--success" onClick={markAllAsRead}>
                  <i className="bi bi-check2-all me-1"></i>Mark All Read
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notification Cards */}
      <div className="hr-notif-grid">
        {filteredNotifications.length === 0 ? (
          <div className="hr-empty-state" style={{ gridColumn: '1 / -1' }}>
            <div className="hr-empty-state__icon"><i className="bi bi-bell-slash"></i></div>
            <h4 className="hr-empty-state__title">No Notifications Found</h4>
            <p className="hr-empty-state__desc">
              {filter === "unread" ? "You've read all your notifications!" : "No notifications to display."}
            </p>
          </div>
        ) : (
          filteredNotifications.map((n) => (
            <div key={n.id} 
              className={`hr-notif-card ${!n.readStatus ? "hr-notif-card--unread" : ""} ${selectedNotifications.has(n.id) ? "hr-notif-card--selected" : ""}`}
              onClick={() => !n.readStatus && markAsRead(n.id)}
            >
              <div className="hr-notif-card__header">
                <label className="hr-checkbox" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" checked={selectedNotifications.has(n.id)}
                    onChange={(e) => { e.stopPropagation(); toggleNotificationSelection(n.id); }} />
                  <span className="hr-checkbox__mark"></span>
                </label>
                {!n.readStatus && (
                  <button className="hr-notif-card__action" onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }} title="Mark as Read">
                    <i className="bi bi-check-circle"></i>
                  </button>
                )}
              </div>
              <div className="hr-notif-card__icon">
                <i className={`bi ${!n.readStatus ? "bi-envelope-fill" : "bi-envelope-open"}`}></i>
              </div>
              <h6 className="hr-notif-card__title">{n.title}</h6>
              <p className="hr-notif-card__message">{n.message}</p>
              <div className="hr-notif-card__footer">
                <span className="hr-notif-card__time">
                  <i className="bi bi-clock me-1"></i>
                  {new Date(n.createdAt).toLocaleString()}
                </span>
                <span className={`hr-badge ${n.readStatus ? "hr-badge--neutral" : "hr-badge--primary"}`}>
                  {n.readStatus ? "Read" : "Unread"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Selection Bar */}
      {selectedNotifications.size > 0 && (
        <div className="hr-selection-bar">
          <div className="hr-selection-bar__content">
            <span className="hr-selection-bar__count">
              <i className="bi bi-check2-circle me-2"></i>
              {selectedNotifications.size} selected
            </span>
            <button className="hr-btn hr-btn--light" onClick={markMultipleAsRead}>
              <i className="bi bi-check2-all me-1"></i>Mark as Read
            </button>
            <button className="hr-btn hr-btn--ghost" onClick={() => setSelectedNotifications(new Set())}>
              <i className="bi bi-x-lg me-1"></i>Clear
            </button>
          </div>
        </div>
      )}

      <style>{`
        .hr-notification-page { position: relative; }
        
        .hr-notif-stats { grid-template-columns: repeat(3, 1fr); }
        @media (max-width: 768px) { .hr-notif-stats { grid-template-columns: 1fr; } }
        
        .hr-filter-tabs { display: flex; gap: 8px; flex-wrap: wrap; }
        .hr-filter-tab { padding: 10px 20px; border: 2px solid var(--hr-border, #e2e8f0); border-radius: var(--hr-radius, 10px); background: var(--hr-surface, #fff); color: var(--hr-text-muted, #64748b); font-weight: 600; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 8px; }
        .hr-filter-tab:hover { border-color: var(--hr-primary, #0d9488); color: var(--hr-primary, #0d9488); }
        .hr-filter-tab.active { background: var(--hr-primary, #0d9488); border-color: var(--hr-primary, #0d9488); color: #fff; }
        .hr-filter-tab.active .hr-filter-count { background: rgba(255,255,255,0.25); color: #fff; }
        .hr-filter-count { padding: 2px 8px; border-radius: 20px; background: var(--hr-subtle, #f1f5f9); font-size: 0.8rem; }
        
        .hr-notif-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 20px; }
        
        .hr-notif-card { background: var(--hr-surface, #fff); border-radius: var(--hr-radius-lg, 14px); padding: 20px; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06); border: 2px solid var(--hr-border, #e2e8f0); cursor: pointer; transition: all 0.25s ease; position: relative; }
        .hr-notif-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(15, 23, 42, 0.12); }
        .hr-notif-card--unread { border-color: var(--hr-warning, #f59e0b); background: linear-gradient(135deg, rgba(245, 158, 11, 0.04) 0%, var(--hr-surface, #fff) 100%); }
        .hr-notif-card--selected { border-color: var(--hr-primary, #0d9488); background: linear-gradient(135deg, rgba(13, 148, 136, 0.06) 0%, var(--hr-surface, #fff) 100%); }
        
        .hr-notif-card__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .hr-notif-card__action { width: 32px; height: 32px; border-radius: 8px; border: none; background: rgba(16, 185, 129, 0.1); color: var(--hr-success, #10b981); cursor: pointer; transition: all 0.2s; }
        .hr-notif-card__action:hover { background: var(--hr-success, #10b981); color: #fff; }
        
        .hr-notif-card__icon { width: 48px; height: 48px; border-radius: 12px; background: var(--hr-primary-subtle, rgba(13, 148, 136, 0.1)); color: var(--hr-primary, #0d9488); display: flex; align-items: center; justify-content: center; font-size: 1.25rem; margin-bottom: 16px; }
        .hr-notif-card--unread .hr-notif-card__icon { background: rgba(245, 158, 11, 0.15); color: var(--hr-warning, #f59e0b); }
        
        .hr-notif-card__title { font-size: 1rem; font-weight: 600; color: var(--hr-text, #0f172a); margin: 0 0 8px; line-height: 1.4; }
        .hr-notif-card__message { font-size: 0.9rem; color: var(--hr-text-muted, #64748b); margin: 0 0 16px; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        
        .hr-notif-card__footer { display: flex; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 1px solid var(--hr-border, #e2e8f0); }
        .hr-notif-card__time { font-size: 0.8rem; color: var(--hr-text-light, #94a3b8); }
        
        .hr-checkbox { display: flex; align-items: center; cursor: pointer; }
        .hr-checkbox input { display: none; }
        .hr-checkbox__mark { width: 20px; height: 20px; border: 2px solid var(--hr-border, #e2e8f0); border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .hr-checkbox__mark::after { content: ''; width: 10px; height: 10px; background: var(--hr-primary, #0d9488); border-radius: 3px; opacity: 0; transition: opacity 0.2s; }
        .hr-checkbox input:checked + .hr-checkbox__mark { border-color: var(--hr-primary, #0d9488); background: rgba(13, 148, 136, 0.1); }
        .hr-checkbox input:checked + .hr-checkbox__mark::after { opacity: 1; }
        
        .hr-selection-bar { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); z-index: 100; }
        .hr-selection-bar__content { display: flex; align-items: center; gap: 16px; padding: 12px 24px; background: linear-gradient(135deg, var(--hr-primary-dark, #0f766e) 0%, var(--hr-primary, #0d9488) 100%); color: #fff; border-radius: 50px; box-shadow: 0 8px 32px rgba(13, 148, 136, 0.4); }
        .hr-selection-bar__count { font-weight: 600; font-size: 0.95rem; }
        
        .hr-btn--light { background: #fff; color: var(--hr-primary, #0d9488); border: none; padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .hr-btn--light:hover { background: rgba(255,255,255,0.9); }
        .hr-btn--ghost { background: transparent; color: rgba(255,255,255,0.9); border: 1px solid rgba(255,255,255,0.3); padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .hr-btn--ghost:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.5); }
        .hr-btn--success { background: var(--hr-success, #10b981); color: #fff; border: none; }
        .hr-btn--success:hover { background: #059669; }
        
        .hr-loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; color: var(--hr-text-muted); }
        .hr-loading-spinner { width: 48px; height: 48px; border: 4px solid var(--hr-subtle); border-top-color: var(--hr-primary); border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 16px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        
        .hr-error-state { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 300px; text-align: center; padding: 40px; }
        .hr-error-icon { width: 80px; height: 80px; border-radius: 50%; background: rgba(239, 68, 68, 0.1); color: var(--hr-danger, #ef4444); display: flex; align-items: center; justify-content: center; font-size: 2rem; margin-bottom: 20px; }
        .hr-error-state h4 { color: var(--hr-text, #0f172a); margin: 0 0 8px; }
        .hr-error-state p { color: var(--hr-text-muted, #64748b); margin: 0; }
      `}</style>
    </div>
  );
}
