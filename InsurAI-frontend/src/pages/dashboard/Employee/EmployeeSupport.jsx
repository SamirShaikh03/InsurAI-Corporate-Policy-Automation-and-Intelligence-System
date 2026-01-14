import React, { useState } from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./EmployeeSupport.css";

export default function EmployeeSupport({
  agentsAvailability,
  selectedAgentId,
  setSelectedAgentId,
  showNotificationAlert,
}) {
  const [activeFaq, setActiveFaq] = useState("");
  const [expandedFaqs, setExpandedFaqs] = useState([]);

  const safeAgents = Array.isArray(agentsAvailability) ? agentsAvailability : [];
  const availableAgents = safeAgents.filter((a) => a.available).length;

  const faqs = [
    {
      id: "submitClaim",
      question: "How to submit a claim?",
      answer: "Log in to your Employee Dashboard, navigate to 'Submit New Claim', fill in the claim details, attach required documents, and submit. Ensure all fields are correctly filled for faster processing.",
      icon: "bi-file-text",
      category: "Claims"
    },
    {
      id: "processingTime",
      question: "Claim processing time",
      answer: "Claims are processed Monday to Saturday. Standard claims are reviewed within 48 hours. Urgent claims are prioritized and processed as quickly as possible.",
      icon: "bi-clock",
      category: "Claims"
    },
    {
      id: "requiredDocs",
      question: "Required documents",
      answer: "You will need: Contract form, Claim form, Hospital bills, Medical reports, Supporting receipts, ID proof. Ensure all documents are legible and complete.",
      icon: "bi-file-earmark",
      category: "Claims"
    },
    {
      id: "trackClaim",
      question: "Can I track my claim status?",
      answer: "Yes, all submitted claims can be tracked in real-time via the 'My Claims' section in your dashboard. You'll receive status updates at every stage of the process.",
      icon: "bi-truck",
      category: "Tracking"
    },
    {
      id: "contactAssistance",
      question: "Who can I contact for assistance?",
      answer: "You can contact our insurance agents via callback request, live chat (coming soon), or email support@insurai.com. Our team is available Monday-Friday 9AM-6PM.",
      icon: "bi-person",
      category: "Support"
    },
    {
      id: "urgentAssistance",
      question: "What if I need urgent assistance?",
      answer: "For urgent medical emergencies, call 1-800-INSURAI (1-800-467-8724). Available 24/7 for emergency claims and immediate assistance.",
      icon: "bi-exclamation-triangle",
      category: "Emergency"
    },
    {
      id: "policyCoverage",
      question: "What does my policy cover?",
      answer: "Your policy covers hospitalization, surgical procedures, medication, and diagnostic tests. Check your policy document for specific coverage details and limits.",
      icon: "bi-shield-check",
      category: "Policy"
    },
    {
      id: "renewalProcess",
      question: "How to renew my policy?",
      answer: "Policy renewal is automatic. You'll receive a notification 30 days before expiry. No action required unless you wish to make changes to your coverage.",
      icon: "bi-arrow-repeat",
      category: "Policy"
    }
  ];

  const requiredDocuments = [
    { name: "Contract Form", mandatory: true },
    { name: "Claim Form", mandatory: true },
    { name: "Hospital Bills", mandatory: true },
    { name: "Medical Reports", mandatory: true },
    { name: "Supporting Receipts", mandatory: true },
    { name: "ID Proof", mandatory: true },
    { name: "Doctor's Prescription", mandatory: false },
    { name: "Discharge Summary", mandatory: false }
  ];

  const supportCategories = [
    { name: "Claims", count: 3, icon: "bi-file-text" },
    { name: "Policy", count: 2, icon: "bi-shield-check" },
    { name: "Tracking", count: 1, icon: "bi-truck" },
    { name: "Support", count: 2, icon: "bi-headset" }
  ];

  const toggleFaq = (faqId) => {
    setExpandedFaqs(prev => 
      prev.includes(faqId) 
        ? prev.filter(id => id !== faqId)
        : [...prev, faqId]
    );
  };

  const supportChannels = [
    {
      id: "chat",
      title: "Live chat support",
      description: "Chat with our specialists for instant guidance on claims, benefits, and documentation.",
      icon: "bi-chat-dots",
      meta: "Mon - Fri • 9 AM - 6 PM",
      cta: "Start live chat",
      tone: "success",
      action: () => showNotificationAlert("Live chat feature coming soon! Stay tuned for updates.", "info"),
    },
    {
      id: "email",
      title: "Email assistance",
      description: "Send detailed queries and receive comprehensive responses from the support desk.",
      icon: "bi-envelope",
      meta: "support@insurai.com • 24h response",
      cta: "Send email",
      tone: "primary",
      action: () => {
        window.location = "mailto:support@insurai.com?subject=Insurance Support Query";
      },
    },
  ];

  const renderAllFaqsModal = () => (
    <div className="support-modal" role="dialog" aria-modal="true">
      <div className="support-modal__panel">
        <header className="support-modal__header">
          <div>
            <p className="support-modal__eyebrow">Knowledge base</p>
            <h4>Frequently asked questions</h4>
          </div>
          <button type="button" className="support-icon-btn" onClick={() => setActiveFaq("")} aria-label="Close">
            <i className="bi bi-x-lg" aria-hidden="true"></i>
          </button>
        </header>
        <div className="support-modal__body">
          {faqs.map((faq) => (
            <article key={faq.id} className="support-modal__faq">
              <div>
                <p className="support-modal__category">{faq.category}</p>
                <h5>
                  <i className={`bi ${faq.icon}`} aria-hidden="true"></i>
                  {faq.question}
                </h5>
              </div>
              <p>{faq.answer}</p>
            </article>
          ))}
          <section className="support-modal__documents">
            <h6>Required documents checklist</h6>
            <div className="support-doc-grid">
              {requiredDocuments.map((doc) => (
                <div key={doc.name} className="support-doc-item">
                  <i className={`bi ${doc.mandatory ? "bi-file-earmark-check" : "bi-file-earmark-plus"}`} aria-hidden="true"></i>
                  <span>
                    {doc.name}
                    {doc.mandatory && <small>*</small>}
                  </span>
                </div>
              ))}
            </div>
            <p className="support-helper">
              <i className="bi bi-info-circle" aria-hidden="true"></i>
              * Mandatory for claim processing
            </p>
          </section>
        </div>
        <footer className="support-modal__footer">
          <button type="button" className="support-btn support-btn--ghost" onClick={() => setActiveFaq("")}>
            Close
          </button>
        </footer>
      </div>
    </div>
  );

  return (
    <section className="employee-support">
      <header className="support-hero">
        <div>
          <p className="support-hero__kicker">Support desk</p>
          <h3>Get support</h3>
          <p>Multiple ways to get help with your insurance needs.</p>
        </div>
        <div className="support-hero__stats">
          <div className="support-stat">
            <span>Agents online</span>
            <strong>{availableAgents}</strong>
          </div>
          <div className="support-stat">
            <span>Topics covered</span>
            <strong>{supportCategories.length}</strong>
          </div>
        </div>
      </header>

      <div className="support-grid support-grid--primary">
        <article className="support-card">
          <div className="support-card__header">
            <div>
              <p className="support-card__eyebrow">Human help</p>
              <h4>Contact insurance agent</h4>
            </div>
            <span className={`support-badge ${availableAgents > 0 ? "support-badge--success" : "support-badge--warning"}`}>
              {availableAgents > 0 ? "Online" : "Limited"}
            </span>
          </div>
          <p className="support-card__intro">
            Get personalised assistance with claims, coverage clarifications, and policy changes.
          </p>

          <div className="support-card__status">
            <div>
              <small>Online now</small>
              <strong>{availableAgents}</strong>
            </div>
            <div>
              <small>Total agents</small>
              <strong>{safeAgents.length}</strong>
            </div>
          </div>

          {safeAgents.length > 0 ? (
            <>
              <label className="support-field">
                <span className="support-label">
                  Select agent <span>*</span>
                </span>
                <select
                  className="support-select"
                  value={selectedAgentId}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                >
                  <option value="">Choose an agent...</option>
                  {safeAgents.map((agent) => (
                    <option key={agent.id} value={agent.agent.id} disabled={!agent.available}>
                      {agent.agent.name} • {agent.available ? "Online" : "Offline"}
                      {agent.agent.specialization ? ` • ${agent.agent.specialization}` : ""}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                className="support-btn support-btn--primary"
                disabled={!selectedAgentId}
                onClick={() => showNotificationAlert("Agent callback requested. They will contact you soon.", "success")}
              >
                <i className="bi bi-telephone" aria-hidden="true"></i>
                Request callback
              </button>
              <p className="support-helper">
                <i className="bi bi-info-circle" aria-hidden="true"></i>
                Typically responds within 2-4 hours
              </p>
            </>
          ) : (
            <div className="support-empty">
              <i className="bi bi-person-x" aria-hidden="true"></i>
              <p>No agents available at the moment.</p>
              <button
                type="button"
                className="support-btn support-btn--ghost"
                onClick={() =>
                  showNotificationAlert(
                    "Our team will contact you as soon as an agent becomes available.",
                    "info"
                  )
                }
              >
                Notify me
              </button>
            </div>
          )}
        </article>

        <article className="support-card">
          <div className="support-card__header">
            <div>
              <p className="support-card__eyebrow">Guided answers</p>
              <h4>FAQs & resources</h4>
            </div>
          </div>
          <p className="support-card__intro">
            Find instant answers to the most common policy, claim, and coverage questions.
          </p>

          <div className="support-category-grid">
            {supportCategories.map((category) => (
              <button
                key={category.name}
                type="button"
                className={`support-chip ${activeFaq === category.name ? "is-active" : ""}`}
                onClick={() => setActiveFaq(category.name)}
              >
                <i className={`bi ${category.icon}`} aria-hidden="true"></i>
                <span>{category.name}</span>
                <small>{category.count}</small>
              </button>
            ))}
          </div>

          <div className="support-accordion">
            {faqs.slice(0, 4).map((faq) => (
              <div key={faq.id} className={`support-accordion__item ${expandedFaqs.includes(faq.id) ? "is-open" : ""}`}>
                <button type="button" onClick={() => toggleFaq(faq.id)}>
                  <div>
                    <i className={`bi ${faq.icon}`} aria-hidden="true"></i>
                    {faq.question}
                  </div>
                  <i className="bi bi-chevron-down" aria-hidden="true"></i>
                </button>
                {expandedFaqs.includes(faq.id) && (
                  <div className="support-accordion__content">
                    <p>{faq.answer}</p>
                    {faq.id === "requiredDocs" && (
                      <div className="support-doc-grid">
                        {requiredDocuments.map((doc) => (
                          <div key={doc.name} className="support-doc-item">
                            <i
                              className={`bi ${doc.mandatory ? "bi-file-earmark-check" : "bi-file-earmark-plus"}`}
                              aria-hidden="true"
                            ></i>
                            <span>
                              {doc.name}
                              {doc.mandatory && <small>*</small>}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <button type="button" className="support-btn support-btn--secondary" onClick={() => setActiveFaq("allFaqs")}>
            <i className="bi bi-search" aria-hidden="true"></i>
            View all FAQs
          </button>
        </article>
      </div>

      <div className="support-grid support-grid--channels">
        {supportChannels.map((channel) => (
          <article key={channel.id} className={`support-channel support-card support-card--minimal support-card--${channel.tone}`}>
            <div className="support-channel__icon">
              <i className={`bi ${channel.icon}`} aria-hidden="true"></i>
            </div>
            <h5>{channel.title}</h5>
            <p>{channel.description}</p>
            <span className="support-channel__meta">
              <i className="bi bi-clock" aria-hidden="true"></i>
              {channel.meta}
            </span>
            <button type="button" className="support-btn support-btn--ghost" onClick={channel.action}>
              {channel.cta}
            </button>
          </article>
        ))}
      </div>

      <article className="support-emergency">
        <div>
          <p className="support-card__eyebrow">24/7 priority line</p>
          <h4>Emergency assistance</h4>
          <p>
            For urgent medical emergencies requiring immediate claim processing, call our dedicated hotline anytime.
          </p>
          <div className="support-emergency__number">1-800-INSURAI (1-800-467-8724)</div>
          <span>
            <i className="bi bi-clock" aria-hidden="true"></i>
            Available round the clock
          </span>
        </div>
        <button
          type="button"
          className="support-btn support-btn--danger"
          onClick={() =>
            showNotificationAlert(
              "Emergency line: 1-800-467-8724. Please use this number only for genuine emergencies.",
              "warning"
            )
          }
        >
          <i className="bi bi-telephone" aria-hidden="true"></i>
          Call now
        </button>
      </article>

      {activeFaq === "allFaqs" && renderAllFaqsModal()}
    </section>
  );
}