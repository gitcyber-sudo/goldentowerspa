
-- Golden Tower Spa: Update Policies for Signed-in Users (Fix Visibility Issue)

-- The user reported that when signed in, they cannot see services.
-- This usually happens because RLS policies are set to "TO public" which might EXCLUDE authenticated users
-- depending on how "public" is interpreted (usually it includes everyone, but sometimes explicit role policies override).
-- Or, simply the "authenticated" role needs explicit permission if "public" isn't covering it as expected in some configs.

-- 1. Ensure Services are visible to EVERYONE (anon + authenticated)
DROP POLICY IF EXISTS "Enable select for services" ON "public"."services";
CREATE POLICY "Enable select for services" ON "public"."services"
AS PERMISSIVE FOR SELECT
TO public, authenticated, anon
USING (true);

-- 2. Ensure Therapists are visible to EVERYONE
DROP POLICY IF EXISTS "Enable select for therapists" ON "public"."therapists";
CREATE POLICY "Enable select for therapists" ON "public"."therapists"
AS PERMISSIVE FOR SELECT
TO public, authenticated, anon
USING (true);

-- 3. Ensure Bookings are visible based on our previous logic 
-- (Assuming the previous setup_auth_v2.sql was run, we just need to double check Services isn't blocking).

SELECT 'Public and Authenticated access ensured for Services and Therapists.' as status;
