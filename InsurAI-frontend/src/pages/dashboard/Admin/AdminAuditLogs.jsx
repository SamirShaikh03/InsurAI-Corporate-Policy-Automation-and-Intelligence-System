import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CSVLink } from "react-csv";
import { API_BASE_URL } from "../../../config";
import "./AdminAuditLogs.css";

// Color constants - Royal Blue / Violet Theme  
const COLORS = {
  PRIMARY: '#2563eb',
  PRIMARY_DARK: '#1d4ed8',
  SECONDARY: '#8b5cf6',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  DANGER: '#ef4444',
  INFO: '#06b6d4',
  TEXT_DARK: '#0f172a',
  TEXT_MUTED: '#64748b'
};

const AdminAuditLogs = ({ themeColors }) => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [filterRole, setFilterRole] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [dateRange, setDateRange] = useState("30");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // Fetch logs from backend
  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/admin/audit/logs", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setLogs(data);
        setFilteredLogs(data);
      })
      .catch((err) => console.error("Error fetching audit logs:", err))
      .finally(() => setLoading(false));
  }, [token]);

  // Apply filters
  const applyFilters = () => {
    let filtered = logs;

    if (filterRole) filtered = filtered.filter((log) => log.role === filterRole);
    if (filterAction)
      filtered = filtered.filter((log) =>
        log.action.toLowerCase().includes(filterAction.toLowerCase())
      );

    if (searchTerm)
      filtered = filtered.filter(
        (log) =>
          log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.details.toLowerCase().includes(searchTerm.toLowerCase())
      );

    if (dateRange && dateRange !== "custom") {
      const days = parseInt(dateRange);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      filtered = filtered.filter(
        (log) => new Date(log.timestamp) >= cutoff
      );
    }

    setFilteredLogs(filtered);
  };

  // Export CSV headers
  const csvHeaders = [
    { label: "Timestamp", key: "timestamp" },
    { label: "User", key: "userName" },
    { label: "Role", key: "role" },
    { label: "Action", key: "action" },
    { label: "Details", key: "details" },
  ];

  // Helper function to get role badge class
  const getRoleBadgeClass = (role) => {
    switch(role?.toUpperCase()) {
      case 'HR': return 'hr';
      case 'AGENT': return 'agent';
      case 'ADMIN': return 'admin';
      default: return 'employee';
    }
  };

  return (
    <motion.div
      className="admin-audit-logs"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Page Header */}
      <div className="aal-page-header">
        <h4 className="aal-page-title">
          <i className="bi bi-journal-check"></i>
          Audit Logs & System Activity
        </h4>
        <p className="aal-page-subtitle">
          Track and monitor all system activities and user actions
        </p>
      </div>

      {/* Filter Section */}
      <div className="aal-filter-card">
        <div className="aal-filter-header">
          <h5><i className="bi bi-funnel"></i> Filter Logs</h5>
        </div>
        <div className="aal-filter-body">
          <div className="aal-filter-grid">
            {/* Role Filter */}
            <div className="aal-filter-group">
              <label className="aal-filter-label">User Role</label>
              <select
                className="aal-filter-select"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="HR">HR</option>
                <option value="AGENT">Agent</option>
                <option value="EMPLOYEE">Employee</option>
              </select>
            </div>

            {/* Action Filter */}
            <div className="aal-filter-group">
              <label className="aal-filter-label">Action Type</label>
              <input
                type="text"
                className="aal-filter-input"
                placeholder="e.g. LOGIN, CLAIM"
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
              />
            </div>

            {/* Date Range */}
            <div className="aal-filter-group">
              <label className="aal-filter-label">Date Range</label>
              <select
                className="aal-filter-select"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
              </select>
            </div>

            {/* Search Box */}
            <div className="aal-filter-group">
              <label className="aal-filter-label">Search</label>
              <input
                type="text"
                className="aal-filter-input"
                placeholder="Search by user or details"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <button className="aal-apply-btn" onClick={applyFilters}>
            <i className="bi bi-check2-circle"></i>
            Apply Filters
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="aal-table-card">
        <div className="aal-table-header">
          <h5 className="aal-table-title">
            <i className="bi bi-list-task"></i>
            System Activity Log
          </h5>
          <CSVLink
            data={filteredLogs}
            headers={csvHeaders}
            filename="audit_logs.csv"
            className="aal-export-btn"
          >
            <i className="bi bi-download"></i>
            Export CSV
          </CSVLink>
        </div>

        <div className="aal-table-body">
          {loading ? (
            <div className="aal-loading">
              <div className="aal-spinner"></div>
              <p className="aal-loading-text">Loading logs...</p>
            </div>
          ) : filteredLogs.length > 0 ? (
            <div className="aal-table-wrapper">
              <table className="aal-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User</th>
                    <th>Role</th>
                    <th>Action</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <td className="aal-timestamp">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="aal-username">{log.userName}</td>
                      <td>
                        <span className={`aal-role-badge ${getRoleBadgeClass(log.role)}`}>
                          {log.role}
                        </span>
                      </td>
                      <td className="aal-action">{log.action}</td>
                      <td className="aal-details" title={log.details}>{log.details}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="aal-empty-state">
              <i className="bi bi-inbox aal-empty-icon"></i>
              <p className="aal-empty-text">No logs found for selected filters.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AdminAuditLogs;
