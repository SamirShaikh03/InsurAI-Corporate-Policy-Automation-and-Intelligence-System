// src/pages/dashboard/Employee/EmployeeReimbursements.jsx
import React, { useState, useEffect, useMemo } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import API from "../../../api";
import "./EmployeeTheme.css";
import "./EmployeeNewFeatures.css";

export default function EmployeeReimbursements({ showNotificationAlert }) {
  const [reimbursements, setReimbursements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedReimbursement, setSelectedReimbursement] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch reimbursements on mount
  useEffect(() => {
    fetchReimbursements();
  }, []);

  const fetchReimbursements = async () => {
    setLoading(true);
    try {
      const response = await API.get("/employee/reimbursements/my");
      setReimbursements(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching reimbursements:", error);
      showNotificationAlert?.("Failed to fetch reimbursements", "error");
    } finally {
      setLoading(false);
    }
  };

  // Statistics
  const stats = useMemo(() => {
    const total = reimbursements.length;
    const pending = reimbursements.filter(r => r.status === "PENDING").length;
    const processing = reimbursements.filter(r => r.status === "PROCESSING").length;
    const completed = reimbursements.filter(r => r.status === "COMPLETED").length;
    const totalAmount = reimbursements.reduce((sum, r) => sum + (parseFloat(r.claimAmount) || 0), 0);
    const completedAmount = reimbursements
      .filter(r => r.status === "COMPLETED")
      .reduce((sum, r) => sum + (parseFloat(r.claimAmount) || 0), 0);
    return { total, pending, processing, completed, totalAmount, completedAmount };
  }, [reimbursements]);

  // Filtered reimbursements
  const filteredReimbursements = useMemo(() => {
    return reimbursements.filter(reimb => {
      const matchesSearch =
        reimb.claimType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reimb.transactionId?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || reimb.status === statusFilter.toUpperCase();
      return matchesSearch && matchesStatus;
    });
  }, [reimbursements, searchTerm, statusFilter]);

  // View reimbursement details
  const handleViewDetails = async (reimbursement) => {
    try {
      const response = await API.get(`/employee/reimbursements/${reimbursement.id}`);
      setSelectedReimbursement(response.data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error("Error fetching reimbursement details:", error);
      showNotificationAlert?.("Failed to fetch details", "error");
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status?.toUpperCase()) {
      case "COMPLETED": return "emp-badge--success";
      case "PROCESSING": return "emp-badge--info";
      case "PENDING": return "emp-badge--warning";
      case "FAILED": return "emp-badge--danger";
      default: return "emp-badge--secondary";
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case "COMPLETED": return "bi-check-circle-fill";
      case "PROCESSING": return "bi-hourglass-split";
      case "PENDING": return "bi-clock-fill";
      case "FAILED": return "bi-x-circle-fill";
      default: return "bi-question-circle";
    }
  };

  // Get payment method icon
  const getPaymentIcon = (method) => {
    switch (method?.toUpperCase()) {
      case "BANK_TRANSFER": return "bi-bank";
      case "CHECK": return "bi-file-earmark-text";
      case "DIGITAL_WALLET": return "bi-wallet2";
      default: return "bi-credit-card";
    }
  };

  // Render statistics cards
  const renderStatsCards = () => (
    <div className="row g-3 mb-4">
      <div className="col-6 col-lg-3">
        <div className="emp-stat-card">
          <div className="emp-stat-card__icon emp-stat-card__icon--primary">
            <i className="bi bi-receipt"></i>
          </div>
          <div className="emp-stat-card__content">
            <span className="emp-stat-card__label">Total Reimbursements</span>
            <strong className="emp-stat-card__value">{stats.total}</strong>
          </div>
        </div>
      </div>
      <div className="col-6 col-lg-3">
        <div className="emp-stat-card">
          <div className="emp-stat-card__icon emp-stat-card__icon--warning">
            <i className="bi bi-clock-history"></i>
          </div>
          <div className="emp-stat-card__content">
            <span className="emp-stat-card__label">Pending</span>
            <strong className="emp-stat-card__value">{stats.pending}</strong>
          </div>
        </div>
      </div>
      <div className="col-6 col-lg-3">
        <div className="emp-stat-card">
          <div className="emp-stat-card__icon emp-stat-card__icon--info">
            <i className="bi bi-hourglass-split"></i>
          </div>
          <div className="emp-stat-card__content">
            <span className="emp-stat-card__label">Processing</span>
            <strong className="emp-stat-card__value">{stats.processing}</strong>
          </div>
        </div>
      </div>
      <div className="col-6 col-lg-3">
        <div className="emp-stat-card">
          <div className="emp-stat-card__icon emp-stat-card__icon--success">
            <i className="bi bi-check-circle"></i>
          </div>
          <div className="emp-stat-card__content">
            <span className="emp-stat-card__label">Completed</span>
            <strong className="emp-stat-card__value">{stats.completed}</strong>
          </div>
        </div>
      </div>
    </div>
  );

  // Render amount summary
  const renderAmountSummary = () => (
    <div className="row g-3 mb-4">
      <div className="col-md-6">
        <div className="emp-card h-100">
          <div className="emp-card-body d-flex align-items-center gap-3">
            <div className="emp-icon-box emp-icon-box--primary">
              <i className="bi bi-currency-rupee"></i>
            </div>
            <div>
              <span className="text-muted d-block">Total Claim Amount</span>
              <strong className="fs-4">{formatCurrency(stats.totalAmount)}</strong>
            </div>
          </div>
        </div>
      </div>
      <div className="col-md-6">
        <div className="emp-card h-100">
          <div className="emp-card-body d-flex align-items-center gap-3">
            <div className="emp-icon-box emp-icon-box--success">
              <i className="bi bi-check2-all"></i>
            </div>
            <div>
              <span className="text-muted d-block">Amount Received</span>
              <strong className="fs-4 text-success">{formatCurrency(stats.completedAmount)}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render reimbursements list
  const renderReimbursementsList = () => (
    <div className="emp-card">
      <div className="emp-card-header d-flex justify-content-between align-items-center flex-wrap gap-3">
        <h3 className="emp-card-title mb-0">
          <i className="bi bi-receipt-cutoff me-2"></i>
          My Reimbursements
        </h3>
        <button
          className="emp-btn emp-btn--outline"
          onClick={fetchReimbursements}
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
                placeholder="Search by claim type or transaction ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-6">
            <select
              className="emp-form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Reimbursements List */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : filteredReimbursements.length > 0 ? (
          <div className="emp-reimbursement-list">
            {filteredReimbursements.map((reimb) => (
              <div key={reimb.id} className="emp-reimbursement-item">
                <div className="emp-reimbursement-item__header">
                  <div className="d-flex align-items-center gap-3">
                    <div className={`emp-icon-box emp-icon-box--${reimb.status === 'COMPLETED' ? 'success' : reimb.status === 'PROCESSING' ? 'info' : 'warning'}`}>
                      <i className={`bi ${getStatusIcon(reimb.status)}`}></i>
                    </div>
                    <div>
                      <h4 className="mb-1">{reimb.claimType || "Claim"} Reimbursement</h4>
                      <small className="text-muted">
                        Claim #{reimb.claimId} • Initiated: {reimb.initiatedDate ? new Date(reimb.initiatedDate).toLocaleDateString() : "N/A"}
                      </small>
                    </div>
                  </div>
                  <span className={`emp-badge ${getStatusBadgeClass(reimb.status)}`}>
                    <i className={`bi ${getStatusIcon(reimb.status)} me-1`}></i>
                    {reimb.status}
                  </span>
                </div>

                <div className="emp-reimbursement-item__body">
                  <div className="row g-3">
                    <div className="col-6 col-md-3">
                      <span className="text-muted d-block small">Amount</span>
                      <strong className="text-primary">{formatCurrency(reimb.claimAmount)}</strong>
                    </div>
                    <div className="col-6 col-md-3">
                      <span className="text-muted d-block small">Payment Method</span>
                      <span>
                        <i className={`bi ${getPaymentIcon(reimb.paymentMethod)} me-1`}></i>
                        {reimb.paymentMethod?.replace("_", " ") || "N/A"}
                      </span>
                    </div>
                    <div className="col-6 col-md-3">
                      <span className="text-muted d-block small">Transaction ID</span>
                      <span className="font-monospace">{reimb.transactionId || "-"}</span>
                    </div>
                    <div className="col-6 col-md-3">
                      <span className="text-muted d-block small">Est. Completion</span>
                      <span>
                        {reimb.estimatedCompletionDate
                          ? new Date(reimb.estimatedCompletionDate).toLocaleDateString()
                          : reimb.completedDate
                            ? new Date(reimb.completedDate).toLocaleDateString()
                            : "Pending"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="emp-reimbursement-item__footer">
                  {/* Progress Tracker */}
                  <div className="emp-progress-tracker">
                    <div className={`emp-progress-step ${reimb.status ? 'completed' : ''}`}>
                      <div className="emp-progress-step__dot"></div>
                      <span>Initiated</span>
                    </div>
                    <div className={`emp-progress-step ${reimb.status === 'PROCESSING' || reimb.status === 'COMPLETED' ? 'completed' : ''}`}>
                      <div className="emp-progress-step__dot"></div>
                      <span>Processing</span>
                    </div>
                    <div className={`emp-progress-step ${reimb.status === 'COMPLETED' ? 'completed' : ''}`}>
                      <div className="emp-progress-step__dot"></div>
                      <span>Completed</span>
                    </div>
                  </div>

                  <button
                    className="emp-btn emp-btn--outline emp-btn--sm"
                    onClick={() => handleViewDetails(reimb)}
                  >
                    <i className="bi bi-eye me-1"></i>View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="emp-empty-state">
            <div className="emp-empty-state__icon">
              <i className="bi bi-receipt"></i>
            </div>
            <h4 className="emp-empty-state__title">No Reimbursements Found</h4>
            <p className="emp-empty-state__desc">
              {searchTerm || statusFilter !== "all"
                ? "No reimbursements match your search criteria."
                : "You don't have any reimbursements yet. Reimbursements are initiated by HR after your claim is approved."}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // Details Modal
  const renderDetailsModal = () => {
    if (!showDetailsModal || !selectedReimbursement) return null;

    return (
      <div className="emp-modal-overlay" onClick={() => setShowDetailsModal(false)}>
        <div className="emp-modal" onClick={(e) => e.stopPropagation()}>
          <div className="emp-modal-header">
            <h3 className="emp-modal-title">
              <i className="bi bi-receipt me-2"></i>
              Reimbursement Details
            </h3>
            <button
              className="emp-modal-close"
              onClick={() => setShowDetailsModal(false)}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          <div className="emp-modal-body">
            <div className="row g-4">
              <div className="col-md-6">
                <div className="emp-detail-group">
                  <label className="emp-detail-label">Claim ID</label>
                  <p className="emp-detail-value">#{selectedReimbursement.claimId}</p>
                </div>
              </div>
              <div className="col-md-6">
                <div className="emp-detail-group">
                  <label className="emp-detail-label">Status</label>
                  <span className={`emp-badge ${getStatusBadgeClass(selectedReimbursement.status)}`}>
                    {selectedReimbursement.status}
                  </span>
                </div>
              </div>
              <div className="col-md-6">
                <div className="emp-detail-group">
                  <label className="emp-detail-label">Claim Type</label>
                  <p className="emp-detail-value">{selectedReimbursement.claimType || "N/A"}</p>
                </div>
              </div>
              <div className="col-md-6">
                <div className="emp-detail-group">
                  <label className="emp-detail-label">Claim Amount</label>
                  <p className="emp-detail-value text-primary fw-bold">
                    {formatCurrency(selectedReimbursement.claimAmount)}
                  </p>
                </div>
              </div>
              <div className="col-md-6">
                <div className="emp-detail-group">
                  <label className="emp-detail-label">Payment Method</label>
                  <p className="emp-detail-value">
                    <i className={`bi ${getPaymentIcon(selectedReimbursement.paymentMethod)} me-2`}></i>
                    {selectedReimbursement.paymentMethod?.replace("_", " ") || "N/A"}
                  </p>
                </div>
              </div>
              <div className="col-md-6">
                <div className="emp-detail-group">
                  <label className="emp-detail-label">Account (Last 4)</label>
                  <p className="emp-detail-value">{selectedReimbursement.accountNumber || "N/A"}</p>
                </div>
              </div>
              <div className="col-md-6">
                <div className="emp-detail-group">
                  <label className="emp-detail-label">Transaction ID</label>
                  <p className="emp-detail-value font-monospace">
                    {selectedReimbursement.transactionId || "Not yet assigned"}
                  </p>
                </div>
              </div>
              <div className="col-md-6">
                <div className="emp-detail-group">
                  <label className="emp-detail-label">Initiated Date</label>
                  <p className="emp-detail-value">
                    {selectedReimbursement.initiatedDate
                      ? new Date(selectedReimbursement.initiatedDate).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>
              <div className="col-md-6">
                <div className="emp-detail-group">
                  <label className="emp-detail-label">Processed Date</label>
                  <p className="emp-detail-value">
                    {selectedReimbursement.processedDate
                      ? new Date(selectedReimbursement.processedDate).toLocaleDateString()
                      : "Pending"}
                  </p>
                </div>
              </div>
              <div className="col-md-6">
                <div className="emp-detail-group">
                  <label className="emp-detail-label">Completed Date</label>
                  <p className="emp-detail-value">
                    {selectedReimbursement.completedDate
                      ? new Date(selectedReimbursement.completedDate).toLocaleDateString()
                      : "Pending"}
                  </p>
                </div>
              </div>
              {selectedReimbursement.notes && (
                <div className="col-12">
                  <div className="emp-detail-group">
                    <label className="emp-detail-label">Notes</label>
                    <div className="p-3" style={{ background: 'var(--emp-subtle)', borderRadius: 'var(--emp-radius)' }}>
                      <p className="mb-0">{selectedReimbursement.notes}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="emp-modal-footer">
            <button
              className="emp-btn emp-btn--outline"
              onClick={() => setShowDetailsModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="emp-reimbursements-page">
      {/* Page Header */}
      <div className="emp-page-header mb-4">
        <h1 className="emp-page-title">
          <i className="bi bi-cash-coin me-3"></i>
          Reimbursement Tracking
        </h1>
        <p className="emp-page-subtitle">
          Track the status of your claim reimbursements
        </p>
      </div>

      {/* Statistics */}
      {renderStatsCards()}

      {/* Amount Summary */}
      {renderAmountSummary()}

      {/* Reimbursements List */}
      {renderReimbursementsList()}

      {/* Details Modal */}
      {renderDetailsModal()}
    </div>
  );
}

