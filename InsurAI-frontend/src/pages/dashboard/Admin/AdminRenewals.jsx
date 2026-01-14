// src/pages/dashboard/Admin/AdminRenewals.jsx
import React, { useState, useEffect, useMemo } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import API from "../../../api";
import "./AdminTheme.css";
import "./AdminNewFeatures.css";

export default function AdminRenewals() {
  const [renewals, setRenewals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDays, setFilterDays] = useState(90);
  const [notification, setNotification] = useState(null);
  const [checkingRenewals, setCheckingRenewals] = useState(false);

  // Stats
  const [renewalStats, setRenewalStats] = useState({
    totalPolicies: 0,
    expiringSoon: 0,
    expired: 0,
    alertsSentToday: 0,
    byTimeframe: {
      next7Days: 0,
      next15Days: 0,
      next30Days: 0
    }
  });

  // Fetch renewals and stats
  useEffect(() => {
    fetchRenewals();
    fetchStats();
  }, [filterDays]);

  const fetchRenewals = async () => {
    setLoading(true);
    try {
      const response = await API.get(`/admin/renewals/upcoming?days=${filterDays}`);
      setRenewals(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching renewals:", error);
      showNotification("Failed to fetch renewals", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await API.get("/admin/renewals/stats");
      if (response.data) {
        setRenewalStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // Manual renewal check
  const handleManualCheck = async () => {
    setCheckingRenewals(true);
    try {
      const response = await API.post("/admin/renewals/check");
      showNotification(
        `Renewal check complete. Checked ${response.data?.policiesChecked || 0} policies, sent ${response.data?.alertsSent || 0} alerts.`,
        "success"
      );
      fetchRenewals();
      fetchStats();
    } catch (error) {
      console.error("Error checking renewals:", error);
      showNotification("Failed to run renewal check", "error");
    } finally {
      setCheckingRenewals(false);
    }
  };

  // Show notification
  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
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

  // Filtered renewals
  const filteredRenewals = useMemo(() => {
    return renewals.filter(renewal => {
      return (
        renewal.policyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        renewal.employeeName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }).sort((a, b) => {
      const daysA = a.daysUntilExpiry || calculateDaysUntilExpiry(a.expiryDate) || 999;
      const daysB = b.daysUntilExpiry || calculateDaysUntilExpiry(b.expiryDate) || 999;
      return daysA - daysB;
    });
  }, [renewals, searchTerm]);

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
        <div className="admin-stat-card">
          <div className="admin-stat-card__icon admin-stat-card__icon--primary">
            <i className="bi bi-shield-check"></i>
          </div>
          <div className="admin-stat-card__content">
            <span className="admin-stat-card__label">Total Policies</span>
            <strong className="admin-stat-card__value">{renewalStats.totalPolicies}</strong>
          </div>
        </div>
      </div>
      <div className="col-6 col-lg-2-4">
        <div className="admin-stat-card" onClick={() => setFilterDays(7)}>
          <div className="admin-stat-card__icon admin-stat-card__icon--danger">
            <i className="bi bi-exclamation-triangle"></i>
          </div>
          <div className="admin-stat-card__content">
            <span className="admin-stat-card__label">Critical (7 Days)</span>
            <strong className="admin-stat-card__value">{renewalStats.byTimeframe?.next7Days || 0}</strong>
          </div>
        </div>
      </div>
      <div className="col-6 col-lg-2-4">
        <div className="admin-stat-card" onClick={() => setFilterDays(15)}>
          <div className="admin-stat-card__icon admin-stat-card__icon--warning">
            <i className="bi bi-clock-history"></i>
          </div>
          <div className="admin-stat-card__content">
            <span className="admin-stat-card__label">Warning (15 Days)</span>
            <strong className="admin-stat-card__value">{renewalStats.byTimeframe?.next15Days || 0}</strong>
          </div>
        </div>
      </div>
      <div className="col-6 col-lg-2-4">
        <div className="admin-stat-card" onClick={() => setFilterDays(30)}>
          <div className="admin-stat-card__icon admin-stat-card__icon--info">
            <i className="bi bi-calendar-week"></i>
          </div>
          <div className="admin-stat-card__content">
            <span className="admin-stat-card__label">Attention (30 Days)</span>
            <strong className="admin-stat-card__value">{renewalStats.byTimeframe?.next30Days || 0}</strong>
          </div>
        </div>
      </div>
      <div className="col-6 col-lg-2-4">
        <div className="admin-stat-card">
          <div className="admin-stat-card__icon admin-stat-card__icon--success">
            <i className="bi bi-bell-fill"></i>
          </div>
          <div className="admin-stat-card__content">
            <span className="admin-stat-card__label">Alerts Today</span>
            <strong className="admin-stat-card__value">{renewalStats.alertsSentToday}</strong>
          </div>
        </div>
      </div>
    </div>
  );

  // Render alert banner if critical
  const renderAlertBanner = () => {
    const critical = renewalStats.byTimeframe?.next7Days || 0;
    const expired = renewalStats.expired || 0;

    if (critical === 0 && expired === 0) return null;

    return (
      <div className={`admin-alert admin-alert--${expired > 0 ? 'danger' : 'warning'} mb-4`}>
        <div className="admin-alert__icon">
          <i className={`bi ${expired > 0 ? 'bi-x-octagon-fill' : 'bi-exclamation-triangle-fill'}`}></i>
        </div>
        <div className="admin-alert__content">
          <h4 className="admin-alert__title">
            {expired > 0
              ? `${expired} Policies Have Expired!`
              : `${critical} Policies Expiring Within 7 Days!`}
          </h4>
          <p className="admin-alert__text">
            {expired > 0
              ? "Immediate action required to renew expired policies."
              : "Urgent attention required for policies expiring soon."}
          </p>
        </div>
        <button
          className="admin-btn admin-btn--outline"
          onClick={handleManualCheck}
          disabled={checkingRenewals}
        >
          {checkingRenewals ? (
            <span className="spinner-border spinner-border-sm"></span>
          ) : (
            <>
              <i className="bi bi-bell me-2"></i>
              Send Alerts
            </>
          )}
        </button>
      </div>
    );
  };

  // Render renewals table
  const renderRenewalsTable = () => (
    <div className="admin-card">
      <div className="admin-card-header d-flex justify-content-between align-items-center flex-wrap gap-3">
        <h3 className="admin-card-title mb-0">
          <i className="bi bi-calendar-check me-2"></i>
          Upcoming Policy Renewals
        </h3>
        <div className="d-flex gap-2">
          <button
            className="admin-btn admin-btn--primary"
            onClick={handleManualCheck}
            disabled={checkingRenewals}
          >
            {checkingRenewals ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Checking...
              </>
            ) : (
              <>
                <i className="bi bi-lightning-charge me-2"></i>
                Run Renewal Check
              </>
            )}
          </button>
          <button
            className="admin-btn admin-btn--outline"
            onClick={() => { fetchRenewals(); fetchStats(); }}
          >
            <i className="bi bi-arrow-clockwise"></i>
          </button>
        </div>
      </div>

      <div className="admin-card-body">
        {/* Filters */}
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <div className="admin-search-box">
              <i className="bi bi-search admin-search-box__icon"></i>
              <input
                type="text"
                className="admin-form-control"
                placeholder="Search by policy or employee name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-6">
            <select
              className="admin-form-control"
              value={filterDays}
              onChange={(e) => setFilterDays(Number(e.target.value))}
            >
              <option value={7}>Expiring in 7 Days</option>
              <option value={15}>Expiring in 15 Days</option>
              <option value={30}>Expiring in 30 Days</option>
              <option value={60}>Expiring in 60 Days</option>
              <option value={90}>Expiring in 90 Days</option>
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
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Policy</th>
                  <th>Employees</th>
                  <th>Expiry Date</th>
                  <th>Days Left</th>
                  <th>Alert Status</th>
                  <th>Urgency</th>
                </tr>
              </thead>
              <tbody>
                {filteredRenewals.map((renewal, index) => {
                  const days = renewal.daysUntilExpiry || calculateDaysUntilExpiry(renewal.expiryDate);
                  const urgency = getUrgencyLevel(days);

                  return (
                    <tr key={index}>
                      <td>
                        <strong>{renewal.policyName || "N/A"}</strong>
                      </td>
                      <td>
                        <span className="admin-badge admin-badge--info">
                          {renewal.employeeCount || 1} Employee(s)
                        </span>
                      </td>
                      <td>
                        {renewal.expiryDate
                          ? new Date(renewal.expiryDate).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td>
                        <span className={`admin-badge admin-badge--${urgency.color}`}>
                          <i className={`bi ${urgency.icon} me-1`}></i>
                          {days === null ? "Unknown" : days <= 0 ? "EXPIRED" : `${days} Days`}
                        </span>
                      </td>
                      <td>
                        <span className={`admin-badge ${renewal.status === 'ALERT_SENT' ? 'admin-badge--success' : 'admin-badge--secondary'}`}>
                          {renewal.status === 'ALERT_SENT' ? (
                            <>
                              <i className="bi bi-check-circle me-1"></i>
                              Alert Sent
                            </>
                          ) : (
                            <>
                              <i className="bi bi-clock me-1"></i>
                              Pending
                            </>
                          )}
                        </span>
                      </td>
                      <td>
                        <div className={`admin-urgency-indicator admin-urgency-indicator--${urgency.color}`}>
                          <div className="admin-urgency-indicator__bar"></div>
                          <span className="admin-urgency-indicator__label">
                            {urgency.level.charAt(0).toUpperCase() + urgency.level.slice(1)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-empty-state">
            <div className="admin-empty-state__icon">
              <i className="bi bi-calendar-check"></i>
            </div>
            <h4 className="admin-empty-state__title">No Upcoming Renewals</h4>
            <p className="admin-empty-state__desc">
              No policies are expiring within the selected timeframe.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="admin-renewals-page">
      {/* Notification Toast */}
      {notification && (
        <div className={`admin-toast admin-toast--${notification.type}`}>
          <i className={`bi ${notification.type === 'success' ? 'bi-check-circle' : notification.type === 'error' ? 'bi-x-circle' : 'bi-info-circle'} me-2`}></i>
          {notification.message}
        </div>
      )}

      {/* Page Header */}
      <div className="admin-page-header mb-4">
        <h1 className="admin-page-title">
          <i className="bi bi-calendar2-event me-3"></i>
          Renewal Management
        </h1>
        <p className="admin-page-subtitle">
          Monitor policy renewals and send automated alerts
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

