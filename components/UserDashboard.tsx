
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
    Sparkles,
    ArrowLeft,
    History,
    DollarSign,
    Award,
    Gift,
    Phone,
    MapPin,
    Heart,
    TrendingUp,
    Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from './LoadingScreen';
import Logo from './Logo';

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

    const bannerRef = useRef(null);
    const statsRef = useRef(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(bannerRef.current, { y: 20, opacity: 0, duration: 0.8, ease: "power2.out" });

            // Stagger animation for stats
            if (statsRef.current) {
                gsap.from((statsRef.current as HTMLElement).children, {
                    y: 30,
                    opacity: 0,
                    stagger: 0.1,
                    duration: 0.6,
                    delay: 0.3,
                    ease: "back.out(1.2)"
                });
            }

            gsap.from(".fade-up-item", {
                y: 20,
                opacity: 0,
                duration: 0.6,
                delay: 0.6
            });
        });
        return () => ctx.revert();
    }, []);

    // Data fetching logic
    useEffect(() => {
        if (!authLoading) {
            // Force redirect admins to /admin if they land here
            if (user && profile?.role === 'admin') {
                console.log("Admin detected on user dashboard, redirecting to /admin");
                navigate('/admin');
                return;
            }
            fetchBookings();
        }
    }, [user, profile, authLoading]);

    const fetchBookings = async (retryCount = 0) => {
        setLoading(true);
        try {
            console.log("Dashboard: Fetching for user/visitor:", user?.id || "guest");

            const visitorId = localStorage.getItem('gt_visitor_id');

            let query = supabase
                .from('bookings')
                .select(`
                    *,
                    services (title, duration, price),
                    therapists (name)
                `);

            if (user) {
                // If logged in, prioritize user_id but also check visitor_id for orphaned bookings
                query = query.or(`user_id.eq.${user.id},and(visitor_id.eq.${visitorId},user_id.is.null)`);
            } else if (visitorId) {
                // If guest, show only visitor bookings
                query = query.eq('visitor_id', visitorId);
            } else {
                setLoading(false);
                return;
            }

            const { data, error } = await query.order('booking_date', { ascending: false });

            if (error) throw error;

            if (data) {
                console.log("Dashboard: Found bookings:", data.length);
                setBookings(data as any);
                if (data.length === 0 && retryCount < 1) {
                    setTimeout(() => fetchBookings(retryCount + 1), 2000);
                }
            }
        } catch (err) {
            console.error('Error fetching bookings:', err);
        } finally {
            setLoading(false);
        }
    };

    const cancelBooking = async (id: string) => {
        if (!confirm('Are you sure you want to cancel this booking?')) return;
        try {
            const { error } = await supabase
                .from('bookings')
                .update({ status: 'cancelled' })
                .eq('id', id);
            if (error) throw error;
            fetchBookings();
        } catch (err) {
            console.error('Error cancelling booking:', err);
            alert('Failed to cancel booking');
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    const openFeedbackModal = async (booking: Booking) => {
        setSelectedBooking(booking);
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('therapist_feedback')
                .select('*')
                .eq('booking_id', booking.id)
                .single();

            if (data) {
                setExistingFeedback(data);
                setRating(data.rating);
                setComment(data.comment);
                setIsEditMode(true);
            } else {
                setExistingFeedback(null);
                setRating(5);
                setComment('');
                setIsEditMode(false);
            }
            setFeedbackModalOpen(true);
        } catch (err) {
            console.error('Error fetching existing feedback:', err);
            setExistingFeedback(null);
            setRating(5);
            setComment('');
            setIsEditMode(false);
            setFeedbackModalOpen(true);
        } finally {
            setLoading(false);
        }
    };

    const submitFeedback = async () => {
        if (!selectedBooking || !user) return;
        setSubmittingFeedback(true);
        try {
            if (isEditMode && existingFeedback) {
                if (existingFeedback.edit_count >= 1) {
                    alert('Review can only be edited once.');
                    return;
                }

                const { error } = await supabase
                    .from('therapist_feedback')
                    .update({
                        rating,
                        comment,
                        previous_rating: existingFeedback.rating,
                        previous_comment: existingFeedback.comment,
                        edit_count: 1,
                        edited_at: new Date().toISOString()
                    })
                    .eq('id', existingFeedback.id);

                if (error) throw error;
                alert('Review updated successfully!');
            } else {
                const { error } = await supabase
                    .from('therapist_feedback')
                    .insert({
                        booking_id: selectedBooking.id,
                        user_id: user.id,
                        therapist_id: selectedBooking.therapist_id,
                        rating,
                        comment
                    });
                if (error) throw error;
                alert('Thank you for your feedback!');
            }

            setFeedbackModalOpen(false);
            setComment('');
            setRating(5);
        } catch (err) {
            console.error('Error submitting feedback:', err);
            alert('Failed to submit feedback');
        } finally {
            setSubmittingFeedback(false);
        }
    };

    const currentBookings = bookings
        .filter(b => b.status === 'pending' || b.status === 'confirmed')
        .sort((a, b) => new Date(a.booking_date + 'T' + a.booking_time).getTime() - new Date(b.booking_date + 'T' + b.booking_time).getTime());
    const pastBookings = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled');
    const completedBookings = pastBookings.filter(b => b.status === 'completed');

    // Calculate total amount spent on successful (completed) massage sessions
    const totalAmountSpent = completedBookings.reduce((sum, booking) => {
        return sum + (booking.services?.price || 0);
    }, 0);

    // Get member since date
    const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently';

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-amber-100 text-amber-700';
            case 'confirmed': return 'bg-emerald-100 text-emerald-700';
            case 'completed': return 'bg-blue-100 text-blue-700';
            case 'cancelled': return 'bg-rose-100 text-rose-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const renderBookingCard = (booking: Booking) => (
        <div key={booking.id} className="bg-white rounded-2xl border border-gold/10 p-6 hover:shadow-xl hover:border-gold/20 transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-serif text-xl text-charcoal mb-1 group-hover:text-gold transition-colors">{booking.services?.title || 'Service'}</h3>
                    <p className="text-sm text-gold italic">with {booking.therapists?.name || 'Any Specialist'}</p>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${getStatusColor(booking.status)}`}>{booking.status}</span>
            </div>
            <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-charcoal/70">
                    <Calendar size={16} className="text-gold" />
                    <span className="text-sm">{new Date(booking.booking_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2 text-charcoal/70">
                    <Clock size={16} className="text-gold" />
                    <span className="text-sm">{formatTimeTo12h(booking.booking_time)}</span>
                    {booking.services?.duration && (
                        <span className="text-xs text-charcoal/40 ml-2">({booking.services.duration} min)</span>
                    )}
                </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gold/10">
                <div className="flex items-center gap-4">
                    <div className="text-xs text-charcoal/50">Booked {new Date(booking.created_at).toLocaleDateString()}</div>
                    {booking.services?.price && (
                        <div className="flex items-center gap-1 bg-gold/10 px-2 py-1 rounded-full">
                            <DollarSign size={12} className="text-gold" />
                            <span className="text-xs font-bold text-gold">₱{booking.services.price.toLocaleString()}</span>
                        </div>
                    )}
                </div>
                {booking.status === 'pending' && (
                    <button onClick={() => cancelBooking(booking.id)} className="text-rose-600 hover:text-rose-700 text-sm font-medium flex items-center gap-1 hover:bg-rose-50 px-3 py-1.5 rounded-full transition-all">
                        <XCircle size={16} /> Cancel
                    </button>
                )}
                {booking.status === 'completed' && (
                    <button
                        onClick={() => openFeedbackModal(booking)}
                        className="text-gold hover:text-gold-dark text-sm font-bold flex items-center gap-2 bg-gold/10 px-4 py-2 rounded-full transition-all border border-gold/20"
                    >
                        <Star size={16} fill="currentColor" />
                        Rate Therapist
                    </button>
                )}
            </div>
        </div>
    );

    const BookingCountdown: React.FC<{ booking: Booking }> = ({ booking }) => {
        const [timeLeft, setTimeLeft] = useState({
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0
        });

        useEffect(() => {
            const calculate = () => {
                const now = new Date().getTime();
                const target = new Date(booking.booking_date + 'T' + (booking.booking_time.length === 5 ? booking.booking_time : booking.booking_time.substring(0, 5))).getTime();
                const difference = target - now;

                if (difference > 0) {
                    setTimeLeft({
                        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                        minutes: Math.floor((difference / 1000 / 60) % 60),
                        seconds: Math.floor((difference / 1000) % 60)
                    });
                } else {
                    setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                }
            };

            calculate();
            const timer = setInterval(calculate, 1000);
            return () => clearInterval(timer);
        }, [booking]);

        return (
            <div className="bg-white rounded-2xl p-6 border border-gold/10 shadow-sm relative overflow-hidden group mb-4">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-gold/10 transition-all duration-700" />
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
                            <Clock className="text-gold animate-pulse" size={24} />
                        </div>
                        <div>
                            <h3 className="font-serif text-xl text-charcoal">Your Next Massage</h3>
                            <p className="text-xs text-charcoal/50 uppercase font-bold tracking-widest mt-1">
                                {booking.services?.title}
                            </p>
                            <p className="text-[10px] text-gold/60 mt-1 uppercase tracking-widest font-bold">
                                This is the time remaining before the scheduled massage
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        {[
                            { label: 'Days', value: timeLeft.days },
                            { label: 'Hours', value: timeLeft.hours },
                            { label: 'Mins', value: timeLeft.minutes },
                            { label: 'Secs', value: timeLeft.seconds }
                        ].map((time, i) => (
                            <div key={i} className="text-center min-w-[50px] md:min-w-[60px]">
                                <p className="text-2xl md:text-3xl font-serif text-gold leading-none">{time.value.toString().padStart(2, '0')}</p>
                                <p className="text-[9px] uppercase font-black tracking-widest text-charcoal/40 mt-1">{time.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const GuestRegistrationBanner = () => (
        <div className="bg-gradient-to-r from-charcoal to-charcoal-light rounded-2xl p-8 mb-8 relative overflow-hidden shadow-2xl group border border-gold/30">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 group-hover:bg-gold/20 transition-all duration-1000" />
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-gold/20 p-2 rounded-lg">
                            <Sparkles className="text-gold" size={20} />
                        </div>
                        <span className="text-gold text-xs font-black uppercase tracking-[0.3em]">Unlock Your Full Journey</span>
                    </div>
                    <h3 className="font-serif text-3xl text-white mb-3 leading-tight">Elevate Your Experience</h3>
                    <p className="text-white/60 text-sm max-w-xl leading-relaxed">
                        Create an account to preserve your total booking history, earn exclusive rewards, and enjoy faster bookings across all your devices. Your current guest bookings will be instantly linked to your new profile.
                    </p>
                </div>
                <button
                    onClick={() => navigate('/')}
                    className="bg-gold hover:bg-gold-dark text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest transition-all shadow-[0_10px_30px_rgba(197,160,89,0.3)] hover:shadow-gold/40 transform hover:-translate-y-1 flex items-center gap-2 group"
                >
                    <User size={18} />
                    <span>Create Free Account</span>
                </button>
            </div>
        </div>
    );

    if (authLoading) {
        return <LoadingScreen message="Restoring your session" />;
    }

    /* 
    REVISION: Dashboard is now viewable by guests to see their "Persistent Device" bookings.
    */
    /*
    if (!user) {
        return (
            <div className="min-h-screen bg-cream flex items-center justify-center">
                <div className="text-center">
                    <p className="text-charcoal/60 mb-4">Please sign in to view your dashboard</p>
                    <button onClick={() => navigate('/')} className="bg-gold text-white px-6 py-3 rounded-full font-bold">Return Home</button>
                </div>
            </div>
        );
    }
    */

    return (
        <div className="min-h-screen bg-[#F9F7F2]">
            <header className="bg-white border-b border-gold/10 px-6 py-6 font-sans">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 bg-gold hover:bg-gold-dark text-white px-8 py-3.5 rounded-full transition-all shadow-lg hover:shadow-gold/30 font-bold uppercase tracking-widest text-[11px] transform hover:-translate-x-1"
                    >
                        <ArrowLeft size={18} />
                        <span>Return to Home</span>
                    </button>
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <p className="text-xl font-serif text-charcoal text-center md:text-left">
                            Welcome, <span className="text-gold italic">{profile?.full_name || user?.email || 'Guest'}</span>
                        </p>
                        {user ? (
                            <button
                                onClick={handleSignOut}
                                className="flex items-center gap-2 text-rose-600 hover:text-rose-700 transition-colors font-bold uppercase tracking-widest text-[10px] md:border-l md:border-gold/20 md:pl-6"
                            >
                                <LogOut size={16} />
                                <span>Sign Out</span>
                            </button>
                        ) : (
                            <button
                                onClick={() => navigate('/')}
                                className="flex items-center gap-2 text-gold hover:text-gold-dark transition-colors font-bold uppercase tracking-widest text-[10px] md:border-l md:border-gold/20 md:pl-6"
                            >
                                <User size={16} />
                                <span>Sign In</span>
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-12">
                {/* Member Info Banner - Animated */}
                <div ref={bannerRef} className="bg-gradient-to-r from-gold/10 via-gold/5 to-transparent rounded-2xl p-6 mb-8 border border-gold/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center shadow-lg ring-4 ring-gold/20">
                                <User className="text-white" size={28} />
                            </div>
                            <div>
                                <h2 className="font-serif text-2xl text-charcoal">{profile?.full_name || 'Valued Guest'}</h2>
                                <div className="flex items-center gap-2 text-sm text-charcoal/60">
                                    <Award size={14} className="text-gold" />
                                    <span>Member since {memberSince}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => navigate('/')}
                                className="flex items-center gap-2 bg-gold hover:bg-gold-dark text-white px-6 py-3 rounded-full transition-all shadow-md hover:shadow-lg font-bold uppercase tracking-widest text-[10px]"
                            >
                                <Logo className="h-4 w-4" color="white" />
                                <span>Book New Treatment</span>
                            </button>
                        </div>
                    </div>
                </div>

                {currentBookings.length > 0 && (
                    <div className="mb-8 fade-up-item">
                        {currentBookings.map((booking) => (
                            <BookingCountdown key={booking.id} booking={booking} />
                        ))}
                    </div>
                )}

                {/* Registration Reminder for Guests */}
                {!user && <GuestRegistrationBanner />}

                {/* Stats Grid - Improved */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8" ref={statsRef}>
                    <div className="bg-white p-5 rounded-xl border border-gold/10 hover:shadow-md transition-all group hover:-translate-y-1">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                                <Clock3 className="text-amber-600" size={22} />
                            </div>
                            <div>
                                <p className="text-3xl font-serif text-charcoal">{currentBookings.length}</p>
                                <p className="text-xs uppercase tracking-widest text-charcoal/60">Active</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-gold/10 hover:shadow-md transition-all group hover:-translate-y-1">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                                <CheckCircle2 className="text-emerald-600" size={22} />
                            </div>
                            <div>
                                <p className="text-3xl font-serif text-charcoal">{completedBookings.length}</p>
                                <p className="text-xs uppercase tracking-widest text-charcoal/60">Completed</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-gold/10 hover:shadow-md transition-all group hover:-translate-y-1">
                        <div className="flex items-center gap-3">
                            <Logo className="h-6 w-6" color="#997B3D" />
                            <div>
                                <p className="text-3xl font-serif text-charcoal">{bookings.length}</p>
                                <p className="text-xs uppercase tracking-widest text-charcoal/60">Total</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-gold to-gold-dark p-5 rounded-xl shadow-lg hover:shadow-xl transition-all group hover:-translate-y-1 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700"></div>
                        <div className="flex items-center gap-3 relative z-10">
                            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                <DollarSign className="text-white" size={22} />
                            </div>
                            <div>
                                <p className="text-3xl font-serif text-white">₱{totalAmountSpent.toLocaleString()}</p>
                                <p className="text-xs uppercase tracking-widest text-white/80">Total Spent</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <button
                        onClick={() => navigate('/')}
                        className="bg-white p-4 rounded-xl border border-gold/10 hover:border-gold/30 hover:shadow-md transition-all flex items-center gap-4 group"
                    >
                        <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-all">
                            <Calendar className="text-gold" size={20} />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-charcoal text-sm">Schedule Appointment</p>
                            <p className="text-xs text-charcoal/50">Book your next relaxation session</p>
                        </div>
                        <TrendingUp size={16} className="text-gold/40 ml-auto group-hover:text-gold transition-all" />
                    </button>
                    <a
                        href="tel:+639123456789"
                        className="bg-white p-4 rounded-xl border border-gold/10 hover:border-gold/30 hover:shadow-md transition-all flex items-center gap-4 group"
                    >
                        <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-all">
                            <Phone className="text-emerald-600" size={20} />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-charcoal text-sm">Call Us</p>
                            <p className="text-xs text-charcoal/50">Speak with our staff directly</p>
                        </div>
                    </a>
                    <a
                        href="https://maps.google.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white p-4 rounded-xl border border-gold/10 hover:border-gold/30 hover:shadow-md transition-all flex items-center gap-4 group"
                    >
                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-all">
                            <MapPin className="text-blue-600" size={20} />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-charcoal text-sm">Find Us</p>
                            <p className="text-xs text-charcoal/50">Get directions to our spa</p>
                        </div>
                    </a>
                </div>

                {/* Bookings Section Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <h2 className="font-serif text-2xl text-charcoal">Your Bookings</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('current')}
                            className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-widest transition-all ${activeTab === 'current' ? 'bg-gold text-white shadow-md' : 'bg-white text-charcoal/60 hover:bg-gold/10 border border-gold/10'}`}
                        >
                            Current ({currentBookings.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('past')}
                            className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'past' ? 'bg-gold text-white shadow-md' : 'bg-white text-charcoal/60 hover:bg-gold/10 border border-gold/10'}`}
                        >
                            <History size={14} />
                            Past ({pastBookings.length})
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gold/20 border-t-gold" />
                        <p className="text-charcoal/40 mt-4 italic">Loading your treatments...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {activeTab === 'current' ? (
                            currentBookings.length === 0 ? (
                                <div className="col-span-full bg-white rounded-2xl border border-gold/10 text-center py-16 px-8">
                                    <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6">
                                        <Logo className="h-8 w-8" color="#997B3D" />
                                    </div>
                                    <h3 className="font-serif text-xl text-charcoal mb-2">No Active Bookings</h3>
                                    <p className="text-charcoal/50 mb-6 max-w-sm mx-auto">Ready for some relaxation? Book your next treatment and let us take care of you.</p>
                                    <button onClick={() => navigate('/')} className="bg-gradient-to-r from-gold to-gold-dark text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest hover:shadow-lg transition-all">
                                        <Logo className="h-4 w-4 inline mr-2" color="white" />
                                        Book a Treatment
                                    </button>
                                </div>
                            ) : (
                                currentBookings.map(renderBookingCard)
                            )
                        ) : (
                            pastBookings.length === 0 ? (
                                <div className="col-span-full bg-white rounded-2xl border border-gold/10 text-center py-16 px-8">
                                    <div className="w-20 h-20 rounded-full bg-charcoal/5 flex items-center justify-center mx-auto mb-6">
                                        <History className="text-charcoal/30" size={32} />
                                    </div>
                                    <h3 className="font-serif text-xl text-charcoal mb-2">No Past Bookings</h3>
                                    <p className="text-charcoal/50 max-w-sm mx-auto">Your completed and cancelled bookings will appear here.</p>
                                </div>
                            ) : (
                                pastBookings.map(renderBookingCard)
                            )
                        )}
                    </div>
                )}
            </main>

            {/* Feedback Modal */}
            {feedbackModalOpen && selectedBooking && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm" onClick={() => setFeedbackModalOpen(false)} />
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
                        <div className="bg-gradient-to-r from-gold to-gold-dark p-6 text-white text-center">
                            <h3 className="font-serif text-2xl mb-1">Rate Your Experience</h3>
                            <p className="text-white/80 text-xs uppercase tracking-widest font-bold">with {selectedBooking.therapists.name}</p>
                        </div>

                        <div className="p-8">
                            {isEditMode && existingFeedback?.edit_count >= 1 && (
                                <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700 italic">
                                    This review has already been edited and is now read-only.
                                </div>
                            )}

                            <div className="flex justify-center gap-2 mb-8">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <button
                                        key={s}
                                        disabled={isEditMode && existingFeedback?.edit_count >= 1}
                                        onClick={() => setRating(s)}
                                        className={`transition-all ${s <= rating ? 'text-gold scale-110' : 'text-gold/20'} disabled:opacity-50`}
                                    >
                                        <Star size={32} fill={s <= rating ? 'currentColor' : 'none'} />
                                    </button>
                                ))}
                            </div>

                            <div className="mb-6">
                                <label className="block text-[10px] uppercase tracking-widest font-black text-charcoal/40 mb-2">Your Feedback</label>
                                <textarea
                                    disabled={isEditMode && existingFeedback?.edit_count >= 1}
                                    className="w-full bg-cream/50 border border-gold/10 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-gold/20 min-h-[120px] disabled:opacity-50"
                                    placeholder="Tell us about your massage session..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setFeedbackModalOpen(false)}
                                    className="flex-1 py-4 text-xs font-bold uppercase tracking-widest text-charcoal/40 hover:text-charcoal transition-all"
                                >
                                    Cancel
                                </button>
                                {!(isEditMode && existingFeedback?.edit_count >= 1) && (
                                    <button
                                        onClick={submitFeedback}
                                        disabled={submittingFeedback}
                                        className="flex-1 bg-gold hover:bg-gold-dark text-white py-4 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg transition-all disabled:opacity-50"
                                    >
                                        {submittingFeedback ? 'Submitting...' : isEditMode ? 'Update Review' : 'Submit Review'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes scale-in {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-scale-in {
                    animation: scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}} />
        </div>
    );
};

export default UserDashboard;
