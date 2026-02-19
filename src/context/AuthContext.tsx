
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    profile: Profile | null;
    role: 'user' | 'therapist' | 'admin' | null;
    loading: boolean;
    signIn: (email: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    profile: null,
    role: null,
    loading: true,
    signIn: async () => { },
    signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const fetchProfileRef = React.useRef<string | null>(null);

    useEffect(() => {
        let mounted = true;

        const initAuth = async () => {
            try {
                // 1. Check existing session immediately
                const { data: { session: initialSession } } = await supabase.auth.getSession();

                if (mounted) {
                    if (initialSession) {
                        setSession(initialSession);
                        setUser(initialSession.user);
                        fetchProfileRef.current = initialSession.user.id;
                        await fetchProfile(initialSession.user.id);
                    } else {
                        setLoading(false);
                    }
                }
            } catch (err: any) {
                console.error("Manual session check error:", err);

                import('../lib/errorLogger').then(({ logError }) => {
                    logError({
                        message: `[GTS-101]: Critical failure during auth initialization. ${err.message || ''}`,
                        severity: 'error',
                        metadata: { error: err }
                    });
                });

                if (mounted) setLoading(false);
            }
        };

        initAuth();

        // 2. Listen for all auth events
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {


            if (!mounted) return;

            setSession(session);
            const currentUser = session?.user ?? null;
            setUser(currentUser);

            if (currentUser) {
                // If we already have this profile in state from initAuth, just stop loading
                if (fetchProfileRef.current === currentUser.id && profile) {
                    setLoading(false);
                    return;
                }

                // Otherwise, fetch it if not already fetching
                if (fetchProfileRef.current !== currentUser.id) {
                    setLoading(true); // Ensure loading is true while we fetch
                    fetchProfileRef.current = currentUser.id;
                    const profileData = await fetchProfile(currentUser.id);

                    // Claim guest bookings (ONLY for regular users, prevent admin/therapist pollution)
                    const visitorId = localStorage.getItem('gt_visitor_id');
                    if (visitorId && profileData?.role === 'user') {
                        await claimGuestBookings(currentUser.id, currentUser.email || '', visitorId);
                    }

                    // Role-based auto-redirect on home page
                    if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') &&
                        (window.location.pathname === '/' || window.location.pathname === '/index.html')) {
                        const r = profileData?.role || 'user';
                        const path = r === 'admin' ? '/admin' : (r === 'therapist' ? '/therapist' : '/dashboard');
                        // Auto-redirect based on role
                        window.location.replace(path);
                    }
                }
            } else {
                fetchProfileRef.current = null;
                setProfile(null);
                setLoading(false);
            }
        });

        // 3. Global Safety Timeout (Hard unstick)
        const globalTimeout = setTimeout(() => {
            if (mounted && loading) {
                console.warn("Global Auth timeout hit. Unsticking UI.");
                setLoading(false);
            }
        }, 4500);

        return () => {
            mounted = false;
            subscription.unsubscribe();
            clearTimeout(globalTimeout);
        };
    }, []);

    // --- INACTIVITY TIMER ---
    useEffect(() => {
        if (!user) return;

        const INACTIVITY_LIMIT = 10 * 60 * 1000; // 10 Minutes
        let timeoutId: ReturnType<typeof setTimeout>;

        const resetTimer = () => {
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                console.warn("Auto-logging out due to inactivity");
                signOut();
            }, INACTIVITY_LIMIT);
        };

        // Events to listen for activity
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        events.forEach(event => document.addEventListener(event, resetTimer));

        resetTimer(); // Initialize timer

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            events.forEach(event => document.removeEventListener(event, resetTimer));
        };
    }, [user]);

    const claimGuestBookings = async (userId: string, email: string, visitorId: string) => {
        try {

            const { error } = await supabase
                .from('bookings')
                .update({
                    user_id: userId,
                    user_email: email
                })
                .eq('visitor_id', visitorId)
                .is('user_id', null);

            if (error) throw error;

        } catch (err) {
            console.warn("Failed to claim guest bookings:", err);
        }
    };

    const fetchProfile = async (userId: string) => {
        try {


            // Add a sub-timeout specifically for the database query
            const profilePromise = supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            // Race the database query against a 5s timeout
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Profile fetch timeout")), 5000)
            );

            const result = await Promise.race([profilePromise, timeoutPromise]) as { data: Profile | null; error: { message: string; code?: string } | null };
            const { data, error } = result;

            if (error) {
                console.warn('Profile fetch error:', error.message);
                // IF it's a "Not Found" error, we assume it's a new user and create a basic profile or default
                if (error.code === 'PGRST116') {
                    const fallback: Profile = { id: userId, role: 'user' };
                    setProfile(fallback);
                    return fallback;
                }
                return null;
            }

            if (data) {

                setProfile(data);
                return data;
            }
            return null;
        } catch (error: any) {
            console.error('Unexpected error during profile fetch:', error);

            import('../lib/errorLogger').then(({ logError }) => {
                logError({
                    message: `[GTS-102]: Profile fetch unexpected failure for user ${userId}. ${error.message || ''}`,
                    severity: 'error',
                    metadata: { userId, error }
                });
            });

            return null;
        } finally {
            setLoading(false);
        }
    };

    const signIn = async (email: string) => {
        // Implementation for manual triggers if needed
    };

    const signOut = async () => {
        setLoading(true);
        try {


            // 1. Clear profile state immediately
            setUser(null);
            setSession(null);
            setProfile(null);

            // 2. Clear Auth tokens AND the Guest Identity (to prevent cross-account pollution)
            const storageKey = `sb-${new URL((supabase as unknown as { supabaseUrl: string }).supabaseUrl).hostname.split('.')[0]}-auth-token`;
            localStorage.removeItem(storageKey);
            localStorage.removeItem('gt_visitor_id'); // RESET guest identity on logout

            // Also clear any other potential supabase keys
            Object.keys(localStorage).forEach(key => {
                if (key.includes('supabase.auth') || key.includes('-auth-token')) {
                    localStorage.removeItem(key);
                }
            });

            // 3. Supabase Sign Out (Attempt to notify server)
            await supabase.auth.signOut();

            // 4. Force a clean URL (Remove fragments/tokens)
            if (window.location.hash || window.location.search.includes('access_token')) {
                window.location.href = window.location.origin;
            }


        } catch (error) {
            console.error('Error during sign out:', error);
        } finally {
            setLoading(false);
            // One final kick to ensure the app re-renders from scratch
            window.location.reload();
        }
    };

    const value = {
        user,
        session,
        profile,
        role: (profile?.role as 'user' | 'therapist' | 'admin' | null) || null,
        loading,
        signIn,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
