// src/components/admin/AdminFraudClaims.jsx
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "./AdminFraudClaims.css";

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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function AdminFraudClaims() {
  const [fraudClaims, setFraudClaims] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [viewingClaim, setViewingClaim] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  // Fetch fraud claims
  useEffect(() => {
    const fetchFraudClaims = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return console.error("❌ No admin token found!");

        const response = await axios.get("http://localhost:8080/admin/claims/fraud", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFraudClaims(response.data);
      } catch (error) {
        console.error("Error fetching fraud claims:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFraudClaims();
  }, []);

  // Filter + search
  const filteredClaims = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return fraudClaims.filter((claim) => {
      const matchesSearch =
        claim.employeeName?.toLowerCase().includes(query) ||
        claim.policyName?.toLowerCase().includes(query) ||
        claim.fraudReason?.toLowerCase().includes(query) ||
        claim.assignedHrName?.toLowerCase().includes(query) ||
        claim.title?.toLowerCase().includes(query);
      const matchesStatus =
        statusFilter === "All"
          ? true
          : statusFilter === "Pending"
          ? claim.status === "Pending"
          : claim.status !== "Pending";
      return matchesSearch && matchesStatus;
    });
  }, [fraudClaims, searchTerm, statusFilter]);

  // Sorting
  const sortedClaims = useMemo(() => {
    if (!sortConfig.key) return filteredClaims;
    return [...filteredClaims].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      if (sortConfig.key === "amount") {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      } else if (sortConfig.key === "claimDate") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else {
        aValue = aValue?.toString().toLowerCase();
        bValue = bValue?.toString().toLowerCase();
      }
      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredClaims, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);

  // Statistics
  const stats = useMemo(() => {
    const total = fraudClaims.length;
    const pending = fraudClaims.filter((c) => c.status === "Pending").length;
    const resolved = total - pending;
    const totalAmount = fraudClaims.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
    const pendingAmount = fraudClaims
      .filter((c) => c.status === "Pending")
      .reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
    const resolvedAmount = totalAmount - pendingAmount;
    return { total, pending, resolved, totalAmount, pendingAmount, resolvedAmount };
  }, [fraudClaims]);

  // Charts
  const monthlyData = useMemo(() => {
    const monthMap = {};
    fraudClaims.forEach((c) => {
      const month = new Date(c.claimDate).toLocaleString("default", { month: "short", year: "numeric" });
      if (!monthMap[month]) monthMap[month] = 0;
      monthMap[month] += parseFloat(c.amount) || 0;
    });
    return {
      labels: Object.keys(monthMap),
      datasets: [
        { 
          label: "Total Fraud Amount", 
          data: Object.values(monthMap), 
          backgroundColor: COLORS.SECONDARY,
          borderColor: COLORS.SECONDARY,
          borderWidth: 2
        },
      ],
    };
  }, [fraudClaims]);

  const statusPieData = useMemo(
    () => ({
      labels: ["Pending", "Resolved"],
      datasets: [{ 
        data: [stats.pending, stats.resolved], 
        backgroundColor: [COLORS.WARNING, COLORS.SUCCESS],
        borderColor: ['#fff', '#fff'],
        borderWidth: 2
      }],
    }),
    [stats]
  );

  const lineData = useMemo(() => {
    const monthMap = {};
    fraudClaims.forEach((c) => {
      const month = new Date(c.claimDate).toLocaleString("default", { month: "short", year: "numeric" });
      if (!monthMap[month]) monthMap[month] = 0;
      if (c.status !== "Pending") monthMap[month] += parseFloat(c.amount) || 0;
    });
    return {
      labels: Object.keys(monthMap),
      datasets: [
        {
          label: "Amount Saved",
          data: Object.values(monthMap),
          borderColor: COLORS.SUCCESS,
          backgroundColor: `${COLORS.SUCCESS}33`,
          fill: true,
        },
      ],
    };
  }, [fraudClaims]);

  // PDF export
  const exportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["ID", "Type", "Employee", "HR", "Claim Date", "Amount", "Status", "Fraud Reason"];
    const tableRows = sortedClaims.map((c) => [
      c.id,
      c.title,
      c.employeeName || `#${c.employeeId}`,
      c.assignedHrName || `HR #${c.assignedHrId}`,
      c.claimDate?.split("T")[0],
      formatCurrency(c.amount),
      c.status,
      c.fraudReason,
    ]);
    doc.autoTable({ head: [tableColumn], body: tableRows });
    doc.save("admin_fraud_claims.pdf");
  };

  if (loading) return (
    <div className="afc-loading">
      <div className="afc-spinner"></div>
    </div>
  );

  return (
    <div className="afc-container">
      <h3 className="afc-title">Admin Fraud Dashboard</h3>

      {/* Statistics Cards */}
      <div className="afc-stats-grid">
        {[
          { label: "Total Alerts", value: stats.total, variant: "primary" },
          { label: "Pending", value: stats.pending, variant: "warning" },
          { label: "Resolved", value: stats.resolved, variant: "success" },
          { label: "Total Amount", value: stats.totalAmount, variant: "info", isAmount: true },
          { label: "Pending Amount", value: stats.pendingAmount, variant: "muted", isAmount: true },
          { label: "Amount Saved", value: stats.resolvedAmount, variant: "success", isAmount: true },
        ].map((s, i) => (
          <div key={i} className={`afc-stat-card afc-stat-card--${s.variant}`}>
            <div className="afc-stat-card__value">
              {s.isAmount ? formatCurrency(s.value) : s.value}
            </div>
            <div className="afc-stat-card__label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="afc-charts-grid">
        <div className="afc-chart-card afc-chart-card--bar">
          <div className="afc-chart-card__header afc-chart-card__header--primary">
            Monthly Fraud Amount
          </div>
          <div className="afc-chart-card__body">
            <Bar data={monthlyData} />
          </div>
        </div>
        <div className="afc-chart-card afc-chart-card--pie">
          <div className="afc-chart-card__header afc-chart-card__header--warning">
            Status Distribution
          </div>
          <div className="afc-chart-card__body">
            <Pie data={statusPieData} />
          </div>
        </div>
        <div className="afc-chart-card afc-chart-card--line">
          <div className="afc-chart-card__header afc-chart-card__header--success">
            Amount Saved Over Time
          </div>
          <div className="afc-chart-card__body">
            <Line data={lineData} />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="afc-controls">
        <div className="afc-controls__search">
          <input
            type="text"
            className="afc-input"
            placeholder="Search by employee, policy, or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="afc-controls__filter">
          <select className="afc-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All</option>
            <option value="Pending">Pending</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
        <div className="afc-controls__actions">
          <CSVLink 
            data={sortedClaims} 
            filename="admin_fraud_claims.csv" 
            className="afc-btn afc-btn--primary"
          >
            Export CSV
          </CSVLink>
          <button 
            className="afc-btn afc-btn--primary"
            onClick={exportPDF}
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="afc-table-card">
        <div className="afc-table-card__header">
          Fraud Claims
        </div>
        <div className="afc-table-card__body">
          <div className="afc-table-responsive">
            <table className="afc-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort("id")} className="afc-sortable">ID</th>
                  <th onClick={() => handleSort("title")} className="afc-sortable">Type</th>
                  <th onClick={() => handleSort("employeeName")} className="afc-sortable">Employee</th>
                  <th onClick={() => handleSort("assignedHrName")} className="afc-sortable">Assigned HR</th>
                  <th onClick={() => handleSort("claimDate")} className="afc-sortable">Claim Date</th>
                  <th onClick={() => handleSort("amount")} className="afc-sortable afc-text-end">Amount</th>
                  <th>Status</th>
                  <th>Fraud Reason</th>
                </tr>
              </thead>
              <tbody>
                {sortedClaims.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="afc-empty-state">
                      No fraud claims found
                    </td>
                  </tr>
                ) : (
                  sortedClaims.map((c) => (
                    <tr key={c.id} onClick={() => setViewingClaim(c)} className="afc-clickable-row">
                      <td>{c.id}</td>
                      <td>{c.title}</td>
                      <td>{c.employeeName || `#${c.employeeId}`}</td>
                      <td>{c.assignedHrName || `HR #${c.assignedHrId}`}</td>
                      <td>{c.claimDate?.split("T")[0]}</td>
                      <td className="afc-text-end">{formatCurrency(c.amount)}</td>
                      <td>
                        <span className={`afc-badge afc-badge--${
                          c.status === "Pending" ? "warning" : c.status === "Approved" ? "success" : "danger"
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="afc-fraud-reason">{c.fraudReason}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {viewingClaim && (
        <div className="afc-modal-overlay" onClick={() => setViewingClaim(null)}>
          <div className="afc-modal" onClick={(e) => e.stopPropagation()}>
            <div className="afc-modal__header">
              <h5 className="afc-modal__title">Fraud Claim #{viewingClaim.id}</h5>
              <button className="afc-modal__close" onClick={() => setViewingClaim(null)}>&times;</button>
            </div>
            <div className="afc-modal__body">
              <div className="afc-modal__grid">
                <div className="afc-modal__column">
                  <p className="afc-modal__field"><strong>Employee:</strong> {viewingClaim.employeeName || `#${viewingClaim.employeeId}`}</p>
                  <p className="afc-modal__field"><strong>Assigned HR:</strong> {viewingClaim.assignedHrName || `HR #${viewingClaim.assignedHrId}`}</p>
                  <p className="afc-modal__field"><strong>Type:</strong> {viewingClaim.title}</p>
                  <p className="afc-modal__field"><strong>Policy:</strong> {viewingClaim.policyName}</p>
                </div>
                <div className="afc-modal__column">
                  <p className="afc-modal__field"><strong>Claim Date:</strong> {viewingClaim.claimDate?.split("T")[0]}</p>
                  <p className="afc-modal__field"><strong>Amount:</strong> {formatCurrency(viewingClaim.amount)}</p>
                  <p className="afc-modal__field"><strong>Status:</strong> 
                    <span className={`afc-badge afc-badge--${
                      viewingClaim.status === "Pending" ? "warning" :
                      viewingClaim.status === "Approved" ? "success" : "danger"
                    }`}>{viewingClaim.status}</span>
                  </p>
                  <p className="afc-modal__field"><strong>Fraud Flag:</strong> 
                    {viewingClaim.fraudFlag ? 
                      <span className="afc-badge afc-badge--danger">Yes</span> : 
                      <span className="afc-badge afc-badge--success">No</span>}
                  </p>
                </div>
              </div>
              <div className="afc-modal__section">
                <p className="afc-modal__section-title"><strong>Fraud Reasons:</strong></p>
                <ul className="afc-modal__list">
                  {viewingClaim.fraudReason?.split(";").map((r, i) => r.trim() && <li key={i}>{r.trim()}</li>)}
                </ul>
              </div>
              {viewingClaim.documents?.length > 0 && (
                <div className="afc-modal__section">
                  <p className="afc-modal__section-title"><strong>Attached Documents:</strong></p>
                  <ul className="afc-modal__list">
                    {viewingClaim.documents.map((doc, i) => (
                      <li key={i}>
                        <a 
                          href={`http://localhost:8080${doc}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="afc-link"
                        >
                          Document {i + 1}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="afc-modal__footer">
              <button 
                className="afc-btn afc-btn--primary"
                onClick={() => setViewingClaim(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}