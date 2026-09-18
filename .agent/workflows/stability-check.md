---
description: Project Stability & Quality Protocol
---

# 🛡️ Project Stability & Quality Protocol

Follow this protocol to maintain the premium standard of the Golden Tower Spa application. This document serves as both a manual guide for developers and an executable workflow for the AI agent.

## 🚀 The Build-Ready Commands (Execution)
*Run these after making significant changes to catch errors before they reach the user.*

// turbo
1. Type Check Pulse
Run `npx tsc --noEmit` to ensure 0 TypeScript errors. Stop and fix any red lines immediately.

// turbo
2. Production Dry-Run
Run `npm run build` to confirm the Vite bundler can successfully compile the project for live deployment and prevent "Failed to fetch module" errors.

3. Component Visual Check
Manual check of affected UI components (especially on mobile) to ensure layout integrity and styling (Tailwind classes).

## 💎 The Golden Rules of Type Safety
*Adhere to these patterns to prevent "Implicit Any" or "Mismatch" errors.*

1. **Single Source of Truth**:
   - 🚫 **Never** define local interfaces for `Booking`, `Therapist`, or `Service`.
   - ✅ **Always** import them from `src/types/index.ts`.
2. **Strict Render Callback Typing**:
   - 🚫 Do not allow `map((b) => ...)` or `reduce((sum, r) => ...)` to have implicit `any` types.
   - ✅ Explicitly type all parameters: `map((booking: Booking) => ...)` or `(sum: number, r: Review)`.
3. **React Casing & Hooks (Hook Integrity)**:
   - 🚫 Standard HTML attributes (e.g., `fetchpriority`) are forbidden.
   - ✅ Use React-specific camelCase (e.g., `fetchPriority`).
   - ✅ **Crucial**: Ensure ALL hooks used (`useRef`, `useMemo`, `useCallback`, `useEffect`) are explicitly imported from `'react'`. A single missing import will crash the component.

## 🔐 Database & Security Checks
1. **RLS Verification**: If adding a new table, ensure Row Level Security (RLS) is enabled and an "anon" policy is added if guests need access.
2. **Atomic Upserts (Race Prevention)**: ✅ **Always** use `.upsert()` with an `onConflict` clause for tracking, visitor logging, or settings updates. This prevents `409 Conflict` errors during rapid page reloads.
3. **Avoid Recursive RLS**: 🚫 **Never** call a function in an RLS policy that queries the same table it is protecting. This causes infinite loops and timeouts.
3. **JWT Metadata for Roles**: ✅ **Always** prefer checking roles directly from the JWT (e.g., `auth.jwt() -> 'app_metadata' ->> 'role'`) instead of table lookups in common security functions like `is_staff()`.
4. **Staff Identity Sync**: Any manual change to a user's role in the `profiles` table MUST be accompanied by an update to their `auth.users` metadata to ensure security policies remain in sync.
5. **Edge Function CORS**: Any new Edge Function MUST have the CORS header helper applied to prevent browser blockage.

## 🏁 Completion
Once all checks pass, proceed to `notify_user`.

---
*Stability is not a final step; it is a continuous ritual.*
