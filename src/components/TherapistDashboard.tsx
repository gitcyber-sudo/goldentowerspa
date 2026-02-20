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
    Save
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
    services: { title: string; duration: number };
    created_at: string;
    profiles?: { full_name: string; email: string };
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

    const totalTips = useMemo(() => {
        return completedBookings.reduce((sum: number, b: any) => {
            return b.tip_recipient === 'therapist' ? sum + (b.tip_amount || 0) : sum;
        }, 0);
    }, [completedBookings]);

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
                className={`booking - card bg - white rounded - 2xl border border - gold / 10 overflow - hidden hover: shadow - xl hover: border - gold / 20 transition - all group border - l - 4 ${status.border} `}
            >
                <div className="p-5 md:p-6">
                    {/* Top row: client + status */}
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center ring-2 ring-gold/20 font-serif text-gold font-bold text-lg">
                                {clientInitial}
                            </div>
                            <div>
                                <h3 className="font-semibold text-charcoal group-hover:text-gold transition-colors text-sm md:text-base">
                                    {clientName}
                                </h3>
                                {booking.profiles?.email && (
                                    <p className="text-[11px] text-charcoal/50 flex items-center gap-1">
                                        <Mail size={10} /> {booking.profiles.email}
                                    </p>
                                )}
                                {booking.guest_phone && (
                                    <p className="text-[11px] text-charcoal/50 flex items-center gap-1">
                                        <Phone size={10} /> {booking.guest_phone}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                            <span className={`px - 2.5 py - 1 rounded - full text - [9px] font - bold uppercase tracking - widest flex items - center gap - 1 ${status.bg} ${status.text} `}>
                                {status.icon} {booking.status}
                            </span>
                            {booking.services?.title.toLowerCase().includes('home') && (
                                <span className="flex items-center gap-1 text-[9px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                    <MapPin size={9} /> Home
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Service details */}
                    <div className="bg-cream/30 rounded-xl p-4 mb-3 border border-gold/5 group-hover:bg-cream/50 transition-colors">
                        <p className="font-serif text-base md:text-lg text-charcoal mb-2">{booking.services?.title || 'Service'}</p>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-charcoal/60">
                            <div className="flex items-center gap-1.5">
                                <Calendar size={13} className="text-gold" />
                                {new Date(booking.booking_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Clock size={13} className="text-gold" />
                                {formatTimeTo12h(booking.booking_time)}
                            </div>
                            {booking.services?.duration && (
                                <span className="text-gold font-bold bg-gold/10 px-2 py-0.5 rounded text-xs">
                                    {booking.services.duration} min
                                </span>
                            )}
                        </div>
                    </div>
                    <p className="text-[11px] text-charcoal/35 font-medium">Booked {new Date(booking.created_at).toLocaleDateString()}</p>
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
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3 md:gap-4">
                        <button onClick={() => navigate('/')} className="text-gold hover:text-gold-dark transition-all group" aria-label="Return to homepage">
                            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <div className="flex items-center gap-3">
                            {therapistInfo.image_url ? (
                                <img src={therapistInfo.image_url} alt="" className="w-10 h-10 md:w-11 md:h-11 rounded-full object-cover ring-2 ring-gold/20" />
                            ) : (
                                <div className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center ring-2 ring-gold/20">
                                    <User className="text-white" size={18} />
                                </div>
                            )}
                            <div>
                                <h1 className="font-serif text-lg md:text-xl text-charcoal leading-tight">{therapistInfo.name}</h1>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-gold font-bold uppercase tracking-[0.2em]">{therapistInfo.specialty || 'Specialist'}</span>
                                    {reviews.length > 0 && (
                                        <span className="flex items-center gap-0.5 text-[10px] font-bold text-gold bg-gold/10 px-1.5 py-0.5 rounded-full">
                                            <Star size={8} fill="currentColor" /> {avgRating}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <button onClick={handleSignOut} className="flex items-center gap-1.5 text-rose-500 hover:text-rose-700 transition-colors font-bold uppercase tracking-widest text-[10px]" aria-label="Sign out">
                        <LogOut size={16} /> <span className="hidden md:inline">Sign Out</span>
                    </button>
                </div>
            </header>

            {/* ─── Main Content ─── */}
            <main className="max-w-6xl mx-auto w-full px-4 md:px-6 py-6 md:py-10 flex-1 pb-24 md:pb-10" id="main-content">
                {/* ─── Stats Row ─── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
                    {[
                        { icon: <Calendar className="text-gold" size={20} />, bg: 'bg-gold/10', value: todayBookings.length, label: 'Today' },
                        { icon: <Clock3 className="text-amber-600" size={20} />, bg: 'bg-amber-50', value: upcomingBookings.length, label: 'Upcoming' },
                        { icon: <CheckCircle2 className="text-emerald-600" size={20} />, bg: 'bg-emerald-50', value: completedBookings.length, label: 'Completed' },
                        { icon: <Star className="text-white" size={20} fill="currentColor" />, bg: 'bg-gradient-to-br from-gold to-gold-dark', value: avgRating || '—', label: `${reviews.length} Reviews`, isGold: true }
                    ].map((stat, i) => (
                        <div key={i} className={`dashboard - stat p - 4 md: p - 5 rounded - xl border border - gold / 10 hover: shadow - lg transition - all hover: -translate - y - 0.5 group ${stat.isGold ? stat.bg + ' shadow-lg text-white' : 'bg-white'} `}>
                            <div className="flex items-center gap-3">
                                <div className={`w - 10 h - 10 md: w - 12 md: h - 12 rounded - full flex items - center justify - center transition - all ${stat.isGold ? 'bg-white/20 backdrop-blur-sm' : stat.bg + ' group-hover:scale-105'} `}>
                                    {stat.icon}
                                </div>
                                <div>
                                    <p className={`text - 2xl md: text - 3xl font - serif ${stat.isGold ? 'text-white' : 'text-charcoal'} `}>{stat.value}</p>
                                    <p className={`text - [10px] uppercase tracking - widest ${stat.isGold ? 'text-white/70' : 'text-charcoal/50'} `}>{stat.label}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ─── Desktop Tab Navigation ─── */}
                <div className="hidden md:flex gap-1 mb-8 bg-white rounded-xl p-1.5 border border-gold/10 shadow-sm" role="tablist" aria-label="Dashboard sections">
                    {tabs.map(tab => (
                        <button key={tab.id} role="tab" aria-selected={activeTab === tab.id} aria-controls={`panel - ${tab.id} `}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items - center gap - 2 px - 5 py - 3 rounded - lg text - xs font - bold uppercase tracking - widest transition - all flex - 1 justify - center ${activeTab === tab.id
                                ? 'bg-gold text-white shadow-md'
                                : 'text-charcoal/40 hover:text-charcoal/70 hover:bg-gold/5'
                                } `}
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
                                                        <div className={`absolute left - 3.5 top - 6 w - 3 h - 3 rounded - full border - 2 border - white shadow - sm z - 10 ${status.dot} `} aria-hidden="true" />
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

                            {/* Upcoming bucketed by time */}
                            {upcomingBookings.length === 0 ? (
                                <div className="text-center py-16 bg-white rounded-2xl border border-gold/10">
                                    <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6">
                                        <Logo className="h-8 w-8" color="#997B3D" />
                                    </div>
                                    <h3 className="font-serif text-xl text-charcoal mb-2">No Upcoming Sessions</h3>
                                    <p className="text-charcoal/50 italic">Your schedule is clear. Time to relax!</p>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {timeBuckets.map((bucket, i) => {
                                        const bucketBookings = upcomingBookings.filter((b: any) => {
                                            if (new Date(b.booking_date).toDateString() === new Date().toDateString()) return false; // already shown in today
                                            const hour = parseInt(b.booking_time.split(':')[0]);
                                            return hour >= bucket.range[0] && hour < bucket.range[1];
                                        });
                                        if (bucketBookings.length === 0) return null;
                                        return (
                                            <div key={i}>
                                                <div className="flex items-center gap-2 mb-4 border-b border-gold/10 pb-2">
                                                    <span className="text-xl">{bucket.icon}</span>
                                                    <h2 className="font-serif text-lg text-charcoal">{bucket.title}</h2>
                                                    <span className="ml-auto bg-gold/10 text-gold text-[9px] font-bold px-2 py-0.5 rounded-full">
                                                        {bucketBookings.length} SESSION{bucketBookings.length > 1 ? 'S' : ''}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                    {bucketBookings.map(renderBookingCard)}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

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
    .rdp { --rdp - cell - size: 40px; --rdp - accent - color: #997B3D; --rdp - background - color: #f3f0e6; margin: 0; }
                                            .rdp - day_selected, .rdp - day_selected: focus - visible, .rdp - day_selected:hover { background - color: #997B3D; color: white; border - radius: 8px; }
                                            .rdp - button: hover: not([disabled]): not(.rdp - day_selected) { background - color: rgba(153, 123, 61, 0.1); border - radius: 8px; }
                                            .rdp - day_today { font - weight: bold; color: #1A1A1A; border: 1px solid #997B3D; border - radius: 8px; }
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
                                    <p className="text-charcoal/40 italic">Completed sessions will appear here.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {completedBookings.map(renderBookingCard)}
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
                                            <div className={`w - 2.5 h - 2.5 rounded - full ${therapistInfo.active ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'} `} />
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
                                                <div className="p-4 rounded-xl bg-cream/50 border border-gold/10">
                                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-charcoal/40 mb-1">Tips</h3>
                                                    <p className="text-xl font-serif text-emerald-600">₱{totalTips.toLocaleString()}</p>
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
