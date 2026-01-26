
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

    useEffect(() => {
        let mounted = true;

        const initAuth = async () => {
            try {
                // 1. Check active session
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) throw sessionError;

                if (mounted) {
                    setSession(session);
                    setUser(session?.user ?? null);

                    if (session?.user) {
                        await fetchProfile(session.user.id);
                    } else {
                        setLoading(false);
                    }
                }
            } catch (err) {
                console.error("Auth init error:", err);
                if (mounted) setLoading(false);
            }
        };

        initAuth();

        // 2. Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("Auth event:", event);
            if (mounted) {
                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    await fetchProfile(session.user.id);
                } else {
                    setProfile(null);
                    setLoading(false);
                }
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

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
            console.log("Signing out...");
            // 1. Sign out from Supabase
            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            // 2. Clear local state explicitly
            setSession(null);
            setUser(null);
            setProfile(null);

            console.log("Sign out successful");
        } catch (error) {
            console.error('Error during sign out:', error);
            // Even if Supabase fails (e.g. network), clear local state to unstick the UI
            setSession(null);
            setUser(null);
            setProfile(null);
        } finally {
            setLoading(false);
            // Clear any potentially corrupted storage
            localStorage.removeItem('app_version');
        }
    };

    const value = {
        user,
        session,
        profile,
        role: profile?.role || null,
        loading,
        signIn,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
