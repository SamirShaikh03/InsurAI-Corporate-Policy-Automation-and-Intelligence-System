// src/components/hr/HRClaims.jsx
import React, { useState, useMemo } from "react";
import { API_BASE_URL } from "../../../config";

export default function HRClaims({
  pendingClaims,
  statusFilter,
  setStatusFilter,
  displayedClaims,
  mappedClaims,
  setMappedClaims,
  viewingClaim,
  openViewModal,
  closeViewModal,
  approveClaim,
  rejectClaim,
  downloadCSV,
  downloadPDF,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedClaims, setSelectedClaims] = useState(new Set());

  // Enhanced statistics
  const claimsStats = useMemo(() => {
    const total = pendingClaims.length;
    const pending = pendingClaims.filter(c => c.status === "Pending").length;
    const approved = pendingClaims.filter(c => c.status === "Approved").length;
    const rejected = pendingClaims.filter(c => c.status === "Rejected").length;
    const totalAmount = pendingClaims.reduce((sum, claim) => sum + (parseFloat(claim.amount) || 0), 0);
    const pendingAmount = pendingClaims
      .filter(c => c.status === "Pending")
      .reduce((sum, claim) => sum + (parseFloat(claim.amount) || 0), 0);

    return { total, pending, approved, rejected, totalAmount, pendingAmount };
  }, [pendingClaims]);

  // Filtered and sorted claims
  const enhancedClaims = useMemo(() => {
    let filtered = displayedClaims.filter(claim => {
      const matchesSearch = 
        claim.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.employeeIdDisplay?.toString().includes(searchTerm) ||
        claim.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.policyName?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });

    // Sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === 'amount') {
          aValue = parseFloat(aValue) || 0;
          bValue = parseFloat(bValue) || 0;
        } else if (sortConfig.key === 'claimDate') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [displayedClaims, searchTerm, sortConfig]);

  // Handle sort
  const handleSort = (key) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Select/deselect all claims
  const toggleSelectAll = () => {
    if (selectedClaims.size === enhancedClaims.length) {
      setSelectedClaims(new Set());
    } else {
      setSelectedClaims(new Set(enhancedClaims.map(claim => claim.id)));
    }
  };

  // Toggle single claim selection
  const toggleClaimSelection = (claimId) => {
    setSelectedClaims(prev => {
      const newSet = new Set(prev);
      if (newSet.has(claimId)) {
        newSet.delete(claimId);
      } else {
        newSet.add(claimId);
      }
      return newSet;
    });
  };

  // Bulk actions
  const handleBulkApprove = () => {
    selectedClaims.forEach(claimId => {
      const claim = mappedClaims.find(c => c.id === claimId);
      if (claim && claim.status === "Pending") {
        approveClaim(claimId, claim.remarks || "");
      }
    });
    setSelectedClaims(new Set());
  };

  const handleBulkReject = () => {
    selectedClaims.forEach(claimId => {
      const claim = mappedClaims.find(c => c.id === claimId);
      if (claim && claim.status === "Pending") {
        rejectClaim(claimId, claim.remarks || "");
      }
    });
    setSelectedClaims(new Set());
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Sort indicator component
  const SortIndicator = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <i className="bi bi-arrow-down-up ms-1" style={{ opacity: 0.4 }}></i>;
    return sortConfig.direction === 'asc' ? 
      <i className="bi bi-arrow-up ms-1" style={{ color: 'var(--hr-primary)' }}></i> : 
      <i className="bi bi-arrow-down ms-1" style={{ color: 'var(--hr-primary)' }}></i>;
  };

  return (
    <div className="hr-claims-page">
      {/* Page Header */}
      <div className="hr-page-header">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <h1 className="hr-page-title">Claim Approval Management</h1>
            <p className="hr-page-subtitle">Review and manage employee insurance claims</p>
          </div>
          <div className="d-flex gap-2">
            <button className="hr-btn hr-btn--outline" onClick={downloadCSV}>
              <i className="bi bi-file-earmark-spreadsheet me-2"></i>Export CSV
            </button>
            <button className="hr-btn hr-btn--primary" onClick={downloadPDF}>
              <i className="bi bi-file-earmark-pdf me-2"></i>Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="hr-stats-grid" style={{ marginBottom: '24px' }}>
        <div className="hr-stat-card">
          <div className="hr-stat-header">
            <div className="hr-stat-icon hr-stat-icon--primary">
              <i className="bi bi-wallet2"></i>
            </div>
          </div>
          <div className="hr-stat-value">{claimsStats.total}</div>
          <div className="hr-stat-label">Total Claims</div>
        </div>
        
        <div className="hr-stat-card hr-stat-card--warning">
          <div className="hr-stat-header">
            <div className="hr-stat-icon hr-stat-icon--warning">
              <i className="bi bi-clock"></i>
            </div>
          </div>
          <div className="hr-stat-value">{claimsStats.pending}</div>
          <div className="hr-stat-label">Pending</div>
        </div>
        
        <div className="hr-stat-card hr-stat-card--success">
          <div className="hr-stat-header">
            <div className="hr-stat-icon hr-stat-icon--success">
              <i className="bi bi-check-circle"></i>
            </div>
          </div>
          <div className="hr-stat-value">{claimsStats.approved}</div>
          <div className="hr-stat-label">Approved</div>
        </div>
        
        <div className="hr-stat-card hr-stat-card--danger">
          <div className="hr-stat-header">
            <div className="hr-stat-icon hr-stat-icon--danger">
              <i className="bi bi-x-circle"></i>
            </div>
          </div>
          <div className="hr-stat-value">{claimsStats.rejected}</div>
          <div className="hr-stat-label">Rejected</div>
        </div>
        
        <div className="hr-stat-card hr-stat-card--info">
          <div className="hr-stat-header">
            <div className="hr-stat-icon hr-stat-icon--info">
              <i className="bi bi-currency-rupee"></i>
            </div>
          </div>
          <div className="hr-stat-value">{formatCurrency(claimsStats.totalAmount)}</div>
          <div className="hr-stat-label">Total Amount</div>
        </div>
        
        <div className="hr-stat-card">
          <div className="hr-stat-header">
            <div className="hr-stat-icon" style={{ background: 'var(--hr-subtle)', color: 'var(--hr-secondary)' }}>
              <i className="bi bi-hourglass-split"></i>
            </div>
          </div>
          <div className="hr-stat-value">{formatCurrency(claimsStats.pendingAmount)}</div>
          <div className="hr-stat-label">Pending Amount</div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="hr-card" style={{ marginBottom: '24px' }}>
        <div className="hr-card-body">
          <div className="row g-3 align-items-center">
            {/* Search */}
            <div className="col-md-4">
              <div className="hr-search-wrapper" style={{ maxWidth: '100%' }}>
                <i className="bi bi-search hr-search-icon"></i>
                <input
                  type="text"
                  className="hr-search-input"
                  placeholder="Search by name, ID, type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="col-md-2">
              <select
                className="hr-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Claims</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* Bulk Actions */}
            <div className="col-md-4">
              <div className="d-flex gap-2">
                <button
                  className="hr-btn hr-btn--success hr-btn--sm"
                  disabled={selectedClaims.size === 0}
                  onClick={handleBulkApprove}
                >
                  <i className="bi bi-check-lg me-1"></i>Approve ({selectedClaims.size})
                </button>
                <button
                  className="hr-btn hr-btn--danger hr-btn--sm"
                  disabled={selectedClaims.size === 0}
                  onClick={handleBulkReject}
                >
                  <i className="bi bi-x-lg me-1"></i>Reject ({selectedClaims.size})
                </button>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="col-md-2">
              <button
                className="hr-btn hr-btn--outline hr-btn--sm w-100"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("All");
                  setSelectedClaims(new Set());
                }}
              >
                <i className="bi bi-x-circle me-1"></i>Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Claims Table */}
      <div className="hr-card">
        <div className="hr-card-header">
          <h3 className="hr-card-title">
            <i className="bi bi-list-check"></i>
            Claims Overview
          </h3>
          <span className="hr-badge hr-badge--primary">
            {enhancedClaims.length} of {pendingClaims.length} claims
          </span>
        </div>
        <div className="hr-card-body" style={{ padding: 0 }}>
          <div className="hr-table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="hr-table">
              <thead>
                <tr>
                  <th style={{ width: "40px" }}>
                    <input
                      type="checkbox"
                      checked={selectedClaims.size === enhancedClaims.length && enhancedClaims.length > 0}
                      onChange={toggleSelectAll}
                      style={{ width: 16, height: 16, cursor: 'pointer' }}
                    />
                  </th>
                  <th onClick={() => handleSort("employeeName")} style={{ cursor: 'pointer' }}>
                    Employee <SortIndicator columnKey="employeeName" />
                  </th>
                  <th onClick={() => handleSort("title")} style={{ cursor: 'pointer' }}>
                    Type <SortIndicator columnKey="title" />
                  </th>
                  <th onClick={() => handleSort("amount")} style={{ cursor: 'pointer', textAlign: 'right' }}>
                    Amount <SortIndicator columnKey="amount" />
                  </th>
                  <th onClick={() => handleSort("claimDate")} style={{ cursor: 'pointer' }}>
                    Date <SortIndicator columnKey="claimDate" />
                  </th>
                  <th>Status</th>
                  <th>Policy</th>
                  <th style={{ width: "90px" }}>Docs</th>
                  <th style={{ width: "140px" }}>Remarks</th>
                  <th style={{ width: "130px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {enhancedClaims.length === 0 ? (
                  <tr>
                    <td colSpan="10">
                      <div className="hr-empty-state">
                        <div className="hr-empty-state__icon">
                          <i className="bi bi-inbox"></i>
                        </div>
                        <h4 className="hr-empty-state__title">No Claims Found</h4>
                        <p className="hr-empty-state__desc">No claims match your current filters.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  enhancedClaims.map((claim) => (
                    <tr key={claim.id} className={selectedClaims.has(claim.id) ? "selected" : ""}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedClaims.has(claim.id)}
                          onChange={() => toggleClaimSelection(claim.id)}
                          disabled={claim.status !== "Pending"}
                          style={{ width: 16, height: 16, cursor: claim.status === "Pending" ? 'pointer' : 'not-allowed' }}
                        />
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="hr-stat-icon hr-stat-icon--primary" style={{ width: 36, height: 36, fontSize: '0.9rem' }}>
                            <i className="bi bi-person"></i>
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{claim.employeeName}</div>
                            <small style={{ color: 'var(--hr-text-muted)' }}>ID: {claim.employeeIdDisplay}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="hr-badge hr-badge--neutral">{claim.title}</span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--hr-primary)' }}>
                        {formatCurrency(claim.amount)}
                      </td>
                      <td>
                        <small style={{ color: 'var(--hr-text-muted)' }}>{claim.claimDate?.split("T")[0]}</small>
                      </td>
                      <td>
                        <span className={`hr-badge hr-badge--${
                          claim.status === "Pending" ? "warning" :
                          claim.status === "Approved" ? "success" : "danger"
                        }`}>
                          {claim.status}
                        </span>
                      </td>
                      <td>
                        <small style={{ color: 'var(--hr-text-muted)' }} title={claim.policyName}>
                          {claim.policyName?.length > 15 ? claim.policyName.substring(0, 15) + '...' : claim.policyName}
                        </small>
                      </td>
                      <td>
                        {claim.documents?.length > 0 ? (
                          <div className="dropdown">
                            <button
                              className="hr-btn hr-btn--outline hr-btn--sm dropdown-toggle"
                              type="button"
                              data-bs-toggle="dropdown"
                            >
                              <i className="bi bi-paperclip"></i> {claim.documents.length}
                            </button>
                            <ul className="dropdown-menu">
                              {claim.documents.map((doc, idx) => {
                                const filename = doc.split('/').pop();
                                return (
                                  <li key={idx}>
                                    <a className="dropdown-item" href={`${API_BASE_URL}/api/files/download/${filename}`} target="_blank" rel="noreferrer">
                                      <i className="bi bi-download me-2"></i>Doc {idx + 1}
                                    </a>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--hr-text-light)' }}>—</span>
                        )}
                      </td>
                      <td>
                        {claim.status === "Pending" && claim.canModify ? (
                          <input
                            type="text"
                            className="hr-input"
                            placeholder="Remarks..."
                            value={claim.remarks || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              setMappedClaims((prev) =>
                                prev.map((c) => c.id === claim.id ? { ...c, remarks: value } : c)
                              );
                            }}
                            style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                          />
                        ) : (
                          <small style={{ color: 'var(--hr-text-muted)' }} title={claim.remarks}>
                            {claim.remarks || "—"}
                          </small>
                        )}
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <button
                            className="hr-btn hr-btn--outline hr-btn--sm"
                            onClick={() => openViewModal(claim)}
                            title="View details"
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          {claim.status === "Pending" && claim.canModify && (
                            <>
                              <button
                                className="hr-btn hr-btn--success hr-btn--sm"
                                onClick={() => {
                                  const latestRemarks = mappedClaims.find((c) => c.id === claim.id)?.remarks || "";
                                  if (!latestRemarks.trim()) {
                                    alert("Please enter a remark before approving.");
                                    return;
                                  }
                                  approveClaim(claim.id, latestRemarks);
                                }}
                                title="Approve"
                              >
                                <i className="bi bi-check-lg"></i>
                              </button>
                              <button
                                className="hr-btn hr-btn--danger hr-btn--sm"
                                onClick={() => {
                                  const latestRemarks = mappedClaims.find((c) => c.id === claim.id)?.remarks || "";
                                  if (!latestRemarks.trim()) {
                                    alert("Please enter a remark before rejecting.");
                                    return;
                                  }
                                  rejectClaim(claim.id, latestRemarks);
                                }}
                                title="Reject"
                              >
                                <i className="bi bi-x-lg"></i>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View Claim Modal */}
      {viewingClaim && (
        <div className="hr-modal-backdrop" onClick={closeViewModal}>
          <div className="hr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="hr-modal-header">
              <h3 className="hr-modal-title">
                <i className="bi bi-wallet2 me-2"></i>
                Claim Details #{viewingClaim.id}
              </h3>
              <button type="button" className="hr-modal-close" onClick={closeViewModal}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="hr-modal-body">
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="hr-detail-group">
                    <label className="hr-detail-label">Employee Information</label>
                    <p className="hr-detail-value">{viewingClaim.employeeName}</p>
                    <small style={{ color: 'var(--hr-text-muted)' }}>ID: {viewingClaim.employeeIdDisplay}</small>
                  </div>
                  <div className="hr-detail-group">
                    <label className="hr-detail-label">Claim Type</label>
                    <p className="hr-detail-value">{viewingClaim.title}</p>
                  </div>
                  <div className="hr-detail-group">
                    <label className="hr-detail-label">Amount</label>
                    <p className="hr-detail-value" style={{ color: 'var(--hr-primary)', fontWeight: 700, fontSize: '1.25rem' }}>
                      {formatCurrency(viewingClaim.amount)}
                    </p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="hr-detail-group">
                    <label className="hr-detail-label">Policy</label>
                    <p className="hr-detail-value">{viewingClaim.policyName}</p>
                  </div>
                  <div className="hr-detail-group">
                    <label className="hr-detail-label">Status</label>
                    <p className="hr-detail-value">
                      <span className={`hr-badge hr-badge--${
                        viewingClaim.status === "Pending" ? "warning" :
                        viewingClaim.status === "Approved" ? "success" : "danger"
                      }`} style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
                        {viewingClaim.status}
                      </span>
                    </p>
                  </div>
                  <div className="hr-detail-group">
                    <label className="hr-detail-label">Submitted Date</label>
                    <p className="hr-detail-value">{viewingClaim.claimDate?.split("T")[0]}</p>
                  </div>
                </div>
              </div>

              <div className="hr-detail-group">
                <label className="hr-detail-label">Description</label>
                <div className="hr-detail-box">
                  {viewingClaim.description || <span style={{ color: 'var(--hr-text-muted)' }}>No description provided</span>}
                </div>
              </div>

              <div className="hr-detail-group">
                <label className="hr-detail-label">Remarks</label>
                <p className="hr-detail-value">
                  {viewingClaim.remarks || <span style={{ color: 'var(--hr-text-muted)' }}>No remarks</span>}
                </p>
              </div>

              <div className="hr-detail-group">
                <label className="hr-detail-label">Supporting Documents</label>
                {viewingClaim.documents?.length > 0 ? (
                  <div className="hr-doc-list">
                    {viewingClaim.documents.map((doc, idx) => {
                      const filename = doc.split('/').pop();
                      const displayName = filename.includes('_') ? filename.substring(filename.indexOf('_') + 1) : filename;
                      return (
                        <a key={idx} href={`${API_BASE_URL}/api/files/download/${filename}`} target="_blank" rel="noreferrer" className="hr-doc-item">
                          <i className="bi bi-file-earmark"></i>
                          <span>{displayName || `Document ${idx + 1}`}</span>
                          <i className="bi bi-download" style={{ marginLeft: 'auto' }}></i>
                        </a>
                      );
                    })}
                  </div>
                ) : (
                  <p style={{ color: 'var(--hr-text-muted)' }}>No documents uploaded</p>
                )}
              </div>
            </div>
            <div className="hr-modal-footer">
              <button type="button" className="hr-btn hr-btn--secondary" onClick={closeViewModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .hr-claims-page .hr-stats-grid {
          grid-template-columns: repeat(6, 1fr);
        }
        
        @media (max-width: 1200px) {
          .hr-claims-page .hr-stats-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        
        @media (max-width: 768px) {
          .hr-claims-page .hr-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        
        .hr-table tbody tr.selected {
          background: var(--hr-primary-subtle);
        }
        
        /* Modal Styles */
        .hr-modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        
        .hr-modal {
          background: var(--hr-surface, #fff);
          border-radius: var(--hr-radius-lg, 14px);
          width: 100%;
          max-width: 700px;
          max-height: 90vh;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        
        .hr-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          background: linear-gradient(135deg, var(--hr-primary-dark, #0f766e) 0%, var(--hr-primary, #0d9488) 100%);
          color: #fff;
        }
        
        .hr-modal-title {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0;
          display: flex;
          align-items: center;
        }
        
        .hr-modal-close {
          background: rgba(255,255,255,0.15);
          border: none;
          color: #fff;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        
        .hr-modal-close:hover {
          background: rgba(255,255,255,0.25);
        }
        
        .hr-modal-body {
          padding: 24px;
          overflow-y: auto;
          max-height: calc(90vh - 140px);
        }
        
        .hr-modal-footer {
          padding: 16px 24px;
          border-top: 1px solid var(--hr-border, #e2e8f0);
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }
        
        .hr-detail-group {
          margin-bottom: 20px;
        }
        
        .hr-detail-label {
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--hr-text-muted, #64748b);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 6px;
        }
        
        .hr-detail-value {
          margin: 0;
          font-size: 1rem;
          color: var(--hr-text, #0f172a);
        }
        
        .hr-detail-box {
          padding: 16px;
          background: var(--hr-subtle, #f1f5f9);
          border-radius: var(--hr-radius, 10px);
          font-size: 0.95rem;
          color: var(--hr-text, #0f172a);
          white-space: pre-wrap;
        }
        
        .hr-doc-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .hr-doc-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: var(--hr-subtle, #f1f5f9);
          border-radius: var(--hr-radius, 10px);
          text-decoration: none;
          color: var(--hr-text, #0f172a);
          transition: all 0.2s;
        }
        
        .hr-doc-item:hover {
          background: var(--hr-primary-subtle, rgba(13, 148, 136, 0.08));
          color: var(--hr-primary, #0d9488);
        }
      `}</style>
    </div>
  );
}
