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

// Get browser version
const getBrowserVersion = (): string => {
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
        // OPPO
        if (raw.startsWith('CPH')) return `OPPO ${raw}`;
        // Xiaomi / Redmi / POCO
        if (/^\d+[A-Z]/.test(raw)) return `Xiaomi ${raw}`;
        // TECNO
        if (raw.startsWith('TECNO')) return raw;
        // Vivo
        if (raw.startsWith('V2') || raw.startsWith('V1')) return `Vivo ${raw}`;
        // Honor
        if (raw.includes('HONOR') || raw.startsWith('DNY')) return `Honor ${raw}`;
        return raw;
    }

    // Desktop
    if (/Macintosh/.test(ua)) return 'Mac';
    if (/Windows/.test(ua)) return 'Windows PC';
    if (/Linux/.test(ua)) return 'Linux PC';
    return 'Unknown';
};

// Parse OS name and version
const getOSInfo = (): { name: string; version: string } => {
    const ua = navigator.userAgent;
    let match: RegExpMatchArray | null;

    // iOS (from FBSV tag or standard UA)
    if ((match = ua.match(/FBSV\/([\d.]+)/))) return { name: 'iOS', version: match[1] };
    if ((match = ua.match(/iPhone OS (\d+[_\d]*)/))) return { name: 'iOS', version: match[1].replace(/_/g, '.') };
    if ((match = ua.match(/iPad.*OS (\d+[_\d]*)/))) return { name: 'iPadOS', version: match[1].replace(/_/g, '.') };

    // Android
    if ((match = ua.match(/Android\s+([\d.]+)/))) return { name: 'Android', version: match[1] };

    // Desktop
    if ((match = ua.match(/Windows NT ([\d.]+)/))) {
        const ver: Record<string, string> = { '10.0': '10/11', '6.3': '8.1', '6.2': '8', '6.1': '7' };
        return { name: 'Windows', version: ver[match[1]] || match[1] };
    }
    if ((match = ua.match(/Mac OS X ([\d_]+)/))) return { name: 'macOS', version: match[1].replace(/_/g, '.') };
    if (/Linux/.test(ua)) return { name: 'Linux', version: '' };

    return { name: 'Unknown', version: '' };
};

// Detect app context (Facebook IAB, Instagram, direct browser, etc.)
const getAppContext = (): string => {
    const ua = navigator.userAgent;
    if (/FBAN\/FBIOS|FB_IAB\/FB4A/.test(ua)) return 'Facebook';
    if (/Instagram/.test(ua)) return 'Instagram';
    if (/FBAN\/EMA|Messenger/.test(ua)) return 'Messenger';
    if (/MetaIAB/.test(ua)) return 'Meta IAB';
    if (/Twitter|X\.com/.test(ua)) return 'Twitter/X';
    if (/TikTok/.test(ua)) return 'TikTok';
    if (/Line\//.test(ua)) return 'LINE';
    return 'Direct Browser';
};

// Track device fingerprint (once per session)
const trackDevice = async (userId: string | null) => {
    const sessionKey = 'gt_device_tracked';
    if (sessionStorage.getItem(sessionKey)) return; // Already tracked this session

    try {
        const visitorId = getVisitorId();
        const ua = navigator.userAgent;
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
            user_agent: ua,
            last_seen: new Date().toISOString(),
        }, {
            onConflict: 'idx_client_devices_unique',
            ignoreDuplicates: false
        });

        // On upsert conflict update, increment session_count
        // Supabase upsert handles the update automatically

        sessionStorage.setItem(sessionKey, '1');
    } catch (err) {
        console.error('Device tracking error:', err);
    }
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

            // Track device fingerprint (once per session)
            await trackDevice(user?.id || null);
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
