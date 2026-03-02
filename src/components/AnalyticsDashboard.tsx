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
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Cpu,
    AppWindow,
    UserCheck,
    UserPlus,
    LayoutGrid,
    Edit2,
    Check,
    X
} from 'lucide-react';

interface PageView {
    id: string;
    page_path: string;
    page_title: string;
    device_type: string;
    browser: string;
    created_at: string;
}

interface ClientDevice {
    device_model: string | null;
    os_name: string | null;
    os_version: string | null;
    browser: string | null;
    browser_version: string | null;
    device_type: string | null;
    screen_resolution: string | null;
    app_context: string | null;
}

interface Visitor {
    id: string;
    visitor_id: string;
    visit_count: number;
    first_visit: string;
    last_visit: string;
    custom_name?: string;
    client_devices?: ClientDevice[];
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

// Format date/time in Philippine timezone
const formatPHTime = (dateStr: string, options?: Intl.DateTimeFormatOptions): string => {
    return new Date(dateStr).toLocaleString('en-PH', {
        timeZone: 'Asia/Manila',
        ...options
    });
};

const formatPHDateTime = (dateStr: string): string => {
    return formatPHTime(dateStr, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
};

const formatPHTimeOnly = (dateStr: string): string => {
    return formatPHTime(dateStr, {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
};

const AnalyticsDashboard: React.FC = () => {
    const [data, setData] = useState<AnalyticsData>({ pageViews: [], visitors: [], events: [] });
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<TimeRange>('7d');
    const [visitorPage, setVisitorPage] = useState(0);
    const [editingVisitorId, setEditingVisitorId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');
    const VISITORS_PER_PAGE = 20;

    const handleSaveAlias = async (visitorId: string) => {
        try {
            const { error } = await supabase
                .from('visitors')
                .update({ custom_name: editingName || null })
                .eq('visitor_id', visitorId);

            if (error) throw error;

            setData(prev => ({
                ...prev,
                visitors: prev.visitors.map(v =>
                    v.visitor_id === visitorId
                        ? { ...v, custom_name: editingName || undefined }
                        : v
                )
            }));
            setEditingVisitorId(null);
        } catch (err) {
            console.error('Failed to save alias:', err);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    // Reset visitor page when time range changes
    useEffect(() => {
        setVisitorPage(0);
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

    // Helper: fetch ALL rows from a table using pagination (bypasses Supabase 1000-row default)
    const fetchAllRows = async <T,>(
        table: string,
        select: string,
        orderCol: string,
        timeFilter: string | null,
        timeCol: string
    ): Promise<T[]> => {
        const PAGE_SIZE = 1000;
        let allRows: T[] = [];
        let from = 0;
        let hasMore = true;

        while (hasMore) {
            let query = supabase
                .from(table)
                .select(select)
                .order(orderCol, { ascending: false })
                .range(from, from + PAGE_SIZE - 1);

            if (timeFilter) {
                query = query.gte(timeCol, timeFilter);
            }

            const { data, error } = await query;
            if (error) throw error;

            const rows = (data || []) as T[];
            allRows = allRows.concat(rows);

            if (rows.length < PAGE_SIZE) {
                hasMore = false;
            } else {
                from += PAGE_SIZE;
            }
        }

        return allRows;
    };

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const timeFilter = getTimeFilter();

            // Fetch ALL page views with pagination
            const pageViews = await fetchAllRows<PageView>(
                'page_views', '*', 'created_at', timeFilter, 'created_at'
            );

            // Fetch ALL visitors with device info (join client_devices)
            const visitors = await fetchAllRows<Visitor>(
                'visitors',
                '*, client_devices(device_model, os_name, os_version, browser, browser_version, device_type, screen_resolution, app_context)',
                'last_visit',
                timeFilter,
                'last_visit'
            );

            // Fetch ALL events with pagination
            const events = await fetchAllRows<AnalyticsEvent>(
                'analytics_events', '*', 'created_at', timeFilter, 'created_at'
            );

            setData({
                pageViews,
                visitors,
                events
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
        const newVisitors = uniqueVisitors - returningVisitors;
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

        // Daily views for chart — sorted chronologically
        const dailyViewsMap = data.pageViews.reduce((acc, pv) => {
            const d = new Date(pv.created_at);
            // Use YYYY-MM-DD as key for proper sorting
            const key = d.toLocaleDateString('en-PH', { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' });
            const label = d.toLocaleDateString('en-PH', { timeZone: 'Asia/Manila', month: 'short', day: 'numeric' });
            if (!acc[key]) acc[key] = { label, count: 0 };
            acc[key].count++;
            return acc;
        }, {} as Record<string, { label: string; count: number }>);

        const dailyViews = Object.entries(dailyViewsMap)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([, v]) => ({ label: v.label, count: v.count }));

        // Hourly distribution (in Philippine timezone)
        const hourlyViews = data.pageViews.reduce((acc, pv) => {
            const hour = parseInt(new Date(pv.created_at).toLocaleString('en-PH', { timeZone: 'Asia/Manila', hour: 'numeric', hour12: false }));
            acc[hour] = (acc[hour] || 0) + 1;
            return acc;
        }, {} as Record<number, number>);

        // OS breakdown from client_devices
        const osBreakdown = data.visitors.reduce((acc, v) => {
            const device = v.client_devices?.[0];
            if (device?.os_name) {
                const osKey = device.os_name;
                acc[osKey] = (acc[osKey] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        return {
            totalPageViews,
            uniqueVisitors,
            totalEvents,
            avgPagesPerVisitor,
            returningVisitors,
            newVisitors,
            returnRate,
            deviceBreakdown,
            browserBreakdown,
            topPages,
            eventBreakdown,
            dailyViews,
            hourlyViews,
            osBreakdown
        };
    }, [data]);

    /* ──────── Sub-components ──────── */

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
                    </div>
                )}
            </div>
            <p className="text-2xl md:text-3xl font-serif text-charcoal mb-1">{typeof value === 'number' ? value.toLocaleString() : value}</p>
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
                    <span className="text-charcoal font-medium">{value.toLocaleString()} ({percentage.toFixed(1)}%)</span>
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

    /* ──── Daily Page Views Bar Chart ──── */
    const DailyBarChart = ({ data }: { data: { label: string; count: number }[] }) => {
        const max = Math.max(...data.map(d => d.count), 1);
        const chartHeight = 160;

        if (data.length === 0) {
            return <p className="text-sm text-charcoal/50 text-center py-8">No data available</p>;
        }

        return (
            <div className="overflow-x-auto no-scrollbar">
                <div
                    className="flex items-end gap-[3px] min-w-full"
                    style={{ height: `${chartHeight}px`, width: data.length > 10 ? `${data.length * 40}px` : '100%' }}
                >
                    {data.map((item, i) => {
                        const barH = (item.count / max) * chartHeight;
                        return (
                            <div key={i} className="flex-1 min-w-[28px] flex flex-col items-center relative group">
                                {/* Tooltip */}
                                <div className="absolute bottom-full mb-1 px-2 py-1 bg-charcoal text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                    {item.label}: <strong>{item.count.toLocaleString()}</strong> views
                                </div>
                                {/* Bar */}
                                <div
                                    className="w-full bg-gradient-to-t from-gold to-gold/50 rounded-t-md transition-all duration-300 group-hover:from-gold/90 group-hover:to-gold/70 cursor-pointer"
                                    style={{ height: `${Math.max(barH, 3)}px` }}
                                />
                                {/* Label */}
                                <span className="text-[9px] text-charcoal/50 mt-1.5 truncate w-full text-center font-medium">
                                    {item.label.replace(/,?\s*\d{4}/, '')}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    /* ──── Hourly Activity Bar Chart ──── */
    const HourlyBarChart = ({ data }: { data: Record<number, number> }) => {
        const max = Math.max(...Object.values(data), 1);
        const chartHeight = 140;

        return (
            <div className="overflow-x-auto no-scrollbar">
                <div className="flex items-end gap-[2px] min-w-full" style={{ height: `${chartHeight}px` }}>
                    {Array.from({ length: 24 }, (_, hour) => {
                        const value = data[hour] || 0;
                        const barH = (value / max) * chartHeight;
                        const isPeak = value === max && value > 0;
                        return (
                            <div key={hour} className="flex-1 min-w-[18px] flex flex-col items-center relative group">
                                {/* Tooltip */}
                                <div className="absolute bottom-full mb-1 px-2 py-1 bg-charcoal text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                    {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}: <strong>{value.toLocaleString()}</strong> views
                                </div>
                                {/* Bar */}
                                <div
                                    className={`w-full rounded-t-sm transition-all duration-300 cursor-pointer ${isPeak
                                        ? 'bg-gradient-to-t from-emerald-500 to-emerald-400 group-hover:from-emerald-600'
                                        : 'bg-gradient-to-t from-gold/80 to-gold/40 group-hover:from-gold/90'
                                        }`}
                                    style={{ height: `${Math.max(barH, 2)}px` }}
                                />
                                {/* Label - show every 3rd hour */}
                                {(hour % 3 === 0) && (
                                    <span className="text-[8px] text-charcoal/40 mt-1 font-medium">
                                        {hour === 0 ? '12a' : hour < 12 ? `${hour}a` : hour === 12 ? '12p' : `${hour - 12}p`}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    /* ──── New vs Returning Donut ──── */
    const VisitorTypeSplit = ({ newCount, returnCount }: { newCount: number; returnCount: number }) => {
        const total = newCount + returnCount;
        const newPct = total > 0 ? (newCount / total) * 100 : 0;
        const retPct = total > 0 ? (returnCount / total) * 100 : 0;
        // SVG donut
        const radius = 40;
        const circumference = 2 * Math.PI * radius;
        const newStroke = (newPct / 100) * circumference;
        const retStroke = (retPct / 100) * circumference;

        return (
            <div className="flex items-center gap-6">
                <div className="relative w-28 h-28 flex-shrink-0">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        {/* Return segment */}
                        <circle cx="50" cy="50" r={radius} fill="none" stroke="#10b981" strokeWidth="12"
                            strokeDasharray={`${retStroke} ${circumference}`} strokeDashoffset="0"
                            strokeLinecap="round" className="transition-all duration-700" />
                        {/* New segment */}
                        <circle cx="50" cy="50" r={radius} fill="none" stroke="#caa969" strokeWidth="12"
                            strokeDasharray={`${newStroke} ${circumference}`} strokeDashoffset={`${-retStroke}`}
                            strokeLinecap="round" className="transition-all duration-700" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-lg font-serif text-charcoal">{total.toLocaleString()}</span>
                        <span className="text-[9px] text-charcoal/40 uppercase tracking-wider">Total</span>
                    </div>
                </div>
                <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gold" />
                        <div className="flex-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-charcoal/70">New</span>
                                <span className="font-medium text-charcoal">{newCount.toLocaleString()}</span>
                            </div>
                            <div className="h-1.5 bg-charcoal/5 rounded-full mt-1 overflow-hidden">
                                <div className="h-full bg-gold rounded-full transition-all duration-500" style={{ width: `${newPct}%` }} />
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <div className="flex-1">
                            <div className="flex justify-between text-sm">
                                <span className="text-charcoal/70">Returning</span>
                                <span className="font-medium text-charcoal">{returnCount.toLocaleString()}</span>
                            </div>
                            <div className="h-1.5 bg-charcoal/5 rounded-full mt-1 overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${retPct}%` }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    /* ──────── Pagination helpers ──────── */
    const totalVisitorPages = Math.ceil(data.visitors.length / VISITORS_PER_PAGE);
    const paginatedVisitors = data.visitors.slice(
        visitorPage * VISITORS_PER_PAGE,
        (visitorPage + 1) * VISITORS_PER_PAGE
    );

    /* ──────── RENDER ──────── */

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
                            <p className="text-[10px] md:text-xs text-charcoal/50">Views per day · Hover for details</p>
                        </div>
                        <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-gold" />
                    </div>
                    <DailyBarChart data={stats.dailyViews} />
                </div>

                {/* Hourly Activity Chart */}
                <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-gold/10 shadow-sm">
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                        <div>
                            <h3 className="font-semibold text-charcoal text-sm md:text-base">Activity by Hour</h3>
                            <p className="text-[10px] md:text-xs text-charcoal/50">Peak traffic times (PHT) · <span className="text-emerald-500">■</span> Peak hour</p>
                        </div>
                        <Clock className="w-4 h-4 md:w-5 md:h-5 text-gold" />
                    </div>
                    <HourlyBarChart data={stats.hourlyViews} />
                </div>
            </div>

            {/* New vs Returning + OS Breakdown Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* New vs Returning Visitors */}
                <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-gold/10 shadow-sm">
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                        <div>
                            <h3 className="font-semibold text-charcoal text-sm md:text-base">Visitor Type</h3>
                            <p className="text-[10px] md:text-xs text-charcoal/50">New vs returning visitors</p>
                        </div>
                        <div className="flex items-center gap-1">
                            <UserPlus className="w-4 h-4 text-gold" />
                            <UserCheck className="w-4 h-4 text-emerald-500" />
                        </div>
                    </div>
                    <VisitorTypeSplit newCount={stats.newVisitors} returnCount={stats.returningVisitors} />
                </div>

                {/* OS Breakdown */}
                <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-gold/10 shadow-sm">
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                        <div>
                            <h3 className="font-semibold text-charcoal text-sm md:text-base">Operating Systems</h3>
                            <p className="text-[10px] md:text-xs text-charcoal/50">Visitor OS distribution</p>
                        </div>
                        <Cpu className="w-4 h-4 md:w-5 md:h-5 text-gold" />
                    </div>
                    <div className="space-y-3">
                        {Object.entries(stats.osBreakdown).length > 0 ? (
                            Object.entries(stats.osBreakdown)
                                .sort(([, a], [, b]) => b - a)
                                .map(([os, count]) => {
                                    const osColors: Record<string, string> = {
                                        'Android': 'bg-emerald-500', 'iOS': 'bg-blue-500', 'iPadOS': 'bg-blue-400',
                                        'Windows': 'bg-sky-500', 'macOS': 'bg-gray-600', 'Linux': 'bg-orange-500', 'Other': 'bg-charcoal/30'
                                    };
                                    return (
                                        <ProgressBar
                                            key={os}
                                            label={os}
                                            value={count}
                                            total={stats.uniqueVisitors}
                                            color={osColors[os] || 'bg-gold'}
                                        />
                                    );
                                })
                        ) : (
                            <p className="text-sm text-charcoal/50 text-center py-4">No OS data available</p>
                        )}
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
                            <span className="text-charcoal/60">{(stats.deviceBreakdown.desktop || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Smartphone className="w-4 h-4 text-emerald-500" />
                            <span className="text-charcoal/60">{(stats.deviceBreakdown.mobile || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Tablet className="w-4 h-4 text-purple-500" />
                            <span className="text-charcoal/60">{(stats.deviceBreakdown.tablet || 0).toLocaleString()}</span>
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
                                <span className="text-sm font-medium text-gold">{views.toLocaleString()}</span>
                            </div>
                        ))}
                        {stats.topPages.length === 0 && (
                            <p className="text-sm text-charcoal/50 text-center py-4">No data available</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Events */}
            <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-gold/10 shadow-sm">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                    <div>
                        <h3 className="font-semibold text-charcoal text-sm md:text-base">Event Tracking</h3>
                        <p className="text-[10px] md:text-xs text-charcoal/50">User interactions & conversions</p>
                    </div>
                    <MousePointerClick className="w-4 h-4 md:w-5 md:h-5 text-gold" />
                </div>
                {Object.keys(stats.eventBreakdown).length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {Object.entries(stats.eventBreakdown)
                            .sort(([, a], [, b]) => b - a)
                            .slice(0, 9)
                            .map(([event, count]) => (
                                <div key={event} className="flex items-center justify-between p-3 bg-charcoal/5 rounded-xl">
                                    <span className="text-sm text-charcoal capitalize">
                                        {event.replace(/_/g, ' ')}
                                    </span>
                                    <span className="text-sm font-medium text-gold">{count.toLocaleString()}</span>
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

            {/* ── All Visitors (Paginated) ── */}
            <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-gold/10 shadow-sm">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                    <div>
                        <h3 className="font-semibold text-charcoal text-sm md:text-base">All Visitors</h3>
                        <p className="text-[10px] md:text-xs text-charcoal/50">
                            Showing {data.visitors.length > 0 ? visitorPage * VISITORS_PER_PAGE + 1 : 0}–{Math.min((visitorPage + 1) * VISITORS_PER_PAGE, data.visitors.length)} of {data.visitors.length.toLocaleString()} visitors · Times in Philippine Standard Time
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <LayoutGrid className="w-4 h-4 md:w-5 md:h-5 text-gold" />
                    </div>
                </div>

                {/* Visitor Cards */}
                <div className="space-y-3">
                    {paginatedVisitors.map((visitor) => {
                        const device = visitor.client_devices?.[0];
                        const deviceIcon = device?.device_type === 'mobile' ? Smartphone
                            : device?.device_type === 'tablet' ? Tablet : Monitor;
                        const DeviceIcon = deviceIcon;

                        return (
                            <div key={visitor.id} className="p-3 md:p-4 bg-charcoal/5 rounded-xl hover:bg-charcoal/[0.08] transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold to-gold/60 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                        {visitor.visit_count}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            {editingVisitorId === visitor.visitor_id ? (
                                                <div className="flex items-center gap-2 w-full max-w-[200px]">
                                                    <input
                                                        type="text"
                                                        value={editingName}
                                                        onChange={(e) => setEditingName(e.target.value)}
                                                        className="text-sm border border-gold/30 rounded px-2 py-0.5 bg-white w-full focus:outline-none focus:border-gold"
                                                        placeholder="Name (e.g., My iPhone)"
                                                        autoFocus
                                                        onKeyDown={(e) => e.key === 'Enter' && handleSaveAlias(visitor.visitor_id)}
                                                    />
                                                    <button onClick={() => handleSaveAlias(visitor.visitor_id)} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded">
                                                        <Check size={14} />
                                                    </button>
                                                    <button onClick={() => setEditingVisitorId(null)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 group">
                                                    <p className="text-sm font-medium text-charcoal truncate flex items-center gap-2">
                                                        {visitor.custom_name ? (
                                                            <>
                                                                <span>{visitor.custom_name}</span>
                                                                <span className="text-[10px] text-charcoal/40 font-normal">({visitor.visitor_id.slice(0, 8)}...)</span>
                                                            </>
                                                        ) : (
                                                            visitor.visitor_id.slice(0, 16) + '...'
                                                        )}
                                                    </p>
                                                    <button
                                                        onClick={() => {
                                                            setEditingVisitorId(visitor.visitor_id);
                                                            setEditingName(visitor.custom_name || '');
                                                        }}
                                                        className="opacity-0 group-hover:opacity-100 p-1 text-charcoal/40 hover:text-gold transition-all"
                                                        title="Add nickname"
                                                    >
                                                        <Edit2 size={12} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-charcoal/50">
                                            <span className="flex items-center gap-1">
                                                <Clock size={10} />
                                                Last: {formatPHDateTime(visitor.last_visit)}
                                            </span>
                                            <span className="text-charcoal/30">·</span>
                                            <span>First: {formatPHDateTime(visitor.first_visit)}</span>
                                        </div>
                                    </div>
                                    {visitor.visit_count > 1 ? (
                                        <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full font-medium flex-shrink-0">
                                            Returning
                                        </span>
                                    ) : (
                                        <span className="text-xs px-2 py-1 bg-gold/10 text-gold rounded-full font-medium flex-shrink-0">
                                            New
                                        </span>
                                    )}
                                </div>
                                {/* Device Info */}
                                {device && (
                                    <div className="mt-2 pt-2 border-t border-charcoal/5 flex flex-wrap items-center gap-x-4 gap-y-1">
                                        <div className="flex items-center gap-1.5 text-[11px] text-charcoal/55">
                                            <DeviceIcon size={12} className="text-charcoal/40" />
                                            <span>{device.device_model || device.device_type || 'Unknown'}</span>
                                        </div>
                                        {device.os_name && (
                                            <div className="flex items-center gap-1.5 text-[11px] text-charcoal/55">
                                                <Cpu size={12} className="text-charcoal/40" />
                                                <span>{device.os_name}{device.os_version ? ` ${device.os_version}` : ''}</span>
                                            </div>
                                        )}
                                        {device.browser && (
                                            <div className="flex items-center gap-1.5 text-[11px] text-charcoal/55">
                                                <Globe size={12} className="text-charcoal/40" />
                                                <span>{device.browser}{device.browser_version ? ` v${device.browser_version}` : ''}</span>
                                            </div>
                                        )}
                                        {device.app_context && device.app_context !== 'Direct Browser' && (
                                            <div className="flex items-center gap-1.5 text-[11px] text-charcoal/55">
                                                <AppWindow size={12} className="text-charcoal/40" />
                                                <span>via {device.app_context}</span>
                                            </div>
                                        )}
                                        {device.screen_resolution && (
                                            <span className="text-[11px] text-charcoal/40">{device.screen_resolution}</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {data.visitors.length === 0 && (
                        <div className="text-center py-8">
                            <Users className="w-12 h-12 text-charcoal/20 mx-auto mb-3" />
                            <p className="text-sm text-charcoal/50">No visitors yet</p>
                        </div>
                    )}
                </div>

                {/* Pagination Controls */}
                {totalVisitorPages > 1 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gold/10">
                        <button
                            onClick={() => setVisitorPage(p => Math.max(0, p - 1))}
                            disabled={visitorPage === 0}
                            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-charcoal/60 hover:text-charcoal disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={16} /> Previous
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(totalVisitorPages, 7) }, (_, i) => {
                                let pageNum: number;
                                if (totalVisitorPages <= 7) {
                                    pageNum = i;
                                } else if (visitorPage < 3) {
                                    pageNum = i;
                                } else if (visitorPage > totalVisitorPages - 4) {
                                    pageNum = totalVisitorPages - 7 + i;
                                } else {
                                    pageNum = visitorPage - 3 + i;
                                }
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setVisitorPage(pageNum)}
                                        className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${visitorPage === pageNum
                                            ? 'bg-gold text-white shadow-sm'
                                            : 'text-charcoal/50 hover:bg-charcoal/5'
                                            }`}
                                    >
                                        {pageNum + 1}
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => setVisitorPage(p => Math.min(totalVisitorPages - 1, p + 1))}
                            disabled={visitorPage >= totalVisitorPages - 1}
                            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-charcoal/60 hover:text-charcoal disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            Next <ChevronRight size={16} />
                        </button>
                    </div>
                )}
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
                                Data from {timeRange === 'today' ? 'today' :
                                    timeRange === '24h' ? 'last 24 hours' :
                                        timeRange === '7d' ? 'last 7 days' :
                                            timeRange === '30d' ? 'last 30 days' : 'all time'}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-6 md:gap-8">
                        <div className="text-center">
                            <p className="text-xl md:text-2xl font-serif text-gold">{stats.totalPageViews.toLocaleString()}</p>
                            <p className="text-[10px] md:text-xs text-white/60">Total Views</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xl md:text-2xl font-serif text-gold">{stats.uniqueVisitors.toLocaleString()}</p>
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
