

# Production Readiness Plan (Non-Supabase Focus)

## Summary
This plan addresses UI/UX issues, code quality problems, and usability gaps to get the app production-ready, while leaving Supabase/database concerns aside.

---

## 1. Graceful Degradation When Supabase Is Unavailable

**Problem**: When Supabase is paused/unreachable, the app shows error toasts and empty states everywhere. The Projects page falls back to mock data, but FeaturedProjects on the homepage does not -- it just shows "Loading projects..." or an error.

**Fix**:
- In `FeaturedProjects.tsx`: Fall back to `mockProjects` when the Supabase fetch fails (currently the catch block toasts but doesn't set any data)
- In `ProjectDetail.tsx`: Show a friendlier error state instead of just "Project Not Found" when the fetch fails due to connectivity
- Suppress repetitive error toasts across the app -- show one consolidated message instead of multiple

---

## 2. Remove Dead/Stub Code

**Problem**: Several components exist as no-ops that add confusion:
- `AuthGuard.tsx` -- always renders children, does nothing
- `WaitlistGuard.tsx` -- always renders children, does nothing
- `WaitlistDialog.tsx`, `WaitlistForm.tsx`, `PreviewMessage.tsx` -- likely unused leftovers
- `WaitlistContext.tsx` has hardcoded demo email and bypass logic

**Fix**:
- Remove `AuthGuard.tsx` and `WaitlistGuard.tsx` (and any imports)
- Audit and remove `WaitlistDialog.tsx`, `WaitlistForm.tsx`, `PreviewMessage.tsx` if unused
- Clean up `WaitlistContext` -- remove the fake demo email, keep the project CRUD functions it provides

---

## 3. Fix "My Projects" Page -- Shows All Projects

**Problem**: `getUserProjects()` in `WaitlistContext` fetches ALL projects (`select('*')` with no user filter). The "My Projects" page should only show projects owned by the current user.

**Fix**:
- Filter by `user_id` matching the authenticated user in `getUserProjects()`
- If no user is authenticated, return empty array
- Add auth check on the My Projects page redirecting unauthenticated users to sign in

---

## 4. Fix Duplicate Projects on Projects Page

**Problem**: `Projects.tsx` fetches from Supabase AND appends all `mockProjects`, leading to duplicates when Supabase has data. Mock projects also have simple string IDs ("1", "2", etc.) which could collide with real UUIDs.

**Fix**:
- Remove the mock project merging from `Projects.tsx` -- real projects only
- Keep mock data as fallback only when Supabase is completely unreachable
- Remove or repurpose `mockProjects.ts` (or keep solely for offline fallback)

---

## 5. Votes Are Local-Only (localStorage)

**Problem**: Votes are stored only in `localStorage` via `voteUtils.ts`. They don't persist across devices/browsers and aren't tied to a user account.

**Fix** (non-Supabase approach):
- Add a notice to users that votes are stored locally
- Alternatively, just document this as a known limitation for now
- No code change needed if we accept this as-is for MVP

---

## 6. Mobile Responsiveness Issues

**Problem**: The navbar doesn't have a mobile hamburger menu. On 390px viewport, navigation links stack poorly.

**Fix**:
- Add a mobile hamburger menu (Sheet/Drawer) to the Navbar
- Collapse nav links behind the menu on small screens
- Ensure all pages have proper padding and don't overflow on mobile

---

## 7. Missing Page Title / Meta Tags

**Problem**: `index.html` likely has generic titles. No SEO meta tags, no Open Graph tags for social sharing.

**Fix**:
- Update `index.html` with proper title, description, OG tags
- Add a simple document title hook that updates per-page

---

## 8. Unused Imports and Import Path Inconsistencies

**Problem**: 
- `Navbar.tsx` still imports `Heart` and `UserCircle` but only uses `Heart` for the logo
- `ProjectCard.tsx` imports from `@/components/ui/use-toast` while others import from `@/hooks/use-toast`
- `Projects.tsx` imports `mockProjects` (ties to issue #4)

**Fix**:
- Clean up unused imports across all components
- Standardize toast imports to use `@/hooks/use-toast` everywhere

---

## 9. Protect Routes That Require Auth

**Problem**: `/add-project`, `/edit-project/:id`, `/my-projects`, `/profile` are accessible without authentication. No redirects or guards.

**Fix**:
- Create a functional `ProtectedRoute` wrapper that checks `useAuth()` and redirects to `/auth`
- Wrap the relevant routes in `App.tsx`

---

## 10. Image Upload Button Doesn't Trigger File Input

**Problem**: In `ImageUpload.tsx`, the Upload button is wrapped in a `<Label>` pointing to a hidden file input, but the Button inside has `type="button"` which may prevent the label click from propagating correctly in some browsers.

**Fix**:
- Make the label/button interaction more reliable by using `onClick` to programmatically trigger the file input

---

## Implementation Order

1. Mobile navbar (hamburger menu) -- highest UX impact
2. Graceful Supabase fallback with mock data
3. Remove dead code (guards, unused components)
4. Fix duplicate projects on Projects page
5. Fix My Projects to filter by current user
6. Protected routes
7. Clean up imports
8. Meta tags / SEO
9. Image upload fix
10. Votes disclaimer

---

## Technical Details

**Files to modify**: `Navbar.tsx`, `FeaturedProjects.tsx`, `Projects.tsx`, `App.tsx`, `WaitlistContext.tsx`, `MyProjects.tsx`, `ImageUpload.tsx`, `index.html`

**Files to delete**: `AuthGuard.tsx`, `WaitlistGuard.tsx`, possibly `WaitlistDialog.tsx`, `WaitlistForm.tsx`, `PreviewMessage.tsx`

**New files**: `ProtectedRoute.tsx` component

**No new dependencies needed** -- all fixes use existing libraries (react-router, shadcn/ui Sheet for mobile menu).

