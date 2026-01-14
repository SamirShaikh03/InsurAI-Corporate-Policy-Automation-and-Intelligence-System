// src/pages/dashboard/Hr/HRReimbursements.jsx
import React, { useState, useEffect, useMemo } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import API from "../../../api";
import "./HRDashboard.css";
import "./HRNewFeatures.css";

export default function HRReimbursements({ approvedClaims = [] }) {
  const [reimbursements, setReimbursements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState("pending"); // pending, history, initiate
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [notification, setNotification] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Initiate form state
  const [initiateForm, setInitiateForm] = useState({
    claimId: "",
    paymentMethod: "BANK_TRANSFER",
    accountNumber: "",
    notes: ""
  });

  // Fetch reimbursements
  const fetchReimbursements = async () => {
    setLoading(true);
    try {
      const endpoint = activeView === "pending"
        ? "/hr/reimbursements/pending"
        : "/hr/reimbursements/history";
      const response = await API.get(endpoint);
      setReimbursements(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching reimbursements:", error);
      showNotification("Failed to fetch reimbursements", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeView !== "initiate") {
      fetchReimbursements();
    }
  }, [activeView]);

  // Show notification
  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Statistics
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

  // Handle initiate reimbursement
  const handleInitiateReimbursement = async (e) => {
    e.preventDefault();
    if (!initiateForm.claimId) {
      showNotification("Please select a claim", "error");
      return;
    }

    setActionLoading(true);
    try {
      await API.post("/hr/reimbursements/initiate", initiateForm);
      showNotification("Reimbursement initiated successfully!", "success");
      setInitiateForm({
        claimId: "",
        paymentMethod: "BANK_TRANSFER",
        accountNumber: "",
        notes: ""
      });
      setActiveView("pending");
      fetchReimbursements();
    } catch (error) {
      console.error("Error initiating reimbursement:", error);
      showNotification("Failed to initiate reimbursement", "error");
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
      case "COMPLETED": return "hr-badge--success";
      case "PROCESSING": return "hr-badge--info";
      case "PENDING": return "hr-badge--warning";
      case "FAILED": return "hr-badge--danger";
      default: return "hr-badge--secondary";
    }
  };

  // Render statistics cards
  const renderStatsCards = () => (
    <div className="row g-3 mb-4">
      <div className="col-6 col-lg-2-4">
        <div className="hr-stat-card" onClick={() => setActiveView("pending")}>
          <div className="hr-stat-card__icon hr-stat-card__icon--warning">
            <i className="bi bi-clock-history"></i>
          </div>
          <div className="hr-stat-card__content">
            <span className="hr-stat-card__label">Pending</span>
            <strong className="hr-stat-card__value">{stats.pending}</strong>
          </div>
        </div>
      </div>
      <div className="col-6 col-lg-2-4">
        <div className="hr-stat-card">
          <div className="hr-stat-card__icon hr-stat-card__icon--info">
            <i className="bi bi-hourglass-split"></i>
          </div>
          <div className="hr-stat-card__content">
            <span className="hr-stat-card__label">Processing</span>
            <strong className="hr-stat-card__value">{stats.processing}</strong>
          </div>
        </div>
      </div>
      <div className="col-6 col-lg-2-4">
        <div className="hr-stat-card">
          <div className="hr-stat-card__icon hr-stat-card__icon--success">
            <i className="bi bi-check-circle"></i>
          </div>
          <div className="hr-stat-card__content">
            <span className="hr-stat-card__label">Completed</span>
            <strong className="hr-stat-card__value">{stats.completed}</strong>
          </div>
        </div>
      </div>
      <div className="col-6 col-lg-2-4">
        <div className="hr-stat-card" onClick={() => setActiveView("history")}>
          <div className="hr-stat-card__icon hr-stat-card__icon--primary">
            <i className="bi bi-receipt"></i>
          </div>
          <div className="hr-stat-card__content">
            <span className="hr-stat-card__label">Total</span>
            <strong className="hr-stat-card__value">{stats.total}</strong>
          </div>
        </div>
      </div>
      <div className="col-6 col-lg-2-4">
        <div className="hr-stat-card">
          <div className="hr-stat-card__icon hr-stat-card__icon--accent">
            <i className="bi bi-currency-rupee"></i>
          </div>
          <div className="hr-stat-card__content">
            <span className="hr-stat-card__label">Total Amount</span>
            <strong className="hr-stat-card__value" style={{ fontSize: '1rem' }}>
              {formatCurrency(stats.totalAmount)}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );

  // Render initiate form
  const renderInitiateForm = () => (
    <div className="hr-card">
      <div className="hr-card-header d-flex justify-content-between align-items-center">
        <h3 className="hr-card-title mb-0">
          <i className="bi bi-plus-circle me-2"></i>
          Initiate Reimbursement
        </h3>
        <button
          className="hr-btn hr-btn--outline"
          onClick={() => setActiveView("pending")}
        >
          <i className="bi bi-arrow-left me-2"></i>Back
        </button>
      </div>
      <div className="hr-card-body">
        <form onSubmit={handleInitiateReimbursement}>
          <div className="row g-4">
            {/* Claim Selection */}
            <div className="col-md-6">
              <label className="hr-form-label">
                <i className="bi bi-file-earmark-check me-2"></i>
                Select Approved Claim *
              </label>
              <select
                className="hr-form-control"
                value={initiateForm.claimId}
                onChange={(e) => setInitiateForm(prev => ({ ...prev, claimId: e.target.value }))}
                required
              >
                <option value="">Choose a claim...</option>
                {approvedClaims.map(claim => (
                  <option key={claim.id} value={claim.id}>
                    #{claim.id} - {claim.employeeName || claim.title} - {formatCurrency(claim.amount)}
                  </option>
                ))}
              </select>
              <small className="text-muted">Only approved claims without reimbursement are shown</small>
            </div>

            {/* Payment Method */}
            <div className="col-md-6">
              <label className="hr-form-label">
                <i className="bi bi-credit-card me-2"></i>
                Payment Method *
              </label>
              <select
                className="hr-form-control"
                value={initiateForm.paymentMethod}
                onChange={(e) => setInitiateForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                required
              >
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CHECK">Check</option>
                <option value="DIGITAL_WALLET">Digital Wallet</option>
              </select>
            </div>

            {/* Account Number */}
            <div className="col-md-6">
              <label className="hr-form-label">
                <i className="bi bi-bank me-2"></i>
                Account/Reference Number
              </label>
              <input
                type="text"
                className="hr-form-control"
                placeholder="Enter account or reference number..."
                value={initiateForm.accountNumber}
                onChange={(e) => setInitiateForm(prev => ({ ...prev, accountNumber: e.target.value }))}
              />
            </div>

            {/* Notes */}
            <div className="col-md-6">
              <label className="hr-form-label">
                <i className="bi bi-chat-text me-2"></i>
                Notes
              </label>
              <input
                type="text"
                className="hr-form-control"
                placeholder="Add any notes..."
                value={initiateForm.notes}
                onChange={(e) => setInitiateForm(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>

            {/* Submit Button */}
            <div className="col-12">
              <div className="d-flex gap-3 justify-content-end">
                <button
                  type="button"
                  className="hr-btn hr-btn--outline"
                  onClick={() => setActiveView("pending")}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="hr-btn hr-btn--primary"
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send me-2"></i>
                      Initiate Reimbursement
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );

  // Render reimbursements table
  const renderReimbursementsTable = () => (
    <div className="hr-card">
      <div className="hr-card-header d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div className="d-flex align-items-center gap-3">
          <h3 className="hr-card-title mb-0">
            <i className="bi bi-receipt-cutoff me-2"></i>
            {activeView === "pending" ? "Pending Reimbursements" : "Reimbursement History"}
          </h3>
          <div className="btn-group">
            <button
              className={`hr-btn hr-btn--sm ${activeView === "pending" ? "hr-btn--primary" : "hr-btn--outline"}`}
              onClick={() => setActiveView("pending")}
            >
              Pending
            </button>
            <button
              className={`hr-btn hr-btn--sm ${activeView === "history" ? "hr-btn--primary" : "hr-btn--outline"}`}
              onClick={() => setActiveView("history")}
            >
              History
            </button>
          </div>
        </div>
        <div className="d-flex gap-2">
          <button
            className="hr-btn hr-btn--primary"
            onClick={() => setActiveView("initiate")}
          >
            <i className="bi bi-plus-lg me-2"></i>
            Initiate
          </button>
          <button
            className="hr-btn hr-btn--outline"
            onClick={fetchReimbursements}
          >
            <i className="bi bi-arrow-clockwise"></i>
          </button>
        </div>
      </div>

      <div className="hr-card-body">
        {/* Search */}
        <div className="mb-4">
          <div className="hr-search-box">
            <i className="bi bi-search hr-search-box__icon"></i>
            <input
              type="text"
              className="hr-form-control"
              placeholder="Search by employee name, claim type, or transaction ID..."
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
        ) : filteredReimbursements.length > 0 ? (
          <div className="table-responsive">
            <table className="hr-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Claim Type</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Transaction ID</th>
                  <th>Initiated</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredReimbursements.map((reimb) => (
                  <tr key={reimb.id}>
                    <td>
                      <strong>{reimb.employeeName || "N/A"}</strong>
                    </td>
                    <td>{reimb.claimType || "N/A"}</td>
                    <td className="fw-bold text-primary">{formatCurrency(reimb.claimAmount)}</td>
                    <td>
                      <span className="hr-badge hr-badge--secondary">
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
                      {reimb.initiatedDate
                        ? new Date(reimb.initiatedDate).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td>
                      <span className={`hr-badge ${getStatusBadgeClass(reimb.status)}`}>
                        {reimb.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="hr-empty-state">
            <div className="hr-empty-state__icon">
              <i className="bi bi-receipt"></i>
            </div>
            <h4 className="hr-empty-state__title">No Reimbursements Found</h4>
            <p className="hr-empty-state__desc">
              {activeView === "pending"
                ? "There are no pending reimbursements."
                : "No reimbursement history found."}
            </p>
            <button
              className="hr-btn hr-btn--primary"
              onClick={() => setActiveView("initiate")}
            >
              <i className="bi bi-plus-lg me-2"></i>
              Initiate Reimbursement
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="hr-reimbursements-page">
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
          <i className="bi bi-cash-coin me-3"></i>
          Reimbursement Management
        </h1>
        <p className="hr-page-subtitle">
          Initiate and track claim reimbursements for approved claims
        </p>
      </div>

      {/* Statistics */}
      {renderStatsCards()}

      {/* Main Content */}
      {activeView === "initiate" ? renderInitiateForm() : renderReimbursementsTable()}
    </div>
  );
}

