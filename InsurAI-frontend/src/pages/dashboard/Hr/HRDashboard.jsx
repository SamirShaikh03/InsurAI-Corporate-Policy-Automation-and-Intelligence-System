import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../../config";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "./HRDashboard.css";
import ReportsAnalytics from "./ReportsAnalytics";
import HRClaims from "./HRClaims";
import HRPolicies from "./HRPolicies";
import HREmployees from "./HREmployees"; 
import HRFraud from "./HRFraud";
import HRNotification from "./HRNotification";
import HREnrollments from "./HREnrollments";
import HRReimbursements from "./HRReimbursements";
import HRRenewals from "./HRRenewals";
import HRNavbar from "./components/HRNavbar";
import HRSidebar from "./components/HRSidebar";
import { SkeletonDashboard, SkeletonStats, SkeletonTable, SectionLoader, InlineSpinner } from "../../../components/loading";

// Enhanced HR Dashboard with Enterprise Features
export default function HRDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("home");

  // Enhanced State Management
  const [pendingClaims, setPendingClaims] = useState([]);
  const [mappedClaims, setMappedClaims] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [hrs, setHrs] = useState([]);
  const [fraudAlerts, setFraudAlerts] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [viewingClaim, setViewingClaim] = useState(null);
  const [remarksInput, setRemarksInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchName, setSearchName] = useState("");
  const [policyFilter, setPolicyFilter] = useState("");

  // Enhanced Dashboard States
  const [dashboardStats, setDashboardStats] = useState({
    pendingClaims: 0,
    approvedClaims: 0,
    rejectedClaims: 0,
    totalClaimsAmount: 0,
    pendingAmount: 0,
    activePolicies: 0,
    expiringPolicies: 0,
    activeEmployees: 0,
    totalEmployees: 0,
    approvalRate: 0,
    avgProcessingTime: "2.3 days",
    highPriorityClaims: 0,
    totalCoverageAmount: 0,
    monthlyPremium: 0,
    fraudRiskScore: 0
  });

  const [loading, setLoading] = useState({
    claims: true,
    employees: true,
    policies: true,
    dashboard: true
  });

  const [notifications, setNotifications] = useState([]);
  const [backendNotifications, setBackendNotifications] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({});
  const [quickActions, setQuickActions] = useState([]);

  // claim notification count for sidebar / quick actions
  const [claimNotifications, setClaimNotifications] = useState(0);
  
  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const loggedInHrId = parseInt(localStorage.getItem("id"));
  
  // Get HR name from localStorage
  const hrName = localStorage.getItem('hrName') || localStorage.getItem('name') || 'HR Administrator';
  
  // Calculate user initials
  const userInitial = (() => {
    const name = (hrName || "").trim();
    if (!name) return "HR";
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
      const p = parts[0];
      return (p.charAt(0) + (p.charAt(1) || "")).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  })();
  
  // Navigation items configuration
  const navigationItems = [
    { tab: 'home', icon: 'bi-speedometer2', label: 'Dashboard', badge: null },
    { tab: 'claims', icon: 'bi-file-earmark-check', label: 'Claim Approval', badge: dashboardStats.pendingClaims || null },
    { tab: 'enrollments', icon: 'bi-card-checklist', label: 'Enrollments', badge: null },
    { tab: 'reimbursements', icon: 'bi-cash-coin', label: 'Reimbursements', badge: null },
    { tab: 'policies', icon: 'bi-card-list', label: 'Policies', badge: null },
    { tab: 'renewals', icon: 'bi-calendar-check', label: 'Renewals', badge: null },
    { tab: 'employees', icon: 'bi-people', label: 'Employees', badge: null },
    { tab: 'fraud', icon: 'bi-shield-exclamation', label: 'Fraud Monitor', badge: dashboardStats.fraudRiskScore > 70 ? '!' : null },
    { tab: 'reports', icon: 'bi-graph-up', label: 'Analytics', badge: null },
    { tab: 'notifications', icon: 'bi-bell', label: 'Notifications', badge: notifications.filter((n) => !n.read).length || null },
  ];

  // clear claim notifications when user navigates to the claims tab
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "claims") {
      setClaimNotifications(0);
    }
  };

  // Enhanced Data Fetching with Error Handling
  // Fetch backend notifications
  const fetchBackendNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(
        `${API_BASE_URL}/notifications/user/${loggedInHrId}`,
        {
          params: { role: "HR" },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setBackendNotifications(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  }, [loggedInHrId]);

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, employees: true }));
      const response = await fetch(`${API_BASE_URL}/auth/employees`);
      if (!response.ok) throw new Error('Failed to fetch employees');
      const data = await response.json();
      setEmployees(Array.isArray(data) ? data : []);
      console.debug("fetchEmployees ->", Array.isArray(data) ? data.length : 0);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error("Error fetching employees:", err);
      addNotification('error', 'Failed to load employee data', true);
      return [];
    } finally {
      setLoading(prev => ({ ...prev, employees: false }));
    }
  }, []);

  const fetchHRList = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/hr`);
      if (!response.ok) throw new Error('Failed to fetch HR list');
      const data = await response.json();
      setHrs(Array.isArray(data) ? data : []);
      return Array.isArray(data) ? data : [];
    } catch (err) {
      console.error("Error fetching HR list:", err);
      addNotification('error', 'Failed to load HR team data', true);
      return [];
    }
  }, []);

  const fetchPolicies = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, policies: true }));
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/employee/policies`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (!response.ok) {
        throw new Error('Failed to fetch policies');
      }

      const data = await response.json();
      const policiesArray = Array.isArray(data) ? data : (data?.policies ?? []);
      const formattedPolicies = policiesArray.map(policy => ({
        id: policy.id ?? policy.policyId ?? null,
        policyName: policy.policyName ?? policy.name ?? "Unknown Policy",
        policyType: policy.policyType ?? policy.type ?? "General",
        providerName: policy.providerName ?? policy.provider ?? "Unknown",
        coverageAmount: Number(policy.coverageAmount ?? policy.coverage ?? 0) || 0,
        monthlyPremium: Number(policy.monthlyPremium ?? policy.premium ?? 0) || 0,
        renewalDate: policy.renewalDate ?? policy.renewal_date ?? null,
        policyStatus: policy.policyStatus ?? policy.status ?? "Unknown",
        policyDescription: policy.policyDescription ?? policy.description ?? "",
        contractUrl: policy.contractUrl ?? policy.contract_url ?? null,
        termsUrl: policy.termsUrl ?? policy.terms_url ?? null,
        claimFormUrl: policy.claimFormUrl ?? policy.claim_form_url ?? null,
        annexureUrl: policy.annexureUrl ?? policy.annexure_url ?? null,
      }));
      setPolicies(formattedPolicies);
      console.debug("fetchPolicies ->", formattedPolicies.length);
      return formattedPolicies;
    } catch (err) {
      console.error("Error fetching policies:", err);
      addNotification('error', 'Failed to load policy data', true);
      return [];
    } finally {
      setLoading(prev => ({ ...prev, policies: false }));
    }
  }, []);

  const fetchClaims = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, claims: true }));
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/hr/login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/hr/claims?hrId=${loggedInHrId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setPendingClaims(data);
        processEnhancedDashboardStats(data);
        addNotification('success', `Loaded ${data.length} claims successfully`);
      } else if (response.status === 403) {
        navigate("/hr/login");
      } else {
        throw new Error('Failed to fetch claims');
      }
    } catch (err) {
      console.error("Error fetching claims:", err);
      addNotification('error', 'Failed to load claim data');
    } finally {
      setLoading(prev => ({ ...prev, claims: false }));
    }
  }, [loggedInHrId, navigate]);

  // memoize employees/policies to break circular deps
  const memoizedEmployees = useMemo(() => employees, [employees.length]);
  const memoizedPolicies = useMemo(() => policies, [policies.length]);

  // memoize helpers so stats callback can stay stable
  const calculateFraudRiskScore = useCallback((claims) => {
    if (!Array.isArray(claims) || claims.length === 0) return 0;
    const highAmountClaims = claims.filter(claim => parseFloat(claim.amount) > 100000).length;
    const recentClaims = claims.filter(claim => {
      const claimDate = new Date(claim.claimDate);
      const daysAgo = (new Date() - claimDate) / (1000 * 60 * 60 * 24);
      return daysAgo < 30;
    }).length;
    return Math.min(100, Math.round((highAmountClaims / claims.length) * 50 + (recentClaims / claims.length) * 50));
  }, []);

  const calculateAverageProcessingTime = useCallback((claims) => {
    const processedClaims = (Array.isArray(claims) ? claims : []).filter(claim => claim.status !== "Pending");
    if (processedClaims.length === 0) return "0 days";
    const totalProcessingTime = processedClaims.reduce((sum, claim) => {
      const created = new Date(claim.createdDate || claim.claimDate || Date.now());
      const processed = new Date(claim.processedDate || Date.now());
      return sum + (processed - created);
    }, 0);
    const avgDays = totalProcessingTime / (processedClaims.length * 1000 * 60 * 60 * 24);
    return `${avgDays.toFixed(1)} days`;
  }, []);

  // stable stats processor using memoizedEmployees/policies
  const processEnhancedDashboardStats = useCallback((claims) => {
    const cls = Array.isArray(claims) ? claims : [];
    const emps = memoizedEmployees || [];
    const pols = memoizedPolicies || [];

    const pendingClaims = cls.filter(c => (c.status ?? c.claim_status) === "Pending");
    const approvedClaims = cls.filter(c => (c.status ?? c.claim_status) === "Approved");
    const rejectedClaims = cls.filter(c => (c.status ?? c.claim_status) === "Rejected");

    const getAmount = c => parseFloat(c.amount ?? c.claim_amount ?? 0) || 0;
    const totalClaimsAmount = cls.reduce((sum, c) => sum + getAmount(c), 0);
    const pendingAmount = pendingClaims.reduce((sum, c) => sum + getAmount(c), 0);

    const activePolicies = pols.length;
    const totalCoverageAmount = pols.reduce((sum, p) => sum + (parseFloat(p.coverageAmount ?? p.total_coverage ?? 0) || 0), 0);

    const totalEmployees = emps.length;
    const activeEmployees = emps.some(e => typeof e.active !== "undefined") ? emps.filter(e => e.active).length : totalEmployees;

    const approvalRate = cls.length > 0 ? Math.round((approvedClaims.length / cls.length) * 100) : 0;
    const avgProcessingTime = calculateAverageProcessingTime(cls);
    const fraudRiskScore = calculateFraudRiskScore(cls);

    setDashboardStats({
      pendingClaims: pendingClaims.length,
      approvedClaims: approvedClaims.length,
      rejectedClaims: rejectedClaims.length,
      totalClaimsAmount,
      pendingAmount,
      activePolicies,
      expiringPolicies: 0,
      activeEmployees,
      totalEmployees,
      approvalRate,
      avgProcessingTime,
      highPriorityClaims: pendingClaims.filter(c => getAmount(c) > 50000).length,
      totalCoverageAmount,
      monthlyPremium: 0,
      fraudRiskScore,
    });
  }, [memoizedEmployees, memoizedPolicies, calculateAverageProcessingTime, calculateFraudRiskScore]);

  // only trigger when backend arrays change (use lengths to avoid callback instability)
  useEffect(() => {
    if (pendingClaims.length > 0 && employees.length > 0 && policies.length > 0) {
      processEnhancedDashboardStats(pendingClaims);
    }
  }, [pendingClaims, employees.length, policies.length, processEnhancedDashboardStats]);

  // Enhanced Notification System
  const addNotification = (type, message, autoClose = true) => {
    const id = Date.now(); // unique ID for each notification
    const notification = {
      id,
      type,
      message,
      timestamp: new Date(),
      read: false
    };

    // Add the new notification at the start and limit to 5 max notifications
    setNotifications(prev => {
      const updated = [notification, ...prev];
      return updated.slice(0, 5); // Keep only 5 most recent notifications
    });

    // Auto-remove after 5 seconds (use functional update to avoid stale state)
    if (autoClose) {
      const timer = setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, 5000);
      // optional: store timers if you want to clear on unmount (not strictly required here)
    }
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
  };

  const handleMarkNotificationAsRead = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });

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

  // Auto-mark notifications as read after 5s to improve UX (cleans up timely)
  useEffect(() => {
    const timers = [];
    notifications.forEach(n => {
      if (!n.read) {
        const t = setTimeout(() => {
          setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
        }, 5000);
        timers.push(t);
      }
    });
    return () => timers.forEach(clearTimeout);
  }, [notifications]);

  // Enhanced Modal Handlers
  const openViewModal = (claim) => {
    setViewingClaim(claim);
    addNotification('info', `Viewing claim from ${claim.employeeName}`);
  };

  const closeViewModal = () => setViewingClaim(null);

  const handleView = (employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
    addNotification('info', `Viewing employee: ${employee.name}`);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEmployee(null);
  };

  const handleEdit = (employee) => {
    addNotification('warning', `Edit feature coming soon for: ${employee.name}`);
  };

  // Enhanced Claim Mapping
  useEffect(() => {
    if (pendingClaims.length > 0 && employees.length > 0 && hrs.length > 0 && policies.length > 0) {
      const updatedClaims = pendingClaims.map(claim => {
        const employee = employees.find(emp => emp.id === claim.employeeId || claim.employee_id);
        const hr = hrs.find(hr => hr.id === claim.assignedHrId || claim.assigned_hr_id);
        const policy = policies.find(p => p.id === claim.policyId || claim.policy_id);

        return {
          ...claim,
          employeeName: employee?.name || "Unknown",
          employeeIdDisplay: employee?.employeeId || "N/A",
          documents: claim.documents || [],
          assignedHrName: hr?.name || "Not Assigned",
          policyName: policy?.policyName || "N/A",
          canModify: claim.assignedHrId === loggedInHrId || claim.assigned_hr_id === loggedInHrId,
          remarks: claim.remarks || "",
          priority: calculateClaimPriority(claim),
          daysPending: calculateDaysPending(claim)
        };
      });
      setMappedClaims(updatedClaims);
    }
  }, [pendingClaims, employees, hrs, policies, loggedInHrId]);

  const calculateClaimPriority = (claim) => {
    const amount = parseFloat(claim.amount) || 0;
    if (amount > 100000) return "High";
    if (amount > 50000) return "Medium";
    return "Low";
  };

  const calculateDaysPending = (claim) => {
    const claimDate = new Date(claim.claimDate);
    const today = new Date();
    return Math.ceil((today - claimDate) / (1000 * 60 * 60 * 24));
  };

  // Enhanced Claim Actions
  const approveClaim = async (id, remarks) => {
    const claim = mappedClaims.find(c => c.id === id);
    if (!claim.canModify) {
      addNotification('error', 'You are not assigned to this claim');
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/hr/claims/approve/${id}`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ remarks })
      });
      
      if (response.ok) {
        const updatedClaim = await response.json();
        const hr = hrs.find(hr => hr.id === updatedClaim.assignedHrId);
        const policy = policies.find(p => p.id === updatedClaim.policyId);
        
        setMappedClaims(prev =>
          prev.map(c => (c.id === id ? {
            ...updatedClaim,
            employeeName: employees.find(emp => emp.id === updatedClaim.employeeId)?.name || "Unknown",
            employeeIdDisplay: employees.find(emp => emp.id === updatedClaim.employeeId)?.employeeId || "N/A",
            documents: updatedClaim.documents || [],
            assignedHrName: hr?.name || "Not Assigned",
            policyName: policy?.policyName || "N/A",
            canModify: updatedClaim.assignedHrId === loggedInHrId,
            remarks: updatedClaim.remarks || ""
          } : c))
        );
        
        addNotification('success', `Claim approved successfully for ${claim.employeeName}`);
        fetchClaims(); // Refresh claims data
      } else {
        throw new Error('Failed to approve claim');
      }
    } catch (err) {
      console.error("Error approving claim:", err);
      addNotification('error', 'Failed to approve claim');
    }
  };

  const rejectClaim = async (id, remarks) => {
    const claim = mappedClaims.find(c => c.id === id);
    if (!claim.canModify) {
      addNotification('error', 'You are not assigned to this claim');
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/hr/claims/reject/${id}`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ remarks })
      });
      
      if (response.ok) {
        const updatedClaim = await response.json();
        const hr = hrs.find(hr => hr.id === updatedClaim.assignedHrId);
        const policy = policies.find(p => p.id === updatedClaim.policyId);
        
        setMappedClaims(prev =>
          prev.map(c => (c.id === id ? {
            ...updatedClaim,
            employeeName: employees.find(emp => emp.id === updatedClaim.employeeId)?.name || "Unknown",
            employeeIdDisplay: employees.find(emp => emp.id === updatedClaim.employeeId)?.employeeId || "N/A",
            documents: updatedClaim.documents || [],
            assignedHrName: hr?.name || "Not Assigned",
            policyName: policy?.policyName || "N/A",
            canModify: updatedClaim.assignedHrId === loggedInHrId,
            remarks: updatedClaim.remarks || ""
          } : c))
        );
        
        addNotification('warning', `Claim rejected for ${claim.employeeName}`);
        fetchClaims(); // Refresh claims data
      } else {
        throw new Error('Failed to reject claim');
      }
    } catch (err) {
      console.error("Error rejecting claim:", err);
      addNotification('error', 'Failed to reject claim');
    }
  };

  // Enhanced Data Export Functions
  const downloadCSV = () => {
    if (!displayedClaims.length) {
      addNotification('warning', 'No claims available to download');
      return;
    }

    // Helper function to escape CSV values
    const escapeCSV = (value) => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    let csvContent = '';

    // Report Header
    csvContent += 'InsurAI - HR Dashboard Claims Export\n';
    csvContent += `Generated Date,${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n`;
    csvContent += `HR Manager,${hrName || 'N/A'}\n`;
    csvContent += `Filter Applied,${statusFilter}\n`;
    csvContent += `Total Records,${displayedClaims.length}\n`;
    csvContent += '\n';

    // Summary Statistics
    csvContent += 'CLAIMS SUMMARY\n';
    csvContent += 'Metric,Count\n';
    csvContent += `Total Claims,${claimStats.total}\n`;
    csvContent += `Pending,${claimStats.pending}\n`;
    csvContent += `Approved,${claimStats.approved}\n`;
    csvContent += `Rejected,${claimStats.rejected}\n`;
    csvContent += '\n';

    // Data Headers
    csvContent += 'DETAILED CLAIMS DATA\n';
    const headers = [
      "#", "Employee Name", "Employee ID", "Claim Type", "Amount (₹)", "Date",
      "Status", "Policy Name", "Remarks", "Priority", "Days Pending", "Documents"
    ];
    csvContent += headers.join(',') + '\n';

    displayedClaims.forEach((c, idx) => {
      const docLinks = c.documents?.length > 0
        ? c.documents.map(d => {
            const filename = d.split('/').pop();
            return `${API_BASE_URL}/api/files/download/${filename}`;
          }).join(' | ')
        : 'No documents';

      const row = [
        idx + 1,
        escapeCSV(c.employeeName || 'N/A'),
        escapeCSV(c.employeeIdDisplay || 'N/A'),
        escapeCSV(c.title || 'N/A'),
        c.amount || 0,
        c.claimDate ? new Date(c.claimDate).toLocaleDateString() : 'N/A',
        c.status || 'N/A',
        escapeCSV(c.policyName || 'N/A'),
        escapeCSV(c.remarks || ''),
        c.priority || '-',
        c.daysPending || 0,
        escapeCSV(docLinks)
      ];
      csvContent += row.join(',') + '\n';
    });

    // Footer
    csvContent += '\n';
    csvContent += 'Generated by InsurAI - Corporate Policy Automation & Intelligence System\n';
    csvContent += 'Confidential - For Internal Use Only\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `claims_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addNotification('success', 'CSV export completed successfully');
  };

  const downloadPDF = () => {
    if (!displayedClaims.length) {
      addNotification('warning', 'No claims available to download');
      return;
    }

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;

    // === HEADER SECTION ===
    doc.setFillColor(22, 4, 63);
    doc.rect(0, 0, pageWidth, 40, 'F');

    // Company Logo/Name
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('InsurAI', margin, 16);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Corporate Policy Automation & Intelligence', margin, 23);

    // Report Title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('HR CLAIMS DASHBOARD REPORT', pageWidth - margin, 16, { align: 'right' });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}`, pageWidth - margin, 23, { align: 'right' });
    doc.text(`HR Manager: ${hrName || 'N/A'}`, pageWidth - margin, 29, { align: 'right' });

    // Filter bar
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 40, pageWidth, 10, 'F');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Filter: ${statusFilter} | Total Records: ${displayedClaims.length} | Report Type: Dashboard Export`, margin, 46);

    let yPos = 58;

    // === SUMMARY STATISTICS ===
    doc.setFontSize(12);
    doc.setTextColor(22, 4, 63);
    doc.setFont('helvetica', 'bold');
    doc.text('CLAIMS OVERVIEW', margin, yPos);
    doc.setDrawColor(22, 4, 63);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos + 2, margin + 40, yPos + 2);

    yPos += 8;

    // Stats boxes
    const stats = [
      { label: 'Total', value: claimStats.total, color: [22, 4, 63] },
      { label: 'Pending', value: claimStats.pending, color: [245, 158, 11] },
      { label: 'Approved', value: claimStats.approved, color: [16, 185, 129] },
      { label: 'Rejected', value: claimStats.rejected, color: [239, 68, 68] }
    ];

    const boxWidth = (pageWidth - margin * 2 - 15) / 4;
    stats.forEach((stat, idx) => {
      const x = margin + (idx * (boxWidth + 5));
      doc.setFillColor(...stat.color);
      doc.roundedRect(x, yPos, boxWidth, 18, 2, 2, 'F');
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text(stat.value.toString(), x + boxWidth/2, yPos + 9, { align: 'center' });
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text(stat.label, x + boxWidth/2, yPos + 14, { align: 'center' });
    });

    yPos += 28;

    // === CLAIMS TABLE ===
    doc.setFontSize(12);
    doc.setTextColor(22, 4, 63);
    doc.setFont('helvetica', 'bold');
    doc.text('DETAILED CLAIMS LIST', margin, yPos);
    doc.line(margin, yPos + 2, margin + 50, yPos + 2);

    yPos += 6;

    const rows = displayedClaims.map((c, idx) => [
      (idx + 1).toString(),
      c.employeeName || 'N/A',
      c.employeeIdDisplay || 'N/A',
      c.title || 'N/A',
      `₹${parseFloat(c.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      c.claimDate ? new Date(c.claimDate).toLocaleDateString() : 'N/A',
      c.status || 'N/A',
      c.policyName ? (c.policyName.length > 12 ? c.policyName.substring(0, 12) + '...' : c.policyName) : 'N/A',
      c.priority || '-',
      c.daysPending?.toString() || '-'
    ]);

    doc.autoTable({
      head: [['#', 'Employee', 'ID', 'Type', 'Amount', 'Date', 'Status', 'Policy', 'Priority', 'Days']],
      body: rows,
      startY: yPos,
      theme: 'striped',
      headStyles: {
        fillColor: [22, 4, 63],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 7,
        cellPadding: 2.5
      },
      bodyStyles: {
        fontSize: 7,
        cellPadding: 2,
        textColor: [51, 65, 85]
      },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 22 },
        2: { cellWidth: 15 },
        3: { cellWidth: 20 },
        4: { cellWidth: 18, halign: 'right' },
        5: { cellWidth: 18 },
        6: { cellWidth: 15, halign: 'center' },
        7: { cellWidth: 25 },
        8: { cellWidth: 14, halign: 'center' },
        9: { cellWidth: 12, halign: 'center' }
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: margin, right: margin },
      didDrawCell: (data) => {
        if (data.column.index === 6 && data.cell.section === 'body') {
          const status = data.cell.text[0];
          if (status === 'Approved') doc.setTextColor(16, 185, 129);
          else if (status === 'Pending') doc.setTextColor(245, 158, 11);
          else if (status === 'Rejected') doc.setTextColor(239, 68, 68);
        }
        if (data.column.index === 8 && data.cell.section === 'body') {
          const priority = data.cell.text[0];
          if (priority === 'High' || priority === 'Critical') doc.setTextColor(239, 68, 68);
        }
      }
    });

    // === FOOTER ===
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFillColor(248, 250, 252);
      doc.rect(0, pageHeight - 18, pageWidth, 18, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18);

      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text('InsurAI - Corporate Policy Automation & Intelligence', margin, pageHeight - 10);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
      doc.text('Confidential - Internal Use Only', pageWidth / 2, pageHeight - 6, { align: 'center' });
    }

    doc.save(`claims_report_${new Date().toISOString().split('T')[0]}.pdf`);
    addNotification('success', 'PDF report generated successfully');
  };

  // Enhanced Filtering
  const filteredEmployees = employees.filter(emp => {
    const matchesName = emp.name?.toLowerCase().includes(searchName.toLowerCase());
    const matchesPolicy = policyFilter === "" || emp.role === policyFilter;
    return matchesName && matchesPolicy;
  });

  const displayedClaims = mappedClaims.filter(claim =>
    statusFilter === "All" ? true : claim.status === statusFilter
  );

  // Enhanced Initialization
  useEffect(() => {
    const initializeDashboard = async () => {
      setLoading(prev => ({ ...prev, dashboard: true }));
      await Promise.all([
        fetchEmployees(),
        fetchHRList(),
        fetchPolicies(),
        fetchClaims(),
        fetchBackendNotifications()
      ]);
      setLoading(prev => ({ ...prev, dashboard: false }));
      // removed addNotification('success', 'Dashboard initialized successfully');
    };

    initializeDashboard();
  }, [fetchEmployees, fetchHRList, fetchPolicies, fetchClaims, fetchBackendNotifications]);

  // Enhanced Logout with Confirmation
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.clear();
      addNotification('info', 'Logged out successfully');
      navigate("/hr/login");
    }
  };

  // ---- new helpers: Indian number formatting ----
  const formatINR = (amount) => {
    if (amount == null || isNaN(amount)) return "₹0";
    const abs = Math.abs(amount);
    if (abs >= 1e7) return `₹${(amount / 1e7).toFixed(2)} Cr`;
    if (abs >= 1e5) return `₹${(amount / 1e5).toFixed(2)} L`;
    if (abs >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatPercent = (v) => (v == null || isNaN(v) ? "0%" : `${Math.round(v)}%`);

  // Enhanced Home Tab Render with Advanced Features
  const renderEnhancedHomeContent = () => {
    if (loading.dashboard) {
      return (
        <div className="hr-loading">
          <div className="hr-spinner"></div>
          <p className="hr-loading-text">Initializing HR Dashboard...</p>
        </div>
      );
    }

    const highPriorityClaims = mappedClaims.filter(claim => claim.priority === "High");

    return (
      <div className="hr-home-content">
        {/* Page Header */}
        <div className="hr-page-header">
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
            <div>
              <h1 className="hr-page-title">HR Dashboard</h1>
              <p className="hr-page-subtitle">
                <i className="bi bi-building me-2"></i>
                Corporate Insurance Management • InsurAI
              </p>
            </div>
            <div className="hr-card" style={{ padding: '16px 20px' }}>
              <div style={{ fontWeight: 600, color: 'var(--hr-primary)' }}>
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              <small style={{ color: 'var(--hr-text-muted)' }}>
                Last updated: {new Date().toLocaleTimeString('en-IN')}
              </small>
            </div>
          </div>
        </div>

        {/* KPI Stats Grid */}
        <div className="hr-stats-grid">
          {/* Total Coverage */}
          <div className="hr-stat-card">
            <div className="hr-stat-header">
              <div className="hr-stat-icon hr-stat-icon--primary">
                <i className="bi bi-shield-check"></i>
              </div>
            </div>
            <div className="hr-stat-value">{formatINR(dashboardStats.totalCoverageAmount)}</div>
            <div className="hr-stat-label">Total Coverage</div>
            <div className="hr-stat-trend hr-stat-trend--up">
              <i className="bi bi-arrow-up"></i> Active policies
            </div>
          </div>

          {/* Pending Amount */}
          <div className="hr-stat-card hr-stat-card--warning">
            <div className="hr-stat-header">
              <div className="hr-stat-icon hr-stat-icon--warning">
                <i className="bi bi-clock-history"></i>
              </div>
            </div>
            <div className="hr-stat-value">{formatINR(dashboardStats.pendingAmount)}</div>
            <div className="hr-stat-label">Pending Amount</div>
            <div className="hr-stat-trend hr-stat-trend--down">
              {dashboardStats.pendingClaims || 0} claims pending
            </div>
          </div>

          {/* Fraud Risk */}
          <div className="hr-stat-card hr-stat-card--danger">
            <div className="hr-stat-header">
              <div className="hr-stat-icon hr-stat-icon--danger">
                <i className="bi bi-shield-exclamation"></i>
              </div>
            </div>
            <div className="hr-stat-value">{formatPercent(dashboardStats.fraudRiskScore)}</div>
            <div className="hr-stat-label">Fraud Risk Score</div>
            <div className="hr-stat-trend hr-stat-trend--up">
              <i className="bi bi-activity"></i> Risk assessment
            </div>
          </div>

          {/* Approval Rate */}
          <div className="hr-stat-card hr-stat-card--success">
            <div className="hr-stat-header">
              <div className="hr-stat-icon hr-stat-icon--success">
                <i className="bi bi-graph-up-arrow"></i>
              </div>
            </div>
            <div className="hr-stat-value">{formatPercent(dashboardStats.approvalRate)}</div>
            <div className="hr-stat-label">Approval Rate</div>
            <div className="hr-stat-trend hr-stat-trend--up">
              <i className="bi bi-check-circle"></i> Efficiency
            </div>
          </div>
        </div>

        {/* Quick Actions & System Status */}
        <div className="row g-4 mb-4">
          {/* Quick Actions */}
          <div className="col-lg-8">
            <div className="hr-card">
              <div className="hr-card-header">
                <h3 className="hr-card-title">
                  <i className="bi bi-lightning-charge-fill"></i>
                  Quick Actions
                </h3>
                <span className="hr-badge hr-badge--primary">Most Used</span>
              </div>
              <div className="hr-card-body">
                <div className="hr-quick-actions">
                  {[
                    {
                      icon: "bi-file-earmark-check",
                      label: "Manage Claims",
                      description: `${dashboardStats.pendingClaims} pending`,
                      color: "primary",
                      tab: "claims",
                      count: dashboardStats.pendingClaims
                    },
                    {
                      icon: "bi-card-list",
                      label: "Policies",
                      description: `${dashboardStats.activePolicies} active`,
                      color: "success",
                      tab: "policies",
                      count: dashboardStats.activePolicies
                    },
                    {
                      icon: "bi-people",
                      label: "Employees",
                      description: `${dashboardStats.activeEmployees} active`,
                      color: "info",
                      tab: "employees",
                      count: dashboardStats.activeEmployees
                    },
                    {
                      icon: "bi-graph-up",
                      label: "Analytics",
                      description: "View reports",
                      color: "warning",
                      tab: "reports"
                    },
                    {
                      icon: "bi-shield-exclamation",
                      label: "Fraud Monitor",
                      description: "Risk alerts",
                      color: "danger",
                      tab: "fraud"
                    },
                    {
                      icon: "bi-download",
                      label: "Export Data",
                      description: "CSV/PDF",
                      color: "secondary",
                      action: downloadCSV
                    }
                  ].map((action, index) => (
                    <button
                      key={index}
                      className="hr-quick-action"
                      onClick={() => action.tab ? handleTabChange(action.tab) : action.action?.()}
                    >
                      <div className={`hr-quick-action__icon hr-stat-icon--${action.color}`}>
                        <i className={`bi ${action.icon}`}></i>
                      </div>
                      <div className="hr-quick-action__content">
                        <div className="hr-quick-action__title">{action.label}</div>
                        <div className="hr-quick-action__desc">{action.description}</div>
                      </div>
                      {action.count > 0 && (
                        <span className="hr-quick-action__badge">{action.count}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="col-lg-4">
            <div className="hr-card h-100">
              <div className="hr-card-header">
                <h3 className="hr-card-title">
                  <i className="bi bi-heart-pulse"></i>
                  System Status
                </h3>
              </div>
              <div className="hr-card-body">
                <div className="hr-status-list">
                  {[
                    { service: 'Claims API', status: 'online' },
                    { service: 'Employee Database', status: 'online' },
                    { service: 'Policy Management', status: 'online' },
                    { service: 'Document Storage', status: 'online' },
                    { service: 'Analytics Engine', status: 'online' }
                  ].map((service, index) => (
                    <div key={index} className="hr-status-item">
                      <div className="hr-status-item__name">
                        <span className={`hr-status-item__indicator hr-status-item__indicator--${service.status}`}></span>
                        {service.service}
                      </div>
                      <span className="hr-badge hr-badge--success">Operational</span>
                    </div>
                  ))}
                </div>
                <div className="hr-alert hr-alert--info mt-3" style={{ marginBottom: 0 }}>
                  <i className="bi bi-info-circle"></i>
                  <div className="hr-alert-content">
                    <small>All systems running optimally</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Claims & Priority Alerts */}
        <div className="row g-4">
          {/* Recent Claims Table */}
          <div className="col-lg-8">
            <div className="hr-card">
              <div className="hr-card-header">
                <h3 className="hr-card-title">
                  <i className="bi bi-clock-history"></i>
                  Recent Claims Activity
                </h3>
                <div className="d-flex gap-2">
                  <span className="hr-badge hr-badge--warning">{dashboardStats.pendingClaims} Pending</span>
                  <span className="hr-badge hr-badge--neutral">{formatINR(dashboardStats.pendingAmount)}</span>
                </div>
              </div>
              <div className="hr-card-body" style={{ padding: 0 }}>
                {mappedClaims.length > 0 ? (
                  <div className="hr-table-container" style={{ border: 'none', borderRadius: 0 }}>
                    <table className="hr-table">
                      <thead>
                        <tr>
                          <th>Employee</th>
                          <th>Claim Type</th>
                          <th>Amount</th>
                          <th>Priority</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mappedClaims.slice(0, 5).map((claim) => (
                          <tr key={claim.id}>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <div className="hr-stat-icon hr-stat-icon--primary" style={{ width: 36, height: 36, fontSize: '0.9rem' }}>
                                  <i className="bi bi-person"></i>
                                </div>
                                <div>
                                  <div style={{ fontWeight: 600 }}>{claim.employeeName}</div>
                                  <small style={{ color: 'var(--hr-text-muted)' }}>ID: {claim.employeeIdDisplay}</small>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div>{claim.title}</div>
                              <small style={{ color: 'var(--hr-text-muted)' }}>{claim.policyName}</small>
                            </td>
                            <td style={{ fontWeight: 600, color: 'var(--hr-primary)' }}>₹{claim.amount}</td>
                            <td>
                              <span className={`hr-badge hr-badge--${
                                claim.priority === "High" ? "danger" :
                                claim.priority === "Medium" ? "warning" : "info"
                              }`}>
                                {claim.priority}
                              </span>
                            </td>
                            <td>
                              <span className={`hr-badge hr-badge--${
                                claim.status === "Pending" ? "warning" : 
                                claim.status === "Approved" ? "success" : "danger"
                              }`}>
                                {claim.status}
                              </span>
                            </td>
                            <td>
                              <button 
                                className="hr-btn hr-btn--outline hr-btn--sm"
                                onClick={() => { openViewModal(claim); handleTabChange("claims"); }}
                              >
                                Review
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="hr-empty-state">
                    <div className="hr-empty-state__icon">
                      <i className="bi bi-check-circle"></i>
                    </div>
                    <h4 className="hr-empty-state__title">All Caught Up!</h4>
                    <p className="hr-empty-state__desc">No pending claims to review.</p>
                  </div>
                )}
              </div>
              <div className="hr-card-footer text-center">
                <button 
                  className="hr-btn hr-btn--primary"
                  onClick={() => handleTabChange("claims")}
                >
                  <i className="bi bi-arrow-right me-2"></i>
                  View All Claims
                </button>
              </div>
            </div>
          </div>

          {/* Priority Alerts */}
          <div className="col-lg-4">
            <div className="hr-card h-100">
              <div className="hr-card-header">
                <h3 className="hr-card-title">
                  <i className="bi bi-bell-fill"></i>
                  Priority Alerts
                </h3>
              </div>
              <div className="hr-card-body">
                {dashboardStats.expiringPolicies > 0 && (
                  <div className="hr-alert hr-alert--warning">
                    <i className="bi bi-exclamation-triangle-fill"></i>
                    <div className="hr-alert-content">
                      <div className="hr-alert-title">Policy Renewal Required</div>
                      <div className="hr-alert-message">{dashboardStats.expiringPolicies} policies expiring soon</div>
                      <button className="hr-btn hr-btn--sm hr-btn--outline mt-2" onClick={() => handleTabChange("policies")}>
                        Review
                      </button>
                    </div>
                  </div>
                )}

                {dashboardStats.highPriorityClaims > 0 && (
                  <div className="hr-alert hr-alert--danger">
                    <i className="bi bi-shield-exclamation"></i>
                    <div className="hr-alert-content">
                      <div className="hr-alert-title">High Priority Claims</div>
                      <div className="hr-alert-message">{dashboardStats.highPriorityClaims} claims need attention</div>
                      <button className="hr-btn hr-btn--sm hr-btn--outline mt-2" onClick={() => handleTabChange("claims")}>
                        Review Now
                      </button>
                    </div>
                  </div>
                )}

                {dashboardStats.fraudRiskScore > 70 && (
                  <div className="hr-alert hr-alert--danger">
                    <i className="bi bi-activity"></i>
                    <div className="hr-alert-content">
                      <div className="hr-alert-title">High Fraud Risk</div>
                      <div className="hr-alert-message">Risk score: {dashboardStats.fraudRiskScore}%</div>
                      <button className="hr-btn hr-btn--sm hr-btn--outline mt-2" onClick={() => handleTabChange("fraud")}>
                        Investigate
                      </button>
                    </div>
                  </div>
                )}

                <div className="hr-alert hr-alert--success">
                  <i className="bi bi-check-circle-fill"></i>
                  <div className="hr-alert-content">
                    <div className="hr-alert-title">System Operational</div>
                    <div className="hr-alert-message">All services running normally</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Main Render Function
  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return renderEnhancedHomeContent();
      case "claims":
        return (
          <HRClaims
            pendingClaims={pendingClaims}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            displayedClaims={displayedClaims}
            mappedClaims={mappedClaims}
            setMappedClaims={setMappedClaims}
            viewingClaim={viewingClaim}
            openViewModal={openViewModal}
            closeViewModal={closeViewModal}
            approveClaim={approveClaim}
            rejectClaim={rejectClaim}
            downloadCSV={downloadCSV}
            downloadPDF={downloadPDF}
          />
        );
      case "enrollments":
        return <HREnrollments />;
      case "reimbursements":
        return <HRReimbursements approvedClaims={pendingClaims.filter(c => c.status === "Approved")} />;
      case "policies":
        return <HRPolicies policies={policies} />;
      case "renewals":
        return <HRRenewals />;
      case "employees":
        return (
          <HREmployees
            employees={employees}
            searchName={searchName}
            setSearchName={setSearchName}
            policyFilter={policyFilter}
            setPolicyFilter={setPolicyFilter}
            filteredEmployees={filteredEmployees}
            handleView={handleView}
            handleEdit={handleEdit}
            showModal={showModal}
            selectedEmployee={selectedEmployee}
            handleCloseModal={handleCloseModal}
          />
        );
      case "fraud":
        return <HRFraud />;
      case "reports":
        return <ReportsAnalytics mappedClaims={mappedClaims} policies={policies} />;
      case "notifications":
        return <HRNotification currentHrId={loggedInHrId} />;
      default:
        return renderEnhancedHomeContent();
    }
  };

 return (
    <div className="hr-dashboard">
      {/* Toast Notifications */}
      <div className="notification-container hr-notification-container" role="region" aria-live="polite" aria-label="Notifications">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`hr-toast-notification hr-toast--${notification.type === 'error' ? 'danger' : notification.type} animate-slideIn`}
          >
            <div className="hr-toast-icon">
              <i
                className={`bi ${
                  notification.type === 'success'
                    ? 'bi-check-circle-fill'
                    : notification.type === 'error'
                    ? 'bi-exclamation-circle-fill'
                    : notification.type === 'warning'
                    ? 'bi-exclamation-triangle-fill'
                    : 'bi-info-circle-fill'
                }`}
              ></i>
            </div>
            <div className="hr-toast-content">
              <div className="hr-toast-message">{notification.message}</div>
            </div>
            <button 
              type="button" 
              className="hr-toast-close" 
              onClick={() => removeNotification(notification.id)}
              aria-label="Close notification"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
        ))}
      </div>

      {/* HR Navbar */}
      <HRNavbar
        hrName={hrName}
        userInitial={userInitial}
        onLogout={handleLogout}
        onToggleMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
        notificationCount={backendNotifications.filter(n => !n.readStatus).length}
        notifications={backendNotifications}
        onNotificationClick={handleNotificationClick}
        onMarkAsRead={handleMarkNotificationAsRead}
      />

      {/* Main Layout */}
      <div className="hr-main">
        {/* HR Sidebar */}
        <HRSidebar
          navigationItems={navigationItems}
          activeTab={activeTab}
          onChangeTab={handleTabChange}
          isMobileMenuOpen={isMobileMenuOpen}
          onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
        />

        {/* Content Area */}
        <main className="hr-content">
          <div className="hr-content-wrapper">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Animation Keyframes */}
      <style>{`
        @keyframes slideIn {
          from { 
            transform: translateX(400px);
            opacity: 0;
          }
          to { 
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slideOut {
          from { 
            transform: translateX(0);
            opacity: 1;
          }
          to { 
            transform: translateX(400px);
            opacity: 0;
          }
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s cubic-bezier(0.23, 1, 0.32, 1) forwards;
        }
      `}</style>
    </div>
  );
}
