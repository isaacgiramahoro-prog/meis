# MEIS — Land Evaluation & Expropriation Management System

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=flat&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-7.9-2D3748?style=flat&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat&logo=postgresql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat&logo=tailwindcss)

**MEIS** (Municipal Enterprise Information System) is a web-based platform designed to streamline the management of **land evaluation and expropriation projects** within **Nyanza District, Rwanda**. It digitises the entire compensation workflow — from project creation and PAP registration through council review, complaints handling, financial approval, and final payment tracking.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Core Workflow](#core-workflow)
- [Features](#features)
- [User Roles](#user-roles)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Architecture Principles](#architecture-principles)
- [License](#license)

---

## 🏛️ Overview

MEIS replaces manual spreadsheet-based workflows with a structured, centralised database system. It provides end-to-end traceability for land compensation projects, ensuring:

- **Transparency** — every important change is recorded in an immutable audit log.
- **Accountability** — role-based access control ensures only authorised users can modify data.
- **Efficiency** — real-time dashboards, status tracking, and progress indicators replace manual reporting.
- **Integrity** — business rules (e.g., payments cannot be completed without required approvals) are enforced at the database level.

---

## 🔁 Core Workflow

```
Project Creation (Admin)
       │
       ▼
PAP Registration & Valuation (Editor)
       │
       ▼
Council Review (Editor records council decision)
       │
       ▼
Approval Signatures (Owner → Cell → Sector)
       │
       ▼
Complaint Management (if applicable)
       │
       ▼
Finance Review (Finance approval)
       │
       ▼
Payment Tracking (Editor records payment)
       │
       ▼
Project Completion (Admin)
```

1. **Admin** creates an expropriation project and assigns an **Editor**.
2. **Editor** registers Project Affected Persons (PAPs), records land information, and enters valuation details.
3. **Editor** prepares PAP information for **Council Review** and records the council's decision.
4. Required **approval signatures** (Owner, Cell, Sector) are tracked before a PAP can proceed to payment.
5. **Complaints** can be filed against a PAP's valuation or process; resolved complaints cannot be reopened — appeals create linked child complaints.
6. **Finance Reviews** track financial approval decisions.
7. **Editor** records payment information; the system tracks payment status (Pending → Paid / Failed / Cancelled).
8. **Admin** marks projects as Completed once all eligible PAPs are paid and complaints are resolved.

---

## ✨ Features

### 1. User Management & Access Control
- JWT-based authentication with secure password hashing (bcryptjs, 12 rounds).
- Three roles: **Admin**, **Editor**, and **Viewer**.
- Role-based UI filtering — navigation items and actions are conditionally rendered.

### 2. Project Management
- Create, edit, and track expropriation projects.
- Assign Editors to projects.
- Monitor project lifecycle (Pending → Active → Completed → Cancelled).
- Visual status indicators on project cards and lists.

### 3. PAP Management
- Register Project Affected Persons with full owner and beneficiary details.
- Store land information: UPI (Unique Parcel Identifier), area (m²), property type, sector, cell, village.
- Track compensation status (Draft → Not Yet Paid → Council Review → Finance Processing → Paid → Failed / Cancelled).
- Record verification status for land, land title, and ID documents.

### 4. Council Review
- Display PAP information required for council evaluation.
- Record council decisions (Pending / Approved / Revision Needed).
- Editors can update PAP information after council feedback.
- Change history is automatically recorded.

### 5. Complaint Management
- Create multiple complaints per PAP with categorisation (Land Issue, Valuation Issue, Ownership Issue, Payment Issue, Other).
- Track complaint lifecycle (Submitted → Under Review → Resolved / Rejected).
- Support appeal chains — a resolved complaint cannot be reopened; new linked appeal complaints are created instead.
- Resolution tracking with date and resolving user.

### 6. Finance Review
- Financial decision tracking per PAP (Pending / Approved / Declined / Revision Needed).
- Approved amount tracking separate from valuation amount.

### 7. Payment Management
- Record beneficiary bank details, payment codes, and amounts.
- Payment status tracking (Pending → Paid / Failed / Cancelled).
- Validation: Payments cannot be marked Paid unless all required approval signatures (Owner, Cell, Sector) are completed.
- Snapshot of beneficiary information at time of payment.

### 8. Dashboard & Reporting
- Aggregated project statistics (total PAPs, paid PAPs, pending amounts, etc.).
- Visual charts for compensation summaries and payment progress.
- Project-level progress indicators.

### 9. Audit Logging
- Immutable audit records for all important changes.
- Captures: user, timestamp, previous value, new value, and description.
- Examples: compensation updates, status changes, complaint resolutions.

### 10. Search & Filtering
- Search and filter across projects, PAPs, complaints, and payments.

---

## 👥 User Roles

| Feature | Admin | Editor | Viewer |
|---|---|---|---|
| Manage users | ✅ | ❌ | ❌ |
| Create projects | ✅ | ❌ | ❌ |
| Assign/Edit Editors | ✅ | ❌ | ❌ |
| Complete/Cancel projects | ✅ | ❌ | ❌ |
| Manage assigned projects | ✅ | ✅ | ❌ |
| Register PAPs | ✅ | ✅ | ❌ |
| Update valuations | ✅ | ✅ | ❌ |
| Record council reviews | ✅ | ✅ | ❌ |
| Manage complaints | ✅ | ✅ | ❌ |
| Record payments | ✅ | ✅ | ❌ |
| View all projects | ✅ | Assigned only | ✅ (read-only) |
| View dashboards & reports | ✅ | ✅ | ✅ (read-only) |

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 19 + Next.js 16 | UI framework with App Router |
| **Styling** | Tailwind CSS 4 | Utility-first responsive design |
| **UI Components** | shadcn/ui + Base UI | Accessible, composable components |
| **Language** | TypeScript 5.8 | Type safety across the stack |
| **Database** | PostgreSQL 16 | Relational data storage |
| **ORM** | Prisma 7.9 | Schema management, migrations, type-safe queries |
| **Authentication** | JWT (jsonwebtoken) | Token-based session management |
| **Password Hashing** | bcryptjs | Secure credential storage |
| **Icons** | Lucide React | Consistent iconography |
| **PDF Generation** | jsPDF | Report export |
| **Spreadsheet Export** | xlsx | Excel report export |
| **Linting** | ESLint 9 | Code quality enforcement |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** — v18.17 or later (LTS recommended)
- **PostgreSQL** — 14 or later (with a running database server)
- **npm**, **yarn**, **pnpm**, or **bun** — package manager of your choice
- **Git** — for version control

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd meis

# Install dependencies
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### Environment Variables

Create a `.env` file in the project root:

```env
# Database connection string (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/meis?schema=public"

# JWT secret key (change in production!)
JWT_SECRET="your-secure-secret-key-at-least-32-characters"
```

> **⚠️ Important:** Never commit `.env` to version control. The `.gitignore` already excludes `.env*` files.

### Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Seed the database with an initial admin user
npm run seed
```

Default admin credentials after seeding:

```
Email:    admin@meis.gov.rw
Password: Admin@123
```

> **ℹ️ Note:** The seed script checks for an existing admin user and will not create a duplicate if one already exists.

### Running the Application

```bash
# Development server (with hot reload)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You will be redirected to the sign-in page.

```bash
# Production build
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

---

## 📁 Project Structure

```
meis/
├── app/                          # Next.js App Router pages
│   ├── api/                      # REST API routes
│   │   ├── auth/                 # Authentication (signin, signup, me)
│   │   ├── complaints/           # Complaint CRUD
│   │   ├── council/              # Council review CRUD
│   │   ├── dashboard/            # Dashboard aggregation
│   │   ├── finance/              # Finance review CRUD
│   │   ├── paps/                 # PAP CRUD
│   │   ├── payments/             # Payment CRUD
│   │   ├── projects/             # Project CRUD + assign + finance
│   │   ├── reports/              # Report generation
│   │   └── users/                # User management
│   ├── audit/                    # Audit log page
│   ├── complaints/               # Complaint pages
│   ├── council/                  # Council review pages
│   ├── dashboard/                # Dashboard pages
│   ├── finance/                  # Finance pages
│   ├── paps/                     # PAP pages
│   ├── payments/                 # Payment pages
│   ├── projects/                 # Project pages
│   ├── reports/                  # Reports page
│   ├── signin/                   # Sign-in page
│   ├── signup/                   # Sign-up page
│   ├── users/                    # User management pages
│   ├── globals.css               # Global Tailwind styles
│   ├── layout.tsx                # Root layout with AuthProvider
│   └── page.tsx                  # Redirect logic based on role
├── components/                   # Reusable React components
│   ├── ui/                       # shadcn/ui primitives
│   ├── AuthGuard.tsx             # Route protection wrapper
│   ├── Charts.tsx                # Dashboard chart components
│   ├── ComplaintModals.tsx       # Complaint CRUD modals
│   ├── CouncilModals.tsx         # Council review modals
│   ├── DashboardLayout.tsx       # Layout with sidebar
│   ├── FinanceModals.tsx         # Finance review modals
│   ├── PapModals.tsx             # PAP CRUD modals
│   ├── PaymentModals.tsx         # Payment modals
│   ├── ProjectModals.tsx         # Project CRUD modals
│   ├── Sidebar.tsx               # Navigation sidebar
│   └── StatsCard.tsx             # Dashboard stat cards
├── lib/                          # Shared utilities & logic
│   ├── auth.ts                   # JWT helpers, password hashing
│   ├── context/
│   │   └── AuthContext.tsx       # React context for auth state
│   ├── middleware-helpers.ts     # Middleware utilities
│   ├── prisma.ts                 # Singleton Prisma client
│   ├── utils.ts                  # General utilities (cn, etc.)
│   └── validations.ts           # Validation schemas
├── prisma/
│   ├── schema.prisma             # Database schema (models, enums, relations)
│   ├── seed.ts                   # Database seeder
│   └── seed.js                   # Compiled seed (for Prisma)
├── context-app/                  # Project context & specifications
│   ├── architecture.md           # Architecture documentation
│   ├── project-overview.md       # Feature specifications & user flows
│   ├── ui-context.md             # UI design guidelines
│   └── ...                       # Additional documentation
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
├── components.json               # shadcn/ui configuration
└── package.json                  # Project metadata & scripts
```

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register a new user |
| POST | `/api/auth/signin` | Sign in & receive JWT |
| GET | `/api/auth/me` | Get current authenticated user |

### Projects
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/projects` | List all projects |
| POST | `/api/projects` | Create a project |
| GET | `/api/projects/[id]` | Get project details |
| PATCH | `/api/projects/[id]` | Update project |
| DELETE | `/api/projects/[id]` | Delete project |
| PATCH | `/api/projects/[id]/assign` | Assign an Editor to a project |
| GET | `/api/projects/[id]/finance` | Get project finance summary |

### PAPs
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/paps` | List all PAPs (with filters) |
| POST | `/api/paps` | Register a new PAP |
| GET | `/api/paps/[id]` | Get PAP details |
| PATCH | `/api/paps/[id]` | Update PAP |

### Council
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/council` | List council reviews |
| POST | `/api/council` | Create council review |
| PATCH | `/api/council/[id]` | Update council review |

### Finance
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/finance` | List finance reviews |
| POST | `/api/finance` | Create finance review |
| PATCH | `/api/finance/[id]` | Update finance review |

### Complaints
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/complaints` | List complaints |
| POST | `/api/complaints` | Create a complaint |
| PATCH | `/api/complaints/[id]` | Update/resolve complaint |

### Payments
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/payments` | List payments |
| POST | `/api/payments` | Record a payment |
| PATCH | `/api/payments/[id]` | Update payment status |

### Users
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users` | List all users (Admin only) |
| PATCH | `/api/users/[id]` | Update user role (Admin only) |

### Dashboard & Reports
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard` | Aggregated dashboard statistics |
| GET | `/api/reports` | Generate reports |

---

## ⚙️ Architecture Principles

The system enforces the following **invariants** at all times:

1. **Payment requires approvals** — A PAP cannot have `Payment_Status = Paid` unless Owner, Cell, and Sector signatures are all completed.
2. **Audit immutability** — All audit records are append-only; they cannot be edited or deleted.
3. **Data isolation** — Editors can only modify projects assigned to them. Viewers have read-only access.
4. **No complaint reopening** — Once a complaint is resolved, it becomes historical. Further disputes require a new linked appeal.
5. **Project completion gate** — A project cannot be marked Completed unless all eligible PAPs are paid and no unresolved complaints remain.
6. **Compensation traceability** — All compensation amount changes must record the previous value, new value, user, timestamp, and reason.
7. **Database as source of truth** — Any cache layer (e.g., Redis) must never override database records for critical business decisions.

---

## 📄 License

This project is developed for **Nyanza District** — all rights reserved.

---

<p align="center">
  Built with ❤️ for the people of Nyanza District
</p>

