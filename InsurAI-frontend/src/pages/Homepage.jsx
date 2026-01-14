import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";

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

const sectionSpacing = { padding: "80px 0" };
const narrowSpacing = { padding: "96px 0 112px" };

const roleActions = [
  {
    title: "Employees",
    summary: "Register, view policies, submit and track claims.",
    actions: [
      { label: "Register", path: "/employee/register" },
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
            className="navbar-brand fw-semibold btn btn-link p-0"
            onClick={() => scrollToSection("about")}
            style={{
              color: palette.primary,
              textDecoration: "none",
              fontSize: "2.1rem",
              lineHeight: 1,
              height: "36px",
              display: "inline-block",
              padding: 0,
              margin: 0,
              transform: "translateY(-2px)",
              fontFamily: "'Poppins', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
              fontWeight: 700,
              letterSpacing: "0.01em",
            }}
          >
            InsurAI
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
                className="rounded-4 h-100 d-flex flex-column"
                style={{
                  padding: "3.85rem 2.5rem",
                  gap: "1.25rem",
                  background: `radial-gradient(circle at top, ${palette.surface} 15%, ${palette.subtle} 85%)`,
                  border: `1px solid ${palette.border}`,
                  boxShadow: "0 28px 60px rgba(15, 23, 42, 0.12)",
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <p
                      className="text-uppercase mb-1"
                      style={{ color: palette.muted, letterSpacing: "0.06em", fontSize: "0.75rem" }}
                    >
                      Core workspace
                    </p>
                    <h5 className="fw-semibold mb-0" style={{ color: palette.primary }}>
                      Policy to payout, connected
                    </h5>
                  </div>
                </div>
                <div className="row g-3 justify-content-center">
                  {["Policy creation", "Claim review", "Fraud flags", "Notifications"].map((item) => (
                    <div className="col-6" key={item}>
                      <div
                        className="p-3 h-100 rounded-3"
                        style={{
                          background: palette.surface,
                          border: `1px solid ${palette.border}`,
                          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.6)",
                        }}
                      >
                        <p className="mb-1 fw-semibold" style={{ color: palette.primary }}>
                          {item}
                        </p>
                        <small style={{ color: palette.muted }}>Guided workflows for every stage.</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section style={{ ...sectionSpacing, background: palette.surface }} id="overview">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
            <div>
              <h2 className="fw-semibold" style={{ color: palette.primary }}>Product overview</h2>
              <p className="mb-0" style={{ color: palette.muted }}>
                InsurAI keeps policy management, claims, and support aligned under one operating model.
              </p>
            </div>
          </div>
          <div className="row g-3 justify-content-center">
            {overviewPoints.map((item) => (
              <div className="col-lg-4 col-md-6" key={item.title}>
                <div
                  className="p-3 h-100 rounded-3 shadow-sm"
                  style={{ background: palette.subtle, border: `1px solid ${palette.border}` }}
                >
                  <h6 className="fw-semibold" style={{ color: palette.primary }}>{item.title}</h6>
                  <p className="mb-0" style={{ color: palette.muted, lineHeight: 1.6 }}>{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ ...sectionSpacing, background: palette.surface }} id="roles">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
            <div>
              <h2 className="fw-semibold" style={{ color: palette.primary }}>Role access</h2>
              <p className="mb-0" style={{ color: palette.muted }}>
                One place to enter the right workspace. Pick your role and continue to live routes.
              </p>
            </div>
          </div>

          <div className="row g-3 justify-content-center">
            {roleActions.map((role) => (
              <div className="col-lg-3 col-md-6" key={role.title}>
                <div
                  className="p-3 h-100 rounded-3 shadow-sm"
                  style={{ background: palette.subtle, border: `1px solid ${palette.border}` }}
                >
                  <h5 className="fw-semibold" style={{ color: palette.primary }}>{role.title}</h5>
                  <p className="mb-3" style={{ color: palette.muted, minHeight: "70px" }}>{role.summary}</p>
                  <div className="d-flex flex-column gap-2">
                    {role.actions.map((action) => (
                      <button
                        key={action.label}
                        className="btn btn-sm text-start"
                        style={{
                          background: palette.surface,
                          border: `1px solid ${palette.border}`,
                          color: palette.text,
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

      <section style={{ ...sectionSpacing, background: palette.background }} id="role-value">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
            <div>
              <h2 className="fw-semibold" style={{ color: palette.primary }}>Role-based value</h2>
              <p className="mb-0" style={{ color: palette.muted }}>
                Clear outcomes for every audience without mixing responsibilities.
              </p>
            </div>
          </div>
          <div className="row g-3 justify-content-center">
            {roleValue.map((item) => (
              <div className="col-lg-3 col-md-6" key={item.title}>
                <div
                  className="p-3 h-100 rounded-3"
                  style={{ background: palette.surface, border: `1px solid ${palette.border}` }}
                >
                  <h6 className="fw-semibold" style={{ color: palette.primary }}>{item.title}</h6>
                  <p className="mb-0" style={{ color: palette.muted, lineHeight: 1.6 }}>{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ ...sectionSpacing, background: palette.background }} id="capabilities">
        <div className="container">
          <h2 className="fw-semibold mb-3" style={{ color: palette.primary }}>Capabilities that matter</h2>
          <p className="mb-4" style={{ color: palette.muted }}>
            Built to align with enterprise expectations: clear copy, predictable flows, and clean presentation.
          </p>
          <div className="row g-3 justify-content-center">
            {capabilityCards.map((item) => (
              <div className="col-lg-4 col-md-6" key={item.title}>
                <div
                  className="p-3 h-100 rounded-3"
                  style={{ background: palette.surface, border: `1px solid ${palette.border}` }}
                >
                  <h6 className="fw-semibold" style={{ color: palette.primary }}>{item.title}</h6>
                  <p className="mb-0" style={{ color: palette.muted, lineHeight: 1.6 }}>{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <section style={{ ...sectionSpacing, background: palette.surface }} id="process">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
            <div>
              <h2 className="fw-semibold" style={{ color: palette.primary }}>How the flow works</h2>
              <p className="mb-0" style={{ color: palette.muted }}>
                A predictable sequence that mentors and reviewers can follow quickly.
              </p>
            </div>
          </div>
          <div className="row g-3 justify-content-center">
            {processSteps.map((step, index) => (
              <div className="col-lg-2 col-md-4 col-6" key={step.title}>
                <div
                  className="p-3 h-100 rounded-3 text-center"
                  style={{ background: palette.subtle, border: `1px solid ${palette.border}` }}
                >
                  <div
                    className="rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center"
                    style={{
                      width: "42px",
                      height: "42px",
                      background: palette.surface,
                      border: `1px solid ${palette.border}`,
                      color: palette.primary,
                      fontWeight: 600,
                    }}
                  >
                    {index + 1}
                  </div>
                  <p className="fw-semibold mb-1" style={{ color: palette.text }}>{step.title}</p>
                  <small style={{ color: palette.muted, display: "block", lineHeight: 1.5 }}>{step.text}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ ...sectionSpacing, background: palette.surface }} id="security">
        <div className="container">
          <div className="row g-4 align-items-start">
            <div className="col-lg-5">
              <h2 className="fw-semibold" style={{ color: palette.primary }}>Security & trust</h2>
              <p className="mb-0" style={{ color: palette.muted }}>
                Governance for policies, claims, and user actions with controls suited for regulated environments.
              </p>
            </div>
            <div className="col-lg-7">
              <ul className="list-unstyled d-grid gap-2 mb-0">
                {securityPoints.map((item) => (
                  <li
                    key={item}
                    className="p-3 rounded-3"
                    style={{ background: palette.subtle, border: `1px solid ${palette.border}` }}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section style={{ ...sectionSpacing, background: palette.background }} id="why">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
            <div>
              <h2 className="fw-semibold" style={{ color: palette.primary }}>Why InsurAI</h2>
              <p className="mb-0" style={{ color: palette.muted }}>
                A platform tuned for insurance operations, not generic case handling.
              </p>
            </div>
          </div>
          <div className="row g-3 justify-content-center">
            {whyPoints.map((item) => (
              <div className="col-lg-3 col-md-6" key={item}>
                <div
                  className="p-3 h-100 rounded-3"
                  style={{ background: palette.surface, border: `1px solid ${palette.border}` }}
                >
                  <p className="mb-0" style={{ color: palette.muted, lineHeight: 1.6 }}>{item}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ ...sectionSpacing, background: palette.surface }} id="get-started">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <h2 className="fw-semibold" style={{ color: palette.primary }}>Move work forward</h2>
              <p className="mb-3" style={{ color: palette.muted }}>
                Enter the workspace that matches your role to manage policies, claims, and support with confidence.
              </p>
              <div className="d-flex flex-wrap gap-2">
                {["Policy changes", "Claims decisions", "Audit-ready trails"].map((chip) => (
                  <span
                    key={chip}
                    className="badge"
                    style={{
                      background: palette.subtle,
                      border: `1px solid ${palette.border}`,
                      color: palette.muted,
                      fontWeight: 600,
                    }}
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>
            <div className="col-lg-4 text-lg-end">
              <button
                className="btn text-white"
                style={{ background: palette.primary, border: "none", minWidth: "190px", boxShadow: "0 12px 28px rgba(31,75,153,0.18)" }}
                onClick={() => scrollToSection("roles")}
              >
                Go to role access
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-4" style={{ background: palette.surface, borderTop: `1px solid ${palette.border}` }}>
        <div className="container d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div className="d-flex align-items-center gap-2" style={{ color: palette.primary, fontWeight: 600 }}>
            InsurAI
          </div>
          <div className="d-flex align-items-center gap-3" style={{ color: palette.muted, fontSize: "0.95rem" }}>
            <a href="#overview" style={{ color: "inherit", textDecoration: "none" }}>Overview</a>
            <a href="#roles" style={{ color: "inherit", textDecoration: "none" }}>Roles</a>
            <a href="#capabilities" style={{ color: "inherit", textDecoration: "none" }}>Capabilities</a>
            <a href="#security" style={{ color: "inherit", textDecoration: "none" }}>Security</a>
            <a href="#" style={{ color: "inherit", textDecoration: "none" }}>Privacy</a>
            <a href="#" style={{ color: "inherit", textDecoration: "none" }}>Terms</a>
          </div>
          <div style={{ color: palette.muted, fontSize: "0.95rem" }}>© {new Date().getFullYear()} InsurAI</div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;