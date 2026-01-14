import React from 'react';
import { InlineSpinner } from './Loaders';

/**
 * LoadingButton - Enterprise-grade button with built-in loading state
 * 
 * @param {boolean} loading - Whether the button is in loading state
 * @param {string} loadingText - Text to show while loading (optional)
 * @param {string} variant - Button variant (primary, secondary, outline, ghost)
 * @param {string} size - Button size (sm, md, lg)
 * @param {boolean} disabled - Whether button is disabled
 * @param {string} className - Additional CSS classes
 * @param {React.ReactNode} children - Button content
 */
export function LoadingButton({
  loading = false,
  loadingText,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  type = 'button',
  onClick,
  children,
  ...props
}) {
  const isDisabled = disabled || loading;
  
  const baseClasses = [
    'loading-btn',
    `loading-btn--${variant}`,
    `loading-btn--${size}`,
    loading ? 'loading-btn--loading' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={baseClasses}
      disabled={isDisabled}
      onClick={onClick}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <span className="loading-btn__content">
          <InlineSpinner 
            size={size === 'sm' ? 'sm' : 'md'} 
            variant={variant === 'primary' || variant === 'accent' ? 'white' : 'primary'} 
          />
          {loadingText && <span className="loading-btn__text">{loadingText}</span>}
        </span>
      ) : (
        children
      )}
    </button>
  );
}

/**
 * ButtonGroup - Group of buttons with consistent loading states
 */
export function ButtonGroup({ children, className = '' }) {
  return (
    <div className={`loading-btn-group ${className}`}>
      {children}
    </div>
  );
}

export default LoadingButton;
