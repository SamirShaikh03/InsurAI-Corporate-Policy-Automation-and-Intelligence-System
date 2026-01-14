import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import logoImage from "../assets/logo-img.png";

/**
 * UI color palette used across the application.
 *
 * @typedef {Object} Palette
 * @property {string} background - Page background color (CSS color string).
 * @property {string} surface - Surface or card background color.
 * @property {string} primary - Primary brand color for prominent UI elements.
 * @property {string} accent - Accent color for highlights and interactive elements.
 * @property {string} text - Primary text color for normal content.
 * @property {string} muted - Secondary/muted text color for less prominent content.
 * @property {string} border - Color used for borders and separators.
 * @property {string} subtle - Very light background accents and subtle surfaces.
 *
 * @example
 * // Accessing the palette in code:
 * // import { palette } from './path/to/palette';
 * // console.log(palette.primary);
 *
 * @note To check the installed React version:
 * - Run `npm ls react` (or `yarn list --pattern react`) in your project directory.
 * - Or inspect the "react" entry in your package.json dependencies.
 * - Or in code: `import React from 'react'; console.log(React.version);`
 */
const palette = {
  background: "#f5f7fb",
  surface: "#ffffff",
  primary: "#1f4b99",
  accent: "#0ea5e9",
  text: "#0f172a",
  muted: "#475569",
  border: "#e2e8f0",
  subtle: "#f1f5f9",
};

const sectionSpacing = { padding: "120px 0" };
const narrowSpacing = { padding: "96px 0 112px" };

const roleActions = [
  {
    title: "Employees",
    summary: "Register, view policies, submit and track claims.",
    actions: [
      { label: "Login", path: "/employee/login" },
    ],
  },
  {
    title: "HR",
    summary: "Review claims, approve enrollments, process reimbursements.",
    actions: [{ label: "Login", path: "/hr/login" }],
  },
  {
    title: "Agent",
    summary: "Respond to employee queries and manage availability.",
    actions: [
      { label: "Login", path: "/agent/login" },
    ],
  },
  {
    title: "Admin",
    summary: "Create policies, onboard HR/agents, view audits and analytics.",
    actions: [
      { label: "Login", path: "/admin/login" },
    ],
  },
];

const capabilityCards = [
  {
    title: "Policy management",
    detail: "Create, version, and retire corporate insurance policies with audit trails.",
  },
  {
    title: "Claims lifecycle",
    detail: "Submit, review, approve, and reimburse with clear checkpoints.",
  },
  {
    title: "Fraud awareness",
    detail: "Surface anomalies and flagged claims for additional review.",
  },
  {
    title: "Analytics",
    detail: "Operational dashboards for utilization, SLAs, and cycle times.",
  },
  {
    title: "AI-assisted insights",
    detail: "Contextual recommendations, automated claim triage, anomaly detection, and suggested resolutions powered by ML to speed decisions.",
  },
  {
    title: "Role-based access",
    detail: "Distinct flows for Admin, HR, Agents, and Employees with clear boundaries.",
  },
];

const processSteps = [
  { title: "Intake", text: "Employees submit policies, claims, or queries with required fields." },
  { title: "Review", text: "Automated checks plus HR or admin review where needed." },
  { title: "Decision", text: "Approve, request info, or flag for fraud follow-up." },
  { title: "Settle", text: "Process reimbursements or update policy enrollment status." },
  { title: "Notify", text: "Send clear updates to employees and log the action." },
];

const overviewPoints = [
  {
    title: "Unified intake",
    detail: "Policies, claims, and support requests start in one workspace with guided forms and validations.",
  },
  {
    title: "Operational guardrails",
    detail: "Checkpoints, ownership, and SLAs keep every request accountable from submission to settlement.",
  },
  {
    title: "Insights on tap",
    detail: "Track utilization, timelines, and exceptions so leaders can act before issues escalate.",
  },
];

const roleValue = [
  {
    title: "Employees",
    detail: "Transparent status for enrollments and claims with clear next steps and notifications.",
  },
  {
    title: "HR",
    detail: "Queue clarity, audit trails, and reimbursement workflows tuned for benefits operations.",
  },
  {
    title: "Agents",
    detail: "Structured responses to employee queries plus availability management to balance workload.",
  },
  {
    title: "Admins",
    detail: "Policy lifecycle control, role provisioning, and oversight dashboards in one console.",
  },
];

const securityPoints = [
  "Role-based access with clear separation between employee, HR, agent, and admin scopes.",
  "Event logging for policy changes, approvals, and claim decisions to support audits.",
  "Secure sessions and token-based authentication patterns suitable for enterprise rollouts.",
  "Data handling practices that keep sensitive claim details contained to the right roles.",
];

const whyPoints = [
  "Purpose-built for insurance workflows instead of generic ticketing forms.",
  "Predictable steps that reduce back-and-forth and shorten resolution cycles.",
  "Operational visibility that helps teams prioritize, staff, and improve service levels.",
  "Configurable roles and policies so the platform adapts as benefits programs evolve.",
];

const Homepage = () => {
  const navigate = useNavigate();

  const scrollToSection = (id) => {
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleNavClick = (event, id) => {
    event.preventDefault();
    scrollToSection(id);
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div style={{ background: palette.background, color: palette.text }}>
      <nav
        className="navbar navbar-expand-lg navbar-light shadow-sm sticky-top"
        style={{ position: "sticky", top: 0, zIndex: 1020, background: palette.surface, borderBottom: `1px solid ${palette.border}` }}
      >
        <div className="container py-2">
          <button
            className="navbar-brand btn btn-link p-0"
            onClick={() => scrollToSection("about")}
            style={{
              textDecoration: "none",
              display: "inline-block",
              padding: 0,
              margin: 0,
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <img
              src={logoImage}
              alt="InsurAI"
              style={{
                height: "40px",
                width: "auto",
              }}
            />
          </button>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNav"
            aria-controls="mainNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div className="collapse navbar-collapse" id="mainNav">
            <ul className="navbar-nav ms-auto align-items-lg-center gap-2">
              {["about", "overview", "capabilities", "process", "security", "why"].map(
                (section) => (
                  <li className="nav-item" key={section}>
                    <a
                      className="nav-link"
                      href={`#${section}`}
                      onClick={(e) => handleNavClick(e, section)}
                      style={{ color: palette.muted, fontWeight: 500 }}
                    >
                      {section.charAt(0).toUpperCase() + section.slice(1)}
                    </a>
                  </li>
                )
              )}
              <li className="nav-item">
                <button
                  className="btn btn-sm text-white"
                  style={{ background: palette.primary, border: "none" }}
                  onClick={() => scrollToSection("roles")}
                >
                  Login
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <header
        style={{
          ...narrowSpacing,
          paddingTop: "118px",
          paddingBottom: "210px",
          minHeight: "88vh",
          transform: "scale(1.05)",
          transformOrigin: "center top",
        }}
        id="about"
      >
        <div className="container" style={{ maxWidth: "1180px" }}>
          <div className="row align-items-stretch g-5">
            <div className="col-lg-6 d-flex flex-column h-100">
              <p
                className="text-uppercase mb-2"
                style={{ color: palette.muted, letterSpacing: "0.08em", fontSize: "0.85rem" }}
              >
                Corporate Insurance Automation
              </p>
              <h1
                className="fw-semibold"
                style={{ color: palette.primary, lineHeight: 1.08, fontSize: "3.15rem", maxWidth: "760px" }}
              >
                A focused workspace for policies, claims, and support.
              </h1>
              <p
                className="mt-3 mb-5"
                style={{ color: palette.muted, lineHeight: 1.7, fontSize: "1.08rem", maxWidth: "680px" }}
              >
                Purpose-built for benefits teams: predictable journeys for Admins, HR, Agents, and Employees with
                audit-ready checkpoints from intake to settlement.
              </p>
              <div className="d-flex flex-wrap gap-4 mt-4 pt-2 mt-lg-auto" style={{ rowGap: "12px" }}>
                <button
                  className="btn text-white"
                  style={{ background: palette.primary, border: "none", minWidth: "170px" }}
                  onClick={() => scrollToSection("overview")}
                >
                  See overview
                </button>
                <button
                  className="btn"
                  style={{ background: palette.surface, border: `1px solid ${palette.border}`, minWidth: "170px" }}
                  onClick={() => scrollToSection("capabilities")}
                >
                  View capabilities
                </button>
              </div>
            </div>
            <div className="col-lg-6 mt-4 mt-lg-3">
              <div
                className="rounded-4 h-100 d-flex flex-column position-relative overflow-hidden"
                style={{
                  padding: "0",
                  background: `linear-gradient(135deg, ${palette.surface} 0%, ${palette.subtle} 100%)`,
                  border: `2px solid ${palette.border}`,
                  boxShadow: "0 20px 40px rgba(15, 23, 42, 0.08), 0 4px 8px rgba(15, 23, 42, 0.04)",
                }}
              >
                {/* Subtle accent decoration */}
                <div style={{
                  position: "absolute",
                  top: "-30%",
                  right: "-15%",
                  width: "200px",
                  height: "200px",
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${palette.accent}15 0%, transparent 70%)`,
                  pointerEvents: "none",
                }} />
                
                {/* Header section */}
                <div style={{ padding: "1.25rem 1.75rem 1rem", borderBottom: `1px solid ${palette.border}` }}>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <div style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#22c55e",
                      boxShadow: "0 0 6px rgba(34, 197, 94, 0.5)",
                    }} />
                    <span style={{ color: palette.muted, fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.05em" }}>
                      LIVE DASHBOARD
                    </span>
                  </div>
                  <h5 className="fw-bold mb-0" style={{ color: palette.primary, fontSize: "1.1rem" }}>
                    Insurance Command Center
                  </h5>
                </div>

                {/* Stats row */}
                <div className="d-flex" style={{ borderBottom: `1px solid ${palette.border}` }}>
                  {[
                    { value: "2.4K", label: "Active Policies", trend: "+12%" },
                    { value: "98.7%", label: "Claim Accuracy", trend: "+2.3%" },
                    { value: "24hr", label: "Avg. Resolution", trend: "-18%" },
                  ].map((stat, idx) => (
                    <div 
                      key={stat.label} 
                      className="flex-fill text-center py-2"
                      style={{ 
                        borderRight: idx < 2 ? `1px solid ${palette.border}` : "none",
                      }}
                    >
                      <div className="d-flex align-items-center justify-content-center gap-1">
                        <span style={{ color: palette.primary, fontSize: "1.3rem", fontWeight: 700 }}>{stat.value}</span>
                        <span style={{ 
                          color: stat.trend.startsWith("+") ? "#22c55e" : "#f59e0b", 
                          fontSize: "0.65rem", 
                          fontWeight: 600,
                          marginTop: "3px"
                        }}>
                          {stat.trend}
                        </span>
                      </div>
                      <div style={{ color: palette.muted, fontSize: "0.65rem", fontWeight: 500 }}>{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Main content - Feature cards */}
                <div style={{ padding: "1.25rem 1.5rem" }}>
                  <div className="row g-2">
                    {[
                      { 
                        icon: (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/>
                            <line x1="16" y1="17" x2="8" y2="17"/>
                          </svg>
                        ),
                        title: "Policy Engine", 
                        desc: "Create & manage",
                        color: palette.primary
                      },
                      { 
                        icon: (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                            <polyline points="22 4 12 14.01 9 11.01"/>
                          </svg>
                        ),
                        title: "Claims Hub", 
                        desc: "Track & approve",
                        color: "#22c55e"
                      },
                      { 
                        icon: (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                            <path d="M12 8v4"/>
                            <path d="M12 16h.01"/>
                          </svg>
                        ),
                        title: "Fraud Shield", 
                        desc: "AI-powered detection",
                        color: "#ef4444"
                      },
                      { 
                        icon: (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="20" x2="18" y2="10"/>
                            <line x1="12" y1="20" x2="12" y2="4"/>
                            <line x1="6" y1="20" x2="6" y2="14"/>
                          </svg>
                        ),
                        title: "Analytics", 
                        desc: "Real-time insights",
                        color: palette.accent
                      },
                    ].map((item) => (
                      <div className="col-6" key={item.title}>
                        <div
                          className="p-2 h-100 rounded-3 d-flex flex-column"
                          style={{
                            background: palette.surface,
                            border: `1px solid ${palette.border}`,
                            transition: "all 0.3s ease",
                            cursor: "default",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = palette.subtle;
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.boxShadow = "0 4px 12px rgba(15, 23, 42, 0.1)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = palette.surface;
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        >
                          <div 
                            className="d-flex align-items-center justify-content-center rounded-2 mb-2"
                            style={{ 
                              width: "32px", 
                              height: "32px", 
                              background: `${item.color}15`,
                              color: item.color,
                            }}
                          >
                            {item.icon}
                          </div>
                          <p className="mb-0 fw-semibold" style={{ color: palette.text, fontSize: "0.85rem" }}>
                            {item.title}
                          </p>
                          <small style={{ color: palette.muted, fontSize: "0.7rem" }}>{item.desc}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom status bar */}
                <div 
                  className="mt-auto d-flex align-items-center justify-content-between"
                  style={{ 
                    padding: "0.75rem 1.5rem", 
                    background: palette.subtle,
                    borderTop: `1px solid ${palette.border}`,
                  }}
                >
                  <div className="d-flex align-items-center gap-2">
                    <div className="d-flex">
                      {[palette.primary, palette.accent, "#8b5cf6"].map((color, i) => (
                        <div 
                          key={i}
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            background: color,
                            border: `2px solid ${palette.surface}`,
                            marginLeft: i > 0 ? "-6px" : 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.6rem",
                            fontWeight: 600,
                            color: "#fff",
                          }}
                        >
                          {["AD", "HR", "AG"][i]}
                        </div>
                      ))}
                    </div>
                    <span style={{ color: palette.muted, fontSize: "0.7rem", fontWeight: 500 }}>+50 active users</span>
                  </div>
                  <div 
                    className="d-flex align-items-center gap-1 px-2 py-1 rounded-pill"
                    style={{ 
                      background: palette.surface, 
                      border: `1px solid ${palette.border}`,
                      color: palette.muted, 
                      fontSize: "0.7rem",
                      fontWeight: 500,
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    Real-time
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section style={{ ...sectionSpacing, background: palette.surface }} id="overview">
        <div className="container" style={{ maxWidth: "1200px" }}>
          <div className="text-center mb-5 pb-3">
            <h2 className="fw-semibold mb-3" style={{ color: palette.primary, fontSize: "2.5rem" }}>Product overview</h2>
            <p className="mx-auto" style={{ color: palette.muted, maxWidth: "700px", fontSize: "1.1rem", lineHeight: 1.7 }}>
              InsurAI keeps policy management, claims, and support aligned under one operating model.
            </p>
          </div>
          <div className="row g-4 justify-content-center">
            {overviewPoints.map((item) => (
              <div className="col-lg-4 col-md-6" key={item.title}>
                <div
                  className="p-4 h-100 rounded-4 shadow-sm"
                  style={{ background: palette.subtle, border: `1px solid ${palette.border}`, transition: "transform 0.3s ease, box-shadow 0.3s ease" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-8px)";
                    e.currentTarget.style.boxShadow = "0 12px 24px rgba(15, 23, 42, 0.12)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
                  }}
                >
                  <h5 className="fw-semibold mb-3" style={{ color: palette.primary, fontSize: "1.3rem" }}>{item.title}</h5>
                  <p className="mb-0" style={{ color: palette.muted, lineHeight: 1.7, fontSize: "1.05rem" }}>{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ ...sectionSpacing, background: palette.background }} id="roles">
        <div className="container" style={{ maxWidth: "1200px" }}>
          <div className="text-center mb-5 pb-3">
            <h2 className="fw-semibold mb-3" style={{ color: palette.primary, fontSize: "2.5rem" }}>Role access</h2>
            <p className="mx-auto" style={{ color: palette.muted, maxWidth: "700px", fontSize: "1.1rem", lineHeight: 1.7 }}>
              One place to enter the right workspace. Pick your role and continue to live routes.
            </p>
          </div>

          <div className="row g-4 justify-content-center">
            {roleActions.map((role) => (
              <div className="col-lg-3 col-md-6" key={role.title}>
                <div
                  className="p-4 h-100 rounded-4 shadow-sm"
                  style={{ background: palette.surface, border: `2px solid ${palette.border}`, transition: "all 0.3s ease" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-8px)";
                    e.currentTarget.style.boxShadow = "0 12px 32px rgba(31, 75, 153, 0.15)";
                    e.currentTarget.style.borderColor = palette.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
                    e.currentTarget.style.borderColor = palette.border;
                  }}
                >
                  <h5 className="fw-bold mb-3" style={{ color: palette.primary, fontSize: "1.4rem" }}>{role.title}</h5>
                  <p className="mb-4" style={{ color: palette.muted, minHeight: "75px", fontSize: "1.05rem", lineHeight: 1.6 }}>{role.summary}</p>
                  <div className="d-flex flex-column gap-2">
                    {role.actions.map((action) => (
                      <button
                        key={action.label}
                        className="btn text-start"
                        style={{
                          background: palette.primary,
                          border: "none",
                          color: "#fff",
                          padding: "0.6rem 1rem",
                          fontWeight: 500,
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#2d5aa3";
                          e.currentTarget.style.transform = "translateX(4px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = palette.primary;
                          e.currentTarget.style.transform = "translateX(0)";
                        }}
                        onClick={() => handleNavigate(action.path)}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ ...sectionSpacing, background: palette.surface }} id="role-value">
        <div className="container" style={{ maxWidth: "1200px" }}>
          <div className="text-center mb-5 pb-3">
            <h2 className="fw-semibold mb-3" style={{ color: palette.primary, fontSize: "2.5rem" }}>Role-based value</h2>
            <p className="mx-auto" style={{ color: palette.muted, maxWidth: "700px", fontSize: "1.1rem", lineHeight: 1.7 }}>
              Clear outcomes for every audience without mixing responsibilities.
            </p>
          </div>
          <div className="row g-4 justify-content-center">
            {roleValue.map((item) => (
              <div className="col-lg-3 col-md-6" key={item.title}>
                <div
                  className="p-4 h-100 rounded-4"
                  style={{ background: palette.subtle, border: `1px solid ${palette.border}`, transition: "all 0.3s ease" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = palette.surface;
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(15, 23, 42, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = palette.subtle;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <h5 className="fw-semibold mb-3" style={{ color: palette.primary, fontSize: "1.25rem" }}>{item.title}</h5>
                  <p className="mb-0" style={{ color: palette.muted, lineHeight: 1.7, fontSize: "1.05rem" }}>{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ ...sectionSpacing, background: palette.background }} id="capabilities">
        <div className="container" style={{ maxWidth: "1200px" }}>
          <div className="text-center mb-5 pb-3">
            <h2 className="fw-semibold mb-3" style={{ color: palette.primary, fontSize: "2.5rem" }}>Capabilities that matter</h2>
            <p className="mx-auto" style={{ color: palette.muted, maxWidth: "750px", fontSize: "1.1rem", lineHeight: 1.7 }}>
              Built to align with enterprise expectations: clear copy, predictable flows, and clean presentation.
            </p>
          </div>
          <div className="row g-4 justify-content-center">
            {capabilityCards.map((item) => (
              <div className="col-lg-4 col-md-6" key={item.title}>
                <div
                  className="p-4 h-100 rounded-4"
                  style={{ background: palette.surface, border: `1px solid ${palette.border}`, transition: "all 0.3s ease" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-6px)";
                    e.currentTarget.style.boxShadow = "0 10px 28px rgba(15, 23, 42, 0.12)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <h5 className="fw-semibold mb-3" style={{ color: palette.primary, fontSize: "1.3rem" }}>{item.title}</h5>
                  <p className="mb-0" style={{ color: palette.muted, lineHeight: 1.7, fontSize: "1.05rem" }}>{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <section style={{ ...sectionSpacing, background: palette.surface }} id="process">
        <div className="container" style={{ maxWidth: "1300px" }}>
          <div className="text-center mb-5 pb-4">
            <h2 className="fw-semibold mb-3" style={{ color: palette.primary, fontSize: "2.5rem" }}>How the flow works</h2>
            <p className="mx-auto" style={{ color: palette.muted, maxWidth: "700px", fontSize: "1.1rem", lineHeight: 1.7 }}>
              A predictable sequence that mentors and reviewers can follow quickly.
            </p>
          </div>
          <div className="row g-4 justify-content-center align-items-stretch">
            {processSteps.map((step, index) => (
              <div className="col-lg col-md-4 col-6" key={step.title}>
                <div
                  className="p-4 h-100 rounded-4 text-center position-relative"
                  style={{ background: palette.subtle, border: `2px solid ${palette.border}`, transition: "all 0.3s ease" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = palette.surface;
                    e.currentTarget.style.borderColor = palette.accent;
                    e.currentTarget.style.transform = "translateY(-6px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = palette.subtle;
                    e.currentTarget.style.borderColor = palette.border;
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div
                    className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                    style={{
                      width: "52px",
                      height: "52px",
                      background: palette.primary,
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "1.3rem",
                      boxShadow: "0 4px 12px rgba(31, 75, 153, 0.25)",
                    }}
                  >
                    {index + 1}
                  </div>
                  <p className="fw-bold mb-2" style={{ color: palette.primary, fontSize: "1.1rem" }}>{step.title}</p>
                  <p style={{ color: palette.muted, fontSize: "0.95rem", lineHeight: 1.6, margin: 0 }}>{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ ...sectionSpacing, background: palette.background }} id="security">
        <div className="container" style={{ maxWidth: "1200px" }}>
          <div className="row g-5 align-items-center">
            <div className="col-lg-5">
              <h2 className="fw-semibold mb-4" style={{ color: palette.primary, fontSize: "2.5rem", lineHeight: 1.2 }}>Security & trust</h2>
              <p className="mb-0" style={{ color: palette.muted, fontSize: "1.15rem", lineHeight: 1.7 }}>
                Governance for policies, claims, and user actions with controls suited for regulated environments.
              </p>
            </div>
            <div className="col-lg-7">
              <ul className="list-unstyled d-grid gap-3 mb-0">
                {securityPoints.map((item, idx) => (
                  <li
                    key={item}
                    className="p-4 rounded-4 d-flex align-items-start gap-3"
                    style={{ background: palette.surface, border: `1px solid ${palette.border}`, transition: "all 0.3s ease" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateX(8px)";
                      e.currentTarget.style.boxShadow = "0 8px 20px rgba(15, 23, 42, 0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateX(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{
                        width: "32px",
                        height: "32px",
                        background: `${palette.accent}20`,
                        color: palette.accent,
                        fontWeight: 700,
                        fontSize: "0.9rem",
                      }}
                    >
                      {idx + 1}
                    </div>
                    <span style={{ color: palette.text, fontSize: "1.05rem", lineHeight: 1.6 }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section style={{ ...sectionSpacing, background: palette.surface }} id="why">
        <div className="container" style={{ maxWidth: "1200px" }}>
          <div className="text-center mb-5 pb-3">
            <h2 className="fw-semibold mb-3" style={{ color: palette.primary, fontSize: "2.5rem" }}>Why InsurAI</h2>
            <p className="mx-auto" style={{ color: palette.muted, maxWidth: "750px", fontSize: "1.1rem", lineHeight: 1.7 }}>
              A platform tuned for insurance operations, not generic case handling.
            </p>
          </div>
          <div className="row g-4 justify-content-center">
            {whyPoints.map((item, idx) => (
              <div className="col-lg-6" key={item}>
                <div
                  className="p-4 h-100 rounded-4 d-flex align-items-start gap-3"
                  style={{ background: palette.subtle, border: `2px solid ${palette.border}`, transition: "all 0.3s ease" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = palette.surface;
                    e.currentTarget.style.borderColor = palette.primary;
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(31, 75, 153, 0.12)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = palette.subtle;
                    e.currentTarget.style.borderColor = palette.border;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{
                      width: "40px",
                      height: "40px",
                      background: palette.primary,
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "1.1rem",
                    }}
                  >
                    {idx + 1}
                  </div>
                  <p className="mb-0" style={{ color: palette.text, lineHeight: 1.7, fontSize: "1.08rem", fontWeight: 500 }}>{item}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ ...sectionSpacing, background: palette.background }} id="get-started">
        <div className="container" style={{ maxWidth: "1100px" }}>
          <div
            className="rounded-4 p-5"
            style={{
              background: `linear-gradient(135deg, ${palette.primary} 0%, #2d5aa3 100%)`,
              boxShadow: "0 20px 60px rgba(31, 75, 153, 0.25)",
            }}
          >
            <div className="row align-items-center g-5">
              <div className="col-lg-8">
                <h2 className="fw-bold mb-4" style={{ color: "#fff", fontSize: "2.5rem", lineHeight: 1.2 }}>Move work forward</h2>
                <p className="mb-4" style={{ color: "rgba(255,255,255,0.9)", fontSize: "1.15rem", lineHeight: 1.7 }}>
                  Enter the workspace that matches your role to manage policies, claims, and support with confidence.
                </p>
                <div className="d-flex flex-wrap gap-2">
                  {["Policy changes", "Claims decisions", "Audit-ready trails"].map((chip) => (
                    <span
                      key={chip}
                      className="badge"
                      style={{
                        background: "rgba(255,255,255,0.2)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255,255,255,0.3)",
                        color: "#fff",
                        fontWeight: 600,
                        padding: "0.5rem 1rem",
                        fontSize: "0.9rem",
                      }}
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
              <div className="col-lg-4 text-lg-end">
                <button
                  className="btn text-white w-100"
                  style={{
                    background: "rgb(9, 58, 117)",
                    color: palette.primary,
                    border: "none",
                    padding: "1rem 2rem",
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow = "0 12px 28px rgba(0,0,0,0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.15)";
                  }}
                  onClick={() => scrollToSection("roles")}
                >
                  Go to role access →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-5" style={{ background: palette.surface, borderTop: `2px solid ${palette.border}` }}>
        <div className="container" style={{ maxWidth: "1200px" }}>
          <div className="row g-4 mb-4">
            <div className="col-lg-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <img src={logoImage} alt="InsurAI" style={{ height: "32px", width: "auto" }} />
              </div>
              <p style={{ color: palette.muted, fontSize: "1rem", lineHeight: 1.6 }}>
                Corporate Insurance Automation Platform
              </p>
            </div>
            <div className="col-lg-8">
              <div className="row g-4">
                <div className="col-md-6">
                  <h6 className="fw-semibold mb-3" style={{ color: palette.primary }}>Quick Links</h6>
                  <div className="d-flex flex-column gap-2">
                    {["Overview", "Roles", "Capabilities", "Security"].map((link) => (
                      <a
                        key={link}
                        href={`#${link.toLowerCase()}`}
                        style={{ color: palette.muted, textDecoration: "none", fontSize: "1rem", transition: "color 0.2s ease" }}
                        onMouseEnter={(e) => e.currentTarget.style.color = palette.primary}
                        onMouseLeave={(e) => e.currentTarget.style.color = palette.muted}
                      >
                        {link}
                      </a>
                    ))}
                  </div>
                </div>
                <div className="col-md-6">
                  <h6 className="fw-semibold mb-3" style={{ color: palette.primary }}>Legal</h6>
                  <div className="d-flex flex-column gap-2">
                    {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((link) => (
                      <a
                        key={link}
                        href="#"
                        style={{ color: palette.muted, textDecoration: "none", fontSize: "1rem", transition: "color 0.2s ease" }}
                        onMouseEnter={(e) => e.currentTarget.style.color = palette.primary}
                        onMouseLeave={(e) => e.currentTarget.style.color = palette.muted}
                      >
                        {link}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-4" style={{ borderTop: `1px solid ${palette.border}` }}>
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
              <div style={{ color: palette.muted, fontSize: "0.95rem" }}>
                © {new Date().getFullYear()} InsurAI. All rights reserved.
              </div>
              <div style={{ color: palette.muted, fontSize: "0.95rem" }}>
                Built for enterprise insurance operations
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;