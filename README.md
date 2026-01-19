# InsurAI - Corporate Policy Automation and Intelligence System

[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.5-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📋 Overview

**InsurAI** is an enterprise-grade Corporate Policy Automation and Intelligence System designed to streamline insurance policy management, claims processing, and employee benefits administration within corporate environments.

---

## 🏗️ Repository Structure

```
InsurAI-Corporate-Policy-Automation-and-Intelligence-System/
└── Insurai-backend/          # Spring Boot Backend Application
    ├── src/
    │   ├── main/
    │   │   ├── java/com/insurai/insurai_backend/
    │   │   │   ├── config/           # Security, JWT, CORS Configuration
    │   │   │   ├── controller/       # REST API Controllers
    │   │   │   ├── model/            # JPA Entities
    │   │   │   ├── repository/       # Data Access Layer
    │   │   │   └── service/          # Business Logic Layer
    │   │   └── resources/
    │   │       └── application.properties
    │   └── test/
    ├── pom.xml                # Maven Dependencies
    └── README.md              # Backend documentation
```

---

## 🚀 Key Features

- **Authentication & Authorization** - JWT-based security with role-based access control
- **Policy Management** - Complete CRUD operations for insurance policies
- **Claims Processing** - Multi-stage claim workflow with document uploads
- **Employee Query System** - Query submission and tracking
- **AI-Powered Chatbot** - Cohere AI integration for intelligent responses
- **Notifications System** - Real-time alerts and updates
- **Audit Logging** - Comprehensive activity tracking

---

## 🛠️ Technology Stack

- **Framework**: Spring Boot 3.5.5
- **Language**: Java 21
- **Security**: Spring Security + JWT
- **Database**: MySQL 8.0
- **Build Tool**: Maven
- **External Services**: Supabase S3, Cohere AI

---

## 📦 Getting Started

### Prerequisites
- Java 21+
- Maven 3.8+
- MySQL 8.0+

## 🔐 Security

- JWT-based authentication
- Role-based authorization (Employee, Agent, HR, Admin)
- BCrypt password encryption
- CORS configuration

---

## 👥 User Roles

| Role | Permissions |
|------|-------------|
| **Employee** | View policies, submit claims |
| **Agent** | Manage policies, assist employees |
| **HR** | Approve enrollments, manage policies |
| **Admin** | Full system access |

---

## 📄 License

This project is licensed under the MIT License.

---

## 🚧 Project Status
This project is under active development. Functionality may change, and bugs may be present. Ongoing updates will include fixes and feature enhancements.

---

**Version**: 2.0.0  
**Last Updated**: January 15, 2026
