// src/pages/dashboard/Hr/HREnrollments.jsx
import React, { useState, useEffect, useMemo } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import API from "../../../api";
import "./HRDashboard.css";
import "./HRNewFeatures.css";

export default function HREnrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState("pending"); // pending, all, details
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Approval form state
  const [approvalForm, setApprovalForm] = useState({
    remarks: "",
    effectiveDate: new Date().toISOString().split('T')[0]
  });

  // Rejection form state
  const [rejectionReason, setRejectionReason] = useState("");

  // Fetch enrollments
  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const endpoint = activeView === "pending"
        ? "/hr/enrollments/pending"
        : "/hr/enrollments/all";
      const response = await API.get(endpoint);
      setEnrollments(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      showNotification("Failed to fetch enrollments", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, [activeView]);

  // Show notification
  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Statistics
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
        enrollment.employeeEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enrollment.policyName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [enrollments, searchTerm]);

  // Handle approval
  const handleApprove = async (enrollmentId) => {
    if (!approvalForm.effectiveDate) {
      showNotification("Please set an effective date", "error");
      return;
    }

    setActionLoading(true);
    try {
      await API.post(`/hr/enrollments/${enrollmentId}/approve`, {
        remarks: approvalForm.remarks,
        effectiveDate: approvalForm.effectiveDate
      });
      showNotification("Enrollment approved successfully!", "success");
      setSelectedEnrollment(null);
      setApprovalForm({ remarks: "", effectiveDate: new Date().toISOString().split('T')[0] });
      fetchEnrollments();
    } catch (error) {
      console.error("Error approving enrollment:", error);
      showNotification("Failed to approve enrollment", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle rejection
  const handleReject = async (enrollmentId) => {
    if (!rejectionReason.trim()) {
      showNotification("Please provide a rejection reason", "error");
      return;
    }

    setActionLoading(true);
    try {
      await API.post(`/hr/enrollments/${enrollmentId}/reject`, {
        reason: rejectionReason
      });
      showNotification("Enrollment rejected", "success");
      setSelectedEnrollment(null);
      setRejectionReason("");
      fetchEnrollments();
    } catch (error) {
      console.error("Error rejecting enrollment:", error);
      showNotification("Failed to reject enrollment", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // View enrollment details
  const handleViewDetails = async (enrollment) => {
    try {
      const response = await API.get(`/hr/enrollments/${enrollment.id}`);
      setSelectedEnrollment(response.data);
    } catch (error) {
      console.error("Error fetching enrollment details:", error);
      showNotification("Failed to fetch details", "error");
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status?.toUpperCase()) {
      case "APPROVED": return "hr-badge--success";
      case "PENDING": return "hr-badge--warning";
      case "REJECTED": return "hr-badge--danger";
      default: return "hr-badge--secondary";
    }
  };

  // Render statistics cards
  const renderStatsCards = () => (
    <div className="row g-3 mb-4">
      <div className="col-6 col-md-3">
        <div className="hr-stat-card" onClick={() => setActiveView("pending")}>
          <div className="hr-stat-card__icon hr-stat-card__icon--warning">
            <i className="bi bi-hourglass-split"></i>
          </div>
          <div className="hr-stat-card__content">
            <span className="hr-stat-card__label">Pending Review</span>
            <strong className="hr-stat-card__value">{stats.pending}</strong>
          </div>
        </div>
      </div>
      <div className="col-6 col-md-3">
        <div className="hr-stat-card">
          <div className="hr-stat-card__icon hr-stat-card__icon--success">
            <i className="bi bi-check-circle"></i>
          </div>
          <div className="hr-stat-card__content">
            <span className="hr-stat-card__label">Approved</span>
            <strong className="hr-stat-card__value">{stats.approved}</strong>
          </div>
        </div>
      </div>
      <div className="col-6 col-md-3">
        <div className="hr-stat-card">
          <div className="hr-stat-card__icon hr-stat-card__icon--danger">
            <i className="bi bi-x-circle"></i>
          </div>
          <div className="hr-stat-card__content">
            <span className="hr-stat-card__label">Rejected</span>
            <strong className="hr-stat-card__value">{stats.rejected}</strong>
          </div>
        </div>
      </div>
      <div className="col-6 col-md-3">
        <div className="hr-stat-card" onClick={() => setActiveView("all")}>
          <div className="hr-stat-card__icon hr-stat-card__icon--primary">
            <i className="bi bi-folder2-open"></i>
          </div>
          <div className="hr-stat-card__content">
            <span className="hr-stat-card__label">Total Requests</span>
            <strong className="hr-stat-card__value">{stats.total}</strong>
          </div>
        </div>
      </div>
    </div>
  );

  // Render enrollments table
  const renderEnrollmentsTable = () => (
    <div className="hr-card">
      <div className="hr-card-header d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div className="d-flex align-items-center gap-3">
          <h3 className="hr-card-title mb-0">
            <i className="bi bi-card-checklist me-2"></i>
            {activeView === "pending" ? "Pending Enrollments" : "All Enrollment Requests"}
          </h3>
          <div className="btn-group">
            <button
              className={`hr-btn hr-btn--sm ${activeView === "pending" ? "hr-btn--primary" : "hr-btn--outline"}`}
              onClick={() => setActiveView("pending")}
            >
              Pending
            </button>
            <button
              className={`hr-btn hr-btn--sm ${activeView === "all" ? "hr-btn--primary" : "hr-btn--outline"}`}
              onClick={() => setActiveView("all")}
            >
              All
            </button>
          </div>
        </div>
        <button
          className="hr-btn hr-btn--outline"
          onClick={fetchEnrollments}
        >
          <i className="bi bi-arrow-clockwise me-2"></i>
          Refresh
        </button>
      </div>

      <div className="hr-card-body">
        {/* Search */}
        <div className="mb-4">
          <div className="hr-search-box">
            <i className="bi bi-search hr-search-box__icon"></i>
            <input
              type="text"
              className="hr-form-control"
              placeholder="Search by employee name, email, or policy..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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
            <table className="hr-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Policy</th>
                  <th>Coverage Type</th>
                  <th>Request Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnrollments.map((enrollment) => (
                  <tr key={enrollment.id}>
                    <td>
                      <div>
                        <strong>{enrollment.employeeName || "N/A"}</strong>
                        <small className="d-block text-muted">{enrollment.employeeEmail || ""}</small>
                      </div>
                    </td>
                    <td>{enrollment.policyName || "N/A"}</td>
                    <td>
                      <span className="hr-badge hr-badge--info">
                        {enrollment.coverageType || "Individual"}
                      </span>
                    </td>
                    <td>
                      {enrollment.enrollmentDate
                        ? new Date(enrollment.enrollmentDate).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td>
                      <span className={`hr-badge ${getStatusBadgeClass(enrollment.status)}`}>
                        {enrollment.status}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <button
                          className="hr-btn hr-btn--outline hr-btn--sm"
                          onClick={() => handleViewDetails(enrollment)}
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                        {enrollment.status === "PENDING" && (
                          <>
                            <button
                              className="hr-btn hr-btn--success hr-btn--sm"
                              onClick={() => handleViewDetails(enrollment)}
                              title="Review & Approve"
                            >
                              <i className="bi bi-check-lg"></i>
                            </button>
                            <button
                              className="hr-btn hr-btn--danger hr-btn--sm"
                              onClick={() => handleViewDetails(enrollment)}
                              title="Reject"
                            >
                              <i className="bi bi-x-lg"></i>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="hr-empty-state">
            <div className="hr-empty-state__icon">
              <i className="bi bi-inbox"></i>
            </div>
            <h4 className="hr-empty-state__title">No Enrollment Requests</h4>
            <p className="hr-empty-state__desc">
              {activeView === "pending"
                ? "There are no pending enrollment requests to review."
                : "No enrollment requests found."}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // Render enrollment details modal
  const renderDetailsModal = () => {
    if (!selectedEnrollment) return null;

    return (
      <div className="hr-modal-overlay" onClick={() => setSelectedEnrollment(null)}>
        <div className="hr-modal hr-modal--lg" onClick={(e) => e.stopPropagation()}>
          <div className="hr-modal-header">
            <h3 className="hr-modal-title">
              <i className="bi bi-file-earmark-text me-2"></i>
              Enrollment Request Details
            </h3>
            <button
              className="hr-modal-close"
              onClick={() => setSelectedEnrollment(null)}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          <div className="hr-modal-body">
            <div className="row g-4">
              {/* Employee Info */}
              <div className="col-12">
                <h5 className="text-muted mb-3">
                  <i className="bi bi-person me-2"></i>Employee Information
                </h5>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="hr-detail-label">Name</label>
                    <p className="hr-detail-value">{selectedEnrollment.employeeName || "N/A"}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="hr-detail-label">Email</label>
                    <p className="hr-detail-value">{selectedEnrollment.employeeEmail || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Policy Info */}
              <div className="col-12">
                <h5 className="text-muted mb-3">
                  <i className="bi bi-shield-check me-2"></i>Policy Information
                </h5>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="hr-detail-label">Policy Name</label>
                    <p className="hr-detail-value">{selectedEnrollment.policyName || "N/A"}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="hr-detail-label">Coverage Type</label>
                    <p className="hr-detail-value">{selectedEnrollment.coverageType || "Individual"}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="hr-detail-label">Request Date</label>
                    <p className="hr-detail-value">
                      {selectedEnrollment.enrollmentDate
                        ? new Date(selectedEnrollment.enrollmentDate).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <label className="hr-detail-label">Status</label>
                    <span className={`hr-badge ${getStatusBadgeClass(selectedEnrollment.status)}`}>
                      {selectedEnrollment.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Request Reason */}
              {selectedEnrollment.requestReason && (
                <div className="col-12">
                  <label className="hr-detail-label">Request Reason</label>
                  <div className="p-3" style={{ background: 'var(--hr-subtle)', borderRadius: 'var(--hr-radius)' }}>
                    <p className="mb-0">{selectedEnrollment.requestReason}</p>
                  </div>
                </div>
              )}

              {/* Dependents */}
              {selectedEnrollment.dependents && selectedEnrollment.dependents.length > 0 && (
                <div className="col-12">
                  <h5 className="text-muted mb-3">
                    <i className="bi bi-people me-2"></i>Dependents ({selectedEnrollment.dependents.length})
                  </h5>
                  <div className="table-responsive">
                    <table className="hr-table hr-table--sm">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Relationship</th>
                          <th>Date of Birth</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedEnrollment.dependents.map((dep, index) => (
                          <tr key={index}>
                            <td>{dep.name}</td>
                            <td>{dep.relationship}</td>
                            <td>{dep.dateOfBirth ? new Date(dep.dateOfBirth).toLocaleDateString() : "N/A"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Action Forms - Only for Pending */}
              {selectedEnrollment.status === "PENDING" && (
                <div className="col-12">
                  <hr />
                  <h5 className="text-muted mb-3">
                    <i className="bi bi-gear me-2"></i>Take Action
                  </h5>

                  {/* Approval Form */}
                  <div className="hr-action-card hr-action-card--success mb-3">
                    <h6 className="mb-3">
                      <i className="bi bi-check-circle me-2"></i>Approve Enrollment
                    </h6>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="hr-form-label">Effective Date *</label>
                        <input
                          type="date"
                          className="hr-form-control"
                          value={approvalForm.effectiveDate}
                          onChange={(e) => setApprovalForm(prev => ({ ...prev, effectiveDate: e.target.value }))}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="hr-form-label">Remarks (Optional)</label>
                        <input
                          type="text"
                          className="hr-form-control"
                          placeholder="Add remarks..."
                          value={approvalForm.remarks}
                          onChange={(e) => setApprovalForm(prev => ({ ...prev, remarks: e.target.value }))}
                        />
                      </div>
                      <div className="col-12">
                        <button
                          className="hr-btn hr-btn--success"
                          onClick={() => handleApprove(selectedEnrollment.id)}
                          disabled={actionLoading}
                        >
                          {actionLoading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              Processing...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-check-lg me-2"></i>
                              Approve Enrollment
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Rejection Form */}
                  <div className="hr-action-card hr-action-card--danger">
                    <h6 className="mb-3">
                      <i className="bi bi-x-circle me-2"></i>Reject Enrollment
                    </h6>
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="hr-form-label">Rejection Reason *</label>
                        <textarea
                          className="hr-form-control"
                          rows="2"
                          placeholder="Please provide a reason for rejection..."
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                        ></textarea>
                      </div>
                      <div className="col-12">
                        <button
                          className="hr-btn hr-btn--danger"
                          onClick={() => handleReject(selectedEnrollment.id)}
                          disabled={actionLoading}
                        >
                          {actionLoading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              Processing...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-x-lg me-2"></i>
                              Reject Enrollment
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Show approval/rejection info if already processed */}
              {selectedEnrollment.status !== "PENDING" && selectedEnrollment.remarks && (
                <div className="col-12">
                  <label className="hr-detail-label">HR Remarks</label>
                  <div className="p-3" style={{ background: 'var(--hr-subtle)', borderRadius: 'var(--hr-radius)' }}>
                    <p className="mb-0">{selectedEnrollment.remarks}</p>
                  </div>
                </div>
              )}

              {selectedEnrollment.effectiveDate && (
                <div className="col-12">
                  <label className="hr-detail-label">Effective Date</label>
                  <p className="hr-detail-value">
                    {new Date(selectedEnrollment.effectiveDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="hr-modal-footer">
            <button
              className="hr-btn hr-btn--outline"
              onClick={() => setSelectedEnrollment(null)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="hr-enrollments-page">
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
          <i className="bi bi-card-checklist me-3"></i>
          Enrollment Management
        </h1>
        <p className="hr-page-subtitle">
          Review and approve employee policy enrollment requests
        </p>
      </div>

      {/* Statistics */}
      {renderStatsCards()}

      {/* Enrollments Table */}
      {renderEnrollmentsTable()}

      {/* Details Modal */}
      {renderDetailsModal()}
    </div>
  );
}

