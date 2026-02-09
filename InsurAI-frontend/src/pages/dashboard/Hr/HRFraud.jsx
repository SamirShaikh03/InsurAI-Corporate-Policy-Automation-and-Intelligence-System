// src/pages/dashboard/Hr/HRFraud.jsx
import React, { useEffect, useState, useMemo } from "react";
import { Bar, Pie, Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from "chart.js";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { API_BASE_URL } from "../../../config";

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

const HRFraud = () => {
  const [fraudAlerts, setFraudAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "asc" });
  const [viewingAlert, setViewingAlert] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchFraudAlerts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/hr/claims/fraud`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      setFraudAlerts(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching fraud alerts:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFraudAlerts();
  }, []);

  const [employees, setEmployees] = useState([]);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const data = await res.json();
      setEmployees(data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  useEffect(() => {
    fetchFraudAlerts();
    fetchEmployees();
  }, []);

  const employeeMap = useMemo(() => {
    const map = {};
    employees.forEach(emp => {
      map[emp.id] = emp.employeeId;
    });
    return map;
  }, [employees]);

  // Filtered and sorted alerts
  const enhancedAlerts = useMemo(() => {
    let filtered = fraudAlerts.filter((alert) => {
      const matchesSearch =
        alert.employeeId.toString().includes(searchTerm) ||
        alert.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.policyName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "All" ? true : statusFilter === "Pending" ? alert.status === "Pending" : alert.status === "Resolved";
      return matchesSearch && matchesStatus;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        if (sortConfig.key === "amount") { aVal = parseFloat(aVal); bVal = parseFloat(bVal); }
        else if (sortConfig.key === "claimDate") { aVal = new Date(aVal); bVal = new Date(bVal); }
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [fraudAlerts, searchTerm, sortConfig, statusFilter]);

  const handleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const SortIndicator = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <i className="bi bi-arrow-down-up ms-1" style={{ opacity: 0.4 }}></i>;
    return sortConfig.direction === 'asc' ? 
      <i className="bi bi-arrow-up ms-1" style={{ color: 'var(--hr-primary)' }}></i> : 
      <i className="bi bi-arrow-down ms-1" style={{ color: 'var(--hr-primary)' }}></i>;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(amount);
  };

  // Statistics
  const stats = useMemo(() => {
    const total = fraudAlerts.length;
    const pending = fraudAlerts.filter((a) => a.status === "Pending").length;
    const resolved = fraudAlerts.filter((a) => a.status === "Resolved").length;
    const totalAmount = fraudAlerts.reduce((sum, a) => sum + (parseFloat(a.amount) || 0), 0);
    const pendingAmount = fraudAlerts.filter((a) => a.status === "Pending").reduce((sum, a) => sum + (parseFloat(a.amount) || 0), 0);
    const resolvedAmount = totalAmount - pendingAmount;
    return { total, pending, resolved, totalAmount, pendingAmount, resolvedAmount };
  }, [fraudAlerts]);

  // Chart Data with HR Theme Colors
  const monthlyData = useMemo(() => {
    const monthMap = {};
    fraudAlerts.forEach((a) => {
      const month = new Date(a.claimDate).toLocaleString("default", { month: "short", year: "numeric" });
      if (!monthMap[month]) monthMap[month] = 0;
      monthMap[month] += a.amount;
    });
    return {
      labels: Object.keys(monthMap),
      datasets: [{
        label: "Total Amount Flagged",
        data: Object.values(monthMap),
        backgroundColor: "#0d9488",
        borderRadius: 6,
      }],
    };
  }, [fraudAlerts]);

  const statusPieData = useMemo(() => ({
    labels: ["Pending", "Resolved"],
    datasets: [{
      data: [stats.pending, stats.resolved],
      backgroundColor: ["#f59e0b", "#10b981"],
    }],
  }), [stats]);

  const lineData = useMemo(() => {
    const monthMap = {};
    fraudAlerts.forEach((a) => {
      const month = new Date(a.claimDate).toLocaleString("default", { month: "short", year: "numeric" });
      if (!monthMap[month]) monthMap[month] = 0;
      if (a.status === "Resolved") monthMap[month] += a.amount;
    });
    return {
      labels: Object.keys(monthMap),
      datasets: [{
        label: "Amount Saved",
        data: Object.values(monthMap),
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        fill: true,
        tension: 0.4,
      }],
    };
  }, [fraudAlerts]);

  const exportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Claim ID", "Employee ID", "Title", "Policy", "Amount", "Status", "Fraud Reason"];
    const tableRows = enhancedAlerts.map((a) => [
      a.id,
      employeeMap[a.employeeId] || `EMP_${a.employeeId}`,
      a.title,
      a.policyName,
      formatCurrency(a.amount),
      a.status,
      a.fraudReason?.split(";").map((r) => r.trim()).join("\n") || "-",
    ]);
    doc.autoTable({ head: [tableColumn], body: tableRows });
    doc.save("fraud_alerts.pdf");
  };

  if (loading) return (
    <div className="hr-loading-state">
      <div className="hr-loading-spinner"></div>
      <p>Loading fraud alerts...</p>
    </div>
  );

  return (
    <div className="hr-fraud-page">
      {/* Page Header */}
      <div className="hr-page-header">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <h1 className="hr-page-title">Fraud Detection Management</h1>
            <p className="hr-page-subtitle">Monitor and manage suspected fraudulent claims</p>
          </div>
          <div className="d-flex gap-2">
            <CSVLink data={enhancedAlerts} filename="fraud_alerts.csv" className="hr-btn hr-btn--outline">
              <i className="bi bi-file-earmark-spreadsheet me-2"></i>Export CSV
            </CSVLink>
            <button className="hr-btn hr-btn--primary" onClick={exportPDF}>
              <i className="bi bi-file-earmark-pdf me-2"></i>Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="hr-stats-grid" style={{ marginBottom: '24px' }}>
        <div className="hr-stat-card hr-stat-card--primary">
          <div className="hr-stat-header">
            <div className="hr-stat-icon hr-stat-icon--primary"><i className="bi bi-exclamation-triangle"></i></div>
          </div>
          <div className="hr-stat-value">{stats.total}</div>
          <div className="hr-stat-label">Total Alerts</div>
        </div>
        
        <div className="hr-stat-card hr-stat-card--warning">
          <div className="hr-stat-header">
            <div className="hr-stat-icon hr-stat-icon--warning"><i className="bi bi-clock"></i></div>
          </div>
          <div className="hr-stat-value">{stats.pending}</div>
          <div className="hr-stat-label">Pending</div>
        </div>
        
        <div className="hr-stat-card hr-stat-card--success">
          <div className="hr-stat-header">
            <div className="hr-stat-icon hr-stat-icon--success"><i className="bi bi-check-circle"></i></div>
          </div>
          <div className="hr-stat-value">{stats.resolved}</div>
          <div className="hr-stat-label">Resolved</div>
        </div>
        
        <div className="hr-stat-card hr-stat-card--danger">
          <div className="hr-stat-header">
            <div className="hr-stat-icon hr-stat-icon--danger"><i className="bi bi-currency-rupee"></i></div>
          </div>
          <div className="hr-stat-value">{formatCurrency(stats.totalAmount)}</div>
          <div className="hr-stat-label">Total Flagged</div>
        </div>
        
        <div className="hr-stat-card">
          <div className="hr-stat-header">
            <div className="hr-stat-icon" style={{ background: 'var(--hr-subtle)', color: 'var(--hr-secondary)' }}>
              <i className="bi bi-hourglass-split"></i>
            </div>
          </div>
          <div className="hr-stat-value">{formatCurrency(stats.pendingAmount)}</div>
          <div className="hr-stat-label">Pending Amount</div>
        </div>
        
        <div className="hr-stat-card hr-stat-card--success">
          <div className="hr-stat-header">
            <div className="hr-stat-icon hr-stat-icon--success"><i className="bi bi-piggy-bank"></i></div>
          </div>
          <div className="hr-stat-value">{formatCurrency(stats.resolvedAmount)}</div>
          <div className="hr-stat-label">Amount Saved</div>
        </div>
      </div>

      {/* Charts */}
      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <div className="hr-card h-100">
            <div className="hr-card-header">
              <h3 className="hr-card-title"><i className="bi bi-bar-chart"></i>Monthly Fraud Amounts</h3>
            </div>
            <div className="hr-card-body">
              <Bar data={monthlyData} options={{ responsive: true, maintainAspectRatio: true }} />
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="hr-card h-100">
            <div className="hr-card-header">
              <h3 className="hr-card-title"><i className="bi bi-pie-chart"></i>Status Distribution</h3>
            </div>
            <div className="hr-card-body d-flex align-items-center justify-content-center">
              <Pie data={statusPieData} options={{ responsive: true, maintainAspectRatio: true }} />
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="hr-card h-100">
            <div className="hr-card-header">
              <h3 className="hr-card-title"><i className="bi bi-graph-up-arrow"></i>Amount Saved</h3>
            </div>
            <div className="hr-card-body d-flex align-items-center justify-content-center">
              <Line data={lineData} options={{ responsive: true, maintainAspectRatio: true }} />
            </div>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="hr-card" style={{ marginBottom: '24px' }}>
        <div className="hr-card-body">
          <div className="row g-3 align-items-center">
            <div className="col-md-6">
              <div className="hr-search-wrapper" style={{ maxWidth: '100%' }}>
                <i className="bi bi-search hr-search-icon"></i>
                <input type="text" className="hr-search-input" placeholder="Search by Employee, Policy, Type..."
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>
            <div className="col-md-3">
              <select className="hr-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
            <div className="col-md-3">
              <button className="hr-btn hr-btn--outline w-100" onClick={() => { setSearchTerm(""); setStatusFilter("All"); }}>
                <i className="bi bi-x-circle me-1"></i>Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="hr-card">
        <div className="hr-card-header">
          <h3 className="hr-card-title"><i className="bi bi-shield-exclamation"></i>Fraud Alerts</h3>
          <span className="hr-badge hr-badge--danger">{enhancedAlerts.length} alerts</span>
        </div>
        <div className="hr-card-body" style={{ padding: 0 }}>
          <div className="hr-table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="hr-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort("id")} style={{ cursor: 'pointer' }}>Claim ID <SortIndicator columnKey="id" /></th>
                  <th onClick={() => handleSort("employeeId")} style={{ cursor: 'pointer' }}>Employee ID <SortIndicator columnKey="employeeId" /></th>
                  <th>Type</th>
                  <th>Policy</th>
                  <th onClick={() => handleSort("amount")} style={{ cursor: 'pointer', textAlign: 'right' }}>Amount <SortIndicator columnKey="amount" /></th>
                  <th onClick={() => handleSort("claimDate")} style={{ cursor: 'pointer' }}>Date <SortIndicator columnKey="claimDate" /></th>
                  <th>Status</th>
                  <th>Fraud Flag</th>
                  <th style={{ minWidth: '180px' }}>Fraud Reasons</th>
                  <th>Docs</th>
                </tr>
              </thead>
              <tbody>
                {enhancedAlerts.length === 0 ? (
                  <tr>
                    <td colSpan="10">
                      <div className="hr-empty-state">
                        <div className="hr-empty-state__icon"><i className="bi bi-shield-check"></i></div>
                        <h4 className="hr-empty-state__title">No Fraud Alerts</h4>
                        <p className="hr-empty-state__desc">No fraud alerts match your current filters.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  enhancedAlerts.map((a) => (
                    <tr key={a.id} onClick={() => setViewingAlert(a)} style={{ cursor: 'pointer' }}>
                      <td><span style={{ fontWeight: 600, color: 'var(--hr-primary)' }}>#{a.id}</span></td>
                      <td>{employeeMap[a.employeeId] || `EMP_${a.employeeId}`}</td>
                      <td><span className="hr-badge hr-badge--neutral">{a.title}</span></td>
                      <td><small style={{ color: 'var(--hr-text-muted)' }}>{a.policyName}</small></td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--hr-danger)' }}>{formatCurrency(a.amount)}</td>
                      <td><small style={{ color: 'var(--hr-text-muted)' }}>{a.claimDate?.split("T")[0]}</small></td>
                      <td><span className={`hr-badge hr-badge--${a.status === "Pending" ? "warning" : "success"}`}>{a.status}</span></td>
                      <td>{a.fraudFlag ? <span className="hr-badge hr-badge--danger">Yes</span> : <span className="hr-badge hr-badge--success">No</span>}</td>
                      <td>
                        <div className="hr-fraud-reasons">
                          {a.fraudReason?.split(";").slice(0, 2).map((r, i) => r.trim() && <div key={i} className="hr-fraud-reason">• {r.trim()}</div>)}
                          {a.fraudReason?.split(";").length > 2 && <small style={{ color: 'var(--hr-text-muted)' }}>+{a.fraudReason.split(";").length - 2} more</small>}
                        </div>
                      </td>
                      <td>
                        {a.documents?.length > 0 ? (
                          <span className="hr-badge hr-badge--info">{a.documents.length} docs</span>
                        ) : <span style={{ color: 'var(--hr-text-light)' }}>—</span>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {viewingAlert && (
        <div className="hr-modal-backdrop" onClick={() => setViewingAlert(null)}>
          <div className="hr-modal hr-modal--lg" onClick={(e) => e.stopPropagation()}>
            <div className="hr-modal-header" style={{ background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)' }}>
              <h3 className="hr-modal-title"><i className="bi bi-shield-exclamation me-2"></i>Fraud Alert #{viewingAlert.id}</h3>
              <button type="button" className="hr-modal-close" onClick={() => setViewingAlert(null)}><i className="bi bi-x-lg"></i></button>
            </div>
            <div className="hr-modal-body">
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="hr-info-card">
                    <h6 className="hr-info-card__title"><i className="bi bi-info-circle me-2"></i>Claim Details</h6>
                    <div className="hr-info-card__body">
                      <div className="hr-detail-group">
                        <label className="hr-detail-label">Employee ID</label>
                        <p className="hr-detail-value">{employeeMap[viewingAlert.employeeId] || `EMP_${viewingAlert.employeeId}`}</p>
                      </div>
                      <div className="hr-detail-group">
                        <label className="hr-detail-label">Claim Type</label>
                        <p className="hr-detail-value">{viewingAlert.title}</p>
                      </div>
                      <div className="hr-detail-group">
                        <label className="hr-detail-label">Policy</label>
                        <p className="hr-detail-value">{viewingAlert.policyName}</p>
                      </div>
                      <div className="hr-detail-group">
                        <label className="hr-detail-label">Amount</label>
                        <p className="hr-detail-value" style={{ color: 'var(--hr-danger)', fontWeight: 700, fontSize: '1.25rem' }}>{formatCurrency(viewingAlert.amount)}</p>
                      </div>
                      <div className="hr-detail-group">
                        <label className="hr-detail-label">Claim Date</label>
                        <p className="hr-detail-value">{viewingAlert.claimDate?.split("T")[0]}</p>
                      </div>
                      <div className="hr-detail-group" style={{ marginBottom: 0 }}>
                        <label className="hr-detail-label">Status</label>
                        <p className="hr-detail-value">
                          <span className={`hr-badge hr-badge--${viewingAlert.status === "Pending" ? "warning" : "success"}`}>{viewingAlert.status}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="hr-info-card">
                    <h6 className="hr-info-card__title" style={{ background: 'rgba(220, 38, 38, 0.1)', color: '#dc2626' }}>
                      <i className="bi bi-exclamation-triangle me-2"></i>Fraud Analysis
                    </h6>
                    <div className="hr-info-card__body">
                      <div className="hr-detail-group">
                        <label className="hr-detail-label">Fraud Reasons</label>
                        <ul className="hr-fraud-list">
                          {viewingAlert.fraudReason?.split(";").map((r, i) => r.trim() && <li key={i}>{r.trim()}</li>)}
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="hr-info-card" style={{ marginTop: '16px' }}>
                    <h6 className="hr-info-card__title"><i className="bi bi-folder me-2"></i>Documents</h6>
                    <div className="hr-info-card__body">
                      {viewingAlert.documents?.length > 0 ? (
                        <div className="hr-doc-list">
                          {viewingAlert.documents.map((doc, i) => {
                            const filename = doc.split('/').pop();
                            const displayName = filename.includes('_') ? filename.substring(filename.indexOf('_') + 1) : filename;
                            return (
                              <a key={i} href={`${API_BASE_URL}/api/files/download/${filename}`} target="_blank" rel="noreferrer" className="hr-doc-item">
                                <i className="bi bi-file-earmark"></i>
                                <span>{displayName || `Document ${i + 1}`}</span>
                                <i className="bi bi-download" style={{ marginLeft: 'auto' }}></i>
                              </a>
                            );
                          })}
                        </div>
                      ) : <p style={{ color: 'var(--hr-text-muted)', margin: 0 }}>No documents attached</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="hr-modal-footer">
              <button type="button" className="hr-btn hr-btn--secondary" onClick={() => setViewingAlert(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .hr-fraud-page .hr-stats-grid { grid-template-columns: repeat(6, 1fr); }
        @media (max-width: 1200px) { .hr-fraud-page .hr-stats-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 768px) { .hr-fraud-page .hr-stats-grid { grid-template-columns: repeat(2, 1fr); } }
        
        .hr-fraud-reasons { font-size: 0.8rem; }
        .hr-fraud-reason { color: var(--hr-danger, #dc2626); margin-bottom: 2px; }
        
        .hr-fraud-list { margin: 0; padding-left: 20px; }
        .hr-fraud-list li { color: var(--hr-danger, #dc2626); margin-bottom: 8px; font-size: 0.95rem; }
        
        .hr-loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; color: var(--hr-text-muted); }
        .hr-loading-spinner { width: 48px; height: 48px; border: 4px solid var(--hr-subtle); border-top-color: var(--hr-primary); border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 16px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        
        .hr-modal--lg { max-width: 800px; }
        .hr-modal-backdrop { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
        .hr-modal { background: var(--hr-surface, #fff); border-radius: var(--hr-radius-lg, 14px); width: 100%; max-width: 700px; max-height: 90vh; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
        .hr-modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; background: linear-gradient(135deg, var(--hr-primary-dark, #0f766e) 0%, var(--hr-primary, #0d9488) 100%); color: #fff; }
        .hr-modal-title { font-size: 1.1rem; font-weight: 600; margin: 0; display: flex; align-items: center; }
        .hr-modal-close { background: rgba(255,255,255,0.15); border: none; color: #fff; width: 36px; height: 36px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s; }
        .hr-modal-close:hover { background: rgba(255,255,255,0.25); }
        .hr-modal-body { padding: 24px; overflow-y: auto; max-height: calc(90vh - 140px); }
        .hr-modal-footer { padding: 16px 24px; border-top: 1px solid var(--hr-border, #e2e8f0); display: flex; justify-content: flex-end; gap: 12px; }
        
        .hr-info-card { background: var(--hr-subtle, #f1f5f9); border-radius: var(--hr-radius, 10px); overflow: hidden; }
        .hr-info-card__title { padding: 16px 20px; margin: 0; background: rgba(13, 148, 136, 0.08); font-size: 0.95rem; font-weight: 600; color: var(--hr-primary, #0d9488); border-bottom: 1px solid var(--hr-border, #e2e8f0); }
        .hr-info-card__body { padding: 20px; }
        .hr-detail-group { margin-bottom: 16px; }
        .hr-detail-label { display: block; font-size: 0.8rem; font-weight: 600; color: var(--hr-text-muted, #64748b); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
        .hr-detail-value { margin: 0; font-size: 1rem; color: var(--hr-text, #0f172a); }
        
        .hr-doc-list { display: flex; flex-direction: column; gap: 8px; }
        .hr-doc-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: #fff; border-radius: var(--hr-radius, 10px); text-decoration: none; color: var(--hr-text, #0f172a); transition: all 0.2s; border: 1px solid var(--hr-border, #e2e8f0); }
        .hr-doc-item:hover { background: var(--hr-primary-subtle, rgba(13, 148, 136, 0.08)); color: var(--hr-primary, #0d9488); border-color: var(--hr-primary, #0d9488); }
      `}</style>
    </div>
  );
};

export default HRFraud;
