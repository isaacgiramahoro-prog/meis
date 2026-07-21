# AI Workflow Rules

This document defines the mandatory workflow rules that every AI coding agent must follow while contributing to the **Nyanza District Land Evaluation and Expropriation Management System**.

These are **rules**, not suggestions.

---

# 1. Overall Development Approach

## Rule 1.1 — Build incrementally

Implement one complete feature at a time.

Never begin implementing multiple unrelated features in the same task.

Example:

✅ Correct

```
Authentication
↓

User Management
↓

Project Management
↓

PAP Management
```

❌ Incorrect

```
Authentication
+

Complaints
+

Dashboard
+

Payments
```

---

## Rule 1.2 — Be specification-driven

Implement only behavior that is explicitly defined in the project documentation.

Never invent business rules.

Never assume missing requirements.

---

## Rule 1.3 — Finish before expanding

Complete the current module before introducing new functionality.

Do not begin the next feature until the current feature:

- compiles
- works correctly
- is documented
- passes verification

---

# 2. Scope Rules

## Rule 2.1 — Modify only the requested unit

Only change files required for the requested feature.

Do not perform unrelated refactoring.

Do not rename files unless explicitly instructed.

---

## Rule 2.2 — Do not speculate

Do not add:

- future features
- optional functionality
- placeholder APIs
- unused database tables
- unused React components
- unused utility functions

Every line of code must support an existing requirement.

---

## Rule 2.3 — Keep changes minimal

Choose the smallest implementation that satisfies the current specification.

Avoid unnecessary abstractions.

Avoid premature optimization.

---

# 3. When to Split Work

Split work into smaller units whenever a task contains multiple responsibilities.

Always separate:

- Database schema
- Backend API
- Business logic
- Frontend UI
- Testing
- Documentation

Example:

```
Step 1

Create Prisma models

↓

Step 2

Generate migrations

↓

Step 3

Create API routes

↓

Step 4

Create React pages

↓

Step 5

Connect API

↓

Step 6

Test
```

Never attempt all of these in a single implementation step.

---

# 4. Handling Missing Requirements

## Rule 4.1 — Stop when requirements are ambiguous

If business behavior is unclear:

STOP.

Ask for clarification before writing code.

Never guess.

---

## Rule 4.2 — Do not invent workflows

If the specification does not define:

- status values
- validation rules
- permissions
- calculations

Ask instead of assuming.

---

## Rule 4.3 — Respect documented business rules

Implementation must always follow the documented workflow.

Do not simplify workflow rules without explicit approval.

---

# 5. Protected Files

Do not modify the following without explicit instruction.

## Generated files

- Prisma generated client
- Auto-generated migration files after creation
- Build output
- Distribution folders

Examples

```
node_modules/

dist/

build/

coverage/
```

---

## UI Library Components

If a reusable UI component library is introduced (e.g., shadcn/ui), do not modify generated base components directly.

Instead:

- compose them
- wrap them
- extend them

Never edit generated library components unless explicitly instructed.

---

## Environment Configuration

Do not modify:

```
.env

.env.production

.env.local
```

unless explicitly requested.

---

## Package Configuration

Do not remove or replace dependencies without instruction.

Examples:

```
package.json

package-lock.json

pnpm-lock.yaml
```

---

# 6. Documentation Synchronization

Documentation is part of the implementation.

Whenever behavior changes:

Update documentation immediately.

Keep synchronized:

- project-overview.md
- architecture.md
- ai-workflow-rules.md
- README.md
- API documentation
- Database documentation

Documentation must describe the actual implementation.

Never leave documentation outdated.

---

# 7. Database Rules

Never create duplicate business entities.

Relationships must follow the project model.

Project

↓

PAP

↓

Complaint

↓

Payment

Use foreign keys.

Avoid duplicated information.

Never duplicate project names inside PAP records.

Reference entities by IDs.

---

# 8. Business Rule Enforcement

The following rules must always be enforced in code.

## Payment Rule

Never allow:

```
Payment Status = Paid
```

unless:

- Owner Signed
- Cell Signed
- Sector Signed

are all completed.

---

## Complaint Rule

Never reopen a resolved complaint.

Create a new Appeal instead.

---

## Audit Rule

Every important change must generate an audit history entry.

Examples:

- compensation updated
- project status changed
- complaint resolved
- payment updated

Audit history must never be editable.

---

## Permission Rule

Admin

- Full access

Editor

- Manage assigned projects only

Viewer

- Read-only

Never bypass role permissions.

---

# 9. Coding Standards

Write readable code.

Prefer clarity over cleverness.

Use descriptive names.

Avoid duplicated logic.

Use TypeScript types.

Validate every request.

Handle every possible error.

Never ignore exceptions.

---

# 10. Testing Rule

Every completed feature must be verified before moving to the next feature.

Minimum verification includes:

- successful compilation
- API validation
- permission validation
- business rule validation
- database validation
- UI validation

Do not continue if verification fails.

---

# 11. Verification Checklist

Before beginning another feature, verify all of the following.

## Backend

- API builds successfully.
- No TypeScript errors.
- Database migration succeeds.
- Validation works.
- Authorization works.
- Business rules enforced.

---

## Frontend

- UI renders correctly.
- Forms validate correctly.
- API integration works.
- Loading states handled.
- Error states handled.

---

## Database

- Schema matches specification.
- Relationships correct.
- Constraints enforced.
- No duplicated entities.

---

## Documentation

- Documentation updated.
- API documentation updated.
- Architecture still accurate.
- README updated if needed.

---

## Code Quality

- No unused code.
- No dead files.
- No duplicate logic.
- No console debugging.
- No TODO placeholders without approval.

---

# 12. Completion Rule

A feature is complete only when:

- Implementation is finished.
- Business rules are enforced.
- Documentation is updated.
- Verification checklist passes.
- No known defects remain within the implemented scope.

Only then may work proceed to the next feature.