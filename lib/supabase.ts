import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials not found. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env.local");
}

const getVisitorId = () => {
  if (typeof window === 'undefined') return null;
  let vid = localStorage.getItem('gt_visitor_id');
  if (!vid) {
    vid = 'v_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('gt_visitor_id', vid);
  }
  return vid;
};

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    global: {
      headers: {
        'x-visitor-id': getVisitorId() || ''
      }
    }
  }
);
