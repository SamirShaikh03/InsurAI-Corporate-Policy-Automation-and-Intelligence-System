import React from 'react';

/**
 * AppLoader - Full-screen loading animation for app initialization
 * 
 * Used for:
 * - Initial app boot
 * - First authentication check
 * - Major route transitions
 * 
 * Features:
 * - Brand-aligned design
 * - Smooth progress animation
 * - Accessible with ARIA attributes
 */
export function AppLoader({ 
  isVisible = true, 
  message = 'Loading...', 
  brandName = 'InsurAI' 
}) {
  return (
    <div 
      className={`app-loader ${!isVisible ? 'app-loader--hidden' : ''}`}
      role="progressbar"
      aria-label="Application loading"
      aria-busy={isVisible}
    >
      <div className="app-loader__content">
        <div className="app-loader__brand">
          <div className="app-loader__logo">
            <span className="app-loader__logo-icon">IA</span>
          </div>
          <h1 className="app-loader__title">{brandName}</h1>
        </div>
        
        <div className="app-loader__progress">
          <div className="app-loader__progress-bar" />
        </div>
        
        {message && (
          <p className="app-loader__message">{message}</p>
        )}
      </div>
    </div>
  );
}

/**
 * SectionLoader - Overlay loader for sections and panels
 * 
 * Used for:
 * - Data fetching in specific sections
 * - Modal content loading
 * - Panel refreshes
 */
export function SectionLoader({ 
  isVisible = true, 
  message = '',
  size = 'md' // sm, md, lg
}) {
  if (!isVisible) return null;
  
  return (
    <div 
      className={`section-loader ${!isVisible ? 'section-loader--hidden' : ''}`}
      role="progressbar"
      aria-label={message || 'Loading content'}
      aria-busy={isVisible}
    >
      <div className={`section-loader__spinner section-loader__spinner--${size}`} />
      {message && (
        <span className="section-loader__text">{message}</span>
      )}
    </div>
  );
}

/**
 * InlineSpinner - Small spinner for inline use
 * 
 * Used for:
 * - Button loading states
 * - Inline data refreshes
 * - Action feedback
 */
export function InlineSpinner({ 
  size = 'md', // sm, md, lg
  variant = 'primary' // primary, white
}) {
  const sizeClass = size !== 'md' ? `inline-spinner--${size}` : '';
  const variantClass = variant === 'white' ? 'inline-spinner--white' : '';
  
  return (
    <span 
      className={`inline-spinner ${sizeClass} ${variantClass}`}
      role="progressbar"
      aria-label="Loading"
    />
  );
}

/**
 * LoadingDots - Animated dots for text-based loading
 * 
 * Used for:
 * - Chat/message loading
 * - Processing indicators
 * - Subtle loading states
 */
export function LoadingDots() {
  return (
    <span className="loading-dots" role="progressbar" aria-label="Loading">
      <span className="loading-dots__dot" />
      <span className="loading-dots__dot" />
      <span className="loading-dots__dot" />
    </span>
  );
}

/**
 * PageTransition - Top bar loading animation for route changes
 */
export function PageTransition({ isVisible = false }) {
  if (!isVisible) return null;
  
  return (
    <div className="page-transition">
      <div className="page-transition__bar" />
    </div>
  );
}

export default {
  AppLoader,
  SectionLoader,
  InlineSpinner,
  LoadingDots,
  PageTransition
};
