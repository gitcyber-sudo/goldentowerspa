# Golden Tower Spa - Routes & Access Control

## Public Routes

### `/` - Home Page
- **Access**: Public (everyone)
- **Features**:
  - Hero section with booking CTA
  - Philosophy section
  - Visual journey
  - Services showcase
  - Therapists section
  - Footer with contact info
- **Auth Behavior**: 
  - "Book Now" buttons redirect to auth if not logged in
  - Logged in users see profile menu in header

## Protected Routes

### `/dashboard` - User Dashboard
- **Access**: Authenticated users only (role: user)
- **Purpose**: Personal booking management
- **Features**:
  - View current bookings (pending & confirmed)
  - View past bookings (completed & cancelled)
  - Cancel pending bookings
  - Statistics: Active, Completed, Total bookings
  - Return to home or sign out
- **Data Access**: User sees ONLY their own bookings
- **Navigation**: 
  - From header profile menu → "My Dashboard"
  - Redirects to home if not authenticated

### `/therapist` - Therapist Portal
- **Access**: Authenticated users with role='therapist'
- **Purpose**: View assigned client sessions
- **Features**:
  - Today's schedule
  - Upcoming sessions
  - Completed sessions history
  - Client contact information
  - Service details and duration
- **Data Access**: Therapist sees ONLY bookings assigned to them
- **Requirements**:
  - User must have role='therapist' in profiles table
  - therapist.user_id must match auth user ID
- **Navigation**: 
  - From header profile menu → "My Dashboard"
  - Shows "Access Denied" if not therapist role

### `/admin` - Admin Dashboard
- **Access**: Authenticated users with role='admin'
- **Purpose**: Manage all bookings and resources
- **Features**:
  - View all bookings (all statuses)
  - Update booking statuses:
    - pending → confirmed
    - confirmed → completed
    - any → cancelled
  - Filter by status
  - Search bookings
  - View all therapists
  - Statistics dashboard
- **Data Access**: Admin sees ALL bookings
- **Navigation**: 
  - From header profile menu → "My Dashboard"
  - Or directly via /admin URL

## Modals & Components

### AuthModal
- **Trigger**: 
  - Click "Book Now" when not logged in
  - BookingModal detects no user
- **Features**:
  - Toggle between Sign In / Sign Up
  - Form validation
  - Error messages
  - Success redirect to booking

### BookingModal
- **Trigger**: 
  - Click "Book Now" when authenticated
  - Click "Book" on specific service
- **Auth Check**: 
  - Opens AuthModal if user not logged in
  - Only opens if authenticated
- **Features**:
  - Pre-filled user info
  - Service selection (pre-selected if from service card)
  - Therapist selection
  - Date and time picker
  - Creates booking with user_id

## Auth Flow Diagram

```
User clicks "Book Now"
    ↓
Is user authenticated?
    ↓
NO → Open AuthModal
    ↓
    User signs in/up
    ↓
    Success → Close AuthModal
    ↓
YES → Open BookingModal
    ↓
    User fills booking details
    ↓
    Submit → Create booking in DB
    ↓
    Success → Show confirmation
```

## Role-Based Dashboard Routing

```
User clicks "Profile → My Dashboard"
    ↓
Check user.role
    ↓
    ├─ role='admin' → Navigate to /admin
    ├─ role='therapist' → Navigate to /therapist
    └─ role='user' → Navigate to /dashboard
```

## Database Permissions (RLS)

### Bookings Table
- **Public**: Can insert (for initial demo compatibility)
- **Users**: Can view and update their own bookings (user_id matches)
- **Therapists**: Can view bookings where therapist_id matches their linked ID
- **Admins**: Can view and update all bookings

### Profiles Table
- **Public**: Can view all profiles (read-only)
- **Users**: Can update their own profile

### Services & Therapists Tables
- **Public**: Can view all (read-only)

## Access Control Summary

| Route | Public | User | Therapist | Admin |
|-------|--------|------|-----------|-------|
| `/` | ✅ View | ✅ View + Book | ✅ View + Book | ✅ View + Book |
| `/dashboard` | ❌ | ✅ Own bookings | ✅ Own bookings | ✅ Own bookings |
| `/therapist` | ❌ | ❌ | ✅ Assigned bookings | ✅ All bookings |
| `/admin` | ❌ | ❌ | ❌ | ✅ Full access |

## Navigation Patterns

### From Home (/)
- Click logo → Stay on home
- Click nav links → Scroll to sections
- Click "Book Now" → Auth check → Booking flow
- Click profile (if logged in) → Dropdown menu

### From Dashboard pages
- Click "←" Back button → Returns to home (/)
- Click "Sign Out" → Signs out → Returns to home
- All auth states managed by AuthContext

## Important URLs

- **Local Dev**: http://localhost:5173
- **Home**: http://localhost:5173/
- **User Dashboard**: http://localhost:5173/dashboard
- **Therapist Portal**: http://localhost:5173/therapist
- **Admin Panel**: http://localhost:5173/admin

## Development Notes

### Adding New Protected Routes
1. Add route in `App.tsx`
2. Import component
3. Add auth check in component
4. Use `useAuth()` hook to check user/role
5. Redirect to home if unauthorized

### Testing Routes
```javascript
// Test user dashboard
{user && <a href="/dashboard">User Dashboard</a>}

// Test therapist portal (must be therapist)
{profile?.role === 'therapist' && <a href="/therapist">Therapist Portal</a>}

// Test admin panel (must be admin)
{profile?.role === 'admin' && <a href="/admin">Admin Panel</a>}
```

---

**All routes are configured and ready to use!** 🎉
