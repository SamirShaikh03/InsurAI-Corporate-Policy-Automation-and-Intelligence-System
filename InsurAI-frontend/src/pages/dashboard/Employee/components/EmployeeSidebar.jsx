import React, { useState } from "react";

const EmployeeSidebar = ({
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
          className="emp-sidebar-backdrop show" 
          onClick={onCloseMobileMenu}
          aria-hidden="true"
        />
      )}
      
      <aside
        className={`emp-sidebar ${isExpanded ? "is-expanded" : ""} ${isMobileMenuOpen ? "show" : ""}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label="Primary navigation"
      >
        <div className="emp-sidebar-inner">
          <nav className="emp-sidebar-nav">
            {navigationItems.map((item) => (
              <button
                key={item.tab}
                type="button"
                className={`emp-sidebar-link ${activeTab === item.tab ? "active" : ""}`}
                onClick={() => handleNavigation(item.tab)}
                aria-current={activeTab === item.tab ? "page" : undefined}
                title={item.label}
              >
                <span className="emp-sidebar-link__icon" aria-hidden="true">
                  <i className={`bi ${item.icon}`} />
                </span>
                <span className="emp-sidebar-link__label">{item.label}</span>
                {typeof item.badge === "number" && item.badge > 0 && (
                  <span className="emp-sidebar-link__badge" aria-label={`${item.badge} pending`}>
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
                {item.badge === "!" && (
                  <span className="emp-sidebar-link__badge" aria-label="Attention required">
                    !
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="emp-sidebar-footer">
            <div className="emp-sidebar-status">
              <span className="status-indicator" aria-hidden="true" />
              <span>Systems nominal</span>
            </div>
            <p className="emp-sidebar-meta">v2.0.1 • Employee Access</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default EmployeeSidebar;
