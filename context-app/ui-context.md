# UI Design Tokens — Nyanza Land Evaluation & Expropriation Management System

The design system emphasizes **clarity, trust, accessibility, and efficient handling of data-heavy workflows**. The palette uses neutral civic colors for structure while reserving vivid colors exclusively for workflow states and alerts.

---

# Color Palette

## Core Brand Colors

| Token                         | Hex       | Usage                                                      |
| ----------------------------- | --------- | ---------------------------------------------------------- |
| `color.brand.primary`         | `#1E3A8A` | Primary buttons, navigation, active elements, page headers |
| `color.brand.primary-hover`   | `#1D4ED8` | Hover state for primary actions                            |
| `color.brand.primary-light`   | `#DBEAFE` | Selected rows, active navigation background                |
| `color.brand.secondary`       | `#0F766E` | Secondary actions, analytics highlights                    |
| `color.brand.secondary-light` | `#CCFBF1` | Secondary cards and badges                                 |
| `color.brand.accent`          | `#2563EB` | Links, focus indicators, charts                            |

---

## Background Colors

| Token                       | Hex       | Usage                  |
| --------------------------- | --------- | ---------------------- |
| `color.background.app`      | `#F8FAFC` | Application background |
| `color.background.page`     | `#FFFFFF` | Page content           |
| `color.background.card`     | `#FFFFFF` | Cards                  |
| `color.background.table`    | `#FFFFFF` | Data tables            |
| `color.background.sidebar`  | `#FFFFFF` | Sidebar                |
| `color.background.header`   | `#1E3A8A` | Top navigation         |
| `color.background.hover`    | `#F1F5F9` | Hover rows             |
| `color.background.selected` | `#DBEAFE` | Selected table rows    |

---

## Surface Colors

| Token                     | Hex       | Usage             |
| ------------------------- | --------- | ----------------- |
| `color.surface.default`   | `#FFFFFF` | Cards             |
| `color.surface.secondary` | `#F8FAFC` | Secondary panels  |
| `color.surface.muted`     | `#F1F5F9` | Disabled sections |
| `color.surface.elevated`  | `#FFFFFF` | Modals            |

---

## Text Colors

| Token                  | Hex       | Usage                    |
| ---------------------- | --------- | ------------------------ |
| `color.text.primary`   | `#0F172A` | Main content             |
| `color.text.secondary` | `#475569` | Secondary text           |
| `color.text.tertiary`  | `#64748B` | Placeholder text         |
| `color.text.inverse`   | `#FFFFFF` | Text on dark backgrounds |
| `color.text.disabled`  | `#94A3B8` | Disabled controls        |
| `color.text.link`      | `#2563EB` | Links                    |

---

## Border Colors

| Token                  | Hex       | Usage            |
| ---------------------- | --------- | ---------------- |
| `color.border.default` | `#E2E8F0` | Standard borders |
| `color.border.light`   | `#F1F5F9` | Soft separators  |
| `color.border.focus`   | `#2563EB` | Focus ring       |
| `color.border.input`   | `#CBD5E1` | Input fields     |

---

# Workflow Status Colors

These colors should **only** represent business workflow states.

| Token                    | Hex       | Meaning              |
| ------------------------ | --------- | -------------------- |
| `color.status.unpaid`    | `#DC2626` | Not Yet Paid         |
| `color.status.council`   | `#EAB308` | Under Council Review |
| `color.status.finance`   | `#F97316` | Finance Processing   |
| `color.status.completed` | `#16A34A` | Paid / Completed     |
| `color.status.cancelled` | `#6B7280` | Failed / Cancelled   |
| `color.status.draft`     | `#3B82F6` | Draft / Registration |

---

## Status Backgrounds

| Token                       | Hex       | Usage        |
| --------------------------- | --------- | ------------ |
| `color.status.unpaid-bg`    | `#FEE2E2` | Status badge |
| `color.status.council-bg`   | `#FEF9C3` | Status badge |
| `color.status.finance-bg`   | `#FFEDD5` | Status badge |
| `color.status.completed-bg` | `#DCFCE7` | Status badge |
| `color.status.cancelled-bg` | `#F3F4F6` | Status badge |
| `color.status.draft-bg`     | `#DBEAFE` | Status badge |

---

## Feedback Colors

| Token           | Hex       | Usage                |
| --------------- | --------- | -------------------- |
| `color.success` | `#16A34A` | Success messages     |
| `color.warning` | `#D97706` | Warnings             |
| `color.error`   | `#DC2626` | Validation errors    |
| `color.info`    | `#2563EB` | Informational alerts |

---

## Dashboard & Chart Colors

| Token                    | Hex       | Usage            |
| ------------------------ | --------- | ---------------- |
| `color.chart.projects`   | `#1E3A8A` | Total projects   |
| `color.chart.paid`       | `#16A34A` | Paid PAPs        |
| `color.chart.pending`    | `#DC2626` | Pending payments |
| `color.chart.council`    | `#EAB308` | Council stage    |
| `color.chart.finance`    | `#F97316` | Finance stage    |
| `color.chart.complaints` | `#9333EA` | Complaints       |
| `color.chart.background` | `#E2E8F0` | Chart grid       |

---

# Typography

| Token       | Recommendation | Usage            |
| ----------- | -------------- | ---------------- |
| Font Family | **Inter**      | Primary UI font  |
| Heading XL  | 36px / 700     | Dashboard titles |
| Heading L   | 30px / 700     | Page titles      |
| Heading M   | 24px / 600     | Section titles   |
| Heading S   | 20px / 600     | Card headings    |
| Body Large  | 16px / 400     | Main content     |
| Body Medium | 15px / 400     | Forms            |
| Body Small  | 14px / 400     | Tables           |
| Caption     | 12px / 400     | Metadata         |
| Table Cell  | 14px / 500     | Data tables      |
| Button Text | 14px / 600     | Buttons          |
| Navigation  | 15px / 500     | Sidebar          |

---

# Font Weight Scale

| Token                  | Weight |
| ---------------------- | ------ |
| `font.weight.regular`  | 400    |
| `font.weight.medium`   | 500    |
| `font.weight.semibold` | 600    |
| `font.weight.bold`     | 700    |

---

# Spacing Scale

| Token       | Value |
| ----------- | ----- |
| `space.xs`  | 4px   |
| `space.sm`  | 8px   |
| `space.md`  | 12px  |
| `space.lg`  | 16px  |
| `space.xl`  | 24px  |
| `space.2xl` | 32px  |
| `space.3xl` | 48px  |

---

# Border Radius Scale

| Token         | Value  | Usage             |
| ------------- | ------ | ----------------- |
| `radius.none` | 0px    | Tables            |
| `radius.sm`   | 4px    | Inputs            |
| `radius.md`   | 8px    | Buttons           |
| `radius.lg`   | 12px   | Cards             |
| `radius.xl`   | 16px   | Dialogs           |
| `radius.2xl`  | 20px   | Dashboard widgets |
| `radius.full` | 9999px | Pills & badges    |

---

# Shadows

| Token       | Value                             | Usage        |
| ----------- | --------------------------------- | ------------ |
| `shadow.sm` | `0 1px 2px rgba(15,23,42,0.05)`   | Inputs       |
| `shadow.md` | `0 4px 8px rgba(15,23,42,0.08)`   | Cards        |
| `shadow.lg` | `0 10px 20px rgba(15,23,42,0.12)` | Dialogs      |
| `shadow.xl` | `0 20px 40px rgba(15,23,42,0.15)` | Large panels |

---

# AI & Accent Colors (Future-Proofing)

Although the first version does not include AI features, reserve semantic tokens so they can be introduced without redesigning the system.

| Token              | Hex       | Usage                       |
| ------------------ | --------- | --------------------------- |
| `color.ai.primary` | `#7C3AED` | AI assistant actions        |
| `color.ai.light`   | `#F3E8FF` | AI suggestion panels        |
| `color.ai.border`  | `#C4B5FD` | AI cards                    |
| `color.ai.text`    | `#5B21B6` | AI-generated content labels |

---

# Accessibility Rules

| Rule                      | Requirement                                                                           |
| ------------------------- | ------------------------------------------------------------------------------------- |
| Minimum text contrast     | WCAG AA (4.5:1 or higher)                                                             |
| Don't rely on color alone | Every status must include a label and an icon                                         |
| Workflow colors           | Reserved exclusively for project and payment statuses                                 |
| Keyboard focus            | All interactive elements must display a visible focus ring using `color.border.focus` |
| Tables                    | Use zebra striping and sticky headers to improve readability for large PAP datasets   |
