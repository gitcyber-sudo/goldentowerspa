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
    ChevronDown,
    BarChart3,
    PieChart,
    Activity
} from 'lucide-react';

import Logo from './Logo';

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

        // Peak booking hours
        const hourCounts: Record<number, number> = {};
        completed.forEach(b => {
            const hour = parseInt(b.booking_time.split(':')[0]);
            hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        });
        const peakHours = Object.entries(hourCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([hour, count]) => ({ hour: parseInt(hour), count }));

        // Client retention
        const userBookings: Record<string, number> = {};
        bookings.forEach(b => {
            const email = b.user_email;
            userBookings[email] = (userBookings[email] || 0) + 1;
        });
        const returningClients = Object.values(userBookings).filter(count => count > 1).length;
        const totalClients = Object.keys(userBookings).length;
        const retentionRate = totalClients > 0 ? (returningClients / totalClients) * 100 : 0;

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
            weeklyRevenue,
            peakHours,
            retentionRate,
            totalClients
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

    const LineChart = ({ data }: { data: { week: string; revenue: number; bookings: number }[] }) => {
        const height = 240;
        const width = 800;
        const padding = 40;

        // Use fixed increments up to 7000, or higher if data exceeds it
        const maxDataValue = Math.max(...data.map(d => d.revenue), 1);
        const yMax = Math.max(7000, Math.ceil(maxDataValue / 1000) * 1000);

        const yTicks = [1000, 2000, 3000, 4000, 5000, 6000, 7000];
        if (yMax > 7000) {
            // Add more ticks if we exceed 7k
            for (let t = 8000; t <= yMax; t += 1000) yTicks.push(t);
        }

        const getX = (i: number) => padding + (i * (width - padding * 2)) / (data.length - 1 || 1);
        const getY = (v: number) => height - padding - (v / yMax) * (height - padding * 2);

        const points = data.map((d, i) => `${getX(i)},${getY(d.revenue)}`).join(' ');

        const areaPoints = [
            `${getX(0)},${height - padding}`,
            ...data.map((d, i) => `${getX(i)},${getY(d.revenue)}`),
            `${getX(data.length - 1)},${height - padding}`
        ].join(' ');

        return (
            <div className="w-full overflow-x-auto no-scrollbar">
                <div className="min-w-[500px] relative">
                    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
                        {/* Grid Lines */}
                        {yTicks.map(tick => (
                            <g key={tick} className="opacity-10">
                                <line
                                    x1={padding}
                                    y1={getY(tick)}
                                    x2={width - padding}
                                    y2={getY(tick)}
                                    stroke="currentColor"
                                    strokeWidth="1"
                                    strokeDasharray="4 4"
                                />
                                <text
                                    x={padding - 10}
                                    y={getY(tick)}
                                    textAnchor="end"
                                    alignmentBaseline="middle"
                                    className="text-[10px] fill-charcoal font-bold"
                                >
                                    {tick >= 1000 ? `${tick / 1000}k` : tick}
                                </text>
                            </g>
                        ))}

                        {/* X-Axis labels */}
                        {data.map((item, i) => (
                            <text
                                key={i}
                                x={getX(i)}
                                y={height - padding + 20}
                                textAnchor="middle"
                                className="text-[10px] fill-charcoal/40 font-medium"
                            >
                                {item.week.split(' ')[1]}
                            </text>
                        ))}

                        {/* Gradient Area */}
                        <defs>
                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#997B3D" stopOpacity="0.3" />
                                <stop offset="95%" stopColor="#997B3D" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        <polyline
                            points={areaPoints}
                            fill="url(#chartGradient)"
                            className="transition-all duration-700"
                        />

                        {/* The Line */}
                        <polyline
                            points={points}
                            fill="none"
                            stroke="#997B3D"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="transition-all duration-700"
                        />

                        {/* Data Points */}
                        {data.map((item, i) => (
                            <g key={i} className="group cursor-pointer">
                                <circle
                                    cx={getX(i)}
                                    cy={getY(item.revenue)}
                                    r="4"
                                    className="fill-white stroke-gold stroke-2 transition-transform group-hover:scale-150"
                                />
                                <foreignObject
                                    x={getX(i) - 40}
                                    y={getY(item.revenue) - 45}
                                    width="80"
                                    height="40"
                                    className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <div className="bg-charcoal text-white text-[9px] px-2 py-1 rounded shadow-xl text-center">
                                        <div className="font-bold">₱{item.revenue.toLocaleString()}</div>
                                        <div className="opacity-60">{item.bookings} sessions</div>
                                    </div>
                                </foreignObject>
                            </g>
                        ))}
                    </svg>
                </div>
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
                            <h3 className="font-semibold text-charcoal">Revenue Trend</h3>
                            <p className="text-[10px] md:text-xs text-charcoal/50">Weekly earnings overview</p>
                        </div>
                        <Activity className="w-5 h-5 text-gold" />
                    </div>
                    {stats.weeklyRevenue.length > 0 ? (
                        <LineChart data={stats.weeklyRevenue} />
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
                        <Logo className="h-5 w-5" color="#997B3D" />
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

                {/* Advanced Insights */}
                <div className="bg-gradient-to-br from-charcoal to-charcoal/95 rounded-xl md:rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                    <div className="flex items-center gap-3 mb-8 relative z-10">
                        <div className="p-3 bg-gold/20 rounded-xl backdrop-blur-md">
                            <TrendingUp className="w-6 h-6 text-gold" />
                        </div>
                        <div>
                            <h3 className="font-serif text-xl md:text-2xl">Advanced Business Insights</h3>
                            <p className="text-xs text-white/40 uppercase tracking-widest mt-1">Efficiency and Growth Metrics</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                        {/* Peak Hours */}
                        <div className="bg-white/5 p-5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-2 mb-4">
                                <Clock size={16} className="text-gold" />
                                <span className="text-xs font-bold uppercase tracking-widest text-white/60">Peak Ritual Times</span>
                            </div>
                            <div className="space-y-3">
                                {stats.peakHours.length > 0 ? stats.peakHours.map((p, i) => (
                                    <div key={i} className="flex justify-between items-center text-sm">
                                        <span className="text-white/80">{formatTimeTo12h(`${p.hour}:00`)}</span>
                                        <span className="text-gold font-bold">{p.count} sessions</span>
                                    </div>
                                )) : (
                                    <p className="text-xs text-white/40 italic">Not enough data</p>
                                )}
                            </div>
                        </div>

                        {/* Client Retention */}
                        <div className="bg-white/5 p-5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-2 mb-4">
                                <Users size={16} className="text-gold" />
                                <span className="text-xs font-bold uppercase tracking-widest text-white/60">Client Loyalty</span>
                            </div>
                            <div className="text-center py-2">
                                <p className="text-3xl font-serif text-gold mb-1">{stats.retentionRate.toFixed(1)}%</p>
                                <p className="text-[10px] text-white/40 uppercase tracking-widest font-black">Retention Rate</p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between text-[10px] text-white/60">
                                <span>{stats.totalClients} Total Clients</span>
                            </div>
                        </div>

                        {/* Conversion & Value */}
                        <div className="bg-white/5 p-5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-2 mb-4">
                                <PieChart size={16} className="text-gold" />
                                <span className="text-xs font-bold uppercase tracking-widest text-white/60">Session Value</span>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-[10px] text-white/40 uppercase mb-1">
                                        <span>Ritual Conversion</span>
                                        <span>{((stats.completedCount / Math.max(filteredBookings.length, 1)) * 100).toFixed(0)}%</span>
                                    </div>
                                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gold"
                                            style={{ width: `${(stats.completedCount / Math.max(filteredBookings.length, 1)) * 100}%` }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-[10px] text-white/40 uppercase mb-1">
                                        <span>Cancellation Rate</span>
                                        <span>{((stats.cancelledCount / Math.max(filteredBookings.length, 1)) * 100).toFixed(0)}%</span>
                                    </div>
                                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-rose-500"
                                            style={{ width: `${(stats.cancelledCount / Math.max(filteredBookings.length, 1)) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
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
