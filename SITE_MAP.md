# Golden Tower Spa - Site Structure & Architecture

This document provides a comprehensive overview of the pages, sections, and interactive components of the Golden Tower Spa website.

---

## 1. Public Experience (Landing Page - `/`)
The primary entry point for all visitors, designed with high-end aesthetics and a mobile-first approach.

### Key Sections:
- **Header**: Sticky navigation with dynamic "Book Appointment" button.
- **Hero Section**: Cinematic introduction with slow-zoom background and "Book Your Relaxation" CTA.
- **Philosophy**: Heritage story detailing the Hilot tradition and spa values.
- **Visual Journey**: High-resolution gallery showcasing the luxury spa environment.
- **Services Menu**: Comprehensive listed rituals categorized by type (Signature, Regular, Express, Packages).
- **Therapists**: Profiles of the spa specialists.
- **Footer**: Brand story, contact details, and site navigation.

---

## 2. Protected Dashboards (Role-Based)
Access is restricted based on user role (`user`, `admin`, or `therapist`).

### Client Dashboard (`/dashboard`)
*The private sanctuary for guests to manage their wellness journey.*
- **Overview**: Personalized greeting and membership duration.
- **Ritual Countdowns**: Real-time trackers (Days:Hours:Mins:Secs) for ALL upcoming appointments.
- **Wellness Stats**: Summary of active, completed, and total treatments.
- **Treatment History**: Access to current and past appointment details.
- **Support Hub**: One-tap access to call, locate, or rate the specialist.

### Admin Command Center (`/admin`)
*Management portal for spa operations and analytics.*
- **Revenue Highlight**: Financial tracking (Today, Completed, Pending).
- **Operations Dashboard**: Overview of all booking statuses and system health.
- **Booking Management**: Tools to confirm, assign specialists, edit, or cancel treatments.
- **Manual Booking**: Integrated tool for staff to enter walk-in or phone-in clients.
- **Analytics**: Dedicated views for Website Traffic and Revenue Trends.

### Specialist Dashboard (`/therapist`)
*Operational view for therapists to manage their daily rituals.*
- **Daily View**: Appointments grouped into "Morning Rituals," "Afternoon Glow," and "Evening Serenity."
- **Session Focus**: High-level indicators of treatment goals (e.g., Relaxation).
- **Performance Overview**: Track completed vs. upcoming sessions.

---

## 3. Global Overlays & Utilities
- **Booking Engine**: The "Tailor Your Ritual" multi-step flow.
- **Authentication**: Modern, secure sign-in/up interface with role-based redirection.
- **Mobile FAB**: Persistent "Book Now" floating action button for mobile users.
- **System Services**: Automated email confirmations and database synchronization via Supabase.

---
*Last Updated: January 30, 2026*
