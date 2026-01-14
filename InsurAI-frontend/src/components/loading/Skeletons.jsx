import React from 'react';

/**
 * Skeleton - Base skeleton component
 * 
 * @param {string} variant - Type of skeleton (text, text-sm, text-lg, title, heading, avatar, avatar-lg, button, badge, image, icon)
 * @param {string} width - Custom width (CSS value)
 * @param {string} height - Custom height (CSS value)
 * @param {string} className - Additional classes
 */
export function Skeleton({ 
  variant = 'text', 
  width, 
  height,
  className = '',
  style = {}
}) {
  const combinedStyle = {
    ...(width && { width }),
    ...(height && { height }),
    ...style
  };
  
  return (
    <div 
      className={`skeleton skeleton--${variant} ${className}`}
      style={Object.keys(combinedStyle).length > 0 ? combinedStyle : undefined}
      aria-hidden="true"
    />
  );
}

/**
 * SkeletonCard - Pre-built skeleton for card layouts
 * 
 * @param {boolean} showAvatar - Show avatar placeholder
 * @param {boolean} showFooter - Show footer section
 * @param {number} lines - Number of text lines
 */
export function SkeletonCard({ 
  showAvatar = true, 
  showFooter = true,
  lines = 3,
  className = ''
}) {
  return (
    <div className={`skeleton-card ${className}`} aria-hidden="true">
      <div className="skeleton-card__header">
        {showAvatar && <Skeleton variant="avatar" />}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <Skeleton variant="text-lg" width="60%" />
          <Skeleton variant="text-sm" width="40%" />
        </div>
      </div>
      
      <div className="skeleton-card__body">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton 
            key={i} 
            variant="text" 
            width={i === lines - 1 ? '70%' : '100%'} 
          />
        ))}
      </div>
      
      {showFooter && (
        <div className="skeleton-card__footer">
          <Skeleton variant="badge" />
          <Skeleton variant="button" width="80px" />
        </div>
      )}
    </div>
  );
}

/**
 * SkeletonTable - Pre-built skeleton for table layouts
 * 
 * @param {number} rows - Number of rows
 * @param {number} columns - Number of columns
 * @param {boolean} showHeader - Show header row
 */
export function SkeletonTable({ 
  rows = 5, 
  columns = 4,
  showHeader = true,
  className = ''
}) {
  return (
    <div className={`skeleton-table ${className}`} aria-hidden="true">
      {showHeader && (
        <div className="skeleton-table__row" style={{ background: 'var(--skeleton-base)', marginBottom: '8px' }}>
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="skeleton-table__cell">
              <Skeleton variant="text" width={i === 0 ? '50%' : '70%'} />
            </div>
          ))}
        </div>
      )}
      
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="skeleton-table__row">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div 
              key={colIndex} 
              className={`skeleton-table__cell ${colIndex === 0 ? 'skeleton-table__cell--sm' : ''}`}
            >
              {colIndex === 0 ? (
                <Skeleton variant="badge" width="60px" />
              ) : colIndex === columns - 1 ? (
                <Skeleton variant="button" width="70px" height="32px" />
              ) : (
                <Skeleton variant="text" width={`${60 + Math.random() * 30}%`} />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * SkeletonStats - Grid of stat card skeletons for dashboards
 * 
 * @param {number} count - Number of stat cards
 */
export function SkeletonStats({ count = 4, className = '' }) {
  return (
    <div className={`skeleton-stats ${className}`} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-stat-card">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Skeleton variant="icon" className="skeleton-stat-card__icon" />
            <Skeleton variant="badge" width="50px" />
          </div>
          <div className="skeleton-stat-card__content">
            <Skeleton variant="heading" width="70%" />
            <Skeleton variant="text-sm" width="50%" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * SkeletonList - Skeleton for list/menu items
 * 
 * @param {number} items - Number of list items
 * @param {boolean} showAvatar - Show avatar in each item
 */
export function SkeletonList({ 
  items = 5, 
  showAvatar = true,
  className = ''
}) {
  return (
    <div className={`skeleton-list ${className}`} aria-hidden="true">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="skeleton-list-item">
          {showAvatar && <Skeleton variant="avatar" />}
          <div className="skeleton-list-item__content">
            <Skeleton variant="text" width={`${70 + Math.random() * 20}%`} />
            <Skeleton variant="text-sm" width={`${40 + Math.random() * 30}%`} />
          </div>
          <Skeleton variant="icon" />
        </div>
      ))}
    </div>
  );
}

/**
 * SkeletonChart - Skeleton placeholder for charts
 */
export function SkeletonChart({ 
  height = '300px',
  className = ''
}) {
  return (
    <div 
      className={`skeleton-card ${className}`} 
      style={{ height, display: 'flex', flexDirection: 'column' }}
      aria-hidden="true"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Skeleton variant="title" width="150px" />
        <Skeleton variant="badge" width="80px" />
      </div>
      
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'flex-end', 
        gap: '12px', 
        paddingTop: '20px' 
      }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <div 
            key={i} 
            style={{ 
              flex: 1, 
              height: `${30 + Math.random() * 60}%`,
              background: 'var(--skeleton-base)',
              borderRadius: '4px 4px 0 0',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div 
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(90deg, transparent 0%, var(--skeleton-shine) 50%, transparent 100%)',
                animation: 'skeletonShimmer 1.8s ease-in-out infinite'
              }}
            />
          </div>
        ))}
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} variant="text-sm" width="30px" />
        ))}
      </div>
    </div>
  );
}

/**
 * SkeletonForm - Skeleton for form layouts
 * 
 * @param {number} fields - Number of form fields
 */
export function SkeletonForm({ 
  fields = 4,
  showTitle = true,
  className = ''
}) {
  return (
    <div className={`skeleton-card ${className}`} aria-hidden="true">
      {showTitle && (
        <div style={{ marginBottom: '20px' }}>
          <Skeleton variant="title" width="200px" />
          <Skeleton variant="text-sm" width="300px" style={{ marginTop: '8px' }} />
        </div>
      )}
      
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} style={{ marginBottom: '16px' }}>
          <Skeleton variant="text-sm" width="100px" style={{ marginBottom: '8px' }} />
          <Skeleton variant="text" height="42px" width="100%" style={{ borderRadius: '8px' }} />
        </div>
      ))}
      
      <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
        <Skeleton variant="button" width="120px" height="44px" />
        <Skeleton variant="button" width="100px" height="44px" style={{ opacity: 0.5 }} />
      </div>
    </div>
  );
}

/**
 * SkeletonDashboard - Complete dashboard skeleton layout
 */
export function SkeletonDashboard({ className = '' }) {
  return (
    <div className={`content-loaded-stagger ${className}`} aria-hidden="true">
      {/* Stats Grid */}
      <SkeletonStats count={4} />
      
      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginTop: '24px' }}>
        <SkeletonChart height="320px" />
        <SkeletonCard lines={4} showFooter={false} />
      </div>
      
      {/* Table Section */}
      <div style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <Skeleton variant="title" width="180px" />
          <Skeleton variant="button" width="120px" />
        </div>
        <SkeletonTable rows={5} columns={5} />
      </div>
    </div>
  );
}

/**
 * SkeletonClaims - Skeleton specifically for claims list
 */
export function SkeletonClaims({ count = 5, className = '' }) {
  return (
    <div className={className} aria-hidden="true">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <Skeleton variant="heading" width="200px" />
          <Skeleton variant="text-sm" width="300px" style={{ marginTop: '8px' }} />
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Skeleton variant="button" width="140px" />
          <Skeleton variant="button" width="120px" />
        </div>
      </div>
      
      {/* Stats */}
      <SkeletonStats count={4} style={{ marginBottom: '24px' }} />
      
      {/* Claims List */}
      <div style={{ marginTop: '24px' }}>
        <SkeletonTable rows={count} columns={6} />
      </div>
    </div>
  );
}

/**
 * SkeletonPolicies - Skeleton for policies grid
 */
export function SkeletonPolicies({ count = 6, className = '' }) {
  return (
    <div className={className} aria-hidden="true">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Skeleton variant="heading" width="180px" />
        <Skeleton variant="button" width="150px" />
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '20px' 
      }}>
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} showAvatar={false} lines={4} />
        ))}
      </div>
    </div>
  );
}

export default {
  Skeleton,
  SkeletonCard,
  SkeletonTable,
  SkeletonStats,
  SkeletonList,
  SkeletonChart,
  SkeletonForm,
  SkeletonDashboard,
  SkeletonClaims,
  SkeletonPolicies
};
