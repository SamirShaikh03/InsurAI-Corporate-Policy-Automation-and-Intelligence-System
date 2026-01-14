import React, { useMemo, useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./EmployeePolicies.css";

export default function EmployeePolicies({
  policies = [],
  selectedPolicy,
  setSelectedPolicy
}) {
  const [localSelectedPolicy, setLocalSelectedPolicy] = useState(selectedPolicy);

  const totalPremium = useMemo(
    () =>
      policies.reduce((total, policy) => total + Number(policy.monthlyPremium || 0), 0),
    [policies]
  );

  const formatCurrency = (value) => {
    if (value === undefined || value === null || Number.isNaN(Number(value))) return "N/A";
    return `₹${Number(value).toLocaleString("en-IN")}`;
  };

  const viewPolicyDetails = (policy) => {
    setLocalSelectedPolicy(policy);
    setSelectedPolicy(policy);
  };

  // ✅ Download Policy PDF - Professional Format
  const downloadPolicy = (policy) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;

    // === HEADER ===
    doc.setFillColor(26, 115, 232);
    doc.rect(0, 0, pageWidth, 50, 'F');

    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('InsurAI', margin, 20);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Corporate Policy Automation & Intelligence', margin, 28);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('POLICY CERTIFICATE', pageWidth - margin, 20, { align: 'right' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Document Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth - margin, 28, { align: 'right' });

    // Policy name banner
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 50, pageWidth, 20, 'F');
    doc.setFontSize(16);
    doc.setTextColor(26, 115, 232);
    doc.setFont('helvetica', 'bold');
    doc.text(policy.name || 'Insurance Policy', pageWidth / 2, 63, { align: 'center' });

    let yPos = 85;

    // === POLICY DETAILS SECTION ===
    doc.setFontSize(12);
    doc.setTextColor(26, 115, 232);
    doc.setFont('helvetica', 'bold');
    doc.text('POLICY INFORMATION', margin, yPos);
    doc.setDrawColor(26, 115, 232);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos + 2, margin + 50, yPos + 2);

    yPos += 12;

    // Policy details table
    const policyDetails = [
      ['Policy Name', policy.name || 'N/A'],
      ['Policy Type', policy.type || 'Insurance Policy'],
      ['Provider', policy.provider || 'N/A'],
      ['Policy Status', policy.status || 'Active'],
      ['Coverage Amount', formatCurrency(policy.coverageAmount) || 'N/A'],
      ['Monthly Premium', formatCurrency(policy.premium) || 'N/A'],
      ['Annual Premium', formatCurrency((policy.premium || 0) * 12) || 'N/A']
    ];

    doc.autoTable({
      startY: yPos,
      body: policyDetails,
      theme: 'plain',
      styles: {
        fontSize: 10,
        cellPadding: 5,
        textColor: [51, 65, 85]
      },
      columnStyles: {
        0: { cellWidth: 60, fontStyle: 'bold', textColor: [71, 85, 105] },
        1: { cellWidth: 100 }
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: margin, right: margin }
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // === COVERAGE DETAILS ===
    doc.setFontSize(12);
    doc.setTextColor(26, 115, 232);
    doc.setFont('helvetica', 'bold');
    doc.text('COVERAGE DETAILS', margin, yPos);
    doc.line(margin, yPos + 2, margin + 45, yPos + 2);

    yPos += 10;

    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');

    const description = policy.description || 'This policy provides comprehensive coverage as per the terms and conditions specified in your policy document. Please refer to the full policy document for detailed coverage information, exclusions, and claim procedures.';
    const splitDescription = doc.splitTextToSize(description, pageWidth - margin * 2);
    doc.text(splitDescription, margin, yPos);

    yPos += splitDescription.length * 6 + 15;

    // === IMPORTANT NOTES ===
    doc.setFillColor(255, 251, 235);
    doc.roundedRect(margin, yPos, pageWidth - margin * 2, 35, 3, 3, 'F');
    doc.setDrawColor(245, 158, 11);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, yPos, pageWidth - margin * 2, 35, 3, 3, 'S');

    doc.setFontSize(10);
    doc.setTextColor(146, 64, 14);
    doc.setFont('helvetica', 'bold');
    doc.text('Important Notes:', margin + 5, yPos + 8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('• Keep this document safe for your records', margin + 5, yPos + 16);
    doc.text('• For claims, submit all required documents through the Employee Dashboard', margin + 5, yPos + 23);
    doc.text('• Contact HR for any policy-related queries or modifications', margin + 5, yPos + 30);

    // === FOOTER ===
    doc.setFillColor(248, 250, 252);
    doc.rect(0, pageHeight - 25, pageWidth, 25, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 25, pageWidth - margin, pageHeight - 25);

    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('InsurAI - Corporate Policy Automation & Intelligence System', margin, pageHeight - 15);
    doc.text('This is a system-generated document', pageWidth - margin, pageHeight - 15, { align: 'right' });
    doc.text('For official policy documents, please contact your HR department', pageWidth / 2, pageHeight - 8, { align: 'center' });

    doc.save(`${(policy.name || 'policy').replace(/\s+/g, '_')}_certificate.pdf`);
  };
      return (
          <section className="employee-policies">
        <header className="employee-policies__header">
          <div>
            <p className="employee-policies__kicker">Coverage overview</p>
            <h3>Your insurance policies</h3>
          </div>
          <div className="employee-policies__metrics">
            <div className="metric-card">
              <span className="metric-label">Active policies</span>
              <strong>{policies.length}</strong>
            </div>
            <div className="metric-card">
              <span className="metric-label">Monthly premium</span>
              <strong>{formatCurrency(totalPremium)}</strong>
            </div>
          </div>
        </header>

        <div className="employee-policies__grid">
          {policies.length === 0 ? (
            <div className="employee-policies__empty">
              <i className="bi bi-folder-x" aria-hidden="true"></i>
              <p>No policies found for your account.</p>
            </div>
          ) : (
            policies.map((policy) => {
              const statusClass = `status-${(policy.status || "default")
                .toLowerCase()
                .replace(/\s+/g, '-')}`;
              return (
                <article key={policy.id} className="policy-card">
                  <header className="policy-card__header">
                    <div>
                      <p className="policy-card__provider">{policy.provider}</p>
                      <h4>{policy.name}</h4>
                    </div>
                    <span className={`policy-card__status ${statusClass}`}>
                      {policy.status || "Unknown"}
                    </span>
                  </header>
                  <dl className="policy-card__meta">
                    <div>
                      <dt>Coverage</dt>
                      <dd>{policy.formattedCoverage || formatCurrency(policy.coverageAmount)}</dd>
                    </div>
                    <div>
                      <dt>Premium</dt>
                      <dd>{policy.formattedPremium || `${formatCurrency(policy.monthlyPremium)}/month`}</dd>
                    </div>
                    <div>
                      <dt>Renewal</dt>
                      <dd>{policy.renewalDate || "N/A"}</dd>
                    </div>
                  </dl>
                  <div className="policy-card__benefits">
                    {policy.benefits?.length ? (
                      policy.benefits.map((benefit, index) => (
                        <span key={`${policy.id}-benefit-${index}`} className="policy-card__benefit">
                          {benefit}
                        </span>
                      ))
                    ) : (
                      <span className="policy-card__benefit policy-card__benefit--muted">
                        No benefit details provided
                      </span>
                    )}
                  </div>
                  <div className="policy-card__actions">
                    <button
                      type="button"
                      className="policy-card__cta primary"
                      onClick={() => viewPolicyDetails(policy)}
                    >
                      <i className="bi bi-eye" aria-hidden="true"></i>
                      View details
                    </button>
                    <button
                      type="button"
                      className="policy-card__cta ghost"
                      onClick={() => downloadPolicy(policy)}
                    >
                      <i className="bi bi-download" aria-hidden="true"></i>
                      Download
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>

      {/* Policy Modal */}
      {localSelectedPolicy && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content shadow-lg rounded-4">
              <div className="modal-header border-0 bg-light">
                <h5 className="modal-title">{localSelectedPolicy.name}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setLocalSelectedPolicy(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <p>
                      <strong>Provider:</strong> {localSelectedPolicy.provider}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p>
                      <strong>Coverage:</strong> {localSelectedPolicy.formattedCoverage}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p>
                      <strong>Premium:</strong> {localSelectedPolicy.formattedPremium || `₹${localSelectedPolicy.monthlyPremium}/month`}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p>
                      <strong>Renewal Date:</strong> {localSelectedPolicy.renewalDate}
                    </p>
                  </div>
                  <div className="col-md-6">
                    <p>
                      <strong>Status:</strong> {localSelectedPolicy.status}
                    </p>
                  </div>
                </div>

                <h6 className="mt-3 fw-semibold">Covered Benefits:</h6>
                <ul className="list-group list-group-flush mb-3">
                  {localSelectedPolicy.benefits.map((benefit, idx) => (
                    <li key={idx} className="list-group-item small">
                      {benefit}
                    </li>
                  ))}
                </ul>

                <h6 className="mt-3 fw-semibold">Documents:</h6>
                <div className="d-flex flex-wrap gap-2 mb-2">
                  {localSelectedPolicy.contractUrl && (
                    <a
                      href={localSelectedPolicy.contractUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline-primary btn-sm shadow-sm"
                    >
                      Contract
                    </a>
                  )}
                  {localSelectedPolicy.termsUrl && (
                    <a
                      href={localSelectedPolicy.termsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline-primary btn-sm shadow-sm"
                    >
                      Terms
                    </a>
                  )}
                  {localSelectedPolicy.claimFormUrl && (
                    <a
                      href={localSelectedPolicy.claimFormUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline-primary btn-sm shadow-sm"
                    >
                      Claim Form
                    </a>
                  )}
                  {localSelectedPolicy.annexureUrl && (
                    <a
                      href={localSelectedPolicy.annexureUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline-primary btn-sm shadow-sm"
                    >
                      Annexure
                    </a>
                  )}
                </div>
              </div>
              <div className="modal-footer border-0">
                <button
                  className="btn btn-secondary"
                  onClick={() => setLocalSelectedPolicy(null)}
                >
                  Close
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => downloadPolicy(localSelectedPolicy)}
                >
                  Download Policy Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
