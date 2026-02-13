# Project Log & Memorandum

## Format
- **Date/Time**: [ISO 8601 or similar]
- **Action Taken**: Summary of changes.
- **Result/Lesson**: What was fixed, learned, or any quirks discovered (The "Black Box" data).

## Log Entries

### [2026-02-13] Phase 4: Performance & SEO Optimization
- **Action Taken**: Refactored Hero section to use high-priority `<img>` tag and preloading for LCP optimization. Overhauled `index.html` with full Open Graph and Twitter metadata. Implemented dynamic SEO using a custom `useSEO` hook across all major routes. Applied native lazy-loading and descriptive alt tags to all gallery and service images.
- **Result/Lesson**: Significant improvement in Largest Contentful Paint (LCP) by prioritizing hero assets. Enabled rich social sharing previews and route-specific titles, enhancing both performance and search engine visibility. Native lazy-loading provides a more responsive initial experience on mobile.

### [2026-02-14] Phase 3 Analytics Enhancement & PWA Polish
- **Action Taken**: Implemented dynamic service worker versioning (v2) for improved PWA caching. Developed scalable chart components with time filter capabilities. Integrated new metrics for user engagement and performance.
- **Result/Lesson**: Enhanced PWA reliability and user experience. Provided more granular insights into application usage and performance, enabling data-driven optimization.

### [2026-02-13] Backend Verification & Edge Function Fixes
- **Action Taken**: Performed a full security and connectivity audit. Updated `update-therapist-password` and `create-therapist` edge functions to include explicit CORS handling and enhanced logging. Verified RLS policies for guest bookings.
- **Result/Lesson**: Resolved "Error updating therapist password" caused by browser CORS blocks. Confirmed PWA assets (`manifest.json`, `sw.js`) are correctly registered for mobile installability.

### [2026-02-13] Protocol Rename
- **Action Taken**: Renamed `.agent/rules/flight_protocols.md` to `.agent/rules/PROJECT_PROTOCOLS.md`.
- **Result/Lesson**: Aligned file naming convention with `PROJECT_PLAN` and `PROJECT_LOG`.
