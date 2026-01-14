import React, { useState, useMemo } from "react";

export default function HREmployees({
  employees,
  searchName,
  setSearchName,
  policyFilter,
  setPolicyFilter,
  filteredEmployees,
  handleView,
  showModal,
  selectedEmployee,
  handleCloseModal
}) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Enhanced statistics - Only employee relevant data
  const employeeStats = useMemo(() => {
    const total = employees.length;
    const active = employees.filter(emp => emp.active).length;
    const inactive = total - active;

    return { total, active, inactive };
  }, [employees]);

  // Sort employees
  const sortedEmployees = useMemo(() => {
    let sorted = [...filteredEmployees];
    
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === 'name' || sortConfig.key === 'email') {
          aValue = aValue?.toLowerCase();
          bValue = bValue?.toLowerCase();
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return sorted;
  }, [filteredEmployees, sortConfig]);

  // Handle sort
  const handleSort = (key) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Sort indicator
  const SortIndicator = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <i className="bi bi-arrow-down-up ms-1" style={{ opacity: 0.4 }}></i>;
    return sortConfig.direction === 'asc' ? 
      <i className="bi bi-arrow-up ms-1" style={{ color: 'var(--hr-primary)' }}></i> : 
      <i className="bi bi-arrow-down ms-1" style={{ color: 'var(--hr-primary)' }}></i>;
  };

  return (
    <div className="hr-employees-page">
      {/* Page Header */}
      <div className="hr-page-header">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <h1 className="hr-page-title">Employee Management</h1>
            <p className="hr-page-subtitle">View and manage employee information</p>
          </div>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="hr-stats-grid hr-stats-grid--3" style={{ marginBottom: '24px' }}>
        <div className="hr-stat-card hr-stat-card--primary">
          <div className="hr-stat-header">
            <div className="hr-stat-icon hr-stat-icon--primary">
              <i className="bi bi-people-fill"></i>
            </div>
          </div>
          <div className="hr-stat-value">{employeeStats.total}</div>
          <div className="hr-stat-label">Total Employees</div>
        </div>
        
        <div className="hr-stat-card hr-stat-card--success">
          <div className="hr-stat-header">
            <div className="hr-stat-icon hr-stat-icon--success">
              <i className="bi bi-check-circle"></i>
            </div>
          </div>
          <div className="hr-stat-value">{employeeStats.active}</div>
          <div className="hr-stat-label">Active Employees</div>
        </div>
        
        <div className="hr-stat-card hr-stat-card--warning">
          <div className="hr-stat-header">
            <div className="hr-stat-icon hr-stat-icon--warning">
              <i className="bi bi-person-x"></i>
            </div>
          </div>
          <div className="hr-stat-value">{employeeStats.inactive}</div>
          <div className="hr-stat-label">Inactive Employees</div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="hr-card" style={{ marginBottom: '24px' }}>
        <div className="hr-card-body">
          <div className="row g-3 align-items-center">
            {/* Search */}
            <div className="col-md-6">
              <div className="hr-search-wrapper" style={{ maxWidth: '100%' }}>
                <i className="bi bi-search hr-search-icon"></i>
                <input
                  type="text"
                  className="hr-search-input"
                  placeholder="Search employees by name or email..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="col-md-4">
              <select
                className="hr-select"
                value={policyFilter}
                onChange={(e) => setPolicyFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="EMPLOYEE">Active Employees</option>
                <option value="INACTIVE">Inactive Employees</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="col-md-2">
              <button
                className="hr-btn hr-btn--outline w-100"
                onClick={() => {
                  setSearchName("");
                  setPolicyFilter("");
                }}
              >
                <i className="bi bi-x-circle me-1"></i>Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="hr-card">
        <div className="hr-card-header">
          <h3 className="hr-card-title">
            <i className="bi bi-people"></i>
            Employees List
          </h3>
          <span className="hr-badge hr-badge--primary">
            {sortedEmployees.length} employees found
          </span>
        </div>
        <div className="hr-card-body" style={{ padding: 0 }}>
          <div className="hr-table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="hr-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('employeeId')} style={{ cursor: 'pointer' }}>
                    Employee ID <SortIndicator columnKey="employeeId" />
                  </th>
                  <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                    Name <SortIndicator columnKey="name" />
                  </th>
                  <th onClick={() => handleSort('email')} style={{ cursor: 'pointer' }}>
                    Email <SortIndicator columnKey="email" />
                  </th>
                  <th>Status</th>
                  <th style={{ width: '100px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedEmployees.length === 0 ? (
                  <tr>
                    <td colSpan="5">
                      <div className="hr-empty-state">
                        <div className="hr-empty-state__icon">
                          <i className="bi bi-people"></i>
                        </div>
                        <h4 className="hr-empty-state__title">No Employees Found</h4>
                        <p className="hr-empty-state__desc">
                          {employees.length === 0 ? "No employees found" : "No employees match your search criteria"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedEmployees.map((employee) => (
                    <tr key={employee.id}>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--hr-primary)' }}>{employee.employeeId}</span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="hr-stat-icon hr-stat-icon--primary" style={{ width: 36, height: 36, fontSize: '0.9rem' }}>
                            <i className="bi bi-person"></i>
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{employee.name}</div>
                            <small style={{ color: 'var(--hr-text-muted)' }}>Employee</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ color: 'var(--hr-text-muted)' }} title={employee.email}>
                          {employee.email?.length > 30 ? employee.email.substring(0, 30) + '...' : employee.email}
                        </span>
                      </td>
                      <td>
                        <span className={`hr-badge hr-badge--${employee.active ? 'success' : 'neutral'}`}>
                          <i className={`bi ${employee.active ? 'bi-check-circle' : 'bi-x-circle'} me-1`}></i>
                          {employee.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <button
                          className="hr-btn hr-btn--primary hr-btn--sm"
                          onClick={() => handleView(employee)}
                          title="View employee details"
                        >
                          <i className="bi bi-eye me-1"></i> View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Employee Details Modal */}
      {showModal && selectedEmployee && (
        <div className="hr-modal-backdrop" onClick={handleCloseModal}>
          <div className="hr-modal hr-modal--lg" onClick={(e) => e.stopPropagation()}>
            <div className="hr-modal-header">
              <h3 className="hr-modal-title">
                <i className="bi bi-person-circle me-2"></i>
                Employee Details
              </h3>
              <button type="button" className="hr-modal-close" onClick={handleCloseModal}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="hr-modal-body">
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="hr-info-card">
                    <h6 className="hr-info-card__title">
                      <i className="bi bi-person-badge me-2"></i>
                      Employee Information
                    </h6>
                    <div className="hr-info-card__body">
                      <div className="hr-detail-group">
                        <label className="hr-detail-label">Employee ID</label>
                        <p className="hr-detail-value" style={{ color: 'var(--hr-primary)', fontWeight: 600 }}>
                          {selectedEmployee.employeeId}
                        </p>
                      </div>
                      <div className="hr-detail-group">
                        <label className="hr-detail-label">Full Name</label>
                        <p className="hr-detail-value">{selectedEmployee.name}</p>
                      </div>
                      <div className="hr-detail-group">
                        <label className="hr-detail-label">Email Address</label>
                        <p className="hr-detail-value">{selectedEmployee.email}</p>
                      </div>
                      <div className="hr-detail-group" style={{ marginBottom: 0 }}>
                        <label className="hr-detail-label">Account Status</label>
                        <p className="hr-detail-value">
                          <span className={`hr-badge hr-badge--${selectedEmployee.active ? 'success' : 'neutral'}`}>
                            {selectedEmployee.active ? "Active" : "Inactive"}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="hr-info-card">
                    <h6 className="hr-info-card__title">
                      <i className="bi bi-briefcase me-2"></i>
                      Employment Details
                    </h6>
                    <div className="hr-info-card__body">
                      <div className="hr-detail-group">
                        <label className="hr-detail-label">Employee Role</label>
                        <p className="hr-detail-value">Employee</p>
                      </div>
                      <div className="hr-detail-group">
                        <label className="hr-detail-label">Member Since</label>
                        <p className="hr-detail-value">
                          {selectedEmployee.joinDate ? 
                            new Date(selectedEmployee.joinDate).toLocaleDateString('en-IN') : 
                            "Information not available"
                          }
                        </p>
                      </div>
                      <div className="hr-detail-group" style={{ marginBottom: 0 }}>
                        <label className="hr-detail-label">Last Activity</label>
                        <p className="hr-detail-value">
                          {selectedEmployee.lastActive || "Recently active"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Insurance Information Section */}
              <div className="hr-info-card" style={{ marginTop: '24px' }}>
                <h6 className="hr-info-card__title">
                  <i className="bi bi-shield-check me-2"></i>
                  Insurance Coverage
                </h6>
                <div className="hr-info-card__body">
                  <div className="hr-alert hr-alert--info">
                    <i className="bi bi-info-circle hr-alert__icon"></i>
                    <div className="hr-alert__content">
                      <div className="hr-alert__title">Policy Information</div>
                      <div className="hr-alert__desc">Employee insurance policy details can be viewed in the Policies section.</div>
                    </div>
                  </div>
                  <div className="text-center" style={{ marginTop: '16px' }}>
                    <button className="hr-btn hr-btn--outline">
                      <i className="bi bi-shield-check me-2"></i>
                      View Policy Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="hr-modal-footer">
              <button className="hr-btn hr-btn--secondary" onClick={handleCloseModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .hr-employees-page .hr-stats-grid--3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        
        @media (max-width: 768px) {
          .hr-employees-page .hr-stats-grid--3 {
            grid-template-columns: 1fr;
          }
        }
        
        /* Modal Large */
        .hr-modal--lg {
          max-width: 800px;
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
        
        /* Info Card */
        .hr-info-card {
          background: var(--hr-subtle, #f1f5f9);
          border-radius: var(--hr-radius, 10px);
          overflow: hidden;
        }
        
        .hr-info-card__title {
          padding: 16px 20px;
          margin: 0;
          background: rgba(13, 148, 136, 0.08);
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--hr-primary, #0d9488);
          border-bottom: 1px solid var(--hr-border, #e2e8f0);
        }
        
        .hr-info-card__body {
          padding: 20px;
        }
        
        .hr-detail-group {
          margin-bottom: 16px;
        }
        
        .hr-detail-label {
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--hr-text-muted, #64748b);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 4px;
        }
        
        .hr-detail-value {
          margin: 0;
          font-size: 1rem;
          color: var(--hr-text, #0f172a);
        }
      `}</style>
    </div>
  );
}