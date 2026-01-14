import React, { useState } from "react";

const HRSidebar = ({
  navigationItems = [],
  activeTab,
  onChangeTab,
  isMobileMenuOpen,
  onCloseMobileMenu,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const isExpanded = isHovered || isMobileMenuOpen;

  const handleNavigation = (tab) => {
    if (typeof onChangeTab === "function") {
      onChangeTab(tab);
    }
    if (typeof onCloseMobileMenu === "function") {
      onCloseMobileMenu();
    }
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="hr-sidebar-backdrop show" 
          onClick={onCloseMobileMenu}
          aria-hidden="true"
        />
      )}
      
      <aside
        className={`hr-sidebar ${isExpanded ? "is-expanded" : ""} ${isMobileMenuOpen ? "show" : ""}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Primary navigation"
      >
        <div className="hr-sidebar-inner">
          <nav className="hr-sidebar-nav">
            {navigationItems.map((item) => (
              <button
                key={item.tab}
                type="button"
                className={`hr-sidebar-link ${activeTab === item.tab ? "active" : ""}`}
                onClick={() => handleNavigation(item.tab)}
                aria-current={activeTab === item.tab ? "page" : undefined}
                title={item.label}
              >
                <span className="hr-sidebar-link__icon" aria-hidden="true">
                  <i className={`bi ${item.icon}`} />
                </span>
                <span className="hr-sidebar-link__label">{item.label}</span>
                {typeof item.badge === "number" && item.badge > 0 && (
                  <span className="hr-sidebar-link__badge" aria-label={`${item.badge} pending`}>
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
                {item.badge === "!" && (
                  <span className="hr-sidebar-link__badge" aria-label="Attention required">
                    !
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="hr-sidebar-footer">
            <div className="hr-sidebar-status">
              <span className="status-indicator" aria-hidden="true" />
              <span>Systems online</span>
            </div>
            <p className="hr-sidebar-meta">v2.1.0 • HR Access</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default HRSidebar;
