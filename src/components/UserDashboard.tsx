import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { formatTimeTo12h } from '../lib/utils';
import gsap from 'gsap';
import {
    Calendar,
    Clock,
    LogOut,
    User,
    CheckCircle2,
    XCircle,
    Clock3,
    ArrowLeft,
    History,
    DollarSign,
    Award,
    Phone,
    MapPin,
    Heart,
    TrendingUp,
    Star,
    Shield,
    RotateCcw,
    AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from './LoadingScreen';
import Logo from './Logo';
import BookingModal from './BookingModal';
import AuthModal from './AuthModal';
import { useSEO } from '../hooks/useSEO';

interface Booking {
    id: string;
    booking_date: string;
    booking_time: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    services: { title: string; duration: number; price: number };
    therapist_id: string;
    therapists: { name: string };
    created_at: string;
}

const UserDashboard: React.FC = () => {
    useSEO({
        title: 'Guest & Member Dashboard',
        description: 'Manage your wellness bookings, track rewards, and view your massage ritual history.'
    });
    const { user, profile, role, signOut, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'current' | 'past'>('current');
    const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submittingFeedback, setSubmittingFeedback] = useState(false);
    const [existingFeedback, setExistingFeedback] = useState<any>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
    const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>(undefined);

    const bannerRef = useRef(null);
    const statsRef = useRef(null);

    // ─── Animations ───
    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(bannerRef.current, { y: 20, opacity: 0, duration: 0.8, ease: "power2.out" });
            if (statsRef.current) {
                gsap.from((statsRef.current as HTMLElement).children, {
                    y: 30, opacity: 0, stagger: 0.1, duration: 0.6, delay: 0.3, ease: "back.out(1.2)"
                });
            }
            gsap.from(".fade-up-item", { y: 20, opacity: 0, duration: 0.6, delay: 0.6 });
        });
        return () => ctx.revert();
    }, []);

    // ─── Data ───
    useEffect(() => {
        if (!authLoading) {
            if (user && profile?.role === 'admin') { navigate('/admin'); return; }
            fetchBookings();
        }
    }, [user, profile, authLoading]);

    const fetchBookings = async (retryCount = 0) => {
        setLoading(true);
        try {
            const visitorId = localStorage.getItem('gt_visitor_id');
            let query = supabase.from('bookings').select(`*, services (title, duration, price), therapists (name), therapist_feedback (*)`);
            if (user) { query = query.or(`user_id.eq.${user.id},and(visitor_id.eq.${visitorId},user_id.is.null),and(user_email.eq.${user.email},user_id.is.null)`); }
            else if (visitorId) { query = query.eq('visitor_id', visitorId); }
            else { setLoading(false); return; }
            const { data, error } = await query.order('booking_date', { ascending: false });
            if (error) throw error;
            if (data) {
                setBookings(data as any);
                if (data.length === 0 && retryCount < 1) setTimeout(() => fetchBookings(retryCount + 1), 2000);
            }
        } catch (err) { console.error('Error fetching bookings:', err); }
        finally { setLoading(false); }
    };

    const cancelBooking = async (id: string) => {
        if (!confirm('Are you sure you want to cancel this booking?')) return;
        try {
            const { error } = await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id);
            if (error) throw error;
            fetchBookings();
        } catch (err) { console.error('Error cancelling booking:', err); alert('Failed to cancel booking'); }
    };

    const handleSignOut = async () => { await signOut(); navigate('/'); };

    const openFeedbackModal = async (booking: Booking) => {
        setSelectedBooking(booking);
        setLoading(true);
        try {
            const { data } = await supabase.from('therapist_feedback').select('*').eq('booking_id', booking.id).order('created_at', { ascending: false }).limit(1).maybeSingle();
            if (data) { setExistingFeedback(data); setRating(data.rating); setComment(data.comment); setIsEditMode(true); }
            else { setExistingFeedback(null); setRating(5); setComment(''); setIsEditMode(false); }
            setFeedbackModalOpen(true);
        } catch (err) { console.error('Error:', err); setExistingFeedback(null); setRating(5); setComment(''); setIsEditMode(false); setFeedbackModalOpen(true); }
        finally { setLoading(false); }
    };

    const submitFeedback = async () => {
        if (!selectedBooking) return;
        setSubmittingFeedback(true);
        try {
            const visitorId = localStorage.getItem('gt_visitor_id');
            const { error } = await supabase.from('therapist_feedback').insert({
                booking_id: selectedBooking.id, user_id: user?.id || null, visitor_id: visitorId,
                therapist_id: selectedBooking.therapist_id, rating, comment
            });
            if (error) throw error;
            alert('Thank you for your feedback!');
            setFeedbackModalOpen(false); setComment(''); setRating(5);
            await fetchBookings();
        } catch (err) { console.error('Error:', err); alert('Failed to submit feedback'); }
        finally { setSubmittingFeedback(false); }
    };

    // ─── Computed ───
    const currentBookings = bookings.filter(b => b.status === 'pending' || b.status === 'confirmed')
        .sort((a, b) => new Date(a.booking_date + 'T' + a.booking_time).getTime() - new Date(b.booking_date + 'T' + b.booking_time).getTime());
    const pastBookings = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled');
    const completedBookings = pastBookings.filter(b => b.status === 'completed');
    const pendingBookings = bookings.filter(b => b.status === 'pending');
    const totalAmountSpent = completedBookings.reduce((sum, b) => sum + (b.services?.price || 0), 0);
    const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently';
    const maxPending = user ? 2 : 1;

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'pending': return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-l-amber-400', icon: <Clock3 size={14} /> };
            case 'confirmed': return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-l-emerald-500', icon: <CheckCircle2 size={14} /> };
            case 'completed': return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-l-blue-500', icon: <CheckCircle2 size={14} /> };
            case 'cancelled': return { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-l-rose-400', icon: <XCircle size={14} /> };
            default: return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-l-gray-300', icon: null };
        }
    };

    // ─── Booking Card ───
    const renderBookingCard = (booking: Booking) => {
        const status = getStatusConfig(booking.status);
        return (
            <div
                key={booking.id}
                className={`bg-white rounded-2xl border border-gold/10 overflow-hidden hover:shadow-xl hover:border-gold/20 transition-all group border-l-4 ${status.border}`}
            >
                <div className="p-5 md:p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                            <h3 className="font-serif text-lg md:text-xl text-charcoal mb-1 group-hover:text-gold transition-colors">
                                {booking.services?.title || 'Service'}
                            </h3>
                            <p className="text-sm text-gold/80 italic">
                                with {booking.therapists?.name || 'Any Specialist'}
                            </p>
                        </div>
                        <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${status.bg} ${status.text}`}>
                            {status.icon} {booking.status}
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        <div className="flex items-center gap-1.5 text-charcoal/70 bg-cream/50 px-3 py-1.5 rounded-lg text-sm">
                            <Calendar size={14} className="text-gold" />
                            {new Date(booking.booking_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-1.5 text-charcoal/70 bg-cream/50 px-3 py-1.5 rounded-lg text-sm">
                            <Clock size={14} className="text-gold" />
                            {formatTimeTo12h(booking.booking_time)}
                        </div>
                        {booking.services?.duration && (
                            <span className="text-xs text-charcoal/40 bg-cream/30 px-2 py-1 rounded">{booking.services.duration} min</span>
                        )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gold/5">
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-charcoal/40">Booked {new Date(booking.created_at).toLocaleDateString()}</span>
                            {booking.services?.price && (
                                <span className="flex items-center gap-1 bg-gold/10 px-2.5 py-1 rounded-full text-xs font-bold text-gold">
                                    ₱{booking.services.price.toLocaleString()}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {booking.status === 'pending' && (
                                <button onClick={() => cancelBooking(booking.id)} className="text-rose-500 hover:text-rose-700 text-xs font-bold flex items-center gap-1 hover:bg-rose-50 px-3 py-1.5 rounded-full transition-all" aria-label={`Cancel booking for ${booking.services?.title}`}>
                                    <XCircle size={14} /> Cancel
                                </button>
                            )}
                            {booking.status === 'completed' && (
                                <>
                                    <button
                                        onClick={() => { setSelectedServiceId(booking.services?.title ? undefined : undefined); setIsBookingOpen(true); }}
                                        className="text-gold hover:text-gold-dark text-xs font-bold flex items-center gap-1 hover:bg-gold/5 px-3 py-1.5 rounded-full transition-all"
                                        aria-label={`Rebook ${booking.services?.title}`}
                                    >
                                        <RotateCcw size={14} /> Rebook
                                    </button>
                                    <button
                                        onClick={() => openFeedbackModal(booking)}
                                        className={`text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all border ${(booking as any).therapist_feedback?.[0]
                                            ? 'text-charcoal/40 bg-charcoal/5 border-charcoal/10'
                                            : 'text-gold bg-gold/10 border-gold/20 hover:bg-gold/20'}`}
                                        aria-label={(booking as any).therapist_feedback?.[0] ? `View review for ${booking.services?.title}` : `Rate therapist for ${booking.services?.title}`}
                                    >
                                        {(booking as any).therapist_feedback?.[0]
                                            ? <><History size={14} /> Review</>
                                            : <><Star size={14} fill="currentColor" /> Rate</>}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // ─── Countdown ───
    const BookingCountdown: React.FC<{ booking: Booking }> = ({ booking }) => {
        const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        useEffect(() => {
            const calculate = () => {
                const now = new Date().getTime();
                const target = new Date(booking.booking_date + 'T' + (booking.booking_time.length === 5 ? booking.booking_time : booking.booking_time.substring(0, 5))).getTime();
                const diff = target - now;
                if (diff > 0) {
                    setTimeLeft({
                        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                        minutes: Math.floor((diff / 1000 / 60) % 60),
                        seconds: Math.floor((diff / 1000) % 60)
                    });
                }
            };
            calculate();
            const timer = setInterval(calculate, 1000);
            return () => clearInterval(timer);
        }, [booking]);

        return (
            <div role="status" aria-label="Time until your next appointment" className="bg-gradient-to-br from-charcoal to-charcoal-light rounded-2xl p-6 md:p-8 relative overflow-hidden group border border-gold/20 shadow-xl mb-6">
                <div className="absolute top-0 right-0 w-48 h-48 bg-gold/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 group-hover:bg-gold/15 transition-all duration-1000" aria-hidden="true" />
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-4 text-center md:text-left">
                        <div className="w-14 h-14 rounded-2xl bg-gold/20 flex items-center justify-center shadow-lg">
                            <Clock className="text-gold animate-pulse" size={26} />
                        </div>
                        <div>
                            <h3 className="font-serif text-xl md:text-2xl text-white">Next Appointment</h3>
                            <p className="text-xs text-gold uppercase font-bold tracking-widest mt-1">{booking.services?.title}</p>
                        </div>
                    </div>
                    <div className="flex gap-3 md:gap-5" aria-live="polite">
                        {[
                            { label: 'Days', value: timeLeft.days },
                            { label: 'Hrs', value: timeLeft.hours },
                            { label: 'Min', value: timeLeft.minutes },
                            { label: 'Sec', value: timeLeft.seconds }
                        ].map((t, i) => (
                            <div key={i} className="text-center bg-white/5 backdrop-blur rounded-xl px-3 py-3 md:px-5 md:py-4 min-w-[52px] md:min-w-[65px] border border-white/10">
                                <p className="text-2xl md:text-3xl font-serif text-gold leading-none">{t.value.toString().padStart(2, '0')}</p>
                                <p className="text-[8px] md:text-[9px] uppercase font-black tracking-widest text-white/50 mt-1.5">{t.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    // ─── Guest CTA ───
    const GuestRegistrationBanner = () => (
        <div className="bg-gradient-to-r from-charcoal to-charcoal-light rounded-2xl p-6 md:p-8 mb-8 relative overflow-hidden shadow-2xl group border border-gold/30">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 group-hover:bg-gold/20 transition-all duration-1000" aria-hidden="true" />
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 relative z-10">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-gold/20 p-2.5 rounded-xl">
                            <Logo className="w-5 h-5" color="#C5A059" />
                        </div>
                        <span className="text-gold text-xs font-black uppercase tracking-[0.3em]">Unlock Your Full Journey</span>
                    </div>
                    <h3 className="font-serif text-2xl md:text-3xl text-white mb-2 leading-tight">Elevate Your Experience</h3>
                    <p className="text-white/50 text-sm max-w-xl leading-relaxed">
                        Create an account to preserve your booking history, earn exclusive rewards, and <strong className="text-white/70">unlock the freedom to orchestrate your entire wellness calendar with multiple advance bookings</strong>.
                    </p>
                </div>
                <button
                    onClick={() => { setAuthMode('signup'); setIsAuthOpen(true); }}
                    className="bg-gold hover:bg-gold-dark text-white px-8 md:px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs transition-all shadow-[0_10px_30px_rgba(197,160,89,0.3)] hover:shadow-gold/40 transform hover:-translate-y-1 flex items-center gap-2 whitespace-nowrap"
                    aria-label="Create a free account"
                >
                    <User size={18} /> Create Free Account
                </button>
            </div>
        </div>
    );

    if (authLoading) return <LoadingScreen message="Restoring your session" />;

    return (
        <div className="min-h-screen bg-[#F9F7F2]">
            {/* ─── Premium Brand Header ─── */}
            <header className="bg-white/90 backdrop-blur-xl border-b border-gold/10 px-4 md:px-8 py-4 md:py-6 sticky top-0 z-40 shadow-sm transition-all duration-300">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    {/* Brand Link + Portal Identity */}
                    <div className="flex items-center gap-4 md:gap-8">
                        <button
                            onClick={() => navigate('/')}
                            className="group flex items-center gap-3 transition-transform hover:scale-[1.02]"
                            aria-label="Golden Tower Spa - Return to Sanctuary Home"
                        >
                            <Logo className="h-10 md:h-12 w-auto" color="#997B3D" />
                            <div className="flex flex-col text-left border-l border-gold/20 pl-4">
                                <span className="font-serif font-bold text-lg md:text-2xl text-gold leading-tight">Golden Tower</span>
                                <span className="text-[10px] md:text-xs text-charcoal/40 uppercase tracking-[0.3em] font-black">
                                    {user ? 'Member Portal' : 'Guest Sanctuary'}
                                </span>
                            </div>
                        </button>
                    </div>

                    {/* Actions & Profile */}
                    <div className="flex items-center gap-3 md:gap-6">
                        <div className="hidden md:flex flex-col items-end mr-2">
                            <p className="text-xs uppercase tracking-widest text-gold font-black opacity-60">Verified Identity</p>
                            <p className="text-sm font-serif text-charcoal">
                                Welcome, <span className="italic">{profile?.full_name || user?.email || 'Guest'}</span>
                            </p>
                        </div>

                        <div className="h-10 w-px bg-gold/10 hidden md:block" aria-hidden="true" />

                        {user ? (
                            <button
                                onClick={handleSignOut}
                                className="flex items-center gap-2 text-rose-500 hover:text-rose-700 transition-all font-bold uppercase tracking-widest text-[10px] bg-rose-50/50 px-4 py-2.5 rounded-full border border-rose-100 hover:bg-rose-50"
                                aria-label="Sign out of your sanctuary account"
                            >
                                <LogOut size={16} /> <span className="hidden md:inline">Sign Out</span>
                            </button>
                        ) : (
                            <button
                                onClick={() => { setAuthMode('login'); setIsAuthOpen(true); }}
                                className="flex items-center gap-2 text-gold hover:bg-gold/5 transition-all font-bold uppercase tracking-widest text-[10px] border border-gold/20 px-5 py-2.5 rounded-full"
                                aria-label="Sign in to your member portal"
                            >
                                <User size={16} /> <span className="hidden md:inline">Sign In</span>
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12" id="main-content">
                {/* ─── Member Banner ─── */}
                <div ref={bannerRef} className="bg-gradient-to-br from-gold/10 via-gold/5 to-transparent rounded-2xl p-5 md:p-6 mb-6 border border-gold/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" aria-hidden="true" />
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center shadow-lg ring-4 ring-gold/20">
                                <User className="text-white" size={24} />
                            </div>
                            <div>
                                <h1 className="font-serif text-xl md:text-2xl text-charcoal">{profile?.full_name || 'Valued Guest'}</h1>
                                <div className="flex items-center gap-2 text-sm text-charcoal/60">
                                    <Award size={14} className="text-gold" /> Member since {memberSince}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Booking Limit Indicator */}
                            <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-gold/10 shadow-sm" role="status" aria-label={`${pendingBookings.length} of ${maxPending} pending bookings used`}>
                                <AlertTriangle size={14} className={pendingBookings.length >= maxPending ? 'text-rose-500' : 'text-gold/50'} />
                                <span className="text-xs font-bold text-charcoal/70">
                                    <span className={pendingBookings.length >= maxPending ? 'text-rose-600' : 'text-gold'}>{pendingBookings.length}</span>
                                    /{maxPending} Pending
                                </span>
                            </div>
                            <button
                                onClick={() => { setSelectedServiceId(undefined); setIsBookingOpen(true); }}
                                className="flex items-center gap-2 bg-gold hover:bg-gold-dark text-white px-5 md:px-6 py-3 rounded-full transition-all shadow-md hover:shadow-lg font-bold uppercase tracking-widest text-[10px]"
                                aria-label="Book a new treatment"
                            >
                                <Logo className="h-4 w-4" color="white" /> Book Treatment
                            </button>
                        </div>
                    </div>
                </div>

                {/* ─── Countdown ─── */}
                {currentBookings.length > 0 && <BookingCountdown booking={currentBookings[0]} />}

                {/* ─── Guest Banner ─── */}
                {!user && <GuestRegistrationBanner />}

                {/* ─── Stats Grid ─── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8" ref={statsRef}>
                    {[
                        { icon: <Clock3 className="text-amber-600" size={20} />, bg: 'bg-amber-50', value: currentBookings.length, label: 'Active' },
                        { icon: <CheckCircle2 className="text-emerald-600" size={20} />, bg: 'bg-emerald-50', value: completedBookings.length, label: 'Completed' },
                        { icon: <Logo className="h-5 w-5" color="#997B3D" />, bg: 'bg-gold/10', value: bookings.length, label: 'Total' },
                        { icon: <DollarSign className="text-white" size={20} />, bg: 'bg-gradient-to-br from-gold to-gold-dark', value: `₱${totalAmountSpent.toLocaleString()}`, label: 'Total Spent', isGold: true }
                    ].map((stat, i) => (
                        <div key={i} className={`p-4 md:p-5 rounded-xl border border-gold/10 hover:shadow-lg transition-all hover:-translate-y-0.5 group ${stat.isGold ? stat.bg + ' shadow-lg text-white' : 'bg-white'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-colors ${stat.isGold ? 'bg-white/20 backdrop-blur-sm' : stat.bg + ' group-hover:scale-105'}`}>
                                    {stat.icon}
                                </div>
                                <div>
                                    <p className={`text-2xl md:text-3xl font-serif ${stat.isGold ? 'text-white' : 'text-charcoal'}`}>{stat.value}</p>
                                    <p className={`text-[10px] uppercase tracking-widest ${stat.isGold ? 'text-white/70' : 'text-charcoal/50'}`}>{stat.label}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ─── Quick Actions ─── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-8 fade-up-item">
                    <button onClick={() => { setSelectedServiceId(undefined); setIsBookingOpen(true); }} className="bg-white p-4 rounded-xl border border-gold/10 hover:border-gold/30 hover:shadow-md transition-all flex items-center gap-4 group" aria-label="Schedule a new appointment">
                        <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-all"><Calendar className="text-gold" size={20} /></div>
                        <div className="text-left"><p className="font-bold text-charcoal text-sm">Schedule Appointment</p><p className="text-xs text-charcoal/50">Book your next session</p></div>
                        <TrendingUp size={16} className="text-gold/30 ml-auto group-hover:text-gold transition-all" />
                    </button>
                    <a href="tel:09228262336" className="bg-white p-4 rounded-xl border border-gold/10 hover:border-gold/30 hover:shadow-md transition-all flex items-center gap-4 group" aria-label="Call Golden Tower Spa">
                        <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-all"><Phone className="text-emerald-600" size={20} /></div>
                        <div className="text-left"><p className="font-bold text-charcoal text-sm">Call Us</p><p className="text-xs text-charcoal/50">0922 826 2336</p></div>
                    </a>
                    <a href="https://www.google.com/maps/dir/?api=1&destination=Golden+Tower+Spa+Project+6+Quezon+City" target="_blank" rel="noopener noreferrer" className="bg-white p-4 rounded-xl border border-gold/10 hover:border-gold/30 hover:shadow-md transition-all flex items-center gap-4 group" aria-label="Get directions to Golden Tower Spa">
                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-all"><MapPin className="text-blue-600" size={20} /></div>
                        <div className="text-left"><p className="font-bold text-charcoal text-sm">Find Us</p><p className="text-xs text-charcoal/50">Get directions</p></div>
                    </a>
                </div>

                {/* ─── Tab Navigation ─── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6" role="tablist" aria-label="Booking views">
                    <h2 className="font-serif text-xl md:text-2xl text-charcoal">Your Bookings</h2>
                    <div className="flex gap-2">
                        <button role="tab" aria-selected={activeTab === 'current'} aria-controls="panel-current" onClick={() => setActiveTab('current')}
                            className={`px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'current' ? 'bg-gold text-white shadow-md' : 'bg-white text-charcoal/50 hover:bg-gold/10 border border-gold/10'}`}>
                            Active ({currentBookings.length})
                        </button>
                        <button role="tab" aria-selected={activeTab === 'past'} aria-controls="panel-past" onClick={() => setActiveTab('past')}
                            className={`px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 ${activeTab === 'past' ? 'bg-gold text-white shadow-md' : 'bg-white text-charcoal/50 hover:bg-gold/10 border border-gold/10'}`}>
                            <History size={14} /> Past ({pastBookings.length})
                        </button>
                    </div>
                </div>

                {/* ─── Booking List ─── */}
                {loading ? (
                    <div className="text-center py-16">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gold/20 border-t-gold" role="status" aria-label="Loading bookings" />
                        <p className="text-charcoal/40 mt-4 italic">Loading your treatments...</p>
                    </div>
                ) : (
                    <>
                        {/* Active Panel */}
                        <div id="panel-current" role="tabpanel" aria-labelledby="tab-current" className={activeTab !== 'current' ? 'hidden' : ''}>
                            {currentBookings.length === 0 ? (
                                <div className="bg-white rounded-2xl border border-gold/10 text-center py-16 px-8">
                                    <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6">
                                        <Logo className="h-8 w-8" color="#997B3D" />
                                    </div>
                                    <h3 className="font-serif text-xl text-charcoal mb-2">No Active Bookings</h3>
                                    <p className="text-charcoal/50 mb-6 max-w-sm mx-auto">Ready for relaxation? Book your next treatment.</p>
                                    <button onClick={() => { setSelectedServiceId(undefined); setIsBookingOpen(true); }} className="bg-gradient-to-r from-gold to-gold-dark text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest hover:shadow-lg transition-all inline-flex items-center gap-2" aria-label="Book a treatment now">
                                        <Logo className="h-4 w-4" color="white" /> Book a Treatment
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                    {currentBookings.map(renderBookingCard)}
                                </div>
                            )}
                        </div>

                        {/* Past Panel — Timeline */}
                        <div id="panel-past" role="tabpanel" aria-labelledby="tab-past" className={activeTab !== 'past' ? 'hidden' : ''}>
                            {pastBookings.length === 0 ? (
                                <div className="bg-white rounded-2xl border border-gold/10 text-center py-16 px-8">
                                    <div className="w-20 h-20 rounded-full bg-charcoal/5 flex items-center justify-center mx-auto mb-6">
                                        <History className="text-charcoal/30" size={32} />
                                    </div>
                                    <h3 className="font-serif text-xl text-charcoal mb-2">No Past Bookings</h3>
                                    <p className="text-charcoal/50 max-w-sm mx-auto">Completed and cancelled bookings will appear here.</p>
                                </div>
                            ) : (
                                <div className="relative">
                                    {/* Timeline connector line */}
                                    <div className="absolute left-5 md:left-6 top-0 bottom-0 w-px bg-gold/15" aria-hidden="true" />
                                    <div className="space-y-4">
                                        {pastBookings.map((booking, index) => {
                                            const status = getStatusConfig(booking.status);
                                            return (
                                                <div key={booking.id} className="relative pl-12 md:pl-14">
                                                    {/* Timeline dot */}
                                                    <div className={`absolute left-3.5 md:left-4.5 top-6 w-3 h-3 rounded-full border-2 border-white shadow-sm z-10 ${booking.status === 'completed' ? 'bg-blue-500' : 'bg-rose-400'}`} aria-hidden="true" />
                                                    {renderBookingCard(booking)}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>

            {/* ─── Feedback Modal ─── */}
            {feedbackModalOpen && selectedBooking && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm" onClick={() => setFeedbackModalOpen(false)} aria-hidden="true" />
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden" role="dialog" aria-modal="true" aria-label="Rate your experience">
                        <div className="bg-gradient-to-r from-gold to-gold-dark p-6 text-white text-center">
                            <h3 className="font-serif text-2xl mb-1">Rate Your Experience</h3>
                            <p className="text-white/80 text-xs uppercase tracking-widest font-bold">with {selectedBooking.therapists?.name}</p>
                        </div>
                        <div className="p-6 md:p-8">
                            {isEditMode && (
                                <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700 italic flex items-center gap-2">
                                    <Shield size={14} /> This review has been submitted and is read-only.
                                </div>
                            )}
                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-3">
                                    <label className="block text-[10px] uppercase tracking-widest font-black text-gold">{isEditMode ? 'Your Review' : 'Rate Your Ritual'}</label>
                                    <div className="flex gap-1" role="radiogroup" aria-label="Rating">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <button key={s} type="button" disabled={isEditMode} onClick={() => setRating(s)} className={`transition-all ${s <= rating ? 'text-gold' : 'text-gold/20'} disabled:cursor-default`} aria-label={`${s} star${s > 1 ? 's' : ''}`}>
                                                <Star size={20} fill={s <= rating ? 'currentColor' : 'none'} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <textarea disabled={isEditMode} className="w-full bg-cream/50 border border-gold/10 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 min-h-[100px] disabled:opacity-70 disabled:bg-gold/5 transition-all" placeholder="Tell us about your session..." value={comment} onChange={(e) => setComment(e.target.value)} aria-label="Review comment" />
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setFeedbackModalOpen(false)} className="flex-1 py-3.5 text-xs font-bold uppercase tracking-widest text-charcoal/40 hover:text-charcoal transition-all rounded-xl hover:bg-cream/50">{isEditMode ? 'Close' : 'Cancel'}</button>
                                {!isEditMode && (
                                    <button onClick={submitFeedback} disabled={submittingFeedback || !rating} className="flex-1 bg-gold hover:bg-gold-dark text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg transition-all disabled:opacity-50">
                                        {submittingFeedback ? 'Submitting...' : 'Submit Review'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <BookingModal isOpen={isBookingOpen} onClose={() => { setIsBookingOpen(false); fetchBookings(); }} initialServiceId={selectedServiceId} onAuthRequired={() => setIsAuthOpen(true)} />
            <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} initialMode={authMode} onSuccess={() => { setIsAuthOpen(false); fetchBookings(); }} />
        </div>
    );
};

export default UserDashboard;
