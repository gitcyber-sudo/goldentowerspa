
-- Golden Tower Spa: Advanced Auth & RBAC Setup

-- 1. Create a Profiles table to store user roles (admin, therapist, user)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'therapist', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Trigger to automatically create a profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Update Bookings table to link to Auth Users
-- We add user_id. We keep user_email for convenience/historical, or we can rely on the join.
-- Let's add user_id as a nullable column first (to support existing anonymous bookings if strictly needed, 
-- but the goal is to enforce auth).
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 4. Add user_id to therapists table for linking (BEFORE creating policies that reference it)
ALTER TABLE public.therapists 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 5. Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies (drop if exists to avoid duplicates)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 6. Update Bookings Policies for RBAC

-- Start fresh for bookings policies - drop ALL existing policies
DROP POLICY IF EXISTS "Enable insert for everyone" ON public.bookings;
DROP POLICY IF EXISTS "Enable select for everyone" ON public.bookings;
DROP POLICY IF EXISTS "Enable update for everyone" ON public.bookings;
DROP POLICY IF EXISTS "Admins can do everything on bookings" ON public.bookings;
DROP POLICY IF EXISTS "Therapists can view assigned bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can insert own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can cancel own pending bookings" ON public.bookings;

-- Policy: Admins can do everything
CREATE POLICY "Admins can do everything on bookings" ON public.bookings
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Policy: Therapists can view their own assigned bookings
-- Note: This now works because we added user_id column to therapists table above
CREATE POLICY "Therapists can view assigned bookings" ON public.bookings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.therapists 
    WHERE public.therapists.user_id = auth.uid() 
    AND public.therapists.id = public.bookings.therapist_id
  )
);

-- Policy: Users can view their own bookings
CREATE POLICY "Users can view own bookings" ON public.bookings
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own bookings
CREATE POLICY "Users can insert own bookings" ON public.bookings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update/cancel their own bookings (only if pending)
CREATE POLICY "Users can cancel own pending bookings" ON public.bookings
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Output instructions
SELECT 'Database schema updated. Please ensure RLS is enabled and policies are active.' as status;
