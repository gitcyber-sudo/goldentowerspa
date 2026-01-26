-- SIMPLE VERSION: Just drop all policies and recreate
-- Use this if setup_auth_v2.sql keeps giving errors

-- Drop ALL existing policies first
DROP POLICY IF EXISTS "Enable insert for everyone" ON public.bookings;
DROP POLICY IF EXISTS "Enable select for everyone" ON public.bookings;
DROP POLICY IF EXISTS "Enable update for everyone" ON public.bookings;
DROP POLICY IF EXISTS "Admins can do everything on bookings" ON public.bookings;
DROP POLICY IF EXISTS "Therapists can view assigned bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can insert own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can cancel own pending bookings" ON public.bookings;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Now run the main setup script
-- It should work without errors now!

SELECT 'All existing policies dropped. Now run setup_auth_v2.sql' as status;
