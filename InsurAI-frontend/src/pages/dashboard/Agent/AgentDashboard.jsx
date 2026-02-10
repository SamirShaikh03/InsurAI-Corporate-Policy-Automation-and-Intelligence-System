import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../Dashboard.css";
import "./AgentTheme.css";
import axios from "axios";
import { API_BASE_URL } from "../../../config";
import AgentQueries from "./AgentQueries";
import AgentClaims from "./AgentClaims";
import AgentAvailability from "./AgentAvailability";
import AgentReports from "./AgentReports";
import NotificationPopup from "../shared/NotificationPopup";
import { SkeletonDashboard, SkeletonStats, SkeletonTable, SectionLoader, InlineSpinner } from "../../../components/loading";

export default function AgentDashboard() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("home");
  const [availability, setAvailability] = useState(false);
  const [employeeQueries, setEmployeeQueries] = useState([]);
  const [assistedClaims, setAssistedClaims] = useState([]);
  const [futureFrom, setFutureFrom] = useState("");
  const [futureTo, setFutureTo] = useState("");
  const [agentId, setAgentId] = useState(null);
  const [agentName, setAgentName] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [backendNotifications, setBackendNotifications] = useState([]);

  // Fetch backend notifications
  const fetchBackendNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const agentId = localStorage.getItem("id");
      if (!token || !agentId) return;

      const response = await axios.get(
        `${API_BASE_URL}/notifications/user/${agentId}`,
        {
          params: { role: "Agent" },
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

  // -------------------- Get agent info, availability, and queries --------------------
  useEffect(() => {
    const storedAgentId = localStorage.getItem("agentId");
    const storedAgentName = localStorage.getItem("agentName");
    const token = localStorage.getItem("token");

    if (!token) {
      alert("No token found, please login again");
      navigate("/agent/login");
      return;
    }

    if (storedAgentId && storedAgentName) {
      const id = parseInt(storedAgentId);
      setAgentId(id);
      setAgentName(storedAgentName);

      const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

      // Fetch availability
      axios.get(`${API_BASE_URL}/agent/${id}/availability`, axiosConfig)
        .then(res => {
          if (res.data && typeof res.data.available === "boolean") {
            setAvailability(res.data.available);
          }
        })
        .catch(err => console.error("Failed to fetch availability", err));

      // Fetch all employees once
      let employeeMap = {};
      axios.get(`${API_BASE_URL}/auth/employees`, axiosConfig)
        .then(empRes => {
          empRes.data.forEach(emp => {
            employeeMap[emp.id] = emp.name;
          });

          // Fetch all queries
          axios.get(`${API_BASE_URL}/agent/queries/all/${id}`, axiosConfig)
            .then(res => {
              if (res.data) {
                const allQueries = res.data.map(q => ({
                  id: q.id,
                  employeeId: q.employeeId,
                  employee: q.employee ? q.employee.name : employeeMap[q.employeeId] || `Employee ${q.employeeId}`,
                  query: q.queryText,
                  policyName: q.policyName || "-",
                  claimType: q.claimType || "-",
                  createdAt: q.createdAt,
                  updatedAt: q.updatedAt,
                  status: q.status === "resolved" ? "Resolved" : "Pending",
                  response: q.response || "",
                  agentId: q.agentId,
                  allowEdit: q.status === "pending"
                }));

                setEmployeeQueries(allQueries);

                // Derive assisted claims automatically
                const resolvedClaims = allQueries
                  .filter(q => q.status === "Resolved")
                  .map(q => ({
                    id: q.id,
                    employee: q.employee,
                    type: q.claimType || "-",
                    policyName: q.policyName || "-",
                    date: q.updatedAt ? new Date(q.updatedAt).toLocaleString() : "-",
                    status: "Approved"
                  }));

                setAssistedClaims(resolvedClaims);
              }
            })
            .catch(err => console.error("Failed to fetch queries", err));
        })
        .catch(err => console.error("Failed to fetch employees", err));
    } else {
      navigate("/agent/login");
    }
    
    // Fetch notifications
    fetchBackendNotifications();
  }, [navigate, fetchBackendNotifications]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/agent/login");
  };

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
  // -------------------- Toggle availability --------------------
  const toggleAvailability = async () => {
    try {
      const newStatus = !availability;
      const token = localStorage.getItem("token");
      if (!token) return alert("No token found, please login again");

      const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

      await axios.post(`${API_BASE_URL}/agent/availability`, {
        agentId,
        available: newStatus,
        startTime: new Date().toISOString(),
        endTime: null
      }, axiosConfig);

      const res = await axios.get(`${API_BASE_URL}/agent/${agentId}/availability`, axiosConfig);
      if (res.data) setAvailability(res.data.available);

      alert(`You are now ${newStatus ? "available" : "unavailable"} for queries`);
    } catch (error) {
      console.error("Error updating availability:", error);
      alert("Failed to update availability");
    }
  };

  // -------------------- Schedule future availability --------------------
  const scheduleFutureAvailability = async () => {
    if (!futureFrom || !futureTo) {
      alert("Please select both start and end time.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("No token found, please login again");

      const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

      const startISO = new Date(futureFrom).toISOString();
      const endISO = new Date(futureTo).toISOString();

      await axios.post(`${API_BASE_URL}/agent/availability`, {
        agentId,
        available: true,
        startTime: startISO,
        endTime: endISO
      }, axiosConfig);

      const res = await axios.get(`${API_BASE_URL}/agent/${agentId}/availability`, axiosConfig);
      if (res.data) setAvailability(res.data.available);

      alert("Future availability scheduled successfully!");
      setFutureFrom("");
      setFutureTo("");
    } catch (error) {
      console.error("Error scheduling availability:", error);
      alert("Failed to schedule availability.");
    }
  };

  // -------------------- Respond to a query --------------------
  const respondToQuery = async (id, responseText, isUpdate = false) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("No token found, please login again");

      const query = employeeQueries.find(q => q.id === id);
      if (!query) return alert("Query not found");

      await axios.put(
        `${API_BASE_URL}/agent/queries/respond/${id}`,
        { response: responseText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEmployeeQueries(prev =>
        prev.map(q =>
          q.id === id
            ? {
                ...q,
                response: responseText,
                status: isUpdate ? q.status : "Resolved",
                allowEdit: isUpdate ? true : true
              }
            : q
        )
      );

      alert(isUpdate ? "Response updated successfully!" : "Response sent successfully!");
    } catch (error) {
      console.error("Failed to send/update response:", error.response?.data || error.message);
      alert("Failed to send/update response");
    }
  };

  // -------------------- Handle response input changes --------------------
  const handleResponseChange = (id, value) => {
    setEmployeeQueries(prev =>
      prev.map(q => q.id === id ? { ...q, response: value } : q)
    );
  };

  // -------------------- Animated Counter Component --------------------
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

  // -------------------- Progress Bar Component --------------------
  const ProgressBar = ({ percentage, color = "success" }) => {
    return (
      <div className="progress" style={{ height: "8px", backgroundColor: "#e9ecef" }}>
        <div
          className={`progress-bar bg-${color}`}
          role="progressbar"
          style={{ width: `${percentage}%`, transition: "width 0.5s ease" }}
          aria-valuenow={percentage}
          aria-valuemin="0"
          aria-valuemax="100"
        ></div>
      </div>
    );
  };

  // -------------------- Render content based on active tab --------------------
  const renderContent = () => {
    switch (activeTab) {
      case "home":
        const pendingQueries = employeeQueries.filter(
          q => q.status === "Pending" || !q.response || q.response.trim() === ""
        );

        const avgResponseTime = employeeQueries.length > 0
          ? (employeeQueries.reduce((acc, q) => {
              if (q.updatedAt && q.createdAt) {
                return acc + (new Date(q.updatedAt) - new Date(q.createdAt));
              }
              return acc;
            }, 0) / employeeQueries.length) / (1000 * 60 * 60)
          : 0;

        const satisfactionRate = employeeQueries.length > 0
          ? Math.round(
              (employeeQueries.filter(q => q.status === "Resolved").length /
                employeeQueries.length) *
                100
            )
          : 0;

        return (
          <div className="w-100">
            {/* Header Section */}
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
              <div>
                <h2 className="fw-bold text-gradient mb-2">Agent Dashboard Overview</h2>
                <p className="text-muted mb-0">Welcome back, {agentName}. Here's your performance summary.</p>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className={`badge ${availability ? "bg-success" : "bg-warning"} fs-6 px-3 py-2`}>
                  <i className={`bi ${availability ? "bi-check-circle" : "bi-clock"} me-1`}></i>
                  {availability ? "Available" : "Unavailable"}
                </span>
                <button
                  className={`btn ${availability ? "btn-warning" : "btn-success"} btn-sm rounded-pill shadow-sm`}
                  onClick={toggleAvailability}
                >
                  <i className={`bi ${availability ? "bi-pause" : "bi-play"} me-1`}></i>
                  {availability ? "Set Unavailable" : "Set Available"}
                </button>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="row g-4 mb-5">
              {/* Pending Queries Card */}
              <div className="col-xl-3 col-md-6">
                <div className="card metric-card border-0 shadow-hover h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="card-subtitle text-muted mb-2">Pending Queries</h6>
                        <h2 className="fw-bold text-primary mb-0">
                          <AnimatedCounter value={pendingQueries.length} />
                        </h2>
                        <small className="text-muted">
                          <i className="bi bi-exclamation-circle-fill text-warning me-1"></i>
                          Require attention
                        </small>
                      </div>
                      <div className="metric-icon bg-primary bg-opacity-10">
                        <i className="bi bi-question-circle text-primary fs-4"></i>
                      </div>
                    </div>
                    <ProgressBar percentage={(pendingQueries.length / Math.max(employeeQueries.length, 1)) * 100} color="warning" />
                  </div>
                </div>
              </div>

              {/* Assisted Claims Card */}
              <div className="col-xl-3 col-md-6">
                <div className="card metric-card border-0 shadow-hover h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="card-subtitle text-muted mb-2">Assisted Claims</h6>
                        <h2 className="fw-bold text-success mb-0">
                          <AnimatedCounter value={assistedClaims.length} />
                        </h2>
                        <small className="text-muted">
                          <i className="bi bi-check-circle-fill text-success me-1"></i>
                          Successfully completed
                        </small>
                      </div>
                      <div className="metric-icon bg-success bg-opacity-10">
                        <i className="bi bi-file-earmark-check text-success fs-4"></i>
                      </div>
                    </div>
                    <ProgressBar percentage={(assistedClaims.length / Math.max(employeeQueries.length, 1)) * 100} color="success" />
                  </div>
                </div>
              </div>

              {/* Average Response Time Card */}
              <div className="col-xl-3 col-md-6">
                <div className="card metric-card border-0 shadow-hover h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="card-subtitle text-muted mb-2">Avg. Response Time</h6>
                        <h2 className="fw-bold text-info mb-0">{avgResponseTime.toFixed(1)}h</h2>
                        <small className="text-muted">
                          <i className="bi bi-clock-fill text-info me-1"></i>
                          Industry avg: 2.5h
                        </small>
                      </div>
                      <div className="metric-icon bg-info bg-opacity-10">
                        <i className="bi bi-speedometer2 text-info fs-4"></i>
                      </div>
                    </div>
                    <ProgressBar percentage={Math.min((avgResponseTime / 2.5) * 100, 100)} color="info" />
                  </div>
                </div>
              </div>

              {/* Satisfaction Rate Card */}
              <div className="col-xl-3 col-md-6">
                <div className="card metric-card border-0 shadow-hover h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="card-subtitle text-muted mb-2">Satisfaction Rate</h6>
                        <h2 className="fw-bold text-warning mb-0">{satisfactionRate}%</h2>
                        <small className="text-muted">
                          <i className="bi bi-star-fill text-warning me-1"></i>
                          Based on resolved queries
                        </small>
                      </div>
                      <div className="metric-icon bg-warning bg-opacity-10">
                        <i className="bi bi-emoji-smile text-warning fs-4"></i>
                      </div>
                    </div>
                    <ProgressBar percentage={satisfactionRate} color="warning" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity Section */}
            <div className="row g-4">
              {/* Recent Employee Queries */}
              <div className="col-xl-6">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-header bg-transparent border-0 pb-0">
                    <div className="d-flex justify-content-between align-items-center">
                      <h3 className="fw-bold text-gradient mb-0">Employee Queries</h3>
                      <button 
                        className="btn btn-outline-primary btn-sm rounded-pill"
                        onClick={() => setActiveTab("queries")}
                      >
                        View All <i className="bi bi-arrow-right ms-1"></i>
                      </button>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="activity-timeline">
                      {employeeQueries.slice(0, 5).map((query, index) => {
                        const isAnswered = query.response && query.response.trim() !== "";
                        return (
                          <div key={query.id} className="activity-item d-flex align-items-start mb-3">
                            <div className="activity-indicator">
                              <div className={`indicator-dot ${isAnswered ? 'bg-success' : 'bg-warning'}`}></div>
                              {index < 4 && <div className="indicator-line"></div>}
                            </div>
                            <div className="activity-content flex-grow-1 ms-3">
                              <div className="d-flex justify-content-between align-items-start">
                                <h6 className="mb-1 fw-semibold">{query.employee}</h6>
                                <span className={`badge ${isAnswered ? 'bg-success' : 'bg-warning'} fs-7`}>
                                  {isAnswered ? 'Resolved' : 'Pending'}
                                </span>
                              </div>
                              <p className="text-muted mb-1 small">{query.query}</p>
                              <small className="text-muted">
                                <i className="bi bi-clock me-1"></i>
                                {new Date(query.createdAt).toLocaleDateString()}
                              </small>
                            </div>
                          </div>
                        );
                      })}
                      {employeeQueries.length === 0 && (
                        <div className="text-center py-4">
                          <i className="bi bi-inbox display-4 text-muted"></i>
                          <p className="text-muted mt-2">No queries assigned yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recently Assisted Claims */}
              <div className="col-xl-6">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-header bg-transparent border-0 pb-0">
                    <div className="d-flex justify-content-between align-items-center">
                      <h3 className="fw-bold text-gradient mb-0">Assisted Claims</h3>
                      <button 
                        className="btn btn-outline-success btn-sm rounded-pill"
                        onClick={() => setActiveTab("claims")}
                      >
                        View All <i className="bi bi-arrow-right ms-1"></i>
                      </button>
                    </div>
                  </div>
                  <div className="card-body">
                    {assistedClaims.slice(0, 5).map((claim) => (
                      <div key={claim.id} className="claim-item border-bottom pb-3 mb-3 last:border-0 last:mb-0 last:pb-0">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="mb-0 fw-semibold text-truncate">{claim.employee}</h6>
                          <span className={`badge ${claim.status === 'Approved' ? 'bg-success' : 'bg-warning'} fs-7`}>
                            {claim.status}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <small className="text-muted d-block">
                              <i className="bi bi-tag me-1"></i>
                              {claim.type}
                            </small>
                            <small className="text-muted">
                              <i className="bi bi-file-text me-1"></i>
                              {claim.policyName}
                            </small>
                          </div>
                          <small className="text-muted text-end">
                            <i className="bi bi-calendar me-1"></i>
                            {new Date(claim.date).toLocaleDateString()}
                          </small>
                        </div>
                      </div>
                    ))}
                    {assistedClaims.length === 0 && (
                      <div className="text-center py-4">
                        <i className="bi bi-file-earmark-check display-4 text-muted"></i>
                        <p className="text-muted mt-2">No claims assisted yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "queries":
        return (
          <AgentQueries
            availability={availability}
            filter={filter}
            setFilter={setFilter}
            employeeQueries={employeeQueries}
            handleResponseChange={handleResponseChange}
            respondToQuery={respondToQuery}
            axios={axios}
            setEmployeeQueries={setEmployeeQueries}
          />
        );

      case "claims":
        return <AgentClaims assistedClaims={assistedClaims} />;

      case "availability":
        return (
          <AgentAvailability
            agentName={agentName}
            availability={availability}
            toggleAvailability={toggleAvailability}
            futureFrom={futureFrom}
            setFutureFrom={setFutureFrom}
            futureTo={futureTo}
            setFutureTo={setFutureTo}
            scheduleFutureAvailability={scheduleFutureAvailability}
          />
        );

      case "reports":
        return (
          <AgentReports
            assistedClaims={assistedClaims}
            employeeQueries={employeeQueries}
            agentData={{ agentId, agentName }}
          />
        );

      default:
        return <h4>Welcome, {localStorage.getItem("agentName") || "Agent"}</h4>;
    }
  };

  return (
    <div className="agent-dashboard">
      {/* Header / Navbar */}
      <header className="dashboard-header text-white py-3 px-4 w-100">
        <div className="container-fluid">
          <div className="row align-items-center">
            <div className="col-md-6 d-flex align-items-center">
              <button 
                className="btn btn-light btn-sm me-3 d-md-none"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <i className="bi bi-list"></i>
              </button>
              <div className="d-flex align-items-center gap-3">
                <div className="brand-logo">
                  <i className="bi bi-shield-check"></i>
                </div>
                <div>
                  <h2 className="mb-0 fw-bold text-white">InsurAI Agent</h2>
                  <small className="text-white-50">
                    <i className="bi bi-gem me-1"></i>
                    Premium Support Suite
                  </small>
                </div>
              </div>
            </div>

            <div className="col-md-6 d-flex justify-content-end align-items-center">
              <div className="d-flex align-items-center gap-4">
                {/* Notification Bell */}
                <button 
                  type="button" 
                  className="btn btn-outline-light btn-sm d-flex align-items-center gap-2"
                  onClick={() => setShowNotificationPopup(!showNotificationPopup)}
                  style={{ position: 'relative' }}
                >
                  <i className="bi bi-bell"></i>
                  {backendNotifications.filter(n => !n.readStatus).length > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      width: '8px',
                      height: '8px',
                      background: '#ef4444',
                      borderRadius: '50%',
                      border: '2px solid currentColor'
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
                  role="agent"
                />

                {/* Availability Indicator */}
                <div className="d-none d-lg-flex align-items-center gap-2 px-3 py-2 rounded-pill" 
                     style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                  <span className={`rounded-circle ${availability ? 'bg-success' : 'bg-warning'}`} 
                        style={{ width: '10px', height: '10px', animation: availability ? 'agentOnline 2s infinite' : 'none' }}></span>
                  <span className="small fw-medium">{availability ? 'Online' : 'Away'}</span>
                </div>
                
                {/* User Info */}
                <div className="text-end d-none d-sm-block">
                  <div className="fw-bold">{localStorage.getItem("agentName") || "Agent"}</div>
                  <small className="text-white-50">Insurance Specialist</small>
                </div>
                
                <div className="vr bg-white opacity-25 d-none d-sm-block" style={{height: '32px'}}></div>
                
                {/* Logout Button */}
                <button
                  className="btn btn-outline-light btn-sm d-flex align-items-center gap-2"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right"></i>
                  <span className="d-none d-sm-inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="dashboard-main d-flex">
        {/* Mobile Backdrop */}
        {isMobileMenuOpen && (
          <div 
            className="sidebar-backdrop show"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <aside 
          className={`dashboard-sidebar ${isMobileMenuOpen ? 'show' : ''} ${isSidebarHovered || isMobileMenuOpen ? 'is-expanded' : ''}`}
          onMouseEnter={() => setIsSidebarHovered(true)}
          onMouseLeave={() => setIsSidebarHovered(false)}
        >

          <nav className="nav flex-column">
            {[
              { id: "home", icon: "bi-speedometer2", label: "Dashboard", description: "Overview & metrics" },
              { id: "queries", icon: "bi-chat-left-dots", label: "Employee Queries", description: "Manage inquiries" },
              { id: "claims", icon: "bi-file-earmark-check", label: "Assisted Claims", description: "Track resolutions" },
              { id: "availability", icon: "bi-calendar-check", label: "Availability", description: "Schedule settings" },
              { id: "reports", icon: "bi-graph-up-arrow", label: "Performance", description: "Analytics & reports" },
            ].map((item) => (
              <a
                key={item.id}
                href="#"
                className={`nav-link sidebar-link ${activeTab === item.id ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                title={item.label}
              >
                <span className="sidebar-link-icon">
                  <i className={`${item.icon}`}></i>
                </span>
                <span className="sidebar-link-content">
                  <span className="sidebar-link-label">{item.label}</span>
                  <span className="sidebar-link-desc">{item.description}</span>
                </span>
                {item.id === "queries" && employeeQueries.filter(q => q.status === "Pending").length > 0 && (
                  <span className="sidebar-link-badge">
                    {employeeQueries.filter(q => q.status === "Pending").length}
                  </span>
                )}
              </a>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="sidebar-footer">
            <div className="sidebar-status">
              <span className="status-dot"></span>
              <span className="status-text">System Online</span>
            </div>
            <div className="sidebar-meta">
              <span>v2.1.0</span>
              <span className="sidebar-secure-badge">
                <i className="bi bi-shield-check"></i>
                <span>Secure</span>
              </span>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="dashboard-content flex-grow-1">
          <div className="dashboard-content-wrapper">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}