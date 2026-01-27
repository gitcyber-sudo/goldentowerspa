import React, { createContext, useContext, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useEffect } from 'react';

interface AnalyticsContextType {
    trackEvent: (eventName: string, eventCategory?: string, eventData?: Record<string, any>) => Promise<void>;
    trackBookingStarted: (serviceId: string, serviceName: string) => void;
    trackBookingCompleted: (bookingId: string, serviceId: string, serviceName: string) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

// Generate a unique visitor ID
const getVisitorId = (): string => {
    if (typeof window === 'undefined') return 'ssr';
    let visitorId = localStorage.getItem('gt_visitor_id');
    if (!visitorId) {
        visitorId = 'v_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
        localStorage.setItem('gt_visitor_id', visitorId);
    }
    return visitorId;
};

// Generate a unique session ID
const getSessionId = (): string => {
    if (typeof window === 'undefined') return 'ssr';
    let sessionId = sessionStorage.getItem('gt_session_id');
    if (!sessionId) {
        sessionId = 's_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
        sessionStorage.setItem('gt_session_id', sessionId);
    }
    return sessionId;
};

// Detect device type from user agent
const getDeviceType = (): string => {
    if (typeof window === 'undefined') return 'unknown';
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        return 'tablet';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
        return 'mobile';
    }
    return 'desktop';
};

// Detect browser from user agent
const getBrowser = (): string => {
    if (typeof window === 'undefined') return 'unknown';
    const ua = navigator.userAgent;
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Edg')) return 'Edge';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
    return 'Other';
};

// Page title mapping
const getPageTitle = (path: string): string => {
    const titles: Record<string, string> = {
        '/': 'Home',
        '/admin': 'Admin Dashboard',
        '/dashboard': 'User Dashboard',
        '/therapist': 'Therapist Dashboard',
    };
    return titles[path] || path;
};

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const { user } = useAuth();

    // Track page view
    const trackPageView = useCallback(async () => {
        try {
            const visitorId = getVisitorId();
            const sessionId = getSessionId();

            // Update visitor record
            const { data: existingVisitor } = await supabase
                .from('visitors')
                .select('id, visit_count')
                .eq('visitor_id', visitorId)
                .single();

            if (existingVisitor) {
                await supabase
                    .from('visitors')
                    .update({
                        last_visit: new Date().toISOString(),
                        visit_count: (existingVisitor.visit_count || 0) + 1,
                        user_id: user?.id || null
                    })
                    .eq('visitor_id', visitorId);
            } else {
                await supabase
                    .from('visitors')
                    .insert({
                        visitor_id: visitorId,
                        user_id: user?.id || null
                    });
            }

            // Record page view
            await supabase.from('page_views').insert({
                page_path: location.pathname,
                page_title: getPageTitle(location.pathname),
                referrer: document.referrer || null,
                user_agent: navigator.userAgent,
                device_type: getDeviceType(),
                browser: getBrowser(),
                session_id: sessionId,
                user_id: user?.id || null
            });
        } catch (error) {
            // Silently fail - analytics shouldn't break the app
            console.debug('Analytics tracking error:', error);
        }
    }, [location.pathname, user?.id]);

    // Track custom events
    const trackEvent = useCallback(async (
        eventName: string,
        eventCategory?: string,
        eventData?: Record<string, any>
    ) => {
        try {
            const sessionId = getSessionId();
            await supabase.from('analytics_events').insert({
                event_name: eventName,
                event_category: eventCategory || 'general',
                event_data: eventData || {},
                page_path: location.pathname,
                session_id: sessionId,
                user_id: user?.id || null
            });
        } catch (error) {
            console.debug('Event tracking error:', error);
        }
    }, [location.pathname, user?.id]);

    // Predefined event trackers
    const trackBookingStarted = useCallback((serviceId: string, serviceName: string) => {
        trackEvent('booking_started', 'booking', { serviceId, serviceName });
    }, [trackEvent]);

    const trackBookingCompleted = useCallback((bookingId: string, serviceId: string, serviceName: string) => {
        trackEvent('booking_completed', 'booking', { bookingId, serviceId, serviceName });
    }, [trackEvent]);

    // Auto-track page views on route change
    useEffect(() => {
        trackPageView();
    }, [trackPageView]);

    return (
        <AnalyticsContext.Provider value={{ trackEvent, trackBookingStarted, trackBookingCompleted }}>
            {children}
        </AnalyticsContext.Provider>
    );
};

export const useAnalyticsContext = () => {
    const context = useContext(AnalyticsContext);
    if (!context) {
        // Return dummy functions if used outside provider
        return {
            trackEvent: async () => { },
            trackBookingStarted: () => { },
            trackBookingCompleted: () => { }
        };
    }
    return context;
};

export default AnalyticsProvider;
