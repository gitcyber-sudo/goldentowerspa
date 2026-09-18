import { useAnalyticsContext } from '../context/AnalyticsContext';

export const useAnalytics = () => {
    const { trackEvent } = useAnalyticsContext();
    return {
        trackEvent: ({ eventName, eventCategory, eventData }: {
            eventName: string;
            eventCategory?: string;
            eventData?: Record<string, any>;
        }) => trackEvent(eventName, eventCategory, eventData)
    };
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
