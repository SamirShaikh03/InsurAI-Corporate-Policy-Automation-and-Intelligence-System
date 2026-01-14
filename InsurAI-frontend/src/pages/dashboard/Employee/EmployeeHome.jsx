// src/pages/dashboard/Employee/EmployeeHome.jsx
import React, { useMemo, useState, useEffect } from "react";
import { Line, Doughnut, Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import "./EmployeeHome.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const EmployeeHome = ({
  claims = [],
  queries = [],
  policies = [],
  setActiveTab,
  employeeData,
  agentsAvailability = []
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeChartTab, setActiveChartTab] = useState('type');

  useEffect(() => {
    console.log("Claims:", claims);
    console.log("Policies:", policies);
    console.log("Queries:", queries);
  }, [claims, policies, queries]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // -------------------- Statistics Calculation --------------------
  const dashboardStats = useMemo(() => {
    const totalClaims = claims.length;
    const approvedClaims = claims.filter(claim => claim.status === 'Approved').length;
    const pendingClaims = claims.filter(claim => claim.status === 'Pending').length;
    const totalClaimAmount = claims.reduce((sum, claim) => sum + (parseFloat(claim.amount) || 0), 0);
    
    const totalQueries = queries.length;
    const resolvedQueries = queries.filter(query => query.response && query.response.trim() !== "").length;
    
    const totalPolicies = policies.length;
    const activePolicies = policies.filter(policy => policy.status === 'Active').length;
    const totalCoverage = policies.reduce((sum, policy) => {
      const coverageValue = Number(policy.coverage?.replace(/[^0-9.-]+/g, "")) || 0;
      return sum + coverageValue;
    }, 0);

    return {
      claims: { total: totalClaims, approved: approvedClaims, pending: pendingClaims, amount: totalClaimAmount },
      queries: { total: totalQueries, resolved: resolvedQueries },
      policies: { total: totalPolicies, active: activePolicies, coverage: totalCoverage }
    };
  }, [claims, queries, policies]);

  // -------------------- 2. Policy Coverage Charts --------------------
  const policyCoverageChart = useMemo(() => {
    const policyTypes = policies.reduce((acc, policy) => {
      const type = policy.policy_type || policy.category || "General";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const coverageByProvider = policies.reduce((acc, policy) => {
      const provider = policy.provider || "Unknown";
      const coverageValue = Number(policy.coverage?.replace(/[^0-9.-]+/g, "")) || 0;
      acc[provider] = (acc[provider] || 0) + coverageValue;
      return acc;
    }, {});

    // Indigo/Coral themed colors
    return {
      byType: {
        labels: Object.keys(policyTypes),
        datasets: [{
          data: Object.values(policyTypes),
          backgroundColor: ['#4f46e5', '#f97316', '#10b981', '#6366f1', '#fb923c', '#0ea5e9'],
          borderWidth: 3,
          borderColor: '#fff'
        }]
      },
      byCoverage: {
        labels: Object.keys(coverageByProvider),
        datasets: [{
          data: Object.values(coverageByProvider),
          backgroundColor: ['#4338ca', '#f97316', '#6366f1', '#fb923c', '#10b981'],
          borderWidth: 3,
          borderColor: '#fff'
        }]
      }
    };
  }, [policies]);

  // -------------------- 3. Queries Status Chart --------------------
  const queriesStatusChart = useMemo(() => {
    const statusCounts = queries.reduce((acc, query) => {
      let status = "Open";
      if (query.response && query.response.trim() !== "") status = "Resolved";
      else if (query.status === "In Progress") status = "In Progress";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, { Open: 0, "In Progress": 0, Resolved: 0 });

    // Indigo/Coral themed colors
    return {
      doughnut: {
        labels: Object.keys(statusCounts),
        datasets: [
          {
            data: Object.values(statusCounts),
            backgroundColor: ["#f59e0b", "#4f46e5", "#10b981"],
            borderWidth: 3,
            borderColor: "#fff",
            cutout: "60%",
          },
        ],
      },
      bar: {
        labels: Object.keys(statusCounts),
        datasets: [
          {
            label: "Queries by Status",
            data: Object.values(statusCounts),
            backgroundColor: ["#f59e0b", "#4f46e5", "#10b981"],
            borderRadius: 8,
            borderWidth: 0,
          },
        ],
      },
    };
  }, [queries]);

  // -------------------- 4. Recent Activities --------------------
  const recentActivities = useMemo(() => {
    const activities = [
      ...claims.map(claim => ({
        id: `claim-${claim.id}`,
        type: 'claim',
        title: 'Claim Submitted',
        description: `${claim.title || 'Claim'} - ₹${claim.amount?.toLocaleString() || '0'}`,
        status: claim.status,
        date: claim.created_at || claim.submittedDate || new Date().toISOString(),
        icon: 'bi-wallet2',
        color: getStatusColor(claim.status)
      })),
      ...queries.map(query => ({
        id: `query-${query.id}`,
        type: 'query',
        title: query.response ? 'Query Resolved' : 'Query Asked',
        description: query.queryText?.substring(0, 50) + (query.queryText?.length > 50 ? '...' : ''),
        status: query.response ? 'Resolved' : 'Open',
        date: query.created_at || new Date().toISOString(),
        icon: 'bi-chat-dots',
        color: query.response ? 'success' : 'warning'
      })),
      ...policies.map(policy => ({
        id: `policy-${policy.id}`,
        type: 'policy',
        title: 'Policy Active',
        description: `${policy.name || 'N/A'} - ${policy.coverage || '₹0'} coverage`,
        status: policy.status || 'Active',
        date: policy.start_date || new Date().toISOString(),
        icon: 'bi-shield-check',
        color: 'info'
      }))
    ];

    return activities
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8);
  }, [claims, queries, policies]);

  // -------------------- 5. Upcoming Renewals --------------------
  const upcomingRenewals = useMemo(() => {
    const renewals = policies
      .filter((policy) => policy.renewal_date)
      .map((policy) => {
        const renewalDate = new Date(policy.renewal_date);
        const daysUntilRenewal = Math.ceil((renewalDate - currentTime) / (1000 * 60 * 60 * 24));
        return {
          ...policy,
          daysUntilRenewal,
          urgency:
            daysUntilRenewal <= 7
              ? "high"
              : daysUntilRenewal <= 14
              ? "medium"
              : "low",
        };
      })
      .filter((policy) => policy.daysUntilRenewal > 0 && policy.daysUntilRenewal <= 30)
      .sort((a, b) => a.daysUntilRenewal - b.daysUntilRenewal);

    return renewals;
  }, [policies, currentTime]);

  // -------------------- 6. Quick Actions --------------------
  const quickActions = [
    { id: 1, label: "Submit Claim", icon: "bi-plus-circle", tab: "newClaim", color: "primary", description: "File a new insurance claim" },
    { id: 2, label: "Ask Question", icon: "bi-question-circle", tab: "askQuery", color: "accent", description: "Get help from our agents" },
    { id: 3, label: "View Policies", icon: "bi-file-text", tab: "policies", color: "success", description: "Check your policy details" },
    { id: 4, label: "Download Docs", icon: "bi-download", tab: "policies", color: "warning", description: "Access policy documents" },
    { id: 5, label: "Support", icon: "bi-headset", tab: "support", color: "info", description: "Contact customer support" },
    { id: 6, label: "My Queries", icon: "bi-chat-left", tab: "myQueries", color: "secondary", description: "Check query status" },
  ];

  // -------------------- Helper Functions --------------------
  function getStatusColor(status) {
    if (!status) return "secondary";
    const s = status.toLowerCase();
    if (s.includes("approve")) return "success";
    if (s.includes("reject")) return "danger";
    if (s.includes("pending") || s.includes("review")) return "warning";
    return "secondary";
  }

  const formatCurrency = (amount) => `₹${amount?.toLocaleString("en-IN") || "0"}`;

  // -------------------- Render Functions --------------------

  const renderStatsCards = () => (
    <div className="emp-home-stats-grid">
      {/* Claims Stats */}
      <div className="emp-home-stat-card emp-home-stat-primary">
        <div className="emp-home-stat-icon">
          <i className="bi bi-wallet2"></i>
        </div>
        <div className="emp-home-stat-content">
          <span className="emp-home-stat-label">Total Claims</span>
          <h3 className="emp-home-stat-value">{dashboardStats.claims.total}</h3>
          <span className="emp-home-stat-sub">
            ₹{dashboardStats.claims.amount.toLocaleString('en-IN')} total value
          </span>
        </div>
        <div className="emp-home-stat-trend emp-home-trend-up">
          <i className="bi bi-arrow-up-right"></i>
          <span>{dashboardStats.claims.approved} approved</span>
        </div>
      </div>

      {/* Policies Stats */}
      <div className="emp-home-stat-card emp-home-stat-success">
        <div className="emp-home-stat-icon">
          <i className="bi bi-shield-check"></i>
        </div>
        <div className="emp-home-stat-content">
          <span className="emp-home-stat-label">Active Policies</span>
          <h3 className="emp-home-stat-value">{dashboardStats.policies.active}</h3>
          <span className="emp-home-stat-sub">
            ₹{dashboardStats.policies.coverage.toLocaleString('en-IN')} coverage
          </span>
        </div>
        <div className="emp-home-stat-trend emp-home-trend-neutral">
          <i className="bi bi-check-circle"></i>
          <span>{dashboardStats.policies.total} total</span>
        </div>
      </div>

      {/* Queries Stats */}
      <div className="emp-home-stat-card emp-home-stat-accent">
        <div className="emp-home-stat-icon">
          <i className="bi bi-chat-left-text"></i>
        </div>
        <div className="emp-home-stat-content">
          <span className="emp-home-stat-label">Support Queries</span>
          <h3 className="emp-home-stat-value">{dashboardStats.queries.total}</h3>
          <span className="emp-home-stat-sub">
            {dashboardStats.queries.resolved} resolved
          </span>
        </div>
        <div className="emp-home-stat-trend emp-home-trend-up">
          <i className="bi bi-graph-up"></i>
          <span>{Math.round((dashboardStats.queries.resolved / Math.max(dashboardStats.queries.total, 1)) * 100)}% resolved</span>
        </div>
      </div>

      {/* Renewals Stats */}
      <div className="emp-home-stat-card emp-home-stat-warning">
        <div className="emp-home-stat-icon">
          <i className="bi bi-calendar-check"></i>
        </div>
        <div className="emp-home-stat-content">
          <span className="emp-home-stat-label">Upcoming Renewals</span>
          <h3 className="emp-home-stat-value">{upcomingRenewals.length}</h3>
          <span className="emp-home-stat-sub">
            Next 30 days
          </span>
        </div>
        <div className="emp-home-stat-trend emp-home-trend-warning">
          <i className="bi bi-exclamation-circle"></i>
          <span>{upcomingRenewals.filter(r => r.urgency === 'high').length} urgent</span>
        </div>
      </div>
    </div>
  );

  const renderPolicyCoverageCharts = () => (
    <div className="emp-home-chart-card">
      <div className="emp-home-chart-header">
        <div className="emp-home-chart-title">
          <div className="emp-home-chart-icon">
            <i className="bi bi-pie-chart"></i>
          </div>
          <h3>Policy Coverage Overview</h3>
        </div>
      </div>
      <div className="emp-home-chart-body">
        <div className="emp-home-chart-tabs">
          <button
            className={`emp-home-chart-tab ${activeChartTab === 'type' ? 'active' : ''}`}
            onClick={() => setActiveChartTab('type')}
          >
            <i className="bi bi-diagram-3"></i>
            By Type
          </button>
          <button
            className={`emp-home-chart-tab ${activeChartTab === 'coverage' ? 'active' : ''}`}
            onClick={() => setActiveChartTab('coverage')}
          >
            <i className="bi bi-bar-chart"></i>
            By Coverage
          </button>
        </div>
        <div className="emp-home-chart-container">
          {activeChartTab === 'type' ? (
            <Doughnut
              data={policyCoverageChart.byType}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { 
                  legend: { 
                    position: "bottom",
                    labels: {
                      usePointStyle: true,
                      padding: 20,
                      font: { family: 'Inter, system-ui, sans-serif', size: 12 },
                      color: '#475569'
                    }
                  } 
                },
              }}
            />
          ) : (
            <Doughnut
              data={policyCoverageChart.byCoverage}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { 
                  legend: { 
                    position: "bottom",
                    labels: {
                      usePointStyle: true,
                      padding: 20,
                      font: { family: 'Inter, system-ui, sans-serif', size: 12 },
                      color: '#475569'
                    }
                  } 
                },
              }}
            />
          )}
        </div>
      </div>
    </div>
  );

  const renderQueriesStatusChart = () => (
    <div className="emp-home-chart-card">
      <div className="emp-home-chart-header">
        <div className="emp-home-chart-title">
          <div className="emp-home-chart-icon emp-home-chart-icon-accent">
            <i className="bi bi-bar-chart"></i>
          </div>
          <h3>Queries Status</h3>
        </div>
      </div>
      <div className="emp-home-chart-body">
        <div className="emp-home-chart-container">
          <Bar
            data={queriesStatusChart.bar}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { 
                legend: { display: false },
                tooltip: {
                  backgroundColor: '#1e1b4b',
                  titleColor: '#f8fafc',
                  bodyColor: '#f8fafc',
                  padding: 12,
                  cornerRadius: 8,
                  titleFont: { family: 'Inter, system-ui, sans-serif', weight: '600' },
                  bodyFont: { family: 'Inter, system-ui, sans-serif' }
                }
              },
              scales: { 
                y: { 
                  beginAtZero: true, 
                  ticks: { 
                    stepSize: 1,
                    font: { family: 'Inter, system-ui, sans-serif' },
                    color: '#64748b'
                  },
                  grid: { color: 'rgba(79, 70, 229, 0.08)' }
                },
                x: {
                  grid: { display: false },
                  ticks: {
                    font: { family: 'Inter, system-ui, sans-serif' },
                    color: '#64748b'
                  }
                }
              },
            }}
          />
        </div>
        <div className="emp-home-chart-legend">
          <div className="emp-home-legend-item">
            <span className="emp-home-legend-dot emp-home-legend-warning"></span>
            <span>Open: {queriesStatusChart.bar.datasets[0].data[0]}</span>
          </div>
          <div className="emp-home-legend-item">
            <span className="emp-home-legend-dot emp-home-legend-primary"></span>
            <span>In Progress: {queriesStatusChart.bar.datasets[0].data[1]}</span>
          </div>
          <div className="emp-home-legend-item">
            <span className="emp-home-legend-dot emp-home-legend-success"></span>
            <span>Resolved: {queriesStatusChart.bar.datasets[0].data[2]}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRecentActivitiesTimeline = () => (
    <div className="emp-home-activities-card">
      <div className="emp-home-activities-header">
        <div className="emp-home-activities-title">
          <div className="emp-home-activities-icon">
            <i className="bi bi-clock-history"></i>
          </div>
          <h3>Recent Activities</h3>
        </div>
        <span className="emp-home-activities-badge">{recentActivities.length}</span>
      </div>
      <div className="emp-home-activities-body">
        <div className="emp-home-timeline">
          {recentActivities.map((activity, index) => (
            <div key={activity.id} className="emp-home-timeline-item">
              <div className={`emp-home-timeline-marker emp-home-marker-${activity.color}`}>
                <i className={activity.icon}></i>
              </div>
              <div className="emp-home-timeline-content">
                <div className="emp-home-timeline-header">
                  <h4 className="emp-home-timeline-title">{activity.title}</h4>
                  <span className="emp-home-timeline-date">
                    {new Date(activity.date).toLocaleDateString("en-IN")}
                  </span>
                </div>
                <p className="emp-home-timeline-desc">{activity.description}</p>
                <span className={`emp-home-timeline-status emp-home-status-${activity.color}`}>
                  {activity.status}
                </span>
              </div>
            </div>
          ))}
          {recentActivities.length === 0 && (
            <div className="emp-home-empty-state">
              <div className="emp-home-empty-icon">
                <i className="bi bi-activity"></i>
              </div>
              <h4>No recent activities</h4>
              <p>Your recent activities will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderUpcomingRenewals = () => (
    <div className="emp-home-renewals-card">
      <div className="emp-home-renewals-header">
        <div className="emp-home-renewals-title">
          <div className="emp-home-renewals-icon">
            <i className="bi bi-calendar-event"></i>
          </div>
          <h3>Upcoming Renewals</h3>
        </div>
        {upcomingRenewals.length > 0 && (
          <span className={`emp-home-renewals-badge ${
            upcomingRenewals.some((r) => r.urgency === "high") ? "urgent" : ""
          }`}>
            {upcomingRenewals.length}
          </span>
        )}
      </div>
      <div className="emp-home-renewals-body">
        {upcomingRenewals.length > 0 ? (
          upcomingRenewals.map((renewal) => (
            <div
              key={renewal.id}
              className={`emp-home-renewal-item emp-home-renewal-${renewal.urgency}`}
            >
              <div className="emp-home-renewal-indicator"></div>
              <div className="emp-home-renewal-content">
                <h4 className="emp-home-renewal-name">{renewal.name}</h4>
                <p className="emp-home-renewal-provider">{renewal.provider}</p>
                <div className="emp-home-renewal-meta">
                  <i className={`bi bi-${
                    renewal.urgency === "high" ? "exclamation-triangle-fill" : 
                    renewal.urgency === "medium" ? "info-circle-fill" : "calendar-check"
                  }`}></i>
                  <span>Renews in {renewal.daysUntilRenewal} days</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="emp-home-empty-state">
            <div className="emp-home-empty-icon emp-home-empty-success">
              <i className="bi bi-check-circle"></i>
            </div>
            <h4>No upcoming renewals</h4>
            <p>All policies are up to date</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderQuickActionsPanel = () => (
    <div className="emp-home-quick-actions">
      <div className="emp-home-quick-header">
        <div className="emp-home-quick-title">
          <div className="emp-home-quick-icon">
            <i className="bi bi-lightning-fill"></i>
          </div>
          <h3>Quick Actions</h3>
        </div>
        <p className="emp-home-quick-subtitle">Access common tasks instantly</p>
      </div>
      <div className="emp-home-quick-grid">
        {quickActions.map((action) => (
          <button
            key={action.id}
            className={`emp-home-quick-btn emp-home-quick-${action.color}`}
            onClick={() => setActiveTab(action.tab)}
            title={action.description}
          >
            <div className="emp-home-quick-btn-icon">
              <i className={action.icon}></i>
            </div>
            <span className="emp-home-quick-btn-label">{action.label}</span>
            <span className="emp-home-quick-btn-desc">{action.description}</span>
          </button>
        ))}
      </div>
    </div>
  );

  // -------------------- Layout --------------------
  return (
    <div className="emp-home">
      {/* Header Section */}
      <div className="emp-home-header">
        <div className="emp-home-header-content">
          <div className="emp-home-header-text">
            <h1 className="emp-home-title">Dashboard Overview</h1>
            <p className="emp-home-subtitle">
              Welcome back! Here's your insurance summary for {currentTime.toLocaleDateString("en-IN", {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <div className="emp-home-header-time">
            <div className="emp-home-time-badge">
              <i className="bi bi-clock"></i>
              <span>{currentTime.toLocaleTimeString("en-IN", { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
              })}</span>
            </div>
          </div>
        </div>
        <div className="emp-home-header-decoration"></div>
      </div>

      {/* Statistics Cards */}
      {renderStatsCards()}

      {/* Quick Actions */}
      {renderQuickActionsPanel()}

      {/* Charts Row */}
      <div className="emp-home-charts-row">
        <div className="emp-home-chart-col">
          {renderPolicyCoverageCharts()}
        </div>
        <div className="emp-home-chart-col">
          {renderQueriesStatusChart()}
        </div>
      </div>

      {/* Activities & Renewals Row */}
      <div className="emp-home-bottom-row">
        <div className="emp-home-activities-col">
          {renderRecentActivitiesTimeline()}
        </div>
        <div className="emp-home-renewals-col">
          {renderUpcomingRenewals()}
        </div>
      </div>
    </div>
  );
};

export default EmployeeHome;