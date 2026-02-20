# InsurAI - Corporate Policy Automation and Intelligence System

[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.5-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Database Configuration](#database-configuration)
- [User Roles & Permissions](#user-roles--permissions)
- [Security](#security)
- [How It Works](#how-it-works)
- [License](#license)
- [Project Status](#project-status)
- [Contributing](#contributing)

<a id="overview"></a>

## 📋 Overview

**InsurAI** is an enterprise-grade Corporate Policy Automation and Intelligence System designed to streamline insurance policy management, claims processing, and employee benefits administration within corporate environments.

---

<a id="features"></a>

## ✨ Features

### Core Features

| Feature | Description |
|---------|-------------|
| **Multi-Role Authentication** | Secure JWT-based authentication for Employees, Agents, HR, and Admins |
| **Policy Management** | Create, update, and manage insurance policies with document uploads |
| **Claims Processing** | Submit, track, approve/reject insurance claims with automated fraud detection |
| **Employee Query System** | Employees can raise queries which are handled by agents |
| **AI-Powered Chatbot** | Integrated Cohere AI chatbot for employee assistance |
| **Notification System** | In-app notifications for claim updates and important events |
| **Audit Logging** | Complete audit trail of all system activities |
| **Document Management** | Secure file uploads to Supabase S3 storage |
| **Fraud Detection** | Automated fraud flagging system for suspicious claims |

---

<a id="technology-stack"></a>

## 🛠 Technology Stack

### Backend
- **Framework:** Spring Boot 3.5.5
- **Language:** Java 21
- **Security:** Spring Security with JWT Authentication
- **ORM:** Spring Data JPA with Hibernate
- **Database:** MySQL
- **Validation:** Spring Boot Validation
- **Build Tool:** Maven

### External Services
- **Cloud Storage:** Supabase S3 (for document storage)
- **AI Integration:** Cohere API (for chatbot)
- **Email Service:** SMTP (Gmail)

### Key Libraries
- **JWT:** jjwt-api 0.11.5
- **HTTP Client:** Unirest 3.13.6
- **AWS SDK:** 2.20.38 (for S3 operations)
- **Lombok:** For reducing boilerplate code

---

<a id="architecture"></a>

## 🏗 Architecture

The application follows a **layered architecture** pattern:

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                         │
├─────────────────────────────────────────────────────────────┤
│                         REST API                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │             │  │   Security  │  │ JWT Auth Filters    │  │
│  │ Controllers │  │   Config    │  │ (Employee/HR/Admin/ │  │
│  │             │  │             │  │  Agent)             │  │
│  └──────┬──────┘  └─────────────┘  └─────────────────────┘  │
│         │                                                   │
│  ┌──────▼──────┐                                            │
│  │  Services   │      (Business Logic Layer)                │
│  └──────┬──────┘                                            │
│         │                                                   │
│  ┌──────▼──────┐                                            │
│  │Repositories │      (Data Access Layer - JPA)             │
│  └──────┬──────┘                                            │
│         │                                                   │
├─────────▼───────────────────────────────────────────────────┤
│                     MySQL Database                          │
└─────────────────────────────────────────────────────────────┘
```

---

<a id="project-structure"></a>

## 📁 Project Structure

```
insurai-backend/
├── src/
│   ├── main/
│   │   ├── java/com/insurai/insurai_backend/
│   │   │   ├── InsuraiBackendApplication.java                  # Main entry point
│   │   │   │
│   │   │   ├── config/                                         # Configuration classes
│   │   │   │   ├── SecurityConfig.java                         # Spring Security configuration
│   │   │   │   ├── JwtUtil.java                                # JWT token utilities
│   │   │   │   ├── EmployeeJwtAuthenticationFilter.java
│   │   │   │   ├── AgentJwtAuthenticationFilter.java
│   │   │   │   ├── HrJwtAuthenticationFilter.java
│   │   │   │   ├── AdminJwtAuthenticationFilter.java
│   │   │   │   ├── CorsConfig.java                             # CORS configuration
│   │   │   │   ├── PasswordConfig.java                         # Password encoder config
│   │   │   │   └── WebConfig.java                              # Web MVC configuration
│   │   │   │
│   │   │   ├── controller/                                     # REST API Controllers
│   │   │   │   ├── AuthController.java                         # Employee auth endpoints
│   │   │   │   ├── AdminController.java                        # Admin operations
│   │   │   │   ├── HrController.java                           # HR operations
│   │   │   │   ├── AgentController.java                        # Agent operations
│   │   │   │   ├── EmployeeController.java                     # Employee operations
│   │   │   │   ├── ClaimController.java                        # Claims management
│   │   │   │   ├── PolicyController.java                       # Policy management
│   │   │   │   ├── ChatbotController.java                      # AI Chatbot
│   │   │   │   ├── NotificationController.java                 # Notifications
│   │   │   │   └── EmployeeQueryController.java                # Employee queries
│   │   │   │
│   │   │   ├── model/                                          # Entity classes
│   │   │   │   ├── Employee.java                               # Employee entity
│   │   │   │   ├── Admin.java                                  # Admin entity
│   │   │   │   ├── Hr.java                                     # HR entity
│   │   │   │   ├── Agent.java                                  # Agent entity
│   │   │   │   ├── Policy.java                                 # Insurance policy entity
│   │   │   │   ├── Claim.java                                  # Insurance claim entity
│   │   │   │   ├── EmployeeQuery.java                          # Query entity
│   │   │   │   ├── Notification.java                           # Notification entity
│   │   │   │   ├── AuditLog.java                               # Audit log entity
│   │   │   │   └── AgentAvailability.java                      # Agent availability
│   │   │   │
│   │   │   ├── repository/                                     # JPA Repositories
│   │   │   │   └── (Repository interfaces)
│   │   │   │
│   │   │   └── service/                                        # Business Logic Services
│   │   │       ├── EmployeeService.java
│   │   │       ├── AdminService.java
│   │   │       ├── HrService.java
│   │   │       ├── AgentService.java
│   │   │       ├── ClaimService.java
│   │   │       ├── PolicyService.java
│   │   │       ├── FraudService.java
│   │   │       ├── NotificationService.java
│   │   │       ├── AuditLogService.java
│   │   │       └── SupabaseStorageService.java
│   │   │
│   │   └── resources/
│   │       └── application.properties                          # Application configuration
│   │
│   └── test/                                                   # Test classes
│
├── pom.xml                                                     # Maven dependencies
├── mvnw / mvnw.cmd                                             # Maven wrapper
└── README.md                                                   # This file
```
---

<a id="database-configuration"></a>

## 🗄 Database Configuration

### Database Schema

The application uses **JPA/Hibernate** with `ddl-auto=update`, which automatically creates/updates tables based on entity classes.

### Key Tables

| Table | Description |
|-------|-------------|
| `employees` | Employee user accounts |
| `admins` | Admin user accounts |
| `hrs` | HR user accounts |
| `agents` | Agent user accounts |
| `policies` | Insurance policy definitions |
| `claims` | Insurance claims submitted by employees |
| `employee_queries` | Queries raised by employees |
| `notifications` | System notifications |
| `audit_logs` | Activity audit trail |
| `agent_availability` | Agent availability schedules |

---

<a id="user-roles--permissions"></a>

## 👥 User Roles & Permissions

### Role Hierarchy

```
┌─────────────────┐
│     ADMIN       │  Full system access
├─────────────────┤
│       HR        │  Claims approval, fraud review
├─────────────────┤
│     AGENT       │  Query handling, availability management
├─────────────────┤
│    EMPLOYEE     │  Policy viewing, claims submission, chatbot
└─────────────────┘
```

### Role Capabilities

| Capability | Employee | Agent | HR | Admin |
|------------|:--------:|:-----:|:--:|:-----:|
| View Policies | ✅ | ❌ | ❌ | ✅ |
| Submit Claims | ✅ | ❌ | ❌ | ❌ |
| Approve/Reject Claims | ❌ | ❌ | ✅ | ✅ |
| Handle Queries | ❌ | ✅ | ❌ | ❌ |
| View Audit Logs | ❌ | ❌ | ❌ | ✅ |
| Register Users | ❌ | ❌ | ❌ | ✅ |
| Use AI Chatbot | ✅ | ❌ | ❌ | ❌ |
| Manage Policies | ❌ | ❌ | ❌ | ✅ |

---

<a id="security"></a>

## 🔐 Security

### Authentication Flow

1. **User Login** → Validates credentials
2. **JWT Token Generated** → Contains user email and role
3. **Token Sent to Client** → Stored in frontend
4. **Subsequent Requests** → Include JWT in `Authorization: Bearer <token>` header
5. **JWT Filter Validates** → Checks token validity and role permissions

### Security Features

- **JWT Authentication:** Stateless token-based authentication
- **Role-Based Access Control:** Endpoints protected based on user roles
- **Password Encryption:** BCrypt password hashing
- **CORS Configuration:** Restricted to allowed origins
- **CSRF Protection:** Disabled for REST API (JWT provides protection)

---

<a id="how-it-works"></a>

## ⚙️ How It Works

### 1. Employee Registration & Login

```
Employee → POST /auth/register → Account Created
Employee → POST /auth/login → JWT Token Received
```

### 2. Insurance Claim Workflow

```
1. Employee logs in → Gets JWT token
2. Employee views policies → GET /employee/policies
3. Employee submits claim → POST /employee/claims
   - System checks for fraud patterns
   - Claim assigned to HR (load-balanced)
   - Notification sent to HR
4. HR reviews claim → GET /hr/claims
5. HR approves/rejects → POST /hr/claims/approve/{id}
6. Employee notified → Notification created
```

### 3. Query Resolution Flow

```
1. Employee submits query → POST /employee/queries
2. Available Agent assigned
3. Agent responds → POST /agent/queries/respond/{id}
4. Employee notified
```

### 4. AI Chatbot Interaction

```
1. Employee sends message → POST /employee/chatbot
2. System analyzes message
3. Checks local data (policies, claims)
4. If needed, calls Cohere AI
5. Response returned to employee
```

### 5. Fraud Detection

```
Claim Submitted → Fraud Service Analyzes:
  - Amount vs coverage limits
  - Claim frequency
  - Suspicious patterns
→ If suspicious: fraud_flag = true, fraud_reason set
→ HR/Admin see fraud-flagged claims
```

---

<a id="license"></a>

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<a id="project-status"></a>

## 🚧 Project Status

This project is under active development. Functionality may change, and bugs may be present. Ongoing updates will include fixes and feature enhancements.

---

<a id="contributing"></a>

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

**Version**: 2.0.0  
**Last Updated**: February 20, 2026
