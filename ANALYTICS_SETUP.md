# Analytics Feature Documentation

## Overview

The Golden Tower Spa website now includes a comprehensive analytics system that tracks:
- **Page Views**: Every page visit across the site
- **Unique Visitors**: Tracked via localStorage visitor ID
- **Sessions**: Tracked via sessionStorage session ID
- **Custom Events**: Bookings, navigation, and user interactions
- **Device & Browser Info**: Automatic detection of device type and browser

## Database Tables

Three new tables have been created in Supabase:

### 1. `page_views`
Stores individual page view records with:
- `page_path` - URL path visited
- `page_title` - Human-readable page name
- `referrer` - Where the visitor came from
- `user_agent` - Browser user agent string
- `device_type` - 'desktop', 'mobile', or 'tablet'
- `browser` - 'Chrome', 'Firefox', 'Safari', 'Edge', etc.
- `session_id` - Unique session identifier
- `user_id` - Linked user if authenticated
- `created_at` - Timestamp

### 2. `visitors`
Tracks unique visitors across sessions:
- `visitor_id` - Unique identifier stored in localStorage
- `first_visit` - When visitor first arrived
- `last_visit` - Most recent visit
- `visit_count` - Total number of visits
- `user_id` - Linked user if authenticated

### 3. `analytics_events`
Stores custom tracking events:
- `event_name` - e.g., 'booking_started', 'booking_completed'
- `event_category` - 'booking', 'navigation', 'engagement'
- `event_data` - JSON payload with event-specific data
- `page_path` - Where the event occurred
- `session_id` - Session identifier
- `user_id` - Linked user if authenticated

## Security

- **RLS (Row Level Security)** is enabled on all analytics tables
- **Anonymous users** can insert data (for tracking)
- **Only admins** can read analytics data (via profile role check)

## How It Works

### Automatic Page View Tracking

The `AnalyticsProvider` component wraps the entire app and automatically tracks:
1. Page views on every route change
2. Visitor sessions (new vs returning)
3. Device and browser information

### Manual Event Tracking

Use the `useAnalyticsContext` hook to track custom events:

```tsx
import { useAnalyticsContext } from '../context/AnalyticsContext';

const MyComponent = () => {
    const { trackEvent, trackBookingStarted, trackBookingCompleted } = useAnalyticsContext();
    
    // Track a custom event
    trackEvent('button_clicked', 'engagement', { buttonId: 'cta-main' });
    
    // Track booking events
    trackBookingStarted(serviceId, serviceName);
    trackBookingCompleted(bookingId, serviceId, serviceName);
};
```

## Admin Dashboard

Access the analytics dashboard at `/admin` and click on the "Analytics" tab in the sidebar.

### Dashboard Features:

1. **Overview Stats**
   - Total Page Views
   - Unique Visitors
   - Average Pages per Visit
   - Total Events Tracked

2. **Time-Based Filtering**
   - Last 24 Hours
   - Last 7 Days
   - Last 30 Days
   - All Time

3. **Charts & Visualizations**
   - Daily Page Views Bar Chart
   - Hourly Activity Heatmap
   - Device Breakdown (Desktop/Mobile/Tablet)
   - Browser Distribution
   - Top Pages Visited

4. **Event Tracking**
   - Custom events breakdown
   - Booking conversion tracking

5. **Visitor Insights**
   - Recent visitors list
   - Returning visitor rate
   - Visit frequency

## Files Created/Modified

### New Files:
- `hooks/useAnalytics.ts` - Analytics tracking hook
- `context/AnalyticsContext.tsx` - Analytics provider component
- `components/AnalyticsDashboard.tsx` - Admin analytics view

### Modified Files:
- `App.tsx` - Wrapped with AnalyticsProvider
- `components/AdminDashboard.tsx` - Added Analytics tab

## Usage Tips

1. **Tracking Bookings**: Integrate `trackBookingStarted` and `trackBookingCompleted` in the booking flow to track conversion rates.

2. **Custom Events**: Use `trackEvent` to track any interaction:
   ```tsx
   trackEvent('service_viewed', 'engagement', { serviceId: '123' });
   ```

3. **Privacy**: Analytics data is stored in your Supabase database, giving you full control over user data.

## Future Enhancements

Consider adding:
- Geographic location tracking (via IP geolocation API)
- Heatmaps for click tracking
- A/B testing capabilities
- Export to CSV functionality
- Email reports
