# Project Overview: Nyanza District Land Evaluation and Expropriation Management System

## Overview

The Nyanza District Land Evaluation and Expropriation Management System is a web-based application designed to digitize and organize the workflow of land compensation projects from project creation to final completion. The system manages the complete lifecycle of expropriation activities, including project registration, Project Affected Persons (PAPs) management, land evaluation, council review preparation, compensation tracking, complaint handling, payment monitoring, and project closure. The application provides three user roles—Admin, Editor, and Viewer—with controlled access based on responsibilities. Editors manage operational activities such as PAP registration, valuation updates, council information, complaints, and payment records, while Admins manage projects, users, and final project decisions. The system improves transparency, accountability, and visibility by providing status tracking, dashboards, progress indicators, and audit history for important changes.

---

# Goals

1. Replace manual spreadsheet-based land expropriation tracking with a centralized digital management system.

2. Provide a structured workflow for managing projects from creation, evaluation, approval, compensation, payment, and completion.

3. Maintain accurate records of Project Affected Persons (PAPs), including ownership information, land details, valuation information, and beneficiary payment details.

4. Improve transparency by tracking project progress, compensation status, payment status, and complaint resolution.

5. Reduce errors in compensation management by enforcing workflow rules and validation checks.

6. Provide accountability through automatic recording of important changes, including compensation updates, status changes, and complaint decisions.

7. Enable users to monitor project progress through dashboards and visual status indicators.

8. Improve complaint management by allowing multiple complaints per PAP and maintaining historical records of resolved cases and appeals.

9. Ensure compensation payments are controlled by approval conditions, including required owner, cell, and sector signatures.

10. Provide reliable reporting information for district decision-making.

---

# Core User Flow

## 1. User Authentication and Access

1. A user logs into the system.
2. The system verifies the user's credentials.
3. The system determines the user's role:

   - Admin
   - Editor
   - Viewer

4. The user receives access according to their permissions.

---

# 2. Project Creation

### User: Admin

1. The Admin creates a new expropriation project.
2. The Admin enters project details:

   - Project name
   - Location
   - Budget
   - Deadline
   - Project description

3. The Admin assigns an Editor responsible for managing the project.

4. The project status becomes:

Created


---

# 3. PAP Registration and Land Evaluation

### User: Editor

1. The Editor opens the assigned project.
2. The Editor registers Project Affected Persons (PAPs).
3. The Editor enters PAP information:

### Owner Information

- Owner name
- Owner ID
- Civil status

### Location Information

- Affected UPI
- Sector
- Cell
- Village

### Land Information

- Affected area (m²)
- Property type
- Land registration status
- Land title information

### Compensation Information

- Valuation status
- Compensation amount
- Comments

4. Each PAP starts with:
Compensation Status:
Not Yet Paid


---

# 4. Council Review Process

### User: Editor

1. The Editor prepares PAP information for council review.
2. The system displays council review information:

- Beneficiary name
- Beneficiary ID
- Affected UPI
- Affected area
- Property type
- Compensation amount

3. Council feedback is recorded in the system.

4. If corrections are needed:

   - The Editor updates the PAP information.
   - The system records the change history.

5. After approval, the PAP proceeds to payment preparation.

---

# 5. Approval Signature Tracking

### User: Editor

The Editor records approval completion:

- Owner signed
- Cell signed
- Sector signed

The system verifies:
Owner Signed = Completed

AND

Cell Signed = Completed

AND

Sector Signed = Completed


Only approved PAP records can proceed to payment.

---

# 6. Complaint Management

### User: Editor

1. The Editor creates a complaint linked to a PAP.

2. The complaint contains:

- Complaint description
- Complaint category
- Status
- Resolution decision
- Comments

3. Complaint lifecycle:
Submitted

↓

Under Review

↓

Resolved / Rejected


4. A PAP can have multiple complaints.

5. Resolved complaints cannot be reopened.

6. If a PAP disagrees with a resolution, the Editor creates a new appeal linked to the original complaint.

7. If a complaint affects compensation:

- The Editor manually updates the valuation.
- The system records the previous and new amount.

---

# 7. Finance and Payment Tracking

### User: Editor

1. Approved PAP records move to payment tracking.

2. The Editor records payment information:

- Beneficiary ID
- Beneficiary name
- Account number
- Bank name
- Payment code
- Amount

3. Payment status is updated:
Pending

↓

Paid

4. The dashboard updates project payment progress.

Example:

---

# 8. Project Completion

### User: Admin

1. The Admin reviews project progress.

2. The Admin confirms:

- PAP compensation completed.
- Outstanding complaints resolved.
- Required approvals completed.

3. The Admin changes project status:
Completed

or
Failed / Cancelled


---

# Features

## 1. Authentication and User Management

- Secure user login.
- Role-based access control.
- User management by Admin.
- Permission-based actions.

Roles:

### Admin

- Manage users.
- Create projects.
- Assign Editors.
- Close projects.
- View all information.

### Editor

- Manage assigned projects.
- Register PAPs.
- Update valuations.
- Manage complaints.
- Record payment information.

### Viewer

- View projects.
- View dashboards.
- Access reports.

---

# 2. Project Management

Features:

- Create projects.
- Assign responsible Editors.
- Track project status.
- Monitor project completion.
- View project summaries.

---

# 3. PAP Management

Features:

- Register PAP records.
- Store owner information.
- Store beneficiary information.
- Manage land information.
- Track compensation values.
- Track payment progress.

---

# 4. Council Review Management

Features:

- Prepare PAP information for review.
- Record council feedback.
- Update PAP information after corrections.
- Track review progress.

---

# 5. Complaint Management

Features:

- Create multiple complaints per PAP.
- Track complaint status.
- Record decisions.
- Support appeal complaints.
- Maintain complaint history.

---

# 6. Finance and Payment Management

Features:

- Store beneficiary payment information.
- Track compensation payments.
- Monitor paid and unpaid PAPs.
- Store payment codes.
- Display payment progress.

---

# 7. Dashboard and Reporting

Features:

- Project progress dashboard.
- PAP statistics.
- Compensation summaries.
- Payment progress charts.
- Complaint statistics.
- Status-based visualization.

---

# 8. Audit History

The system records important changes:

- User responsible.
- Date and time.
- Previous value.
- New value.
- Action performed.

Examples:

- Compensation changed.
- PAP information updated.
- Complaint resolved.
- Project status changed.

---

# In Scope

The system will build:

- Web application interface.
- Authentication system.
- Role-based permissions.
- Admin, Editor, and Viewer roles.
- Project creation and management.
- PAP registration.
- Land information management.
- Compensation valuation tracking.
- Council review tracking.
- Approval signature tracking.
- Complaint management.
- Appeal tracking.
- Payment information management.
- Dashboard and reporting.
- Status tracking.
- Audit history.

---

# Out of Scope

The system will not build:

- Direct bank payment integration.
- Automatic money transfer.
- Government banking system connection.
- Public PAP login portal.
- Mobile application.
- GIS mapping.
- Automatic land measurement.
- Automatic compensation calculation.
- Artificial intelligence decision-making.
- Document upload and storage.
- Digital signature capture.
- External council user accounts.

---

# Success Criteria

The project is successful when:

1. Admin users can create projects and assign Editors.

2. Editors can register PAPs with complete land and compensation information.

3. The system tracks PAP progress from registration to payment completion.

4. Users can view project progress through dashboards and status indicators.

5. Complaints can be created, managed, resolved, and linked to PAP records.

6. Payment information can be recorded and monitored.

7. The system prevents payment completion when required approvals are missing.

8. All important changes are recorded in the audit history.

9. Users can quickly search and retrieve project, PAP, complaint, and payment information.

10. The application provides a reliable digital replacement for manual expropriation tracking processes in Nyanza District.