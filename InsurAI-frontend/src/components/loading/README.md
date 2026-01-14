# InsurAI Loading System

A comprehensive, enterprise-grade loading animation system designed for professional SaaS applications.

## Overview

The loading system provides consistent, modern, and premium loading experiences across the entire InsurAI platform. It automatically adapts to the application's design language and role-based themes (Employee, HR, Agent, Admin).

## Installation

The loading system is already integrated into the application. Import components as needed:

```jsx
import { 
  // Loaders
  AppLoader, 
  SectionLoader, 
  InlineSpinner, 
  LoadingDots,
  PageTransition,
  
  // Skeletons
  Skeleton,
  SkeletonCard,
  SkeletonTable,
  SkeletonStats,
  SkeletonList,
  SkeletonChart,
  SkeletonForm,
  SkeletonDashboard,
  SkeletonClaims,
  SkeletonPolicies,
  
  // Button
  LoadingButton,
  
  // Context & Hooks
  LoadingProvider,
  useLoading,
  useComponentLoading,
  LOADING_TYPES
} from '../components/loading';
```

## Components

### 1. AppLoader

Full-screen loading animation for app initialization.

```jsx
<AppLoader 
  isVisible={!isAppReady} 
  message="Initializing..."
  brandName="InsurAI"
/>
```

**Props:**
- `isVisible` (boolean): Controls visibility
- `message` (string): Loading message to display
- `brandName` (string): Brand name in the logo

**Use When:**
- Initial app boot
- First authentication check
- Major route initialization

---

### 2. SectionLoader

Overlay loader for sections and panels.

```jsx
<div className="loading-container">
  <SectionLoader isVisible={loading} message="Loading data..." />
  {/* Your content */}
</div>
```

**Props:**
- `isVisible` (boolean): Controls visibility
- `message` (string): Optional loading message
- `size` (string): 'sm' | 'md' | 'lg'

**Use When:**
- Data fetching in specific sections
- Modal content loading
- Panel refreshes

---

### 3. InlineSpinner

Small spinner for inline use.

```jsx
<button disabled={loading}>
  {loading && <InlineSpinner size="sm" variant="white" />}
  {loading ? 'Saving...' : 'Save'}
</button>
```

**Props:**
- `size` (string): 'sm' | 'md' | 'lg'
- `variant` (string): 'primary' | 'white'

---

### 4. LoadingDots

Animated dots for text-based loading indicators.

```jsx
<span>Processing <LoadingDots /></span>
```

**Use When:**
- Chat/message loading
- Processing indicators
- Subtle loading states

---

### 5. LoadingButton

Button component with built-in loading state.

```jsx
<LoadingButton
  loading={isSubmitting}
  loadingText="Submitting..."
  variant="primary"
  onClick={handleSubmit}
>
  Submit
</LoadingButton>
```

**Props:**
- `loading` (boolean): Loading state
- `loadingText` (string): Text shown while loading
- `variant` (string): 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent'
- `size` (string): 'sm' | 'md' | 'lg'

---

## Skeleton Components

### Skeleton

Base skeleton element with variants.

```jsx
<Skeleton variant="text" />
<Skeleton variant="avatar" />
<Skeleton variant="button" width="120px" />
```

**Variants:**
- `text`, `text-sm`, `text-lg`
- `title`, `heading`
- `avatar`, `avatar-lg`
- `button`, `badge`
- `image`, `icon`

---

### SkeletonCard

Pre-built skeleton for card layouts.

```jsx
<SkeletonCard 
  showAvatar={true} 
  showFooter={true} 
  lines={3} 
/>
```

---

### SkeletonTable

Skeleton for table layouts.

```jsx
<SkeletonTable 
  rows={5} 
  columns={4} 
  showHeader={true} 
/>
```

---

### SkeletonStats

Grid of stat card skeletons.

```jsx
<SkeletonStats count={4} />
```

---

### SkeletonDashboard

Complete dashboard skeleton layout.

```jsx
{loading ? <SkeletonDashboard /> : <Dashboard />}
```

---

## Context & Hooks

### LoadingProvider

Wrap your app to enable global loading state management.

```jsx
<LoadingProvider>
  <App />
</LoadingProvider>
```

### useLoading Hook

Full access to loading context.

```jsx
const { 
  startLoading, 
  stopLoading, 
  isLoading, 
  isAnyLoading 
} = useLoading();

// Start loading with unique key
startLoading('fetchUsers', LOADING_TYPES.DATA_FETCH, 'Loading users...');

// Check specific loading state
if (isLoading('fetchUsers')) {
  // Show loader
}

// Stop loading
stopLoading('fetchUsers');
```

### useComponentLoading Hook

Simplified loading for components.

```jsx
const { start, stop, loading, message } = useComponentLoading('myComponent');

const fetchData = async () => {
  start('Loading data...');
  try {
    await api.getData();
  } finally {
    stop();
  }
};
```

---

## CSS Classes

### Utility Classes

```css
/* Container for section loaders */
.loading-container { position: relative; min-height: 100px; }

/* Hide content while loading */
.loading-hidden { opacity: 0; visibility: hidden; }

/* Smooth content appearance */
.content-loaded { animation: contentFadeIn 400ms ease-out; }

/* Staggered children animation */
.content-loaded-stagger > * { animation: contentFadeIn 400ms ease-out; }
```

### Button Loading State

Add `btn-loading` class to any button:

```jsx
<button className={`my-btn ${loading ? 'btn-loading' : ''}`}>
  {loading ? 'Loading...' : 'Submit'}
</button>
```

---

## Theme Integration

The loading system automatically adapts to role-based themes:

- **Employee Dashboard**: Indigo & Coral (`--emp-primary`)
- **Admin Dashboard**: Royal Blue & Violet (`--admin-primary`)
- **Agent Dashboard**: Emerald & Amber (`--agent-primary`)
- **HR Dashboard**: Purple & Lavender

No manual configuration needed - colors are picked up from CSS variables.

---

## Accessibility

All loading components include:

- Proper ARIA attributes (`aria-busy`, `aria-label`, `role="progressbar"`)
- Reduced motion support (`prefers-reduced-motion`)
- Sufficient color contrast
- Screen reader announcements

---

## Best Practices

### DO:
✅ Use skeleton loaders for content areas (tables, cards, lists)
✅ Use inline spinners for button actions
✅ Show loading immediately when fetching data
✅ Preserve layout dimensions during loading
✅ Use meaningful loading messages

### DON'T:
❌ Block the entire UI unnecessarily
❌ Use multiple full-screen loaders
❌ Show loading for instant interactions
❌ Use flashy or distracting animations
❌ Forget to handle loading state errors

---

## Examples

### Dashboard with Skeleton Loading

```jsx
function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchDashboardData()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <SkeletonDashboard />;
  }

  return (
    <div className="content-loaded">
      {/* Dashboard content */}
    </div>
  );
}
```

### Form with Loading Button

```jsx
function ContactForm() {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitForm();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <LoadingButton
        type="submit"
        loading={submitting}
        loadingText="Sending..."
        variant="primary"
      >
        Send Message
      </LoadingButton>
    </form>
  );
}
```

### Table with Section Loader

```jsx
function DataTable() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="loading-container">
      <SectionLoader isVisible={loading} message="Refreshing..." />
      <table>
        {/* Table content */}
      </table>
    </div>
  );
}
```

---

## File Structure

```
src/components/loading/
├── index.js              # Main exports
├── LoadingContext.jsx    # Context & hooks
├── Loaders.jsx           # Loader components
├── Skeletons.jsx         # Skeleton components
├── LoadingButton.jsx     # Button component
├── LoadingStyles.css     # All styles
└── README.md             # This documentation
```
