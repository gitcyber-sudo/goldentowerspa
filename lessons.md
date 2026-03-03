# 🧠 Technical Lessons & Preventative Rules

This document tracks critical technical insights gained from addressing bugs in the Golden Tower Spa project. These rules are designed to prevent regressions and improve system stability.

## 🛡️ Critical Stability Rituals
*Refined from the @/stability-check workflow*

1.  **Pulse Check**: After any structural or logic change, run `npx tsc --noEmit` to ensure type integrity.
2.  **Dry Build**: Run `npm run build` before notifying the user of completion to catch Vite/bundler module resolution failures.

## ⚛️ React & State Management Rules

### 1. Atomic Identity Transitions
> [!IMPORTANT]
> **Mistake**: Transitioning `loading` to `false` too early during the "identity restoration" phase.
- **Rule**: Never unblock the UI (`setLoading(false)`) until the user identity is definitive.
- **Implementation**: In `AuthContext`, ensure that if a session exists, the `user` state is fully committed to the context before `loading` is set to `false`. For guest states, only unblock after both `getSession` and the `INITIAL_SESSION` event confirm no user is present.

### 2. Dependency Discipline in Effects
> [!WARNING]
> **Mistake**: Using complex objects like `profile` or `user` as `useEffect` dependencies, causing reference-based infinite loops.
- **Rule**: Prefer primitive IDs for dependencies. 
- **Example**: Use `[user?.id, authLoading]` instead of `[user, profile]`. This prevents re-fetches when non-critical object fields change (like background metadata syncs).

### 3. Fetch/Race Prevention (The "Active Ref" Pattern)
- **Rule**: Protect data fetches from rapid re-renders using `useRef` for tracking active request IDs or states.
- **Implementation**: 
    - Use an `AbortController` in `useEffect` cleanups to cancel pending requests.
    - Use a ref (e.g., `activeFetchUserIdRef`) to prevent parallel identical fetches from multiple auth listeners.

## 🛠️ Refactoring & Code Injection Safety

### 1. Scope Awareness
- **Rule**: When using `multi_replace_file_content` or `replace_file_content`, always check the surrounding 50 lines for existing variable declarations.
- **Validation**: If a variable like `currentUser` or `data` is used in a block, grep the file to ensure it isn't already defined in the target scope.

### 2. Compounding Edit Corruption
> [!CAUTION]
> **Mistake**: Multiple sequential edits on `RevenueDashboard.tsx` led to "tag rot" (e.g., `< div`, `</ div >`) and duplicated UI blocks when a tool tried to recover from a failed match.
- **Rule**: If an edit fails or feels "messy," DO NOT continue building on top of it. Stop, view the file, and perform a structural cleanup immediately.
- **Validation**: Grep for common corruption patterns like `< div`, `</ div`, or duplicated comments after complex merges.

### 3. Artifact Path Discipline
- **Rule**: Always confirm the absolute path for `brain` artifacts (e.g., `walkthrough.md`) before writing to avoid creating "ghost" files in the wrong directories.

## 🔐 Security & Database
- **RLS Consistency**: Ensure any role changes in the `profiles` table are mirrored in `auth.users` metadata via `supabase.auth.updateUser` to keep Row Level Security policies active and fast.

## 🖼️ UI/UX Design Lessons
### 1. Shared Component State & Media Framing
- **Context vs. Local State**: Reusing complex headers/footers in new pages (like `Availability.tsx`) requires careful checking of their expected prop handlers. Missing `onLoginClick` handlers can lead to "broken" buttons that are hard to debug without looking at the parent page.
- **CSS Media Framing**: For portrait-style profile photos, `object-fit: cover` can often crop heads if the aspect ratio isn't perfect. While `object-top` is a good default, using custom percentages like `object-position: center 35%` can help "cut" empty space at the top while keeping the face centered and revealing more of the lower subject area in responsive containers.
- **Modal Viewport Awareness**: When designing premium modals with large images, always include `max-h-[90vh]` and `overflow-y-auto` as a safety measure for varying screen heights (like laptops vs large monitors) to prevent content clipping.

### 2. Tabular Data & Detail Expansion
- **React.Fragment in Tables**: To implement expandable rows in a standard HTML table without breaking the semantics, wrap the master row and its detail row in a `<React.Fragment>`. This allows for clean "Breakdown" views that share the same context as the parent row.
- **Mobile Detail Cards**: For mobile views where tables are converted to cards, use a nested container with `animate-in slide-in-from-top-2` (Tailwind/Vite pattern) to provide a smooth, responsive expansion experience for detailed data like service breakdowns.

## 🎬 IntroLoader / Loading Screen Lessons

### 1. Never Gate Loader Visibility on Network Requests
> [!CAUTION]
> **Mistake**: `IntroLoader` used `useAssetPreloader` to `fetch()` critical media assets. When assets failed (`net::ERR_FAILED`), the catch handler marked them as 100% complete — causing the loader to exit instantly and become invisible.
- **Rule**: Loading screens must always have a **time-based minimum display** independent of asset loading. Use `setTimeout` or a GSAP proxy, not real download progress.
- **Implementation**: `MIN_DISPLAY_TIME = 3000ms` via `setTimeout(() => setMinTimePassed(true), MIN_DISPLAY_TIME)`. Exit only fires when both animation AND timer are done.

### 2. GSAP Target Selection in React — Use `querySelectorAll`, Not `.children`
> [!WARNING]
> **Mistake**: `textRef.current?.children` returns an `HTMLCollection` of the direct `<div>` wrappers, not the `<span>` elements inside them. GSAP animated the wrong elements, so text never revealed.
- **Rule**: Use `querySelectorAll('span')` to target specific nested elements. Spread the `NodeList` into an array: `[...(ref.current?.querySelectorAll('span') || [])]`.
- **Rule**: Use `gsap.set()` for initial animation states instead of React inline `style={{ opacity: 0 }}` — keeps GSAP in full control of the lifecycle.

## 🚨 Global Error Handling Lessons

### 1. Global Error Handlers Catch EVERYTHING
> [!IMPORTANT]
> **Mistake**: `window.addEventListener('error')` and `window.addEventListener('unhandledrejection')` in `index.tsx` called `alert()` on ANY error, including Vite HMR WebSocket failures, `net::ERR_FAILED` on media files, SW registration errors, and fetch failures.
- **Rule**: In dev mode, NEVER show `alert()`. Only log to console.
- **Rule**: In production, filter out resource/network noise. Only alert for genuine JS crashes.
- **Noise filter list**: `WebSocket`, `vite`, `HMR`, `net::`, `NetworkError`, `Failed to fetch`, `Load failed`, `AbortError`, `TypeError: cancelled`, `ServiceWorker`.

### 2. Error Logger Must Be Fire-and-Forget
> [!WARNING]
> **Mistake**: The error logger (`import('./lib/errorLogger').then(...)`) can itself produce an unhandled rejection if the dynamic import or Supabase call fails — causing an infinite error loop.
- **Rule**: Always wrap error logging in `.catch(() => {})` so it never cascades.
- **Implementation**: `silentLog` helper that does `import(...).then(...).catch(() => {})`.

## 🌐 Vite Dev Server Quirks

### 1. Large Media Files May Fail to Serve
- **Observation**: Vite sometimes fails to serve large files (`hero.mp4` ~2.8MB) from `public/` with `net::ERR_FAILED` during local dev. Smaller images load fine. Production builds are unaffected.
- **Rule**: Don't assume `public/` assets will always serve correctly during dev. Design critical paths (like loaders) to degrade gracefully.
