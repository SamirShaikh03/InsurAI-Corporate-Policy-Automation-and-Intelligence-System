change# Changelog

All notable changes to the InsurAI project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Email notifications for claim status changes
- Mobile responsive improvements
- Advanced analytics dashboard
- Bulk claim processing for HR

---

## [0.3.0] - 2024-12-29

### Added

#### Frontend Implementation for 3 New Features

##### Policy Enrollment & Lifecycle Management (Frontend)
- **Employee Dashboard**
  - `EmployeeEnrollments.jsx` - Request policy enrollment with dependent management
  - View enrollment history and track status
  - Add/remove dependents during enrollment process
  - Enrollment statistics dashboard
- **HR Dashboard**
  - `HREnrollments.jsx` - Review and approve/reject enrollment requests
  - Set effective dates and add remarks
  - View employee and dependent details
  - Pending vs processed view toggle
- **Admin Dashboard**
  - `AdminEnrollments.jsx` - Organization-wide enrollment monitoring
  - Filter by status, search by employee/policy
  - Enrollment statistics overview

##### Claim Reimbursement & Settlement Tracking (Frontend)
- **Employee Dashboard**
  - `EmployeeReimbursements.jsx` - Track reimbursement status
  - View payment method, transaction ID, and completion dates
  - Multi-stage progress tracker (Initiated → Processing → Completed)
  - Detailed reimbursement modal
- **HR Dashboard**
  - `HRReimbursements.jsx` - Initiate reimbursements for approved claims
  - Select payment method and add notes
  - View pending and historical reimbursements
- **Admin Dashboard**
  - `AdminReimbursements.jsx` - Process and complete reimbursements
  - Add transaction IDs and finalize payments
  - Multi-status filtering and search

##### Scheduled Policy Renewal Alerts (Frontend)
- **Employee Dashboard**
  - `EmployeeRenewals.jsx` - View policy renewal status
  - Urgency indicators (Critical, Warning, Attention, Normal)
  - Days-until-expiry tracking with visual progress
  - Alert banners for expiring/expired policies
- **HR Dashboard**
  - `HRRenewals.jsx` - Monitor employee policy renewals
  - Filter by days until expiry (7/15/30 days)
  - Track alert notification status
- **Admin Dashboard**
  - `AdminRenewals.jsx` - System-wide renewal management
  - Manual renewal check trigger
  - Renewal statistics by timeframe
  - Alert sending functionality

### Changed
- Updated Employee sidebar navigation with Enrollments, Reimbursements, and Renewals tabs
- Updated HR sidebar navigation with Enrollments, Reimbursements, and Renewals tabs
- Updated Admin sidebar navigation with Enrollments, Reimbursements, and Renewals tabs

---

## [0.2.0] - 2024-12-19

### Added

#### Policy Enrollment & Lifecycle Management
- **Employee Enrollment Requests**
  - Request policy enrollment with dependent management
  - Add/remove dependents during enrollment
  - Track enrollment status (Pending, Approved, Rejected)
  - View enrollment history
- **HR Enrollment Approval**
  - Review pending enrollment requests
  - Approve/reject with remarks and effective dates
  - View enrollment details with dependents
- **Admin Enrollment Oversight**
  - Monitor all enrollment requests across organization
  - System-wide enrollment analytics

#### Claim Reimbursement & Settlement Tracking
- **Multi-stage Reimbursement Workflow**
  - Pending → Processing → Completed status tracking
  - Payment method selection (Bank Transfer, Check, Digital Wallet)
  - Transaction reference tracking
- **HR Reimbursement Initiation**
  - Initiate reimbursements for approved claims
  - Set payment method and notes
  - Track reimbursement progress
- **Admin Reimbursement Processing**
  - Process pending reimbursements
  - Add transaction references
  - Finalize payments with completion dates
- **Employee Reimbursement Tracking**
  - View reimbursement status for all claims
  - Track payment details and transaction IDs
  - Estimated completion dates

#### Scheduled Policy Renewal Alerts & Auto-Expiry Management
- **Automated Renewal Notifications**
  - System checks for upcoming policy renewals daily
  - Alerts sent at 30, 15, and 7 days before expiry
  - Notifications to both HR and affected employees
- **Auto-Expiry Management**
  - Automatic policy status update to "Expired" after renewal date
  - Prevents coverage gaps through proactive alerts
- **Admin Renewal Configuration**
  - Configure renewal alert schedules
  - View upcoming renewals dashboard
  - Manual renewal processing

### Technical Improvements
- **Java 21 Compatibility**
  - Updated Maven compiler plugin to version 3.11.0
  - Configured explicit JDK 21 compiler path
  - Downgraded Lombok to 1.18.34 for better JDK 21 compatibility
  - Created `run-app.bat` script for easy Windows execution
  - Added `JAVA_SETUP_GUIDE.md` for JDK configuration

### Database Schema Changes
- Added `enrollments` table with dependent management
- Added `reimbursements` table with payment tracking
- Added `renewals` table for renewal alert management
- Added new notification types for enrollment, reimbursement, and renewal
- Added new audit log actions for lifecycle tracking

### API Endpoints Added
- **Enrollment APIs** (15+ endpoints)
  - `POST /employee/enrollments/request` - Request policy enrollment
  - `GET /employee/enrollments/my` - View employee's enrollments
  - `GET /hr/enrollments/pending` - HR pending enrollments
  - `POST /hr/enrollments/{id}/approve` - Approve enrollment
  - `POST /hr/enrollments/{id}/reject` - Reject enrollment
  - `GET /admin/enrollments/all` - Admin enrollment overview
  
- **Reimbursement APIs** (12+ endpoints)
  - `GET /employee/reimbursements/my` - View employee's reimbursements
  - `POST /hr/reimbursements/initiate` - HR initiate reimbursement
  - `GET /hr/reimbursements/pending` - HR pending reimbursements
  - `POST /admin/reimbursements/{id}/process` - Admin process reimbursement
  - `POST /admin/reimbursements/{id}/complete` - Finalize payment
  
- **Renewal APIs** (8+ endpoints)
  - `GET /admin/renewals/upcoming` - View upcoming renewals
  - `POST /admin/renewals/check` - Trigger renewal check
  - `GET /hr/renewals/my-employees` - HR employee renewals
  - `GET /employee/renewals/my-policies` - Employee policy renewals

### Fixed
- Resolved JDK 25 compilation errors by enforcing JDK 21
- Fixed Lombok annotation processor compatibility issues
- Corrected Maven compiler plugin configuration for Windows paths

---

## [0.1.0] - 2024-12-18

### Added

#### Authentication & Authorization
- JWT-based authentication for all user roles (Employee, HR, Agent, Admin)
- Role-specific JWT filters (`EmployeeJwtAuthenticationFilter`, `HrJwtAuthenticationFilter`, `AgentJwtAuthenticationFilter`, `AdminJwtAuthenticationFilter`)
- Password reset functionality with email token verification
- Secure password encoding using BCrypt

#### Employee Features
- Employee registration and login
- View active insurance policies with documentation
- Submit insurance claims with document attachments
- Track claim status (Pending, Approved, Rejected)
- AI-powered chatbot for policy queries (Cohere API integration)
- Submit queries to available support agents
- In-app notifications for claim updates

#### HR Features
- HR login (registration via Admin)
- View and manage assigned claims
- Approve/reject claims with remarks
- View fraud-flagged claims
- Access to reports and analytics
- Employee management view

#### Agent Features
- Agent registration and login
- Set availability status (online/offline with scheduling)
- View and respond to employee queries
- Query management dashboard

#### Admin Features
- Admin login
- Full CRUD operations for insurance policies
- Policy document upload (contract, terms, claim form, annexure)
- Register HR and Agent users
- View all claims across the system
- View fraud-flagged claims
- Audit log viewing for compliance

#### Core System
- Policy management with multiple document types
- Claims processing with HR assignment
- Fraud detection and flagging system
- Comprehensive audit logging
- In-app notification system
- Supabase S3 integration for document storage
- CORS configuration for frontend-backend communication

#### Frontend
- React 19 with Vite build system
- Role-based routing with protected routes
- Bootstrap 5 UI components
- Chart.js and Recharts for analytics visualization
- Framer Motion animations
- Responsive dashboard layouts

### Technical Stack
- **Backend**: Spring Boot 3.5.5, Java 21, Spring Security, Spring Data JPA
- **Frontend**: React 19.1.1, Vite 7.1.2, React Router 6.30.1
- **Database**: MySQL 8.x
- **Authentication**: JWT (jjwt 0.11.5)
- **Storage**: Supabase S3
- **AI**: Cohere API for chatbot

---

## Version History Template

### [X.Y.Z] - YYYY-MM-DD

#### Added
- New features

#### Changed
- Changes to existing functionality

#### Deprecated
- Features to be removed in future versions

#### Removed
- Features removed in this version

#### Fixed
- Bug fixes

#### Security
- Security improvements or vulnerability fixes

