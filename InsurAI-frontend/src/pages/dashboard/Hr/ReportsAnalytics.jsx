import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import { CSVLink } from "react-csv";

// HR Theme Color constants
const COLORS = {
  PRIMARY: '#0d9488',
  PRIMARY_DARK: '#0f766e',
  PRIMARY_LIGHT: '#14b8a6',
  SECONDARY: '#475569',
  ACCENT: '#f59e0b',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  DANGER: '#ef4444',
  INFO: '#0ea5e9',
  TEXT: '#0f172a',
  TEXT_MUTED: '#64748b',
  TEXT_LIGHT: '#94a3b8',
  SURFACE: '#ffffff',
  BACKGROUND: '#f8fafc',
  BORDER: '#e2e8f0',
  SUBTLE: '#f1f5f9'
};

// Chart colors for HR theme
const CHART_COLORS = ['#0d9488', '#f59e0b', '#10b981', '#0ea5e9', '#8b5cf6', '#ec4899'];
const STATUS_COLORS = { 
  "Pending": COLORS.WARNING, 
  "Approved": COLORS.SUCCESS, 
  "Rejected": COLORS.DANGER 
};

export default function ReportsAnalytics({ mappedClaims, policies }) {
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("all");
  const [displayedClaims, setDisplayedClaims] = useState([]);
  const [reportHistory, setReportHistory] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState("All");
  const [chartType, setChartType] = useState("pie");
  const [activeTab, setActiveTab] = useState("overview");

  // Load report history
  useEffect(() => {
    const savedHistory = localStorage.getItem("reportHistory");
    if (savedHistory) setReportHistory(JSON.parse(savedHistory));
  }, []);

  // Filter claims based on status, date, and policy
  useEffect(() => {
    const now = new Date();
    const filtered = mappedClaims.filter(claim => {
      const statusMatch = statusFilter === "All" || claim.status === statusFilter;
      const policyMatch = selectedPolicy === "All" || claim.policyName === selectedPolicy;

      let dateMatch = true;
      if (dateFilter !== "all") {
        const claimDate = new Date(claim.claimDate);
        switch(dateFilter) {
          case "today":
            dateMatch = claimDate.toDateString() === now.toDateString();
            break;
          case "week":
            const weekAgo = new Date();
            weekAgo.setDate(now.getDate() - 7);
            dateMatch = claimDate >= weekAgo;
            break;
          case "month":
            const monthAgo = new Date();
            monthAgo.setMonth(now.getMonth() - 1);
            dateMatch = claimDate >= monthAgo;
            break;
          case "year":
            const yearAgo = new Date();
            yearAgo.setFullYear(now.getFullYear() - 1);
            dateMatch = claimDate >= yearAgo;
            break;
        }
      }

      return statusMatch && policyMatch && dateMatch;
    });

    setDisplayedClaims(filtered);
  }, [mappedClaims, statusFilter, dateFilter, selectedPolicy]);

  // Chart Data
  const claimStatusData = [
    { name: "Pending", value: mappedClaims.filter(c => c.status === "Pending").length, color: STATUS_COLORS.Pending },
    { name: "Approved", value: mappedClaims.filter(c => c.status === "Approved").length, color: STATUS_COLORS.Approved },
    { name: "Rejected", value: mappedClaims.filter(c => c.status === "Rejected").length, color: STATUS_COLORS.Rejected }
  ];

  const policyUsageData = policies ? policies.map(policy => ({
    name: policy.policyName,
    claims: mappedClaims.filter(claim => claim.policyName === policy.policyName).length,
    amount: mappedClaims.filter(claim => claim.policyName === policy.policyName)
                        .reduce((sum, claim) => sum + (parseFloat(claim.amount) || 0), 0)
  })) : [];

  const monthlyClaimData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    return months.map((month, index) => {
      const monthClaims = mappedClaims.filter(claim => {
        const claimDate = new Date(claim.claimDate);
        return claimDate.getMonth() === index && claimDate.getFullYear() === currentYear;
      });
      return {
        month,
        claims: monthClaims.length,
        amount: monthClaims.reduce((sum, claim) => sum + (parseFloat(claim.amount) || 0), 0)
      };
    });
  };

  // Statistics
  const totalAmount = mappedClaims.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
  const averageClaimAmount = mappedClaims.length ? totalAmount / mappedClaims.length : 0;
  const approvedAmount = mappedClaims.filter(c => c.status === "Approved").reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);

  // Format currency with Indian Rupee symbol
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(amount || 0);
  };

  // Save report history
  const saveReportToHistory = (reportName, type) => {
    const newReport = {
      id: Date.now(),
      name: reportName,
      generatedOn: new Date().toISOString().split('T')[0],
      type,
      data: type === 'CSV' ? displayedClaims : null,
      filter: { status: statusFilter, date: dateFilter, policy: selectedPolicy }
    };
    const updatedHistory = [newReport, ...reportHistory.slice(0, 9)];
    setReportHistory(updatedHistory);
    localStorage.setItem("reportHistory", JSON.stringify(updatedHistory));
  };

  // PDF download - Professional Report
  const downloadClaimsPDF = () => {
    if (!displayedClaims.length) return alert("No claims to download");

    const doc = new jsPDF('p', 'mm', 'a4');
    const reportName = `Claims_Report_${new Date().toISOString().split('T')[0]}`;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;

    // === HEADER SECTION ===
    // Header background
    doc.setFillColor(13, 148, 136);
    doc.rect(0, 0, pageWidth, 45, 'F');

    // Company Logo/Name
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('InsurAI', margin, 18);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Corporate Policy Automation & Intelligence', margin, 25);

    // Report Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('CLAIMS ANALYTICS REPORT', pageWidth - margin, 18, { align: 'right' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth - margin, 25, { align: 'right' });
    doc.text(`Report ID: RPT-${Date.now().toString(36).toUpperCase()}`, pageWidth - margin, 31, { align: 'right' });

    // Filter info bar
    doc.setFillColor(240, 253, 250);
    doc.rect(0, 45, pageWidth, 12, 'F');
    doc.setFontSize(8);
    doc.setTextColor(15, 118, 110);
    doc.text(`Filters Applied: Status: ${statusFilter} | Date Range: ${dateFilter} | Policy: ${selectedPolicy} | Total Records: ${displayedClaims.length}`, margin, 52);

    let yPos = 65;

    // === EXECUTIVE SUMMARY SECTION ===
    doc.setFontSize(14);
    doc.setTextColor(13, 148, 136);
    doc.setFont('helvetica', 'bold');
    doc.text('EXECUTIVE SUMMARY', margin, yPos);

    // Underline
    doc.setDrawColor(13, 148, 136);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos + 2, margin + 50, yPos + 2);

    yPos += 10;

    // Summary cards in a grid
    const cardWidth = (pageWidth - margin * 2 - 15) / 4;
    const summaryData = [
      { label: 'Total Claims', value: mappedClaims.length.toString(), color: [13, 148, 136] },
      { label: 'Approved', value: mappedClaims.filter(c => c.status === "Approved").length.toString(), color: [16, 185, 129] },
      { label: 'Pending', value: mappedClaims.filter(c => c.status === "Pending").length.toString(), color: [245, 158, 11] },
      { label: 'Rejected', value: mappedClaims.filter(c => c.status === "Rejected").length.toString(), color: [239, 68, 68] }
    ];

    summaryData.forEach((item, idx) => {
      const x = margin + (idx * (cardWidth + 5));
      doc.setFillColor(...item.color);
      doc.roundedRect(x, yPos, cardWidth, 20, 2, 2, 'F');
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text(item.value, x + cardWidth/2, yPos + 10, { align: 'center' });
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(item.label, x + cardWidth/2, yPos + 16, { align: 'center' });
    });

    yPos += 30;

    // Financial Summary Table
    doc.autoTable({
      startY: yPos,
      head: [['Financial Metric', 'Value', 'Percentage']],
      body: [
        ['Total Claims Amount', formatCurrency(totalAmount), '100%'],
        ['Approved Amount', formatCurrency(approvedAmount), totalAmount > 0 ? ((approvedAmount/totalAmount)*100).toFixed(1) + '%' : '0%'],
        ['Pending Amount', formatCurrency(mappedClaims.filter(c => c.status === "Pending").reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0)), '-'],
        ['Average Claim Value', formatCurrency(averageClaimAmount), '-'],
        ['Highest Claim', formatCurrency(Math.max(...mappedClaims.map(c => parseFloat(c.amount) || 0), 0)), '-'],
        ['Lowest Claim', formatCurrency(Math.min(...mappedClaims.filter(c => parseFloat(c.amount) > 0).map(c => parseFloat(c.amount)), 0) || 0), '-']
      ],
      theme: 'plain',
      headStyles: {
        fillColor: [241, 245, 249],
        textColor: [15, 23, 42],
        fontStyle: 'bold',
        fontSize: 9,
        cellPadding: 4
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 3,
        textColor: [51, 65, 85]
      },
      columnStyles: {
        0: { cellWidth: 60, fontStyle: 'bold' },
        1: { cellWidth: 50, halign: 'right' },
        2: { cellWidth: 35, halign: 'center' }
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: margin, right: margin }
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // === DETAILED CLAIMS DATA ===
    doc.setFontSize(14);
    doc.setTextColor(13, 148, 136);
    doc.setFont('helvetica', 'bold');
    doc.text('DETAILED CLAIMS DATA', margin, yPos);
    doc.line(margin, yPos + 2, margin + 55, yPos + 2);

    yPos += 8;

    doc.autoTable({
      startY: yPos,
      head: [['#', 'Employee', 'Emp ID', 'Claim Type', 'Amount', 'Date', 'Status', 'Policy']],
      body: displayedClaims.map((c, idx) => [
        (idx + 1).toString(),
        c.employeeName || 'N/A',
        c.employeeIdDisplay || 'N/A',
        c.title || 'N/A',
        formatCurrency(c.amount),
        c.claimDate ? new Date(c.claimDate).toLocaleDateString() : 'N/A',
        c.status || 'N/A',
        c.policyName ? (c.policyName.length > 15 ? c.policyName.substring(0, 15) + '...' : c.policyName) : 'N/A'
      ]),
      theme: 'striped',
      headStyles: {
        fillColor: [13, 148, 136],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 8,
        cellPadding: 3
      },
      bodyStyles: {
        fontSize: 7.5,
        cellPadding: 2.5,
        textColor: [51, 65, 85]
      },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 28 },
        2: { cellWidth: 18 },
        3: { cellWidth: 25 },
        4: { cellWidth: 22, halign: 'right' },
        5: { cellWidth: 22 },
        6: { cellWidth: 18, halign: 'center' },
        7: { cellWidth: 30 }
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: margin, right: margin },
      didDrawCell: (data) => {
        // Color code status column
        if (data.column.index === 6 && data.cell.section === 'body') {
          const status = data.cell.text[0];
          let color;
          if (status === 'Approved') color = [16, 185, 129];
          else if (status === 'Pending') color = [245, 158, 11];
          else if (status === 'Rejected') color = [239, 68, 68];
          if (color) {
            doc.setTextColor(...color);
            doc.setFont('helvetica', 'bold');
          }
        }
      }
    });

    // === FOOTER ON ALL PAGES ===
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      // Footer background
      doc.setFillColor(248, 250, 252);
      doc.rect(0, pageHeight - 20, pageWidth, 20, 'F');

      // Footer line
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);

      // Footer text
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'normal');
      doc.text(`InsurAI - Corporate Policy Automation & Intelligence System`, margin, pageHeight - 12);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 12, { align: 'right' });
      doc.text(`Confidential - For Internal Use Only`, pageWidth / 2, pageHeight - 7, { align: 'center' });
    }

    doc.save(`${reportName}.pdf`);
    saveReportToHistory(reportName, 'PDF');
  };

  // CSV download - Professional Format with proper escaping
  const downloadClaimsCSV = () => {
    if (!displayedClaims.length) return alert("No claims to download");

    const reportName = `Claims_Report_${new Date().toISOString().split('T')[0]}`;

    // Helper function to escape CSV values
    const escapeCSV = (value) => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // Build CSV with headers and metadata
    let csvContent = '';

    // Report header metadata
    csvContent += 'InsurAI - Claims Analytics Report\n';
    csvContent += `Generated Date,${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n`;
    csvContent += `Report ID,RPT-${Date.now().toString(36).toUpperCase()}\n`;
    csvContent += `Filters Applied,"Status: ${statusFilter} | Date: ${dateFilter} | Policy: ${selectedPolicy}"\n`;
    csvContent += `Total Records,${displayedClaims.length}\n`;
    csvContent += '\n';

    // Summary Section
    csvContent += 'EXECUTIVE SUMMARY\n';
    csvContent += 'Metric,Value\n';
    csvContent += `Total Claims,${mappedClaims.length}\n`;
    csvContent += `Approved Claims,${mappedClaims.filter(c => c.status === "Approved").length}\n`;
    csvContent += `Pending Claims,${mappedClaims.filter(c => c.status === "Pending").length}\n`;
    csvContent += `Rejected Claims,${mappedClaims.filter(c => c.status === "Rejected").length}\n`;
    csvContent += `Total Amount,${formatCurrency(totalAmount)}\n`;
    csvContent += `Approved Amount,${formatCurrency(approvedAmount)}\n`;
    csvContent += `Average Claim,${formatCurrency(averageClaimAmount)}\n`;
    csvContent += '\n';

    // Claims Data Section
    csvContent += 'DETAILED CLAIMS DATA\n';
    const headers = ['#', 'Employee Name', 'Employee ID', 'Claim Type', 'Amount (₹)', 'Submission Date', 'Status', 'Policy Name', 'Remarks'];
    csvContent += headers.join(',') + '\n';

    displayedClaims.forEach((c, idx) => {
      const row = [
        idx + 1,
        escapeCSV(c.employeeName || 'N/A'),
        escapeCSV(c.employeeIdDisplay || 'N/A'),
        escapeCSV(c.title || 'N/A'),
        c.amount || 0,
        c.claimDate ? new Date(c.claimDate).toLocaleDateString() : 'N/A',
        c.status || 'N/A',
        escapeCSV(c.policyName || 'N/A'),
        escapeCSV(c.remarks || '')
      ];
      csvContent += row.join(',') + '\n';
    });

    // Add footer
    csvContent += '\n';
    csvContent += 'Generated by InsurAI - Corporate Policy Automation & Intelligence System\n';
    csvContent += 'Confidential - For Internal Use Only\n';

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportName}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    saveReportToHistory(reportName, 'CSV');
  };

  // Download report from history
  const downloadHistoricalReport = (report) => {
    if (report.type === 'CSV' && report.data) {
      const csvContent = convertToCSV(report.data);
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${report.name}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const convertToCSV = (data) => {
    // Helper function to escape CSV values
    const escapeCSV = (value) => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headers = ["#", "Employee Name", "Employee ID", "Claim Type", "Amount (₹)", "Date", "Status", "Policy Name", "Remarks"];
    const rows = data.map((c, idx) => [
      idx + 1,
      escapeCSV(c.employeeName || 'N/A'),
      escapeCSV(c.employeeIdDisplay || 'N/A'),
      escapeCSV(c.title || 'N/A'),
      c.amount || 0,
      c.claimDate ? new Date(c.claimDate).toLocaleDateString() : 'N/A',
      c.status || 'N/A',
      escapeCSV(c.policyName || 'N/A'),
      escapeCSV(c.remarks || '')
    ]);
    return [headers, ...rows].map(e => e.join(",")).join("\n");
  };

  // Clear report history
  const clearHistory = () => {
    setReportHistory([]);
    localStorage.removeItem("reportHistory");
  };

  // Quick actions
  const quickFilter = (status) => {
    setStatusFilter(status);
    setActiveTab("overview");
  };

  return (
    <div className="hr-reports-page">
      {/* Page Header */}
      <div className="hr-page-header">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <h1 className="hr-page-title">Reports & Analytics</h1>
            <p className="hr-page-subtitle">Comprehensive insights and analytics for claims management</p>
          </div>
          <div className="hr-header-badge">
            <i className="bi bi-graph-up me-2"></i>
            Last Updated: {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="hr-tabs-nav">
        <button className={`hr-tab ${activeTab === "overview" ? "active" : ""}`} onClick={() => setActiveTab("overview")}>
          <i className="bi bi-speedometer2"></i>Overview
        </button>
        <button className={`hr-tab ${activeTab === "charts" ? "active" : ""}`} onClick={() => setActiveTab("charts")}>
          <i className="bi bi-bar-chart"></i>Charts
        </button>
        <button className={`hr-tab ${activeTab === "reports" ? "active" : ""}`} onClick={() => setActiveTab("reports")}>
          <i className="bi bi-file-earmark-text"></i>Reports
        </button>
        <button className={`hr-tab ${activeTab === "history" ? "active" : ""}`} onClick={() => setActiveTab("history")}>
          <i className="bi bi-clock-history"></i>History
        </button>
      </div>

      {/* Quick Actions */}
      <div className="hr-card" style={{ marginBottom: '24px' }}>
        <div className="hr-card-header">
          <h3 className="hr-card-title"><i className="bi bi-lightning-charge"></i>Quick Actions</h3>
        </div>
        <div className="hr-card-body">
          <div className="d-flex flex-wrap gap-2">
            <button className="hr-quick-btn" onClick={() => quickFilter("Pending")}>
              <i className="bi bi-clock"></i>Pending ({mappedClaims.filter(c => c.status === "Pending").length})
            </button>
            <button className="hr-quick-btn hr-quick-btn--success" onClick={() => quickFilter("Approved")}>
              <i className="bi bi-check-circle"></i>Approved ({mappedClaims.filter(c => c.status === "Approved").length})
            </button>
            <button className="hr-quick-btn hr-quick-btn--danger" onClick={() => quickFilter("Rejected")}>
              <i className="bi bi-x-circle"></i>Rejected ({mappedClaims.filter(c => c.status === "Rejected").length})
            </button>
            <button className="hr-quick-btn hr-quick-btn--outline" onClick={() => setStatusFilter("All")}>
              <i className="bi bi-arrow-clockwise"></i>Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="hr-card" style={{ marginBottom: '24px' }}>
        <div className="hr-card-header">
          <h3 className="hr-card-title"><i className="bi bi-funnel"></i>Filters & Controls</h3>
        </div>
        <div className="hr-card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="hr-form-label">Status Filter</label>
              <select className="hr-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="hr-form-label">Date Range</label>
              <select className="hr-select" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="year">Last Year</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="hr-form-label">Policy Filter</label>
              <select className="hr-select" value={selectedPolicy} onChange={(e) => setSelectedPolicy(e.target.value)}>
                <option value="All">All Policies</option>
                {policies && policies.map(policy => (
                  <option key={policy.policyId} value={policy.policyName}>{policy.policyName}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="hr-form-label">Displaying</label>
              <div className="hr-display-count">
                <strong>{displayedClaims.length}</strong> of <strong>{mappedClaims.length}</strong> claims
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Tab Content */}
      {activeTab === "overview" && (
        <>
          {/* Summary Cards */}
          <div className="hr-stats-grid hr-reports-stats" style={{ marginBottom: '24px' }}>
            <div className="hr-stat-card hr-stat-card--primary">
              <div className="hr-stat-header">
                <div className="hr-stat-icon hr-stat-icon--primary"><i className="bi bi-file-earmark-text"></i></div>
              </div>
              <div className="hr-stat-value">{mappedClaims.length}</div>
              <div className="hr-stat-label">Total Claims</div>
              <small className="hr-stat-subtitle">All time records</small>
            </div>
            <div className="hr-stat-card hr-stat-card--warning">
              <div className="hr-stat-header">
                <div className="hr-stat-icon hr-stat-icon--warning"><i className="bi bi-clock"></i></div>
              </div>
              <div className="hr-stat-value">{mappedClaims.filter(c => c.status === "Pending").length}</div>
              <div className="hr-stat-label">Pending Claims</div>
              <small className="hr-stat-subtitle">Awaiting approval</small>
            </div>
            <div className="hr-stat-card hr-stat-card--success">
              <div className="hr-stat-header">
                <div className="hr-stat-icon hr-stat-icon--success"><i className="bi bi-check-circle"></i></div>
              </div>
              <div className="hr-stat-value">{formatCurrency(approvedAmount)}</div>
              <div className="hr-stat-label">Approved Amount</div>
              <small className="hr-stat-subtitle">Total approved</small>
            </div>
            <div className="hr-stat-card">
              <div className="hr-stat-header">
                <div className="hr-stat-icon" style={{ background: 'rgba(14, 165, 233, 0.15)', color: '#0ea5e9' }}><i className="bi bi-currency-rupee"></i></div>
              </div>
              <div className="hr-stat-value">{formatCurrency(averageClaimAmount)}</div>
              <div className="hr-stat-label">Average Claim</div>
              <small className="hr-stat-subtitle">Per claim</small>
            </div>
          </div>

          {/* Quick Charts Overview */}
          <div className="row g-4 mb-4">
            <div className="col-md-6">
              <div className="hr-card h-100">
                <div className="hr-card-header">
                  <h3 className="hr-card-title"><i className="bi bi-pie-chart"></i>Claims Status Overview</h3>
                </div>
                <div className="hr-card-body">
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={claimStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                        {claimStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} claims`, 'Count']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="hr-card h-100">
                <div className="hr-card-header">
                  <h3 className="hr-card-title"><i className="bi bi-graph-up"></i>Monthly Trend</h3>
                </div>
                <div className="hr-card-body">
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={monthlyClaimData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip formatter={(value) => [value, 'Claims']} />
                      <Line type="monotone" dataKey="claims" stroke={COLORS.PRIMARY} strokeWidth={3} dot={{ fill: COLORS.PRIMARY }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Charts Tab Content */}
      {activeTab === "charts" && (
        <div className="row g-4 mb-4">
          <div className="col-12">
            <div className="hr-card">
              <div className="hr-card-header">
                <h3 className="hr-card-title"><i className="bi bi-bar-chart-line"></i>Advanced Analytics</h3>
                <select className="hr-select" style={{ width: 'auto' }} value={chartType} onChange={(e) => setChartType(e.target.value)}>
                  <option value="pie">Pie Chart</option>
                  <option value="bar">Bar Chart</option>
                  <option value="line">Line Chart</option>
                </select>
              </div>
              <div className="hr-card-body">
                <div className="row g-4">
                  <div className="col-md-6">
                    <h6 className="hr-chart-title">Claims Status Distribution</h6>
                    <ResponsiveContainer width="100%" height={320}>
                      {chartType === "pie" ? (
                        <PieChart>
                          <Pie data={claimStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} label>
                            {claimStatusData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                          </Pie>
                          <Tooltip /><Legend />
                        </PieChart>
                      ) : chartType === "bar" ? (
                        <BarChart data={claimStatusData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="name" stroke="#64748b" /><YAxis stroke="#64748b" /><Tooltip />
                          <Bar dataKey="value" name="Claims" radius={[6, 6, 0, 0]}>
                            {claimStatusData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                          </Bar>
                        </BarChart>
                      ) : (
                        <LineChart data={claimStatusData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="name" stroke="#64748b" /><YAxis stroke="#64748b" /><Tooltip />
                          <Line type="monotone" dataKey="value" stroke={COLORS.PRIMARY} strokeWidth={3} />
                        </LineChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                  <div className="col-md-6">
                    <h6 className="hr-chart-title">Policy Usage Analysis</h6>
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={policyUsageData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip formatter={(value, name) => name === 'amount' ? [formatCurrency(value), 'Total Amount'] : [value, 'Claims']} />
                        <Legend /><Bar dataKey="claims" name="Claims" fill={COLORS.ACCENT} radius={[6, 6, 0, 0]} />
                        <Bar dataKey="amount" name="Amount" fill={COLORS.PRIMARY} radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reports Tab Content */}
      {activeTab === "reports" && (
        <div className="row g-4 mb-4">
          <div className="col-md-4">
            <div className="hr-report-card">
              <div className="hr-report-card__icon hr-report-card__icon--danger">
                <i className="bi bi-file-earmark-pdf"></i>
              </div>
              <h5 className="hr-report-card__title">Comprehensive PDF Report</h5>
              <p className="hr-report-card__desc">Generate a detailed PDF report with executive summary, charts, and full claim details.</p>
              <button className="hr-btn hr-btn--primary w-100" onClick={downloadClaimsPDF}>
                <i className="bi bi-download me-2"></i>Download PDF
              </button>
            </div>
          </div>
          <div className="col-md-4">
            <div className="hr-report-card">
              <div className="hr-report-card__icon hr-report-card__icon--success">
                <i className="bi bi-file-earmark-spreadsheet"></i>
              </div>
              <h5 className="hr-report-card__title">Data Export (CSV)</h5>
              <p className="hr-report-card__desc">Export filtered claim data to CSV format for further analysis in Excel or other tools.</p>
              <CSVLink data={displayedClaims}
                headers={[
                  { label: "Employee Name", key: "employeeName" },
                  { label: "Employee ID", key: "employeeIdDisplay" },
                  { label: "Claim Type", key: "title" },
                  { label: "Amount", key: "amount" },
                  { label: "Date", key: "claimDate" },
                  { label: "Status", key: "status" },
                  { label: "Policy", key: "policyName" },
                  { label: "Remarks", key: "remarks" }
                ]}
                filename={`Claims_Export_${new Date().toISOString().split('T')[0]}.csv`}
                className="hr-btn hr-btn--primary w-100"
                onClick={downloadClaimsCSV}
              >
                <i className="bi bi-download me-2"></i>Export CSV
              </CSVLink>
            </div>
          </div>
          <div className="col-md-4">
            <div className="hr-report-card">
              <div className="hr-report-card__icon hr-report-card__icon--info">
                <i className="bi bi-graph-up"></i>
              </div>
              <h5 className="hr-report-card__title">Policy Analytics</h5>
              <p className="hr-report-card__desc">Policy-wise usage statistics and analytics report for strategic planning.</p>
              <CSVLink data={policyUsageData} filename={`Policy_Analytics_${new Date().toISOString().split('T')[0]}.csv`}
                className="hr-btn hr-btn--primary w-100">
                <i className="bi bi-download me-2"></i>Policy Report
              </CSVLink>
            </div>
          </div>
        </div>
      )}

      {/* History Tab Content */}
      {activeTab === "history" && (
        <div className="hr-card" style={{ marginBottom: '24px' }}>
          <div className="hr-card-header">
            <h3 className="hr-card-title"><i className="bi bi-clock-history"></i>Report Generation History</h3>
            {reportHistory.length > 0 && (
              <button className="hr-btn hr-btn--outline" onClick={clearHistory}>
                <i className="bi bi-trash me-1"></i>Clear All
              </button>
            )}
          </div>
          <div className="hr-card-body" style={{ padding: reportHistory.length === 0 ? '40px' : 0 }}>
            {reportHistory.length === 0 ? (
              <div className="hr-empty-state">
                <div className="hr-empty-state__icon"><i className="bi bi-clock-history"></i></div>
                <h4 className="hr-empty-state__title">No Report History</h4>
                <p className="hr-empty-state__desc">Generated reports will appear here for quick access.</p>
              </div>
            ) : (
              <div className="hr-table-container" style={{ border: 'none', borderRadius: 0 }}>
                <table className="hr-table">
                  <thead>
                    <tr>
                      <th>Report Name</th>
                      <th>Generated On</th>
                      <th>Type</th>
                      <th>Records</th>
                      <th>Filters Applied</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportHistory.map(report => (
                      <tr key={report.id}>
                        <td>
                          <i className={`bi ${report.type === 'PDF' ? 'bi-file-earmark-pdf' : 'bi-file-earmark-spreadsheet'} me-2`}
                             style={{ color: report.type === 'PDF' ? COLORS.DANGER : COLORS.SUCCESS }}></i>
                          {report.name}
                        </td>
                        <td>{report.generatedOn}</td>
                        <td><span className={`hr-badge ${report.type === 'PDF' ? 'hr-badge--danger' : 'hr-badge--success'}`}>{report.type}</span></td>
                        <td><span className="hr-badge hr-badge--primary">{report.data ? report.data.length : 'N/A'}</span></td>
                        <td><small style={{ color: COLORS.TEXT_MUTED }}>Status: {report.filter?.status}, Date: {report.filter?.date}, Policy: {report.filter?.policy}</small></td>
                        <td>
                          <button className="hr-btn hr-btn--icon" onClick={() => downloadHistoricalReport(report)} disabled={!report.data} title="Download">
                            <i className="bi bi-download"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="hr-card">
        <div className="hr-card-header">
          <h3 className="hr-card-title"><i className="bi bi-activity"></i>Recent Activity Summary</h3>
        </div>
        <div className="hr-card-body">
          <div className="hr-activity-grid">
            <div className="hr-activity-item">
              <div className="hr-activity-value" style={{ color: COLORS.PRIMARY }}>{mappedClaims.filter(c => new Date(c.claimDate).toDateString() === new Date().toDateString()).length}</div>
              <div className="hr-activity-label">Claims Today</div>
            </div>
            <div className="hr-activity-item">
              <div className="hr-activity-value" style={{ color: COLORS.SUCCESS }}>{mappedClaims.filter(c => c.status === "Approved" && new Date(c.claimDate).toDateString() === new Date().toDateString()).length}</div>
              <div className="hr-activity-label">Approved Today</div>
            </div>
            <div className="hr-activity-item">
              <div className="hr-activity-value" style={{ color: COLORS.WARNING }}>{mappedClaims.filter(c => c.status === "Pending" && new Date(c.claimDate).toDateString() === new Date().toDateString()).length}</div>
              <div className="hr-activity-label">Pending Today</div>
            </div>
            <div className="hr-activity-item">
              <div className="hr-activity-value" style={{ color: COLORS.INFO }}>{policies?.length || 0}</div>
              <div className="hr-activity-label">Active Policies</div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .hr-reports-page { }
        
        .hr-header-badge { display: inline-flex; align-items: center; padding: 10px 20px; background: linear-gradient(135deg, var(--hr-primary-dark, #0f766e) 0%, var(--hr-primary, #0d9488) 100%); color: #fff; border-radius: var(--hr-radius, 10px); font-size: 0.9rem; font-weight: 500; }
        
        .hr-tabs-nav { display: flex; gap: 8px; background: var(--hr-surface, #fff); padding: 8px; border-radius: var(--hr-radius-lg, 14px); margin-bottom: 24px; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06); flex-wrap: wrap; }
        .hr-tab { display: flex; align-items: center; gap: 8px; padding: 12px 24px; border: none; background: transparent; color: var(--hr-text-muted, #64748b); font-weight: 600; border-radius: var(--hr-radius, 10px); cursor: pointer; transition: all 0.25s; }
        .hr-tab:hover { background: var(--hr-subtle, #f1f5f9); color: var(--hr-primary, #0d9488); }
        .hr-tab.active { background: linear-gradient(135deg, var(--hr-primary-dark, #0f766e) 0%, var(--hr-primary, #0d9488) 100%); color: #fff; }
        .hr-tab i { font-size: 1.1rem; }
        
        .hr-quick-btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; background: linear-gradient(135deg, var(--hr-primary-dark, #0f766e) 0%, var(--hr-primary, #0d9488) 100%); color: #fff; border: none; border-radius: var(--hr-radius, 10px); font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .hr-quick-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3); }
        .hr-quick-btn--success { background: linear-gradient(135deg, #059669 0%, #10b981 100%); }
        .hr-quick-btn--danger { background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); }
        .hr-quick-btn--outline { background: transparent; color: var(--hr-primary, #0d9488); border: 2px solid var(--hr-primary, #0d9488); }
        .hr-quick-btn--outline:hover { background: var(--hr-primary, #0d9488); color: #fff; }
        
        .hr-form-label { display: block; font-size: 0.85rem; font-weight: 600; color: var(--hr-text, #0f172a); margin-bottom: 8px; }
        
        .hr-display-count { background: var(--hr-subtle, #f1f5f9); padding: 12px 16px; border-radius: var(--hr-radius, 10px); text-align: center; color: var(--hr-text-muted, #64748b); }
        .hr-display-count strong { color: var(--hr-primary, #0d9488); }
        
        .hr-reports-stats { grid-template-columns: repeat(4, 1fr); }
        @media (max-width: 992px) { .hr-reports-stats { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 576px) { .hr-reports-stats { grid-template-columns: 1fr; } }
        
        .hr-stat-subtitle { display: block; font-size: 0.75rem; color: var(--hr-text-light, #94a3b8); margin-top: 4px; }
        
        .hr-chart-title { text-align: center; color: var(--hr-text, #0f172a); font-weight: 600; margin-bottom: 16px; }
        
        .hr-report-card { background: var(--hr-surface, #fff); border-radius: var(--hr-radius-lg, 14px); padding: 32px 24px; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06); border: 1px solid var(--hr-border, #e2e8f0); text-align: center; height: 100%; display: flex; flex-direction: column; transition: all 0.25s; }
        .hr-report-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(15, 23, 42, 0.12); }
        .hr-report-card__icon { width: 72px; height: 72px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto 20px; }
        .hr-report-card__icon--danger { background: rgba(239, 68, 68, 0.12); color: #ef4444; }
        .hr-report-card__icon--success { background: rgba(16, 185, 129, 0.12); color: #10b981; }
        .hr-report-card__icon--info { background: rgba(14, 165, 233, 0.12); color: #0ea5e9; }
        .hr-report-card__title { font-size: 1.1rem; font-weight: 600; color: var(--hr-text, #0f172a); margin: 0 0 12px; }
        .hr-report-card__desc { font-size: 0.9rem; color: var(--hr-text-muted, #64748b); margin: 0 0 24px; flex-grow: 1; }
        
        .hr-activity-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        @media (max-width: 768px) { .hr-activity-grid { grid-template-columns: repeat(2, 1fr); } }
        .hr-activity-item { text-align: center; padding: 20px; background: var(--hr-subtle, #f1f5f9); border-radius: var(--hr-radius, 10px); }
        .hr-activity-value { font-size: 2rem; font-weight: 700; margin-bottom: 4px; }
        .hr-activity-label { font-size: 0.85rem; color: var(--hr-text-muted, #64748b); }
        
        .hr-btn--icon { width: 36px; height: 36px; padding: 0; display: inline-flex; align-items: center; justify-content: center; background: var(--hr-primary, #0d9488); color: #fff; border: none; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
        .hr-btn--icon:hover { background: var(--hr-primary-dark, #0f766e); }
        .hr-btn--icon:disabled { background: var(--hr-subtle, #f1f5f9); color: var(--hr-text-light, #94a3b8); cursor: not-allowed; }
      `}</style>
    </div>
  );
}