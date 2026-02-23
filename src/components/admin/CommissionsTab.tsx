import React, { useMemo, useState } from 'react';
import { Booking, Therapist } from '../../types';
import { Wallet, Users, Calendar, ArrowRight, DollarSign, ChevronDown, Filter } from 'lucide-react';

interface CommissionsTabProps {
    bookings: Booking[];
    therapists: Therapist[];
}

type TimeRange = 'all' | 'today' | '7d' | '30d' | 'month' | 'date';

const CommissionsTab: React.FC<CommissionsTabProps> = ({ bookings, therapists }) => {
    const [timeRange, setTimeRange] = useState<TimeRange>('all');
    const [specificDate, setSpecificDate] = useState(new Date().toISOString().split('T')[0]);
    const [specificMonth, setSpecificMonth] = useState(new Date().getMonth());
    const [specificYear, setSpecificYear] = useState(new Date().getFullYear());

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const years = useMemo(() => {
        const currentYear = new Date().getFullYear();
        return [currentYear, currentYear - 1, currentYear - 2];
    }, []);

    const filteredBookings = useMemo(() => {
        let filtered = bookings.filter(b => b.status === 'completed');

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

        if (timeRange === 'today') {
            filtered = filtered.filter(b => {
                const bDate = new Date(b.booking_date).getTime();
                return bDate === today;
            });
        } else if (timeRange === '7d') {
            const sevenDaysAgo = today - (7 * 24 * 60 * 60 * 1000);
            filtered = filtered.filter(b => new Date(b.booking_date).getTime() >= sevenDaysAgo);
        } else if (timeRange === '30d') {
            const thirtyDaysAgo = today - (30 * 24 * 60 * 60 * 1000);
            filtered = filtered.filter(b => new Date(b.booking_date).getTime() >= thirtyDaysAgo);
        } else if (timeRange === 'date') {
            filtered = filtered.filter(b => b.booking_date === specificDate);
        } else if (timeRange === 'month') {
            filtered = filtered.filter(b => {
                const bDate = new Date(b.booking_date);
                return bDate.getMonth() === specificMonth && bDate.getFullYear() === specificYear;
            });
        }

        return filtered.sort((a, b) => new Date(b.completed_at || '').getTime() - new Date(a.completed_at || '').getTime());
    }, [bookings, timeRange, specificDate, specificMonth, specificYear]);

    const stats = useMemo(() => {
        const total = filteredBookings.reduce((sum, b) => sum + (b.commission_amount || 0), 0);
        const count = filteredBookings.length;
        const perTherapist = therapists.map(t => {
            const tComms = filteredBookings.filter(b => b.therapist_id === t.id)
                .reduce((sum, b) => sum + (b.commission_amount || 0), 0);
            return { name: t.name, amount: tComms };
        }).sort((a, b) => b.amount - a.amount);

        return { total, count, perTherapist };
    }, [filteredBookings, therapists]);

    return (
        <div className="p-6 space-y-8">
            {/* Filter Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gold/10 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gold/10 rounded-lg text-gold">
                        <Filter size={18} />
                    </div>
                    <div>
                        <h3 className="font-serif text-lg text-charcoal">Filter Commissions</h3>
                        <p className="text-[10px] text-charcoal/40 uppercase tracking-widest font-bold">Select Date Range</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                            className="appearance-none bg-cream/30 border border-gold/20 rounded-xl px-4 py-2 pr-10 text-xs font-bold text-charcoal focus:outline-none focus:border-gold transition-all"
                        >
                            <option value="all">All Time</option>
                            <option value="today">Today</option>
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                            <option value="month">Specific Month</option>
                            <option value="date">Specific Date</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/40 pointer-events-none" />
                    </div>

                    {timeRange === 'date' && (
                        <input
                            type="date"
                            value={specificDate}
                            onChange={(e) => setSpecificDate(e.target.value)}
                            className="bg-cream/30 border border-gold/20 rounded-xl px-4 py-2 text-xs font-bold text-charcoal focus:outline-none focus:border-gold transition-all"
                        />
                    )}

                    {timeRange === 'month' && (
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <select
                                    value={specificMonth}
                                    onChange={(e) => setSpecificMonth(parseInt(e.target.value))}
                                    className="appearance-none bg-cream/30 border border-gold/20 rounded-xl px-4 py-2 pr-10 text-xs font-bold text-charcoal focus:outline-none focus:border-gold transition-all"
                                >
                                    {months.map((m, i) => (
                                        <option key={m} value={i}>{m}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/40 pointer-events-none" />
                            </div>
                            <div className="relative">
                                <select
                                    value={specificYear}
                                    onChange={(e) => setSpecificYear(parseInt(e.target.value))}
                                    className="appearance-none bg-cream/30 border border-gold/20 rounded-xl px-4 py-2 pr-10 text-xs font-bold text-charcoal focus:outline-none focus:border-gold transition-all"
                                >
                                    {years.map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/40 pointer-events-none" />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Header / Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gold/10 shadow-sm">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-gold/10 rounded-xl text-gold">
                            <Wallet size={24} />
                        </div>
                        <p className="text-sm font-bold text-charcoal/50 uppercase tracking-widest">Total Commissions</p>
                    </div>
                    <p className="text-4xl font-serif text-charcoal">₱{stats.total.toLocaleString()}</p>
                    <p className="text-xs text-charcoal/40 mt-2">Paid out across {stats.count} sessions</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gold/10 shadow-sm md:col-span-2">
                    <p className="text-sm font-bold text-charcoal/50 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Users size={16} /> Top Earners
                    </p>
                    <div className="flex flex-wrap gap-4">
                        {stats.perTherapist.slice(0, 4).map((t, i) => (
                            <div key={i} className="flex-1 min-w-[150px] bg-cream/30 p-4 rounded-xl border border-gold/5">
                                <p className="text-xs font-bold text-charcoal/40 uppercase truncate">{t.name}</p>
                                <p className="text-xl font-serif text-gold">₱{t.amount.toLocaleString()}</p>
                            </div>
                        ))}
                        {stats.perTherapist.length === 0 && (
                            <p className="text-xs text-charcoal/40 italic py-2">No earnings data for this period.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white rounded-2xl border border-gold/10 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gold/5 flex justify-between items-center">
                    <h3 className="font-serif text-xl text-charcoal">Commission Details</h3>
                    <div className="flex items-center gap-2 text-gold font-bold text-xs uppercase tracking-widest bg-gold/10 px-3 py-1.5 rounded-full">
                        <DollarSign size={14} /> 30% Therapist Split
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-cream/50 text-[10px] uppercase tracking-[0.2em] text-charcoal/40">
                                <th className="px-6 py-4 font-bold text-gold">Date / Session</th>
                                <th className="px-6 py-4 font-bold text-gold">Specialist</th>
                                <th className="px-6 py-4 font-bold text-gold text-right">Service Price</th>
                                <th className="px-6 py-4 font-bold text-gold text-right">Commission (30%)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gold/5">
                            {filteredBookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-cream/20 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-cream/50 rounded-lg group-hover:bg-gold/10 transition-colors">
                                                <Calendar size={16} className="text-gold" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-charcoal">
                                                    {new Date(booking.booking_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </p>
                                                <p className="text-[10px] text-charcoal/40 uppercase tracking-wider">{booking.booking_time}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium text-charcoal">
                                                {therapists.find(t => t.id === booking.therapist_id)?.name || 'Unknown'}
                                            </p>
                                        </div>
                                        <p className="text-[10px] text-charcoal/40">{booking.services?.title}</p>
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium text-charcoal/60 text-sm">
                                        ₱{(booking.services?.price || 0).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-sm">
                                            ₱{(booking.commission_amount || 0).toLocaleString()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {filteredBookings.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-charcoal/40 italic">
                                        No completed sessions found for this period.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CommissionsTab;
