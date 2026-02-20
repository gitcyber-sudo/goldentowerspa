import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import {
    BarChart3,
    TrendingUp,
    Users,
    Eye,
    MousePointerClick,
    Smartphone,
    Monitor,
    Tablet,
    Globe,
    Clock,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    Target,
    ChevronDown
} from 'lucide-react';

interface PageView {
    id: string;
    page_path: string;
    page_title: string;
    device_type: string;
    browser: string;
    created_at: string;
}

interface Visitor {
    id: string;
    visitor_id: string;
    visit_count: number;
    first_visit: string;
    last_visit: string;
}

interface AnalyticsEvent {
    id: string;
    event_name: string;
    event_category: string;
    event_data: Record<string, unknown>;
    created_at: string;
}

interface AnalyticsData {
    pageViews: PageView[];
    visitors: Visitor[];
    events: AnalyticsEvent[];
}

type TimeRange = 'today' | '24h' | '7d' | '30d' | 'all';

const AnalyticsDashboard: React.FC = () => {
    const [data, setData] = useState<AnalyticsData>({ pageViews: [], visitors: [], events: [] });
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<TimeRange>('7d');

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const getTimeFilter = () => {
        const now = new Date();
        switch (timeRange) {
            case 'today': {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return today.toISOString();
            }
            case '24h':
                return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
            case '7d':
                return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
            case '30d':
                return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
            default:
                return null;
        }
    };

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const timeFilter = getTimeFilter();

            // Fetch page views
            let pageViewsQuery = supabase
                .from('page_views')
                .select('*')
                .order('created_at', { ascending: false });

            if (timeFilter) {
                pageViewsQuery = pageViewsQuery.gte('created_at', timeFilter);
            }

            const { data: pageViews } = await pageViewsQuery;

            // Fetch visitors
            let visitorsQuery = supabase
                .from('visitors')
                .select('*')
                .order('last_visit', { ascending: false });

            if (timeFilter) {
                visitorsQuery = visitorsQuery.gte('last_visit', timeFilter);
            }

            const { data: visitors } = await visitorsQuery;

            // Fetch events
            let eventsQuery = supabase
                .from('analytics_events')
                .select('*')
                .order('created_at', { ascending: false });

            if (timeFilter) {
                eventsQuery = eventsQuery.gte('created_at', timeFilter);
            }

            const { data: events } = await eventsQuery;

            setData({
                pageViews: pageViews || [],
                visitors: visitors || [],
                events: events || []
            });
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate stats
    const stats = useMemo(() => {
        const totalPageViews = data.pageViews.length;
        const uniqueVisitors = data.visitors.length;
        const totalEvents = data.events.length;
        const avgPagesPerVisitor = uniqueVisitors > 0 ? (totalPageViews / uniqueVisitors).toFixed(1) : '0';

        // Calculate returning visitors
        const returningVisitors = data.visitors.filter(v => v.visit_count > 1).length;
        const returnRate = uniqueVisitors > 0 ? ((returningVisitors / uniqueVisitors) * 100).toFixed(1) : '0';

        // Device breakdown
        const deviceBreakdown = data.pageViews.reduce((acc, pv) => {
            acc[pv.device_type || 'desktop'] = (acc[pv.device_type || 'desktop'] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Browser breakdown
        const browserBreakdown = data.pageViews.reduce((acc, pv) => {
            acc[pv.browser || 'Other'] = (acc[pv.browser || 'Other'] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Top pages
        const pageBreakdown = data.pageViews.reduce((acc, pv) => {
            const key = pv.page_path || '/';
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const topPages = Object.entries(pageBreakdown)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);

        // Event breakdown
        const eventBreakdown = data.events.reduce((acc, e) => {
            acc[e.event_name] = (acc[e.event_name] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Daily views for chart
        const dailyViews = data.pageViews.reduce((acc, pv) => {
            const date = new Date(pv.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Hourly distribution
        const hourlyViews = data.pageViews.reduce((acc, pv) => {
            const hour = new Date(pv.created_at).getHours();
            acc[hour] = (acc[hour] || 0) + 1;
            return acc;
        }, {} as Record<number, number>);

        return {
            totalPageViews,
            uniqueVisitors,
            totalEvents,
            avgPagesPerVisitor,
            returningVisitors,
            returnRate,
            deviceBreakdown,
            browserBreakdown,
            topPages,
            eventBreakdown,
            dailyViews,
            hourlyViews
        };
    }, [data]);

    const StatCard = ({ icon: Icon, label, value, subValue, trend, color }: {
        icon: React.ElementType;
        label: string;
        value: string | number;
        subValue?: string;
        trend?: 'up' | 'down';
        color: string;
    }) => (
        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-gold/10 shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3 md:mb-4">
                <div className={`p-2 md:p-3 rounded-xl ${color}`}>
                    <Icon className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                {trend && (
                    <div className={`flex items-center text-xs font-medium ${trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        12%
                    </div>
                )}
            </div>
            <p className="text-2xl md:text-3xl font-serif text-charcoal mb-1">{value}</p>
            <p className="text-[10px] md:text-xs uppercase tracking-wider text-charcoal/50 font-medium">{label}</p>
            {subValue && <p className="text-xs text-gold mt-2">{subValue}</p>}
        </div>
    );

    const ProgressBar = ({ label, value, total, color }: { label: string; value: number; total: number; color: string }) => {
        const percentage = total > 0 ? (value / total) * 100 : 0;
        return (
            <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                    <span className="text-charcoal/70">{label}</span>
                    <span className="text-charcoal font-medium">{value} ({percentage.toFixed(1)}%)</span>
                </div>
                <div className="h-2 bg-charcoal/5 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${color} rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>
        );
    };

    const MiniBarChart = ({ data }: { data: Record<string, number> }) => {
        const entries = Object.entries(data);
        const max = Math.max(...entries.map(([, v]) => v), 1);

        return (
            <div className="overflow-x-auto no-scrollbar pb-2">
                <div className="flex items-end gap-1 h-20 min-w-full" style={{ width: entries.length > 7 ? `${entries.length * 30}px` : '100%' }}>
                    {entries.map(([date, value]) => (
                        <div key={date} className="flex-1 min-w-[25px] flex flex-col items-center">
                            <div
                                className="w-full bg-gradient-to-t from-gold to-gold/60 rounded-t transition-all duration-300 hover:from-gold/80"
                                style={{ height: `${(value / max) * 100}%`, minHeight: '4px' }}
                            />
                            <span className="text-[8px] text-charcoal/40 mt-1 truncate w-full text-center">{date.split(' ')[1]}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const HourlyHeatmap = ({ data }: { data: Record<number, number> }) => {
        const max = Math.max(...Object.values(data), 1);

        return (
            <div className="grid grid-cols-12 gap-1">
                {Array.from({ length: 24 }, (_, hour) => {
                    const value = data[hour] || 0;
                    const intensity = value / max;
                    return (
                        <div
                            key={hour}
                            className="aspect-square rounded-sm relative group cursor-pointer"
                            style={{
                                backgroundColor: `rgba(202, 169, 105, ${0.1 + intensity * 0.9})`
                            }}
                        >
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-charcoal text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {hour}:00 - {value} views
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-charcoal/60">Loading analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-serif text-charcoal">Website Analytics</h2>
                    <p className="text-xs md:text-sm text-charcoal/60">Track visitor behavior and engagement</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                            className="appearance-none bg-white border border-gold/20 rounded-xl px-4 py-2 pr-10 text-sm font-medium text-charcoal focus:outline-none focus:border-gold"
                        >
                            <option value="today">Today</option>
                            <option value="24h">Last 24 Hours</option>
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                            <option value="all">All Time</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/40 pointer-events-none" />
                    </div>
                    <button
                        onClick={fetchAnalytics}
                        className="p-2 border border-gold/20 rounded-xl hover:bg-gold/5 transition-colors"
                    >
                        <Activity className="w-5 h-5 text-gold" />
                    </button>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                <StatCard
                    icon={Eye}
                    label="Page Views"
                    value={stats.totalPageViews}
                    color="bg-blue-100 text-blue-600"
                    trend="up"
                />
                <StatCard
                    icon={Users}
                    label="Unique Visitors"
                    value={stats.uniqueVisitors}
                    subValue={`${stats.returnRate}% returning`}
                    color="bg-emerald-100 text-emerald-600"
                    trend="up"
                />
                <StatCard
                    icon={Target}
                    label="Avg. Pages/Visit"
                    value={stats.avgPagesPerVisitor}
                    color="bg-purple-100 text-purple-600"
                />
                <StatCard
                    icon={MousePointerClick}
                    label="Total Events"
                    value={stats.totalEvents}
                    color="bg-amber-100 text-amber-600"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Daily Views Chart */}
                <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-gold/10 shadow-sm">
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                        <div>
                            <h3 className="font-semibold text-charcoal text-sm md:text-base">Daily Page Views</h3>
                            <p className="text-[10px] md:text-xs text-charcoal/50">Views per day</p>
                        </div>
                        <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-gold" />
                    </div>
                    <MiniBarChart data={stats.dailyViews} />
                </div>

                {/* Hourly Heatmap */}
                <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-gold/10 shadow-sm">
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                        <div>
                            <h3 className="font-semibold text-charcoal text-sm md:text-base">Activity by Hour</h3>
                            <p className="text-[10px] md:text-xs text-charcoal/50">Peak traffic times (0-23h)</p>
                        </div>
                        <Clock className="w-4 h-4 md:w-5 md:h-5 text-gold" />
                    </div>
                    <HourlyHeatmap data={stats.hourlyViews} />
                    <div className="flex justify-between text-[10px] md:text-xs text-charcoal/40 mt-2">
                        <span>12 AM</span>
                        <span>12 PM</span>
                        <span>11 PM</span>
                    </div>
                </div>
            </div>

            {/* Secondary Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {/* Device Breakdown */}
                <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-gold/10 shadow-sm">
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                        <h3 className="font-semibold text-charcoal text-sm md:text-base">Devices</h3>
                        <Monitor className="w-4 h-4 md:w-5 md:h-5 text-gold" />
                    </div>
                    <div className="space-y-4">
                        <ProgressBar
                            label="Desktop"
                            value={stats.deviceBreakdown.desktop || 0}
                            total={stats.totalPageViews}
                            color="bg-blue-500"
                        />
                        <ProgressBar
                            label="Mobile"
                            value={stats.deviceBreakdown.mobile || 0}
                            total={stats.totalPageViews}
                            color="bg-emerald-500"
                        />
                        <ProgressBar
                            label="Tablet"
                            value={stats.deviceBreakdown.tablet || 0}
                            total={stats.totalPageViews}
                            color="bg-purple-500"
                        />
                    </div>
                    <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-gold/10">
                        <div className="flex items-center gap-2 text-sm">
                            <Monitor className="w-4 h-4 text-blue-500" />
                            <span className="text-charcoal/60">{stats.deviceBreakdown.desktop || 0}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Smartphone className="w-4 h-4 text-emerald-500" />
                            <span className="text-charcoal/60">{stats.deviceBreakdown.mobile || 0}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Tablet className="w-4 h-4 text-purple-500" />
                            <span className="text-charcoal/60">{stats.deviceBreakdown.tablet || 0}</span>
                        </div>
                    </div>
                </div>

                {/* Browser Breakdown */}
                <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-gold/10 shadow-sm">
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                        <h3 className="font-semibold text-charcoal text-sm md:text-base">Browsers</h3>
                        <Globe className="w-4 h-4 md:w-5 md:h-5 text-gold" />
                    </div>
                    <div className="space-y-3">
                        {Object.entries(stats.browserBreakdown)
                            .sort(([, a], [, b]) => b - a)
                            .map(([browser, count]) => (
                                <ProgressBar
                                    key={browser}
                                    label={browser}
                                    value={count}
                                    total={stats.totalPageViews}
                                    color="bg-gold"
                                />
                            ))}
                    </div>
                </div>

                {/* Top Pages */}
                <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-gold/10 shadow-sm">
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                        <h3 className="font-semibold text-charcoal text-sm md:text-base">Top Pages</h3>
                        <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-gold" />
                    </div>
                    <div className="space-y-3">
                        {stats.topPages.map(([path, views], index) => (
                            <div key={path} className="flex items-center gap-3">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-gold text-white' : 'bg-charcoal/5 text-charcoal/60'
                                    }`}>
                                    {index + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-charcoal truncate">
                                        {path === '/' ? 'Home' : path}
                                    </p>
                                </div>
                                <span className="text-sm font-medium text-gold">{views}</span>
                            </div>
                        ))}
                        {stats.topPages.length === 0 && (
                            <p className="text-sm text-charcoal/50 text-center py-4">No data available</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Events & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Event Breakdown */}
                <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-gold/10 shadow-sm">
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                        <div>
                            <h3 className="font-semibold text-charcoal text-sm md:text-base">Event Tracking</h3>
                            <p className="text-[10px] md:text-xs text-charcoal/50">User interactions & conversions</p>
                        </div>
                        <MousePointerClick className="w-4 h-4 md:w-5 md:h-5 text-gold" />
                    </div>
                    {Object.keys(stats.eventBreakdown).length > 0 ? (
                        <div className="space-y-3">
                            {Object.entries(stats.eventBreakdown)
                                .sort(([, a], [, b]) => b - a)
                                .slice(0, 6)
                                .map(([event, count]) => (
                                    <div key={event} className="flex items-center justify-between p-3 bg-charcoal/5 rounded-xl">
                                        <span className="text-sm text-charcoal capitalize">
                                            {event.replace(/_/g, ' ')}
                                        </span>
                                        <span className="text-sm font-medium text-gold">{count}</span>
                                    </div>
                                ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <MousePointerClick className="w-12 h-12 text-charcoal/20 mx-auto mb-3" />
                            <p className="text-sm text-charcoal/50">No events tracked yet</p>
                        </div>
                    )}
                </div>

                {/* Recent Visitors */}
                <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-gold/10 shadow-sm">
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                        <div>
                            <h3 className="font-semibold text-charcoal text-sm md:text-base">Recent Visitors</h3>
                            <p className="text-[10px] md:text-xs text-charcoal/50">Latest visitor activity</p>
                        </div>
                        <Calendar className="w-4 h-4 md:w-5 md:h-5 text-gold" />
                    </div>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                        {data.visitors.slice(0, 10).map((visitor) => (
                            <div key={visitor.id} className="flex items-center gap-3 p-3 bg-charcoal/5 rounded-xl">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold/60 flex items-center justify-center text-white font-bold text-sm">
                                    {visitor.visit_count}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-charcoal truncate">
                                        {visitor.visitor_id.slice(0, 12)}...
                                    </p>
                                    <p className="text-xs text-charcoal/50">
                                        Last visit: {new Date(visitor.last_visit).toLocaleDateString()}
                                    </p>
                                </div>
                                {visitor.visit_count > 1 && (
                                    <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                                        Returning
                                    </span>
                                )}
                            </div>
                        ))}
                        {data.visitors.length === 0 && (
                            <div className="text-center py-8">
                                <Users className="w-12 h-12 text-charcoal/20 mx-auto mb-3" />
                                <p className="text-sm text-charcoal/50">No visitors yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer Stats */}
            <div className="bg-gradient-to-r from-charcoal to-charcoal/90 rounded-xl md:rounded-2xl p-4 md:p-6 text-white">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 md:p-3 bg-gold/20 rounded-xl">
                            <Activity className="w-5 h-5 md:w-6 md:h-6 text-gold" />
                        </div>
                        <div>
                            <p className="font-serif text-base md:text-lg">Analytics Summary</p>
                            <p className="text-[10px] md:text-xs text-white/60">
                                Data from {timeRange === '24h' ? 'last 24 hours' :
                                    timeRange === '7d' ? 'last 7 days' :
                                        timeRange === '30d' ? 'last 30 days' : 'all time'}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-6 md:gap-8">
                        <div className="text-center">
                            <p className="text-xl md:text-2xl font-serif text-gold">{stats.totalPageViews}</p>
                            <p className="text-[10px] md:text-xs text-white/60">Total Views</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xl md:text-2xl font-serif text-gold">{stats.uniqueVisitors}</p>
                            <p className="text-[10px] md:text-xs text-white/60">Unique Visitors</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xl md:text-2xl font-serif text-gold">{stats.returnRate}%</p>
                            <p className="text-[10px] md:text-xs text-white/60">Return Rate</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
