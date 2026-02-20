# 🛡️ Project Stability & Quality Checklist

To maintain the premium standard of the Golden Tower Spa application and avoid long technical debt "clean-up" marathons, follow this **Pre-Flight Stability Protocol** during development.

## 🚀 The Build-Ready Commands
*Run these frequently to ensure the site never "breaks" stealthily.*

1. **Type Check Pulse**: `npx tsc --noEmit`
   - *Frequency*: Every 60 minutes or after finishing a component.
   - *Goal*: 0 Errors. Stop and fix any red lines immediately.
2. **Production Dry-Run**: `npm run build`
   - *Frequency*: Before every major commit/push.
   - *Goal*: Confirm the Vite bundler can successfully compile the project for live deployment.

## 💎 The Golden Rules of Type Safety
*Adhere to these patterns to prevent "Implicit Any" or "Mismatch" errors.*

1. **Single Source of Truth**:
   - 🚫 **Never** define local interfaces for `Booking`, `Therapist`, or `Service`.
   - ✅ **Always** import them from `src/types/index.ts`.
2. **Strict Render Callback Typing**:
   - 🚫 Do not allow `map((b) => ...)` or `reduce((sum, r) => ...)` to have implicit `any` types.
   - ✅ Explicitly type all parameters: `map((booking: Booking) => ...)` or `(sum: number, r: Review)`.
3. **React Casing & Hooks**:
   - 🚫 Standard HTML attributes (e.g., `fetchpriority`) are forbidden.
   - ✅ Use React-specific camelCase (e.g., `fetchPriority`).
   - ✅ Ensure all hooks used (`useMemo`, `useCallback`) are imported at the top of the file.

## Core Principles

1.  **Always Build**: Every task—no matter how small—must conclude with a successful `npm run build` to catch viewport clippings, type errors, or bundling issues.
2.  **Type Safety First**: Never use `any` unless absolutely necessary (mostly for legacy data).
3.  **Visual Verification**: Always check mobile vs desktop responsiveness, especially for modals and pickers.

## 🔐 Database & Security Checks
1. **RLS Verification**: If adding a new table, ensure Row Level Security (RLS) is enabled and an "anon" policy is added if guests need access.
2. **Edge Function CORS**: Any new Edge Function MUST have the CORS header helper applied to prevent browser blockage.

---
*Stability is not a final step; it is a continuous ritual.*
