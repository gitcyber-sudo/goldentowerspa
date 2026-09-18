import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    profile: any | null;
    loading: boolean;
    role: 'user' | 'therapist' | 'admin' | null;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    const profileRef = useRef<any | null>(null);
    const activeFetchUserIdRef = useRef<string | null>(null);
    const isInitialCheckDoneRef = useRef(false);

    const fetchProfileWithRetry = async (userId: string, attemptsRemaining = 2): Promise<any> => {
        try {
            console.log(`[Auth] Starting profile resolve for ${userId} (Attempt ${3 - attemptsRemaining})...`);

            const { data, error, status } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                if (error.code === 'PGRST116' || status === 406) {
                    console.info("[Auth] Profile record missing, defaulting to 'user' role");
                    return { id: userId, role: 'user' };
                }
                throw error;
            }

            console.log(`[Auth] Profile successfully resolved:`, data?.role);
            return data;
        } catch (err: any) {
            console.warn(`[Auth] Profile resolve error:`, err.message);

            if (attemptsRemaining > 0) {
                await new Promise(r => setTimeout(r, 1000));
                return fetchProfileWithRetry(userId, attemptsRemaining - 1);
            }

            return { id: userId, role: 'user' };
        }
    };

    useEffect(() => {
        let mounted = true;

        const settleSession = async (currentSession: Session | null, source: string) => {
            if (!mounted) return;

            const currentUser = currentSession?.user ?? null;
            console.log(`[Auth] Settle Session (${source}):`, { userId: currentUser?.id });

            // Set basic identity immediately
            setSession(currentSession);
            setUser(currentUser);

            if (currentUser) {
                // LOCK IDENTITY: We have a user, unlock UI as a 'user' role automatically
                setLoading(false);
                isInitialCheckDoneRef.current = true;

                // Handle background profile resolution
                if (profileRef.current?.id === currentUser.id) return;
                if (activeFetchUserIdRef.current === currentUser.id) return;

                activeFetchUserIdRef.current = currentUser.id;
                try {
                    const profileData = await fetchProfileWithRetry(currentUser.id);
                    if (mounted) {
                        profileRef.current = profileData;
                        setProfile(profileData);

                        // SYNC METADATA
                        const currentRole = profileData?.role || 'user';
                        const jwtRole = currentUser.app_metadata?.role || currentUser.user_metadata?.role;

                        if (currentRole && currentRole !== jwtRole) {
                            console.log(`[Auth] Syncing role '${currentRole}' to JWT...`);
                            supabase.auth.updateUser({ data: { role: currentRole } }).catch(() => { });
                        }
                    }
                } finally {
                    if (activeFetchUserIdRef.current === currentUser.id) {
                        activeFetchUserIdRef.current = null;
                    }
                }
            } else {
                // GUEST STATE: Only unlock if we are sure no session exists
                if (source === 'init' || source === 'INITIAL_SESSION') {
                    console.log("[Auth] Guest state confirmed via", source);
                    profileRef.current = null;
                    setProfile(null);
                    setLoading(false);
                    isInitialCheckDoneRef.current = true;
                }
            }
        };

        // 1. Initial Storage Check
        const initAuth = async () => {
            const { data: { session: existingSession } } = await supabase.auth.getSession();
            if (existingSession && !isInitialCheckDoneRef.current) {
                await settleSession(existingSession, 'init');
            }
        };
        initAuth();

        // 2. Auth Listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
            if (event === 'SIGNED_OUT') {
                setUser(null);
                setSession(null);
                setProfile(null);
                profileRef.current = null;
                setLoading(false);
                return;
            }
            settleSession(newSession, event);
        });

        const globalTimeout = setTimeout(() => {
            if (mounted && loading) {
                console.warn("[Auth] Global timeout hit. Unsticking UI.");
                setLoading(false);
            }
        }, 30000);

        return () => {
            mounted = false;
            subscription.unsubscribe();
            clearTimeout(globalTimeout);
        };
    }, []);

    const value = React.useMemo(() => {
        const rawRole = user?.app_metadata?.role || user?.user_metadata?.role || profile?.role;
        const role = (user ? (rawRole || 'user') : null) as 'user' | 'therapist' | 'admin' | null;

        return {
            user,
            profile,
            loading,
            role,
            signOut: async () => {
                await supabase.auth.signOut();
            },
        };
    }, [user, profile, loading]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
