import React, { useMemo, useState } from 'react';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    Users,
    Sparkles,
    ChevronDown,
    BarChart3,
    PieChart,
    Activity
} from 'lucide-react';

interface Booking {
    id: string;
    user_email: string;
    guest_name?: string;
    service_id: string;
    therapist_id?: string;
    booking_date: string;
    booking_time: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    services: { title: string; price: number };
    therapists?: { name: string };
    created_at: string;
}

interface RevenueDashboardProps {
    bookings: Booking[];
}

type TimeRange = '7d' | '30d' | '90d' | 'all' | 'custom';

const RevenueDashboard: React.FC<RevenueDashboardProps> = ({ bookings }) => {
    const [timeRange, setTimeRange] = useState<TimeRange>('30d');
    const [customMonth, setCustomMonth] = useState(new Date().getMonth());
    const [customYear, setCustomYear] = useState(new Date().getFullYear());

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Generate year options (last 5 years + current year)
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

    const getTimeFilter = (): { start: Date | null; end: Date | null } => {
        // Get current time in Manila
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Asia/Manila',
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: false
        });

        const parts = formatter.formatToParts(now);
        const map: Record<string, string> = {};
        parts.forEach(p => map[p.type] = p.value);

        // Construct a Date object that represents Manila local time
        const manilaNow = new Date(
            parseInt(map.year),
            parseInt(map.month) - 1,
            parseInt(map.day),
            parseInt(map.hour),
            parseInt(map.minute),
            parseInt(map.second)
        );

        switch (timeRange) {
            case '7d':
                return { start: new Date(manilaNow.getTime() - 7 * 24 * 60 * 60 * 1000), end: manilaNow };
            case '30d':
                return { start: new Date(manilaNow.getTime() - 30 * 24 * 60 * 60 * 1000), end: manilaNow };
            case '90d':
                return { start: new Date(manilaNow.getTime() - 90 * 24 * 60 * 60 * 1000), end: manilaNow };
            case 'custom':
                const start = new Date(customYear, customMonth, 1);
                const end = new Date(customYear, customMonth + 1, 0, 23, 59, 59);
                return { start, end };
            default:
                return { start: null, end: null };
        }
    };

    const filteredBookings = useMemo(() => {
        const { start, end } = getTimeFilter();
        if (!start || !end) return bookings;
        return bookings.filter(b => {
            const date = new Date(b.created_at);
            return date >= start && date <= end;
        });
    }, [bookings, timeRange, customMonth, customYear]);

    const stats = useMemo(() => {
        const completed = filteredBookings.filter(b => b.status === 'completed');
        const pending = filteredBookings.filter(b => b.status === 'pending' || b.status === 'confirmed');
        const cancelled = filteredBookings.filter(b => b.status === 'cancelled');

        const totalRevenue = completed.reduce((sum, b) => sum + (b.services?.price || 0), 0);
        const pendingRevenue = pending.reduce((sum, b) => sum + (b.services?.price || 0), 0);
        const lostRevenue = cancelled.reduce((sum, b) => sum + (b.services?.price || 0), 0);

        // Calculate daily revenue
        const dailyRevenue: Record<string, number> = {};
        completed.forEach(b => {
            const date = new Date(b.booking_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            dailyRevenue[date] = (dailyRevenue[date] || 0) + (b.services?.price || 0);
        });

        // Service breakdown
        const serviceRevenue: Record<string, { count: number; revenue: number }> = {};
        completed.forEach(b => {
            const title = b.services?.title || 'Unknown';
            if (!serviceRevenue[title]) {
                serviceRevenue[title] = { count: 0, revenue: 0 };
            }
            serviceRevenue[title].count += 1;
            serviceRevenue[title].revenue += b.services?.price || 0;
        });

        // Top services by revenue
        const topServices = Object.entries(serviceRevenue)
            .sort(([, a], [, b]) => b.revenue - a.revenue)
            .slice(0, 5);

        // Therapist performance
        const therapistRevenue: Record<string, { name: string; count: number; revenue: number }> = {};
        completed.forEach(b => {
            const therapistName = b.therapists?.name || 'Unassigned';
            const therapistId = b.therapist_id || 'unassigned';
            if (!therapistRevenue[therapistId]) {
                therapistRevenue[therapistId] = { name: therapistName, count: 0, revenue: 0 };
            }
            therapistRevenue[therapistId].count += 1;
            therapistRevenue[therapistId].revenue += b.services?.price || 0;
        });

        const topTherapists = Object.entries(therapistRevenue)
            .sort(([, a], [, b]) => b.revenue - a.revenue)
            .slice(0, 5);

        // Average booking value
        const avgBookingValue = completed.length > 0 ? totalRevenue / completed.length : 0;

        // Booking trend calculation (compare with previous period)
        const now = new Date();
        const periodLength = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : timeRange === 'custom' ? 30 : 365;
        const previousPeriodStart = new Date(now.getTime() - periodLength * 2 * 24 * 60 * 60 * 1000);
        const previousPeriodEnd = new Date(now.getTime() - periodLength * 24 * 60 * 60 * 1000);

        const previousPeriodBookings = bookings.filter(b => {
            const date = new Date(b.created_at);
            return date >= previousPeriodStart && date < previousPeriodEnd && b.status === 'completed';
        });

        const previousRevenue = previousPeriodBookings.reduce((sum, b) => sum + (b.services?.price || 0), 0);
        const revenueTrend = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;

        // Weekly breakdown
        const weeklyRevenue: { week: string; revenue: number; bookings: number }[] = [];
        const weeks = timeRange === '7d' ? 1 : timeRange === '30d' ? 4 : timeRange === '90d' ? 12 : timeRange === 'custom' ? 4 : 52;

        for (let i = weeks - 1; i >= 0; i--) {
            const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
            const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);

            const weekBookings = completed.filter(b => {
                const date = new Date(b.booking_date);
                return date >= weekStart && date < weekEnd;
            });

            const weekRev = weekBookings.reduce((sum, b) => sum + (b.services?.price || 0), 0);
            weeklyRevenue.push({
                week: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                revenue: weekRev,
                bookings: weekBookings.length
            });
        }

        return {
            totalRevenue,
            pendingRevenue,
            lostRevenue,
            completedCount: completed.length,
            pendingCount: pending.length,
            cancelledCount: cancelled.length,
            avgBookingValue,
            revenueTrend,
            dailyRevenue,
            topServices,
            topTherapists,
            weeklyRevenue
        };
    }, [filteredBookings, bookings, timeRange, customMonth, customYear]);

    const StatCard = ({ icon: Icon, label, value, subValue, trend, color, prefix = '' }: {
        icon: React.ElementType;
        label: string;
        value: string | number;
        subValue?: string;
        trend?: number;
        color: string;
        prefix?: string;
    }) => (
        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-gold/10 shadow-sm hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3 md:mb-4">
                <div className={`p-2 md:p-3 rounded-xl ${color}`}>
                    <Icon className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                {trend !== undefined && (
                    <div className={`flex items-center text-xs font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {trend >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {Math.abs(trend).toFixed(1)}%
                    </div>
                )}
            </div>
            <p className="text-2xl md:text-3xl font-serif text-charcoal mb-1">{prefix}{typeof value === 'number' ? value.toLocaleString() : value}</p>
            <p className="text-[10px] md:text-xs uppercase tracking-wider text-charcoal/50 font-medium">{label}</p>
            {subValue && <p className="text-xs text-gold mt-2">{subValue}</p>}
        </div>
    );

    const BarChart = ({ data }: { data: { week: string; revenue: number; bookings: number }[] }) => {
        const max = Math.max(...data.map(d => d.revenue), 1);

        return (
            <div className="flex items-end gap-1 md:gap-2 h-32 md:h-40">
                {data.map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center group relative">
                        <div
                            className="w-full bg-gradient-to-t from-gold to-gold/60 rounded-t transition-all duration-300 hover:from-gold/80 cursor-pointer"
                            style={{ height: `${(item.revenue / max) * 100}%`, minHeight: item.revenue > 0 ? '8px' : '0' }}
                        />
                        <span className="text-[8px] md:text-[10px] text-charcoal/40 mt-1 truncate w-full text-center">{item.week.split(' ')[1]}</span>
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-charcoal text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                            <p className="font-semibold">₱{item.revenue.toLocaleString()}</p>
                            <p className="text-white/60">{item.bookings} bookings</p>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const ProgressBar = ({ label, value, total, count, color }: { label: string; value: number; total: number; count: number; color: string }) => {
        const percentage = total > 0 ? (value / total) * 100 : 0;
        return (
            <div className="mb-3 md:mb-4">
                <div className="flex justify-between text-xs md:text-sm mb-1">
                    <span className="text-charcoal/70 truncate flex-1">{label}</span>
                    <span className="text-charcoal font-medium ml-2">₱{value.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-charcoal/5 rounded-full overflow-hidden">
                    <div
                        className={`h-full ${color} rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                <p className="text-[10px] text-charcoal/40 mt-1">{count} bookings</p>
            </div>
        );
    };

    const getDateRangeLabel = () => {
        if (timeRange === 'custom') {
            return `${months[customMonth]} ${customYear}`;
        }
        switch (timeRange) {
            case '7d': return 'last 7 days';
            case '30d': return 'last 30 days';
            case '90d': return 'last 90 days';
            default: return 'all time';
        }
    };

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-serif text-charcoal">Revenue Analytics</h2>
                    <p className="text-xs md:text-sm text-charcoal/60">Track earnings and business performance</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 md:gap-3">
                    {/* Time Range Selector */}
                    <div className="relative">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                            className="appearance-none bg-white border border-gold/20 rounded-xl px-3 md:px-4 py-2 pr-8 md:pr-10 text-xs md:text-sm font-medium text-charcoal focus:outline-none focus:border-gold"
                        >
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                            <option value="90d">Last 90 Days</option>
                            <option value="all">All Time</option>
                            <option value="custom">Custom Month</option>
                        </select>
                        <ChevronDown className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/40 pointer-events-none" />
                    </div>

                    {/* Custom Month/Year Picker */}
                    {timeRange === 'custom' && (
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <select
                                    value={customMonth}
                                    onChange={(e) => setCustomMonth(parseInt(e.target.value))}
                                    className="appearance-none bg-white border border-gold/20 rounded-xl px-3 py-2 pr-8 text-xs md:text-sm font-medium text-charcoal focus:outline-none focus:border-gold"
                                >
                                    {months.map((month, index) => (
                                        <option key={month} value={index}>{month}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/40 pointer-events-none" />
                            </div>
                            <div className="relative">
                                <select
                                    value={customYear}
                                    onChange={(e) => setCustomYear(parseInt(e.target.value))}
                                    className="appearance-none bg-white border border-gold/20 rounded-xl px-3 py-2 pr-8 text-xs md:text-sm font-medium text-charcoal focus:outline-none focus:border-gold"
                                >
                                    {years.map((year) => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/40 pointer-events-none" />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                <StatCard
                    icon={DollarSign}
                    label="Total Revenue"
                    value={stats.totalRevenue}
                    prefix="₱"
                    color="bg-emerald-100 text-emerald-600"
                    trend={stats.revenueTrend}
                    subValue={`${stats.completedCount} completed`}
                />
                <StatCard
                    icon={Clock}
                    label="Pending Revenue"
                    value={stats.pendingRevenue}
                    prefix="₱"
                    color="bg-blue-100 text-blue-600"
                    subValue={`${stats.pendingCount} bookings`}
                />
                <StatCard
                    icon={TrendingUp}
                    label="Avg. Booking Value"
                    value={Math.round(stats.avgBookingValue)}
                    prefix="₱"
                    color="bg-purple-100 text-purple-600"
                />
                <StatCard
                    icon={TrendingDown}
                    label="Lost Revenue"
                    value={stats.lostRevenue}
                    prefix="₱"
                    color="bg-rose-100 text-rose-600"
                    subValue={`${stats.cancelledCount} cancelled`}
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Weekly Revenue Chart */}
                <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-gold/10 shadow-sm">
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                        <div>
                            <h3 className="font-semibold text-charcoal">Weekly Revenue</h3>
                            <p className="text-[10px] md:text-xs text-charcoal/50">Revenue per week</p>
                        </div>
                        <BarChart3 className="w-5 h-5 text-gold" />
                    </div>
                    {stats.weeklyRevenue.length > 0 ? (
                        <BarChart data={stats.weeklyRevenue} />
                    ) : (
                        <div className="h-40 flex items-center justify-center text-charcoal/40 text-sm">
                            No data available
                        </div>
                    )}
                </div>

                {/* Top Services */}
                <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-gold/10 shadow-sm">
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                        <div>
                            <h3 className="font-semibold text-charcoal">Top Services</h3>
                            <p className="text-[10px] md:text-xs text-charcoal/50">Revenue by service</p>
                        </div>
                        <Sparkles className="w-5 h-5 text-gold" />
                    </div>
                    {stats.topServices.length > 0 ? (
                        <div className="space-y-1">
                            {stats.topServices.map(([title, data], index) => (
                                <ProgressBar
                                    key={title}
                                    label={title}
                                    value={data.revenue}
                                    total={stats.totalRevenue}
                                    count={data.count}
                                    color={index === 0 ? 'bg-gold' : 'bg-gold/60'}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="h-40 flex items-center justify-center text-charcoal/40 text-sm">
                            No completed bookings yet
                        </div>
                    )}
                </div>
            </div>

            {/* Secondary Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Therapist Performance */}
                <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-gold/10 shadow-sm">
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                        <div>
                            <h3 className="font-semibold text-charcoal">Therapist Performance</h3>
                            <p className="text-[10px] md:text-xs text-charcoal/50">Revenue by specialist</p>
                        </div>
                        <Users className="w-5 h-5 text-gold" />
                    </div>
                    {stats.topTherapists.length > 0 ? (
                        <div className="space-y-3">
                            {stats.topTherapists.map(([id, data], index) => (
                                <div key={id} className="flex items-center gap-3 p-2 md:p-3 bg-charcoal/5 rounded-xl">
                                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-serif text-sm ${index === 0 ? 'bg-gold text-white' : 'bg-gold/10 text-gold'}`}>
                                        {data.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-charcoal truncate">{data.name}</p>
                                        <p className="text-[10px] md:text-xs text-charcoal/50">{data.count} sessions</p>
                                    </div>
                                    <span className="text-sm font-semibold text-gold">₱{data.revenue.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-40 flex items-center justify-center text-charcoal/40 text-sm">
                            No therapist data
                        </div>
                    )}
                </div>

                {/* Quick Insights */}
                <div className="bg-gradient-to-br from-charcoal to-charcoal/90 rounded-xl md:rounded-2xl p-4 md:p-6 text-white">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 md:p-3 bg-gold/20 rounded-xl">
                            <Activity className="w-5 h-5 md:w-6 md:h-6 text-gold" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Quick Insights</h3>
                            <p className="text-[10px] md:text-xs text-white/60">Performance summary</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-white/10 rounded-xl">
                            <span className="text-sm text-white/80">Conversion Rate</span>
                            <span className="text-lg font-serif text-gold">
                                {filteredBookings.length > 0
                                    ? ((stats.completedCount / filteredBookings.length) * 100).toFixed(1)
                                    : 0}%
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white/10 rounded-xl">
                            <span className="text-sm text-white/80">Cancellation Rate</span>
                            <span className="text-lg font-serif text-rose-400">
                                {filteredBookings.length > 0
                                    ? ((stats.cancelledCount / filteredBookings.length) * 100).toFixed(1)
                                    : 0}%
                            </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white/10 rounded-xl">
                            <span className="text-sm text-white/80">Total Bookings</span>
                            <span className="text-lg font-serif text-gold">{filteredBookings.length}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white/10 rounded-xl">
                            <span className="text-sm text-white/80">Avg. Daily Revenue</span>
                            <span className="text-lg font-serif text-emerald-400">
                                ₱{Math.round(stats.totalRevenue / (timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : timeRange === 'custom' ? new Date(customYear, customMonth + 1, 0).getDate() : 365)).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Summary */}
            <div className="bg-gradient-to-r from-gold/10 to-gold/5 rounded-xl md:rounded-2xl p-4 md:p-6 border border-gold/20">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 md:p-3 bg-gold/20 rounded-xl">
                            <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-gold" />
                        </div>
                        <div>
                            <p className="font-serif text-base md:text-lg text-charcoal">Revenue Summary</p>
                            <p className="text-[10px] md:text-xs text-charcoal/60">
                                Data from {getDateRangeLabel()}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-6 md:gap-8 text-center">
                        <div>
                            <p className="text-xl md:text-2xl font-serif text-emerald-600">₱{stats.totalRevenue.toLocaleString()}</p>
                            <p className="text-[10px] md:text-xs text-charcoal/60">Earned</p>
                        </div>
                        <div className="border-l border-gold/20 pl-6 md:pl-8">
                            <p className="text-xl md:text-2xl font-serif text-blue-600">₱{stats.pendingRevenue.toLocaleString()}</p>
                            <p className="text-[10px] md:text-xs text-charcoal/60">Pending</p>
                        </div>
                        <div className="border-l border-gold/20 pl-6 md:pl-8">
                            <p className="text-xl md:text-2xl font-serif text-gold">{stats.completedCount + stats.pendingCount}</p>
                            <p className="text-[10px] md:text-xs text-charcoal/60">Active Bookings</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RevenueDashboard;
