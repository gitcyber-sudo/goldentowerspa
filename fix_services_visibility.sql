-- FIX: Ensure services are visible to EVERYONE (including Google users)
-- Run this in Supabase SQL Editor

-- 1. Create table if not exists (just in case)
CREATE TABLE IF NOT EXISTS public.services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  duration TEXT,
  price NUMERIC,
  category TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Force enable RLS (standard practice)
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- 3. DROP existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable select for services" ON public.services;
DROP POLICY IF EXISTS "Public services access" ON public.services;
DROP POLICY IF EXISTS "Anyone can view services" ON public.services;

-- 4. CREATE the "Universal Read" policy
-- This allows 'anon' (not logged in), 'authenticated' (Email users), AND 'google_auth' users to see services.
CREATE POLICY "Anyone can view services" 
ON public.services 
FOR SELECT 
TO public 
USING (true);

-- 5. Verification: Check if data exists
SELECT count(*) as total_services FROM public.services;
