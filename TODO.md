# Sidebar Collapse Fix - Progress Tracker

## Steps

- [x] Plan approved by user
- [x] Step 1: Edit `DashboardLayout.tsx` - Add `sidebarCollapsed` state, pass collapsed/onToggle to Sidebar, use dynamic margin
- [x] Step 2: Edit `Sidebar.tsx` - Accept `collapsed` and `onToggle` as props, remove internal `useState(false)` for collapsed (replaced with `onToggle`)
- [x] Step 3: Verified files are clean - no `setCollapsed` references remain in `Sidebar.tsx`
- [ ] Step 3b: VSCode linter may need a refresh (the TS error shown earlier was stale - the file no longer contains `setCollapsed`)

