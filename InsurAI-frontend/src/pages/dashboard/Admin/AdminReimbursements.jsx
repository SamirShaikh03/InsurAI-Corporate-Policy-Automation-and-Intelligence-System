// src/pages/dashboard/Admin/AdminReimbursements.jsx
import React, { useState, useEffect, useMemo } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import API from "../../../api";
import "./AdminTheme.css";
import "./AdminNewFeatures.css";

export default function AdminReimbursements() {
  const [reimbursements, setReimbursements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [notification, setNotification] = useState(null);
  const [selectedReimbursement, setSelectedReimbursement] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Process form state
  const [processForm, setProcessForm] = useState({
    transactionId: "",
    notes: ""
  });

  // Fetch reimbursements
  useEffect(() => {
    fetchReimbursements();
    fetchStats();
  }, [statusFilter]);

  const fetchReimbursements = async () => {
    setLoading(true);
    try {
      const params = statusFilter !== "all" ? `?status=${statusFilter.toUpperCase()}` : "";
      const response = await API.get(`/admin/reimbursements/all${params}`);
      const data = response.data?.content || response.data;
      setReimbursements(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching reimbursements:", error);
      showNotification("Failed to fetch reimbursements", "error");
    } finally {
      setLoading(false);
    }
  };

  const [reimbursementStats, setReimbursementStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    totalAmount: 0,
    completedAmount: 0,
    pendingAmount: 0
  });

  const fetchStats = async () => {
    try {
      const response = await API.get("/admin/reimbursements/stats");
      if (response.data) {
        setReimbursementStats(response.data);
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
    const pending = reimbursements.filter(r => r.status === "PENDING").length;
    const processing = reimbursements.filter(r => r.status === "PROCESSING").length;
    const completed = reimbursements.filter(r => r.status === "COMPLETED").length;
    const total = reimbursements.length;
    const totalAmount = reimbursements.reduce((sum, r) => sum + (parseFloat(r.claimAmount) || 0), 0);
    return { pending, processing, completed, total, totalAmount };
  }, [reimbursements]);

  // Filtered reimbursements
  const filteredReimbursements = useMemo(() => {
    return reimbursements.filter(reimb => {
      return (
        reimb.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reimb.claimType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reimb.transactionId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [reimbursements, searchTerm]);

  // Handle process reimbursement
  const handleProcess = async (reimbursementId) => {
    if (!processForm.transactionId.trim()) {
      showNotification("Please enter a transaction ID", "error");
      return;
    }

    setActionLoading(true);
    try {
      await API.post(`/admin/reimbursements/${reimbursementId}/process`, {
        transactionId: processForm.transactionId,
        notes: processForm.notes
      });
      showNotification("Reimbursement processing started!", "success");
      setSelectedReimbursement(null);
      setProcessForm({ transactionId: "", notes: "" });
      fetchReimbursements();
      fetchStats();
    } catch (error) {
      console.error("Error processing reimbursement:", error);
      showNotification("Failed to process reimbursement", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle complete reimbursement
  const handleComplete = async (reimbursementId) => {
    setActionLoading(true);
    try {
      await API.post(`/admin/reimbursements/${reimbursementId}/complete`, {
        notes: processForm.notes || "Payment completed"
      });
      showNotification("Reimbursement completed!", "success");
      setSelectedReimbursement(null);
      setProcessForm({ transactionId: "", notes: "" });
      fetchReimbursements();
      fetchStats();
    } catch (error) {
      console.error("Error completing reimbursement:", error);
      showNotification("Failed to complete reimbursement", "error");
    } finally {
      setActionLoading(false);
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
      case "COMPLETED": return "admin-badge--success";
      case "PROCESSING": return "admin-badge--info";
      case "PENDING": return "admin-badge--warning";
      case "FAILED": return "admin-badge--danger";
      default: return "admin-badge--secondary";
    }
  };

  // Render statistics cards
  const renderStatsCards = () => (
    <div className="row g-3 mb-4">
      <div className="col-6 col-lg-2-4">
        <div className="admin-stat-card" onClick={() => setStatusFilter("pending")}>
          <div className="admin-stat-card__icon admin-stat-card__icon--warning">
            <i className="bi bi-clock-history"></i>
          </div>
          <div className="admin-stat-card__content">
            <span className="admin-stat-card__label">Pending</span>
            <strong className="admin-stat-card__value">{reimbursementStats.pending || stats.pending}</strong>
          </div>
        </div>
      </div>
      <div className="col-6 col-lg-2-4">
        <div className="admin-stat-card" onClick={() => setStatusFilter("processing")}>
          <div className="admin-stat-card__icon admin-stat-card__icon--info">
            <i className="bi bi-hourglass-split"></i>
          </div>
          <div className="admin-stat-card__content">
            <span className="admin-stat-card__label">Processing</span>
            <strong className="admin-stat-card__value">{reimbursementStats.processing || stats.processing}</strong>
          </div>
        </div>
      </div>
      <div className="col-6 col-lg-2-4">
        <div className="admin-stat-card" onClick={() => setStatusFilter("completed")}>
          <div className="admin-stat-card__icon admin-stat-card__icon--success">
            <i className="bi bi-check-circle"></i>
          </div>
          <div className="admin-stat-card__content">
            <span className="admin-stat-card__label">Completed</span>
            <strong className="admin-stat-card__value">{reimbursementStats.completed || stats.completed}</strong>
          </div>
        </div>
      </div>
      <div className="col-6 col-lg-2-4">
        <div className="admin-stat-card" onClick={() => setStatusFilter("all")}>
          <div className="admin-stat-card__icon admin-stat-card__icon--primary">
            <i className="bi bi-receipt"></i>
          </div>
          <div className="admin-stat-card__content">
            <span className="admin-stat-card__label">Total</span>
            <strong className="admin-stat-card__value">{reimbursementStats.total || stats.total}</strong>
          </div>
        </div>
      </div>
      <div className="col-6 col-lg-2-4">
        <div className="admin-stat-card">
          <div className="admin-stat-card__icon admin-stat-card__icon--accent">
            <i className="bi bi-currency-rupee"></i>
          </div>
          <div className="admin-stat-card__content">
            <span className="admin-stat-card__label">Total Amount</span>
            <strong className="admin-stat-card__value" style={{ fontSize: '1rem' }}>
              {formatCurrency(reimbursementStats.totalAmount || stats.totalAmount)}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );

  // Render reimbursements table
  const renderReimbursementsTable = () => (
    <div className="admin-card">
      <div className="admin-card-header d-flex justify-content-between align-items-center flex-wrap gap-3">
        <h3 className="admin-card-title mb-0">
          <i className="bi bi-cash-coin me-2"></i>
          Reimbursement Management
        </h3>
        <button
          className="admin-btn admin-btn--outline"
          onClick={() => { fetchReimbursements(); fetchStats(); }}
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
                placeholder="Search by employee, claim type, or transaction ID..."
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
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
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
        ) : filteredReimbursements.length > 0 ? (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Claim Type</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Transaction ID</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReimbursements.map((reimb, index) => (
                  <tr key={reimb.id || index}>
                    <td>
                      <strong>{reimb.employeeName || "N/A"}</strong>
                    </td>
                    <td>{reimb.claimType || "N/A"}</td>
                    <td className="fw-bold" style={{ color: '#2563eb' }}>
                      {formatCurrency(reimb.claimAmount)}
                    </td>
                    <td>
                      <span className="admin-badge admin-badge--secondary">
                        <i className={`bi ${
                          reimb.paymentMethod === "BANK_TRANSFER" ? "bi-bank" :
                          reimb.paymentMethod === "CHECK" ? "bi-file-earmark-text" : "bi-wallet2"
                        } me-1`}></i>
                        {reimb.paymentMethod?.replace("_", " ") || "N/A"}
                      </span>
                    </td>
                    <td>
                      <span className="font-monospace">
                        {reimb.transactionId || "-"}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-badge ${getStatusBadgeClass(reimb.status)}`}>
                        {reimb.status}
                      </span>
                    </td>
                    <td>
                      {reimb.status === "PENDING" && (
                        <button
                          className="admin-btn admin-btn--primary admin-btn--sm"
                          onClick={() => setSelectedReimbursement({ ...reimb, action: "process" })}
                        >
                          <i className="bi bi-play-fill me-1"></i>Process
                        </button>
                      )}
                      {reimb.status === "PROCESSING" && (
                        <button
                          className="admin-btn admin-btn--success admin-btn--sm"
                          onClick={() => setSelectedReimbursement({ ...reimb, action: "complete" })}
                        >
                          <i className="bi bi-check-lg me-1"></i>Complete
                        </button>
                      )}
                      {reimb.status === "COMPLETED" && (
                        <span className="text-success">
                          <i className="bi bi-check-circle-fill"></i>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="admin-empty-state">
            <div className="admin-empty-state__icon">
              <i className="bi bi-receipt"></i>
            </div>
            <h4 className="admin-empty-state__title">No Reimbursements Found</h4>
            <p className="admin-empty-state__desc">
              No reimbursements match your search criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // Render action modal
  const renderActionModal = () => {
    if (!selectedReimbursement) return null;

    const isProcess = selectedReimbursement.action === "process";

    return (
      <div className="admin-modal-overlay" onClick={() => setSelectedReimbursement(null)}>
        <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
          <div className="admin-modal-header">
            <h3 className="admin-modal-title">
              <i className={`bi ${isProcess ? 'bi-play-circle' : 'bi-check-circle'} me-2`}></i>
              {isProcess ? "Process Reimbursement" : "Complete Reimbursement"}
            </h3>
            <button
              className="admin-modal-close"
              onClick={() => setSelectedReimbursement(null)}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          <div className="admin-modal-body">
            {/* Reimbursement Info */}
            <div className="mb-4 p-3" style={{ background: '#f8fafc', borderRadius: '10px' }}>
              <div className="row g-2">
                <div className="col-6">
                  <small className="text-muted d-block">Employee</small>
                  <strong>{selectedReimbursement.employeeName}</strong>
                </div>
                <div className="col-6">
                  <small className="text-muted d-block">Amount</small>
                  <strong style={{ color: '#2563eb' }}>{formatCurrency(selectedReimbursement.claimAmount)}</strong>
                </div>
                <div className="col-6">
                  <small className="text-muted d-block">Claim Type</small>
                  <span>{selectedReimbursement.claimType}</span>
                </div>
                <div className="col-6">
                  <small className="text-muted d-block">Payment Method</small>
                  <span>{selectedReimbursement.paymentMethod?.replace("_", " ")}</span>
                </div>
              </div>
            </div>

            {/* Action Form */}
            {isProcess && (
              <div className="mb-3">
                <label className="admin-form-label">Transaction ID *</label>
                <input
                  type="text"
                  className="admin-form-control"
                  placeholder="Enter transaction ID (e.g., TXN123456789)"
                  value={processForm.transactionId}
                  onChange={(e) => setProcessForm(prev => ({ ...prev, transactionId: e.target.value }))}
                />
              </div>
            )}

            <div className="mb-3">
              <label className="admin-form-label">Notes</label>
              <textarea
                className="admin-form-control"
                rows="2"
                placeholder="Add any notes..."
                value={processForm.notes}
                onChange={(e) => setProcessForm(prev => ({ ...prev, notes: e.target.value }))}
              ></textarea>
            </div>
          </div>

          <div className="admin-modal-footer">
            <button
              className="admin-btn admin-btn--outline"
              onClick={() => setSelectedReimbursement(null)}
            >
              Cancel
            </button>
            <button
              className={`admin-btn ${isProcess ? 'admin-btn--primary' : 'admin-btn--success'}`}
              onClick={() => isProcess
                ? handleProcess(selectedReimbursement.id)
                : handleComplete(selectedReimbursement.id)
              }
              disabled={actionLoading}
            >
              {actionLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Processing...
                </>
              ) : (
                <>
                  <i className={`bi ${isProcess ? 'bi-play-fill' : 'bi-check-lg'} me-2`}></i>
                  {isProcess ? "Start Processing" : "Mark as Complete"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-reimbursements-page">
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
          <i className="bi bi-cash-coin me-3"></i>
          Reimbursement Processing
        </h1>
        <p className="admin-page-subtitle">
          Process and complete claim reimbursements
        </p>
      </div>

      {/* Statistics */}
      {renderStatsCards()}

      {/* Reimbursements Table */}
      {renderReimbursementsTable()}

      {/* Action Modal */}
      {renderActionModal()}
    </div>
  );
}

