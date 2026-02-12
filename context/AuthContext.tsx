
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
        // 1. Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) fetchProfile(session.user.id);
            else setLoading(false);
        });

        // 2. Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            setSession(session);
            const currentUser = session?.user ?? null;
            setUser(currentUser);

            if (currentUser) {
                const profileData = await fetchProfile(currentUser.id);

                // Claim guest bookings
                const visitorId = localStorage.getItem('gt_visitor_id');
                if (visitorId && profileData?.role === 'user') {
                    await claimGuestBookings(currentUser.id, currentUser.email || '', visitorId);
                }
            } else {
                setProfile(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

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
            console.log("Guest bookings successfully claimed");
        } catch (err) {
            console.warn("Failed to claim guest bookings:", err);
        }
    };

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (!error && data) {
                setProfile(data);
                return data;
            } else {
                const fallback = { role: 'user' };
                setProfile(fallback);
                return fallback;
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const signIn = async (email: string) => {
        // Implementation for manual triggers if needed
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('gt_visitor_id'); // Clear guest ID on logout to prevent pollution
        setProfile(null);
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
