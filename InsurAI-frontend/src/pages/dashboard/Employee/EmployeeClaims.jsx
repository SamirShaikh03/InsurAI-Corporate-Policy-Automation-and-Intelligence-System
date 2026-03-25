import React, { useState, useEffect, useMemo } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./EmployeeClaims.css";
import { API_BASE_URL } from "../../../config";
import { SkeletonStats, SkeletonTable, SectionLoader, InlineSpinner } from "../../../components/loading";

export default function EmployeeClaims({
  activeTab,
  setActiveTab,
  showNotificationAlert,
  policies = [],
  onClaimSubmitted = null   // called after a successful submit so the parent can refresh its own claims state
}) {
  const [newClaim, setNewClaim] = useState({
    type: "",
    amount: "",
    date: "",
    description: "",
    documents: [],
    existingDocuments: [],
  });
  const [claims, setClaims] = useState([]);
  const [selectedPolicyId, setSelectedPolicyId] = useState(
    policies.length > 0 ? String(policies[0].id) : ""
  );
  const [viewingClaim, setViewingClaim] = useState(null);
  const [loading, setLoading] = useState(false);     // controls the list skeleton
  const [submitting, setSubmitting] = useState(false); // controls the submit-button spinner
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [fileUploadProgress, setFileUploadProgress] = useState({});



  useEffect(() => {
  if (policies.length > 0 && !selectedPolicyId) {
    setSelectedPolicyId(String(policies[0].id));
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [policies]);


// ------------------ Fetch employee claims ------------------
const fetchClaims = async () => {
  const token = localStorage.getItem("token");
  if (!token) return console.warn("Missing token, cannot fetch claims");

  setLoading(true);
  try {
    const res = await fetch(`${API_BASE_URL}/employee/claims`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Auth errors: let the existing session/token handling deal with it silently
    if (res.status === 401 || res.status === 403) {
      console.warn("Auth error fetching claims:", res.status);
      setClaims([]);
      return;
    }

    if (!res.ok) throw new Error(`Failed to fetch claims (${res.status})`);

    const data = await res.json();

    if (!Array.isArray(data)) {
      console.warn("Unexpected claims response format");
      setClaims([]);
      return;
    }

    const mapped = data.map(claim => ({
      ...claim,
      policyId: Number(claim.policy_id || claim.policyId || 0),
      remarks: claim.remarks || "No remarks yet",
      formattedAmount: `₹${Number(claim.amount || 0).toLocaleString('en-IN')}`,
      statusColor: getStatusColor(claim.status),
      statusIcon: getStatusIcon(claim.status),
      typeIcon: getTypeIcon(claim.title)
    }));

    setClaims(mapped);

  } catch (error) {
    console.error("Error fetching claims:", error);
    showNotificationAlert("Unable to load claims. Please try again.", "error");
  } finally {
    setLoading(false);
  }
};


  // Helper functions for status and type icons
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'danger';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'bi-check-circle-fill';
      case 'pending': return 'bi-clock-fill';
      case 'rejected': return 'bi-x-circle-fill';
      default: return 'bi-question-circle';
    }
  };

  const getTypeIcon = (type) => {
    const lowerType = type?.toLowerCase();
    if (lowerType?.includes('health')) return 'bi-heart-pulse';
    if (lowerType?.includes('dental')) return 'bi-tooth';
    if (lowerType?.includes('vision')) return 'bi-eye';
    if (lowerType?.includes('accident')) return 'bi-bandaid';
    if (lowerType?.includes('life')) return 'bi-heart';
    return 'bi-wallet2';
  };

 useEffect(() => {
  fetchClaims();
}, []); 


  // ------------------ Enhanced filtering and sorting ------------------
  const filteredAndSortedClaims = useMemo(() => {
    let filtered = claims.filter(claim => {
      const matchesSearch = claim.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           claim.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           claim.id?.toString().includes(searchTerm);
      const matchesStatus = statusFilter === "all" || claim.status?.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'amount-high':
          return (b.amount || 0) - (a.amount || 0);
        case 'amount-low':
          return (a.amount || 0) - (b.amount || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [claims, searchTerm, statusFilter, sortBy]);

  // ------------------ Enhanced Stats calculation ------------------
  const claimsStats = useMemo(() => {
    const total = claims.length;
    const approved = claims.filter(c => c.status === 'Approved').length;
    const pending = claims.filter(c => c.status === 'Pending').length;
    const rejected = claims.filter(c => c.status === 'Rejected').length;
    const totalAmount = claims.reduce((sum, claim) => sum + (parseFloat(claim.amount) || 0), 0);
    const avgAmount = total > 0 ? totalAmount / total : 0;

    return { total, approved, pending, rejected, totalAmount, avgAmount };
  }, [claims]);

  // ------------------ Enhanced document upload with progress ------------------
  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // File validation
    const validFiles = files.filter(file => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      
      if (file.size > maxSize) {
        showNotificationAlert(`File ${file.name} exceeds 10MB limit`, "warning");
        return false;
      }
      
      if (!validTypes.includes(file.type)) {
        showNotificationAlert(`File ${file.name} has unsupported format`, "warning");
        return false;
      }
      
      return true;
    });

    // Simulate upload progress
    validFiles.forEach((file, index) => {
      setFileUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
      
      const interval = setInterval(() => {
        setFileUploadProgress(prev => {
          const currentProgress = prev[file.name] || 0;
          if (currentProgress >= 100) {
            clearInterval(interval);
            return prev;
          }
          return { ...prev, [file.name]: currentProgress + 10 };
        });
      }, 100);

      setTimeout(() => {
        clearInterval(interval);
        setFileUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
        
        // Add to documents after "upload"
        setTimeout(() => {
          setNewClaim(prev => ({
            ...prev,
            documents: [...prev.documents, file],
          }));
          setFileUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[file.name];
            return newProgress;
          });
        }, 300);
      }, 1000);
    });
  };

  // ------------------ Enhanced claim submission ------------------
  const handleClaimSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) return showNotificationAlert("Cannot submit claim: missing token.", "error");

    if (!newClaim.type || !newClaim.amount || !newClaim.date || !newClaim.description || !selectedPolicyId) {
      return showNotificationAlert("Please fill all required fields.", "warning");
    }

    setSubmitting(true);  // only the button spinner — does NOT conflict with list skeleton
    try {
      const formData = new FormData();
      formData.append("policyId", selectedPolicyId);
      formData.append("title", newClaim.type);
      formData.append("description", newClaim.description);
      formData.append("amount", parseFloat(newClaim.amount));
      formData.append("date", newClaim.date);

      newClaim.documents.forEach(file => formData.append("documents", file));

      let url = `${API_BASE_URL}/employee/claims`;
      if (newClaim.id) {
        url = `${API_BASE_URL}/employee/claims/update`;
        formData.append("claimId", newClaim.id);
      }

      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to submit claim");
      }

      await res.json(); // consume the response body

      // Reset form
      setNewClaim({ type: "", amount: "", date: "", description: "", documents: [], existingDocuments: [] });
      if (policies.length > 0) setSelectedPolicyId(String(policies[0].id));

      // Refresh the claims list FIRST (awaited) — users will see the skeleton briefly
      // then the Updated list, rather than a "No claims found" flash.
      await fetchClaims();

      // Notify dashboard so its home-stats also update
      if (typeof onClaimSubmitted === "function") onClaimSubmitted();

      // Switch to claims view only after data is ready
      setActiveTab("claims");

      showNotificationAlert(
        newClaim.id ? "Claim updated successfully!" : "Claim submitted successfully!",
        "success"
      );

    } catch (error) {
      console.error(error);
      showNotificationAlert(error.message || "Error submitting claim", "error");
    } finally {
      setSubmitting(false);
    }
  };

    const totalApprovedAmount = claims
  .filter(c => c.status === "Approved")
  .reduce((sum, c) => sum + (c.amount || 0), 0);

  // ------------------ Enhanced document removal ------------------
  const handleRemoveExistingDocument = (index) => {
    setNewClaim(prev => {
      const updatedExisting = [...prev.existingDocuments];
      updatedExisting.splice(index, 1);
      return { ...prev, existingDocuments: updatedExisting };
    });
  };

  const handleRemoveNewDocument = (index) => {
    setNewClaim(prev => {
      const updatedNew = [...prev.documents];
      updatedNew.splice(index, 1);
      return { ...prev, documents: updatedNew };
    });
  };

  const formatINR = (value, options) => {
    if (value === undefined || value === null || Number.isNaN(Number(value))) {
      return "₹0";
    }
    return `₹${Number(value).toLocaleString("en-IN", options)}`;
  };

  // ------------------ Claims overview ------------------
  const renderClaimsList = () => {
    const statCards = [
      { label: "Total claims", value: claimsStats.total, icon: "bi-wallet2", tone: "primary" },
      { label: "Approved", value: claimsStats.approved, icon: "bi-check-circle", tone: "success" },
      { label: "Pending", value: claimsStats.pending, icon: "bi-hourglass-split", tone: "warning" },
      { label: "Rejected", value: claimsStats.rejected, icon: "bi-slash-circle", tone: "danger" },
      { label: "Total submitted", value: formatINR(claimsStats.totalAmount), icon: "bi-currency-rupee", tone: "indigo" },
      { label: "Approved payout", value: formatINR(totalApprovedAmount), icon: "bi-graph-up", tone: "teal" },
    ];

    return (
      <>
        <header className="claims-hero">
          <div>
            <p className="claims-hero__kicker">Claims center</p>
            <h3>My insurance claims</h3>
            <p>Monitor every submission, approval, and payout in real time.</p>
          </div>
          <button type="button" className="claims-btn claims-btn--primary" onClick={() => setActiveTab("newClaim")}>
            <i className="bi bi-plus-circle" aria-hidden="true"></i>
            Submit new claim
          </button>
        </header>

        <div className="claims-stats-grid">
          {statCards.map((card) => (
            <article key={card.label} className={`claims-stat claims-stat--${card.tone}`}>
              <div className="claims-stat__icon">
                <i className={`bi ${card.icon}`} aria-hidden="true"></i>
              </div>
              <div>
                <p>{card.label}</p>
                <strong>{card.value}</strong>
              </div>
            </article>
          ))}
        </div>

        <div className="claims-card claims-card--filters">
          <div className="claims-card__header">
            <div>
              <p className="claims-card__eyebrow">Filters & search</p>
              <h5>Focus the claim history</h5>
            </div>
            <button
              type="button"
              className="claims-btn claims-btn--ghost"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setSortBy("newest");
              }}
            >
              <i className="bi bi-arrow-counterclockwise" aria-hidden="true"></i>
              Reset
            </button>
          </div>
          <div className="claims-filter-grid">
            <label className="claims-field">
              <span className="claims-label">Search</span>
              <div className="claims-input claims-input--icon">
                <i className="bi bi-search" aria-hidden="true"></i>
                <input
                  type="text"
                  className="claims-input__control"
                  placeholder="Search by ID, type, or description"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </label>
            <label className="claims-field">
              <span className="claims-label">Status</span>
              <select className="claims-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </label>
            <label className="claims-field">
              <span className="claims-label">Sort by</span>
              <select className="claims-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="amount-high">Amount: high to low</option>
                <option value="amount-low">Amount: low to high</option>
              </select>
            </label>
          </div>
        </div>

        <div className="claims-card claims-card--table">
          <div className="claims-card__header">
            <div>
              <p className="claims-card__eyebrow">History</p>
              <h5>Claims history</h5>
            </div>
            <span className="claims-card__meta">
              Showing {filteredAndSortedClaims.length} of {claims.length} claims
            </span>
          </div>
          {loading ? (
            <div className="claims-skeleton-wrapper">
              <SkeletonTable rows={5} columns={6} />
            </div>
          ) : filteredAndSortedClaims.length === 0 ? (
            <div className="claims-state claims-state--empty">
              <i className="bi bi-wallet2" aria-hidden="true"></i>
              <h5>No claims found</h5>
              <p>
                {claims.length === 0
                  ? "You haven't submitted any claims yet."
                  : "No claims match your current filters."}
              </p>
              {claims.length === 0 && (
                <button type="button" className="claims-btn claims-btn--primary" onClick={() => setActiveTab("newClaim")}>
                  <i className="bi bi-plus-circle" aria-hidden="true"></i>
                  Submit your first claim
                </button>
              )}
            </div>
          ) : (
            <div className="claims-table__wrapper">
              <table className="claims-table">
                <thead>
                  <tr>
                    <th>Claim ID</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Submitted</th>
                    <th>Status</th>
                    <th>Remarks</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedClaims.map((claim) => (
                    <tr key={claim.id}>
                      <td>
                        <span className="claims-id">#{claim.id}</span>
                      </td>
                      <td>
                        <div className="claims-type">
                          <span className="claims-type__icon">
                            <i className={`bi ${claim.typeIcon}`} aria-hidden="true"></i>
                          </span>
                          <span>{claim.title}</span>
                        </div>
                      </td>
                      <td>
                        <span className="claims-description" title={claim.description}>
                          {claim.description}
                        </span>
                      </td>
                      <td>
                        <span className="claims-amount">{claim.formattedAmount}</span>
                      </td>
                      <td>
                        <span className="claims-date">
                          {new Date(claim.createdAt).toLocaleDateString('en-IN')}
                        </span>
                      </td>
                      <td>
                        <span className={`claims-status-pill claims-status-pill--${claim.statusColor}`}>
                          <i className={`bi ${claim.statusIcon}`} aria-hidden="true"></i>
                          {claim.status}
                        </span>
                      </td>
                      <td>
                        <span className="claims-remarks" title={claim.remarks || ''}>
                          {(claim.remarks || '').length > 40
                            ? `${(claim.remarks || '').substring(0, 40)}...`
                            : (claim.remarks || 'No remarks yet')}
                        </span>
                      </td>
                      <td>
                        <div className="claims-row-actions">
                          <button type="button" className="claims-icon-btn" onClick={() => setViewingClaim(claim)} title="View details">
                            <i className="bi bi-eye" aria-hidden="true"></i>
                          </button>
                          {claim.status === "Pending" && (
                            <button
                              type="button"
                              className="claims-icon-btn"
                              onClick={() => {
                                setNewClaim({
                                  id: claim.id,
                                  type: claim.title,
                                  amount: claim.amount,
                                  date: claim.claimDate?.split("T")[0] || "",
                                  description: claim.description,
                                  documents: [],
                                  existingDocuments: claim.documents || [],
                                  policyId: claim.policyId,
                                });
                                setSelectedPolicyId(String(claim.policyId));
                                setActiveTab("newClaim");
                              }}
                              title="Edit claim"
                            >
                              <i className="bi bi-pencil" aria-hidden="true"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {viewingClaim && (
          <div className="claims-modal" role="dialog" aria-modal="true">
            <div className="claims-modal__panel">
              <header className="claims-modal__header">
                <div>
                  <p className="claims-modal__eyebrow">Claim #{viewingClaim.id}</p>
                  <h4>{viewingClaim.title}</h4>
                </div>
                <button
                  type="button"
                  className="claims-icon-btn claims-icon-btn--ghost"
                  onClick={() => setViewingClaim(null)}
                  aria-label="Close"
                >
                  <i className="bi bi-x-lg" aria-hidden="true"></i>
                </button>
              </header>

              <div className="claims-modal__body">
                <div className="claims-modal__grid">
                  <div>
                    <p className="claims-label">Amount</p>
                    <p className="claims-modal__value claims-modal__value--success">{viewingClaim.formattedAmount}</p>
                  </div>
                  <div>
                    <p className="claims-label">Submitted on</p>
                    <p className="claims-modal__value">
                      {new Date(viewingClaim.createdAt).toLocaleDateString('en-IN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="claims-label">Status</p>
                    <span className={`claims-status-pill claims-status-pill--${viewingClaim.statusColor}`}>
                      <i className={`bi ${viewingClaim.statusIcon}`} aria-hidden="true"></i>
                      {viewingClaim.status}
                    </span>
                  </div>
                  <div>
                    <p className="claims-label">Policy</p>
                    <p className="claims-modal__value">
                      {viewingClaim.policyId ? `#${viewingClaim.policyId}` : "Not linked to any policy"}
                    </p>
                  </div>
                  <div>
                    <p className="claims-label">Last updated</p>
                    <p className="claims-modal__value">
                      {new Date(viewingClaim.updatedAt || viewingClaim.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>

                <section>
                  <p className="claims-label">Description</p>
                  <p className="claims-modal__value claims-modal__value--muted">{viewingClaim.description}</p>
                </section>

                <section>
                  <p className="claims-label">HR remarks</p>
                  <div className="claims-remarks-box">
                    {viewingClaim.remarks || "No remarks provided yet."}
                  </div>
                </section>

                <section>
                  <p className="claims-label">Supporting documents</p>
                  {viewingClaim.documents && viewingClaim.documents.length > 0 ? (
                    <ul className="claims-documents">
                      {viewingClaim.documents.map((doc, index) => (
                        <li key={`${doc}-${index}`}>
                          <div>
                            <i className="bi bi-file-earmark" aria-hidden="true"></i>
                            <span>{doc.split('/').pop()}</span>
                          </div>
                          <a
                            href={`${API_BASE_URL}${doc}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="claims-link"
                          >
                            Download
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="claims-modal__value claims-modal__value--muted">No documents uploaded</p>
                  )}
                </section>
              </div>

              <footer className="claims-modal__footer">
                <button type="button" className="claims-btn claims-btn--ghost" onClick={() => setViewingClaim(null)}>
                  Close
                </button>
              </footer>
            </div>
          </div>
        )}
      </>
    );
  };

  // ------------------ New claim form ------------------
  const renderNewClaimForm = () => {
    const isEditMode = !!newClaim.id;

    let remainingCoverage = 0;
    if (selectedPolicyId) {
      const policy = policies.find((p) => Number(p.id) === Number(selectedPolicyId));
      if (policy) {
        const approvedClaims = claims.filter(
          (claim) => Number(claim.policyId) === policy.id && claim.status === "Approved"
        );
        const totalClaimed = approvedClaims.reduce(
          (sum, claim) => sum + (Number(claim.amount) || 0),
          0
        );
        remainingCoverage = (policy.coverageAmount || 0) - totalClaimed;
      }
    }

    const isSubmitDisabled = newClaim.amount > remainingCoverage || submitting;

    return (
      <>
        <header className="claims-hero claims-hero--form">
          <div>
            <p className="claims-hero__kicker">Claims center</p>
            <h3>{isEditMode ? "Edit claim" : "Submit new claim"}</h3>
            <p>
              {isEditMode
                ? "Update every field below before resubmitting to HR."
                : "Provide detailed information so HR can fast-track approval."}
            </p>
          </div>
          <button type="button" className="claims-btn claims-btn--ghost" onClick={() => setActiveTab("claims")}>
            <i className="bi bi-arrow-left" aria-hidden="true"></i>
            Back to claims
          </button>
        </header>

        <div className="claims-card claims-form-card">
          <div className="claims-card__header">
            <div>
              <p className="claims-card__eyebrow">Claim information</p>
              <h5>Policy & incident details</h5>
            </div>
          </div>

          <form className="claims-form" onSubmit={handleClaimSubmit}>
            <div className="claims-form__grid">
              <div className="claims-field">
                <label htmlFor="policySelect" className="claims-label">
                  Select policy <span>*</span>
                </label>
                <select
                  id="policySelect"
                  className="claims-select"
                  value={selectedPolicyId}
                  onChange={(e) => {
                    const policyId = e.target.value;
                    setSelectedPolicyId(policyId);
                    setNewClaim((prev) => ({ ...prev, policyId }));
                  }}
                  required
                >
                  <option value="">Choose a policy...</option>
                  {policies.map((policy) => {
                    const approvedClaims = claims.filter(
                      (claim) => Number(claim.policyId) === Number(policy.id) && claim.status === "Approved"
                    );
                    const totalClaimed = approvedClaims.reduce(
                      (sum, claim) => sum + (parseFloat(claim.amount) || 0),
                      0
                    );
                    const remainingAmount = (policy.coverageAmount || 0) - totalClaimed;

                    return (
                      <option key={policy.id} value={String(policy.id)}>
                        {policy.name} — {formatINR(remainingAmount)} remaining
                      </option>
                    );
                  })}
                </select>
                {selectedPolicyId && (
                  <p className="claims-helper">
                    Remaining coverage: {formatINR(Math.max(remainingCoverage, 0))}
                  </p>
                )}
              </div>

              <div className="claims-field">
                <label htmlFor="claimType" className="claims-label">
                  Claim type <span>*</span>
                </label>
                <select
                  id="claimType"
                  className="claims-select"
                  value={newClaim.type}
                  onChange={(e) => setNewClaim((prev) => ({ ...prev, type: e.target.value }))}
                  required
                >
                  <option value="">Select claim type...</option>
                  <option value="Health">Health Insurance</option>
                  <option value="Dental">Dental Insurance</option>
                  <option value="Vision">Vision Insurance</option>
                  <option value="Accident">Accident Insurance</option>
                  <option value="Life">Life Insurance</option>
                </select>
              </div>

              <div className="claims-field">
                <label htmlFor="claimAmount" className="claims-label">
                  Claim amount <span>*</span>
                </label>
                <div className="claims-input claims-input--icon">
                  <i className="bi bi-currency-rupee" aria-hidden="true"></i>
                  <input
                    type="number"
                    id="claimAmount"
                    className="claims-input__control"
                    value={newClaim.amount || ""}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setNewClaim((prev) => ({ ...prev, amount: value }));
                    }}
                    min="0"
                    step="1"
                    placeholder="Enter amount"
                    required
                  />
                </div>
                {newClaim.amount > remainingCoverage && (
                  <p className="claims-helper claims-helper--error">
                    Entered amount exceeds remaining coverage ({formatINR(Math.max(remainingCoverage, 0))}).
                  </p>
                )}
              </div>

              <div className="claims-field">
                <label htmlFor="claimDate" className="claims-label">
                  Incident / service date <span>*</span>
                </label>
                <input
                  type="date"
                  id="claimDate"
                  className="claims-input__control"
                  value={newClaim.date}
                  onChange={(e) => setNewClaim((prev) => ({ ...prev, date: e.target.value }))}
                  max={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>

              <div className="claims-field claims-field--full">
                <label htmlFor="claimDescription" className="claims-label">
                  Description <span>*</span>
                </label>
                <textarea
                  id="claimDescription"
                  rows="4"
                  className="claims-textarea"
                  value={newClaim.description}
                  onChange={(e) => setNewClaim((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Provide a detailed account of the incident, services received, and supporting context."
                  required
                />
                <p className="claims-helper">Detailed notes help HR validate the claim faster.</p>
              </div>

              <div className="claims-field claims-field--full">
                <label className="claims-label">Supporting documents</label>

                {Object.keys(fileUploadProgress).length > 0 && (
                  <div className="claims-upload__progress-list">
                    {Object.entries(fileUploadProgress).map(([filename, progress]) => (
                      <div key={filename} className="claims-upload__progress">
                        <div className="claims-upload__progress-head">
                          <small>{filename}</small>
                          <small>{progress}%</small>
                        </div>
                        <div className="claims-upload__progress-bar">
                          <span style={{ width: `${progress}%` }}></span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {newClaim.existingDocuments?.length > 0 && (
                  <div className="claims-upload__list">
                    {newClaim.existingDocuments.map((doc, index) => (
                      <div key={`${doc}-${index}`} className="claims-upload__item">
                        <div>
                          <i className="bi bi-file-earmark" aria-hidden="true"></i>
                          <span>{doc.split("/").pop()}</span>
                        </div>
                        <div className="claims-upload__actions">
                          <a
                            href={`${API_BASE_URL}${doc}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="claims-icon-btn"
                            title="View document"
                          >
                            <i className="bi bi-eye" aria-hidden="true"></i>
                          </a>
                          <button
                            type="button"
                            className="claims-icon-btn"
                            onClick={() => handleRemoveExistingDocument(index)}
                            title="Remove document"
                          >
                            <i className="bi bi-trash" aria-hidden="true"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {newClaim.documents?.length > 0 && (
                  <div className="claims-upload__list">
                    {newClaim.documents.map((file, index) => (
                      <div key={`${file.name}-${index}`} className="claims-upload__item">
                        <div>
                          <i className="bi bi-file-earmark-plus" aria-hidden="true"></i>
                          <span>{file.name}</span>
                        </div>
                        <button
                          type="button"
                          className="claims-icon-btn"
                          onClick={() => handleRemoveNewDocument(index)}
                          title="Remove document"
                        >
                          <i className="bi bi-trash" aria-hidden="true"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="claims-upload__dropzone">
                  <input
                    type="file"
                    className="claims-file-input"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleDocumentUpload}
                  />
                  <div>
                    <i className="bi bi-cloud-upload" aria-hidden="true"></i>
                    <p>Upload receipts, prescriptions, bills, or forms. Max 10MB per file.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="claims-actions">
              <button type="button" className="claims-btn claims-btn--ghost" onClick={() => setActiveTab("claims")}>
                Cancel
              </button>
              <button type="submit" className="claims-btn claims-btn--success" disabled={isSubmitDisabled}>
                {submitting ? (
                  <>
                    <span className="claims-spinner claims-spinner--inline" aria-hidden="true"></span>
                    {isEditMode ? "Updating..." : "Submitting..."}
                  </>
                ) : (
                  <>
                    <i className={`bi ${isEditMode ? "bi-check-circle" : "bi-send"}`} aria-hidden="true"></i>
                    {isEditMode ? "Update claim" : "Submit claim"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </>
    );
  };

  return (
    <section className="employee-claims">
      {activeTab === "newClaim" ? renderNewClaimForm() : renderClaimsList()}
    </section>
  );
}