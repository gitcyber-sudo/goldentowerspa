import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

// Generate a unique visitor ID
const getVisitorId = (): string => {
    let visitorId = localStorage.getItem('gt_visitor_id');
    if (!visitorId) {
        visitorId = 'v_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
        localStorage.setItem('gt_visitor_id', visitorId);
    }
    return visitorId;
};

// Generate a unique session ID
const getSessionId = (): string => {
    let sessionId = sessionStorage.getItem('gt_session_id');
    if (!sessionId) {
        sessionId = 's_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
        sessionStorage.setItem('gt_session_id', sessionId);
    }
    return sessionId;
};

// Detect device type from user agent
const getDeviceType = (): string => {
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
    return titles[path] || 'Unknown Page';
};

interface AnalyticsEvent {
    eventName: string;
    eventCategory?: string;
    eventData?: Record<string, any>;
}

export const useAnalytics = () => {
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
            console.error('Analytics tracking error:', error);
        }
    }, [location.pathname, user?.id]);

    // Track custom events
    const trackEvent = useCallback(async ({ eventName, eventCategory, eventData }: AnalyticsEvent) => {
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
            console.error('Event tracking error:', error);
        }
    }, [location.pathname, user?.id]);

    // Auto-track page views on route change
    useEffect(() => {
        trackPageView();
    }, [trackPageView]);

    return { trackEvent };
};

// Predefined event trackers for common actions
export const useBookingAnalytics = () => {
    const { trackEvent } = useAnalytics();

    return {
        trackBookingStarted: (serviceId: string, serviceName: string) => {
            trackEvent({
                eventName: 'booking_started',
                eventCategory: 'booking',
                eventData: { serviceId, serviceName }
            });
        },
        trackBookingCompleted: (bookingId: string, serviceId: string, serviceName: string) => {
            trackEvent({
                eventName: 'booking_completed',
                eventCategory: 'booking',
                eventData: { bookingId, serviceId, serviceName }
            });
        },
        trackBookingCancelled: (bookingId: string) => {
            trackEvent({
                eventName: 'booking_cancelled',
                eventCategory: 'booking',
                eventData: { bookingId }
            });
        }
    };
};

export const useNavigationAnalytics = () => {
    const { trackEvent } = useAnalytics();

    return {
        trackSectionView: (sectionName: string) => {
            trackEvent({
                eventName: 'section_viewed',
                eventCategory: 'navigation',
                eventData: { sectionName }
            });
        },
        trackExternalLinkClick: (url: string) => {
            trackEvent({
                eventName: 'external_link_click',
                eventCategory: 'navigation',
                eventData: { url }
            });
        }
    };
};

export default useAnalytics;
