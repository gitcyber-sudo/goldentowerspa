# 🏆 Golden Tower Spa — Full Website Assessment & Roast

> **Analyzed**: 25+ source files, Supabase backend policies, PWA config, auth flows, CSS architecture, and deployment setup.
> **Date**: 2026-02-17

---

## Overall Rating: ⭐ 7.2 / 10

| Category | Score | Verdict |
|---|---|---|
| **Visual Design & Branding** | 8.5/10 | Premium, cohesive luxury aesthetic |
| **Tech Stack & Architecture** | 7.5/10 | Modern and well-structured |
| **UX & Accessibility** | 6.5/10 | Good flow, weak on a11y |
| **Code Quality** | 6.5/10 | Functional but has bloat |
| **Security** | 5.0/10 | ⚠️ Multiple critical issues |
| **Performance** | 7.5/10 | Good optimizations, some gaps |
| **SEO** | 8.0/10 | Solid meta tags & Open Graph |

---

## 🌟 THE GOOD

### 1. Premium Visual Identity
The gold/cream/charcoal color palette across [tailwind.config.js](file:///c:/Users/User/Documents/AntiGravity%20Projects/goldentowerspa/goldentowerspa/tailwind.config.js) and [index.css](file:///c:/Users/User/Documents/AntiGravity%20Projects/goldentowerspa/goldentowerspa/src/index.css) is genuinely luxurious. The Playfair Display + Inter font pairing is chef's kiss. The custom scrollbar, shimmer effects, glassmorphism panels, and animated card borders all scream "we spent money on this." For a spa in Quezon City, this brand identity punches **well** above its weight.

### 2. Hero Section Animation Quality
The [Hero.tsx](file:///c:/Users/User/Documents/AntiGravity%20Projects/goldentowerspa/goldentowerspa/src/components/Hero.tsx) is genuinely cinematic. Parallax scrolling, staggered text reveals, blur-to-sharp transitions, and a floating "Spa" title that breathes — all using GSAP `matchMedia` for separate desktop/mobile animation timelines. This is proper frontend craftsmanship, not "I-just-added-AOS.js" energy.

### 3. Smart Auth Architecture
The [AuthContext.tsx](file:///c:/Users/User/Documents/AntiGravity%20Projects/goldentowerspa/goldentowerspa/src/context/AuthContext.tsx) is surprisingly robust:
- **Inactivity auto-logout** (10 min) — a real security feature most spa sites would never think about
- **Guest booking claiming** — visitors can book without an account and later link those bookings
- **Race condition handling** with `fetchProfileRef` and a global safety timeout
- **Role-based auto-redirect** on sign-in

### 4. Well-Structured Routing & Role System
[App.tsx](file:///c:/Users/User/Documents/AntiGravity%20Projects/goldentowerspa/goldentowerspa/src/App.tsx) cleanly separates three user types: `admin`, `therapist`, `user` — each with dedicated dashboards and [ProtectedRoute.tsx](file:///c:/Users/User/Documents/AntiGravity%20Projects/goldentowerspa/goldentowerspa/src/components/ProtectedRoute.tsx) guards. The role mismatch redirect logic is smart.

### 5. SEO Done Right
[index.html](file:///c:/Users/User/Documents/AntiGravity%20Projects/goldentowerspa/goldentowerspa/index.html) has proper Open Graph tags, Twitter Cards, canonical URL, keywords meta, a descriptive `<title>`, and a dynamic `useSEO` hook for route-specific titles. LCP image preloading is in place. This is more SEO work than 90% of small business sites.

### 6. PWA Implementation
Proper `manifest.json`, service worker with stale-while-revalidate strategy, cache versioning, and a dedicated `PWAInstallPrompt` component. The service worker even correctly excludes Supabase API calls from caching.

### 7. Deployment & Caching Strategy
[vercel.json](file:///c:/Users/User/Documents/AntiGravity%20Projects/goldentowerspa/goldentowerspa/vercel.json) has proper SPA rewrites, `must-revalidate` on `index.html`, and aggressive 1-year immutable caching on static assets. The cache buster in `index.html` is a nice belt-and-suspenders approach.

### 8. Motion & Accessibility Awareness
`prefers-reduced-motion` media query is respected in [index.css](file:///c:/Users/User/Documents/AntiGravity%20Projects/goldentowerspa/goldentowerspa/src/index.css). This is a rare and thoughtful touch for a small business website.

---

## 💀 THE BAD (and The Roast)

### 1. "Services.bak.tsx" and "VisualJourney.bak.tsx" — Really?
You're shipping `.bak` files in your `src/components` directory like this is a cPanel hosting account from 2008. That's **47KB** of dead code sitting in your repo doing absolutely nothing except confusing everyone. This isn't a backup strategy, it's digital hoarding. Use Git branches like a civilized developer.

### 2. The Admin Login Shortcut is Hilarious
```typescript
// AuthModal.tsx, line 43
if (loginEmail.toLowerCase() === 'admin') {
    loginEmail = 'admin@goldentowerspa.ph';
}
```
The email placeholder literally says `"Email or 'admin'"`. So *anyone* who visits the site knows there's an admin account, and they know the username is just "admin". The only thing stopping them is the password. You basically put a sign on the front door that says *"The vault is behind this curtain."*

### 3. Therapist Login Via Name Lookup = Username Enumeration
[TherapistLogin.tsx](file:///c:/Users/User/Documents/AntiGravity%20Projects/goldentowerspa/goldentowerspa/src/components/TherapistLogin.tsx) does `ilike('full_name', formData.name.trim())` to find a therapist. This means:
- **Anyone** can probe therapist names by trying to login and checking for "Specialist account not found" vs "Invalid credentials"
- The error messages are different depending on whether the name exists or not — textbook username enumeration
- The placeholder even says `"e.g. Test Therapist"` 🎯

### 4. Debug Scripts Committed to Repo
You have `debug-scripts.js`, `debug-utils.js`, `fix_shiatsu.js`, `test_booking.js`, and `verify_therapist_flow.cjs` all sitting in the root directory. This is production code, not your personal scratch pad. These files combined are **16KB** of stuff that should be in a `scripts/` folder (at best) or `.gitignore`'d entirely.

### 5. Console.log Everywhere Like It's a Diary
```
"Auth event triggered:", event
"Fetching profile for:", userId  
"Profile loaded successfully:", data.role
"Claiming guest bookings for:", userId
"Auto-redirecting to /admin..."
"SW registered: ", registration
```
Anyone opening DevTools sees your entire authentication flow narrated in real-time. It's like leaving your diary open on the café table. This leaks auth flow internals, user IDs, and role information to literally anyone with F12.

### 6. ~49KB AdminDashboard.tsx = A Monster File
[AdminDashboard.tsx](file:///c:/Users/User/Documents/AntiGravity%20Projects/goldentowerspa/goldentowerspa/src/components/AdminDashboard.tsx) is **49,267 bytes**. That's a novella, not a component. Split it up. This file likely handles bookings, therapists, analytics, and settings all in one place. The component tree should be deeper, not wider.

### 7. `@playwright/test` as a Production Dependency
```json
"dependencies": {
    "@playwright/test": "^1.58.0",  // ← WHY
```
You have an end-to-end testing framework installed as a **production** dependency. This means it gets bundled (or at minimum installed) in production. It should be in `devDependencies`. This is like bringing your toolbox to a dinner party.

### 8. Missing TypeScript Strict Mode
[tsconfig.json](file:///c:/Users/User/Documents/AntiGravity%20Projects/goldentowerspa/goldentowerspa/tsconfig.json) likely doesn't enforce strict null checks. Evidence: `profile: any | null` in the auth context. Using `any` in a TypeScript project is like installing a security system but leaving the window open.

### 9. Footer Links Go Nowhere
```html
<a href="#">Gift Cards</a>
<a href="#">Membership</a>
<a href="#">Privacy Policy</a>
<a href="#">Terms of Service</a>
```
Four `href="#"` links in the [Footer](file:///c:/Users/User/Documents/AntiGravity%20Projects/goldentowerspa/goldentowerspa/src/components/Footer.tsx). It's 2026 and you don't have a Privacy Policy page? That's not just lazy — depending on your jurisdiction (GDPR implications for foreign tourists, PH Data Privacy Act), it could be a legal liability.

### 10. No Rate Limiting on Booking Form
The [BookingModal.tsx](file:///c:/Users/User/Documents/AntiGravity%20Projects/goldentowerspa/goldentowerspa/src/components/BookingModal.tsx) inserts directly into the `bookings` table with zero client-side or backend throttling. A mildly annoyed competitor could flood you with 10,000 fake bookings using a simple for loop and the `anon` key.

---

## 🔐 SECURITY ANALYSIS

### 🔴 CRITICAL Issues

| # | Finding | Location | Risk |
|---|---|---|---|
| 1 | **Vercel OIDC Token exposed** | [.env.local](file:///c:/Users/User/Documents/AntiGravity%20Projects/goldentowerspa/goldentowerspa/.env.local) line 2 | The full Vercel OIDC JWT token is stored in `.env.local`. While `.env.local` is in `.gitignore`, if this file was *ever* committed, the token is compromised. It also contains the Vercel owner and project IDs. **Verify it was never committed in Git history.** |
| 2 | **RLS Completely Disabled** on `edge_function_logs` | Supabase DB | This table is publicly accessible with zero row-level security. Anyone with the anon key can read all your edge function logs. |
| 3 | **SECURITY DEFINER View** `daily_email_usage` | Supabase DB | This view runs with the creator's permissions, bypassing RLS for the querying user. If the view creator has elevated privileges, any user querying this view inherits those privileges. |

### 🟡 HIGH Issues

| # | Finding | Detail |
|---|---|---|
| 4 | **Overly permissive RLS** on 5 tables | `bookings`, `analytics_events`, `page_views`, `visitors`, and `therapist_feedback` all have `WITH CHECK (true)` INSERT policies. Anyone can insert arbitrary data into these tables using the anon key. |
| 5 | **`visitors` table allows unrestricted UPDATE** | Both USING and WITH CHECK are `true`. Any anonymous user can update ANY visitor record, not just their own. |
| 6 | **Leaked password protection disabled** | Supabase Auth is not checking passwords against HaveIBeenPwned. Users can sign up with `password123` and you'd allow it. |
| 7 | **Mutable search_path** on `handle_new_user` and `link_guest_bookings` | These database functions don't set a fixed `search_path`, making them potentially exploitable through search path injection. |
| 8 | **Client-side only role enforcement** | All role checks happen in React code (`ProtectedRoute.tsx`, `AuthContext.tsx`). There's no evidence of Supabase RLS policies that restrict admin operations to admin users at the DB level. A savvy user with the JWT could call Supabase APIs directly. |

### 🟢 GOOD Security Practices

| Practice | Detail |
|---|---|
| ✅ `.env.local` in `.gitignore` | Environment variables are excluded from version control |
| ✅ Supabase anon key (not service key) in frontend | Correct use of public anon key, not the service role key |
| ✅ `sourcemap: false` in production build | Source maps disabled to prevent code inspection |
| ✅ Auto-logout on inactivity | 10-minute inactivity timer for authenticated users |
| ✅ Proper CORS headers on edge functions | Edge functions include explicit CORS handling |
| ✅ Session cleanup on sign out | Thorough clearing of localStorage tokens, including manual key cleanup |

---

## 🎯 Recommendations (Priority Order)

1. **Fix RLS policies immediately** — especially the `visitors` UPDATE and `edge_function_logs` missing RLS
2. **Enable leaked password protection** in Supabase Auth settings
3. **Remove the admin shortcut** from `AuthModal.tsx` — use the full email
4. **Strip all `console.log`** statements from auth and profile flows (use a logger that's disabled in production)
5. **Move `@playwright/test` to `devDependencies`**
6. **Delete `.bak` files** and debug scripts from the repository
7. **Set `search_path`** on `handle_new_user` and `link_guest_bookings` functions
8. **Implement server-side rate limiting** on the bookings endpoint
9. **Create actual Privacy Policy and Terms of Service pages**
10. **Split `AdminDashboard.tsx`** into smaller composable components

---

## 🔥 The Final Roast

Look, Golden Tower Spa's website *looks* like it costs $15,000. The animations are smooth, the color palette is consistent, and the brand identity is strong. But peel back the gold foil and you'll find `.bak` files chilling next to Playwright in production, an admin login that says "hey, try 'admin'!", RLS policies that essentially say "come on in, the data's fine!", and console.logs narrating your entire authentication story to anyone with a keyboard shortcut.

It's like building a beautiful spa with marble floors and crystal chandeliers... but forgetting to put locks on the doors. The aesthetics are real, the engineering has moments of brilliance (that auth inactivity timer? genuinely thoughtful), but the security posture needs a **spa day of its own**.

**TL;DR**: Gorgeous website. Terrifying backend. Fix the security, clean the dead code, and you've got a legit 8.5/10 product.
