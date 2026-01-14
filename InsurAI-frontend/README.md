# InsurAI Frontend - React Application

## Overview

This is the **frontend application** for the **InsurAI - Corporate Policy Automation and Intelligence System**. Built with **React 19** and **Vite**, it provides a modern, responsive, and role-based user interface for managing insurance policies, claims, queries, and AI-powered assistance.

The application serves **four distinct user roles**: Employee, HR, Agent, and Admin, each with specialized dashboards and features.

---

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.1.1 | Core UI framework |
| **Vite** | 7.1.2 | Build tool and dev server |
| **React Router DOM** | 6.30.1 | Client-side routing |
| **Axios** | 1.11.0 | HTTP client for API calls |
| **Bootstrap** | 5.3.8 | UI framework & components |
| **React Bootstrap** | 2.10.10 | Bootstrap components for React |
| **Bootstrap Icons** | 1.13.1 | Icon library |
| **Lucide React** | 0.542.0 | Modern icon library |
| **Chart.js** | 4.5.0 | Data visualization |
| **React Chartjs 2** | 5.3.0 | React wrapper for Chart.js |
| **Recharts** | 3.2.1 | Alternative charting library |
| **Framer Motion** | 12.23.24 | Animation library |
| **jsPDF** | 2.5.1 | PDF generation |
| **jsPDF AutoTable** | 3.5.25 | Table support for jsPDF |
| **React CSV** | 2.2.2 | CSV export functionality |
| **XLSX** | 0.18.5 | Excel file handling |
| **PapaParse** | 5.5.3 | CSV parsing |
| **ESLint** | 9.33.0 | Code linting |

---

## Features by Role

### 🧑‍💼 Employee Portal
- **Authentication**: Register, Login, Forgot/Reset Password
- **Policy Management**: View all available insurance policies
- **Claims Submission**: Submit claims with document uploads (PDF, images)
- **Claim Tracking**: Real-time claim status monitoring
- **Policy Enrollment**: Request enrollment with dependent details
- **Reimbursement Tracking**: View payment status and settlement details
- **AI Chatbot**: Get instant answers to policy and claim questions (powered by Cohere AI)
- **Query Support**: Submit queries to available agents
- **Notifications**: Receive real-time updates on claims and policies
- **Renewal Alerts**: Get notified 30/15/7 days before policy expiry

### 👔 HR Dashboard
- **Claims Review**: Approve/Reject employee claims
- **Enrollment Approval**: Manage policy enrollment requests
- **Reimbursement Processing**: Initiate claim reimbursements
- **Fraud Detection**: Review flagged claims
- **Employee Management**: View and manage employee records
- **Analytics**: Claims statistics and trends
- **Renewal Management**: Track upcoming policy renewals

### 🎧 Agent Portal
- **Query Management**: View and respond to employee queries
- **Availability Management**: Set online/offline status with scheduled hours
- **Query History**: Track resolved and pending queries
- **Resources**: Access claim guidelines and policy documents

### 🔧 Admin Console
- **Policy CRUD**: Create, update, delete policies with document uploads
- **User Management**: Register HR and Agent users
- **Enrollment Overview**: Monitor all enrollment requests
- **Reimbursement Dashboard**: Process and finalize payments
- **Fraud Claims**: System-wide fraud detection overview
- **Audit Logs**: Compliance and activity tracking
- **Analytics & Reports**: System-wide statistics and insights
- **Renewal Configuration**: Configure automated alert schedules

---

## Project Structure

```
insurai-frontend/
│
├── public/
│   └── vite.svg
│
├── src/
│   ├── assets/           # Static assets (images, icons)
│   │   └── react.svg
│   │
│   ├── pages/
│   │   ├── Homepage.jsx  # Landing page with role selection
│   │   │
│   │   ├── auth/         # Authentication pages
│   │   │   ├── EmployeeRegister.jsx
│   │   │   ├── EmployeeLogin.jsx
│   │   │   ├── AdminLogin.jsx
│   │   │   ├── AdminRegister.jsx
│   │   │   ├── AgentLogin.jsx
│   │   │   ├── AgentRegister.jsx
│   │   │   ├── HRLogin.jsx
│   │   │   ├── HRRegister.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   └── ResetPassword.jsx
│   │   │
│   │   └── dashboard/    # Role-based dashboards
│   │       ├── Dashboard.css
│   │       │
│   │       ├── Employee/
│   │       │   ├── EmployeeDashboard.jsx
│   │       │   ├── EmployeeDashboard.css
│   │       │   ├── EmployeeHome.jsx
│   │       │   ├── EmployeePolicies.jsx
│   │       │   ├── EmployeeClaims.jsx
│   │       │   ├── Chatbot.jsx
│   │       │   ├── EmployeeQueries.jsx
│   │       │   ├── EmployeeSupport.jsx
│   │       │   └── EmployeeNotifications.jsx
│   │       │
│   │       ├── Hr/
│   │       │   ├── HRDashboard.jsx
│   │       │   ├── HRClaims.jsx
│   │       │   ├── HREmployees.jsx
│   │       │   ├── HRFraud.jsx
│   │       │   └── HRNotification.jsx
│   │       │
│   │       ├── Agent/
│   │       │   ├── AgentDashboard.jsx
│   │       │   ├── AgentQueries.jsx
│   │       │   ├── AgentAvailability.jsx
│   │       │   ├── AgentResources.jsx
│   │       │   └── AgentReports.jsx
│   │       │
│   │       └── Admin/
│   │           ├── AdminDashboard.jsx
│   │           ├── AdminPolicy.jsx
│   │           ├── AdminUserManagement.jsx
│   │           ├── AdminAllClaims.jsx
│   │           ├── AdminFraudClaims.jsx
│   │           ├── AdminAuditLogs.jsx
│   │           └── AdminReportsAnalytics.jsx
│   │
│   ├── api.js            # Axios instance with JWT interceptor
│   ├── App.jsx           # Main app component with routing
│   ├── App.css           # Global app styles
│   ├── main.jsx          # Application entry point
│   ├── index.css         # Global styles
│   └── PrivateRoute.jsx  # Route protection wrapper
│
├── index.html            # HTML entry point
├── package.json          # Dependencies and scripts
├── vite.config.js        # Vite configuration
├── eslint.config.js      # ESLint configuration
└── README.md             # This file
```

---

## Getting Started

### Prerequisites

- **Node.js**: v18+ (recommended: v20+)
- **npm**: v9+ or **yarn**: v1.22+
- **Backend**: InsurAI backend must be running on `http://localhost:8080`

### Installation

1. **Clone the repository** (if not already cloned):
   ```bash
   git clone <repository-url>
   cd InsurAI-Project/insurai-frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure API endpoint** (if needed):
   - Open `src/api.js`
   - Update `baseURL` if backend is on a different host:
     ```javascript
     const API = axios.create({
       baseURL: "http://localhost:8080", // Change if needed
     });
     ```

### Running the Application

#### Development Mode
```bash
npm run dev
```
- Application will start on: **http://localhost:5173**
- Features hot module replacement (HMR)

#### Production Build
```bash
npm run build
```
- Outputs to `dist/` folder
- Optimized for production

#### Preview Production Build
```bash
npm run preview
```
- Preview the production build locally

#### Linting
```bash
npm run lint
```

---

## Authentication Flow

### Registration
1. User selects role (Employee/HR/Agent/Admin) on Homepage
2. Fills registration form with required details
3. Backend validates and creates user account
4. User redirected to login page

### Login
1. User enters email and password
2. Backend validates credentials
3. On success, JWT token and role are stored in `localStorage`
4. User redirected to role-specific dashboard

### Protected Routes
- All dashboard routes are protected by `PrivateRoute` wrapper
- Checks for valid JWT token in `localStorage`
- Validates user role matches route requirement
- Redirects to homepage if unauthorized

### Token Management
- JWT token automatically attached to all API requests via Axios interceptor
- Stored in `localStorage.token`
- User role stored in `localStorage.role`

---

## API Integration

### Axios Configuration (`src/api.js`)

```javascript
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

// Auto-attach JWT token to every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
```

### Example API Call

```javascript
import API from "../api";

// GET request
const fetchPolicies = async () => {
  try {
    const response = await API.get("/api/employee/policies");
    return response.data;
  } catch (error) {
    console.error("Error fetching policies:", error);
  }
};

// POST request with file upload
const submitClaim = async (formData) => {
  try {
    const response = await API.post("/api/employee/claims/submit", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data;
  } catch (error) {
    console.error("Error submitting claim:", error);
  }
};
```

---

## Key Components

### PrivateRoute Component
Protects authenticated routes and enforces role-based access:

```javascript
function PrivateRoute({ children, role }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  if (!token) return <Navigate to="/" replace />;
  if (role && userRole?.toLowerCase() !== role.toLowerCase()) {
    return <Navigate to="/" replace />;
  }

  return children;
}
```

### Dashboard Layout
Each role has a dedicated dashboard with sidebar navigation:
- **Sidebar**: Role-specific menu items
- **Main Content**: Dynamic content based on selected menu
- **Header**: User info, notifications, logout

---

## State Management

This application uses **React's built-in state management**:
- `useState` for local component state
- `useEffect` for side effects and API calls
- `localStorage` for persistent auth data

**No external state library** (Redux, Zustand) is used to keep the app lightweight.

---

## Styling

- **Bootstrap 5.3.8**: Primary UI framework
- **Custom CSS**: Component-specific styles in `.css` files
- **Bootstrap Icons & Lucide React**: Icon libraries
- **Framer Motion**: Smooth animations and transitions

---

## File Upload Handling

Claims and policies support document uploads:
- **Accepted formats**: PDF, JPG, JPEG, PNG
- **Max size**: 10MB (configurable in backend)
- **Storage**: Supabase S3 via backend
- **Preview**: React PDF for document preview

Example:
```javascript
const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file && file.size <= 10 * 1024 * 1024) { // 10MB limit
    setSelectedFile(file);
  } else {
    alert("File too large. Max 10MB allowed.");
  }
};
```

---

## Charts & Data Visualization

- **Chart.js**: Bar, line, pie charts for analytics
- **Recharts**: Alternative charting library with responsive design
- Used in Admin and HR dashboards for:
  - Claims statistics
  - Fraud detection trends
  - Policy enrollment analytics
  - Reimbursement tracking

---

## Export Functionality

### PDF Export (jsPDF)
```javascript
import jsPDF from "jspdf";
import "jspdf-autotable";

const exportToPDF = () => {
  const doc = new jsPDF();
  doc.text("Claims Report", 14, 20);
  doc.autoTable({
    head: [["ID", "Policy", "Status", "Amount"]],
    body: claimsData.map(c => [c.id, c.policyName, c.status, c.amount])
  });
  doc.save("claims-report.pdf");
};
```

### CSV Export (React CSV)
```javascript
import { CSVLink } from "react-csv";

<CSVLink data={claimsData} filename="claims.csv">
  Export to CSV
</CSVLink>
```

### Excel Export (XLSX)
```javascript
import * as XLSX from "xlsx";

const exportToExcel = () => {
  const ws = XLSX.utils.json_to_sheet(claimsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Claims");
  XLSX.writeFile(wb, "claims.xlsx");
};
```

---

## Environment Variables

This project uses **Vite's environment variables**:

Create `.env` file in root:
```env
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_NAME=InsurAI
```

Access in code:
```javascript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

---

## Routing Structure

```
/                          → Homepage (role selection)
/employee/register         → Employee registration
/employee/login            → Employee login
/employee/forgot-password  → Password recovery
/employee/reset-password/:token → Password reset
/employee/dashboard        → Employee dashboard (protected)

/hr/login                  → HR login
/hr/dashboard              → HR dashboard (protected)

/agent/login               → Agent login
/agent/dashboard           → Agent dashboard (protected)

/admin/login               → Admin login
/admin/dashboard           → Admin dashboard (protected)
/admin/policy              → Policy management (protected)
/admin/register-agent      → Register new agent (protected)
```

---

## Development Guidelines

### Code Style
- Use **functional components** with hooks
- Use **arrow functions** for consistency
- Use **async/await** for async operations
- Keep components **small and focused**

### Component Structure
```javascript
import React, { useState, useEffect } from "react";
import API from "../../api";

const ComponentName = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await API.get("/api/endpoint");
      setData(response.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {/* Component JSX */}
    </div>
  );
};

export default ComponentName;
```

### Error Handling
- Always use try-catch for API calls
- Display user-friendly error messages
- Log errors to console for debugging

---

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## Performance Optimization

- **Vite**: Lightning-fast HMR and optimized builds
- **Code Splitting**: Routes loaded on demand via React Router
- **Lazy Loading**: Images and heavy components loaded when needed
- **Memoization**: Use `useMemo` and `useCallback` for expensive operations

---

## Troubleshooting

### Issue: API calls fail with CORS error
**Solution**: Ensure backend has CORS configured for `http://localhost:5173`

### Issue: 401 Unauthorized errors
**Solution**: Check if JWT token exists in localStorage and hasn't expired

### Issue: Build fails
**Solution**: Clear `node_modules` and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Port 5173 already in use
**Solution**: Change port in `vite.config.js`:
```javascript
export default defineConfig({
  server: { port: 3000 }
});
```

---

## Future Enhancements

- [ ] TypeScript migration for type safety
- [ ] Redux Toolkit for complex state management
- [ ] React Query for better API caching
- [ ] PWA support for offline functionality
- [ ] E2E testing with Cypress
- [ ] Storybook for component documentation
- [ ] Dark mode support
- [ ] Internationalization (i18n)

---

## Contributing

1. Create a feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

---

## License

This project is part of an internship project for InsurAI.

---

## Support

For issues or questions:
- Check backend logs: `Insurai-backend/logs`
- Verify API connectivity
- Ensure all dependencies are installed
- Check browser console for errors

---

## Related Documentation

- [Main Project README](../README.md)
- [Backend README](../Insurai-backend/README.md)
- [API Documentation](../docs/api.md)
- [Architecture Documentation](../docs/architecture.md)
- [Setup Guide](../docs/setup.md)

---

**Built with ❤️ using React + Vite**
