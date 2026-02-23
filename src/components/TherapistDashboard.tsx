import React, { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import gsap from 'gsap';
import { formatTimeTo12h } from '../lib/utils';
import {
    Calendar,
    Clock,
    LogOut,
    User,
    CheckCircle2,
    Clock3,
    ArrowLeft,
    Mail,
    Star,
    MessageSquare,
    UserCircle,
    MapPin,
    Phone,
    Award,
    TrendingUp,
    BarChart3,
    ChevronRight,
    Save,
    Wallet
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';
import LoadingScreen from './LoadingScreen';
import Logo from './Logo';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

interface Review {
    id: string;
    rating: number;
    comment: string;
    created_at: string;
    profiles: { full_name: string };
    edit_count?: number;
    previous_rating?: number;
    previous_comment?: string;
}

interface Booking {
    id: string;
    user_email: string;
    guest_name?: string;
    guest_phone?: string;
    booking_date: string;
    booking_time: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    services: { title: string; duration: number; price?: number };
    commission_amount?: number;
    tip_amount?: number;
    tip_recipient?: string;
    created_at: string;
    profiles?: { full_name: string; email: string; phone?: string };
}

type TabId = 'schedule' | 'history' | 'reviews' | 'profile';

const TherapistDashboard: React.FC = () => {
    useSEO({
        title: 'Specialist Workstation',
        description: 'Professional dashboard for Golden Tower Spa therapists to manage schedules and client care.'
    });
    const { user, profile, signOut } = useAuth();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [therapistInfo, setTherapistInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [activeTab, setActiveTab] = useState<TabId>('schedule');

    // Commission Filter State
    const [timeRange, setTimeRange] = useState<'all' | 'today' | '7d' | '30d' | 'month' | 'date'>('all');
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

    // Calendar blockouts state
    const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
    const [savingDates, setSavingDates] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    // ─── Animations ───
    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".dashboard-stat", { y: 20, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" });
            const cards = document.querySelectorAll(".booking-card");
            if (cards.length > 0) {
                gsap.fromTo(".booking-card",
                    { y: 20, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, delay: 0.2, ease: "power2.out" }
                );
            }
        });
        return () => ctx.revert();
    }, [loading, activeTab, bookings]);

    // ─── Data ───
    const fetchTherapistData = useCallback(async () => {
        setLoading(true);
        try {
            const { data: therapist, error: therapistError } = await supabase
                .from('therapists').select('*').eq('user_id', user?.id).single();
            if (therapistError) { console.error('Not linked to therapist account:', therapistError); return; }
            setTherapistInfo(therapist);

            // Parse blockouts
            if (therapist.unavailable_blockouts) {
                try {
                    const parsedDates = Array.isArray(therapist.unavailable_blockouts)
                        ? therapist.unavailable_blockouts.map((d: string) => new Date(d))
                        : JSON.parse(therapist.unavailable_blockouts).map((d: string) => new Date(d));
                    setUnavailableDates(parsedDates);
                } catch (e) {
                    console.error('Failed to parse blockout dates', e);
                }
            }

            const { data, error } = await supabase.from('bookings')
                .select(`*, services(title, duration), profiles(full_name, email)`)
                .eq('therapist_id', therapist.id)
                .order('booking_date', { ascending: true });
            if (error) throw error;
            if (data) setBookings(data as any);

            const { data: reviewData } = await supabase.from('therapist_feedback')
                .select(`*, profiles(full_name)`)
                .eq('therapist_id', therapist.id)
                .order('created_at', { ascending: false });
            if (reviewData) setReviews(reviewData as any);
        } catch (err) { console.error('Error fetching therapist bookings:', err); }
        finally { setLoading(false); }
    }, [user]);

    useEffect(() => {
        let isSubscribed = true;

        const loadData = async () => {
            if (!user) return;
            await fetchTherapistData();
        };

        loadData();

        // Subscribe to real-time status updates ONLY
        const statusSubscription = supabase
            .channel('therapist_status_changes')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'bookings',
                    filter: `therapist_id = eq.${user?.id} `
                },
                (payload) => {
                    // Only update if it's a status change (like confirmation or cancellation)
                    if (payload.new && payload.old && payload.new.status !== payload.old.status) {
                        if (isSubscribed) {
                            fetchTherapistData();
                        }
                    }
                }
            )
            .subscribe();

        return () => {
            isSubscribed = false;
            supabase.removeChannel(statusSubscription);
        };
    }, [user, fetchTherapistData]);

    // Animate tab transition
    useEffect(() => {
        if (contentRef.current) {
            gsap.fromTo(contentRef.current,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
            );
        }
    }, [activeTab]);

    const handleSaveBlockouts = async () => {
        if (!therapistInfo) return;
        setSavingDates(true);
        try {
            // Store as purely ISO string arrays
            const datesToSave = unavailableDates.map(d => d.toISOString());
            const { error } = await supabase
                .from('therapists')
                .update({ unavailable_blockouts: datesToSave })
                .eq('id', therapistInfo.id);

            if (error) throw error;
            // Show brief success alert
            alert("Availability updated successfully");
        } catch (error) {
            console.error('Error saving blockout dates:', error);
            alert("Failed to save availability");
        } finally {
            setSavingDates(false);
        }
    };

    const handleSignOut = async () => { await signOut(); navigate('/'); };

    // ─── Computed ───
    const upcomingBookings = useMemo(() => bookings.filter(
        (b: any) => (b.status === 'pending' || b.status === 'confirmed') &&
            new Date(b.booking_date).setHours(0, 0, 0, 0) >= new Date().setHours(0, 0, 0, 0)
    ), [bookings]);

    const completedBookings = useMemo(() => bookings.filter((b: any) => b.status === 'completed'), [bookings]);

    const todayBookings = useMemo(() => upcomingBookings.filter(
        (b: any) => new Date(b.booking_date).toDateString() === new Date().toDateString()
    ), [upcomingBookings]);

    const avgRating = useMemo(() => {
        if (reviews.length === 0) return 0;
        return (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1);
    }, [reviews]);

    const filteredBookingsByDate = useMemo(() => {
        let filtered = completedBookings;
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

        if (timeRange === 'today') {
            filtered = filtered.filter(b => new Date(b.booking_date).getTime() === today);
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
        return filtered;
    }, [completedBookings, timeRange, specificDate, specificMonth, specificYear]);

    const totalTips = useMemo(() => {
        return filteredBookingsByDate.reduce((sum: number, b: any) => {
            return b.tip_recipient === 'therapist' ? sum + (b.tip_amount || 0) : sum;
        }, 0);
    }, [filteredBookingsByDate]);

    const totalCommissions = useMemo(() => {
        return filteredBookingsByDate.reduce((sum: number, b: any) => sum + (b.commission_amount || 0), 0);
    }, [filteredBookingsByDate]);

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'pending': return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-l-amber-400', dot: 'bg-amber-400', icon: <Clock3 size={12} /> };
            case 'confirmed': return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-l-emerald-500', dot: 'bg-emerald-500', icon: <CheckCircle2 size={12} /> };
            case 'completed': return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-l-blue-500', dot: 'bg-blue-500', icon: <CheckCircle2 size={12} /> };
            case 'cancelled': return { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-l-rose-400', dot: 'bg-rose-400', icon: null };
            default: return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-l-gray-300', dot: 'bg-gray-400', icon: null };
        }
    };

    // ─── Tabs config ───
    const tabs: { id: TabId; label: string; icon: React.ReactNode; mobileLabel: string }[] = [
        { id: 'schedule', label: 'Schedule', icon: <Calendar size={18} />, mobileLabel: 'Schedule' },
        { id: 'history', label: 'Past Sessions', icon: <CheckCircle2 size={18} />, mobileLabel: 'History' },
        { id: 'reviews', label: 'Client Reviews', icon: <MessageSquare size={18} />, mobileLabel: 'Reviews' },
        { id: 'profile', label: 'My Profile', icon: <UserCircle size={18} />, mobileLabel: 'Profile' }
    ];

    // ─── Booking Card ───
    const renderBookingCard = (booking: Booking) => {
        const status = getStatusConfig(booking.status);
        const clientName = booking.profiles?.full_name || booking.guest_name || 'Guest';
        const clientInitial = clientName.charAt(0).toUpperCase();
        return (
            <div
                key={booking.id}
                className="booking-card bg-white rounded-3xl border border-gold/10 overflow-hidden hover:shadow-2xl hover:border-gold/30 transition-all duration-300 group relative"
            >
                {/* Status Border Accent */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${status.dot}`} aria-hidden="true" />

                <div className="p-6 md:p-8">
                    {/* Top row: client + status */}
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center ring-4 ring-white shadow-inner font-serif text-gold font-bold text-xl transition-transform group-hover:scale-110 duration-500">
                                {clientInitial}
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-serif text-xl text-charcoal group-hover:text-gold transition-colors truncate">
                                    {clientName}
                                </h3>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                    {booking.profiles?.email && (
                                        <p className="text-[11px] text-charcoal/40 flex items-center gap-1.5">
                                            <Mail size={12} className="text-gold" /> {booking.profiles.email}
                                        </p>
                                    )}
                                    {(booking.guest_phone || booking.profiles?.phone) && (
                                        <p className="text-[11px] text-charcoal/40 flex items-center gap-1.5">
                                            <Phone size={12} className="text-gold" /> {booking.guest_phone || booking.profiles?.phone}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <span className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.15em] flex items-center gap-2 shadow-sm ${status.bg} ${status.text} border border-gold/5`}>
                                {status.icon} {booking.status}
                            </span>
                        </div>
                    </div>

                    {/* Service details */}
                    <div className="bg-cream/20 rounded-2xl p-5 mb-4 border border-gold/5 group-hover:bg-cream/40 transition-all duration-300 hover:border-gold/20">
                        <div className="flex items-center gap-2 mb-3">
                            <Star size={14} className="text-gold fill-gold" />
                            <p className="font-serif text-lg md:text-xl text-charcoal">{booking.services?.title || 'Service'}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                            <div className="flex items-center gap-2 text-charcoal/70">
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-gold/5">
                                    <Calendar size={14} className="text-gold" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest">
                                    {new Date(booking.booking_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-charcoal/70">
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-gold/5">
                                    <Clock size={14} className="text-gold" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest">
                                    {formatTimeTo12h(booking.booking_time)}
                                </span>
                            </div>
                            {booking.services?.duration && (
                                <div className="ml-auto bg-gold/10 text-gold px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-gold/10">
                                    {booking.services.duration} min
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-between items-center px-1">
                        <p className="text-[10px] text-charcoal/30 font-bold uppercase tracking-widest">Ref: {booking.id.substring(0, 8)}</p>
                        <div className="flex items-center gap-2">
                            {booking.tip_amount > 0 && booking.tip_recipient === 'therapist' && (
                                <div className="flex items-center gap-1.5 bg-gold/5 text-gold px-3 py-1 rounded-full border border-gold/10">
                                    <Star size={10} className="fill-gold" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Tip ₱{booking.tip_amount}</span>
                                </div>
                            )}
                            {booking.commission_amount && (
                                <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100/50">
                                    <Wallet size={10} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Earned ₱{booking.commission_amount}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // ─── Time Buckets ───
    const timeBuckets = [
        { title: "Morning Rituals", icon: "🌅", range: [0, 12] },
        { title: "Afternoon Glow", icon: "🌤️", range: [12, 17] },
        { title: "Evening Serenity", icon: "🌙", range: [17, 24] }
    ];

    // ─── Guards ───
    if (!user || profile?.role !== 'therapist') return <LoadingScreen message="Access Denied" />;
    if (!therapistInfo) return <LoadingScreen message="Linking Profile..." />;

    return (
        <div className="min-h-screen bg-[#F9F7F2] flex flex-col">
            {/* ─── Desktop Header ─── */}
            <header className="bg-white/80 backdrop-blur-xl border-b border-gold/10 px-4 md:px-6 py-4 md:py-5 sticky top-0 z-40">
                <div className="flex justify-between items-center bg-white/80 backdrop-blur-md rounded-3xl p-5 border border-gold/20 shadow-xl mb-6">
                    <div className="flex items-center gap-5">
                        <div className="relative group">
                            {therapistInfo.image_url ? (
                                <img src={therapistInfo.image_url} alt="" className="w-14 h-14 md:w-16 md:h-16 rounded-3xl object-cover shadow-lg border-2 border-gold/10 group-hover:border-gold/30 transition-all duration-500" />
                            ) : (
                                <div className="w-14 h-14 md:w-16 md:h-16 rounded-3xl bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center shadow-lg border-2 border-gold/10">
                                    <User className="text-white" size={24} />
                                </div>
                            )}
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h1 className="font-serif text-xl md:text-2xl text-charcoal">{therapistInfo.name}</h1>
                                {reviews.length > 0 && (
                                    <span className="flex items-center gap-1 text-[10px] font-bold text-gold bg-gold/5 px-2 py-0.5 rounded-full border border-gold/10">
                                        <Star size={8} fill="currentColor" /> {avgRating}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-[0.2em] bg-emerald-50 px-2 py-0.5 rounded-md">{therapistInfo.specialty || 'Master Specialist'}</span>
                                <span className="w-1 h-1 rounded-full bg-gold/30" />
                                <span className="text-[10px] text-charcoal/40 font-bold uppercase tracking-widest">Therapist Portal</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={handleSignOut} className="p-3 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl transition-all shadow-sm border border-rose-100 group" title="Sign Out">
                        <LogOut size={20} className="group-hover:scale-110 transition-transform" />
                    </button>
                </div>
            </header>

            {/* ─── Main Content ─── */}
            <main className="max-w-6xl mx-auto w-full px-4 md:px-6 py-4 md:py-6 flex-1 pb-24 md:pb-10" id="main-content">

                {/* ─── Compact Filter Bar ─── */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-cream/30 p-4 rounded-3xl border border-gold/10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
                            <Wallet size={14} className="text-gold" />
                        </div>
                        <h3 className="text-[10px] uppercase font-bold text-charcoal/60 tracking-[0.2em]">Financial Insights</h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center bg-white rounded-2xl border border-gold/5 p-1 shadow-sm">
                            {(['all', 'today', '7d', '30d', 'month', 'date'] as const).map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${timeRange === range ? 'bg-gold text-white shadow-md' : 'text-charcoal/40 hover:text-charcoal'}`}
                                >
                                    {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range}
                                </button>
                            ))}
                        </div>

                        {timeRange === 'date' && (
                            <input
                                type="date"
                                value={specificDate}
                                onChange={(e) => setSpecificDate(e.target.value)}
                                className="bg-white border border-gold/10 rounded-2xl px-4 py-2 text-[10px] font-bold text-charcoal shadow-sm focus:ring-2 focus:ring-gold/20 focus:outline-none transition-all"
                            />
                        )}

                        {timeRange === 'month' && (
                            <div className="flex items-center gap-1">
                                <select
                                    value={specificMonth}
                                    onChange={(e) => setSpecificMonth(parseInt(e.target.value))}
                                    className="bg-cream/50 border border-gold/10 rounded-lg px-3 py-1.5 text-[10px] font-bold text-charcoal focus:outline-none"
                                >
                                    {months.map((m, i) => <option key={m} value={i}>{m.substring(0, 3)}</option>)}
                                </select>
                                <select
                                    value={specificYear}
                                    onChange={(e) => setSpecificYear(parseInt(e.target.value))}
                                    className="bg-cream/50 border border-gold/10 rounded-lg px-3 py-1.5 text-[10px] font-bold text-charcoal focus:outline-none"
                                >
                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                {/* ─── Premium Stats Row ─── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {/* Primary Earnings Card */}
                    <div className="md:col-span-2 lg:col-span-1 bg-gradient-to-br from-charcoal to-charcoal-light rounded-3xl p-6 border border-gold/30 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-gold/20 transition-all duration-700" />
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-gold/10 rounded-2xl border border-gold/20">
                                    <Wallet className="text-gold" size={24} />
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] uppercase font-bold text-gold tracking-[0.2em] mb-1">Current Earnings</p>
                                    <div className="flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Live Updates</span>
                                    </div>
                                </div>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-serif text-white mb-2 tracking-tight">₱{totalCommissions.toLocaleString()}</h2>
                            <p className="text-white/50 text-[11px] font-medium leading-relaxed">
                                Commission earned from <span className="text-gold font-bold">{filteredBookingsByDate.length} sessions</span> in this period.
                            </p>
                        </div>
                    </div>

                    {/* Tips Card */}
                    <div className="bg-gradient-to-br from-gold/20 to-gold/5 rounded-3xl p-6 border border-gold/10 shadow-xl relative overflow-hidden group hover:border-gold/30 transition-all">
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-white/50 rounded-2xl border border-gold/10">
                                    <Star className="text-gold fill-gold" size={24} />
                                </div>
                                <span className="bg-gold text-white text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-widest">Bonus Pay</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-serif text-charcoal mb-2">₱{totalTips.toLocaleString()}</h2>
                            <p className="text-charcoal/40 text-[11px] font-bold uppercase tracking-widest">Gratitude Received</p>
                        </div>
                    </div>

                    {/* Summary Stats Card */}
                    <div className="bg-white rounded-3xl p-6 border border-gold/10 shadow-xl">
                        <div className="grid grid-cols-3 gap-2 h-full">
                            <div className="flex flex-col items-center justify-center p-3 bg-cream/30 rounded-2xl border border-gold/5">
                                <span className="text-lg font-serif text-charcoal">{todayBookings.length}</span>
                                <span className="text-[8px] uppercase font-bold text-charcoal/40 tracking-widest">Today</span>
                            </div>
                            <div className="flex flex-col items-center justify-center p-3 bg-gold/5 rounded-2xl border border-gold/5">
                                <span className="text-lg font-serif text-gold">{upcomingBookings.length}</span>
                                <span className="text-[8px] uppercase font-bold text-gold/60 tracking-widest">Pending</span>
                            </div>
                            <div className="flex flex-col items-center justify-center p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                                <span className="text-lg font-serif text-emerald-600">{completedBookings.length}</span>
                                <span className="text-[8px] uppercase font-bold text-emerald-600/60 tracking-widest">Done</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── Desktop Tab Navigation ─── */}
                <div className="hidden md:flex gap-1 mb-8 bg-white rounded-xl p-1.5 border border-gold/10 shadow-sm" role="tablist" aria-label="Dashboard sections">
                    {tabs.map(tab => (
                        <button key={tab.id} role="tab" aria-selected={activeTab === tab.id} aria-controls={`panel-${tab.id}`}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all flex-1 justify-center ${activeTab === tab.id
                                ? 'bg-gold text-white shadow-md'
                                : 'text-charcoal/40 hover:text-charcoal/70 hover:bg-gold/5'
                                }`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* ─── Content Panels ─── */}
                {loading ? (
                    <div className="text-center py-16">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gold/20 border-t-gold" role="status" aria-label="Loading" />
                        <p className="text-charcoal/40 mt-4 italic">Loading your schedule...</p>
                    </div>
                ) : (
                    <div ref={contentRef}>
                        {/* ─── Schedule Panel ─── */}
                        <div id="panel-schedule" role="tabpanel" className={activeTab !== 'schedule' ? 'hidden' : ''}>
                            {/* Today's Timeline */}
                            {todayBookings.length > 0 && (
                                <div className="mb-8">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center"><Calendar className="text-gold" size={16} /></div>
                                        <h2 className="font-serif text-lg text-charcoal">Today's Schedule</h2>
                                        <span className="ml-auto bg-gold text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">{todayBookings.length} session{todayBookings.length > 1 ? 's' : ''}</span>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute left-5 top-0 bottom-0 w-px bg-gold/15" aria-hidden="true" />
                                        <div className="space-y-3">
                                            {todayBookings.sort((a: any, b: any) => a.booking_time.localeCompare(b.booking_time)).map((booking: any) => {
                                                const status = getStatusConfig(booking.status);
                                                return (
                                                    <div key={booking.id} className="relative pl-12">
                                                        <div className={`absolute left-3.5 top-6 w-3 h-3 rounded-full border-2 border-white shadow-sm z-10 ${status.dot}`} aria-hidden="true" />
                                                        <div className="absolute left-0 top-5 text-[10px] font-mono text-gold font-bold">
                                                            {formatTimeTo12h(booking.booking_time).replace(/ /g, '')}
                                                        </div>
                                                        {renderBookingCard(booking)}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ─── Upcoming Feed (One by One) ─── */}
                            <div className="mb-12">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                                        <Clock3 className="text-gold" size={20} />
                                    </div>
                                    <div>
                                        <h2 className="font-serif text-xl text-charcoal">Upcoming Schedule</h2>
                                        <p className="text-xs text-charcoal/40">Chronological list of your future sessions.</p>
                                    </div>
                                </div>

                                {upcomingBookings.filter(b => new Date(b.booking_date).toDateString() !== new Date().toDateString()).length === 0 ? (
                                    <div className="text-center py-16 bg-white rounded-3xl border border-gold/10 shadow-sm">
                                        <Logo className="h-10 w-10 mx-auto mb-4 opacity-20" color="#997B3D" />
                                        <p className="text-charcoal/40 italic font-serif">Your future schedule is clear.</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4 max-w-3xl">
                                        {upcomingBookings
                                            .filter(b => new Date(b.booking_date).toDateString() !== new Date().toDateString())
                                            .sort((a, b) => {
                                                const dateCompare = a.booking_date.localeCompare(b.booking_date);
                                                if (dateCompare !== 0) return dateCompare;
                                                return a.booking_time.localeCompare(b.booking_time);
                                            })
                                            .map(renderBookingCard)}
                                    </div>
                                )}
                            </div>

                            {/* ─── Schedule Management (Calendar) ─── */}
                            <div className="mt-12 bg-white rounded-2xl border border-gold/10 p-6 md:p-8 shadow-sm">
                                <div className="flex flex-col md:flex-row gap-8 items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                                                <Calendar className="text-gold" size={20} />
                                            </div>
                                            <div>
                                                <h2 className="font-serif text-xl text-charcoal">Manage Availability</h2>
                                                <p className="text-xs text-charcoal/50">Select days you will be completely unavailable for bookings.</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-charcoal/70 mb-6 leading-relaxed">
                                            Click on any date to toggle your availability. Dates selected here will be blocked off on the main booking calendar, preventing clients from selecting you on your days off.
                                        </p>

                                        <button
                                            onClick={handleSaveBlockouts}
                                            disabled={savingDates}
                                            className="w-full md:w-auto flex items-center justify-center gap-2 bg-charcoal text-white px-6 py-3 rounded-xl hover:bg-charcoal/90 transition-colors disabled:opacity-50 text-sm font-bold tracking-widest uppercase"
                                        >
                                            {savingDates ? (
                                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <Save size={16} />
                                            )}
                                            {savingDates ? 'Saving...' : 'Save Availability'}
                                        </button>
                                    </div>

                                    <div className="bg-[#F9F7F2] p-4 rounded-xl border border-gold/10 mx-auto md:mx-0">
                                        <style dangerouslySetInnerHTML={{
                                            __html: `
                                            .rdp { 
                                                --rdp-accent-color: #E11D48;
                                                --rdp-accent-color-dark: #BE123C;
                                                margin: 0;
                                            }
                                            
                                            /* Mobile responsiveness fix */
                                            @media (max-width: 400px) {
                                                .rdp {
                                                    --rdp-cell-size: 38px;
                                                }
                                                .rdp-month {
                                                    width: 100%;
                                                }
                                                .rdp-table {
                                                    max-width: 100%;
                                                }
                                            }

                                            .rdp-selected .rdp-day_button {
                                                background-color: #E11D48 !important;
                                                color: white !important;
                                                border-radius: 8px !important;
                                            }

                                            .rdp-selected {
                                                background-color: #E11D48 !important;
                                                color: white !important;
                                                border-radius: 8px !important;
                                            }
                                            
                                            /* Today's marker (using Gold to distinguish from Red-blocked days) */
                                            .rdp-today .rdp-day_button {
                                                border: 2px solid #997B3D !important;
                                                border-radius: 8px !important;
                                                font-weight: bold !important;
                                            }

                                            /* Hover effect in v9 */
                                            .rdp-day_button:hover:not([disabled]) {
                                                background-color: rgba(225, 29, 72, 0.1) !important;
                                                border-radius: 8px !important;
                                            }
`}} />
                                        <DayPicker
                                            mode="multiple"
                                            selected={unavailableDates}
                                            onSelect={(dates) => setUnavailableDates(dates as Date[])}
                                            disabled={{ before: new Date() }} // Cannot block past dates
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ─── History Panel ─── */}
                        <div id="panel-history" role="tabpanel" className={activeTab !== 'history' ? 'hidden' : ''}>
                            {completedBookings.length === 0 ? (
                                <div className="text-center py-16 bg-white rounded-2xl border border-gold/10">
                                    <CheckCircle2 className="text-charcoal/20 mx-auto mb-4" size={48} />
                                    <h3 className="font-serif text-xl text-charcoal mb-2">No Completed Sessions</h3>
                                    <p className="text-charcoal/40 italic">Sessions you finish will be listed here.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4 max-w-2xl mx-auto">
                                    {completedBookings.sort((a, b) => new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime()).map(renderBookingCard)}
                                </div>
                            )}
                        </div>

                        {/* ─── Reviews Panel ─── */}
                        <div id="panel-reviews" role="tabpanel" className={activeTab !== 'reviews' ? 'hidden' : ''}>
                            {reviews.length > 0 && (
                                <div className="bg-gradient-to-br from-charcoal to-charcoal-light rounded-2xl p-6 md:p-8 mb-8 text-center relative overflow-hidden border border-gold/20 shadow-xl">
                                    <div className="absolute top-0 right-0 w-48 h-48 bg-gold/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" aria-hidden="true" />
                                    <div className="relative z-10">
                                        <div className="flex justify-center gap-1 mb-3">
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <Star key={s} size={24} className={s <= Math.round(Number(avgRating)) ? 'text-gold fill-gold' : 'text-white/20'} />
                                            ))}
                                        </div>
                                        <p className="text-4xl font-serif text-gold mb-1">{avgRating}</p>
                                        <p className="text-white/50 text-xs uppercase tracking-widest font-bold">{reviews.length} client review{reviews.length > 1 ? 's' : ''}</p>
                                    </div>
                                </div>
                            )}
                            <div className="max-w-3xl mx-auto space-y-4">
                                {reviews.length === 0 ? (
                                    <div className="text-center py-16 bg-white rounded-2xl border border-gold/10">
                                        <MessageSquare className="text-charcoal/20 mx-auto mb-4" size={48} />
                                        <h3 className="font-serif text-xl text-charcoal mb-2">No Reviews Yet</h3>
                                        <p className="text-charcoal/40 italic">Client feedback will appear here.</p>
                                    </div>
                                ) : (
                                    reviews.map(review => (
                                        <div key={review.id} className="bg-white p-5 md:p-6 rounded-2xl border border-gold/10 hover:shadow-md transition-all group">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center font-serif text-gold font-bold ring-2 ring-gold/10">
                                                        {review.profiles?.full_name?.charAt(0) || 'G'}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-charcoal text-sm">{review.profiles?.full_name || 'Guest'}</p>
                                                        <p className="text-[11px] text-charcoal/40">{new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 bg-gold/5 px-2.5 py-1 rounded-lg">
                                                    {[1, 2, 3, 4, 5].map(s => (
                                                        <Star key={s} size={12} className={s <= review.rating ? 'text-gold fill-gold' : 'text-gold/20'} />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-charcoal/70 text-sm leading-relaxed italic">"{review.comment}"</p>
                                            {review.edit_count && review.edit_count > 0 && (
                                                <div className="mt-4 pt-3 border-t border-gold/5 opacity-50">
                                                    <p className="text-[10px] uppercase tracking-widest font-bold text-charcoal/40 mb-1">Original Review</p>
                                                    <div className="flex items-center gap-1 mb-1">
                                                        <Star size={10} className="text-gold fill-gold" />
                                                        <span className="text-[10px] font-bold text-gold">{review.previous_rating}.0</span>
                                                    </div>
                                                    <p className="text-xs italic text-charcoal/50">"{review.previous_comment}"</p>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* ─── Profile Panel ─── */}
                        <div id="panel-profile" role="tabpanel" className={activeTab !== 'profile' ? 'hidden' : ''}>
                            <div className="max-w-3xl mx-auto">
                                <div className="bg-white rounded-3xl border border-gold/10 overflow-hidden shadow-sm">
                                    {/* Cover */}
                                    <div className="h-36 md:h-44 bg-gradient-to-br from-charcoal via-charcoal to-charcoal-light relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gold/5" aria-hidden="true" />
                                        <div className="absolute bottom-4 right-6 flex items-center gap-1.5">
                                            <div className={`w-2.5 h-2.5 rounded-full ${therapistInfo.active ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                                            <span className="text-white/70 text-[10px] uppercase font-bold tracking-widest">{therapistInfo.active ? 'Active' : 'Inactive'}</span>
                                        </div>
                                    </div>
                                    {/* Content */}
                                    <div className="px-6 md:px-8 pb-8">
                                        <div className="relative -mt-16 md:-mt-20 mb-6 flex justify-between items-end">
                                            <div className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-white bg-white overflow-hidden shadow-xl ring-4 ring-gold/10">
                                                {therapistInfo.image_url ? (
                                                    <img src={therapistInfo.image_url} alt={therapistInfo.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-gold/10 to-gold/5 flex items-center justify-center">
                                                        <UserCircle size={56} className="text-gold/40" />
                                                    </div>
                                                )}
                                            </div>
                                            {reviews.length > 0 && (
                                                <div className="flex items-center gap-2 bg-gold/10 px-4 py-2 rounded-full border border-gold/20 mb-2">
                                                    <Star size={14} className="text-gold fill-gold" />
                                                    <span className="text-sm font-bold text-gold">{avgRating}</span>
                                                    <span className="text-[10px] text-charcoal/40">({reviews.length})</span>
                                                </div>
                                            )}
                                        </div>

                                        <h2 className="font-serif text-2xl md:text-3xl text-charcoal mb-1">{therapistInfo.name}</h2>
                                        <p className="text-gold font-bold uppercase tracking-[0.3em] text-xs mb-6">{therapistInfo.specialty}</p>

                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-charcoal/40 mb-2">About Me</h3>
                                                <p className="text-charcoal/70 leading-relaxed text-sm">{therapistInfo.bio || 'No bio available.'}</p>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                <div className="p-4 rounded-xl bg-cream/50 border border-gold/10">
                                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-charcoal/40 mb-1">Sessions</h3>
                                                    <p className="text-xl font-serif text-charcoal">{completedBookings.length}</p>
                                                </div>
                                                <div className="p-4 rounded-xl bg-cream/50 border border-gold/10">
                                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-charcoal/40 mb-1">Rating</h3>
                                                    <p className="text-xl font-serif text-gold">{avgRating || '—'}</p>
                                                </div>
                                                <div className="p-4 rounded-xl bg-cream/50 border border-gold/10 col-span-2 md:col-span-1 border-t-4 border-t-gold/20">
                                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-charcoal/40 mb-1">Joined</h3>
                                                    <p className="text-sm text-charcoal">{new Date(therapistInfo.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* ─── Mobile Bottom Tab Bar ─── */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gold/10 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]" role="tablist" aria-label="Dashboard navigation">
                <div className="flex justify-around py-2">
                    {tabs.map(tab => (
                        <button key={tab.id} role="tab" aria-selected={activeTab === tab.id} aria-controls={`panel-${tab.id}`}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[60px] ${activeTab === tab.id
                                ? 'text-gold'
                                : 'text-charcoal/30 hover:text-charcoal/50'
                                }`}
                        >
                            {tab.icon}
                            <span className="text-[9px] font-bold uppercase tracking-wider">{tab.mobileLabel}</span>
                            {activeTab === tab.id && <div className="w-5 h-0.5 bg-gold rounded-full" />}
                        </button>
                    ))}
                </div>
            </nav>
        </div>
    );
};

export default TherapistDashboard;
