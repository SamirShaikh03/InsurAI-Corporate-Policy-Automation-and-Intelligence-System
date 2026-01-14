// src/components/hr/HRPolicies.jsx
import React, { useState, useMemo } from "react";

export default function HRPolicies({ policies }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [viewMode, setViewMode] = useState('table');

  // Enhanced statistics
  const policyStats = useMemo(() => {
    const totalPolicies = policies.length;
    const activePolicies = policies.filter(p => p.policyStatus === "Active").length;
    const totalCoverage = policies.reduce((sum, policy) => sum + (policy.coverageAmount || 0), 0);
    const totalPremium = policies.reduce((sum, policy) => sum + (policy.monthlyPremium || 0), 0);
    
    const policyTypes = policies.reduce((acc, policy) => {
      const type = policy.policyType || 'General';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const expiringSoon = policies.filter(policy => {
      if (!policy.renewalDate) return false;
      try {
        const renewalDate = new Date(policy.renewalDate);
        const daysUntilRenewal = Math.ceil((renewalDate - new Date()) / (1000 * 60 * 60 * 24));
        return daysUntilRenewal <= 30 && daysUntilRenewal > 0;
      } catch {
        return false;
      }
    }).length;

    return { totalPolicies, activePolicies, totalCoverage, totalPremium, policyTypes, expiringSoon };
  }, [policies]);

  // Filtered and sorted policies
  const filteredPolicies = useMemo(() => {
    let filtered = policies.filter(policy => {
      const matchesSearch = 
        policy.policyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        policy.providerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        policy.policyDescription?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || policy.policyStatus === statusFilter;
      const matchesType = typeFilter === "all" || policy.policyType === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        if (sortConfig.key === 'coverageAmount' || sortConfig.key === 'monthlyPremium') {
          aValue = aValue || 0;
          bValue = bValue || 0;
        } else if (sortConfig.key === 'renewalDate') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [policies, searchTerm, statusFilter, typeFilter, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const SortIndicator = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <i className="bi bi-arrow-down-up ms-1" style={{ opacity: 0.4 }}></i>;
    return sortConfig.direction === 'asc' ? 
      <i className="bi bi-arrow-up ms-1" style={{ color: 'var(--hr-primary)' }}></i> : 
      <i className="bi bi-arrow-down ms-1" style={{ color: 'var(--hr-primary)' }}></i>;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const policyTypes = useMemo(() => {
    const types = [...new Set(policies.map(p => p.policyType).filter(Boolean))];
    return types.sort();
  }, [policies]);

  // Policy Card Component for Grid View
  const PolicyCard = ({ policy }) => {
    const daysUntilRenewal = policy.renewalDate ? 
      Math.ceil((new Date(policy.renewalDate) - new Date()) / (1000 * 60 * 60 * 24)) : null;

    return (
      <div className="hr-card hr-policy-card">
        <div className="hr-policy-card__header">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <h6 className="hr-policy-card__title" title={policy.policyName}>
              {policy.policyName}
            </h6>
            <span className={`hr-badge hr-badge--${policy.policyStatus === "Active" ? "success" : "neutral"}`}>
              {policy.policyStatus}
            </span>
          </div>
          
          {daysUntilRenewal !== null && daysUntilRenewal <= 30 && (
            <div className={`hr-alert hr-alert--${daysUntilRenewal <= 7 ? 'warning' : 'info'} hr-alert--sm`}>
              <i className="bi bi-clock me-1"></i>
              Renews in {daysUntilRenewal} day{daysUntilRenewal !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        <div className="hr-policy-card__body">
          <div className="hr-policy-card__stats">
            <div className="hr-policy-card__stat">
              <div className="hr-policy-card__stat-label">Coverage</div>
              <div className="hr-policy-card__stat-value hr-policy-card__stat-value--primary">{formatCurrency(policy.coverageAmount)}</div>
            </div>
            <div className="hr-policy-card__stat">
              <div className="hr-policy-card__stat-label">Premium</div>
              <div className="hr-policy-card__stat-value hr-policy-card__stat-value--success">{formatCurrency(policy.monthlyPremium)}/mo</div>
            </div>
          </div>

          <div className="hr-policy-card__info">
            <div className="hr-policy-card__info-item">
              <i className="bi bi-building"></i>
              <span>{policy.providerName}</span>
            </div>
            <div className="hr-policy-card__info-item">
              <i className="bi bi-tag"></i>
              <span>{policy.policyType}</span>
            </div>
            <div className="hr-policy-card__info-item">
              <i className="bi bi-calendar-event"></i>
              <span>{new Date(policy.renewalDate).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="hr-policy-card__desc">
            <p>{policy.policyDescription?.substring(0, 100)}...</p>
          </div>

          <button className="hr-btn hr-btn--primary w-100" onClick={() => setSelectedPolicy(policy)}>
            <i className="bi bi-eye me-1"></i> View Details
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="hr-policies-page">
      {/* Page Header */}
      <div className="hr-page-header">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
          <div>
            <h1 className="hr-page-title">Company Policy Management</h1>
            <p className="hr-page-subtitle">Manage and review all company insurance policies</p>
          </div>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="hr-stats-grid" style={{ marginBottom: '24px' }}>
        <div className="hr-stat-card hr-stat-card--primary">
          <div className="hr-stat-header">
            <div className="hr-stat-icon hr-stat-icon--primary"><i className="bi bi-shield-check"></i></div>
          </div>
          <div className="hr-stat-value">{policyStats.totalPolicies}</div>
          <div className="hr-stat-label">Total Policies</div>
        </div>
        
        <div className="hr-stat-card hr-stat-card--success">
          <div className="hr-stat-header">
            <div className="hr-stat-icon hr-stat-icon--success"><i className="bi bi-check-circle"></i></div>
          </div>
          <div className="hr-stat-value">{policyStats.activePolicies}</div>
          <div className="hr-stat-label">Active</div>
        </div>
        
        <div className="hr-stat-card hr-stat-card--info">
          <div className="hr-stat-header">
            <div className="hr-stat-icon hr-stat-icon--info"><i className="bi bi-currency-rupee"></i></div>
          </div>
          <div className="hr-stat-value">{formatCurrency(policyStats.totalCoverage)}</div>
          <div className="hr-stat-label">Total Coverage</div>
        </div>
        
        <div className="hr-stat-card hr-stat-card--warning">
          <div className="hr-stat-header">
            <div className="hr-stat-icon hr-stat-icon--warning"><i className="bi bi-graph-up"></i></div>
          </div>
          <div className="hr-stat-value">{formatCurrency(policyStats.totalPremium)}</div>
          <div className="hr-stat-label">Monthly Premium</div>
        </div>
        
        <div className="hr-stat-card hr-stat-card--danger">
          <div className="hr-stat-header">
            <div className="hr-stat-icon hr-stat-icon--danger"><i className="bi bi-exclamation-triangle"></i></div>
          </div>
          <div className="hr-stat-value">{policyStats.expiringSoon}</div>
          <div className="hr-stat-label">Renewing Soon</div>
        </div>
        
        <div className="hr-stat-card">
          <div className="hr-stat-header">
            <div className="hr-stat-icon" style={{ background: 'var(--hr-subtle)', color: 'var(--hr-secondary)' }}>
              <i className="bi bi-tags"></i>
            </div>
          </div>
          <div className="hr-stat-value">{Object.keys(policyStats.policyTypes).length}</div>
          <div className="hr-stat-label">Policy Types</div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="hr-card" style={{ marginBottom: '24px' }}>
        <div className="hr-card-body">
          <div className="row g-3 align-items-center">
            <div className="col-md-3">
              <div className="hr-search-wrapper" style={{ maxWidth: '100%' }}>
                <i className="bi bi-search hr-search-icon"></i>
                <input type="text" className="hr-search-input" placeholder="Search policies..."
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>

            <div className="col-md-2">
              <select className="hr-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Expired">Expired</option>
                <option value="Draft">Draft</option>
              </select>
            </div>

            <div className="col-md-2">
              <select className="hr-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="all">All Types</option>
                {policyTypes.map(type => (<option key={type} value={type}>{type}</option>))}
              </select>
            </div>

            <div className="col-md-3">
              <div className="hr-view-toggle">
                <button className={`hr-view-toggle__btn ${viewMode === 'table' ? 'active' : ''}`} onClick={() => setViewMode('table')}>
                  <i className="bi bi-list"></i> Table
                </button>
                <button className={`hr-view-toggle__btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>
                  <i className="bi bi-grid"></i> Grid
                </button>
              </div>
            </div>

            <div className="col-md-2">
              <button className="hr-btn hr-btn--outline w-100" onClick={() => { setSearchTerm(""); setStatusFilter("all"); setTypeFilter("all"); }}>
                <i className="bi bi-x-circle me-1"></i>Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Policies Display */}
      {filteredPolicies.length === 0 ? (
        <div className="hr-empty-state">
          <div className="hr-empty-state__icon"><i className="bi bi-shield-x"></i></div>
          <h4 className="hr-empty-state__title">No Policies Found</h4>
          <p className="hr-empty-state__desc">{policies.length === 0 ? "No policies available" : "No policies match your search criteria"}</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="hr-policy-grid">
          {filteredPolicies.map((policy) => (<PolicyCard key={policy.id} policy={policy} />))}
        </div>
      ) : (
        <div className="hr-card">
          <div className="hr-card-header">
            <h3 className="hr-card-title"><i className="bi bi-shield-check"></i>Policies Overview</h3>
            <span className="hr-badge hr-badge--primary">{filteredPolicies.length} of {policies.length} policies</span>
          </div>
          <div className="hr-card-body" style={{ padding: 0 }}>
            <div className="hr-table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="hr-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('policyName')} style={{ cursor: 'pointer' }}>Policy Name <SortIndicator columnKey="policyName" /></th>
                    <th onClick={() => handleSort('policyType')} style={{ cursor: 'pointer' }}>Type <SortIndicator columnKey="policyType" /></th>
                    <th>Provider</th>
                    <th onClick={() => handleSort('coverageAmount')} style={{ cursor: 'pointer', textAlign: 'right' }}>Coverage <SortIndicator columnKey="coverageAmount" /></th>
                    <th onClick={() => handleSort('monthlyPremium')} style={{ cursor: 'pointer', textAlign: 'right' }}>Premium <SortIndicator columnKey="monthlyPremium" /></th>
                    <th onClick={() => handleSort('renewalDate')} style={{ cursor: 'pointer' }}>Renewal <SortIndicator columnKey="renewalDate" /></th>
                    <th>Status</th>
                    <th style={{ width: '120px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPolicies.map((policy) => (
                    <tr key={policy.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{policy.policyName}</div>
                        <small style={{ color: 'var(--hr-text-muted)' }}>{policy.policyDescription?.substring(0, 40)}...</small>
                      </td>
                      <td><span className="hr-badge hr-badge--neutral">{policy.policyType}</span></td>
                      <td><small style={{ color: 'var(--hr-text-muted)' }}>{policy.providerName}</small></td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--hr-primary)' }}>{formatCurrency(policy.coverageAmount)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--hr-success)' }}>{formatCurrency(policy.monthlyPremium)}/mo</td>
                      <td><small style={{ color: 'var(--hr-text-muted)' }}>{new Date(policy.renewalDate).toLocaleDateString()}</small></td>
                      <td><span className={`hr-badge hr-badge--${policy.policyStatus === "Active" ? "success" : "neutral"}`}>{policy.policyStatus}</span></td>
                      <td>
                        <button className="hr-btn hr-btn--primary hr-btn--sm" onClick={() => setSelectedPolicy(policy)}>
                          <i className="bi bi-eye me-1"></i>View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Policy Detail Modal */}
      {selectedPolicy && (
        <div className="hr-modal-backdrop" onClick={() => setSelectedPolicy(null)}>
          <div className="hr-modal hr-modal--xl" onClick={(e) => e.stopPropagation()}>
            <div className="hr-modal-header">
              <h3 className="hr-modal-title"><i className="bi bi-shield-check me-2"></i>{selectedPolicy.policyName}</h3>
              <button type="button" className="hr-modal-close" onClick={() => setSelectedPolicy(null)}><i className="bi bi-x-lg"></i></button>
            </div>
            <div className="hr-modal-body">
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="hr-info-card">
                    <h6 className="hr-info-card__title"><i className="bi bi-info-circle me-2"></i>Policy Details</h6>
                    <div className="hr-info-card__body">
                      <div className="row">
                        <div className="col-6">
                          <div className="hr-detail-group">
                            <label className="hr-detail-label">Provider</label>
                            <p className="hr-detail-value">{selectedPolicy.providerName}</p>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="hr-detail-group">
                            <label className="hr-detail-label">Type</label>
                            <p className="hr-detail-value">{selectedPolicy.policyType}</p>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="hr-detail-group">
                            <label className="hr-detail-label">Coverage</label>
                            <p className="hr-detail-value" style={{ color: 'var(--hr-primary)', fontWeight: 600 }}>{formatCurrency(selectedPolicy.coverageAmount)}</p>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="hr-detail-group">
                            <label className="hr-detail-label">Premium</label>
                            <p className="hr-detail-value" style={{ color: 'var(--hr-success)', fontWeight: 600 }}>{formatCurrency(selectedPolicy.monthlyPremium)}/month</p>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="hr-detail-group">
                            <label className="hr-detail-label">Renewal Date</label>
                            <p className="hr-detail-value">{new Date(selectedPolicy.renewalDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="hr-detail-group" style={{ marginBottom: 0 }}>
                            <label className="hr-detail-label">Status</label>
                            <p className="hr-detail-value">
                              <span className={`hr-badge hr-badge--${selectedPolicy.policyStatus === "Active" ? "success" : "neutral"}`}>{selectedPolicy.policyStatus}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="hr-info-card">
                    <h6 className="hr-info-card__title"><i className="bi bi-file-text me-2"></i>Policy Description</h6>
                    <div className="hr-info-card__body">
                      <div className="hr-detail-box" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {selectedPolicy.policyDescription}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hr-info-card" style={{ marginTop: '24px' }}>
                <h6 className="hr-info-card__title"><i className="bi bi-folder me-2"></i>Policy Documents</h6>
                <div className="hr-info-card__body">
                  <div className="hr-doc-grid">
                    {[
                      { label: 'Policy Contract', url: selectedPolicy.contractUrl, icon: 'file-text' },
                      { label: 'Terms & Conditions', url: selectedPolicy.termsUrl, icon: 'file-earmark-text' },
                      { label: 'Claim Form', url: selectedPolicy.claimFormUrl, icon: 'clipboard-check' },
                      { label: 'Annexure', url: selectedPolicy.annexureUrl, icon: 'file-plus' }
                    ].map((doc, index) => doc.url && (
                      <a key={index} href={doc.url} target="_blank" rel="noreferrer" className="hr-doc-item">
                        <i className={`bi bi-${doc.icon}`}></i>
                        <span>{doc.label}</span>
                        <i className="bi bi-download" style={{ marginLeft: 'auto' }}></i>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="hr-modal-footer">
              <button className="hr-btn hr-btn--secondary" onClick={() => setSelectedPolicy(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .hr-policies-page .hr-stats-grid { grid-template-columns: repeat(6, 1fr); }
        @media (max-width: 1200px) { .hr-policies-page .hr-stats-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 768px) { .hr-policies-page .hr-stats-grid { grid-template-columns: repeat(2, 1fr); } }
        
        .hr-policy-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 24px; }
        
        .hr-policy-card { display: flex; flex-direction: column; height: 100%; }
        .hr-policy-card__header { padding: 20px 20px 16px; border-bottom: 1px solid var(--hr-border, #e2e8f0); }
        .hr-policy-card__title { margin: 0; font-size: 1rem; font-weight: 600; color: var(--hr-text, #0f172a); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; padding-right: 12px; }
        .hr-policy-card__body { padding: 20px; flex: 1; display: flex; flex-direction: column; }
        .hr-policy-card__stats { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 16px; background: var(--hr-subtle, #f1f5f9); border-radius: var(--hr-radius, 10px); margin-bottom: 16px; text-align: center; }
        .hr-policy-card__stat-label { font-size: 0.75rem; color: var(--hr-text-muted, #64748b); margin-bottom: 4px; }
        .hr-policy-card__stat-value { font-size: 1rem; font-weight: 700; }
        .hr-policy-card__stat-value--primary { color: var(--hr-primary, #0d9488); }
        .hr-policy-card__stat-value--success { color: var(--hr-success, #10b981); }
        .hr-policy-card__info { margin-bottom: 16px; }
        .hr-policy-card__info-item { display: flex; align-items: center; gap: 8px; font-size: 0.875rem; color: var(--hr-text-muted, #64748b); margin-bottom: 8px; }
        .hr-policy-card__info-item i { color: var(--hr-primary, #0d9488); }
        .hr-policy-card__desc { flex: 1; margin-bottom: 16px; }
        .hr-policy-card__desc p { margin: 0; font-size: 0.875rem; color: var(--hr-text-muted, #64748b); line-height: 1.5; }
        
        .hr-view-toggle { display: flex; border: 1px solid var(--hr-border, #e2e8f0); border-radius: var(--hr-radius, 10px); overflow: hidden; }
        .hr-view-toggle__btn { flex: 1; padding: 10px 16px; background: var(--hr-surface, #fff); border: none; font-size: 0.875rem; font-weight: 500; color: var(--hr-text-muted, #64748b); cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 6px; }
        .hr-view-toggle__btn:hover { background: var(--hr-subtle, #f1f5f9); }
        .hr-view-toggle__btn.active { background: var(--hr-primary, #0d9488); color: #fff; }
        
        .hr-modal--xl { max-width: 900px; }
        .hr-modal-backdrop { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
        .hr-modal { background: var(--hr-surface, #fff); border-radius: var(--hr-radius-lg, 14px); width: 100%; max-width: 700px; max-height: 90vh; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
        .hr-modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; background: linear-gradient(135deg, var(--hr-primary-dark, #0f766e) 0%, var(--hr-primary, #0d9488) 100%); color: #fff; }
        .hr-modal-title { font-size: 1.1rem; font-weight: 600; margin: 0; display: flex; align-items: center; }
        .hr-modal-close { background: rgba(255,255,255,0.15); border: none; color: #fff; width: 36px; height: 36px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s; }
        .hr-modal-close:hover { background: rgba(255,255,255,0.25); }
        .hr-modal-body { padding: 24px; overflow-y: auto; max-height: calc(90vh - 140px); }
        .hr-modal-footer { padding: 16px 24px; border-top: 1px solid var(--hr-border, #e2e8f0); display: flex; justify-content: flex-end; gap: 12px; }
        
        .hr-info-card { background: var(--hr-subtle, #f1f5f9); border-radius: var(--hr-radius, 10px); overflow: hidden; }
        .hr-info-card__title { padding: 16px 20px; margin: 0; background: rgba(13, 148, 136, 0.08); font-size: 0.95rem; font-weight: 600; color: var(--hr-primary, #0d9488); border-bottom: 1px solid var(--hr-border, #e2e8f0); }
        .hr-info-card__body { padding: 20px; }
        .hr-detail-group { margin-bottom: 16px; }
        .hr-detail-label { display: block; font-size: 0.8rem; font-weight: 600; color: var(--hr-text-muted, #64748b); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
        .hr-detail-value { margin: 0; font-size: 1rem; color: var(--hr-text, #0f172a); }
        .hr-detail-box { padding: 16px; background: #fff; border-radius: var(--hr-radius, 10px); font-size: 0.95rem; color: var(--hr-text, #0f172a); white-space: pre-wrap; }
        
        .hr-doc-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
        .hr-doc-item { display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: #fff; border-radius: var(--hr-radius, 10px); text-decoration: none; color: var(--hr-text, #0f172a); transition: all 0.2s; border: 1px solid var(--hr-border, #e2e8f0); }
        .hr-doc-item:hover { background: var(--hr-primary-subtle, rgba(13, 148, 136, 0.08)); color: var(--hr-primary, #0d9488); border-color: var(--hr-primary, #0d9488); }
        
        .hr-alert--sm { padding: 8px 12px; font-size: 0.8rem; }
      `}</style>
    </div>
  );
}