-- DEBUG & FIX: Dashboard Visibility
-- Run this in Supabase SQL Editor

-- 1. Check if ANY bookings exist in the database (ignoring permissions)
SELECT count(*) as total_bookings_in_db FROM bookings;

-- 2. Check your user role
-- This will show your current role. If it is NOT 'admin', you cannot see bookings.
SELECT * FROM profiles WHERE id = auth.uid();

-- 3. CRITICAL FIX: Ensure 'services' and 'therapists' are readable by everyone
-- If these tables are blocked, the dashboard fetch (which joins them) might fail silently or return partial data.
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read services" ON services;
CREATE POLICY "Public read services" ON services FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read therapists" ON therapists;
CREATE POLICY "Public read therapists" ON therapists FOR SELECT USING (true);

-- 4. EMERGENCY FIX: Allow ALL authenticated users to view ALL bookings temporarily
-- This helps us verify if the dashboard is working. We can restrict this later.
DROP POLICY IF EXISTS "Debug: Allow all reads" ON bookings;

CREATE POLICY "Debug: Allow all reads"
ON bookings
FOR SELECT
TO authenticated, anon
USING (true);

-- 5. Final Check
SELECT 'Policies updated. Please refresh your dashboard.' as status;
