# System Architecture: Land Evaluation and Expropriation Management System

## Architecture Overview

The Land Evaluation and Expropriation Management System is a role-based web application designed to manage land compensation projects within Nyanza District. The architecture follows a modular design where project management, PAP management, complaints, payment tracking, workflow control, and auditing responsibilities are separated into independent modules. The system prioritizes data integrity, transparency, traceability, and controlled access because it manages sensitive land ownership and public compensation information.

The system follows a traditional three-tier architecture:

Frontend Application
|
|
Backend API
|
|
Database + Supporting Services



---

# Technology Stack

| Layer | Technology | Role |
|---|---|---|
| Frontend | React.js | Build interactive user interfaces and dashboards |
| Styling | Tailwind CSS | Provide responsive and consistent UI design |
| Backend | Node.js + Express.js | Provide REST API services and business logic |
| Programming Language | TypeScript | Provide type safety and maintainable backend/frontend code |
| Database | PostgreSQL | Store structured application data |
| ORM | Prisma ORM | Manage database schema, migrations, and queries |
| Authentication | JWT-based Authentication | Secure user sessions and API access |
| Authorization | Role-Based Access Control (RBAC) | Restrict features according to Admin, Editor, and Viewer roles |
| Cache (optional) | Redis | Improve performance for frequently accessed dashboard data |
| Version Control | Git + GitHub | Source code management and collaboration |
| Deployment | Cloud hosting platform | Host frontend, backend, and database services |

---

# System Boundaries

The application is divided into independent modules. Each module owns a specific responsibility.

src/
│
├── auth/
│
├── users/
│
├── projects/
│
├── paps/
│
├── valuation/
│
├── council/
│
├── complaints/
│
├── payments/
│
├── dashboard/
│
├── audit/
│
└── shared/


---

## Module Responsibilities

| Folder | Responsibility |
|---|---|
| auth/ | Authentication, login, password management, JWT generation, session validation |
| users/ | User accounts, roles, permissions, user management |
| projects/ | Project creation, project lifecycle, project assignment to Editors |
| paps/ | PAP registration, owner information, beneficiary information, land information |
| valuation/ | Compensation values, valuation status, valuation updates |
| council/ | Council review information and approval tracking |
| complaints/ | Complaint creation, status management, resolution, appeals |
| payments/ | Beneficiary payment information, payment status, payment tracking |
| dashboard/ | Aggregated project statistics, charts, reports |
| audit/ | Activity logs, change history, accountability records |
| shared/ | Common utilities, validation rules, constants, reusable services |

---

# Storage Model

The system uses different storage mechanisms depending on the type of data.

## Database Storage (PostgreSQL)

The database stores all structured business data.

Examples:

| Data | Stored In |
|---|---|
| Users | PostgreSQL |
| Roles and permissions | PostgreSQL |
| Projects | PostgreSQL |
| PAP records | PostgreSQL |
| Owner information | PostgreSQL |
| Beneficiary information | PostgreSQL |
| Land information | PostgreSQL |
| Compensation amounts | PostgreSQL |
| Council review information | PostgreSQL |
| Complaint records | PostgreSQL |
| Payment information | PostgreSQL |
| Audit history | PostgreSQL |

---

## File Storage

The first version of the system does not store uploaded files.

Not stored:

- National ID scans
- Land title documents
- Signed forms
- Payment receipts
- Photos

Instead, the system stores information about verification status only.

Example:
Land Title Status:
Verified

Verified By:
Editor Account

Verification Date:
2026-08-20


---

## Cache Storage

Redis may be used for temporary or frequently accessed information.

Examples:

- Dashboard statistics
- Frequently requested project summaries
- User sessions (optional)
- Report calculations

Cache data must never become the source of truth.

The PostgreSQL database remains the authoritative storage.

---

# Authentication and Access Model

## Authentication

The system uses JWT-based authentication.

Authentication flow:
Backend verifies token before access


---

# User Roles

The system has three roles:

## Admin

Responsibilities:

- Create projects.
- Assign Editors.
- Manage users.
- View all projects.
- Complete or cancel projects.
- Access reports.

---

## Editor

Responsibilities:

- Manage assigned projects.
- Register PAPs.
- Update land information.
- Record valuation information.
- Record council feedback.
- Manage complaints.
- Record payment information.

---

## Viewer

Responsibilities:

- View projects.
- View PAP information.
- View dashboards.
- View reports.

Restrictions:

- Cannot create.
- Cannot edit.
- Cannot delete.

---

# Ownership Model

Projects belong to the Admin-created project record.

Relationship:
Admin
|
|
Creates
|
|
Project
|
|
Assigned Editor
|
|
Manages PAPs




Rules:

- An Editor can only modify projects assigned to them.
- Admin can access all projects.
- Viewer has read-only access.
- PAP records belong to a specific project.
- Complaints belong to a specific PAP.
- Payments belong to a specific PAP.

---

# AI and Background Tasks

## AI Components

The first version does not include AI features.

No AI models are required for:

- PAP registration.
- Valuation tracking.
- Complaint management.
- Payment monitoring.

Future AI possibilities:

- Automatic complaint categorization.
- Compensation anomaly detection.
- Project delay prediction.
- Payment risk analysis.

---

## Background Tasks

Background jobs may be introduced for:

| Task | Purpose |
|---|---|
| Dashboard aggregation | Calculate project statistics efficiently |
| Report generation | Generate large project reports |
| Notification services | Notify users about workflow changes |

Example:
Payment Update
    ↓
Background Worker
    ↓
Update Dashboard Statistics

---

# Core Data Relationships
User
|
|
Project
|
|
PAP
|
├── Valuation
|
├── Complaint
|
├── Payment
|
└── Audit Records


---

# Invariants

The following rules must never be violated by the codebase.

## 1. Payment cannot be completed without required approvals

A PAP cannot have:
Payment_Status = Paid

unless:
Owner Signed = true
Owner Signed = true

AND

Cell Signed = true

AND

Sector Signed = true

---

## 2. Audit history cannot be modified or deleted

Every important change must create an audit record.

Audit records are immutable.

The system must never allow users to:

- Edit audit entries.
- Delete audit entries.

---

## 3. Users cannot access data outside their permissions

Rules:

- Viewer cannot modify data.
- Editor cannot modify unassigned projects.
- Only Admin can manage users.

---

## 4. A complaint cannot be reopened after resolution

Once:
Complaint Status = Resolved

the record becomes historical.

If further action is needed, a new appeal complaint must be created.

---

## 5. Project completion requires all PAP payments and complaints resolved

A project cannot become:
Completed

unless:

- All eligible PAPs are paid.
- No unresolved complaints remain.

---

## 6. Compensation changes must maintain traceability

When compensation changes:

The system must record:

- Previous amount.
- New amount.
- User responsible.
- Date and time.
- Reason for change.

---

## 7. Database remains the source of truth

Cache data must never override database records.

All critical business decisions must use PostgreSQL data.

---

# Architecture Principles

The system should always prioritize:

1. Data integrity over convenience.
2. Auditability over silent updates.
3. Clear ownership over unrestricted access.
4. Simple workflows over unnecessary complexity.
5. Maintainable modules over tightly coupled code.