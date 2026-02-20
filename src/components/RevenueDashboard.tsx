import React, { useMemo, useState, useEffect } from 'react';
import gsap from 'gsap';
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
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

import Logo from './Logo';
import { getBusinessDate } from '../lib/utils';
import { exportBookingsToExcel } from '../lib/excelExport';

import type { Booking } from '../types';


interface RevenueDashboardProps {
    bookings: Booking[];
}

type TimeRange = 'today' | '7d' | '30d' | '90d' | 'all' | 'custom';

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
        const now = new Date();
        const bizDateStr = getBusinessDate(now);
        const bizDate = new Date(bizDateStr);

        const businessTodayStart = new Date(bizDate);
        businessTodayStart.setHours(16, 0, 0, 0);

        const businessTodayEnd = new Date(businessTodayStart);
        businessTodayEnd.setDate(businessTodayEnd.getDate() + 1);
        businessTodayEnd.setHours(15, 59, 59, 999);

        switch (timeRange) {
            case 'today':
                return { start: businessTodayStart, end: businessTodayEnd };
            case '7d':
                return { start: new Date(businessTodayStart.getTime() - 6 * 24 * 60 * 60 * 1000), end: businessTodayEnd };
            case '30d':
                return { start: new Date(businessTodayStart.getTime() - 29 * 24 * 60 * 60 * 1000), end: businessTodayEnd };
            case '90d':
                return { start: new Date(businessTodayStart.getTime() - 89 * 24 * 60 * 60 * 1000), end: businessTodayEnd };
            case 'custom':
                const start = new Date(customYear, customMonth, 1, 16, 0, 0);
                const end = new Date(customYear, customMonth + 1, 0, 15, 59, 59);
                return { start, end };
            default:
                return { start: null, end: null };
        }
    };

    // Helper to get the Business/Shift date (6 AM boundary)
    const formatTimeTo12h = (time24h: string) => {
        const [hours, minutes] = time24h.split(':');
        const h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayH = h % 12 || 12;
        return `${displayH}:${minutes} ${ampm}`;
    };

    const getShiftDateLabel = (dateStr: string) => {
        const date = new Date(dateStr);
        const bizDate = getBusinessDate(date);
        const [year, month, day] = bizDate.split('-');
        const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const filteredBookings = useMemo(() => {
        const { start, end } = getTimeFilter();
        if (!start || !end) return bookings;
        return bookings.filter(b => {
            const date = new Date(b.completed_at || b.created_at);
            return date >= start && date <= end;
        });
    }, [bookings, timeRange, customMonth, customYear]);

    // Animate empty states
    useEffect(() => {
        gsap.to('.animate-float', {
            y: -10,
            duration: 2,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1
        });
    }, []);

    const stats = useMemo(() => {
        const completed = filteredBookings.filter(b => b.status === 'completed');
        const pending = filteredBookings.filter(b => b.status === 'pending' || b.status === 'confirmed');
        const cancelled = filteredBookings.filter(b => b.status === 'cancelled');

        const totalRevenue = completed.reduce((sum, b) => {
            const servicePrice = b.services?.price || 0;
            const managementTip = b.tip_recipient === 'management' ? (b.tip_amount || 0) : 0;
            return sum + servicePrice + managementTip;
        }, 0);

        const pendingRevenue = pending.reduce((sum, b) => sum + (b.services?.price || 0), 0);
        const lostRevenue = cancelled.reduce((sum, b) => sum + (b.services?.price || 0), 0);

        // Calculate specific tip metrics
        const managementTips = completed.reduce((sum, b) => b.tip_recipient === 'management' ? sum + (b.tip_amount || 0) : sum, 0);
        const therapistTips = completed.reduce((sum, b) => b.tip_recipient === 'therapist' ? sum + (b.tip_amount || 0) : sum, 0);

        // In-Spa vs Home Service Breakdown
        const homeServiceBookings = completed.filter(b =>
            (b.services?.title || '').toLowerCase().includes('home')
        );
        const homeRevenue = homeServiceBookings.reduce((sum, b) => sum + (b.services?.price || 0), 0);
        const inSpaRevenue = totalRevenue - homeRevenue;
        const homePercentage = totalRevenue > 0 ? (homeRevenue / totalRevenue) * 100 : 0;

        // Calculate shift revenue (grouped by business day)
        const dailyRevenue: Record<string, number> = {};
        completed.forEach(b => {
            const dateLabel = getShiftDateLabel(b.completed_at || b.created_at);
            const servicePrice = b.services?.price || 0;
            const managementTip = b.tip_recipient === 'management' ? (b.tip_amount || 0) : 0;
            dailyRevenue[dateLabel] = (dailyRevenue[dateLabel] || 0) + servicePrice + managementTip;
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
            const date = new Date(b.completed_at || b.created_at);
            return date >= previousPeriodStart && date < previousPeriodEnd && b.status === 'completed';
        });

        const previousRevenue = previousPeriodBookings.reduce((sum, b) => {
            const servicePrice = b.services?.price || 0;
            const managementTip = b.tip_recipient === 'management' ? (b.tip_amount || 0) : 0;
            return sum + servicePrice + managementTip;
        }, 0);
        const revenueTrend = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;

        // Weekly breakdown
        const weeklyRevenue: { week: string; revenue: number; bookings: number }[] = [];
        const weeks = timeRange === '7d' ? 1 : timeRange === '30d' ? 4 : timeRange === '90d' ? 12 : timeRange === 'custom' ? 4 : 52;

        for (let i = weeks - 1; i >= 0; i--) {
            const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
            const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);

            const weekBookings = completed.filter(b => {
                const date = new Date(b.completed_at || b.created_at);
                return date >= weekStart && date < weekEnd;
            });

            const weekRev = weekBookings.reduce((sum, b) => {
                const servicePrice = b.services?.price || 0;
                const managementTip = b.tip_recipient === 'management' ? (b.tip_amount || 0) : 0;
                return sum + servicePrice + managementTip;
            }, 0);
            weeklyRevenue.push({
                week: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                revenue: weekRev,
                bookings: weekBookings.length
            });
        }

        // Peak booking hours (Based on when they occurred/finished)
        const hourCounts: Record<number, number> = {};
        completed.forEach(b => {
            const date = new Date(b.completed_at || b.created_at);
            const hour = date.getHours();
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

        // Enhanced Metrics: Sessions per Client
        const avgSessionsPerClient = totalClients > 0 ? (bookings.length / totalClients).toFixed(1) : '0';

        // Enhanced Metrics: Wait Time (Booking Creation vs Booking Date/Time)
        // This is simplified as "Lead Time"
        const leadTimes = filteredBookings.map(b => {
            const createdDate = new Date(b.created_at);
            const bookingDate = new Date(`${b.booking_date}T${b.booking_time}`);
            return (bookingDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60); // In hours
        }).filter(lt => lt > 0);
        const avgLeadTime = leadTimes.length > 0 ? (leadTimes.reduce((s, v) => s + v, 0) / leadTimes.length).toFixed(1) : '0';

        return {
            totalRevenue,
            pendingRevenue,
            lostRevenue,
            homeRevenue,
            inSpaRevenue,
            homePercentage,
            homeCount: homeServiceBookings.length,
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
            totalClients,
            avgSessionsPerClient,
            avgLeadTime,
            managementTips,
            therapistTips
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
        // Format x-axis label (e.g. "Mar 10" -> "10")
        const formattedData = data.map(d => ({
            ...d,
            day: d.week.split(' ')[1]
        }));

        const CustomTooltip = ({ active, payload, label }: any) => {
            if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                    <div className="bg-charcoal text-white text-[10px] md:text-xs px-3 py-2 md:px-4 md:py-3 rounded-xl shadow-xl border border-gold/20 z-50">
                        <p className="font-bold text-gold mb-1">{data.week}</p>
                        <p className="font-serif text-sm md:text-base mb-0.5">₱{data.revenue.toLocaleString()}</p>
                        <p className="text-white/60 text-[9px] md:text-[10px] uppercase font-bold tracking-widest">{data.bookings} Session{data.bookings > 1 ? 's' : ''}</p>
                    </div>
                );
            }
            return null;
        };

        return (
            <div className="w-full h-[240px] md:h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={formattedData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#997B3D" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#997B3D" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#1A1A1A" strokeOpacity={0.1} />
                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#1A1A1A', opacity: 0.4, fontSize: 10, fontWeight: 500 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#1A1A1A', fontWeight: 700, fontSize: 10 }}
                            tickFormatter={(value) => value >= 1000 ? `${value / 1000}k` : value}
                            width={40}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#997B3D', strokeWidth: 1, strokeDasharray: '4 4' }} />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#997B3D"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                            activeDot={{ r: 6, fill: '#fff', stroke: '#997B3D', strokeWidth: 2 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
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
                            <option value="today">Today</option>
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

                    {/* Export Button */}
                    <button
                        onClick={() => exportBookingsToExcel(filteredBookings, `Revenue-Report-${timeRange}`)}
                        className="flex items-center gap-2 bg-charcoal text-white px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-gold transition-colors ml-2"
                        title="Export current view to Excel"
                    >
                        <DollarSign size={16} />
                        Export
                    </button>
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

            {/* Tip Analytics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                <StatCard
                    icon={DollarSign}
                    label="Management Tips"
                    value={stats.managementTips}
                    prefix="₱"
                    color="bg-emerald-50 text-emerald-700"
                    subValue="Included in Total Revenue"
                />
                <StatCard
                    icon={Users}
                    label="Therapist Tips"
                    value={stats.therapistTips}
                    prefix="₱"
                    color="bg-charcoal/5 text-charcoal"
                    subValue="Excluded from Spa Gross"
                />
            </div>

            {/* Charts Row */}
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
                        <div className="h-40 flex flex-col items-center justify-center text-charcoal/40 text-sm">
                            <Users size={32} className="mb-2 opacity-30 animate-float" />
                            No completed bookings yet
                        </div>
                    )}
                </div>
            </div>

            {/* Secondary Analytics */}
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
                        <div className="h-40 flex flex-col items-center justify-center text-charcoal/40 text-sm">
                            <Activity size={32} className="mb-2 opacity-30 animate-float" />
                            No data available
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

                        {/* Client Loyalty */}
                        <div className="bg-white/5 p-5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-2 mb-4">
                                <Users size={16} className="text-gold" />
                                <span className="text-xs font-bold uppercase tracking-widest text-white/60">Client Loyalty</span>
                            </div>
                            <div className="text-center py-2 flex items-center justify-around">
                                <div>
                                    <p className="text-2xl font-serif text-gold mb-1">{stats.retentionRate.toFixed(1)}%</p>
                                    <p className="text-[8px] text-white/40 uppercase tracking-widest font-black">Retention</p>
                                </div>
                                <div className="w-px h-8 bg-white/10" />
                                <div>
                                    <p className="text-2xl font-serif text-gold mb-1">{stats.avgSessionsPerClient}</p>
                                    <p className="text-[8px] text-white/40 uppercase tracking-widest font-black">Sess/Client</p>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between text-[10px] text-white/60">
                                <span>{stats.totalClients} Total Clients</span>
                            </div>
                        </div>

                        {/* Booking Lead Time */}
                        <div className="bg-white/5 p-5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-2 mb-4">
                                <Activity size={16} className="text-gold" />
                                <span className="text-xs font-bold uppercase tracking-widest text-white/60">Lead Time Analysis</span>
                            </div>
                            <div className="text-center py-2">
                                <p className="text-3xl font-serif text-gold mb-1">{stats.avgLeadTime}h</p>
                                <p className="text-[10px] text-white/40 uppercase tracking-widest font-black">Avg. Booking Lead</p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between text-[10px] text-white/60">
                                <span>Prep time efficiency</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* In-Spa vs Home Summary Overlay */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-gold/10 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] uppercase tracking-widest font-black text-charcoal/30 mb-1">In-Spa Revenue</p>
                        <p className="text-2xl font-serif text-charcoal">₱{stats.inSpaRevenue.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-gold">{stats.completedCount - stats.homeCount} Sessions</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gold/10 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] uppercase tracking-widest font-black text-charcoal/30 mb-1">Home Service Revenue</p>
                        <p className="text-2xl font-serif text-gold">₱{stats.homeRevenue.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-charcoal/40">{stats.homeCount} Mobilizations</p>
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
