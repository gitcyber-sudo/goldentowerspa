
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    profile: any | null;
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
            } catch (err) {
                console.error("Manual session check error:", err);
                if (mounted) setLoading(false);
            }
        };

        initAuth();

        // 2. Listen for all auth events
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("Auth event triggered:", event);

            if (!mounted) return;

            // Update session and user states
            setSession(session);
            const currentUser = session?.user ?? null;
            setUser(currentUser);

            if (currentUser) {
                // Only fetch profile if it's a new login or a fresh session recovery
                if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'USER_UPDATED') {
                    if (fetchProfileRef.current !== currentUser.id) {
                        fetchProfileRef.current = currentUser.id;
                        const profileData = await fetchProfile(currentUser.id);

                        // AUTO-REDIRECT after login/session load if on home page
                        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && (window.location.pathname === '/' || window.location.pathname === '/index.html')) {
                            console.log(`Auto-redirecting to dashboard after ${event}...`);
                            const r = profileData?.role || 'user';
                            const path = r === 'admin' ? '/admin' : (r === 'therapist' ? '/therapist' : '/dashboard');
                            window.location.replace(path);
                        }
                    } else {
                        // Already fetching or loaded, just ensure loading is off
                        setLoading(false);
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
        let timeoutId: any;

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

    const fetchProfile = async (userId: string) => {
        try {
            console.log("Fetching profile for:", userId);

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

            const result: any = await Promise.race([profilePromise, timeoutPromise]);
            const { data, error } = result;

            if (error) {
                console.warn('Profile fetch error:', error.message);
                const fallback = { role: 'user' };
                if (error.code === 'PGRST116') {
                    setProfile(fallback);
                    return fallback;
                }
                return null;
            }

            if (data) {
                console.log("Profile loaded successfully:", data.role);
                setProfile(data);
                return data;
            }
            return null;
        } catch (error) {
            console.error('Unexpected error during profile fetch:', error);
            const fallback = { role: 'user' };
            if (!profile) setProfile(fallback);
            return fallback;
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
            console.log("Initiating targeted sign out...");

            // 1. Clear profile state immediately
            setUser(null);
            setSession(null);
            setProfile(null);

            // 2. Clear ONLY Supabase/Auth related keys from storage
            // This preserves analytics (gt_visitor_id) and other app state
            const storageKey = `sb-${new URL((supabase as any).supabaseUrl).hostname.split('.')[0]}-auth-token`;
            localStorage.removeItem(storageKey);

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

            console.log("Sign out successful");
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
