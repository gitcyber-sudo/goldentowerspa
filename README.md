<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Golden Tower Spa - Project Documentation

This project is a high-end spa booking system built with React, Vite, and Supabase.

## 🚀 Quick Start
1. **Prerequisites**: Node.js installed.
2. **Setup**:
   - `npm install`
   - Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`.
   - Set `GEMINI_API_KEY` in `.env.local` for AI features.
3. **Database**: Run `setup_auth_v2.sql` and `add_signature_and_packages.sql` in Supabase SQL Editor.
4. **Run**: `npm run dev`

## 🔐 Authentication & Access Control
- **Roles**: `user`, `therapist`, `admin`.
- **Protected Routes**:
  - `/dashboard`: User booking management.
  - `/therapist`: Therapist portal for assigned sessions.
  - `/admin`: Full management dashboard.
- **Social Login**: Google and Facebook integration (configured in Supabase Auth Providers).

## 📧 Email Templates
- Custom branded templates are located in `email-templates/`.
- Apply `confirm-signup.html` in Supabase > Authentication > Email Templates > Confirm Signup.
- **Note**: Free tier email limit is ~4/hour. Use social login or custom SMTP for production.

## 📊 Database Schema (Supabase)
- `profiles`: User roles and information.
- `services`: Spa treatments (filtered by category: `regular`, `signature`, `package`).
- `therapists`: Specialist profiles and ratings.
- `bookings`: Reservation records with status tracking.
- `therapist_feedback`: Client reviews.
- `analytics`: `page_views`, `visitors`, `analytics_events`.

## 🎨 Design Overhaul (In Progress)
The project is currently undergoing a complete design overhaul to enhance the premium feel while maintaining the core logic.

---
*Refer to the individual SQL scripts and email templates for technical details.*
