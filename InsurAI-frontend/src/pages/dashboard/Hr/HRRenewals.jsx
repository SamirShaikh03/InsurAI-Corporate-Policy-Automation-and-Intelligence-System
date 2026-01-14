// src/pages/dashboard/Hr/HRRenewals.jsx
import React, { useState, useEffect, useMemo } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import API from "../../../api";
import "./HRDashboard.css";
import "./HRNewFeatures.css";

export default function HRRenewals() {
  const [renewals, setRenewals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDays, setFilterDays] = useState("all");
  const [notification, setNotification] = useState(null);

  // Fetch renewals
  useEffect(() => {
    fetchRenewals();
  }, []);

  const fetchRenewals = async () => {
    setLoading(true);
    try {
      const response = await API.get("/hr/renewals/my-employees");
      setRenewals(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching renewals:", error);
      showNotification("Failed to fetch renewal information", "error");
    } finally {
      setLoading(false);
    }
  };

  // Show notification
  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Calculate days until expiry
  const calculateDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);
    const diff = expiry - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // Statistics
  const stats = useMemo(() => {
    const total = renewals.length;
    const critical = renewals.filter(r => {
      const days = r.daysUntilExpiry || calculateDaysUntilExpiry(r.expiryDate);
      return days !== null && days <= 7 && days > 0;
    }).length;
    const warning = renewals.filter(r => {
      const days = r.daysUntilExpiry || calculateDaysUntilExpiry(r.expiryDate);
      return days !== null && days > 7 && days <= 30;
    }).length;
    const expired = renewals.filter(r => {
      const days = r.daysUntilExpiry || calculateDaysUntilExpiry(r.expiryDate);
      return days !== null && days <= 0;
    }).length;
    const active = total - expired;
    return { total, critical, warning, expired, active };
  }, [renewals]);

  // Filtered renewals
  const filteredRenewals = useMemo(() => {
    return renewals.filter(renewal => {
      const matchesSearch =
        renewal.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        renewal.policyName?.toLowerCase().includes(searchTerm.toLowerCase());
      const days = renewal.daysUntilExpiry || calculateDaysUntilExpiry(renewal.expiryDate);

      let matchesFilter = true;
      if (filterDays === "7") matchesFilter = days !== null && days <= 7;
      else if (filterDays === "15") matchesFilter = days !== null && days <= 15;
      else if (filterDays === "30") matchesFilter = days !== null && days <= 30;
      else if (filterDays === "expired") matchesFilter = days !== null && days <= 0;

      return matchesSearch && matchesFilter;
    }).sort((a, b) => {
      const daysA = a.daysUntilExpiry || calculateDaysUntilExpiry(a.expiryDate) || 999;
      const daysB = b.daysUntilExpiry || calculateDaysUntilExpiry(b.expiryDate) || 999;
      return daysA - daysB;
    });
  }, [renewals, searchTerm, filterDays]);

  // Get urgency level
  const getUrgencyLevel = (days) => {
    if (days === null) return { level: "unknown", color: "secondary", icon: "bi-question-circle" };
    if (days <= 0) return { level: "expired", color: "danger", icon: "bi-x-circle-fill" };
    if (days <= 7) return { level: "critical", color: "danger", icon: "bi-exclamation-triangle-fill" };
    if (days <= 15) return { level: "warning", color: "warning", icon: "bi-exclamation-circle-fill" };
    if (days <= 30) return { level: "attention", color: "info", icon: "bi-info-circle-fill" };
    return { level: "normal", color: "success", icon: "bi-check-circle-fill" };
  };

  // Render statistics cards
  const renderStatsCards = () => (
    <div className="row g-3 mb-4">
      <div className="col-6 col-md-2-4">
        <div className="hr-stat-card">
          <div className="hr-stat-card__icon hr-stat-card__icon--primary">
            <i className="bi bi-people"></i>
          </div>
          <div className="hr-stat-card__content">
            <span className="hr-stat-card__label">Total Employees</span>
            <strong className="hr-stat-card__value">{stats.total}</strong>
          </div>
        </div>
      </div>
      <div className="col-6 col-md-2-4">
        <div className="hr-stat-card">
          <div className="hr-stat-card__icon hr-stat-card__icon--success">
            <i className="bi bi-check-circle"></i>
          </div>
          <div className="hr-stat-card__content">
            <span className="hr-stat-card__label">Active</span>
            <strong className="hr-stat-card__value">{stats.active}</strong>
          </div>
        </div>
      </div>
      <div className="col-6 col-md-2-4">
        <div className="hr-stat-card">
          <div className="hr-stat-card__icon hr-stat-card__icon--info">
            <i className="bi bi-clock-history"></i>
          </div>
          <div className="hr-stat-card__content">
            <span className="hr-stat-card__label">Due in 30 Days</span>
            <strong className="hr-stat-card__value">{stats.warning}</strong>
          </div>
        </div>
      </div>
      <div className="col-6 col-md-2-4">
        <div className="hr-stat-card">
          <div className="hr-stat-card__icon hr-stat-card__icon--warning">
            <i className="bi bi-exclamation-triangle"></i>
          </div>
          <div className="hr-stat-card__content">
            <span className="hr-stat-card__label">Critical (&lt;7 Days)</span>
            <strong className="hr-stat-card__value">{stats.critical}</strong>
          </div>
        </div>
      </div>
      <div className="col-6 col-md-2-4">
        <div className="hr-stat-card">
          <div className="hr-stat-card__icon hr-stat-card__icon--danger">
            <i className="bi bi-x-circle"></i>
          </div>
          <div className="hr-stat-card__content">
            <span className="hr-stat-card__label">Expired</span>
            <strong className="hr-stat-card__value">{stats.expired}</strong>
          </div>
        </div>
      </div>
    </div>
  );

  // Render alert banner if critical
  const renderAlertBanner = () => {
    if (stats.critical === 0 && stats.expired === 0) return null;

    return (
      <div className={`hr-alert hr-alert--${stats.expired > 0 ? 'danger' : 'warning'} mb-4`}>
        <div className="hr-alert__icon">
          <i className={`bi ${stats.expired > 0 ? 'bi-x-octagon-fill' : 'bi-exclamation-triangle-fill'}`}></i>
        </div>
        <div className="hr-alert__content">
          <h4 className="hr-alert__title">
            {stats.expired > 0
              ? `${stats.expired} Employee Policy/Policies Have Expired!`
              : `${stats.critical} Employee Policy/Policies Expiring Soon!`}
          </h4>
          <p className="hr-alert__text">
            {stats.expired > 0
              ? "Immediate action required to renew expired employee policies and avoid coverage gaps."
              : "Please process renewals for employees whose policies are expiring within 7 days."}
          </p>
        </div>
      </div>
    );
  };

  // Render renewals table
  const renderRenewalsTable = () => (
    <div className="hr-card">
      <div className="hr-card-header d-flex justify-content-between align-items-center flex-wrap gap-3">
        <h3 className="hr-card-title mb-0">
          <i className="bi bi-calendar-check me-2"></i>
          Employee Policy Renewals
        </h3>
        <button
          className="hr-btn hr-btn--outline"
          onClick={fetchRenewals}
        >
          <i className="bi bi-arrow-clockwise me-2"></i>
          Refresh
        </button>
      </div>

      <div className="hr-card-body">
        {/* Filters */}
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <div className="hr-search-box">
              <i className="bi bi-search hr-search-box__icon"></i>
              <input
                type="text"
                className="hr-form-control"
                placeholder="Search by employee or policy name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-6">
            <select
              className="hr-form-control"
              value={filterDays}
              onChange={(e) => setFilterDays(e.target.value)}
            >
              <option value="all">All Policies</option>
              <option value="7">Expiring in 7 Days</option>
              <option value="15">Expiring in 15 Days</option>
              <option value="30">Expiring in 30 Days</option>
              <option value="expired">Expired Only</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : filteredRenewals.length > 0 ? (
          <div className="table-responsive">
            <table className="hr-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Policy</th>
                  <th>Expiry Date</th>
                  <th>Days Left</th>
                  <th>Last Notification</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRenewals.map((renewal, index) => {
                  const days = renewal.daysUntilExpiry || calculateDaysUntilExpiry(renewal.expiryDate);
                  const urgency = getUrgencyLevel(days);

                  return (
                    <tr key={index}>
                      <td>
                        <strong>{renewal.employeeName || "N/A"}</strong>
                      </td>
                      <td>{renewal.policyName || "N/A"}</td>
                      <td>
                        {renewal.expiryDate
                          ? new Date(renewal.expiryDate).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td>
                        <span className={`hr-badge hr-badge--${urgency.color}`}>
                          <i className={`bi ${urgency.icon} me-1`}></i>
                          {days === null ? "Unknown" : days <= 0 ? "EXPIRED" : `${days} Days`}
                        </span>
                      </td>
                      <td>
                        {renewal.lastNotificationSent
                          ? new Date(renewal.lastNotificationSent).toLocaleDateString()
                          : "Never"}
                      </td>
                      <td>
                        <span className={`hr-badge hr-badge--${days <= 0 ? 'danger' : 'success'}`}>
                          {days <= 0 ? "Expired" : "Active"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="hr-empty-state">
            <div className="hr-empty-state__icon">
              <i className="bi bi-calendar-check"></i>
            </div>
            <h4 className="hr-empty-state__title">No Renewals Found</h4>
            <p className="hr-empty-state__desc">
              {searchTerm || filterDays !== "all"
                ? "No policies match your search criteria."
                : "No employee policy renewal information available."}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="hr-renewals-page">
      {/* Notification Toast */}
      {notification && (
        <div className={`hr-toast hr-toast--${notification.type}`}>
          <i className={`bi ${notification.type === 'success' ? 'bi-check-circle' : notification.type === 'error' ? 'bi-x-circle' : 'bi-info-circle'} me-2`}></i>
          {notification.message}
        </div>
      )}

      {/* Page Header */}
      <div className="hr-page-header mb-4">
        <h1 className="hr-page-title">
          <i className="bi bi-calendar2-event me-3"></i>
          Policy Renewal Alerts
        </h1>
        <p className="hr-page-subtitle">
          Monitor and manage employee policy renewals
        </p>
      </div>

      {/* Alert Banner */}
      {renderAlertBanner()}

      {/* Statistics */}
      {renderStatsCards()}

      {/* Renewals Table */}
      {renderRenewalsTable()}
    </div>
  );
}

