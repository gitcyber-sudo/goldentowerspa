
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
                        await fetchProfile(currentUser.id);

                        // AUTO-REDIRECT after first login/session load if on home page
                        if ((event === 'SIGNED_IN') && window.location.pathname === '/') {
                            console.log("Auto-redirecting to dashboard after login...");
                            // We need access to navigate here, but it's a context.
                            // Better way: Let the App.tsx handle it or use window.location
                            // Since we are in a hook, window.location is safe.
                            const { data: p } = await supabase.from('profiles').select('role').eq('id', currentUser.id).single();
                            const r = p?.role || 'user';
                            const path = r === 'admin' ? '/admin' : (r === 'therapist' ? '/therapist' : '/dashboard');
                            window.location.href = path;
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
                if (error.code === 'PGRST116') {
                    setProfile({ role: 'user' });
                }
            } else if (data) {
                console.log("Profile loaded successfully:", data.role);
                setProfile(data);
            }
        } catch (error) {
            console.error('Unexpected error during profile fetch:', error);
            // Fallback for failed profile fetch (to unstick dashboard)
            if (!profile) setProfile({ role: 'user' });
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
            console.log("Initiating foolproof sign out...");

            // 1. Clear state immediately for UI responsiveness
            setUser(null);
            setSession(null);
            setProfile(null);

            // 2. Clear all browser storage to prevent "stuck" sessions
            localStorage.clear();
            sessionStorage.clear();

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
