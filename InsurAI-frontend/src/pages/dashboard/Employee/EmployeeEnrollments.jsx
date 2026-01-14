// src/pages/dashboard/Employee/EmployeeEnrollments.jsx
import React, { useState, useEffect, useMemo } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import API from "../../../api";
import "./EmployeeTheme.css";
import "./EmployeeNewFeatures.css";

export default function EmployeeEnrollments({ policies = [], showNotificationAlert }) {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState("list"); // list, new, details
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // New enrollment form state
  const [newEnrollment, setNewEnrollment] = useState({
    policyId: "",
    coverageType: "INDIVIDUAL",
    requestReason: "",
    dependents: []
  });

  // Dependent form state
  const [newDependent, setNewDependent] = useState({
    name: "",
    relationship: "",
    dateOfBirth: ""
  });

  // Fetch enrollments on mount
  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const response = await API.get("/employee/enrollments/my");
      setEnrollments(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      showNotificationAlert?.("Failed to fetch enrollments", "error");
    } finally {
      setLoading(false);
    }
  };

  // Statistics
  const stats = useMemo(() => {
    const total = enrollments.length;
    const pending = enrollments.filter(e => e.status === "PENDING").length;
    const approved = enrollments.filter(e => e.status === "APPROVED").length;
    const rejected = enrollments.filter(e => e.status === "REJECTED").length;
    return { total, pending, approved, rejected };
  }, [enrollments]);

  // Filtered enrollments
  const filteredEnrollments = useMemo(() => {
    return enrollments.filter(enrollment => {
      const matchesSearch =
        enrollment.policyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enrollment.coverageType?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || enrollment.status === statusFilter.toUpperCase();
      return matchesSearch && matchesStatus;
    });
  }, [enrollments, searchTerm, statusFilter]);

  // Handle enrollment request
  const handleSubmitEnrollment = async (e) => {
    e.preventDefault();
    if (!newEnrollment.policyId) {
      showNotificationAlert?.("Please select a policy", "error");
      return;
    }

    setLoading(true);
    try {
      await API.post("/employee/enrollments/request", newEnrollment);
      showNotificationAlert?.("Enrollment request submitted successfully!", "success");
      setNewEnrollment({
        policyId: "",
        coverageType: "INDIVIDUAL",
        requestReason: "",
        dependents: []
      });
      setActiveView("list");
      fetchEnrollments();
    } catch (error) {
      console.error("Error submitting enrollment:", error);
      showNotificationAlert?.("Failed to submit enrollment request", "error");
    } finally {
      setLoading(false);
    }
  };

  // Add dependent
  const handleAddDependent = () => {
    if (!newDependent.name || !newDependent.relationship || !newDependent.dateOfBirth) {
      showNotificationAlert?.("Please fill all dependent fields", "error");
      return;
    }
    setNewEnrollment(prev => ({
      ...prev,
      dependents: [...prev.dependents, { ...newDependent }]
    }));
    setNewDependent({ name: "", relationship: "", dateOfBirth: "" });
  };

  // Remove dependent
  const handleRemoveDependent = (index) => {
    setNewEnrollment(prev => ({
      ...prev,
      dependents: prev.dependents.filter((_, i) => i !== index)
    }));
  };

  // View enrollment details
  const handleViewDetails = async (enrollment) => {
    try {
      const response = await API.get(`/employee/enrollments/${enrollment.id}`);
      setSelectedEnrollment(response.data);
      setActiveView("details");
    } catch (error) {
      console.error("Error fetching enrollment details:", error);
      showNotificationAlert?.("Failed to fetch enrollment details", "error");
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status?.toUpperCase()) {
      case "APPROVED": return "emp-badge--success";
      case "PENDING": return "emp-badge--warning";
      case "REJECTED": return "emp-badge--danger";
      default: return "emp-badge--secondary";
    }
  };

  // Render statistics cards
  const renderStatsCards = () => (
    <div className="row g-3 mb-4">
      <div className="col-6 col-md-3">
        <div className="emp-stat-card">
          <div className="emp-stat-card__icon emp-stat-card__icon--primary">
            <i className="bi bi-folder2-open"></i>
          </div>
          <div className="emp-stat-card__content">
            <span className="emp-stat-card__label">Total Enrollments</span>
            <strong className="emp-stat-card__value">{stats.total}</strong>
          </div>
        </div>
      </div>
      <div className="col-6 col-md-3">
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
      <div className="col-6 col-md-3">
        <div className="emp-stat-card">
          <div className="emp-stat-card__icon emp-stat-card__icon--success">
            <i className="bi bi-check-circle"></i>
          </div>
          <div className="emp-stat-card__content">
            <span className="emp-stat-card__label">Approved</span>
            <strong className="emp-stat-card__value">{stats.approved}</strong>
          </div>
        </div>
      </div>
      <div className="col-6 col-md-3">
        <div className="emp-stat-card">
          <div className="emp-stat-card__icon emp-stat-card__icon--danger">
            <i className="bi bi-x-circle"></i>
          </div>
          <div className="emp-stat-card__content">
            <span className="emp-stat-card__label">Rejected</span>
            <strong className="emp-stat-card__value">{stats.rejected}</strong>
          </div>
        </div>
      </div>
    </div>
  );

  // Render enrollments list
  const renderEnrollmentsList = () => {
    const plusIconSize = (typeof window !== "undefined" && getComputedStyle(document.documentElement).getPropertyValue('--emp-plus-icon-size'))?.trim() || '2rem';

    return (
      <div className="emp-card">
      <div className="emp-card-header d-flex justify-content-between align-items-center flex-wrap gap-3">
        <h3 className="emp-card-title mb-0">
        <i className="bi bi-card-list me-2"></i>
        My Enrollments
        </h3>
        <button
        className="emp-btn emp-btn--primary"
        onClick={() => setActiveView("new")}
        >
        <i className="bi bi-plus me-2" style={{ fontSize: plusIconSize }}></i>
        Request Enrollment
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
            placeholder="Search enrollments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            />
            </div>
          </div>
          <div className="col-md-4">
            <select
            className="emp-form-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="col-md-2">
            <button
            className="emp-btn emp-btn--outline w-100"
            style={{ marginTop: '-2px' }}
            onClick={fetchEnrollments}
            >
            <i className="bi bi-arrow-clockwise"></i>
            </button>
          </div>
          </div>

          {/* Enrollments Table */}
        {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
          </div>
        </div>
        ) : filteredEnrollments.length > 0 ? (
        <div className="table-responsive">
          <table className="emp-table">
          <thead>
            <tr>
            <th>Policy Name</th>
            <th>Coverage Type</th>
            <th>Enrollment Date</th>
            <th>Effective Date</th>
            <th>Status</th>
            <th>Dependents</th>
            <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEnrollments.map((enrollment) => (
            <tr key={enrollment.id}>
              <td>
              <strong>{enrollment.policyName || "N/A"}</strong>
              </td>
              <td>{enrollment.coverageType || "Individual"}</td>
              <td>{enrollment.enrollmentDate ? new Date(enrollment.enrollmentDate).toLocaleDateString() : "N/A"}</td>
              <td>{enrollment.effectiveDate ? new Date(enrollment.effectiveDate).toLocaleDateString() : "-"}</td>
              <td>
              <span className={`emp-badge ${getStatusBadgeClass(enrollment.status)}`}>
                {enrollment.status || "Unknown"}
              </span>
              </td>
              <td>
              <span className="emp-badge emp-badge--info">
                {enrollment.dependentCount || 0}
              </span>
              </td>
              <td>
              <button
                className="emp-btn emp-btn--outline emp-btn--sm"
                style={{ marginTop: '-5px' }}
                onClick={() => handleViewDetails(enrollment)}
              >
                <i className="bi bi-eye me-1"></i>View
              </button>
              </td>
            </tr>
            ))}
          </tbody>
          </table>
        </div>
        ) : (
        <div className="emp-empty-state">
          <div className="emp-empty-state__icon">
          <i className="bi bi-folder2-open"></i>
          </div>
          <h4 className="emp-empty-state__title">No Enrollments Found</h4>
          <p className="emp-empty-state__desc">
          {searchTerm || statusFilter !== "all"
            ? "No enrollments match your search criteria."
            : "You haven't made any enrollment requests yet."}
          </p>
        </div>
        )}
      </div>
      </div>
    );
  };

  // Render new enrollment form
  const renderNewEnrollmentForm = () => (
    <div className="emp-card">
      <div className="emp-card-header d-flex justify-content-between align-items-center">
        <h3 className="emp-card-title mb-0">
          <i className="bi bi-plus-circle me-2"></i>
          Request Policy Enrollment
        </h3>
        <button
          className="emp-btn emp-btn--outline"
          onClick={() => setActiveView("list")}
        >
          <i className="bi bi-arrow-left me-2"></i>Back
        </button>
      </div>
      <div className="emp-card-body">
        <form onSubmit={handleSubmitEnrollment}>
          <div className="row g-4">
            {/* Policy Selection */}
            <div className="col-md-6">
              <label className="emp-form-label">
                <i className="bi bi-shield-check me-2"></i>
                Select Policy *
              </label>
              <select
                className="emp-form-control"
                value={newEnrollment.policyId}
                onChange={(e) => setNewEnrollment(prev => ({ ...prev, policyId: e.target.value }))}
                required
              >
                <option value="">Choose a policy...</option>
                {policies.map(policy => (
                  <option key={policy.id} value={policy.id}>
                    {policy.policyName || policy.name} - ₹{(policy.coverageAmount || 0).toLocaleString('en-IN')}
                  </option>
                ))}
              </select>
            </div>

            {/* Coverage Type */}
            <div className="col-md-6">
              <label className="emp-form-label">
                <i className="bi bi-people me-2"></i>
                Coverage Type *
              </label>
              <select
                className="emp-form-control"
                value={newEnrollment.coverageType}
                onChange={(e) => setNewEnrollment(prev => ({ ...prev, coverageType: e.target.value }))}
                required
              >
                <option value="INDIVIDUAL">Individual</option>
                <option value="FAMILY">Family</option>
                <option value="FAMILY_FLOATER">Family Floater</option>
              </select>
            </div>

            {/* Request Reason */}
            <div className="col-12">
              <label className="emp-form-label">
                <i className="bi bi-chat-text me-2"></i>
                Reason for Enrollment
              </label>
              <textarea
                className="emp-form-control"
                rows="3"
                placeholder="Describe why you need this policy (e.g., new family addition, additional coverage)..."
                value={newEnrollment.requestReason}
                onChange={(e) => setNewEnrollment(prev => ({ ...prev, requestReason: e.target.value }))}
              ></textarea>
            </div>

            {/* Dependents Section */}
                  {(newEnrollment.coverageType === "FAMILY" || newEnrollment.coverageType === "FAMILY_FLOATER") && (
                    <div className="col-12">
                    <div className="emp-card" style={{ background: 'var(--emp-subtle)', border: '1px dashed var(--emp-border)' }}>
                      <div className="emp-card-header">
                      <h4 className="emp-card-title mb-0" style={{ fontSize: '1rem' }}>
                        <i className="bi bi-people-fill me-2"></i>
                        Add Dependents
                      </h4>
                      </div>
                      <div className="emp-card-body">
                      <div className="row g-3 mb-3">
                        <div className="col-md-4">
                          <label className="emp-form-label">
                            <i className="bi bi-person me-2"></i>Dependent Name *
                          </label>
                          <input
                            type="text"
                            className="emp-form-control"
                            placeholder="Enter full name"
                            value={newDependent.name}
                            onChange={(e) => setNewDependent(prev => ({ ...prev, name: e.target.value }))}
                          />
                        </div>
                        <div className="col-md-3">
                          <label className="emp-form-label">
                            <i className="bi bi-people me-2"></i>Relationship *
                          </label>
                          <select
                            className="emp-form-control"
                            value={newDependent.relationship}
                            onChange={(e) => setNewDependent(prev => ({ ...prev, relationship: e.target.value }))}
                          >
                            <option value="">Select Relationship</option>
                            <option value="Spouse">Spouse</option>
                            <option value="Child">Child</option>
                            <option value="Parent">Parent</option>
                            <option value="Sibling">Sibling</option>
                          </select>
                        </div>
                        <div className="col-md-3">
                          <label className="emp-form-label">
                            <i className="bi bi-calendar-event me-2"></i>Date of Birth *
                          </label>
                          <input
                            type="date"
                            className="emp-form-control emp-date-picker"
                            value={newDependent.dateOfBirth}
                            max={new Date().toISOString().split('T')[0]}
                            onChange={(e) => setNewDependent(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                          />
                        </div>
                        <div className="col-md-2 d-flex align-items-end">
                          <button
                            type="button"
                            className="emp-btn emp-btn--primary w-100"
                            onClick={handleAddDependent}
                            title="Add Dependent"
                          >
                            <i className="bi bi-plus-lg me-1"></i> Add
                          </button>
                        </div>
                      </div>

                      {/* Added Dependents List */}
                    {newEnrollment.dependents.length > 0 && (
                      <div className="mt-3">
                        <h6 className="text-muted mb-2">Added Dependents:</h6>
                        {newEnrollment.dependents.map((dep, index) => (
                          <div key={index} className="d-flex align-items-center justify-content-between p-2 mb-2"
                               style={{ background: 'var(--emp-surface)', borderRadius: 'var(--emp-radius-sm)' }}>
                            <div>
                              <strong>{dep.name}</strong>
                              <span className="text-muted ms-2">({dep.relationship})</span>
                              <small className="text-muted ms-2">DOB: {new Date(dep.dateOfBirth).toLocaleDateString()}</small>
                            </div>
                            <button
                              type="button"
                              className="emp-btn emp-btn--danger emp-btn--sm"
                              onClick={() => handleRemoveDependent(index)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="col-12">
              <div className="d-flex gap-3 justify-content-end">
                <button
                  type="button"
                  className="emp-btn emp-btn--outline"
                  onClick={() => setActiveView("list")}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="emp-btn emp-btn--primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send me-2"></i>
                      Submit Request
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

  // Render enrollment details
  const renderEnrollmentDetails = () => (
    <div className="emp-card">
      <div className="emp-card-header d-flex justify-content-between align-items-center">
        <h3 className="emp-card-title mb-0">
          <i className="bi bi-info-circle me-2"></i>
          Enrollment Details
        </h3>
        <button
          className="emp-btn emp-btn--outline"
          onClick={() => { setActiveView("list"); setSelectedEnrollment(null); }}
        >
          <i className="bi bi-arrow-left me-2"></i>Back
        </button>
      </div>
      <div className="emp-card-body">
        {selectedEnrollment ? (
          <div className="row g-4">
            {/* Policy Info */}
            <div className="col-md-6">
              <div className="emp-detail-group">
                <label className="emp-detail-label">Policy Name</label>
                <p className="emp-detail-value">{selectedEnrollment.policyName || "N/A"}</p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="emp-detail-group">
                <label className="emp-detail-label">Status</label>
                <span className={`emp-badge ${getStatusBadgeClass(selectedEnrollment.status)}`}>
                  {selectedEnrollment.status}
                </span>
              </div>
            </div>
            <div className="col-md-6">
              <div className="emp-detail-group">
                <label className="emp-detail-label">Coverage Type</label>
                <p className="emp-detail-value">{selectedEnrollment.coverageType || "Individual"}</p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="emp-detail-group">
                <label className="emp-detail-label">Enrollment Date</label>
                <p className="emp-detail-value">
                  {selectedEnrollment.enrollmentDate ? new Date(selectedEnrollment.enrollmentDate).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="emp-detail-group">
                <label className="emp-detail-label">Effective Date</label>
                <p className="emp-detail-value">
                  {selectedEnrollment.effectiveDate ? new Date(selectedEnrollment.effectiveDate).toLocaleDateString() : "Pending Approval"}
                </p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="emp-detail-group">
                <label className="emp-detail-label">Request Reason</label>
                <p className="emp-detail-value">{selectedEnrollment.requestReason || "Not provided"}</p>
              </div>
            </div>

            {/* Remarks */}
            {selectedEnrollment.remarks && (
              <div className="col-12">
                <div className="emp-detail-group">
                  <label className="emp-detail-label">HR Remarks</label>
                  <div className="p-3" style={{ background: 'var(--emp-subtle)', borderRadius: 'var(--emp-radius)' }}>
                    <p className="mb-0">{selectedEnrollment.remarks}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Dependents */}
            {selectedEnrollment.dependents && selectedEnrollment.dependents.length > 0 && (
              <div className="col-12">
                <div className="emp-detail-group">
                  <label className="emp-detail-label">Dependents ({selectedEnrollment.dependents.length})</label>
                  <div className="table-responsive">
                    <table className="emp-table">
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
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="emp-enrollments-page">
      {/* Page Header */}
      <div className="emp-page-header mb-4">
        <h1 className="emp-page-title">
          <i className="bi bi-card-checklist me-3"></i>
          Policy Enrollments
        </h1>
        <p className="emp-page-subtitle">
          Request and manage your policy enrollments
        </p>
      </div>

      {/* Statistics */}
      {renderStatsCards()}

      {/* Main Content */}
      {activeView === "list" && renderEnrollmentsList()}
      {activeView === "new" && renderNewEnrollmentForm()}
      {activeView === "details" && renderEnrollmentDetails()}
    </div>
  );
}

