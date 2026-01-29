import React, { useState, useMemo } from "react";
import { API_BASE_URL } from "../../../config";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import "./AdminAllClaims.css";

// Color constants - Royal Blue / Violet Theme
const COLORS = {
  PRIMARY: '#2563eb',
  PRIMARY_DARK: '#1d4ed8',
  SECONDARY: '#8b5cf6',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  DANGER: '#ef4444',
  INFO: '#06b6d4'
};

const AdminAllClaims = ({ claims = [] }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [hrFilter, setHrFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [claimsPerPage, setClaimsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'claimDate', direction: 'desc' });
  const [selectedClaims, setSelectedClaims] = useState([]);
  const [bulkAction, setBulkAction] = useState("");
  const [viewClaim, setViewClaim] = useState(null);
  const [showStats, setShowStats] = useState(true);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalClaims = claims.length;
    const approvedClaims = claims.filter(c => c.status === "Approved").length;
    const pendingClaims = claims.filter(c => c.status === "Pending").length;
    const rejectedClaims = claims.filter(c => c.status === "Rejected").length;
    
    const approvalRate = totalClaims > 0 ? (approvedClaims / totalClaims) * 100 : 0;

    // Monthly trend data
    const monthlyData = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      const key = `${month} ${year}`;
      
      const monthClaims = claims.filter(claim => {
        const claimDate = new Date(claim.claimDate);
        return claimDate.getMonth() === date.getMonth() && 
               claimDate.getFullYear() === date.getFullYear();
      });

      return {
        month: key,
        claims: monthClaims.length,
        approved: monthClaims.filter(c => c.status === "Approved").length,
        pending: monthClaims.filter(c => c.status === "Pending").length,
      };
    }).reverse();

    return {
      totalClaims,
      approvedClaims,
      pendingClaims,
      rejectedClaims,
      approvalRate,
      monthlyData
    };
  }, [claims]);

  // Status distribution for pie chart - filter out zero values to prevent chart issues
  const statusData = useMemo(() => {
    const data = [
      { name: 'Approved', value: stats.approvedClaims, color: COLORS.SUCCESS },
      { name: 'Pending', value: stats.pendingClaims, color: COLORS.WARNING },
      { name: 'Rejected', value: stats.rejectedClaims, color: COLORS.DANGER },
    ];
    // If all values are 0, return placeholder data
    const hasData = data.some(item => item.value > 0);
    return hasData ? data : [{ name: 'No Data', value: 1, color: '#e2e8f0' }];
  }, [stats]);

  // Filter and sort claims
  const filteredClaims = useMemo(() => {
    let filtered = claims.filter(claim => {
      const matchesSearch = 
        claim.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.employeeIdDisplay?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.policyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.id?.toString().includes(searchTerm);
      
      const matchesStatus = statusFilter === "All" || claim.status === statusFilter;
      const matchesHR = hrFilter === "All" || claim.assignedHrName === hrFilter;

      // Date filtering
      let matchesDate = true;
      if (dateFilter !== "All") {
        const claimDate = new Date(claim.claimDate);
        const today = new Date();
        switch (dateFilter) {
          case "Today":
            matchesDate = claimDate.toDateString() === today.toDateString();
            break;
          case "This Week":
            const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
            matchesDate = claimDate >= startOfWeek;
            break;
          case "This Month":
            matchesDate = claimDate.getMonth() === today.getMonth() && 
                         claimDate.getFullYear() === today.getFullYear();
            break;
          default:
            matchesDate = true;
        }
      }

      return matchesSearch && matchesStatus && matchesHR && matchesDate;
    });

    // Sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle date sorting
        if (sortConfig.key === 'claimDate') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [claims, searchTerm, statusFilter, dateFilter, hrFilter, sortConfig]);

  // Pagination
  const indexOfLastClaim = currentPage * claimsPerPage;
  const indexOfFirstClaim = indexOfLastClaim - claimsPerPage;
  const currentClaims = filteredClaims.slice(indexOfFirstClaim, indexOfLastClaim);
  const totalPages = Math.ceil(filteredClaims.length / claimsPerPage);

  // Get unique HRs for filter
  const uniqueHRs = useMemo(() => {
    const hrs = claims.map(claim => claim.assignedHrName).filter(Boolean);
    return [...new Set(hrs)];
  }, [claims]);

  // Handle sort
  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return "↕️";
    return sortConfig.direction === 'asc' ? "↑" : "↓";
  };

  // Selection management
  const toggleClaimSelection = (id) => {
    setSelectedClaims(prev =>
      prev.includes(id) ? prev.filter(claimId => claimId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedClaims.length === currentClaims.length) {
      setSelectedClaims([]);
    } else {
      setSelectedClaims(currentClaims.map(claim => claim.id));
    }
  };

  // Export data functionality
  const handleExportData = () => {
    const dataToExport = filteredClaims.map(claim => ({
      'Claim ID': claim.id,
      'Employee Name': claim.employeeName,
      'Employee ID': claim.employeeIdDisplay,
      'Policy Name': claim.policyName,
      'Assigned HR': claim.assignedHrName,
      'Status': claim.status,
      'Submitted Date': claim.claimDate ? new Date(claim.claimDate).toLocaleDateString() : 'N/A',
      'Remarks': claim.remarks || '-'
    }));

    // Convert to CSV
    const headers = Object.keys(dataToExport[0] || {});
    const csvContent = [
      headers.join(','),
      ...dataToExport.map(row => 
        headers.map(header => `"${row[header] || ''}"`).join(',')
      )
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `claims_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Bulk actions
  const handleBulkAction = async (action) => {
    if (!action || selectedClaims.length === 0) return;
    
    // Implement bulk actions here
    console.log(`Performing ${action} on claims:`, selectedClaims);
    
    // Reset selection
    setSelectedClaims([]);
    setBulkAction("");
  };

  // Quick actions
  const quickActions = [
    {
      icon: "bi-download",
      label: "Export Data",
      action: handleExportData,
      color: "success",
      description: "Export claims to CSV"
    },
    {
      icon: "bi-filter",
      label: "Toggle Stats",
      action: () => setShowStats(!showStats),
      color: "info",
      description: "Show/hide statistics"
    },
    {
      icon: "bi-arrow-clockwise",
      label: "Refresh",
      action: () => window.location.reload(),
      color: "warning",
      description: "Refresh data"
    }
  ];

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setDateFilter("All");
    setHrFilter("All");
    setCurrentPage(1);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Approved": return "bg-success";
      case "Rejected": return "bg-danger";
      case "Pending": return "bg-warning";
      default: return "bg-secondary";
    }
  };

  return (
    <div className="admin-all-claims">
      {/* Header */}
      <div className="aac-page-header">
        <div>
          <h3 className="aac-page-title">
            <i className="bi bi-clipboard-data"></i>
            Claims Management
          </h3>
          <p className="aac-page-subtitle">
            Comprehensive claims administration and analytics
          </p>
        </div>
        <div className="aac-header-actions">
          <div className="aac-total-badge">
            <i className="bi bi-file-text"></i>
            {stats.totalClaims} Total Claims
          </div>
          <button 
            className="aac-toggle-stats-btn"
            onClick={() => setShowStats(!showStats)}
          >
            <i className={`bi bi-${showStats ? 'chevron-up' : 'chevron-down'}`}></i>
            {showStats ? 'Hide Stats' : 'Show Stats'}
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="aac-quick-actions">
        {quickActions.map((action, index) => (
          <div 
            key={index} 
            className="aac-action-card"
            onClick={action.action}
          >
            <div className={`aac-action-icon ${action.color === 'success' ? 'export' : action.color === 'info' ? 'stats' : 'refresh'}`}>
              <i className={`bi ${action.icon}`}></i>
            </div>
            <div className="aac-action-content">
              <h6>{action.label}</h6>
              <small>{action.description}</small>
            </div>
          </div>
        ))}
      </div>

      {/* Statistics Dashboard */}
      {showStats && (
        <div className="aac-stats-section">
          {/* Key Metrics */}
          <div className="aac-stats-grid">
            <div className="aac-stat-card total">
              <div className="aac-stat-header">
                <div>
                  <div className="aac-stat-label">Total Claims</div>
                  <div className="aac-stat-value">{stats.totalClaims}</div>
                  <div className="aac-stat-subtext">All time claims</div>
                </div>
                <i className="bi bi-file-earmark-text aac-stat-icon"></i>
              </div>
            </div>

            <div className="aac-stat-card approved">
              <div className="aac-stat-header">
                <div>
                  <div className="aac-stat-label">Approved</div>
                  <div className="aac-stat-value">{stats.approvedClaims}</div>
                  <div className="aac-stat-subtext">{stats.approvalRate.toFixed(1)}% approval rate</div>
                </div>
                <i className="bi bi-check-circle aac-stat-icon"></i>
              </div>
            </div>

            <div className="aac-stat-card pending">
              <div className="aac-stat-header">
                <div>
                  <div className="aac-stat-label">Pending</div>
                  <div className="aac-stat-value">{stats.pendingClaims}</div>
                  <div className="aac-stat-subtext">Awaiting review</div>
                </div>
                <i className="bi bi-clock aac-stat-icon"></i>
              </div>
            </div>

            <div className="aac-stat-card rejected">
              <div className="aac-stat-header">
                <div>
                  <div className="aac-stat-label">Rejected</div>
                  <div className="aac-stat-value">{stats.rejectedClaims}</div>
                  <div className="aac-stat-subtext">Not approved</div>
                </div>
                <i className="bi bi-x-circle aac-stat-icon"></i>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="aac-charts-grid">
            <div className="aac-chart-card">
              <div className="aac-chart-header">
                <h6>Status Distribution</h6>
              </div>
              <div className="aac-chart-body">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="aac-chart-card">
              <div className="aac-chart-header">
                <h6>Monthly Trend</h6>
              </div>
              <div className="aac-chart-body">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="claims" 
                      stroke={COLORS.PRIMARY}
                      strokeWidth={2} 
                      name="Total Claims"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="approved" 
                      stroke={COLORS.SUCCESS}
                      strokeWidth={2} 
                      name="Approved"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className="aac-filters-card">
        <div className="aac-filters-grid">
          <div className="aac-filter-group">
            <label className="aac-filter-label">Search Claims</label>
            <div className="aac-search-wrapper">
              <i className="bi bi-search"></i>
              <input
                type="text"
                className="aac-search-input"
                placeholder="Search by name, ID, policy..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
          
          <div className="aac-filter-group">
            <label className="aac-filter-label">Status</label>
            <select
              className="aac-filter-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="aac-filter-group">
            <label className="aac-filter-label">Date Range</label>
            <select
              className="aac-filter-select"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All Time</option>
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
            </select>
          </div>

          <div className="aac-filter-group">
            <label className="aac-filter-label">Assigned HR</label>
            <select
              className="aac-filter-select"
              value={hrFilter}
              onChange={(e) => {
                setHrFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All HR</option>
              {uniqueHRs.map(hr => (
                <option key={hr} value={hr}>{hr}</option>
              ))}
            </select>
          </div>

          <button
            className="aac-reset-btn"
            onClick={resetFilters}
            title="Reset all filters"
          >
            <i className="bi bi-arrow-clockwise"></i>
            Reset
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedClaims.length > 0 && (
        <div className="aac-bulk-actions">
          <span className="aac-bulk-count">
            {selectedClaims.length} claim{selectedClaims.length !== 1 ? 's' : ''} selected
          </span>
          <div className="aac-bulk-controls">
            <select
              className="aac-bulk-select"
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
            >
              <option value="">Bulk Actions</option>
              <option value="approve">Approve Selected</option>
              <option value="reject">Reject Selected</option>
              <option value="assign">Assign to HR</option>
              <option value="export">Export Selected</option>
            </select>
            {bulkAction && (
              <button
                className="aac-bulk-apply-btn"
                onClick={() => handleBulkAction(bulkAction)}
              >
                Apply
              </button>
            )}
          </div>
        </div>
      )}

      {/* Claims Table */}
      <div className="aac-table-card">
        <div className="aac-table-header">
          <h5 className="aac-table-title">
            <i className="bi bi-list-ul"></i>
            Claims List
            <span className="badge">{filteredClaims.length}</span>
          </h5>
          
          <div className="aac-table-controls">
            <span className="aac-table-info">
              Showing {indexOfFirstClaim + 1}-{Math.min(indexOfLastClaim, filteredClaims.length)} of {filteredClaims.length}
            </span>
            <select
              className="aac-per-page-select"
              value={claimsPerPage}
              onChange={(e) => {
                setClaimsPerPage(parseInt(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value="5">5 per page</option>
              <option value="10">10 per page</option>
              <option value="20">20 per page</option>
              <option value="50">50 per page</option>
            </select>
          </div>
        </div>

        {currentClaims.length === 0 ? (
          <div className="aac-empty-state">
            <i className="bi bi-clipboard-x aac-empty-icon"></i>
            <h5 className="aac-empty-title">No claims found</h5>
            <p className="aac-empty-text">
              {claims.length === 0 
                ? "No claims submitted yet."
                : "Try adjusting your search or filters"
              }
            </p>
          </div>
        ) : (
          <div className="aac-table-wrapper">
            <table className="aac-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>
                    <input
                      className="aac-checkbox"
                      type="checkbox"
                      checked={selectedClaims.length === currentClaims.length && currentClaims.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th 
                    className="sortable"
                    onClick={() => handleSort('id')}
                  >
                    Claim ID <span className="sort-icon">{getSortIndicator('id')}</span>
                  </th>
                  <th 
                    className="sortable"
                    onClick={() => handleSort('employeeName')}
                  >
                    Employee <span className="sort-icon">{getSortIndicator('employeeName')}</span>
                  </th>
                  <th>Policy</th>
                  <th>Assigned HR</th>
                  <th 
                    className="sortable"
                    onClick={() => handleSort('status')}
                  >
                    Status <span className="sort-icon">{getSortIndicator('status')}</span>
                  </th>
                  <th>Documents</th>
                  <th 
                    className="sortable"
                    onClick={() => handleSort('claimDate')}
                  >
                    Submitted <span className="sort-icon">{getSortIndicator('claimDate')}</span>
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentClaims.map((claim) => (
                  <tr key={claim.id} className={selectedClaims.includes(claim.id) ? 'selected' : ''}>
                    <td>
                      <input
                        className="aac-checkbox"
                        type="checkbox"
                        checked={selectedClaims.includes(claim.id)}
                        onChange={() => toggleClaimSelection(claim.id)}
                      />
                    </td>
                    <td>
                      <span className="aac-claim-id">#{claim.id}</span>
                    </td>
                    <td>
                      <div className="aac-employee-cell">
                        <span className="aac-employee-name">{claim.employeeName || "Unknown"}</span>
                        <span className="aac-employee-id">{claim.employeeIdDisplay || 'N/A'}</span>
                      </div>
                    </td>
                    <td>
                      <span className="aac-policy-name">{claim.policyName || "N/A"}</span>
                    </td>
                    <td>
                      <span className={`aac-hr-name ${!claim.assignedHrName ? 'not-assigned' : ''}`}>
                        {claim.assignedHrName || "Not Assigned"}
                      </span>
                    </td>
                    <td>
                      <span className={`aac-status-badge ${claim.status?.toLowerCase()}`}>
                        {claim.status}
                      </span>
                    </td>
                    <td>
                      {claim.documents?.length > 0 ? (
                        <div className="dropdown">
                          <button 
                            className="aac-docs-btn dropdown-toggle"
                            type="button"
                            data-bs-toggle="dropdown"
                          >
                            <i className="bi bi-paperclip"></i>
                            {claim.documents.length}
                          </button>
                          <ul className="dropdown-menu">
                            {claim.documents.map((doc, idx) => (
                              <li key={idx}>
                                <a
                                  className="dropdown-item"
                                  href={`${API_BASE_URL}${doc}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <i className="bi bi-download me-2"></i>
                                  Document {idx + 1}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <span className="aac-no-docs">No docs</span>
                      )}
                    </td>
                    <td>
                      <span className="aac-date">
                        {claim.claimDate ? new Date(claim.claimDate).toLocaleDateString() : "N/A"}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="aac-view-btn"
                        onClick={() => setViewClaim(claim)}
                        title="View Details"
                      >
                        <i className="bi bi-eye"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="aac-pagination-wrapper">
            <div className="aac-pagination-info">
              Showing {indexOfFirstClaim + 1} to {Math.min(indexOfLastClaim, filteredClaims.length)} of {filteredClaims.length} entries
            </div>
            <nav className="aac-pagination">
              <button
                className="aac-page-btn"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <i className="bi bi-chevron-left"></i>
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    className={`aac-page-btn ${currentPage === pageNum ? 'active' : ''}`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                className="aac-page-btn"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <i className="bi bi-chevron-right"></i>
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* View Claim Modal */}
      {viewClaim && (
        <div 
          className="aac-modal-overlay"
          onClick={() => setViewClaim(null)}
        >
          <div className="aac-modal" onClick={(e) => e.stopPropagation()}>
            <div className="aac-modal-header">
              <h5 className="aac-modal-title">
                <i className="bi bi-clipboard-check"></i>
                Claim Details - #{viewClaim.id}
              </h5>
              <button className="aac-modal-close" onClick={() => setViewClaim(null)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="aac-modal-body">
              <div className="aac-detail-grid">
                <div className="aac-detail-section">
                  <h6>Claim Information</h6>
                  <div className="aac-detail-item">
                    <div className="aac-detail-label">Employee</div>
                    <div className="aac-detail-value">{viewClaim.employeeName}</div>
                  </div>
                  <div className="aac-detail-item">
                    <div className="aac-detail-label">Employee ID</div>
                    <div className="aac-detail-value">{viewClaim.employeeIdDisplay}</div>
                  </div>
                  <div className="aac-detail-item">
                    <div className="aac-detail-label">Policy</div>
                    <div className="aac-detail-value">{viewClaim.policyName}</div>
                  </div>
                  <div className="aac-detail-item">
                    <div className="aac-detail-label">Submitted</div>
                    <div className="aac-detail-value">{new Date(viewClaim.claimDate).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="aac-detail-section">
                  <h6>Status & Assignment</h6>
                  <div className="aac-detail-item">
                    <div className="aac-detail-label">Status</div>
                    <div className="aac-detail-value">
                      <span className={`aac-status-badge ${viewClaim.status?.toLowerCase()}`}>
                        {viewClaim.status}
                      </span>
                    </div>
                  </div>
                  <div className="aac-detail-item">
                    <div className="aac-detail-label">Assigned HR</div>
                    <div className="aac-detail-value">{viewClaim.assignedHrName || 'Not assigned'}</div>
                  </div>
                  <div className="aac-detail-item">
                    <div className="aac-detail-label">Remarks</div>
                    <div className="aac-detail-value">{viewClaim.remarks || 'No remarks'}</div>
                  </div>
                </div>
              </div>
              
              {viewClaim.documents?.length > 0 && (
                <div className="aac-documents-section">
                  <h6>Documents</h6>
                  <div className="aac-documents-grid">
                    {viewClaim.documents.map((doc, idx) => (
                      <a
                        key={idx}
                        href={`${API_BASE_URL}${doc}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="aac-document-link"
                      >
                        <i className="bi bi-download"></i>
                        Document {idx + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="aac-modal-footer">
              <button
                className="aac-btn-close"
                onClick={() => setViewClaim(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAllClaims;
