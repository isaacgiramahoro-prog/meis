# Project Overview: Land Evaluation and Expropriation Management System

## Overview

The Land Evaluation and Expropriation Management System is a web application designed to streamline the management of land compensation projects within Nyanza District. The system provides a centralized platform for managing projects, Project Affected Persons (PAPs), land valuation information, council review processes, financial payment tracking, complaints, and project completion progress. It organizes the entire expropriation workflow from project creation to final compensation, providing administrators and authorized users with real-time visibility through status tracking, dashboards, and progress indicators. The system supports three user roles: Admin, Editor, and Viewer, where Editors manage project information and operational processes, Admins control users and project lifecycle, and Viewers access information in a read-only mode.

---

# Goals

1. Create a centralized system for managing land expropriation projects and compensation activities in Nyanza District.

2. Digitize the process of registering Project Affected Persons (PAPs), including their land information, valuation details, compensation amounts, and payment information.

3. Provide clear visibility into project progress using status tracking, color-coded indicators, and dashboard summaries.

4. Improve transparency and accountability by maintaining an activity history of important system changes, including compensation updates, status changes, and complaint decisions.

5. Reduce manual tracking errors by replacing spreadsheet-based workflows with a structured database system.

6. Manage PAP complaints through a controlled workflow that supports multiple complaints, appeals, resolution tracking, and compensation adjustments.

7. Provide financial tracking of compensation payments, including beneficiary information, bank details, payment codes, and payment status.

8. Ensure that compensation payments cannot proceed until required approval conditions, including owner, cell, and sector signatures, are completed.

---

# Core User Flow

## 1. Project Creation

1. The Admin logs into the system.
2. The Admin creates a new expropriation project.
3. The Admin enters basic project information:

   - Project name
   - Location
   - Budget
   - Deadline
   - Project description

4. The Admin assigns an Editor responsible for managing the project.

---

## 2. PAP Registration and Land Evaluation

1. The Editor opens the assigned project.
2. The Editor registers Project Affected Persons (PAPs).
3. The Editor enters PAP information:

   - Owner name
   - Owner ID
   - Beneficiary information
   - Affected UPI
   - Affected land area (m²)
   - Property type
   - Sector
   - Cell
   - Village
   - Land registration information
   - Civil status

4. The Editor records valuation information:

   - Compensation amount
   - Valuation status
   - Comments

5. Each PAP initially receives a compensation status of:

   - Not Yet Paid

---

## 3. Council Review Process

1. The Editor prepares PAP information for council review.
2. The system generates council review information containing:

   - Beneficiary name
   - Beneficiary ID
   - Affected UPI
   - Affected area
   - Property type
   - Approved amount

3. Council feedback is recorded by the Editor.
4. If corrections are required:
   
   - The Editor updates the PAP information directly.
   - The system records the change in the activity history.

5. Once approved, the PAP moves to the next stage.

---

## 4. Approval and Signature Verification

1. The Editor records required approval signatures:

   - Owner signature status
   - Cell signature status
   - Sector signature status

2. The system checks that all required signatures are completed.

3. PAPs cannot proceed to payment unless:

   - Owner signed = completed
   - Cell signed = completed
   - Sector signed = completed

---

## 5. Complaint Management

1. The Editor creates a complaint when a PAP reports an issue.
2. The complaint is linked to the PAP and project.
3. The Editor records:

   - Complaint category
   - Complaint description
   - Review status
   - Resolution decision

4. Complaint statuses include:

   - Submitted
   - Under Review
   - Resolved
   - Rejected

5. A resolved complaint cannot be reopened.
6. If a PAP disagrees with the resolution, a new appeal complaint is created and linked to the previous complaint.

7. If compensation changes after a complaint decision, the Editor updates the valuation manually.

---

## 6. Finance and Payment Tracking

1. Approved PAP records move to the payment stage.
2. The Editor records payment information:

   - Beneficiary ID
   - Beneficiary name
   - Account number
   - Bank name
   - Payment code
   - Amount

3. The system tracks payment status:

   - Pending
   - Paid
   - Failed
   - Cancelled

4. Payment progress is displayed through project dashboards.

---

## 7. Project Completion

1. The Admin reviews overall project progress.
2. The Admin confirms that:

   - All eligible PAPs have been paid.
   - Outstanding complaints are resolved.
   - Required approvals are completed.

3. The Admin changes the project status:

   - Completed
   - Failed / Cancelled

---

# Features

## 1. User Management and Access Control

- Role-based authentication.
- Three user roles:

  ### Admin
  - Manage users.
  - Create projects.
  - Assign Editors.
  - Complete or cancel projects.
  - View all reports.

  ### Editor
  - Manage assigned projects.
  - Register PAPs.
  - Update valuation information.
  - Manage complaints.
  - Record approvals and payments.

  ### Viewer
  - View project information.
  - View dashboards and reports.
  - No editing permissions.

---

## 2. Project Management

- Create and manage expropriation projects.
- Track project lifecycle stages.
- Assign responsible Editors.
- Monitor project completion progress.
- Display project status using visual indicators.

---

## 3. PAP Management

- Register Project Affected Persons.
- Store owner and beneficiary information.
- Manage land details.
- Track valuation information.
- Monitor compensation status.
- Track approval signatures.

---

## 4. Council Review Management

- Display PAP information required for review.
- Record council review outcomes.
- Allow Editors to update PAP information after feedback.
- Maintain history of important changes.

---

## 5. Complaint Management

- Create multiple complaints per PAP.
- Categorize complaints.
- Track complaint status.
- Record resolution decisions.
- Support appeal creation.
- Link appeals to previous complaints.

---

## 6. Payment Management

- Store beneficiary payment information.
- Track payment progress.
- Monitor paid and unpaid PAPs.
- Generate payment summaries.
- Track payment codes and amounts.

---

## 7. Dashboard and Reporting

- Display project progress.
- Show PAP payment statistics.
- Display compensation summaries.
- Show complaint statistics.
- Provide visual workflow progress.

---

## 8. Audit History

The system records important actions:

- User who performed the action.
- Date and time of change.
- Previous value.
- New value.
- Description of the action.

Examples:

- Compensation amount updated.
- PAP information changed.
- Complaint resolved.
- Project status changed.

---

# In Scope

The system will include:

- Web-based application.
- User authentication.
- Role-based access control.
- Project creation and management.
- Editor assignment.
- PAP registration.
- Land and property information management.
- Compensation valuation tracking.
- Council review tracking.
- Signature completion tracking.
- Complaint and appeal management.
- Finance payment tracking.
- Dashboard visualization.
- Project progress monitoring.
- Audit history and activity logs.
- Search and filtering of projects and PAPs.

---

# Out of Scope

The system will not include:

- Direct bank payment processing.
- Integration with banking systems.
- Automatic money transfers.
- Digital signature capture.
- Uploading and storing scanned documents.
- Government identity system integration.
- Public PAP self-service portal.
- Mobile application.
- GIS mapping and satellite land measurement.
- Automatic land valuation calculation.
- Artificial intelligence prediction or recommendation features.
- External council member login accounts.

---

# Success Criteria

The project will be considered successful when:

1. Admin users can create projects and assign Editors successfully.

2. Editors can register PAPs and maintain complete land compensation records.

3. The system accurately tracks each PAP from registration to payment completion.

4. Users can clearly identify project progress through dashboards and status indicators.

5. Complaints can be created, tracked, resolved, and linked to PAP records.

6. Payment information can be recorded and progress can be monitored.

7. The system prevents payment completion when required signatures are missing.

8. All important changes are recorded in an audit history.

9. Users can quickly search and retrieve project, PAP, complaint, and payment information.

10. The system provides a reliable replacement for manual spreadsheet-based expropriation tracking.