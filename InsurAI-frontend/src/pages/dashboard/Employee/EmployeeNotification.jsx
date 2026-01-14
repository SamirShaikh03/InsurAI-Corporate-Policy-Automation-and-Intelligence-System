// src/components/notification/EmployeeNotification.jsx
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./EmployeeNotification.css";

export default function EmployeeNotification({ userDbId, token }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [selectedNotifications, setSelectedNotifications] = useState(new Set());

  useEffect(() => {
    if (!userDbId) {
      setError("User DB ID not provided.");
      setLoading(false);
      return;
    }

    if (!token) {
      setError("Authentication token not found. Please login.");
      setLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const url =
          filter === "unread"
            ? `http://localhost:8080/notifications/user/${Number(userDbId)}/unread`
            : `http://localhost:8080/notifications/user/${Number(userDbId)}`;

        const response = await axios.get(url, {
          params: { role: "EMPLOYEE" },
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
          setNotifications(response.data || []);
          setError(null);
        } else {
          setError("Failed to fetch notifications.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch notifications from server.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userDbId, token, filter]);

  const markAsRead = async (notificationId) => {
    try {
      const response = await axios.put(
        `http://localhost:8080/notifications/${Number(notificationId)}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200 && response.data) {
        setNotifications((prev) =>
          prev.map((n) =>
            Number(n.id) === Number(notificationId)
              ? { ...n, readStatus: true }
              : n
          )
        );
        setSelectedNotifications((prev) => {
          const updated = new Set(prev);
          updated.delete(Number(notificationId));
          return updated;
        });
      } else {
        alert("Failed to mark notification as read.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to mark notification as read.");
    }
  };

  const toggleSelection = (id) => {
    setSelectedNotifications((prev) => {
      const updated = new Set(prev);
      if (updated.has(Number(id))) {
        updated.delete(Number(id));
      } else {
        updated.add(Number(id));
      }
      return updated;
    });
  };

  const clearSelection = () => setSelectedNotifications(new Set());

  const markMultipleAsRead = async () => {
    if (selectedNotifications.size === 0) return;

    try {
      await Promise.all(
        Array.from(selectedNotifications).map((id) =>
          axios.put(
            `http://localhost:8080/notifications/${Number(id)}/read`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          )
        )
      );

      setNotifications((prev) =>
        prev.map((n) =>
          selectedNotifications.has(Number(n.id))
            ? { ...n, readStatus: true }
            : n
        )
      );
      clearSelection();
    } catch (err) {
      console.error(err);
      alert("Failed to mark selected notifications as read.");
    }
  };

  const filteredNotifications = useMemo(() => {
    if (filter === "unread") return notifications.filter((n) => !n.readStatus);
    if (filter === "read") return notifications.filter((n) => n.readStatus);
    return notifications;
  }, [notifications, filter]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.readStatus).length,
    [notifications]
  );
  const readCount = useMemo(
    () => notifications.filter((n) => n.readStatus).length,
    [notifications]
  );
  const totalCount = notifications.length;

  const filterOptions = useMemo(
    () => [
      { value: "all", label: "All", count: totalCount, icon: "bi-infinity" },
      { value: "unread", label: "Unread", count: unreadCount, icon: "bi-bell" },
      { value: "read", label: "Read", count: readCount, icon: "bi-check2-all" },
    ],
    [totalCount, unreadCount, readCount]
  );

  if (loading) {
    return (
      <section className="employee-notifications">
        <div className="notifications-state notifications-state--loading">
          <span className="notifications-spinner" aria-hidden="true"></span>
          <p>Fetching the latest alerts...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="employee-notifications">
        <div className="notifications-state notifications-state--error">
          <i className="bi bi-exclamation-triangle" aria-hidden="true"></i>
          <div>
            <h5>Something went wrong</h5>
            <p>{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="employee-notifications">
      <header className="notifications-hero">
        <div>
          <p className="notifications-hero__kicker">Signal center</p>
          <h3>Notifications & updates</h3>
          <p>Track claim progress, policy reminders, and HR nudges from a single stream.</p>
        </div>
        <div className="notifications-hero__stats">
          <div className="notifications-pill notifications-pill--accent">
            <span>Unread</span>
            <strong>{unreadCount}</strong>
          </div>
          <div className="notifications-pill">
            <span>Resolved</span>
            <strong>{readCount}</strong>
          </div>
        </div>
      </header>

      <div className="notifications-panel">
        <div className="notifications-panel__head">
          <div>
            <p className="notifications-panel__eyebrow">Filters</p>
            <h5>Focus what matters</h5>
          </div>
          <span className="notifications-panel__meta">
            Auto-refreshes every 30 seconds
          </span>
        </div>
        <div className="notifications-tabs">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`notifications-tab ${filter === option.value ? "is-active" : ""}`}
              onClick={() => setFilter(option.value)}
            >
              <i className={`bi ${option.icon}`} aria-hidden="true"></i>
              <span>{option.label}</span>
              <small>{option.count}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="notifications-grid">
        {filteredNotifications.length === 0 ? (
          <div className="notifications-state notifications-state--empty">
            <i className="bi bi-bell-slash" aria-hidden="true"></i>
            <h5>No notifications {filter === "all" ? "yet" : filter}</h5>
            <p>
              {filter === "all"
                ? "You're entirely up to date."
                : "Try switching filters to see other alerts."}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const isSelected = selectedNotifications.has(Number(notification.id));
            return (
              <article
                key={notification.id}
                className={`notification-card ${
                  !notification.readStatus ? "notification-card--unread" : ""
                } ${isSelected ? "notification-card--selected" : ""}`}
              >
                <div className="notification-card__header">
                  <div className="notification-card__title">
                    <span className="notification-card__icon">
                      <i className="bi bi-bell" aria-hidden="true"></i>
                    </span>
                    <div>
                      <h6>{notification.title}</h6>
                      <p>#{notification.id}</p>
                    </div>
                  </div>
                  <div className="notification-card__toolbar">
                    <label className="notification-checkbox">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelection(notification.id)}
                      />
                      <span aria-hidden="true"></span>
                    </label>
                    {!notification.readStatus && (
                      <button
                        type="button"
                        className="notification-icon-btn"
                        onClick={() => markAsRead(notification.id)}
                        title="Mark as read"
                      >
                        <i className="bi bi-check2-circle" aria-hidden="true"></i>
                      </button>
                    )}
                  </div>
                </div>

                <p className="notification-card__message">{notification.message}</p>

                <footer className="notification-card__footer">
                  <span
                    className={`notification-chip ${
                      notification.readStatus ? "notification-chip--neutral" : "notification-chip--awake"
                    }`}
                  >
                    <i
                      className={`bi ${notification.readStatus ? "bi-check-circle" : "bi-exclamation-circle"}`}
                      aria-hidden="true"
                    ></i>
                    {notification.readStatus ? "Read" : "Unread"}
                  </span>
                  <time dateTime={notification.createdAt}>
                    {new Date(notification.createdAt).toLocaleString()}
                  </time>
                </footer>
              </article>
            );
          })
        )}
      </div>

      {selectedNotifications.size > 0 && (
        <div className="notifications-drawer">
          <div>
            <span className="notifications-drawer__label">Bulk actions</span>
            <strong>{selectedNotifications.size} selected</strong>
          </div>
          <div className="notifications-drawer__actions">
            <button type="button" className="notifications-btn" onClick={markMultipleAsRead}>
              <i className="bi bi-check2-all" aria-hidden="true"></i>
              Mark as read
            </button>
            <button type="button" className="notifications-btn notifications-btn--ghost" onClick={clearSelection}>
              Clear
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
