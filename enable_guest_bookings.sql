-- SUPPORT GUEST BOOKINGS (For Admin Manual Entry)
-- Run this in Supabase SQL Editor

-- 1. Modify bookings table to allow storing contact info directly
-- This is needed for guests who don't have a user_id account yet
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS guest_name TEXT,
ADD COLUMN IF NOT EXISTS guest_email TEXT,
ADD COLUMN IF NOT EXISTS guest_phone TEXT;

-- 2. Relax the user_id constraints
-- We already have ON DELETE SET NULL, but let's ensure the policies allow NULL user_id for ADMINS.

-- 3. Update Policies
-- We need a specific policy that allows ADMINS to insert rows where user_id is NULL.

DROP POLICY IF EXISTS "Admins can insert guest bookings" ON public.bookings;

CREATE POLICY "Admins can insert guest bookings" ON public.bookings
FOR INSERT
WITH CHECK (
  -- Only admins can allow a booking with no user_id or a different user_id
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Note: The existing "Admins can do everything" policy "USING" clause covers SELECT/UPDATE/DELETE.
-- But FOR INSERT, strictly defining the CHECK is safer.

-- 4. Create a function to auto-link future signups (Advanced / Optional)
-- This function runs when a new user signs up. It finds any "guest" bookings with their email and updates the user_id.

CREATE OR REPLACE FUNCTION public.link_guest_bookings()
RETURNS TRIGGER AS $$
BEGIN
  -- Find bookings with matching email but no user_id, and assign them to this new user
  UPDATE public.bookings
  SET user_id = new.id
  WHERE guest_email = new.email 
  AND user_id IS NULL;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for the above
DROP TRIGGER IF EXISTS on_auth_user_created_link_bookings ON auth.users;
CREATE TRIGGER on_auth_user_created_link_bookings
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.link_guest_bookings();
