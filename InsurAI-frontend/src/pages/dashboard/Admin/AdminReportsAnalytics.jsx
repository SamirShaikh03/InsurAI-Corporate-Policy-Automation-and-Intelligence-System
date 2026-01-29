import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../../config";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import { CSVLink } from "react-csv";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useMemo } from "react";
import "./AdminReportsAnalytics.css";

// Color constants - Royal Blue / Violet Theme
const COLORS = {
  PRIMARY: '#2563eb',        // Royal Blue
  PRIMARY_DARK: '#1d4ed8',   // Darker Blue
  SECONDARY: '#8b5cf6',      // Violet
  ACCENT: '#ec4899',         // Rose/Pink
  INFO: '#06b6d4',           // Cyan
  SUCCESS: '#10b981',        // Green
  WARNING: '#f59e0b',        // Amber
  DANGER: '#ef4444',         // Red
  BACKGROUND: '#f8fafc',     // Light gray
  TEXT_DARK: '#0f172a',      // Dark text
  TEXT_MUTED: '#64748b'      // Muted text
};

export default function AdminReportsAnalytics() {
  const [users, setUsers] = useState([]);
  const [claims, setClaims] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [hrs, setHrs] = useState([]);
  const [agents, setAgents] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [dateFilter, setDateFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [employeeClaimsMap, setEmployeeClaimsMap] = useState({});

  // Colors for charts - updated with theme
  const CHART_COLORS = [COLORS.SECONDARY, COLORS.INFO, COLORS.ACCENT, COLORS.WARNING, "#96CEB4", "#DDA0DD"];
  const STATUS_COLORS = { 
    "Pending": COLORS.WARNING, 
    "Approved": COLORS.SUCCESS, 
    "Rejected": COLORS.DANGER,
    "Processing": COLORS.INFO
  };

  // Fetch data for reports
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      setLoading(true);
      try {
        const [usersRes, claimsRes, policiesRes, hrsRes, agentsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/auth/employees`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE_URL}/admin/claims`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE_URL}/admin/policies`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE_URL}/hr`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE_URL}/agent`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        setUsers(usersRes.data || []);
        setClaims(claimsRes.data || []);
        setPolicies(policiesRes.data || []);
        setHrs(hrsRes.data || []);
        setAgents(agentsRes.data || []);
      } catch (err) {
        console.error("Failed to fetch report data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter data based on date
 const filterDataByDate = (data, type) => {
  if (dateFilter === "all") return data;
  const now = new Date();
  let filterDate = new Date();

  switch(dateFilter) {
    case "today":
      filterDate.setHours(0,0,0,0);
      break;
    case "week":
      filterDate.setDate(now.getDate() - 7);
      break;
    case "month":
      filterDate.setMonth(now.getMonth() - 1);
      break;
    case "year":
      filterDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      return data;
  }

  return data.filter(item => {
    let itemDate;
    if (type === "claims") itemDate = item.claimDate || item.created_at;
    else if (type === "users") itemDate = item.joinDate;
    else if (type === "policies") itemDate = item.created_at;

    return itemDate && new Date(itemDate) >= filterDate;
  });
};

const filteredClaims = useMemo(() => filterDataByDate(claims, "claims"), [claims, dateFilter]);
const filteredUsers = useMemo(() => filterDataByDate(users, "users"), [users, dateFilter]);
const filteredPolicies = useMemo(() => filterDataByDate(policies, "policies"), [policies, dateFilter]);

  // ==================== CALCULATED METRICS ====================

  const totalPolicies = policies.length;
  const totalEmployees = users.length;

  // Map employeeId (string) to number of claims
  useEffect(() => {
    if (!filteredClaims || filteredClaims.length === 0) {
      setEmployeeClaimsMap({});
      return;
    }

    const map = {};
    filteredClaims.forEach(claim => {
      const empId = claim.employeeId || claim.employee_id;
      if (empId) map[empId] = (map[empId] || 0) + 1;
    });

    setEmployeeClaimsMap(map);
  }, [filteredClaims]);

  // Employees with at least one claim
  const employeesWithClaims = users.filter(user => 
    employeeClaimsMap[user.id] > 0
  ).length;

  // Average claims per employee
  const averageClaimPerEmployee = totalEmployees > 0 
    ? (filteredClaims.length / totalEmployees).toFixed(1) 
    : 0;

  // Average amount per employee
  const averageAmountPerEmployee = totalEmployees > 0
    ? (filteredClaims.reduce((sum, claim) => sum + (parseFloat(claim.amount) || 0), 0) / totalEmployees).toFixed(2)
    : 0;

  // HR Reports - calculate workload using **all claims**, ignoring date filter
const hrWorkload = hrs.map(hr => {
  const hrClaims = claims.filter(
    claim => String(claim.assignedHrId) === String(hr.id)
  );

  const approved = hrClaims.filter(c => c.status === "Approved").length;
  const rejected = hrClaims.filter(c => c.status === "Rejected").length;
  const pending = hrClaims.filter(c => c.status === "Pending").length;
  const total = hrClaims.length;

  return {
    ...hr,
    approved,
    rejected,
    pending,
    total,
    approvalRate: total > 0 ? ((approved / total) * 100).toFixed(1) : 0
  };
});

  // Total agents
  const totalAgents = agents.length;

  // Policy usage
  const policyUsage = policies.map(policy => {
    const policyClaims = filteredClaims.filter(claim => 
      claim.policyId === policy.policyId || claim.policyName === policy.policyName
    );
    const claimCount = policyClaims.length;
    const totalAmount = policyClaims.reduce((sum, claim) => sum + (parseFloat(claim.amount) || 0), 0);

    return {
      ...policy,
      claimCount,
      totalAmount,
      avgPerClaim: claimCount > 0 ? (totalAmount / claimCount).toFixed(2) : 0
    };
  });

  // Claims summary
  const totalClaims = filteredClaims.length;
  const claimsByStatus = Object.entries(
    filteredClaims.reduce((acc, claim) => {
      acc[claim.status] = (acc[claim.status] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value, color: STATUS_COLORS[name] }));

  // Monthly trends
  const monthlyClaims = () => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const currentYear = new Date().getFullYear();
    
    return months.map((month, index) => {
      const monthClaims = filteredClaims.filter(claim => {
        const claimDate = new Date(claim.claimDate || claim.created_at);
        return claimDate.getMonth() === index && claimDate.getFullYear() === currentYear;
      });
      return {
        month,
        claims: monthClaims.length,
        amount: monthClaims.reduce((sum, claim) => sum + (parseFloat(claim.amount) || 0), 0)
      };
    });
  };

  // ==================== EXPORT FUNCTIONS ====================

  const downloadFullPDFReport = () => {
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString();
    
    // Title
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text('COMPREHENSIVE ADMIN REPORT', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${date}`, 105, 28, { align: 'center' });
    doc.text(`Date Filter: ${dateFilter === 'all' ? 'All Time' : dateFilter}`, 105, 34, { align: 'center' });

    let startY = 45;

    // Executive Summary
    doc.setFontSize(12);
    doc.setTextColor(37, 99, 235); // Primary color
    doc.text('EXECUTIVE SUMMARY', 14, startY);
    
    doc.autoTable({
      startY: startY + 5,
      head: [['Metric', 'Count', 'Amount (₹)']],
      body: [
        ['Total Employees', totalEmployees, '-'],
        ['Total HR Users', hrs.length, '-'],
        ['Total Agents', agents.length, '-'],
        ['Total Policies', policies.length, '-'],
        ['Total Claims', totalClaims, `₹${filteredClaims.reduce((sum, claim) => sum + (parseFloat(claim.amount) || 0), 0).toFixed(2)}`],
        ['Approved Claims', claimsByStatus.find(s => s.name === 'Approved')?.value || 0, '-'],
        ['Pending Claims', claimsByStatus.find(s => s.name === 'Pending')?.value || 0, '-']
      ],
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: 255 },
      styles: { fontSize: 10 }
    });

    // Employee Summary
    startY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(12);
    doc.setTextColor(37, 99, 235);
    doc.text('EMPLOYEE SUMMARY', 14, startY);
    
    doc.autoTable({
      startY: startY + 5,
      head: [['Employee Name', 'Role', 'Claims Count', 'Status']],
      body: users.slice(0, 10).map(user => [
        user.name || 'N/A',
        user.role || 'Employee',
        employeeClaimsMap[user.employeeId || user.name] || 0,
        user.status || 'Active'
      ]),
      theme: 'striped',
      styles: { fontSize: 8 }
    });

    // Claims Summary
    startY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(12);
    doc.setTextColor(37, 99, 235);
    doc.text('RECENT CLAIMS ACTIVITY', 14, startY);
    
    doc.autoTable({
      startY: startY + 5,
      head: [['Employee', 'Policy', 'Amount (₹)', 'Date', 'Status', 'Assigned HR']],
      body: filteredClaims.slice(0, 15).map(claim => [
        claim.employeeName || 'N/A',
        claim.policyName || 'N/A',
        `₹${parseFloat(claim.amount || 0).toFixed(2)}`,
        new Date(claim.claimDate).toLocaleDateString(),
        claim.status,
        claim.processedByName || 'Not Assigned'
      ]),
      theme: 'grid',
      styles: { fontSize: 7 }
    });

    // Policy Summary
    startY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(12);
    doc.setTextColor(37, 99, 235);
    doc.text('POLICY USAGE SUMMARY', 14, startY);
    
    doc.autoTable({
      startY: startY + 5,
      head: [['Policy Name', 'Type', 'Claims', 'Total Amount (₹)', 'Avg/Claim (₹)']],
      body: policyUsage.map(policy => [
        policy.policyName,
        policy.policyType,
        policy.claimCount,
        `₹${policy.totalAmount.toFixed(2)}`,
        `₹${policy.avgPerClaim}`
      ]),
      theme: 'striped',
      styles: { fontSize: 8 }
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
      doc.text('Generated by Claims Management System', 105, 295, { align: 'center' });
    }

    doc.save(`admin_comprehensive_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Remove password from employee CSV export
  const getEmployeesForCSV = () => {
    return users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  };

  if (loading) {
    return (
      <div className="ara-loading">
        <div className="ara-spinner"></div>
      </div>
    );
  }

  // Format currency with ₹ symbol
  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toFixed(2)}`;
  };

  return (
    <div className="ara-container">
      {/* Header */}
      <div className="ara-header">
        <div>
          <h3 className="ara-header__title">Admin Reports & Analytics</h3>
          <p className="ara-header__subtitle">Comprehensive analytics across employees, HR, agents, policies, and claims</p>
        </div>
        <div className="ara-header__badge">
          <i className="bi bi-graph-up"></i>
          Real-time Analytics
        </div>
      </div>

      {/* Date Filter */}
      <div className="ara-filter-card">
        <div className="ara-filter-row">
          <div className="ara-filter-group">
            <label className="ara-filter-label">Date Range Filter</label>
            <select 
              className="ara-select"
              value={dateFilter} 
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last Year</option>
            </select>
          </div>
          <div className="ara-summary-badges">
            <span className="ara-summary-badge ara-summary-badge--primary">Employees: {totalEmployees}</span>
            <span className="ara-summary-badge ara-summary-badge--success">HR Users: {hrs.length}</span>
            <span className="ara-summary-badge ara-summary-badge--info">Agents: {totalAgents}</span>
            <span className="ara-summary-badge ara-summary-badge--warning">Policies: {totalPolicies}</span>
            <span className="ara-summary-badge ara-summary-badge--danger">Claims: {totalClaims}</span>
            <span className="ara-summary-badge ara-summary-badge--secondary">Total Amount: {formatCurrency(filteredClaims.reduce((sum, claim) => sum + (parseFloat(claim.amount) || 0), 0))}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="ara-tabs">
        {[
          { id: "dashboard", label: "Dashboard", icon: "speedometer2" },
          { id: "employees", label: "Employee Reports", icon: "people" },
          { id: "hr", label: "HR Reports", icon: "person-check" },
          { id: "agents", label: "Agent Reports", icon: "person-badge" },
          { id: "policies", label: "Policy Reports", icon: "file-earmark-text" },
          { id: "claims", label: "Claims Reports", icon: "clipboard-data" }
        ].map(tab => (
          <button 
            key={tab.id}
            className={`ara-tab ${activeTab === tab.id ? "ara-tab--active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <i className={`bi bi-${tab.icon} ara-tab__icon`}></i>{tab.label}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === "dashboard" && (
        <>
          {/* Summary Cards */}
          <div className="ara-stats-grid">
            <div className="ara-stat-card ara-stat-card--primary">
              <i className="bi bi-people ara-stat-card__icon"></i>
              <div className="ara-stat-card__value">{totalEmployees}</div>
              <div className="ara-stat-card__label">Total Employees</div>
            </div>
            <div className="ara-stat-card ara-stat-card--success">
              <i className="bi bi-person-check ara-stat-card__icon"></i>
              <div className="ara-stat-card__value">{hrs.length}</div>
              <div className="ara-stat-card__label">HR Users</div>
            </div>
            <div className="ara-stat-card ara-stat-card--info">
              <i className="bi bi-person-badge ara-stat-card__icon"></i>
              <div className="ara-stat-card__value">{totalAgents}</div>
              <div className="ara-stat-card__label">Agents</div>
            </div>
            <div className="ara-stat-card ara-stat-card--warning">
              <i className="bi bi-file-earmark-text ara-stat-card__icon"></i>
              <div className="ara-stat-card__value">{totalPolicies}</div>
              <div className="ara-stat-card__label">Policies</div>
            </div>
            <div className="ara-stat-card ara-stat-card--danger">
              <i className="bi bi-clipboard-data ara-stat-card__icon"></i>
              <div className="ara-stat-card__value">{totalClaims}</div>
              <div className="ara-stat-card__label">Total Claims</div>
            </div>
            <div className="ara-stat-card ara-stat-card--secondary">
              <i className="bi bi-currency-rupee ara-stat-card__icon"></i>
              <div className="ara-stat-card__value">
                {formatCurrency(filteredClaims.reduce((sum, claim) => sum + (parseFloat(claim.amount) || 0), 0))}
              </div>
              <div className="ara-stat-card__label">Total Amount</div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="ara-charts-grid ara-charts-grid--2col">
            <div className="ara-chart-card">
              <div className="ara-chart-card__header">
                <h5 className="ara-chart-card__title">Claims Status Distribution</h5>
              </div>
              <div className="ara-chart-card__body">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie 
                      data={claimsByStatus} 
                      dataKey="value" 
                      nameKey="name" 
                      cx="50%" 
                      cy="50%" 
                      outerRadius={100}
                      label
                    >
                      {claimsByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="ara-chart-card">
              <div className="ara-chart-card__header">
                <h5 className="ara-chart-card__title">Policy Usage</h5>
              </div>
              <div className="ara-chart-card__body">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={policyUsage.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="policyName" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="claimCount" name="Number of Claims" fill={COLORS.SECONDARY} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="ara-charts-grid ara-charts-grid--full">
            <div className="ara-chart-card">
              <div className="ara-chart-card__header">
                <h5 className="ara-chart-card__title">Monthly Claims Trend</h5>
              </div>
              <div className="ara-chart-card__body">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyClaims()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="claims" stroke={COLORS.SECONDARY} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}

{/* Employee Reports Tab */}
{activeTab === "employees" && (
  <div className="ara-content-grid ara-content-grid--4-8">
    {/* Employee Metrics */}
    <div className="ara-data-card">
      <div className="ara-data-card__header">
        <h5 className="ara-data-card__title">Employee Metrics</h5>
        <CSVLink 
          data={getEmployeesForCSV()} 
          filename="employee_report.csv"
          className="ara-btn ara-btn--success"
        >
          <i className="bi bi-download"></i>CSV
        </CSVLink>
      </div>
      <div className="ara-data-card__body">
        <div className="ara-metrics-grid">
          <div className="ara-metric-box">
            <div className="ara-metric-box__value ara-metric-box__value--primary">{totalEmployees}</div>
            <div className="ara-metric-box__label">Total Employees</div>
          </div>
          <div className="ara-metric-box">
            <div className="ara-metric-box__value ara-metric-box__value--success">{filteredClaims.length}</div>
            <div className="ara-metric-box__label">Total Claims</div>
          </div>
          <div className="ara-metric-box">
            <div className="ara-metric-box__value ara-metric-box__value--info">{averageClaimPerEmployee}</div>
            <div className="ara-metric-box__label">Avg Claims/Employee</div>
          </div>
          <div className="ara-metric-box">
            <div className="ara-metric-box__value ara-metric-box__value--warning">
              {formatCurrency(
                filteredClaims.reduce((sum, claim) => sum + (parseFloat(claim.amount) || 0), 0) / totalEmployees
              )}
            </div>
            <div className="ara-metric-box__label">Avg Amount/Employee</div>
          </div>
        </div>
      </div>
    </div>

    {/* Employee List */}
    <div className="ara-data-card">
      <div className="ara-data-card__header">
        <h5 className="ara-data-card__title">Employee List</h5>
      </div>
      <div className="ara-data-card__body ara-data-card__body--no-padding">
        <div className="ara-table-responsive">
          <table className="ara-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Claims Count</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.slice(0, 10).map(user => (
                <tr key={user.id || user.employeeId}>
                  <td>{user.name || 'N/A'}</td>
                  <td><span className="ara-badge ara-badge--secondary">{user.role || 'Employee'}</span></td>
                  <td>
                    <span className="ara-badge ara-badge--primary">
                      {employeeClaimsMap[user.id] || 0}
                    </span>
                  </td>
                  <td>
                    <span className={`ara-badge ${(user.status === 'Active' || !user.status) ? 'ara-badge--success' : 'ara-badge--warning'}`}>
                      {user.status || 'Active'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
)}

{/* HR Reports Tab */}
{activeTab === "hr" && (
  <div className="ara-data-card">
    <div className="ara-data-card__header">
      <h5 className="ara-data-card__title">HR Performance Overview</h5>
      <CSVLink 
        data={hrWorkload} 
        filename="hr_report.csv"
        className="ara-btn ara-btn--success"
      >
        <i className="bi bi-download"></i>CSV
      </CSVLink>
    </div>
    <div className="ara-data-card__body ara-data-card__body--no-padding">
      <div className="ara-table-responsive">
        <table className="ara-table">
          <thead>
            <tr>
              <th>HR Name</th>
              <th>Approved</th>
              <th>Rejected</th>
              <th>Pending</th>
              <th>Total Processed</th>
              <th>Approval Rate</th>
              <th>Workload</th>
            </tr>
          </thead>
          <tbody>
            {hrs.map(hr => {
              const hrClaims = filteredClaims.filter(
                claim => Number(claim.assignedHrId) === Number(hr.id)
              );

              const approved = hrClaims.filter(c => c.status === "Approved").length;
              const rejected = hrClaims.filter(c => c.status === "Rejected").length;
              const pending = hrClaims.filter(c => c.status === "Pending").length;
              const total = hrClaims.length;
              const approvalRate = total > 0 ? ((approved / total) * 100).toFixed(1) : 0;

              return (
                <tr key={hr.hrId || hr.id}>
                  <td>{hr.name || 'HR User'}</td>
                  <td><span className="ara-badge ara-badge--success">{approved}</span></td>
                  <td><span className="ara-badge ara-badge--danger">{rejected}</span></td>
                  <td><span className="ara-badge ara-badge--warning">{pending}</span></td>
                  <td><span className="ara-badge ara-badge--primary">{total}</span></td>
                  <td><span className="ara-badge ara-badge--info">{approvalRate}%</span></td>
                  <td>
                    <div className="ara-progress">
                      <div 
                        className="ara-progress__bar ara-progress__bar--success" 
                        style={{ width: `${total > 0 ? (approved / total) * 100 : 0}%` }}
                      ></div>
                      <div 
                        className="ara-progress__bar ara-progress__bar--danger" 
                        style={{ width: `${total > 0 ? (rejected / total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  </div>
)}

      {/* Agent Reports Tab */}
      {activeTab === "agents" && (
        <div className="ara-content-grid ara-content-grid--6-6">
          <div className="ara-data-card">
            <div className="ara-data-card__body">
              <div className="ara-agent-info">
                <i className="bi bi-person-badge ara-agent-info__icon"></i>
                <div className="ara-agent-info__count">{totalAgents}</div>
                <h5 className="ara-agent-info__title">Total Agents</h5>
                <p className="ara-agent-info__description">Active insurance agents in the system</p>
              </div>
            </div>
          </div>
          <div className="ara-data-card">
            <div className="ara-data-card__header">
              <h5 className="ara-data-card__title">Agent List</h5>
            </div>
            <div className="ara-data-card__body ara-data-card__body--no-padding">
              <div className="ara-table-responsive">
                <table className="ara-table">
                  <thead>
                    <tr>
                      <th>Agent Name</th>
                      <th>Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agents.slice(0, 5).map(agent => (
                      <tr key={agent.agentId || agent.id}>
                        <td>{agent.name || 'N/A'}</td>
                        <td>{agent.email || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Policy Reports Tab */}
      {activeTab === "policies" && (
        <div className="ara-data-card">
          <div className="ara-data-card__header">
            <h5 className="ara-data-card__title">Policy Usage Analytics</h5>
            <CSVLink 
              data={policyUsage} 
              filename="policy_report.csv"
              className="ara-btn ara-btn--success"
            >
              <i className="bi bi-download"></i>CSV
            </CSVLink>
          </div>
          <div className="ara-data-card__body ara-data-card__body--no-padding">
            <div className="ara-table-responsive">
              <table className="ara-table">
                <thead>
                  <tr>
                    <th>Policy Name</th>
                    <th>Type</th>
                    <th>Claims Count</th>
                    <th>Total Amount (₹)</th>
                    <th>Avg per Claim (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {policyUsage.map(policy => (
                    <tr key={policy.policyId || policy.id}>
                      <td>{policy.policyName}</td>
                      <td><span className="ara-badge ara-badge--secondary">{policy.policyType}</span></td>
                      <td><span className="ara-badge ara-badge--primary">{policy.claimCount}</span></td>
                      <td>{formatCurrency(policy.totalAmount)}</td>
                      <td>{formatCurrency(policy.avgPerClaim)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

{/* Claims Reports Tab */}
{activeTab === "claims" && (
  <div className="ara-content-grid ara-content-grid--4-8">
    {/* Claims Summary */}
    <div className="ara-data-card">
      <div className="ara-data-card__body">
        <h5 className="ara-data-card__title" style={{ marginBottom: '1rem' }}>Claims Summary</h5>
        <div className="ara-claims-summary">
          {claimsByStatus.map(status => (
            <div key={status.name} className="ara-claims-summary__box">
              <div className="ara-claims-summary__value" style={{ color: status.color }}>
                {status.value}
              </div>
              <div className="ara-claims-summary__label">{status.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Recent Claims Activity */}
    <div className="ara-data-card">
      <div className="ara-data-card__header">
        <h5 className="ara-data-card__title">Recent Claims Activity</h5>
      </div>
      <div className="ara-data-card__body ara-data-card__body--no-padding">
        <div className="ara-table-responsive">
          <table className="ara-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Policy</th>
                <th>Amount (₹)</th>
                <th>Date</th>
                <th>Status</th>
                <th>Assigned HR</th>
              </tr>
            </thead>
            <tbody>
              {filteredClaims.slice(0, 10).map(claim => {
                const employee = users.find(u => u.id === claim.employeeId);
                const hr = hrs.find(h => h.id === claim.assignedHrId);

                return (
                  <tr key={claim.id}>
                    <td>{employee ? employee.name : `Emp#${claim.employeeId}`}</td>
                    <td>{claim.policyName || "N/A"}</td>
                    <td>{formatCurrency(claim.amount)}</td>
                    <td>{new Date(claim.claimDate).toLocaleDateString()}</td>
                    <td>
                      <span
                        className={`ara-badge ara-badge--${
                          claim.status === "Approved"
                            ? "success"
                            : claim.status === "Rejected"
                            ? "danger"
                            : "warning"
                        }`}
                      >
                        {claim.status}
                      </span>
                    </td>
                    <td>{hr ? hr.name : "Not Assigned"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
)}

      {/* Export Section */}
      <div className="ara-export-card">
        <div className="ara-export-card__header">
          <h5 className="ara-export-card__title">Export Reports</h5>
        </div>
        <div className="ara-export-card__body">
          <div className="ara-export-grid">
            <button className="ara-btn ara-btn--outline-danger ara-btn--full" onClick={downloadFullPDFReport}>
              <i className="bi bi-file-pdf"></i>Full PDF Report
            </button>
            <CSVLink data={getEmployeesForCSV()} filename="employees_report.csv" className="ara-btn ara-btn--outline-primary ara-btn--full">
              <i className="bi bi-file-spreadsheet"></i>Employees CSV
            </CSVLink>
            <CSVLink data={claims} filename="claims_report.csv" className="ara-btn ara-btn--outline-success ara-btn--full">
              <i className="bi bi-file-spreadsheet"></i>Claims CSV
            </CSVLink>
            <CSVLink data={policies} filename="policies_report.csv" className="ara-btn ara-btn--outline-warning ara-btn--full">
              <i className="bi bi-file-spreadsheet"></i>Policies CSV
            </CSVLink>
          </div>
        </div>
      </div>
    </div>
  );
}
