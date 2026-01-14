# Employee Experience Module

This document explains how the employee experience inside `src/pages/dashboard/Employee` is built, how state flows across components, and what to consider when adapting the same UX patterns for other roles (HR, Admin, Agent, etc.).

## 1. Folder Layout

| Path | Purpose |
| --- | --- |
| `EmployeeDashboard.jsx` | Orchestrates routing, shared state, API calls, and renders the correct feature tab. |
| `EmployeeDashboard.css` | Enterprise styling system (layout grid, hero, cards, typography, responsive rules). |
| `components/EmployeeNavbar.jsx` | Top navigation bar (brand, notifications, profile chip, logout, mobile toggle). |
| `components/EmployeeSidebar.jsx` | Collapsible/hoverable primary navigation with tab badges and responsive drawer behavior. |
| `EmployeePolicies.jsx` + `EmployeePolicies.css` | Policy explorer with hero metrics, cards, modal, and PDF export. |
| `EmployeeClaims.jsx` + `EmployeeClaims.css` | Dual-view claims center (overview + submission form) with custom table, modal, uploader. |
| `EmployeeQueries.jsx` | Ask/track queries, statistics, filters, and detailed view per ticket. |
| `EmployeeNotification.jsx` + `EmployeeNotification.css` | Signal center with hero pills, tabbed filters, selectable cards, bulk drawer. |
| `EmployeeSupport.jsx` + `EmployeeSupport.css` | Support hub (agent contact, FAQs, omni-channel tiles, emergency CTA, modal). |
| `EmployeeHome.jsx`, `EmployeeQueries.jsx`, `EmployeePolicies.jsx`, etc. | Feature-specific React modules following the same visual system. |
| `Chatbot.jsx` + `Chatbot.css` | Floating assistant that answers free-form questions via backend AI. |

## 2. Application Shell

### Dashboard (`EmployeeDashboard.jsx`)
- Holds **global state**: employee profile, navigation tab, policies/claims/queries datasets, agent availability, loading flags, and derived stats.
- Centralizes **API access** via `axios` using the JWT token stored in `localStorage`. Fetchers include `fetchEmployeeData`, `fetchEmployeeClaims`, `fetchEmployeeQueries`, and `fetchAgents`.
- Computes a rich `dashboardStats` object (coverage totals, pending counts, approval rate, efficiency, risk score) and passes slices to children.
- Controls the **tab router**. `activeTab` determines which feature component renders inside `<main>`. Transition helpers (`handleTabChange`, `showNotificationAlert`) keep the UX in sync across sections.
- Provides **file download utilities** (PDF via `jsPDF`) and formatters used by downstream views.

### Navbar (`components/EmployeeNavbar.jsx`)
- Fixed header containing:
  - Mobile sidebar toggle (hidden on desktop).
  - Product branding and context copy.
  - Quick notification icon (hook for future use).
  - "User chip" with avatar initials, role label, and logout button.
- Relies purely on props from the dashboard and emits `onToggleMenu` / `onLogout` actions.

### Sidebar (`components/EmployeeSidebar.jsx`)
- Receives `navigationItems` (tab id, label, icon, badge count) from the dashboard.
- Supports **hover expansion** on desktop and dedicated open/close on mobile.
- Announces active tab via `aria-current` for accessibility and triggers `onChangeTab` on click.
- Footer includes a live-status badge plus build metadata so agents know system health.

## 3. Data & State Management

| Concern | Details |
| --- | --- |
| Auth | Token, employee id, and display name pulled from `localStorage`; absence redirects to `/employee/login`. |
| Fetch cadence | Claims, policies, queries, and agent slots are fetched on mount. Queries also refresh every 15 seconds. |
| Derived metrics | `useMemo` and `useEffect` blocks compute totals, averages, risk scores, remaining coverage, unread counts, etc. |
| Notifications | `showNotificationAlert` displays toast-like alerts and auto-dismisses after 4 seconds. State clears when switching tabs. |
| File/document handling | Policy downloads use `jsPDF`; claim uploads use `FormData` plus custom progress simulation; document URLs are normalized via `formatPublicUrl`. |

## 4. Feature Modules

### Policies (`EmployeePolicies.jsx` / `.css`)
- Hero shows **active policy count** and **monthly premium** aggregated via `useMemo`.
- Responsive card grid renders provider, coverage, premium, renewal, and benefit tags with status chips.
- "View details" opens a modal listing benefits and document links; "Download" triggers a minimal PDF export (can be swapped to shared helper).

### Claims (`EmployeeClaims.jsx` / `.css`)
- Splits UI into an **overview** (`renderClaimsList`) and a **submission form** (`renderNewClaimForm`), controlled via `activeTab` coming from the dashboard.
- Overview includes hero CTA, stats tiles, filter/search slab, custom table with action icons, and a modal that reveals full claim metadata plus documents.
- Form computes remaining coverage per policy, validates inputs, simulates upload progress bars, and surfaces contextual helpers/error text.
- Currency formatting is centralized in `formatINR`. Submission wraps `FormData` for files, supports edit mode, and refreshes the claims list afterwards.

### Queries (`EmployeeQueries.jsx`)
- Provides three sub-views: ask form, query list, and details screen (selected via `activeTab`).
- **Ask form**: selects policy, claim type, agent, and captures the question; uses `agentsAvailability` to show online/offline state and enforces required selections.
- **List view**: statistics cards, filter/search toolbar, and a responsive table with status badges, created dates, and quick actions.
- **Details view**: summarises the request, related policy/claim info, response timeline, agent metadata, and offers quick actions (print, ask new, status refresh).

### Notifications (`EmployeeNotification.jsx` / `.css`)
- Fetches user notifications every 30 seconds using the provided token and role.
- Hero region displays unread/resolved pill counters plus descriptive copy.
- Filter panel renders tab buttons (`All`, `Unread`, `Read`) with icons and counts; state drives the card grid below.
- Cards support checkbox selection, inline mark-as-read, status chips, and show timestamps. Bulk actions appear in a sticky drawer when selections are active.

### Support (`EmployeeSupport.jsx` / `.css`)
- Hero mirrors the enterprise styling with stats (agents online, categories covered).
- Primary grid houses the agent-contact workflow and FAQ explorer:
  - Agent card shows availability, dropdown to choose agents, CTA to request callback, and helper text. When no agents exist, a "Notify me" empty state displays.
  - FAQ card implements category chips, accordion, document checklist snippet, and a CTA that opens the full FAQ modal.
- Channel grid surfaces live chat and email support with contextual meta and CTA buttons.
- Emergency banner keeps hotline info persistent; CTA triggers `showNotificationAlert` warning.
- Modal (`support-modal`) lists every FAQ with category tags plus the document checklist.

### Chatbot (`Chatbot.jsx` / `.css`)
- Floating button toggles the panel; retains conversation history via `messages` state.
- Handles **local small talk** for instant replies and forwards other queries to `/employee/chatbot` with JWT auth.
- Typing indicator, auto-scroll management, and optimistic UI (user message adds instantly; bot response appended when available).

## 5. Styling Guidelines

- Each major feature owns its stylesheet to prevent bleed (`EmployeeClaims.css`, `EmployeeNotification.css`, etc.).
- Styles favor **glassmorphism-inspired cards**, pill buttons, subtle gradients, and uppercase kicker text, matching the rest of the enterprise suite.
- Variables inside each CSS file declare palette tokens (`--claims-primary`, `--support-danger`, etc.) so re-theming per role is straightforward.
- Bootstrap Icons provide glyphs, but Bootstrap layout utilities are intentionally avoided to keep control over visuals.

## 6. Extending to Other Roles (HR, Admin, Agent)

1. **Duplicate the shell**: Copy `EmployeeDashboard.jsx` and rename to the target role. Replace API endpoints and stats logic with role-specific data.
2. **Adjust navigation items**: Update `navigationItems` to expose the correct tab set and badge counters.
3. **Swap feature modules**: Replace Employee-specific imports (`EmployeeClaims`, etc.) with HR/Admin equivalents while keeping the same prop contract when feasible.
4. **Reuse styling tokens**: Either reuse the CSS files (for consistent look) or clone them and tweak `--color` variables for the new role brand.
5. **Hook into role-specific services**: Update fetch helpers to hit HR/Admin endpoints. The pattern of storing tokens, using `axios`, and refreshing data on intervals remains identical.
6. **Maintain shared patterns**: Toast notifications, responsive sidebar, hero structure, and modular cards should stay consistent so agents instantly recognize the interface regardless of role.

## 7. Implementation Tips

- Keep **all API URLs** centralized inside each feature module so swapping environments (dev/stage/prod) is easier.
- When adding new metrics, update both the `dashboardStats` object and any consumers (stat cards, hero pills, etc.).
- For new tabs, ensure `navigationItems` includes the entry and handle it in the `main` switch statement inside `EmployeeDashboard.jsx`.
- Prefer **pure props** for components (e.g., Navbar, Sidebar) so they can be reused by other modules without importing dashboard state directly.
- If you introduce additional real-time features, colocate interval setup/cleanup in `useEffect` within `EmployeeDashboard.jsx` to avoid memory leaks.

By following the structure outlined above, other teams (HR, Admin, Agents) can reuse the same architectural patterns while plugging in their own features and data sources. This README should serve as the onboarding guide for replicating the employee experience across the rest of InsurAI’s enterprise suite.
