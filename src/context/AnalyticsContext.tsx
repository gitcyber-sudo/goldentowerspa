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

// Detect browser version
const getBrowserVersion = (): string => {
    if (typeof window === 'undefined') return '';
    const ua = navigator.userAgent;
    let match: RegExpMatchArray | null;
    if ((match = ua.match(/Firefox\/([\d.]+)/))) return match[1];
    if ((match = ua.match(/Edg\/([\d.]+)/))) return match[1];
    if ((match = ua.match(/Chrome\/([\d.]+)/))) return match[1];
    if ((match = ua.match(/Version\/([\d.]+).*Safari/))) return match[1];
    if ((match = ua.match(/OPR\/([\d.]+)/))) return match[1];
    return '';
};

// Parse device model from user agent
const getDeviceModel = (): string => {
    if (typeof window === 'undefined') return 'unknown';
    const ua = navigator.userAgent;

    // iOS devices
    const iosMatch = ua.match(/FBDV\/([\w,]+)/);
    if (iosMatch) {
        const model = iosMatch[1];
        const iosModels: Record<string, string> = {
            'iPhone16,2': 'iPhone 15 Pro Max', 'iPhone16,1': 'iPhone 15 Pro',
            'iPhone15,5': 'iPhone 15 Plus', 'iPhone15,4': 'iPhone 15',
            'iPhone15,3': 'iPhone 14 Pro Max', 'iPhone15,2': 'iPhone 14 Pro',
            'iPhone14,8': 'iPhone 14 Plus', 'iPhone14,7': 'iPhone 14',
            'iPhone14,3': 'iPhone 13 Pro Max', 'iPhone14,2': 'iPhone 13 Pro',
            'iPhone14,5': 'iPhone 13', 'iPhone14,4': 'iPhone 13 mini',
            'iPhone13,4': 'iPhone 12 Pro Max', 'iPhone13,3': 'iPhone 12 Pro',
            'iPhone13,2': 'iPhone 12', 'iPhone13,1': 'iPhone 12 mini',
            'iPhone12,5': 'iPhone 11 Pro Max', 'iPhone12,3': 'iPhone 11 Pro',
            'iPhone12,1': 'iPhone 11',
        };
        return iosModels[model] || model;
    }
    if (/iPhone/.test(ua)) return 'iPhone';
    if (/iPad/.test(ua)) return 'iPad';

    // Android devices — extract Build model
    const androidMatch = ua.match(/;\s*([^;)]+)\s+Build\//);
    if (androidMatch) {
        const raw = androidMatch[1].trim();
        // Samsung models
        if (raw.startsWith('SM-')) {
            const samsung: Record<string, string> = {
                'SM-S936B': 'Galaxy S25 Ultra', 'SM-S926B': 'Galaxy S25+', 'SM-S921B': 'Galaxy S25',
                'SM-S928B': 'Galaxy S24 Ultra', 'SM-S911B': 'Galaxy S24',
                'SM-A235F': 'Galaxy A23', 'SM-A205GN': 'Galaxy A20',
            };
            return samsung[raw] || `Samsung ${raw}`;
        }
        // OPPO / Xiaomi / etc
        if (raw.startsWith('CPH')) return `OPPO ${raw}`;
        if (/^\d+[A-Z]/.test(raw)) return `Xiaomi ${raw}`;
        if (raw.startsWith('TECNO')) return raw;
        if (raw.startsWith('V2') || raw.startsWith('V1')) return `Vivo ${raw}`;
        if (raw.includes('HONOR') || raw.startsWith('DNY')) return `Honor ${raw}`;
        return raw;
    }

    // Desktop
    if (/Macintosh/.test(ua)) return 'Mac';
    if (/Windows/.test(ua)) return 'Windows PC';
    if (/Linux/.test(ua)) return 'Linux PC';
    return 'Desktop';
};

// Parse OS name and version
const getOSInfo = (): { name: string; version: string } => {
    if (typeof window === 'undefined') return { name: 'Unknown', version: '' };
    const ua = navigator.userAgent;
    let match: RegExpMatchArray | null;

    if ((match = ua.match(/FBSV\/([\d.]+)/))) return { name: 'iOS', version: match[1] };
    if ((match = ua.match(/iPhone OS (\d+[_\d]*)/))) return { name: 'iOS', version: match[1].replace(/_/g, '.') };
    if ((match = ua.match(/iPad.*OS (\d+[_\d]*)/))) return { name: 'iPadOS', version: match[1].replace(/_/g, '.') };
    if ((match = ua.match(/Android\s+([\d.]+)/))) return { name: 'Android', version: match[1] };
    if ((match = ua.match(/Windows NT ([\d.]+)/))) {
        const ver: Record<string, string> = { '10.0': '10/11', '6.3': '8.1', '6.2': '8', '6.1': '7' };
        return { name: 'Windows', version: ver[match[1]] || match[1] };
    }
    if ((match = ua.match(/Mac OS X ([\d_]+)/))) return { name: 'macOS', version: match[1].replace(/_/g, '.') };
    return { name: 'Other', version: '' };
};

// Detect app context
const getAppContext = (): string => {
    if (typeof window === 'undefined') return 'Direct Browser';
    const ua = navigator.userAgent;
    if (/FBAN\/FBIOS|FB_IAB\/FB4A/.test(ua)) return 'Facebook';
    if (/Instagram/.test(ua)) return 'Instagram';
    if (/FBAN\/EMA|Messenger/.test(ua)) return 'Messenger';
    if (/TikTok/.test(ua)) return 'TikTok';
    if (/Line\//.test(ua)) return 'LINE';
    return 'Direct Browser';
};

// Page title mapping
const getPageTitle = (path: string): string => {
    const titles: Record<string, string> = {
        '/': 'Home',
        '/admin': 'Admin Dashboard',
        '/dashboard': 'User Dashboard',
        '/therapist': 'Therapist Dashboard',
        '/privacy-policy': 'Privacy Policy',
        '/terms-of-service': 'Terms of Service',
    };
    return titles[path] || path;
};

// Track device fingerprint
const trackDevice = async (userId: string | null) => {

    if (typeof window === 'undefined') return;

    // For debugging, we remove the session guard to ensure it fires
    // const sessionKey = 'gt_device_tracked';
    // if (sessionStorage.getItem(sessionKey)) return;

    try {
        const visitorId = getVisitorId();
        const os = getOSInfo();
        const resolution = `${window.screen.width}x${window.screen.height}`;

        await supabase.from('client_devices').upsert({
            user_id: userId || null,
            visitor_id: visitorId,
            device_model: getDeviceModel(),
            os_name: os.name,
            os_version: os.version,
            browser: getBrowser(),
            browser_version: getBrowserVersion(),
            device_type: getDeviceType(),
            screen_resolution: resolution,
            app_context: getAppContext(),
            user_agent: navigator.userAgent,
            last_seen: new Date().toISOString(),
        }, {
            onConflict: 'user_agent,visitor_id'
        });

        // sessionStorage.setItem(sessionKey, '1');
    } catch (err) {
        console.debug('Device tracking error:', err);
    }
};


export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const { user } = useAuth();

    // Track page view
    const trackPageView = useCallback(async () => {
        try {
            const visitorId = getVisitorId();
            const sessionId = getSessionId();
            const now = new Date().toISOString();

            // Try to find visitor by visitor_id
            const { data: existingVisitor, error: fetchError } = await supabase
                .from('visitors')
                .select('id, visit_count, user_id')
                .eq('visitor_id', visitorId)
                .maybeSingle();

            if (existingVisitor) {
                // Determine if we need to update the user_id (if it was previously null but now we have a user)
                const shouldUpdateUserId = !existingVisitor.user_id && user?.id;

                await supabase
                    .from('visitors')
                    .update({
                        last_visit: now,
                        visit_count: (existingVisitor.visit_count || 0) + 1,
                        user_id: user?.id || existingVisitor.user_id || null
                    })
                    .eq('visitor_id', visitorId);
            } else if (!fetchError) {
                // Only insert if no fetch error (to avoid duplicate inserts on temporary network issues)
                await supabase
                    .from('visitors')
                    .insert({
                        visitor_id: visitorId,
                        user_id: user?.id || null,
                        last_visit: now,
                        first_visit: now,
                        visit_count: 1
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

            // Track device fingerprint
            await trackDevice(user?.id || null);
        } catch (error) {
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
