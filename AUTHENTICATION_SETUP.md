# Golden Tower Spa - Authentication Setup Guide

## Overview
This guide will help you complete the authentication setup for the Golden Tower Spa booking system using Supabase.

## What's Been Implemented

### ✅ Frontend Components
1. **AuthContext** - Manages user authentication state
2. **AuthModal** - Sign up/Sign in modal dialog
3. **UserDashboard** - Customer dashboard to view bookings
4. **TherapistDashboard** - Therapist portal to view assigned sessions
5. **AdminDashboard** - Admin panel for managing all bookings
6. **Updated BookingModal** - Now requires authentication
7. **Updated Header** - Shows user profile menu when logged in

### ✅ Database Scripts Ready
1. **setup_auth_v2.sql** - Sets up authentication tables and policies
2. **setup_rls.sql** - Row Level Security policies

## Step-by-Step Setup Instructions

### 1. Run the Database Setup Scripts

You need to execute the SQL scripts in your Supabase dashboard:

#### A. Navigate to Supabase SQL Editor
1. Go to https://supabase.com
2. Open your Golden Tower Spa project
3. Click on "SQL Editor" in the left sidebar

#### B. Run setup_auth_v2.sql
1. Click "New Query"
2. Copy the entire content from `setup_auth_v2.sql`
3. Paste it into the SQL editor
4. Click "Run" or press Ctrl+Enter
5. Verify success message appears

**What this script does:**
- Creates `profiles` table to store user roles (user, therapist, admin)
- Adds `user_id` column to `bookings` table
- Adds `user_id` column to `therapists` table
- Creates automatic profile creation trigger on user signup
- Sets up Row Level Security (RLS) policies for role-based access

#### C. Verify Email Settings (Important!)
1. Go to "Authentication" > "Email Templates" in Supabase
2. Check if email confirmation is required
3. **For development**: You can disable email confirmation:
   - Go to "Authentication" > "Settings"
   - Under "Email Auth", toggle OFF "Confirm email"
4. **For production**: Keep email confirmation ON and configure SMTP

### 2. Test the Authentication Flow

#### A. Sign Up as a Regular User
1. Run your dev server: `npm run dev`
2. Click "Book Now" (this will prompt you to sign in)
3. Click "New here? Create Account"
4. Fill in:
   - Full Name: John Doe
   - Email: john@example.com
   - Password: password123
5. Sign up - you should be redirected to the booking form

#### B. View User Dashboard
1. After signing in, click on your profile name in the header
2. Click "My Dashboard"
3. You should see your bookings (current and past)

### 3. Create Admin and Therapist Users

#### A. Create Admin User
1. Sign up a new account via the UI (e.g., admin@goldentowerspa.ph)
2. Go to Supabase > "Table Editor" > "profiles"
3. Find the newly created profile
4. Change `role` from 'user' to 'admin'
5. Sign in with this account
6. Click profile menu → should see "My Dashboard" leading to Admin panel

#### B. Create Therapist Accounts
1. Sign up accounts for each therapist
2. Go to Supabase > "Table Editor" > "profiles"
3. Change their `role` to 'therapist'
4. Go to "Table Editor" > "therapists"
5. For each therapist record, set the `user_id` to match their profile ID
   - Get the user_id from the profiles table
   - This links the therapist account to their bookings

### 4. Test the Complete Flow

#### Test User Booking Flow:
1. Sign in as regular user
2. Click "Book Now"
3. Notice the booking form shows your name/email (pre-filled)
4. Complete the booking
5. Go to "My Dashboard" → see your booking
6. Try canceling a pending booking

#### Test Therapist Flow:
1. Sign in as therapist account
2. Access dashboard (should go to /therapist route)
3. View assigned bookings
4. See upcoming sessions and completed sessions

#### Test Admin Flow:
1. Sign in as admin
2. Access /admin dashboard
3. View all bookings
4. Update booking statuses (pending → confirmed → completed)
5. View therapist management

## Important Notes

### Database Policies
The current setup uses role-based access:
- **Users** can only see and manage their own bookings
- **Therapists** can only see bookings assigned to them
- **Admins** can see and manage everything

### Security Considerations
1. **Development Mode**: Current RLS policies allow public insert for bookings
2. **Production**: Review and tighten security policies
3. **API Keys**: Never commit `.env.local` to version control
4. **Password Requirements**: Minimum 6 characters (set in AuthModal)

### Troubleshooting

#### "User not authenticated" when booking
- Make sure you're signed in
- Clear browser cache and try again
- Check Supabase logs for auth errors

#### "Permission denied" errors
- Verify RLS policies are enabled
- Check user role is set correctly in profiles table
- Review Supabase logs for policy violations

#### Therapist can't see bookings
- Verify `user_id` in therapists table matches their auth ID
- Check that bookings have correct `therapist_id`

#### Email confirmation not working
- For dev: Disable email confirmation in Supabase settings
- For prod: Configure SMTP settings in Supabase

## Routes Summary

| Route | Access | Purpose |
|-------|--------|---------|
| `/` | Public | Main spa website |
| `/dashboard` | Authenticated Users | User booking dashboard |
| `/therapist` | Therapist Role | Therapist booking portal |
| `/admin` | Admin Role | Admin management panel |

## Next Steps

1. ✅ Run the SQL scripts
2. ✅ Test user sign up and booking
3. ✅ Create admin account
4. ✅ Create therapist accounts and link them
5. ✅ Test complete booking flow
6. 🔄 Customize email templates in Supabase
7. 🔄 Add additional features as needed

## Support

If you encounter issues:
1. Check Supabase logs: Dashboard > Logs
2. Check browser console for errors
3. Verify all SQL scripts ran successfully
4. Ensure environment variables are set correctly

---

**Happy coding! 🎉**
