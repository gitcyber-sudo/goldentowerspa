# ✨ Golden Tower Spa

> **Luxury Wellness & Traditional Hilot in Quezon City**

A premium, full-stack spa booking website built with React 18, Vite, Tailwind CSS, GSAP, and Supabase. Features cinematic scroll animations, a real-time booking system, an admin dashboard, and PWA support.

---

## 🏛️ Architecture

| Layer | Tech |
|---|---|
| **Frontend** | React 18 · TypeScript · Tailwind CSS 3 |
| **Animations** | GSAP 3 · ScrollTrigger · matchMedia |
| **Backend** | Supabase (Postgres + Auth + RLS) |
| **Deployment** | Vercel (SPA) · Edge Functions |
| **PWA** | Service Worker · Manifest · Install Prompt |

## 🎨 Design System

- **Palette:** Gold (`#C5A059`) · Cream (`#F9F7F2`) · Charcoal (`#1A1A1A`)
- **Typography:** Playfair Display (serif) + Inter (sans-serif)
- **Fluid Scale:** `clamp()`-based responsive sizing (xs → 6xl)

## 🗂️ Project Structure

```
src/
├── components/          # 29 React components
│   ├── admin/           # Admin sub-components (BookingsTab, Sidebar, etc.)
│   └── modals/          # Booking/Edit/Therapist modals
├── context/             # AuthContext, AnalyticsContext
├── hooks/               # useBooking, useAnalytics, useSEO, useScrollAnimation
├── layouts/             # MainLayout
├── lib/                 # supabase.ts, utils.ts
└── types/               # Shared TypeScript interfaces
public/
├── manifest.json        # PWA manifest
├── sw.js                # Service Worker
├── sitemap.xml          # XML Sitemap
├── robots.txt           # Crawler directives
├── services/            # Service images
└── therapists/          # Therapist photos
```

## ✨ Key Features

### Public-Facing
- **Cinematic Hero** with GSAP parallax, zoom-in, and floating text
- **Services Section** with signature/express/package categorization
- **3D Cover Flow Carousel** for Express Massage on mobile
- **Horizontal Scroll Visual Journey** (desktop)
- **Home Service Booking** section
- **Therapist Showcase** with staggered entrance animations
- **Sanctuary / Contact** section with embedded Google Maps
- **Guest Booking** (no account required) + Authenticated Booking

### Admin Dashboard
- **Bookings Management** — View, approve, decline, edit, assign therapists
- **Therapist Management** — Add, edit, activate/deactivate, password reset
- **Analytics** — Revenue tracking, therapist performance, booking trends
- **Client Intelligence** — Repeat customer insights

### Security
- **Content-Security-Policy** (script, style, img, connect, frame restrictions)
- **Row-Level Security** (RLS) on all Supabase tables
- **Honeypot Field** + Client-Side Rate Limiting on booking form
- **Visitor ID System** for anonymous booking tracking
- **Inactivity Auto-Logout** for authenticated sessions

### SEO
- Open Graph + Twitter Card meta tags
- JSON-LD structured data (`DaySpa` schema)
- XML Sitemap + robots.txt
- Canonical URL
- Noscript fallback content
- LCP image preload

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

### Environment Variables
Create `.env.local`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## 📊 Assessment Score: 8.4 / 10

See [WEBSITE_ASSESSMENT.md](./WEBSITE_ASSESSMENT.md) for a comprehensive analysis covering design, code quality, security, accessibility, and performance.

## 📝 License

Private · © 2026 Golden Tower Spa

---

*Built with ❤️ and ☕ by a dev who takes spa websites way too seriously.*
