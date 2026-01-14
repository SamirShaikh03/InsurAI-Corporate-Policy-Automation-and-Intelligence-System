import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import EmployeeClaims from './EmployeeClaims';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./EmployeeTheme.css";
import jsPDF from "jspdf";
import EmployeeSupport from './EmployeeSupport';
import EmployeeQueries from "./EmployeeQueries"; 
import EmployeeNotification from "./EmployeeNotification"; 
import Chatbot from './Chatbot';
import EmployeePolicies from "./EmployeePolicies";
import EmployeeEnrollments from "./EmployeeEnrollments";
import EmployeeReimbursements from "./EmployeeReimbursements";
import EmployeeRenewals from "./EmployeeRenewals";
import EmployeeNavbar from "./components/EmployeeNavbar";
import EmployeeSidebar from "./components/EmployeeSidebar";
import { SkeletonDashboard, SectionLoader, InlineSpinner } from "../../../components/loading";

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const [employeeName, setEmployeeName] = useState("");
  const [activeTab, setActiveTab] = useState("home");
  const [policies, setPolicies] = useState([]);
  const [claims, setClaims] = useState([]);
  const [queries, setQueries] = useState([]);
  const [agentsAvailability, setAgentsAvailability] = useState([]);
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [loading, setLoading] = useState({
    dashboard: false,
    policies: false,
    claims: false,
    queries: false
  });
  const [employeeId, setEmployeeId] = useState(null);

  const [newClaim, setNewClaim] = useState({
    type: "",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    documents: []
  });

  const [newQuery, setNewQuery] = useState({ queryText: "" });
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [backendNotifications, setBackendNotifications] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [selectedPolicyId, setSelectedPolicyId] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const userInitial = (() => {
    const name = (employeeName || "").trim();
    if (!name) return "E";
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
      const p = parts[0];
      return (p.charAt(0) + (p.charAt(1) || "")).toUpperCase();
    }
    // Use first letter of first and last word (e.g., "Test User" -> "TU")
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  })();

  // Enhanced theme and data states
  const [theme, setTheme] = useState("corporate");
  const [dashboardStats, setDashboardStats] = useState({
    activePolicies: 0,
    totalCoverage: 0,
    pendingClaims: 0,
    totalQueries: 0,
    resolvedQueries: 0,
    upcomingRenewals: 0,
    approvalRate: 0,
    efficiencyScore: 85,
    monthlyPremium: 0,
    totalClaimsAmount: 0,
    avgClaimAmount: 0,
    riskScore: 12
  });

  // Enhanced claim types with categories and icons
  const [claimTypes, setClaimTypes] = useState([
    { id: 1, name: "Health", category: "Medical", icon: "bi-heart-pulse", color: "danger" },
    { id: 2, name: "Accident", category: "Medical", icon: "bi-bandaid", color: "warning" },
    { id: 3, name: "Travel", category: "General", icon: "bi-airplane", color: "info" },
    { id: 4, name: "Dental", category: "Medical", icon: "bi-tooth", color: "primary" },
    { id: 5, name: "Vision", category: "Medical", icon: "bi-eye", color: "success" },
    { id: 6, name: "Life", category: "Life", icon: "bi-person-check", color: "dark" },
  ]);

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch backend notifications
  const fetchBackendNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const empId = localStorage.getItem("id");
      if (!token || !empId) return;

      const response = await axios.get(
        `http://localhost:8080/notifications/user/${empId}`,
        {
          params: { role: "Employee" },
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
        `http://localhost:8080/notifications/${id}/read`,
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
    // Handle notification click - could navigate to relevant page
    console.log("Notification clicked:", notification);
  };

  // ------------------ KEEPING ORIGINAL LOGIN & REDIRECT CODE AS IS ------------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedName = localStorage.getItem("name");

    if (!token || token.trim() === "") {
      console.log("Missing token, redirecting to login");
      navigate("/employee/login");
      return;
    }

    setEmployeeName(storedName || "Employee");
    
    // Fetch data including notifications
    const empId = localStorage.getItem("id");
    if (empId) {
      setEmployeeId(parseInt(empId, 10));
    }

    fetchEmployeeData(token);
    fetchAgents(token);
    fetchEmployeeQueries(token);
    fetchEmployeeClaims(token);
    fetchBackendNotifications();

    const interval = setInterval(() => fetchEmployeeQueries(token), 15000);
    return () => clearInterval(interval);
  }, [navigate, fetchBackendNotifications]);

  // Fetch actual renewal data for accurate count
  const fetchUpcomingRenewals = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return 0;

      const response = await axios.get("http://localhost:8080/employee/renewals/my-policies", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const renewalsData = Array.isArray(response.data) ? response.data : [];

      // Count only renewals due in next 30 days (not expired)
      const count = renewalsData.filter(r => {
        const days = r.daysUntilExpiry;
        return days !== null && days !== undefined && days > 0 && days <= 30;
      }).length;

      return count;
    } catch (error) {
      console.error("Error fetching renewals count:", error);
      return 0;
    }
  }, []);

  // Enhanced data processing with more metrics
  useEffect(() => {
    const updateDashboardStats = async () => {
      const activePolicies = policies.filter(p => p.status === "Active").length;
      const totalCoverage = policies.reduce((sum, p) => sum + Number(p.coverageAmount || 0), 0);
      const pendingClaims = claims.filter(c => c.status === "Pending" || c.status === "In Review").length;
      const totalQueries = queries.length;
      const resolvedQueries = queries.filter(q => q.response && q.response.trim() !== "").length;

      // Fetch actual upcoming renewals count from the renewals endpoint
      const upcomingRenewals = await fetchUpcomingRenewals();

      const approvedClaims = claims.filter(c => c.status === "Approved").length;
      const approvalRate = claims.length > 0 ? Math.round((approvedClaims / claims.length) * 100) : 0;

      const monthlyPremium = policies.reduce((sum, p) => sum + Number(p.monthlyPremium || 0), 0);
      const totalClaimsAmount = claims.reduce((sum, claim) => {
        const amount = parseFloat(String(claim.amount).replace(/[^0-9.-]+/g, "")) || 0;
        return sum + amount;
      }, 0);
      const avgClaimAmount = claims.length > 0 ? totalClaimsAmount / claims.length : 0;

      // Calculate risk score based on various factors
      const highValuePolicies = policies.filter(p => Number(p.coverageAmount || 0) > 500000).length;
      const pendingRatio = claims.length > 0 ? pendingClaims / claims.length : 0;
      const riskScore = Math.min(100, Math.round((highValuePolicies * 20) + (pendingRatio * 80)));

      setDashboardStats({
        activePolicies,
        totalCoverage,
        pendingClaims,
        totalQueries,
        resolvedQueries,
        upcomingRenewals,
        approvalRate,
        monthlyPremium,
        totalClaimsAmount,
        avgClaimAmount,
        riskScore,
        efficiencyScore: calculateEfficiencyScore(claims, queries)
      });
    };

    updateDashboardStats();
  }, [policies, claims, queries, fetchUpcomingRenewals]);

  const calculateEfficiencyScore = (claims, queries) => {
    const claimResolutionRate = claims.length > 0 ? 
      claims.filter(c => c.status === "Approved" || c.status === "Rejected").length / claims.length : 1;
    const queryResolutionRate = queries.length > 0 ? 
      queries.filter(q => q.response && q.response.trim() !== "").length / queries.length : 1;
    
    return Math.round((claimResolutionRate * 0.6 + queryResolutionRate * 0.4) * 100);
  };

  const parseDate = (dateString) => {
  if (!dateString) return new Date(); // fallback to now
  // Replace space with T for ISO, remove microseconds
  return new Date(dateString.replace(' ', 'T').replace(/\.\d+/, ''));
};

  // Enhanced notification system that closes when tab changes
  const showNotificationAlert = useCallback((msg) => {
    setNotificationMessage(msg);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 4000);
  }, []);

  // Enhanced tab change handler that closes notifications
  const handleTabChange = useCallback((tab) => {
    setShowNotification(false); // Close notification when tab changes
    setActiveTab(tab);
  }, []);

  // ------------------ KEEPING ORIGINAL URL FORMATTING ------------------
  const formatPublicUrl = (url) => {
    if (!url) return null;
    if (url.includes("/object/public/")) return url;

    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split("/").filter(Boolean);
      const bucketIndex = pathParts.indexOf("s3") + 1;
      const bucket = pathParts[bucketIndex];
      const filePath = pathParts.slice(bucketIndex + 1).join("/");
      const projectDomain = urlObj.hostname.replace(".storage.", ".");
      return `https://${projectDomain}/storage/v1/object/public/${bucket}/${filePath}`;
    } catch {
      return url;
    }
  };

  // ------------------ KEEPING ORIGINAL EMPLOYEE FETCH ------------------
  const fetchLoggedInEmployee = async (token) => {
    try {
      const response = await axios.get("http://localhost:8080/auth/employees", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const storedEmail = localStorage.getItem("email");
      const employee = response.data.find(emp => emp.email === storedEmail);

      if (!employee) {
        console.error("Employee not found");
        navigate("/employee/login");
        return;
      }

      setEmployeeId(employee.employeeId);       
      setEmployeeName(employee.name || "Employee");
      localStorage.setItem("employeeId", employee.employeeId);
      localStorage.setItem("name", employee.name || "Employee");

    } catch (error) {
      console.error("Error fetching employee:", error);
      navigate("/employee/login");
    }
  };

  // ------------------ Enhanced policies fetch ------------------
  const fetchEmployeeData = async (token) => {
    setLoading(prev => ({ ...prev, policies: true }));
    try {
      const response = await axios.get("http://localhost:8080/employee/policies", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const formattedPolicies = response.data.map((policy) => ({
        id: policy.id,
        name: policy.policyName,
        provider: policy.providerName,
        coverageAmount: policy.coverageAmount,
        formattedCoverage: `₹${policy.coverageAmount?.toLocaleString('en-IN')}`,
        monthlyPremium: policy.monthlyPremium || 0,
        renewalDate: policy.renewalDate,
        status: policy.policyStatus,
        benefits: policy.policyDescription ? [policy.policyDescription] : [],
        contractUrl: formatPublicUrl(policy.contractUrl),
        termsUrl: formatPublicUrl(policy.termsUrl),
        claimFormUrl: formatPublicUrl(policy.claimFormUrl),
        annexureUrl: formatPublicUrl(policy.annexureUrl),
        remainingCoverageAmount: Number(policy.coverageAmount),
        policyType: policy.policyType || "General"
      }));

      setPolicies(formattedPolicies);
    } catch (error) {
      console.error("Error fetching employee data:", error);
      if (error.response?.status === 403) navigate("/employee/login");
    } finally {
      setLoading(prev => ({ ...prev, policies: false }));
    }
  };

  // Enhanced claims fetch
  const fetchEmployeeClaims = async (token) => {
    setLoading(prev => ({ ...prev, claims: true }));
    try {
      const response = await axios.get("http://localhost:8080/employee/claims", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClaims(response.data);
    } catch (error) {
      console.error("Error fetching claims:", error);
    } finally {
      setLoading(prev => ({ ...prev, claims: false }));
    }
  };

  // ------------------ KEEPING ORIGINAL AGENTS FETCH ------------------
  const fetchAgents = async (token) => {
    try {
      const response = await axios.get("http://localhost:8080/agent/availability/all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAgentsAvailability(response.data);
    } catch (error) {
      console.error("Error fetching agents:", error);
    }
  };

  // ------------------ KEEPING ORIGINAL QUERIES FETCH ------------------
  const fetchEmployeeQueries = async (token) => {
    setLoading(prev => ({ ...prev, queries: true }));
    try {
      const response = await axios.get("http://localhost:8080/employee/queries", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQueries(response.data);
    } catch (error) {
      console.error("Error fetching employee queries:", error);
      if (error.response?.status === 403) navigate("/employee/login");
    } finally {
      setLoading(prev => ({ ...prev, queries: false }));
    }
  };

  // ------------------ KEEPING ORIGINAL LOGOUT ------------------
  const handleLogout = () => {
    localStorage.clear();
    navigate("/employee/login");
  };

  // ------------------ Enhanced claim submission ------------------
  const handleClaimSubmit = (e) => {
    e.preventDefault();

    const claimAmount = Number(newClaim.amount);

    if (!newClaim.type || !claimAmount || !newClaim.description || !selectedPolicyId) {
      showNotificationAlert("Please fill all required claim fields.");
      return;
    }

    const selectedPolicy = policies.find(p => Number(p.id) === Number(selectedPolicyId));
    if (!selectedPolicy) {
      showNotificationAlert("Please select a valid policy.");
      return;
    }

    const approvedClaims = claims.filter(
      claim => Number(claim.policyId) === selectedPolicy.id && claim.status === "Approved"
    );
    const totalClaimed = approvedClaims.reduce((sum, claim) => sum + (Number(claim.amount) || 0), 0);
    const remainingCoverage = (selectedPolicy.coverageAmount || 0) - totalClaimed;

    if (claimAmount > remainingCoverage) {
      showNotificationAlert(
        `Claim amount exceeds remaining coverage (₹${remainingCoverage.toLocaleString("en-IN")})!`
      );
      return;
    }

    const updatedPolicies = policies.map(policy => {
      if (policy.id === selectedPolicy.id) {
        return {
          ...policy,
          remainingCoverageAmount: remainingCoverage - claimAmount
        };
      }
      return policy;
    });
    setPolicies(updatedPolicies);

    const newClaimData = {
      id: Math.floor(Math.random() * 100000),
      type: newClaim.type,
      amount: claimAmount,
      formattedAmount: `₹${claimAmount.toLocaleString("en-IN")}`,
      submittedDate: new Date().toISOString().split("T")[0],
      status: "In Review",
      processedDate: null,
      description: newClaim.description,
      policyId: selectedPolicy.id,
      policyName: selectedPolicy.name,
      documents: newClaim.documents || []
    };

    setClaims([...claims, newClaimData]);
    showNotificationAlert("Claim submitted successfully! It will be processed shortly.");

    setNewClaim({
      type: "",
      amount: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      documents: [],
      policyId: ""
    });
    setSelectedPolicyId("");
    handleTabChange("claims");
  };

  // ------------------ KEEPING ORIGINAL QUERY SUBMIT ------------------
  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token || token.trim() === "") {
      navigate("/employee/login");
      return;
    }

    if (!selectedAgentId) {
      showNotificationAlert("Please select an agent to assign the query.");
      return;
    }

    const selectedAgent = agentsAvailability.find(
      a => a.agent.id.toString() === selectedAgentId.toString()
    );
    if (!selectedAgent || !selectedAgent.available) {
      showNotificationAlert("Selected agent is not available. Please choose another agent.");
      return;
    }

    if (!newQuery.queryText || newQuery.queryText.trim() === "") {
      showNotificationAlert("Query text cannot be empty.");
      return;
    }

    if (!newQuery.policyId) {
      showNotificationAlert("Please select a policy.");
      return;
    }

    if (!newQuery.claimType || newQuery.claimType.trim() === "") {
      showNotificationAlert("Please select a claim type.");
      return;
    }

    const selectedPolicy = policies.find(
      p => p.id.toString() === newQuery.policyId.toString()
    );
    const policyName = selectedPolicy?.name || "";

    setLoading(prev => ({ ...prev, queries: true }));

    try {
      const response = await axios.post(
        `http://localhost:8080/employee/queries?agentId=${selectedAgentId}&queryText=${encodeURIComponent(newQuery.queryText)}&policyName=${encodeURIComponent(policyName)}&claimType=${encodeURIComponent(newQuery.claimType)}`,
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const savedQuery = response.data;
      setQueries([savedQuery, ...queries]);
      showNotificationAlert("Query submitted successfully! An agent will respond shortly.");

      setNewQuery({ queryText: "", policyId: "", claimType: "" });
      setSelectedAgentId("");
      handleTabChange("myQueries");
    } catch (error) {
      console.error("Error submitting query:", error);
      const msg = error.response?.data || "Failed to submit query. Check console for details.";
      showNotificationAlert(msg);
    } finally {
      setLoading(prev => ({ ...prev, queries: false }));
    }
  };

  const handleDocumentUpload = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      setNewClaim({
        ...newClaim,
        documents: [...newClaim.documents, ...Array.from(files)]
      });
    }
  };

  const handleQueryInputChange = (field, value) => {
    setNewQuery({ ...newQuery, [field]: value });
  };

  // ------------------ Enhanced PDF download ------------------
  const downloadPolicy = (policy) => {
    const doc = new jsPDF();

    // Enhanced header with branding
    doc.setFillColor(27, 38, 44);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text("INSURAI ENTERPRISE", 105, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text("Policy Document", 105, 22, { align: 'center' });

    // Policy details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text(policy.name, 20, 45);

    doc.setFontSize(12);
    let yPosition = 60;
    
    const details = [
      `Provider: ${policy.provider}`,
      `Coverage: ${policy.formattedCoverage}`,
      `Monthly Premium: ₹${policy.monthlyPremium?.toLocaleString('en-IN')}`,
      `Renewal Date: ${policy.renewalDate}`,
      `Status: ${policy.status}`,
      `Policy Type: ${policy.policyType || 'General'}`
    ];

    details.forEach(detail => {
      doc.text(detail, 20, yPosition);
      yPosition += 8;
    });

    // Benefits section
    yPosition += 10;
    doc.setFontSize(14);
    doc.text("Covered Benefits:", 20, yPosition);
    yPosition += 10;
    doc.setFontSize(10);
    
    policy.benefits.forEach((benefit, index) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(`• ${benefit}`, 25, yPosition);
      yPosition += 6;
    });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 285);
    doc.text("InsurAI Enterprise - Confidential Document", 105, 285, { align: 'center' });

    doc.save(`${policy.name.replace(/\s+/g, '_')}_Policy.pdf`);
  };

  const viewPolicyDetails = (policy) => {
    setSelectedPolicy(policy);
  };

  // Enhanced navigation items with badges
  const navigationItems = [
    { tab: "home", label: "Dashboard", icon: "bi-speedometer2", badge: null },
    { tab: "policies", label: "My Policies", icon: "bi-file-text", badge: dashboardStats.activePolicies },
    { tab: "enrollments", label: "Enrollments", icon: "bi-card-checklist", badge: null },
    { tab: "claims", label: "My Claims", icon: "bi-wallet2", badge: dashboardStats.pendingClaims },
    { tab: "newClaim", label: "Submit Claim", icon: "bi-plus-circle", badge: null },
    { tab: "reimbursements", label: "Reimbursements", icon: "bi-cash-coin", badge: null },
    { tab: "renewals", label: "Policy Renewals", icon: "bi-calendar-check", badge: dashboardStats.upcomingRenewals > 0 ? dashboardStats.upcomingRenewals : null },
    { tab: "askQuery", label: "Ask a Question", icon: "bi-question-circle", badge: null },
    { tab: "myQueries", label: "My Queries", icon: "bi-chat-left-text", badge: dashboardStats.totalQueries },
    { tab: "notifications", label: "Notifications", icon: "bi-bell", badge: null },
    { tab: "support", label: "Support", icon: "bi-headset", badge: null },
  ];

  // ------------------ Enhanced Home Dashboard with Advanced UI ------------------
  const renderEnhancedHomeDashboard = () => (
    <div className="emp-home-dashboard">
      {/* Hero Section */}
      <section className="emp-hero">
        <div className="emp-hero__content">
          <span className="emp-hero__eyebrow">Welcome back</span>
          <h2 className="emp-hero__title">Hello, {employeeName}</h2>
          <p className="emp-hero__subtitle">Track claims, monitor policies, and access support seamlessly.</p>
          <div className="emp-hero__actions">
            <button type="button" className="emp-btn emp-btn--accent" onClick={() => handleTabChange("newClaim")}>
              <i className="bi bi-plus-circle"></i>
              File a Claim
            </button>
            <button type="button" className="emp-btn emp-btn--outline" onClick={() => handleTabChange("support")}>
              <i className="bi bi-headset"></i>
              Contact Support
            </button>
          </div>
        </div>
        <div className="emp-hero__meta">
          <div className="emp-hero__clock">
            <span>{currentTime.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
            <strong>{currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</strong>
          </div>
          <div className="emp-hero__badges">
            <span className="emp-badge emp-badge--primary">Enterprise Portal</span>
            <span className="emp-badge emp-badge--success">Secure Session</span>
          </div>
        </div>
      </section>

      {/* Statistics Grid */}
      <section className="emp-stats-grid">
        {[
          { label: "Active Policies", value: dashboardStats.activePolicies, icon: "bi-shield-check", meta: `${(dashboardStats.totalCoverage / 100000).toFixed(1)}L coverage`, variant: "" },
          { label: "Pending Claims", value: dashboardStats.pendingClaims, icon: "bi-clock-history", meta: `${dashboardStats.approvalRate}% approval rate`, variant: "accent" },
          { label: "Total Queries", value: dashboardStats.totalQueries, icon: "bi-chat-left-text", meta: `${dashboardStats.resolvedQueries} resolved`, variant: "info" },
          { label: "Renewals Due", value: dashboardStats.upcomingRenewals, icon: "bi-calendar-event", meta: "Next 30 days", variant: "warning" },
          { label: "Risk Score", value: `${dashboardStats.riskScore}%`, icon: "bi-activity", meta: "Overall status", variant: "success" },
          { label: "Efficiency", value: `${dashboardStats.efficiencyScore}%`, icon: "bi-lightning", meta: "System performance", variant: "danger" }
        ].map((stat) => (
          <article key={stat.label} className={`emp-stat-card ${stat.variant ? `emp-stat-card--${stat.variant}` : ''}`}>
            <div className="emp-stat-header">
              <div className="emp-stat-icon">
                <i className={`bi ${stat.icon}`}></i>
              </div>
            </div>
            <div className="emp-stat-value">{stat.value}</div>
            <div className="emp-stat-label">{stat.label}</div>
            <span className="emp-stat-trend emp-stat-trend--up">
              <i className="bi bi-arrow-up-right"></i>
              {stat.meta}
            </span>
          </article>
        ))}
      </section>

      {/* Financial & Actions Grid */}
      <div className="emp-dashboard-grid">
        {/* Financial Summary Card */}
        <div className="emp-card">
          <div className="emp-card-header">
            <h3 className="emp-card-title">
              <i className="bi bi-currency-rupee"></i>
              Financial Summary
            </h3>
          </div>
          <div className="emp-card-body">
            <div className="emp-financial-row">
              <span>Monthly Premium</span>
              <strong className="emp-text-success">₹{dashboardStats.monthlyPremium.toLocaleString('en-IN')}</strong>
            </div>
            <div className="emp-financial-row">
              <span>Total Claims</span>
              <strong className="emp-text-warning">₹{dashboardStats.totalClaimsAmount.toLocaleString('en-IN')}</strong>
            </div>
            <div className="emp-financial-row">
              <span>Avg Claim</span>
              <strong className="emp-text-info">₹{dashboardStats.avgClaimAmount.toLocaleString('en-IN')}</strong>
            </div>
            <div className="emp-financial-row">
              <span>Coverage Used</span>
              <strong className="emp-text-primary">
                {dashboardStats.totalCoverage > 0 ? 
                  Math.round((dashboardStats.totalClaimsAmount / dashboardStats.totalCoverage) * 100) : 0}%
              </strong>
            </div>
          </div>
        </div>

        {/* Performance Metrics Card */}
        <div className="emp-card">
          <div className="emp-card-header">
            <h3 className="emp-card-title">
              <i className="bi bi-speedometer2"></i>
              Performance Metrics
            </h3>
          </div>
          <div className="emp-card-body">
            <div className="emp-metric">
              <div className="emp-metric__header">
                <span>Claim Approval Rate</span>
                <strong>{dashboardStats.approvalRate}%</strong>
              </div>
              <div className="emp-progress">
                <div className="emp-progress__bar emp-progress__bar--primary" style={{width: `${dashboardStats.approvalRate}%`}}></div>
              </div>
            </div>
            <div className="emp-metric">
              <div className="emp-metric__header">
                <span>Query Resolution</span>
                <strong>
                  {dashboardStats.totalQueries > 0 ? 
                    Math.round((dashboardStats.resolvedQueries / dashboardStats.totalQueries) * 100) : 0}%
                </strong>
              </div>
              <div className="emp-progress">
                <div className="emp-progress__bar emp-progress__bar--info" style={{width: `${dashboardStats.totalQueries > 0 ? Math.round((dashboardStats.resolvedQueries / dashboardStats.totalQueries) * 100) : 0}%`}}></div>
              </div>
            </div>
            <div className="emp-metric">
              <div className="emp-metric__header">
                <span>System Efficiency</span>
                <strong>{dashboardStats.efficiencyScore}%</strong>
              </div>
              <div className="emp-progress">
                <div className="emp-progress__bar emp-progress__bar--accent" style={{width: `${dashboardStats.efficiencyScore}%`}}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="emp-card">
          <div className="emp-card-header">
            <h3 className="emp-card-title">
              <i className="bi bi-lightning-fill"></i>
              Quick Actions
            </h3>
          </div>
          <div className="emp-card-body">
            <div className="emp-quick-actions">
              {[
                { label: "Submit Claim", icon: "bi-plus-circle", variant: "", tab: "newClaim" },
                { label: "Ask Question", icon: "bi-question-circle", variant: "info", tab: "askQuery" },
                { label: "View Policies", icon: "bi-file-text", variant: "success", tab: "policies" },
                { label: "Check Claims", icon: "bi-wallet2", variant: "accent", tab: "claims" },
              ].map((action, index) => (
                <button 
                  key={index}
                  className={`emp-quick-action ${action.variant ? `emp-quick-action--${action.variant}` : ''}`}
                  onClick={() => handleTabChange(action.tab)}
                >
                  <span className="emp-quick-action__icon">
                    <i className={`bi ${action.icon}`}></i>
                  </span>
                  <span className="emp-quick-action__label">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Activity & System Status Row */}
      <div className="emp-dashboard-bottom">
        {/* Recent Activity */}
        <div className="emp-card emp-card--wide">
          <div className="emp-card-header">
            <h3 className="emp-card-title">
              <i className="bi bi-clock-history"></i>
              Recent Activity
            </h3>
            <span className="emp-badge emp-badge--primary">Live</span>
          </div>
          <div className="emp-card-body">
            <div className="emp-activity-list">
              {[...claims, ...queries]
                .sort((a, b) => parseDate(b.submittedDate || b.created_at) - parseDate(a.submittedDate || a.created_at))
                .slice(0, 5)
                .map((item, index) => {
                  const itemDate = parseDate(item.submittedDate || item.created_at);
                  const statusVariant = item.status === 'Approved' ? 'success' : item.status === 'Pending' ? 'warning' : 'info';
                  return (
                    <div key={index} className="emp-activity-item">
                      <div className={`emp-activity-icon emp-activity-icon--${statusVariant}`}>
                        <i className={`bi bi-${item.amount ? 'wallet2' : 'chat-dots'}`}></i>
                      </div>
                      <div className="emp-activity-content">
                        <h4 className="emp-activity-title">{item.amount ? 'Claim Submitted' : 'Query Asked'}</h4>
                        <p className="emp-activity-desc">
                          {item.amount
                            ? `₹${Number(item.amount || 0).toLocaleString('en-IN')}`
                            : item.queryText?.substring(0, 50) + (item.queryText?.length > 50 ? '...' : '')}
                        </p>
                      </div>
                      <div className="emp-activity-meta">
                        <span className="emp-activity-time">{itemDate.toLocaleDateString('en-IN')}</span>
                        <span className={`emp-badge emp-badge--${statusVariant}`}>
                          {item.status || 'Open'}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="emp-card">
          <div className="emp-card-header">
            <h3 className="emp-card-title">
              <i className="bi bi-heart-pulse"></i>
              System Status
            </h3>
          </div>
          <div className="emp-card-body">
            <div className="emp-status-list">
              {[
                { service: 'Policy Management', status: 'Operational' },
                { service: 'Claims Processing', status: 'Operational' },
                { service: 'Query System', status: 'Operational' },
                { service: 'Document Storage', status: 'Operational' },
                { service: 'Agent Support', status: `${agentsAvailability.filter(a => a.available).length} Online` },
              ].map((service, index) => (
                <div key={index} className="emp-status-item">
                  <div className="emp-status-info">
                    <span className="emp-status-indicator"></span>
                    <span>{service.service}</span>
                  </div>
                  <span className="emp-badge emp-badge--success">{service.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="emp-dashboard">
      {/* Notification Alert */}
      {showNotification && (
        <div className="emp-notification-toast">
          <div className="emp-notification-toast__content">
            <i className="bi bi-check-circle"></i>
            <span>{notificationMessage}</span>
            <button type="button" className="emp-notification-toast__close" onClick={() => setShowNotification(false)}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <EmployeeNavbar
        employeeName={employeeName}
        userInitial={userInitial}
        onLogout={handleLogout}
        onToggleMenu={() => setIsMobileMenuOpen((prev) => !prev)}
        isMobileMenuOpen={isMobileMenuOpen}
        notificationCount={backendNotifications.filter(n => !n.readStatus).length}
        notifications={backendNotifications}
        onNotificationClick={handleNotificationClick}
        onMarkAsRead={handleMarkNotificationAsRead}
      />

      {/* Main Layout */}
      <div className="emp-main">
        {/* Sidebar */}
        <EmployeeSidebar
          navigationItems={navigationItems}
          activeTab={activeTab}
          onChangeTab={(tab) => {
            handleTabChange(tab);
            if (tab === "notifications") {
              setShowNotification(false);
              setNotificationMessage("");
            }
          }}
          isMobileMenuOpen={isMobileMenuOpen}
          onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
        />

        {/* Content Area */}
        <main className="emp-content">
          <div className="emp-content-wrapper">
            {activeTab === "home" && renderEnhancedHomeDashboard()}
            {activeTab === "policies" && (
              <EmployeePolicies
                employeeId={employeeId}
                downloadPolicy={downloadPolicy}
                policies={policies}
                selectedPolicy={selectedPolicy}
                setSelectedPolicy={setSelectedPolicy}
              />
            )}
            {activeTab === "enrollments" && (
              <EmployeeEnrollments
                policies={policies}
                showNotificationAlert={showNotificationAlert}
              />
            )}
            {(activeTab === "claims" || activeTab === "newClaim") && (
              <EmployeeClaims
                policies={policies}
                activeTab={activeTab}
                setActiveTab={handleTabChange}
                claims={claims}
                newClaim={newClaim}
                setNewClaim={setNewClaim}
                handleClaimSubmit={handleClaimSubmit}
                handleDocumentUpload={handleDocumentUpload}
                showNotificationAlert={showNotificationAlert}
                employeeId={employeeId}
                token={localStorage.getItem("token")}
                selectedPolicyId={selectedPolicyId}
                setSelectedPolicyId={setSelectedPolicyId}
              />
            )}
            {activeTab === "reimbursements" && (
              <EmployeeReimbursements
                showNotificationAlert={showNotificationAlert}
              />
            )}
            {activeTab === "renewals" && (
              <EmployeeRenewals
                showNotificationAlert={showNotificationAlert}
              />
            )}
            {(activeTab === "askQuery" || activeTab === "myQueries" || activeTab === "queryDetails") && (
              <EmployeeQueries
                activeTab={activeTab}
                queries={queries}
                setActiveTab={handleTabChange}
                agentsAvailability={agentsAvailability}
                selectedAgentId={selectedAgentId}
                setSelectedAgentId={setSelectedAgentId}
                handleQuerySubmit={handleQuerySubmit}
                handleQueryInputChange={handleQueryInputChange}
                newQuery={newQuery}
                loading={loading.queries}
                policies={policies}
                claimTypes={claimTypes}
              />
            )}
            {activeTab === "notifications" && (
              <EmployeeNotification
                userDbId={Number(localStorage.getItem("id"))}
                token={localStorage.getItem("token") || ""}
              />
            )}
            {activeTab === "support" && (
              <EmployeeSupport
                agentsAvailability={agentsAvailability}
                selectedAgentId={selectedAgentId}
                setSelectedAgentId={setSelectedAgentId}
                showNotificationAlert={showNotificationAlert}
              />
            )}
          </div>
        </main>
      </div>

      {/* Chatbot */}
      <Chatbot employeeData={{ name: employeeName, claims, policies, queries }} />
    </div>
  );
}