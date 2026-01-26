
-- Setup RLS policies for Golden Tower Spa

-- Enable RLS on bookings
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- 1. Allow public (anonymous) to insert bookings
-- This mimics a "public booking form"
CREATE POLICY "Enable insert for everyone" ON "public"."bookings"
AS PERMISSIVE FOR INSERT
TO public
WITH CHECK (true);

-- 2. Allow public to select their own bookings (technically risky for anon, but needed for simple demo)
-- OR better: Allow reading all bookings for this demo since we are building an admin panel using anon key
-- In production, you would use Authenticated Users or a Service Role.
-- For this dev phase, checking (true) allows the JS client to read bookings.
CREATE POLICY "Enable select for everyone" ON "public"."bookings"
AS PERMISSIVE FOR SELECT
TO public
USING (true);

-- 3. Allow public to update bookings (for the admin panel demo)
CREATE POLICY "Enable update for everyone" ON "public"."bookings"
AS PERMISSIVE FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- 4. Therapists table - ensure it's readable
ALTER TABLE therapists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable select for therapists" ON "public"."therapists"
AS PERMISSIVE FOR SELECT
TO public
USING (true);

-- 5. Services table - ensure it's readable
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable select for services" ON "public"."services"
AS PERMISSIVE FOR SELECT
TO public
USING (true);
