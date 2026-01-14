// src/pages/dashboard/Admin/AdminEnrollments.jsx
import React, { useState, useEffect, useMemo } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import API from "../../../api";
import "./AdminTheme.css";
import "./AdminNewFeatures.css";

export default function AdminEnrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [notification, setNotification] = useState(null);

  // Fetch enrollments
  useEffect(() => {
    fetchEnrollments();
    fetchStats();
  }, [statusFilter]);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const params = statusFilter !== "all" ? `?status=${statusFilter.toUpperCase()}` : "";
      const response = await API.get(`/admin/enrollments/all${params}`);
      setEnrollments(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      showNotification("Failed to fetch enrollments", "error");
    } finally {
      setLoading(false);
    }
  };

  const [enrollmentStats, setEnrollmentStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    byPolicy: {}
  });

  const fetchStats = async () => {
    try {
      const response = await API.get("/admin/enrollments/stats");
      if (response.data) {
        setEnrollmentStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  // Show notification
  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Local statistics from data
  const stats = useMemo(() => {
    const pending = enrollments.filter(e => e.status === "PENDING").length;
    const approved = enrollments.filter(e => e.status === "APPROVED").length;
    const rejected = enrollments.filter(e => e.status === "REJECTED").length;
    const total = enrollments.length;
    return { pending, approved, rejected, total };
  }, [enrollments]);

  // Filtered enrollments
  const filteredEnrollments = useMemo(() => {
    return enrollments.filter(enrollment => {
      return (
        enrollment.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enrollment.policyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enrollment.employeeEmail?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [enrollments, searchTerm]);

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status?.toUpperCase()) {
      case "APPROVED": return "admin-badge--success";
      case "PENDING": return "admin-badge--warning";
      case "REJECTED": return "admin-badge--danger";
      default: return "admin-badge--secondary";
    }
  };

  // Render statistics cards
  const renderStatsCards = () => (
    <div className="row g-3 mb-4">
      <div className="col-6 col-md-3">
        <div className="admin-stat-card" onClick={() => setStatusFilter("all")}>
          <div className="admin-stat-card__icon admin-stat-card__icon--primary">
            <i className="bi bi-folder2-open"></i>
          </div>
          <div className="admin-stat-card__content">
            <span className="admin-stat-card__label">Total Enrollments</span>
            <strong className="admin-stat-card__value">{enrollmentStats.total || stats.total}</strong>
          </div>
        </div>
      </div>
      <div className="col-6 col-md-3">
        <div className="admin-stat-card" onClick={() => setStatusFilter("pending")}>
          <div className="admin-stat-card__icon admin-stat-card__icon--warning">
            <i className="bi bi-hourglass-split"></i>
          </div>
          <div className="admin-stat-card__content">
            <span className="admin-stat-card__label">Pending</span>
            <strong className="admin-stat-card__value">{enrollmentStats.pending || stats.pending}</strong>
          </div>
        </div>
      </div>
      <div className="col-6 col-md-3">
        <div className="admin-stat-card" onClick={() => setStatusFilter("approved")}>
          <div className="admin-stat-card__icon admin-stat-card__icon--success">
            <i className="bi bi-check-circle"></i>
          </div>
          <div className="admin-stat-card__content">
            <span className="admin-stat-card__label">Approved</span>
            <strong className="admin-stat-card__value">{enrollmentStats.approved || stats.approved}</strong>
          </div>
        </div>
      </div>
      <div className="col-6 col-md-3">
        <div className="admin-stat-card" onClick={() => setStatusFilter("rejected")}>
          <div className="admin-stat-card__icon admin-stat-card__icon--danger">
            <i className="bi bi-x-circle"></i>
          </div>
          <div className="admin-stat-card__content">
            <span className="admin-stat-card__label">Rejected</span>
            <strong className="admin-stat-card__value">{enrollmentStats.rejected || stats.rejected}</strong>
          </div>
        </div>
      </div>
    </div>
  );

  // Render enrollments table
  const renderEnrollmentsTable = () => (
    <div className="admin-card">
      <div className="admin-card-header d-flex justify-content-between align-items-center flex-wrap gap-3">
        <h3 className="admin-card-title mb-0">
          <i className="bi bi-card-checklist me-2"></i>
          All Enrollment Requests
        </h3>
        <button
          className="admin-btn admin-btn--outline"
          onClick={() => { fetchEnrollments(); fetchStats(); }}
        >
          <i className="bi bi-arrow-clockwise me-2"></i>
          Refresh
        </button>
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
                placeholder="Search by employee name, email, or policy..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-6">
            <select
              className="admin-form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
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
        ) : filteredEnrollments.length > 0 ? (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Policy</th>
                  <th>Coverage Type</th>
                  <th>Request Date</th>
                  <th>Effective Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnrollments.map((enrollment, index) => (
                  <tr key={enrollment.id || index}>
                    <td>
                      <div>
                        <strong>{enrollment.employeeName || "N/A"}</strong>
                        <small className="d-block text-muted">{enrollment.employeeEmail || ""}</small>
                      </div>
                    </td>
                    <td>{enrollment.policyName || "N/A"}</td>
                    <td>
                      <span className="admin-badge admin-badge--info">
                        {enrollment.coverageType || "Individual"}
                      </span>
                    </td>
                    <td>
                      {enrollment.enrollmentDate
                        ? new Date(enrollment.enrollmentDate).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td>
                      {enrollment.effectiveDate
                        ? new Date(enrollment.effectiveDate).toLocaleDateString()
                        : "-"}
                    </td>
                    <td>
                      <span className={`admin-badge ${getStatusBadgeClass(enrollment.status)}`}>
                        {enrollment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-empty-state">
            <div className="admin-empty-state__icon">
              <i className="bi bi-inbox"></i>
            </div>
            <h4 className="admin-empty-state__title">No Enrollment Requests</h4>
            <p className="admin-empty-state__desc">
              No enrollment requests found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="admin-enrollments-page">
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
          <i className="bi bi-card-checklist me-3"></i>
          Enrollment Overview
        </h1>
        <p className="admin-page-subtitle">
          Monitor all employee enrollment requests across the organization
        </p>
      </div>

      {/* Statistics */}
      {renderStatsCards()}

      {/* Enrollments Table */}
      {renderEnrollmentsTable()}
    </div>
  );
}

