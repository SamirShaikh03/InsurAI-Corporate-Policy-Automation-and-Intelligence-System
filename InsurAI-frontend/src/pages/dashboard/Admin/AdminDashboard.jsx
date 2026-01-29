import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../../config";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import AgentRegister from "../../auth/AgentRegister";
import HrRegister from "../../auth/HRRegister";
import AdminPolicy from "./AdminPolicy";
import AdminAllClaims from './AdminAllClaims';
import AdminReportsAnalytics from "./AdminReportsAnalytics";
import AdminUserManagement from "./AdminUserManagement";
import AdminFraudClaims from "./AdminFraudClaims";
import AdminAuditLogs from "./AdminAuditLogs";
import AdminEnrollments from "./AdminEnrollments";
import AdminReimbursements from "./AdminReimbursements";
import AdminRenewals from "./AdminRenewals";
import NotificationPopup from "../shared/NotificationPopup";
import "./AdminTheme.css";
import { SkeletonDashboard, SkeletonStats, SkeletonTable, SectionLoader, InlineSpinner } from "../../../components/loading";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("home");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [backendNotifications, setBackendNotifications] = useState([]);

  const [users, setUsers] = useState([]);
  const [fraudAlerts, setFraudAlerts] = useState([]);
  const [systemLogs, setSystemLogs] = useState([]);
  const [claims, setClaims] = useState([]);
  const [policies, setPolicies] = useState([]);

  const [newHR, setNewHR] = useState({ name: "", email: "", password: "" });
  const [newAgent, setNewAgent] = useState({ name: "", email: "", password: "" });

  // Theme colors - Royal Blue / Violet palette
  const themeColors = {
    primary: "#2563eb",
    secondary: "#8b5cf6",
    accent: "#ec4899",
    light: "#f1f5f9",
    dark: "#1e3a8a"
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/admin/login");
  };

  // Fetch backend notifications
  const fetchBackendNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const adminId = localStorage.getItem("id");
      if (!token || !adminId) return;

      const response = await axios.get(
        `${API_BASE_URL}/notifications/user/${adminId}`,
        {
          params: { role: "Admin" },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data) {
        setBackendNotifications(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  }, []);

  const handleMarkNotificationAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await axios.put(
        `${API_BASE_URL}/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBackendNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, readStatus: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleNotificationClick = (notification) => {
    console.log("Notification clicked:", notification);
  };

  // ---------------- fetchUsers ----------------
  const fetchUsers = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      // Fetch agents
      const agentsRes = await axios.get(`${API_BASE_URL}/agent`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const agentsData = Array.isArray(agentsRes.data) ? agentsRes.data : [];
      const mappedAgents = agentsData.map((a) => ({
        id: a.id,
        name: a.name,
        email: a.email,
        role: "Agent",
        status: a.available !== false ? "Active" : "Inactive",
      }));

      // Fetch employees
      const employeesRes = await axios.get(`${API_BASE_URL}/auth/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const employeesData = Array.isArray(employeesRes.data) ? employeesRes.data : [];
      const mappedEmployees = employeesData.map((e) => ({
        id: e.id,
        name: e.name,
        email: e.email,
        role: "Employee",
        status: e.active !== false ? "Active" : "Inactive",
      }));

      // Fetch HRs
      const hrsRes = await axios.get(`${API_BASE_URL}/hr`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const hrsData = Array.isArray(hrsRes.data) ? hrsRes.data : [];
      console.log('Raw HR data from backend:', hrsData);

      const mappedHRs = hrsData.map((h) => ({
        id: h.id,
        name: h.name,
        email: h.email,
        role: "HR",
        status: h.active !== false ? "Active" : "Inactive",
      }));

      console.log('Mapped HR data:', mappedHRs);

      // Find testhr1@example.com specifically
      const testHr = mappedHRs.find(hr => hr.email === 'testhr1@example.com');
      if (testHr) {
        console.log('Test HR User data:', testHr);
      }

      // Combine agents + employees + HRs
      const allUsers = [...mappedAgents, ...mappedEmployees, ...mappedHRs];
      setUsers(allUsers);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchBackendNotifications();
  }, [fetchUsers, fetchBackendNotifications]);

  // ---------------- Register HR ----------------
  const handleRegisterHR = async (hrData) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE_URL}/admin/hr/register`, hrData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewHR({ name: "", email: "", password: "" });
      setActiveTab("users");
      fetchUsers();
    } catch (err) {
      console.error("Failed to register HR", err);
      alert("Error registering HR");
    }
  };

  // ---------------- Register Agent ----------------
  const handleRegisterAgent = async (agentData) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE_URL}/admin/agent/register`, agentData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewAgent({ name: "", email: "", password: "" });
      setActiveTab("users");
      fetchUsers();
    } catch (err) {
      console.error("Failed to register Agent", err);
      alert("Error registering Agent");
    }
  };

  // ---------------- User Management Handlers ----------------

  // Handle Edit User
  const handleEditUser = async (user) => {
    const newName = prompt("Enter new name:", user.name);
    const newEmail = prompt("Enter new email:", user.email);

    if (!newName && !newEmail) return;

    try {
      const token = localStorage.getItem("token");
      const roleEndpoint = user.role === "Employee" ? "employee" :
                          user.role === "HR" ? "hr" : "agent";

      await axios.put(`${API_BASE_URL}/admin/${roleEndpoint}/${user.id}`, {
        name: newName || user.name,
        email: newEmail || user.email
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("User updated successfully!");
      fetchUsers();
    } catch (err) {
      console.error("Failed to update user", err);
      alert("Error updating user: " + (err.response?.data || err.message));
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (userId, userRole) => {
    try {
      const token = localStorage.getItem("token");

      // Use passed role or find user to get the role
      let role = userRole;
      if (!role) {
        const user = users.find(u => u.id === userId);
        if (!user) {
          alert("User not found");
          return;
        }
        role = user.role;
      }

      const roleEndpoint = role === "Employee" ? "employee" :
                          role === "HR" ? "hr" : "agent";

      await axios.delete(`${API_BASE_URL}/admin/${roleEndpoint}/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("User deleted successfully!");
      fetchUsers();
    } catch (err) {
      console.error("Failed to delete user", err);
      alert("Error deleting user: " + (err.response?.data || err.message));
    }
  };

  // Handle Status Change
  const handleStatusChange = async (userId, newStatus) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Authentication token not found. Please login again.");
        return;
      }

      // Find the user to get the role
      const user = users.find(u => u.id === userId);
      if (!user) {
        console.error("User not found in users array. UserId:", userId);
        console.log("Available users:", users);
        alert("User not found");
        return;
      }

      const roleEndpoint = user.role === "Employee" ? "employee" :
                          user.role === "HR" ? "hr" : "agent";

      console.log('Status change request:', {
        userId,
        newStatus,
        user,
        roleEndpoint,
        endpoint: `${API_BASE_URL}/admin/${roleEndpoint}/${userId}/status`
      });

      const response = await axios.put(
        `${API_BASE_URL}/admin/${roleEndpoint}/${userId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 second timeout
        }
      );

      console.log('Status change response:', response.data);
      alert(`User ${newStatus === "Active" ? "activated" : "deactivated"} successfully!`);

      // Force refetch users to ensure UI is updated
      await fetchUsers();
    } catch (err) {
      console.error("Failed to update user status", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        config: err.config
      });

      let errorMessage = "Error updating user status: ";
      if (err.response) {
        errorMessage += err.response.data || err.response.statusText || "Unknown server error";
      } else if (err.request) {
        errorMessage += "No response from server. Please check your connection.";
      } else {
        errorMessage += err.message;
      }

      alert(errorMessage);
    }
  };

  // ---------------- Fetch all claims with policies, employee & HR mapping ----------------
  const fetchAllClaims = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // Fetch claims
      const claimsRes = await fetch(`${API_BASE_URL}/admin/claims`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!claimsRes.ok) {
        console.error("Failed to fetch claims");
        return;
      }
      const claimsData = await claimsRes.json();

      // Fetch employees
      const empRes = await fetch(`${API_BASE_URL}/auth/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const employees = await empRes.json();

      // Fetch HRs
      const hrRes = await fetch(`${API_BASE_URL}/hr`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const hrs = await hrRes.json();

      // Fetch policies
      const policyRes = await fetch(`${API_BASE_URL}/admin/policies`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const policiesData = await policyRes.json();
      setPolicies(policiesData);

      // Map claims with employee, HR, and policy details
      const mappedClaims = claimsData.map((claim) => {
        const employee = employees.find(
          (emp) => emp.id === claim.employeeId || emp.id === claim.employee_id
        );
        const hr = hrs.find(
          (hr) => hr.id === claim.assignedHrId || hr.id === claim.assigned_hr_id
        );
        const policy = policiesData.find(
          (p) => p.id === claim.policyId || p.id === claim.policy_id
        );

        return {
          ...claim,
          employeeName: employee?.name || "Unknown",
          employeeIdDisplay: employee?.employeeId || "N/A",
          documents: claim.documents || [],
          assignedHrName: hr?.name || "Not Assigned",
          policyName: policy?.policyName || "N/A",
          remarks: claim.remarks || "",
        };
      });

      setClaims(mappedClaims);
    } catch (err) {
      console.error("Error fetching claims:", err);
    }
  };

  useEffect(() => {
    fetchAllClaims();
  }, []);

  // ---------------- Animated Counter Component ----------------
  const AnimatedCounter = ({ value, duration = 1000 }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      let start = 0;
      const end = parseInt(value);
      if (start === end) return;

      const incrementTime = (duration / end);
      const timer = setInterval(() => {
        start += 1;
        setCount(start);
        if (start >= end) clearInterval(timer);
      }, incrementTime);

      return () => clearInterval(timer);
    }, [value, duration]);

    return <span>{count}</span>;
  };

  // ---------------- Progress Bar Component ----------------
  const ProgressBar = ({ percentage, color = "theme" }) => {
    return (
      <div className="progress" style={{ height: "8px", backgroundColor: "#e9ecef" }}>
        <div
          className="progress-bar"
          role="progressbar"
          style={{ 
            width: `${percentage}%`, 
            transition: "width 0.5s ease",
            backgroundColor: color === "theme" ? themeColors.secondary : undefined
          }}
          aria-valuenow={percentage}
          aria-valuemin="0"
          aria-valuemax="100"
        ></div>
      </div>
    );
  };

  // ---------------- Render content ----------------
  const renderContent = () => {
    switch (activeTab) {
      case "home":
        // --- Users ---
        const totalUsers = users.length;
        const totalHR = users.filter(u => u.role === "HR").length;
        const totalAgents = users.filter(u => u.role === "Agent").length;
        const totalEmployees = users.filter(u => u.role === "Employee").length;
        const activeUsers = users.filter(u => (u.status || '').toString().toLowerCase() === "active").length;

        // --- Claims ---
        const totalClaims = claims.length;

        // helper: normalize status and parse dates from multiple possible property names
        const normalizeStatus = (c) => {
          const raw = (c.status || c.claimStatus || c.state || c.verdict || "").toString().toLowerCase().trim();
          return raw;
        };

        const isPendingStatus = (s) =>
          ["pending", "awaiting", "open", "in_progress", "in progress", "submitted"].includes(s);

        const isResolvedStatus = (s) =>
          ["resolved", "approved", "closed", "completed", "settled"].includes(s);

        const parseDateField = (value) => {
          if (!value) return null;
          const d = new Date(value);
          return isNaN(d) ? null : d;
        };

        const pendingClaims = claims.filter(c => {
          const s = normalizeStatus(c);
          return isPendingStatus(s);
        }).length;

        const resolvedClaims = claims.filter(c => {
          const s = normalizeStatus(c);
          return isResolvedStatus(s);
        }).length;

        const highPriorityAlerts = claims.filter(c => {
          const p = (c.priority || c.priorityLevel || "").toString().toLowerCase();
          return ["high", "urgent", "critical"].includes(p);
        }).length;

        // --- Time-based stats ---
        const todayStr = new Date().toDateString();

        // handle multiple created date property names for users
        const userCreatedDate = (u) =>
          parseDateField(u.createdAt || u.created_at || u.createdOn || u.created_on || u.registeredAt || u.registered_at);

        const newUsersToday = users.filter(u => {
          const dt = userCreatedDate(u);
          return dt && dt.toDateString() === todayStr;
        }).length;

        // resolved today: check updated/resolved timestamps and normalized status
        const claimResolvedDate = (c) =>
          parseDateField(c.updatedAt || c.updated_at || c.resolvedAt || c.resolved_at || c.closedAt || c.closed_at);

        const resolvedToday = claims.filter(c => {
          const s = normalizeStatus(c);
          if (!isResolvedStatus(s)) return false;
          const dt = claimResolvedDate(c);
          return dt && dt.toDateString() === todayStr;
        }).length;

        // --- Recent Activity ---
        const recentActivities = claims
          .slice(-5)
          .reverse()
          .map(c => {
            const s = normalizeStatus(c);
            return {
              id: c.id,
              action: `Claim by ${c.employeeName || "Unknown"}`,
              user: `Policy: ${c.policyName || "N/A"}`,
              time: parseDateField(c.createdAt || c.created_at || c.createdOn || c.created_on)?.toLocaleString() || "Unknown time",
              type: isPendingStatus(s) ? "warning" : (isResolvedStatus(s) ? "success" : "info"),
            };
          });

        // --- Chart Data ---
        const claimChartData = [
          { name: "Pending", value: pendingClaims },
          { name: "Resolved", value: resolvedClaims },
          { name: "High Priority", value: highPriorityAlerts },
        ];

        return (
          <div className="w-100">
            {/* Header Section */}
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
              <div>
                <h2 style={{ color: themeColors.primary }} className="fw-bold mb-2">Admin Dashboard Overview</h2>
                <p className="text-muted mb-0">Welcome back, Admin. Here's your system overview.</p>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="badge fs-6 px-3 py-2" style={{ backgroundColor: themeColors.secondary, color: 'white' }}>
                  <i className="bi bi-check-circle me-1"></i>
                  System Online
                </span>
                <small className="text-muted">
                  Updated: {new Date().toLocaleTimeString()}
                </small>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="row g-4 mb-5">
              {/* Total Users Card */}
              <div className="col-xl-3 col-md-6">
                <div className="card metric-card border-0 shadow-hover h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="card-subtitle text-muted mb-2">Total Users</h6>
                        <h2 className="fw-bold mb-0" style={{ color: themeColors.primary }}>
                          <AnimatedCounter value={totalUsers} />
                        </h2>
                        <small className="text-muted">
                          <i className="bi bi-people-fill me-1" style={{ color: themeColors.primary }}></i>
                          {totalHR} HR • {totalAgents} Agents • {totalEmployees} Employees
                        </small>
                      </div>
                      <div className="metric-icon" style={{ backgroundColor: `${themeColors.primary}15` }}>
                        <i className="bi bi-people fs-4" style={{ color: themeColors.primary }}></i>
                      </div>
                    </div>
                    <ProgressBar percentage={(activeUsers / Math.max(totalUsers, 1)) * 100} color="theme" />
                  </div>
                </div>
              </div>

              {/* Claims Overview Card */}
              <div className="col-xl-3 col-md-6">
                <div className="card metric-card border-0 shadow-hover h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="card-subtitle text-muted mb-2">Claims Overview</h6>
                        <h2 className="fw-bold mb-0" style={{ color: themeColors.accent }}>
                          <AnimatedCounter value={totalClaims} />
                        </h2>
                        <small className="text-muted">
                          <i className="bi bi-exclamation-triangle-fill me-1" style={{ color: themeColors.accent }}></i>
                          {pendingClaims} pending • {resolvedClaims} resolved
                        </small>
                      </div>
                      <div className="metric-icon" style={{ backgroundColor: `${themeColors.accent}15` }}>
                        <i className="bi bi-clipboard-data fs-4" style={{ color: themeColors.accent }}></i>
                      </div>
                    </div>
                    <ProgressBar percentage={(resolvedClaims / Math.max(totalClaims, 1)) * 100} color="theme" />
                  </div>
                </div>
              </div>

              {/* High Priority Alerts Card */}
              <div className="col-xl-3 col-md-6">
                <div className="card metric-card border-0 shadow-hover h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="card-subtitle text-muted mb-2">High Priority Alerts</h6>
                        <h2 className="fw-bold mb-0" style={{ color: '#dc3545' }}>
                          <AnimatedCounter value={highPriorityAlerts} />
                        </h2>
                        <small className="text-muted">
                          <i className="bi bi-shield-exclamation me-1" style={{ color: '#dc3545' }}></i>
                          Require immediate attention
                        </small>
                      </div>
                      <div className="metric-icon" style={{ backgroundColor: '#dc354515' }}>
                        <i className="bi bi-exclamation-triangle fs-4" style={{ color: '#dc3545' }}></i>
                      </div>
                    </div>
                    <ProgressBar percentage={Math.min((highPriorityAlerts / Math.max(totalClaims, 1)) * 100, 100)} color="theme" />
                  </div>
                </div>
              </div>

              {/* System Health Card */}
              <div className="col-xl-3 col-md-6">
                <div className="card metric-card border-0 shadow-hover h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="card-subtitle text-muted mb-2">System Health</h6>
                        <h2 className="fw-bold mb-0" style={{ color: '#28a745' }}>100%</h2>
                        <small className="text-muted">
                          <i className="bi bi-check-circle-fill me-1" style={{ color: '#28a745' }}></i>
                          All systems operational
                        </small>
                      </div>
                      <div className="metric-icon" style={{ backgroundColor: '#28a74515' }}>
                        <i className="bi bi-server fs-4" style={{ color: '#28a745' }}></i>
                      </div>
                    </div>
                    <ProgressBar percentage={100} color="theme" />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts & Info Section */}
            <div className="row g-4 mb-5">
              {/* Quick Stats */}
              <div className="col-lg-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-header bg-transparent border-0 pb-0">
                    <h5 className="fw-bold mb-0" style={{ color: themeColors.primary }}>Today's Summary</h5>
                  </div>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3 p-3 rounded" style={{ backgroundColor: themeColors.light }}>
                      <span className="text-muted">New Users:</span>
                      <strong style={{ color: themeColors.primary }}>{newUsersToday}</strong>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-3 p-3 rounded" style={{ backgroundColor: themeColors.light }}>
                      <span className="text-muted">Pending Claims:</span>
                      <strong style={{ color: themeColors.accent }}>{pendingClaims}</strong>
                    </div>
                    <div className="d-flex justify-content-between align-items-center p-3 rounded" style={{ backgroundColor: themeColors.light }}>
                      <span className="text-muted">Resolved Today:</span>
                      <strong style={{ color: '#28a745' }}>{resolvedToday}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="col-lg-8">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-header bg-transparent border-0 pb-0">
                    <h5 className="fw-bold mb-0" style={{ color: themeColors.primary }}>Claims Overview</h5>
                  </div>
                  <div className="card-body">
                    <div style={{ height: "300px" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={claimChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar 
                            dataKey="value" 
                            fill={themeColors.secondary}
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity Section */}
            <div className="row g-4">
              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-transparent border-0 pb-0">
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="fw-bold mb-0" style={{ color: themeColors.primary }}>Recent Activity</h5>
                      <button className="btn btn-sm rounded-pill" style={{ backgroundColor: themeColors.primary, color: 'white' }}>
                        View All <i className="bi bi-arrow-right ms-1"></i>
                      </button>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="activity-timeline">
                      {recentActivities.map((activity, index) => (
                        <div key={activity.id} className="activity-item d-flex align-items-start mb-3">
                          <div className="activity-indicator">
                            <div 
                              className="indicator-dot" 
                              style={{ 
                                backgroundColor: activity.type === 'warning' ? '#ffc107' : 
                                              activity.type === 'success' ? '#28a745' : themeColors.secondary 
                              }}
                            ></div>
                            {index < recentActivities.length - 1 && <div className="indicator-line"></div>}
                          </div>
                          <div className="activity-content flex-grow-1 ms-3">
                            <div className="d-flex justify-content-between align-items-start">
                              <h6 className="mb-1 fw-semibold" style={{ color: themeColors.primary }}>{activity.action}</h6>
                              <span 
                                className="badge fs-7" 
                                style={{ 
                                  backgroundColor: activity.type === 'warning' ? '#ffc107' : 
                                                activity.type === 'success' ? '#28a745' : themeColors.secondary,
                                  color: 'white'
                                }}
                              >
                                {activity.type === 'warning' ? 'Pending' : 'Resolved'}
                              </span>
                            </div>
                            <p className="text-muted mb-1 small">{activity.user}</p>
                            <small className="text-muted">
                              <i className="bi bi-clock me-1"></i>
                              {activity.time}
                            </small>
                          </div>
                        </div>
                      ))}
                      {recentActivities.length === 0 && (
                        <div className="text-center py-4">
                          <i className="bi bi-inbox display-4 text-muted"></i>
                          <p className="text-muted mt-2">No recent activity</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Alerts Section */}
            {highPriorityAlerts > 0 && (
              <div className="row g-4 mt-3">
                <div className="col-12">
                  <div className="alert border-0 shadow-sm" style={{ backgroundColor: '#fff3cd', borderLeft: `4px solid ${themeColors.accent}` }}>
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <h6 className="alert-heading mb-1" style={{ color: themeColors.primary }}>
                          <i className="bi bi-exclamation-triangle me-2"></i>
                          Action Required
                        </h6>
                        <p className="mb-0">You have {highPriorityAlerts} high-priority claims requiring immediate attention.</p>
                      </div>
                      <button 
                        className="btn btn-sm rounded-pill"
                        style={{ backgroundColor: themeColors.accent, color: 'white' }}
                        onClick={() => setActiveTab("claims")}
                      >
                        Review Claims <i className="bi bi-arrow-right ms-1"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case "users":
        return (
          <div className="w-100">
            <AdminUserManagement
              users={users}
              setActiveTab={setActiveTab}
              onEditUser={handleEditUser}
              onDeleteUser={handleDeleteUser}
              onStatusChange={handleStatusChange}
            />
          </div>
        );

      case "registerHR":
        return (
          <div className="w-100">
            <HrRegister
              onBack={() => setActiveTab("users")}
              onRegister={handleRegisterHR}
              newHR={newHR}
              setNewHR={setNewHR}
            />
          </div>
        );

      case "registerAgent":
        return (
          <div className="w-100">
            <AgentRegister
              onBack={() => setActiveTab("users")}
              onRegister={handleRegisterAgent}
              newAgent={newAgent}
              setNewAgent={setNewAgent}
            />
          </div>
        );

      case "createPolicy":
        return (
          <div className="w-100">
            <AdminPolicy />
          </div>
        );

      case "claims":
        return (
          <div className="w-100">
            <AdminAllClaims claims={claims} />
          </div>
        );

      case "reports":
        return (
          <div className="w-100">
            <AdminReportsAnalytics />
          </div>
        );

      case "fraud":
        return (
          <div className="w-100">
            <AdminFraudClaims />
          </div>
        );

      case "audit":
  return (
    <div className="w-100">
      <AdminAuditLogs themeColors={themeColors} />
    </div>
  );

      case "enrollments":
        return (
          <div className="w-100">
            <AdminEnrollments />
          </div>
        );

      case "reimbursements":
        return (
          <div className="w-100">
            <AdminReimbursements />
          </div>
        );

      case "renewals":
        return (
          <div className="w-100">
            <AdminRenewals />
          </div>
        );


      default:
        return (
          <div className="w-100">
            <h4 style={{ color: themeColors.primary }}>Welcome to Admin Dashboard</h4>
          </div>
        );
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Header / Navbar */}
      <header className="admin-header">
        <div className="admin-header-inner">
          <div className="admin-header-left">
            <button 
              className="admin-header-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <i className="bi bi-list"></i>
            </button>
            <div className="admin-header-brand">
              <div className="admin-brand-icon">
                <i className="bi bi-shield-lock-fill"></i>
              </div>
              <div className="admin-brand-copy">
                <h1>InsurAI Admin</h1>
                <small><i className="bi bi-circle-fill"></i> Administration Portal</small>
              </div>
            </div>
          </div>
          <div className="admin-header-right">
            <button 
              type="button" 
              className="admin-header-icon" 
              aria-label="Notifications"
              title="Notifications"
              onClick={() => setShowNotificationPopup(!showNotificationPopup)}
              style={{ 
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                fontSize: '20px',
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                position: 'relative',
                marginRight: '16px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <i className="bi bi-bell"></i>
              {backendNotifications.filter(n => !n.readStatus).length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '6px',
                  right: '8px',
                  width: '8px',
                  height: '8px',
                  background: '#ef4444',
                  borderRadius: '50%',
                  border: '2px solid #1e3a8a'
                }} />
              )}
            </button>

            {/* Notification Popup */}
            <NotificationPopup
              isOpen={showNotificationPopup}
              onClose={() => setShowNotificationPopup(false)}
              notifications={backendNotifications}
              onNotificationClick={handleNotificationClick}
              onMarkAsRead={handleMarkNotificationAsRead}
              role="admin"
            />

            <div className="admin-user-chip">
              <div className="admin-user-chip__avatar">SA</div>
              <div className="admin-user-chip__meta">
                <span>Administrator</span>
                <strong>System Admin</strong>
              </div>
            </div>
            <button className="admin-logout-btn" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right"></i>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="admin-main">
        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div 
            className={`admin-sidebar-backdrop ${isMobileMenuOpen ? 'show' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
        )}

        {/* Sidebar */}
        <aside 
          className={`admin-sidebar ${isSidebarHovered ? 'is-expanded' : ''} ${isMobileMenuOpen ? 'is-expanded' : ''}`}
          onMouseEnter={() => setIsSidebarHovered(true)}
          onMouseLeave={() => setIsSidebarHovered(false)}
        >
          <div className="admin-sidebar-inner">

            {/* Sidebar Navigation */}
            <nav className="admin-sidebar-nav">
              {[
                { id: "home", icon: "bi-speedometer2", label: "Dashboard" },
                { id: "users", icon: "bi-people", label: "User Management" },
                { id: "registerHR", icon: "bi-person-plus", label: "Register HR" },
                { id: "registerAgent", icon: "bi-person-badge", label: "Register Agent" },
                { id: "createPolicy", icon: "bi-file-earmark-text", label: "Policy Management" },
                { id: "enrollments", icon: "bi-card-checklist", label: "Enrollments" },
                { id: "claims", icon: "bi-clipboard-data", label: "Claims Overview" },
                { id: "reimbursements", icon: "bi-cash-coin", label: "Reimbursements" },
                { id: "renewals", icon: "bi-calendar-check", label: "Renewal Alerts" },
                { id: "reports", icon: "bi-graph-up-arrow", label: "Reports & Analytics" },
                { id: "fraud", icon: "bi-shield-exclamation", label: "Fraud Detection" },
                { id: "audit", icon: "bi-journal-check", label: "Audit Logs" },
              ].map((item) => (
                <button
                  key={item.id}
                  className={`admin-sidebar-link ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  title={item.label}
                >
                  <span className="admin-sidebar-link__icon">
                    <i className={`bi ${item.icon}`}></i>
                  </span>
                  <span className="admin-sidebar-link__label">{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Sidebar Footer */}
            <div className="admin-sidebar-footer">
              <div className="admin-sidebar-status">
                <span className="status-dot"></span>
                <span>System Online</span>
              </div>
              <div className="admin-sidebar-meta">
                <span>v2.0.1</span>
                <span className="secure-badge"><i className="bi bi-shield-check"></i> Secure</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="admin-content">
          <div className="admin-content-wrapper">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}