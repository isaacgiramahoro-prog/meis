# TODO: Add Finance / Review Information and Approval Tracking Module

## Documentation Updates
- [x] Update `context-app/architecture.md` - Add `finance/` row to Module Responsibilities table and System Boundaries

## Database Schema
- [x] Update `prisma/schema.prisma` - Add `FinanceDecision` enum and `FinanceReview` model with relations to Pap, Project, User
- [x] Update `Pap` model - Add `financeReviews` relation

## Validations
- [x] Update `lib/validations.ts` - Add finance review validation interfaces and functions

## API Routes
- [x] Create `app/api/finance/route.ts` - GET list with search/status filters & POST create finance review
- [x] Create `app/api/finance/[id]/route.ts` - GET detail & PATCH update finance review decision
- [x] Create `app/api/projects/[id]/finance/route.ts` - GET project-level finance stats

## Components
- [x] Create `components/FinanceModals.tsx` - RecordFinanceReviewModal component

## Pages
- [x] Create `app/finance/page.tsx` - Finance review list page with stats cards, search, status filter, table
- [x] Create `app/finance/[id]/page.tsx` - Finance review detail page with PAP info, review history

## Sidebar
- [x] Update `components/Sidebar.tsx` - Add Finance navigation link with appropriate icon and roles

## Progress Tracker
- [x] Update `context-app/progress-tracker.md` - Mark Finance phase complete

