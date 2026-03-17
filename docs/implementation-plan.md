# GrantsApp — Implementation Plan

> Comprehensive, phased plan for building the GrantsApp hackathon MVP.  
> Use this document alongside `docs/project-idea.md` for product context.  
> **Last updated:** 2026-03-18

---

## Status

**All 6 phases are complete.** The app is fully functional end-to-end — from onboarding through program creation, application submission, milestone tracking, team management, analytics, and public discovery.

Active development is now tracked in `docs/next-session-handoff.md`, which describes the next set of features to build. This document is kept as **architectural reference only** — the schema decisions, data model rationale, and phase breakdowns remain accurate and useful context.

### What's Been Built

| Phase | Deliverable | Status |
|---|---|---|
| **Phase 1** | Schema + all Convex backend functions | ✅ Complete |
| **Phase 2** | Program management — create, edit, publish, status transitions | ✅ Complete |
| **Phase 3** | Applications + review — builder apply flow, manager review, project profiles | ✅ Complete |
| **Phase 4** | Milestone tracking — submission flow, manager review, progress tracking | ✅ Complete |
| **Phase 5** | Public discovery — grants explorer, projects explorer, builder profiles, org profiles | ✅ Complete |
| **Phase 6** | Team management + analytics dashboard | ✅ Complete |

### Full File Inventory

```
convex/
  schema.ts                     ✅ Full schema — all tables deployed
  users.ts                      ✅ Auth, onboarding, role switching
  programs.ts                   ✅ Full CRUD, status transitions, org stats
  applications.ts               ✅ Full lifecycle, listMine, listByOrg, listByProgram
  milestones.ts                 ✅ Full lifecycle, builder submit, manager review
  projects.ts                   ✅ Full CRUD, listPublic, getBySlug, builder stats
  organizations.ts              ✅ getMyOrg, getById, getBySlug
  organizationMembers.ts        ✅ Invite, role change, remove, listMembers
  activityLogs.ts               ✅ getUserActivity, getOrgActivity, logActivity helper
  notifications.ts              ✅ Backend complete — createNotification, getMyNotifications,
                                   getUnreadCount, markRead, markAllRead
  reviews.ts                    ✅ create, update, listByApplication
  profiles.ts                   ✅ getBuilderByUsername (public profile query)
  lib/
    auth.ts                     ✅ requireAuth, requireRole, requireOrgMember
    slugs.ts                    ✅ toSlug, uniqueProgramSlug, uniqueProjectSlug

app/
  page.tsx                      ⚠️  Still renders ComponentExample — needs landing page
  dashboard/
    page.tsx                    ✅ Role-aware overview, real data, activity feed
    layout.tsx                  ✅ Sidebar, role switching, manager modal
    programs/
      page.tsx                  ✅ Program list with stats and filters
      new/page.tsx              ✅ Create form (save draft + publish)
      [id]/page.tsx             ✅ Edit, status transitions, danger zone
    applications/
      page.tsx                  ✅ Role-aware list (builder + manager)
      [id]/page.tsx             ✅ Detail, review panel, withdraw
    milestones/
      page.tsx                  ✅ Role-aware list, progress strip
      [id]/page.tsx             ✅ Submit deliverables, manager review
    projects/
      page.tsx                  ✅ Builder project list
      new/page.tsx              ✅ Create project form
      [id]/page.tsx             ✅ Edit, stat strip, archive
    analytics/
      page.tsx                  ✅ Funnel, program breakdown, quick stats
    team/
      page.tsx                  ✅ Invite, role change, remove members
  grants/
    page.tsx                    ✅ Public grants explorer with filters
    [slug]/page.tsx             ✅ Program detail with apply CTA
    [slug]/apply/page.tsx       ✅ Full application form with milestone editor
  projects/
    page.tsx                    ✅ Public projects explorer with filters
    [slug]/page.tsx             ✅ Project detail with builder info
  builders/
    [username]/page.tsx         ✅ Public builder profile
  orgs/
    [slug]/page.tsx             ✅ Public org profile with programs and team
```

### Known Gaps & Next Work

The following are known gaps not covered in the original 6-phase plan. See `docs/next-session-handoff.md` for the full specification of each.

| Item | Description |
|---|---|
| Landing page | `app/page.tsx` still shows `ComponentExample` — needs a real marketing page |
| `/orgs` listing | Public page listing all organizations — not yet built |
| `/builders` listing | Public page listing all builders — not yet built |
| Profile link surfacing | Org names and `@usernames` throughout the UI are not yet linked to their profile pages |
| Builder dashboard placeholder | "Recent Applications" panel in dashboard overview shows a hardcoded placeholder |
| Program filter on analytics | Analytics shows aggregate only — no per-program drill-down |
| Program filter on applications | Manager applications page has no program filter in the UI |
| Milestone grouping by grant | Builder milestones page is a flat list — should be grouped by application/grant |
| In-app notifications UI | `notifications.ts` backend is complete but has no frontend surface |
| Inline project creation in apply form | Application form should allow creating a new project inline |
| Mobile sidebar | Dashboard sidebar has no collapse/drawer behaviour on small screens |

---

## Architecture Principles

These principles guided all implementation decisions and should continue to guide new work:

1. **Schema-first development** — define Convex tables, indexes, and validators before writing UI
2. **Convex functions as the API layer** — all business logic lives in queries/mutations/actions, never in components
3. **Role-aware everything** — every dashboard feature must respect `activeRole` and authorization checks
4. **Mechanism abstraction** — programs reference a `mechanism` type so new funding models plug in later
5. **Progressive enhancement** — Web2 first, Web3 integrations layered on after MVP is functional

---

## Data Model Reference

This schema is fully deployed. Treat it as the source of truth for understanding relationships.

```
users
  clerkId, email, name, username, avatar
  roles: ("builder" | "manager")[]
  activeRole: "builder" | "manager"
  onboardingComplete: boolean
  bio?, skills?, github?, twitter?, website?, walletAddress?

organizations
  managerId → users._id
  name, slug, description
  logo?, website?, twitter?, github?

organizationMembers
  organizationId → organizations._id
  userId → users._id
  role: "owner" | "admin" | "reviewer"
  invitedBy → users._id
  status: "active" | "invited" | "removed"

programs
  organizationId → organizations._id
  createdBy → users._id
  name, slug, description
  mechanism: "direct" | "milestone"
  status: "draft" | "active" | "paused" | "closed" | "completed"
  budget?, currency?, maxGrantAmount?
  eligibilityCriteria?, applicationRequirements?
  applicationStartDate?, applicationEndDate?, reviewStartDate?, reviewEndDate?
  categories?, ecosystems?
  applicationCount, approvedCount, totalAllocated  ← denormalized

applications
  programId → programs._id
  applicantId → users._id
  projectId? → projects._id
  title, description
  requestedAmount?, proposedTimeline?, teamDescription?, relevantLinks?
  status: "draft" | "submitted" | "under_review" | "approved" | "rejected" | "withdrawn"
  reviewNotes?, reviewedBy?, reviewedAt?, approvedAmount?
  submittedAt?

milestones
  applicationId → applications._id
  programId → programs._id
  applicantId → users._id
  title, description, deliverables?, amount?
  order, dueDate?
  status: "pending" | "in_progress" | "submitted" | "approved" | "rejected" | "revision_requested"
  submissionNotes?, submissionLinks?, submittedAt?
  reviewNotes?, reviewedBy?, reviewedAt?

projects
  ownerId → users._id
  name, slug, description
  logo?, coverImage?, website?, github?, twitter?, demoUrl?
  categories?, ecosystems?, teamMembers?
  applicationCount, grantCount, totalFunded  ← denormalized
  status: "active" | "archived"

reviews
  applicationId → applications._id
  reviewerId → users._id
  programId → programs._id
  decision: "approve" | "reject" | "request_changes"
  score?, feedback

activityLogs
  userId → users._id
  organizationId?, programId?, applicationId?, milestoneId?
  action: string   e.g. "application.submitted", "milestone.approved"
  description: string
  metadata?: string (JSON)

notifications
  userId → users._id
  type, title, message
  linkUrl?, programId?, applicationId?, milestoneId?
  read: boolean
  emailSent: boolean
```

---

## Key Implementation Patterns

These patterns are used consistently throughout the codebase. Follow them when adding new features.

**Auth in queries/mutations:**
```ts
// Convex side — always use helpers from convex/lib/auth.ts
const user = await requireAuth(ctx);
const { user, org } = await requireOrgMember(ctx, organizationId, "reviewer");
```

**Auth in React components:**
```tsx
const { isAuthenticated } = useConvexAuth();
const data = useQuery(someQuery, !isAuthenticated ? "skip" : { ...args });
```

**Role-aware rendering:**
```tsx
const isManager = currentUser?.activeRole === "manager";
```

**API casting pattern** (used throughout due to generated type limitations):
```tsx
const result = useQuery((api as any).module.functionName, { ...args });
const mutation = useMutation((api as any).module.mutationName);
```

**Loading + empty state pattern:**
```tsx
if (data === undefined) return <SkeletonLayout />;
if (!data || data.length === 0) return <EmptyState icon={...} title="..." description="..." />;
return <RealContent />;
```

**Two-step destructive action pattern:**
```tsx
{showConfirm ? (
  <div className="flex items-center gap-2">
    <span>Are you sure?</span>
    <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancel</Button>
    <Button variant="destructive" onClick={handleAction}>Confirm</Button>
  </div>
) : (
  <Button variant="outline" onClick={() => setShowConfirm(true)}>Delete</Button>
)}
```

---

## Tech Stack

- **Frontend:** Next.js 16 (App Router) + React 19 + Tailwind CSS 4
- **Backend:** Convex (functions + realtime database)
- **Auth:** Clerk v7 (with Convex JWT integration via `ConvexProviderWithClerk`)
- **UI:** shadcn base-ui + custom components + `@tabler/icons-react` + CVA + clsx + tailwind-merge
- **Package manager:** pnpm