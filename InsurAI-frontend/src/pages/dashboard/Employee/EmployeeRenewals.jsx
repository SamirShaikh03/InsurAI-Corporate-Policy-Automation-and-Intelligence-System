// src/pages/dashboard/Employee/EmployeeRenewals.jsx
import React, { useState, useEffect, useMemo } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import API from "../../../api";
import "./EmployeeTheme.css";
import "./EmployeeNewFeatures.css";

export default function EmployeeRenewals({ showNotificationAlert }) {
  const [renewals, setRenewals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDays, setFilterDays] = useState("all");

  // Fetch renewals on mount
  useEffect(() => {
    fetchRenewals();
  }, []);

  const fetchRenewals = async () => {
    setLoading(true);
    try {
      const response = await API.get("/employee/renewals/my-policies");
      setRenewals(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching renewals:", error);
      showNotificationAlert?.("Failed to fetch renewal information", "error");
    } finally {
      setLoading(false);
    }
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
      const days = r.daysUntilExpiry || calculateDaysUntilExpiry(r.currentExpiryDate);
      return days !== null && days <= 7 && days > 0;
    }).length;
    const warning = renewals.filter(r => {
      const days = r.daysUntilExpiry || calculateDaysUntilExpiry(r.currentExpiryDate);
      return days !== null && days > 7 && days <= 30;
    }).length;
    const expired = renewals.filter(r => {
      const days = r.daysUntilExpiry || calculateDaysUntilExpiry(r.currentExpiryDate);
      return days !== null && days <= 0;
    }).length;
    const active = total - expired;
    return { total, critical, warning, expired, active };
  }, [renewals]);

  // Filtered renewals
  const filteredRenewals = useMemo(() => {
    return renewals.filter(renewal => {
      const matchesSearch = renewal.policyName?.toLowerCase().includes(searchTerm.toLowerCase());
      const days = renewal.daysUntilExpiry || calculateDaysUntilExpiry(renewal.currentExpiryDate);

      let matchesFilter = true;
      if (filterDays === "7") matchesFilter = days !== null && days <= 7;
      else if (filterDays === "15") matchesFilter = days !== null && days <= 15;
      else if (filterDays === "30") matchesFilter = days !== null && days <= 30;
      else if (filterDays === "expired") matchesFilter = days !== null && days <= 0;

      return matchesSearch && matchesFilter;
    }).sort((a, b) => {
      const daysA = a.daysUntilExpiry || calculateDaysUntilExpiry(a.currentExpiryDate) || 999;
      const daysB = b.daysUntilExpiry || calculateDaysUntilExpiry(b.currentExpiryDate) || 999;
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
      <div className="col-6 col-lg-2-4">
        <div className="emp-stat-card">
          <div className="emp-stat-card__icon emp-stat-card__icon--primary">
            <i className="bi bi-shield-check"></i>
          </div>
          <div className="emp-stat-card__content">
            <span className="emp-stat-card__label">Total Policies</span>
            <strong className="emp-stat-card__value">{stats.total}</strong>
          </div>
        </div>
      </div>
      <div className="col-6 col-lg-2-4">
        <div className="emp-stat-card">
          <div className="emp-stat-card__icon emp-stat-card__icon--success">
            <i className="bi bi-check-circle"></i>
          </div>
          <div className="emp-stat-card__content">
            <span className="emp-stat-card__label">Active</span>
            <strong className="emp-stat-card__value">{stats.active}</strong>
          </div>
        </div>
      </div>
      <div className="col-6 col-lg-2-4">
        <div className="emp-stat-card">
          <div className="emp-stat-card__icon emp-stat-card__icon--info">
            <i className="bi bi-clock-history"></i>
          </div>
          <div className="emp-stat-card__content">
            <span className="emp-stat-card__label">Due in 30 Days</span>
            <strong className="emp-stat-card__value">{stats.warning}</strong>
          </div>
        </div>
      </div>
      <div className="col-6 col-lg-2-4">
        <div className="emp-stat-card">
          <div className="emp-stat-card__icon emp-stat-card__icon--warning">
            <i className="bi bi-exclamation-triangle"></i>
          </div>
          <div className="emp-stat-card__content">
            <span className="emp-stat-card__label">Critical (&lt;7 Days)</span>
            <strong className="emp-stat-card__value">{stats.critical}</strong>
          </div>
        </div>
      </div>
      <div className="col-6 col-lg-2-4">
        <div className="emp-stat-card">
          <div className="emp-stat-card__icon emp-stat-card__icon--danger">
            <i className="bi bi-x-circle"></i>
          </div>
          <div className="emp-stat-card__content">
            <span className="emp-stat-card__label">Expired</span>
            <strong className="emp-stat-card__value">{stats.expired}</strong>
          </div>
        </div>
      </div>
    </div>
  );

  // Render alert banner if critical
  const renderAlertBanner = () => {
    if (stats.critical === 0 && stats.expired === 0) return null;

    return (
      <div className={`emp-alert emp-alert--${stats.expired > 0 ? 'danger' : 'warning'} mb-4`}>
        <div className="emp-alert__icon">
          <i className={`bi ${stats.expired > 0 ? 'bi-x-octagon-fill' : 'bi-exclamation-triangle-fill'}`}></i>
        </div>
        <div className="emp-alert__content">
          <h4 className="emp-alert__title">
            {stats.expired > 0
              ? `${stats.expired} Policy/Policies Have Expired!`
              : `${stats.critical} Policy/Policies Expiring Soon!`}
          </h4>
          <p className="emp-alert__text">
            {stats.expired > 0
              ? "Please contact HR immediately to renew your expired policies to avoid coverage gaps."
              : "Please contact HR to renew your policies before they expire."}
          </p>
        </div>
      </div>
    );
  };

  // Render renewals list
  const renderRenewalsList = () => (
    <div className="emp-card">
      <div className="emp-card-header d-flex justify-content-between align-items-center flex-wrap gap-3">
        <h3 className="emp-card-title mb-0">
          <i className="bi bi-calendar-check me-2"></i>
          Policy Renewal Status
        </h3>
        <button
          className="emp-btn emp-btn--outline"
          onClick={fetchRenewals}
        >
          <i className="bi bi-arrow-clockwise me-2"></i>
          Refresh
        </button>
      </div>

      <div className="emp-card-body">
        {/* Filters */}
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <div className="emp-search-box">
              <i className="bi bi-search emp-search-box__icon"></i>
              <input
                type="text"
                className="emp-form-control"
                placeholder="Search by policy name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-6">
            <select
              className="emp-form-control"
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

        {/* Renewals Grid */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : filteredRenewals.length > 0 ? (
          <div className="row g-3">
            {filteredRenewals.map((renewal, index) => {
              const days = renewal.daysUntilExpiry || calculateDaysUntilExpiry(renewal.currentExpiryDate);
              const urgency = getUrgencyLevel(days);

              return (
                <div key={index} className="col-md-6 col-lg-4">
                  <div className={`emp-renewal-card emp-renewal-card--${urgency.color}`}>
                    <div className="emp-renewal-card__header">
                      <div className={`emp-renewal-card__status emp-renewal-card__status--${urgency.color}`}>
                        <i className={`bi ${urgency.icon}`}></i>
                      </div>
                      <span className={`emp-badge emp-badge--${urgency.color}`}>
                        {days === null ? "Unknown" : days <= 0 ? "EXPIRED" : `${days} Days Left`}
                      </span>
                    </div>

                    <div className="emp-renewal-card__body">
                      <h4 className="emp-renewal-card__title">{renewal.policyName || "Policy"}</h4>

                      <div className="emp-renewal-card__info">
                        <div className="emp-renewal-card__row">
                          <span className="emp-renewal-card__label">
                            <i className="bi bi-calendar3 me-1"></i>Expiry Date
                          </span>
                          <span className="emp-renewal-card__value">
                            {renewal.currentExpiryDate
                              ? new Date(renewal.currentExpiryDate).toLocaleDateString()
                              : "N/A"}
                          </span>
                        </div>
                        <div className="emp-renewal-card__row">
                          <span className="emp-renewal-card__label">
                            <i className="bi bi-activity me-1"></i>Status
                          </span>
                          <span className={`emp-renewal-card__value text-${urgency.color}`}>
                            {renewal.status || (days <= 0 ? "Expired" : "Active")}
                          </span>
                        </div>
                        {renewal.lastAlertDate && (
                          <div className="emp-renewal-card__row">
                            <span className="emp-renewal-card__label">
                              <i className="bi bi-bell me-1"></i>Last Alert
                            </span>
                            <span className="emp-renewal-card__value">
                              {new Date(renewal.lastAlertDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="emp-renewal-card__footer">
                      {/* Progress Bar */}
                      <div className="emp-renewal-progress">
                        <div
                          className={`emp-renewal-progress__bar emp-renewal-progress__bar--${urgency.color}`}
                          style={{
                            width: `${days !== null && days > 0 ? Math.min(100, (days / 90) * 100) : 0}%`
                          }}
                        ></div>
                      </div>
                      <small className="text-muted">
                        {renewal.renewalRequired
                          ? "Renewal Required"
                          : days > 30
                            ? "No Action Required"
                            : "Contact HR for Renewal"}
                      </small>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="emp-empty-state">
            <div className="emp-empty-state__icon">
              <i className="bi bi-calendar-check"></i>
            </div>
            <h4 className="emp-empty-state__title">No Renewals Found</h4>
            <p className="emp-empty-state__desc">
              {searchTerm || filterDays !== "all"
                ? "No policies match your search criteria."
                : "No policy renewal information available."}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="emp-renewals-page">
      {/* Page Header */}
      <div className="emp-page-header mb-4">
        <h1 className="emp-page-title">
          <i className="bi bi-calendar2-event me-3"></i>
          Policy Renewals
        </h1>
        <p className="emp-page-subtitle">
          Track your policy renewal dates and avoid coverage gaps
        </p>
      </div>

      {/* Alert Banner */}
      {renderAlertBanner()}

      {/* Statistics */}
      {renderStatsCards()}

      {/* Renewals List */}
      {renderRenewalsList()}
    </div>
  );
}

