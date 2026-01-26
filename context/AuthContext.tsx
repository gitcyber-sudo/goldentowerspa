
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

        // --- SAFETY TIMEOUT ---
        // If auth takes more than 7 seconds, something is wrong (likely network or blocked storage)
        // Force loading to false so the user isn't stuck behind a white screen.
        const authTimeout = setTimeout(() => {
            if (mounted && loading) {
                console.warn("Auth initialization timed out. Forcing loading false.");
                setLoading(false);
            }
        }, 7000);

        // Listen for changes (this will also provide the initial session on subscribe)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("Auth event triggered:", event);

            if (!mounted) return;

            setSession(session);
            const currentUser = session?.user ?? null;
            setUser(currentUser);

            if (currentUser) {
                // Prevent duplicate fetches for the same user ID in the same mount cycle
                if (fetchProfileRef.current !== currentUser.id) {
                    fetchProfileRef.current = currentUser.id;
                    await fetchProfile(currentUser.id);
                }
            } else {
                fetchProfileRef.current = null;
                setProfile(null);
                setLoading(false);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
            clearTimeout(authTimeout);
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
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.warn('Profile fetch error:', error.message);
                if (error.code === 'PGRST116') {
                    setProfile({ role: 'user' });
                }
            } else if (data) {
                console.log("Profile loaded:", data.role);
                setProfile(data);
            }
        } catch (error) {
            console.error('Unexpected error fetching profile:', error);
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
