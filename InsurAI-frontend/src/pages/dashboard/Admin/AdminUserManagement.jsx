// File: src/pages/dashboard/Admin/AdminUserManagement.jsx
import React, { useState, useMemo } from "react";
import { Pie, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import "./AdminUserManagement.css";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Color constants - Royal Blue & Violet Theme
const COLORS = {
  PRIMARY: '#2563eb',        // Royal Blue
  PRIMARY_DARK: '#1d4ed8',   // Darker Blue
  SECONDARY: '#8b5cf6',      // Violet
  SECONDARY_LIGHT: '#a78bfa', // Light Violet
  ACCENT: '#ec4899',         // Rose/Pink
  ACCENT_LIGHT: '#f472b6',   // Light Pink
  INFO: '#06b6d4',           // Cyan
  SUCCESS: '#10b981',        // Green
  WARNING: '#f59e0b',        // Amber
  DANGER: '#ef4444',         // Red
  BACKGROUND: '#f8fafc',     // Light gray
  TEXT_DARK: '#1e293b',      // Dark text
  TEXT_MUTED: '#64748b'      // Muted text
};

export default function AdminUserManagement({ 
  users = [], 
  setActiveTab,
  onEditUser,
  onDeleteUser,
  onStatusChange 
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(10);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Calculate user statistics
  const userStats = useMemo(() => {
    const totalUsers = users.length;
    const totalEmployees = users.filter(user => user.role === "Employee").length;
    const totalAgents = users.filter(user => user.role === "Agent").length;
    const totalHR = users.filter(user => user.role === "HR").length;
    const activeUsers = users.filter(user => user.status === "Active").length;
    const inactiveUsers = users.filter(user => user.status === "Inactive").length;

    return { totalUsers, totalEmployees, totalAgents, totalHR, activeUsers, inactiveUsers };
  }, [users]);

  // Filter users based on search and filters
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "All" || user.role === roleFilter;
      const matchesStatus = statusFilter === "All" || user.status === statusFilter;
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Handle user actions
  const handleEdit = (user) => {
    if (onEditUser) {
      onEditUser(user);
    }
  };

  const handleStatusToggle = (user) => {
    if (!user || !user.id) {
      console.error('Invalid user object:', user);
      alert('Error: Invalid user data. Cannot toggle status.');
      return;
    }

    if (onStatusChange) {
      const newStatus = user.status === "Active" ? "Inactive" : "Active";
      console.log('Toggling status for user:', {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        currentStatus: user.status,
        newStatus: newStatus
      });
      onStatusChange(user.id, newStatus);
    } else {
      console.error('onStatusChange handler not provided');
      alert('Error: Status change handler not available.');
    }
  };

  const handleDeleteClick = (user) => {
    setDeleteConfirm(user);
  };

  const confirmDelete = () => {
    if (onDeleteUser && deleteConfirm) {
      onDeleteUser(deleteConfirm.id, deleteConfirm.role);
      setDeleteConfirm(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  // Get role badge class
  const getRoleBadgeClass = (role) => {
    switch (role) {
      case "HR": return "bg-primary";
      case "Agent": return "bg-info";
      case "Employee": return "bg-success";
      default: return "bg-secondary";
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    return status === "Active" ? "bg-success" : "bg-warning";
  };

  // Get role icon
  const getRoleIcon = (role) => {
    switch (role) {
      case "HR": return "bi-person-badge";
      case "Agent": return "bi-headset";
      case "Employee": return "bi-person";
      default: return "bi-person";
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setRoleFilter("All");
    setStatusFilter("All");
    setCurrentPage(1);
  };

  // Chart data for user distribution - Royal Blue/Violet theme
  const roleDistributionData = {
    labels: ['Employees', 'Agents', 'HR'],
    datasets: [
      {
        data: [userStats.totalEmployees, userStats.totalAgents, userStats.totalHR],
        backgroundColor: [
          COLORS.SECONDARY,      // Violet for Employees
          COLORS.INFO,           // Cyan for Agents
          COLORS.ACCENT          // Pink for HR
        ],
        borderColor: [
          COLORS.SECONDARY,
          COLORS.INFO,
          COLORS.ACCENT
        ],
        borderWidth: 2,
      },
    ],
  };

  // Status distribution data - Royal Blue/Violet theme
  const statusDistributionData = {
    labels: ['Active', 'Inactive'],
    datasets: [
      {
        data: [userStats.activeUsers, userStats.inactiveUsers],
        backgroundColor: [
          COLORS.SUCCESS,    // Green for Active
          COLORS.WARNING     // Amber for Inactive
        ],
        borderColor: [
          COLORS.SUCCESS,
          COLORS.WARNING
        ],
        borderWidth: 2,
      },
    ],
  };

  // Role comparison chart data - Royal Blue/Violet theme
  const roleComparisonData = {
    labels: ['Employees', 'Agents', 'HR'],
    datasets: [
      {
        label: 'User Count',
        data: [userStats.totalEmployees, userStats.totalAgents, userStats.totalHR],
        backgroundColor: [
          COLORS.SECONDARY,      // Violet for Employees
          COLORS.INFO,           // Cyan for Agents
          COLORS.ACCENT          // Pink for HR
        ],
        borderColor: [
          COLORS.SECONDARY,
          COLORS.INFO,
          COLORS.ACCENT
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          color: COLORS.TEXT_MUTED
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff'
      }
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: COLORS.TEXT_MUTED
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: COLORS.TEXT_MUTED
        }
      }
    }
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          color: COLORS.TEXT_MUTED
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff'
      }
    },
  };

  return (
    <div className="admin-user-management-wrapper">
      {/* Header Section */}
      <div className="aum-page-header">
        <div>
          <h3 className="aum-page-title">
            <span className="aum-page-title-icon">
              <i className="bi bi-people-fill"></i>
            </span>
            User Management
          </h3>
          <p className="aum-page-subtitle">Manage system users and their permissions</p>
        </div>
        <div className="aum-header-actions">
          <button
            className="aum-btn-primary"
            onClick={() => setActiveTab("registerHR")}
          >
            <i className="bi bi-person-plus"></i>
            Add HR
          </button>
          <button
            className="aum-btn-secondary"
            onClick={() => setActiveTab("registerAgent")}
          >
            <i className="bi bi-person-plus"></i>
            Add Agent
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="aum-stats-grid">
        <div className="aum-stat-card primary">
          <div className="aum-stat-header">
            <div>
              <div className="aum-stat-label">Total Users</div>
              <div className="aum-stat-value">{userStats.totalUsers}</div>
            </div>
            <div className="aum-stat-icon">
              <i className="bi bi-people-fill"></i>
            </div>
          </div>
          <p className="aum-stat-description">All system users</p>
        </div>

        <div className="aum-stat-card secondary">
          <div className="aum-stat-header">
            <div>
              <div className="aum-stat-label">Employees</div>
              <div className="aum-stat-value">{userStats.totalEmployees}</div>
            </div>
            <div className="aum-stat-icon">
              <i className="bi bi-person-fill"></i>
            </div>
          </div>
          <p className="aum-stat-description">Employee accounts</p>
        </div>

        <div className="aum-stat-card info">
          <div className="aum-stat-header">
            <div>
              <div className="aum-stat-label">Agents</div>
              <div className="aum-stat-value">{userStats.totalAgents}</div>
            </div>
            <div className="aum-stat-icon">
              <i className="bi bi-headset"></i>
            </div>
          </div>
          <p className="aum-stat-description">Agent accounts</p>
        </div>

        <div className="aum-stat-card accent">
          <div className="aum-stat-header">
            <div>
              <div className="aum-stat-label">HR Users</div>
              <div className="aum-stat-value">{userStats.totalHR}</div>
            </div>
            <div className="aum-stat-icon">
              <i className="bi bi-person-badge-fill"></i>
            </div>
          </div>
          <p className="aum-stat-description">HR accounts</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="aum-charts-section">
        <div className="aum-chart-card">
          <div className="aum-chart-header">
            <h6 className="aum-chart-title">
              <i className="bi bi-pie-chart-fill"></i>
              Role Distribution
            </h6>
          </div>
          <div className="aum-chart-body">
            <Pie data={roleDistributionData} options={pieChartOptions} />
          </div>
        </div>

        <div className="aum-chart-card">
          <div className="aum-chart-header">
            <h6 className="aum-chart-title">
              <i className="bi bi-activity"></i>
              Status Overview
            </h6>
          </div>
          <div className="aum-chart-body">
            <Doughnut data={statusDistributionData} options={doughnutChartOptions} />
          </div>
        </div>

        <div className="aum-chart-card">
          <div className="aum-chart-header">
            <h6 className="aum-chart-title">
              <i className="bi bi-bar-chart-fill"></i>
              User Comparison
            </h6>
          </div>
          <div className="aum-chart-body">
            <Bar data={roleComparisonData} options={barChartOptions} />
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="aum-filter-section">
        <div className="aum-filter-row">
          <div className="aum-filter-group" style={{ flex: 2 }}>
            <label className="aum-filter-label">Search Users</label>
            <div className="aum-search-wrapper">
              <i className="bi bi-search aum-search-icon"></i>
              <input
                type="text"
                className="aum-search-input"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
            
          <div className="aum-filter-group">
            <label className="aum-filter-label">Filter by Role</label>
            <select
              className="aum-filter-select"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All Roles</option>
              <option value="Employee">Employee</option>
              <option value="Agent">Agent</option>
              <option value="HR">HR</option>
            </select>
          </div>

          <div className="aum-filter-group">
            <label className="aum-filter-label">Filter by Status</label>
            <select
              className="aum-filter-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <button className="aum-btn-reset" onClick={resetFilters}>
            <i className="bi bi-arrow-clockwise"></i>
            Reset
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="aum-table-card">
        <div className="aum-table-header">
          <h5 className="aum-table-title">
            <i className="bi bi-people"></i>
            All Users
            <span className="aum-table-count">{filteredUsers.length}</span>
          </h5>
          <select
            className="aum-per-page-select"
            value={usersPerPage}
            onChange={(e) => {
              setUsersPerPage(parseInt(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value="5">5 per page</option>
            <option value="10">10 per page</option>
            <option value="20">20 per page</option>
            <option value="50">50 per page</option>
          </select>
        </div>
        
        <div className="aum-table-responsive">
          <table className="aum-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="aum-user-cell">
                      <div className={`aum-user-avatar ${user.role?.toLowerCase()}`}>
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="aum-user-info">
                        <span className="aum-user-name">{user.name}</span>
                        <span className="aum-user-email-small">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`aum-badge aum-badge-${user.role?.toLowerCase()}`}>
                      <i className={`bi ${getRoleIcon(user.role)}`}></i>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`aum-badge aum-badge-${user.status?.toLowerCase()}`}>
                      <i className={`bi ${
                        user.status === "Active" ? "bi-check-circle" : "bi-pause-circle"
                      }`}></i>
                      {user.status}
                    </span>
                  </td>
                  <td>
                    <div className="aum-actions">
                      <button 
                        className="aum-action-btn edit"
                        onClick={() => handleEdit(user)}
                        title="Edit User"
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button 
                        className="aum-action-btn toggle"
                        onClick={() => handleStatusToggle(user)}
                        title={user.status === "Active" ? "Deactivate User" : "Activate User"}
                      >
                        <i className={`bi ${
                          user.status === "Active" ? "bi-pause" : "bi-play"
                        }`}></i>
                      </button>
                      <button 
                        className="aum-action-btn delete"
                        onClick={() => handleDeleteClick(user)}
                        title="Delete User"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {currentUsers.length === 0 && (
                <tr>
                  <td colSpan="5">
                    <div className="aum-empty-state">
                      <i className="bi bi-people aum-empty-icon"></i>
                      <h5 className="aum-empty-title">No users found</h5>
                      <p className="aum-empty-text">
                        {users.length === 0 
                          ? "No users in the system yet. Add your first user above."
                          : "Try adjusting your search or filters"
                        }
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="aum-pagination-wrapper">
            <div className="aum-pagination-info">
              Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} entries
            </div>
            <div className="aum-pagination">
              <button
                className="aum-page-btn"
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
                    className={`aum-page-btn ${currentPage === pageNum ? "active" : ""}`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                className="aum-page-btn"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="aum-modal-overlay">
          <div className="aum-modal">
            <div className="aum-modal-header">
              <h5 className="aum-modal-title">
                <i className="bi bi-exclamation-triangle"></i>
                Confirm Delete
              </h5>
              <button 
                type="button" 
                className="aum-modal-close"
                onClick={cancelDelete}
              >
                <i className="bi bi-x"></i>
              </button>
            </div>
            <div className="aum-modal-body">
              <p>
                Are you sure you want to delete user <strong>"{deleteConfirm.name}"</strong>?
              </p>
              <p>
                This action cannot be undone. All user data will be permanently removed.
              </p>
            </div>
            <div className="aum-modal-footer">
              <button
                type="button"
                className="aum-btn-cancel"
                onClick={cancelDelete}
              >
                Cancel
              </button>
              <button
                type="button"
                className="aum-btn-danger"
                onClick={confirmDelete}
              >
                <i className="bi bi-trash"></i>
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}