/**
 * InsurAI Loading System
 * 
 * A comprehensive, enterprise-grade loading animation system that provides
 * consistent, professional loading experiences across the entire application.
 * 
 * Usage:
 * 
 * 1. Wrap your app with LoadingProvider:
 *    <LoadingProvider>
 *      <App />
 *    </LoadingProvider>
 * 
 * 2. Use loading components:
 *    - AppLoader: Full-screen app initialization
 *    - SectionLoader: Overlay for sections/panels
 *    - Skeleton*: Content placeholders
 *    - InlineSpinner: Button/inline loading
 *    - LoadingDots: Subtle text loading
 *    - LoadingButton: Button with built-in loading state
 * 
 * 3. Use loading context hooks:
 *    - useLoading(): Full context access
 *    - useComponentLoading(key): Simplified component-level loading
 */

// Context & Hooks
export { 
  LoadingProvider, 
  useLoading, 
  useComponentLoading,
  LOADING_TYPES 
} from './LoadingContext';

// Loader Components
export { 
  AppLoader, 
  SectionLoader, 
  InlineSpinner, 
  LoadingDots,
  PageTransition 
} from './Loaders';

// Skeleton Components
export { 
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
} from './Skeletons';

// Button Components
export { LoadingButton, ButtonGroup } from './LoadingButton';

// Import styles when module is used
import './LoadingStyles.css';
