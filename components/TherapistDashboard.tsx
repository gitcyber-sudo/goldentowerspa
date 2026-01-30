import React, { useEffect, useState, useLayoutEffect } from 'react';
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
    Clock3,
    ArrowLeft,
    Mail,
    Star,
    MessageSquare,
    UserCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from './LoadingScreen';
import Logo from './Logo';

interface Review {
    id: string;
    rating: number;
    comment: string;
    created_at: string;
    profiles: { full_name: string };
}

interface Booking {
    id: string;
    user_email: string;
    booking_date: string;
    booking_time: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    services: { title: string; duration: number };
    created_at: string;
    profiles?: { full_name: string; email: string };
}

const TherapistDashboard: React.FC = () => {
    const { user, profile, signOut } = useAuth();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [therapistInfo, setTherapistInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [activeFilter, setActiveFilter] = useState<'upcoming' | 'completed' | 'reviews' | 'profile'>('upcoming');

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            // Animate stats
            gsap.from(".dashboard-stat", {
                y: 20,
                opacity: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: "power2.out"
            });

            // Animate booking cards with fromTo to ensure visibility
            const cards = document.querySelectorAll(".booking-card");
            if (cards.length > 0) {
                gsap.fromTo(".booking-card",
                    { y: 20, opacity: 0 },
                    {
                        y: 0,
                        opacity: 1,
                        duration: 0.5,
                        stagger: 0.05,
                        delay: 0.2,
                        ease: "power2.out"
                    }
                );
            }
        });
        return () => ctx.revert();
    }, [loading, activeFilter, bookings]); // Added bookings to dependencies

    useEffect(() => {
        if (user) {
            fetchTherapistData();
        }
    }, [user]);

    const fetchTherapistData = async () => {
        setLoading(true);
        try {
            // Get therapist record linked to this user
            const { data: therapist, error: therapistError } = await supabase
                .from('therapists')
                .select('*')
                .eq('user_id', user?.id)
                .single();

            if (therapistError) {
                console.error('Not linked to therapist account:', therapistError);
                return;
            }

            setTherapistInfo(therapist);

            // Fetch bookings assigned to this therapist
            const { data, error } = await supabase
                .from('bookings')
                .select(`
    *,
    services(title, duration),
    profiles(full_name, email)
        `)
                .eq('therapist_id', therapist.id)
                .order('booking_date', { ascending: true });

            if (error) throw error;
            if (data) setBookings(data as any);

            // Fetch Reviews
            const { data: reviewData, error: reviewError } = await supabase
                .from('therapist_feedback')
                .select(`
                    *,
                    profiles(full_name)
                `)
                .eq('therapist_id', therapist.id)
                .order('created_at', { ascending: false });

            if (reviewData) setReviews(reviewData as any);

        } catch (err) {
            console.error('Error fetching therapist bookings:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    const upcomingBookings = bookings.filter(
        b => (b.status === 'pending' || b.status === 'confirmed') &&
            new Date(b.booking_date).setHours(0, 0, 0, 0) >= new Date().setHours(0, 0, 0, 0)
    );

    const completedBookings = bookings.filter(
        b => b.status === 'completed'
    );

    const todayBookings = upcomingBookings.filter(
        b => new Date(b.booking_date).toDateString() === new Date().toDateString()
    );

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
        <div
            key={booking.id}
            className="booking-card bg-white rounded-xl border border-gold/10 p-6 hover:shadow-xl hover:border-gold/30 transition-all group relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-gold/10 transition-colors"></div>

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center ring-2 ring-gold/20">
                        <User className="text-gold" size={20} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-charcoal group-hover:text-gold transition-colors">
                            {booking.profiles?.full_name || 'Guest'}
                        </h3>
                        <p className="text-xs text-charcoal/60 flex items-center gap-1">
                            <Mail size={12} />
                            {booking.user_email}
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${getStatusColor(booking.status)}`}
                    >
                        {booking.status}
                    </span>
                    {/* Focus Tag */}
                    {booking.services?.title.toLowerCase().includes('massage') && (
                        <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-gold/80 bg-gold/5 px-2 py-0.5 rounded-md border border-gold/10">
                            <Logo className="h-3 w-3" color="#997B3D" /> Focus: Relaxation
                        </span>
                    )}
                </div>
            </div>

            <div className="bg-cream/30 rounded-lg p-4 mb-3 border border-gold/5 group-hover:bg-cream/50 transition-colors relative z-10">
                <p className="font-serif text-lg text-charcoal mb-2">
                    {booking.services?.title || 'Service'}
                </p>
                <div className="flex items-center gap-4 text-sm text-charcoal/70">
                    <div className="flex items-center gap-1">
                        <Calendar size={14} className="text-gold" />
                        {new Date(booking.booking_date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                        })}
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock size={14} className="text-gold" />
                        {formatTimeTo12h(booking.booking_time)}
                    </div>
                    {booking.services?.duration && (
                        <div className="text-gold font-bold bg-white px-2 py-0.5 rounded shadow-sm">
                            {booking.services.duration} min
                        </div>
                    )}
                </div>
            </div>

            <div className="text-xs text-charcoal/40 font-medium">
                Booked {new Date(booking.created_at).toLocaleDateString()}
            </div>
        </div>
    );

    if (!user || profile?.role !== 'therapist') {
        return <LoadingScreen message="Access Denied" />;
    }

    if (!therapistInfo) {
        return <LoadingScreen message="Linking Profile..." />;
    }

    return (
        <div className="min-h-screen bg-[#F9F7F2]">
            {/* Header */}
            <header className="bg-white border-b border-gold/10 px-6 py-6">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="text-charcoal/60 hover:text-gold transition-colors"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h1 className="font-serif text-2xl text-charcoal">Therapist Portal</h1>
                            <p className="text-sm text-charcoal/60">
                                Welcome, {therapistInfo?.name}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 text-charcoal/60 hover:text-gold transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="text-sm font-medium">Sign Out</span>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-6 py-12">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="dashboard-stat bg-white p-6 rounded-xl border border-gold/10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                                <Calendar className="text-gold" size={20} />
                            </div>
                            <div>
                                <p className="text-2xl font-serif text-charcoal">{todayBookings.length}</p>
                                <p className="text-xs uppercase tracking-widest text-charcoal/60">Today</p>
                            </div>
                        </div>
                    </div>
                    <div className="dashboard-stat bg-white p-6 rounded-xl border border-gold/10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                                <Clock3 className="text-amber-600" size={20} />
                            </div>
                            <div>
                                <p className="text-2xl font-serif text-charcoal">{upcomingBookings.length}</p>
                                <p className="text-xs uppercase tracking-widest text-charcoal/60">Upcoming</p>
                            </div>
                        </div>
                    </div>
                    <div className="dashboard-stat bg-white p-6 rounded-xl border border-gold/10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                <CheckCircle2 className="text-emerald-600" size={20} />
                            </div>
                            <div>
                                <p className="text-2xl font-serif text-charcoal">{completedBookings.length}</p>
                                <p className="text-xs uppercase tracking-widest text-charcoal/60">Completed</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-8 border-b border-gold/10">
                    <button
                        onClick={() => setActiveFilter('upcoming')}
                        className={`pb-4 px-2 font-bold uppercase tracking-widest text-sm transition-all relative ${activeFilter === 'upcoming'
                            ? 'text-gold'
                            : 'text-charcoal/40 hover:text-charcoal/60'
                            }`}
                    >
                        Upcoming Sessions
                        {activeFilter === 'upcoming' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveFilter('completed')}
                        className={`pb-4 px-2 font-bold uppercase tracking-widest text-sm transition-all relative ${activeFilter === 'completed'
                            ? 'text-gold'
                            : 'text-charcoal/40 hover:text-charcoal/60'
                            }`}
                    >
                        Past Sessions
                        {activeFilter === 'completed' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveFilter('reviews')}
                        className={`pb-4 px-2 font-bold uppercase tracking-widest text-sm transition-all relative ${activeFilter === 'reviews'
                            ? 'text-gold'
                            : 'text-charcoal/40 hover:text-charcoal/60'
                            }`}
                    >
                        Reviews
                        {activeFilter === 'reviews' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveFilter('profile')}
                        className={`pb-4 px-2 font-bold uppercase tracking-widest text-sm transition-all relative ${activeFilter === 'profile'
                            ? 'text-gold'
                            : 'text-charcoal/40 hover:text-charcoal/60'
                            }`}
                    >
                        My Profile
                        {activeFilter === 'profile' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
                        )}
                    </button>
                </div>

                {/* Bookings Grid */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gold/20 border-t-gold" />
                        <p className="text-charcoal/40 mt-4 italic">Loading your schedule...</p>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {activeFilter === 'upcoming' && (
                            upcomingBookings.length === 0 ? (
                                <div className="text-center py-16">
                                    <Logo className="h-12 w-12 mx-auto mb-4 opacity-20" color="#997B3D" />
                                    <p className="text-charcoal/40 italic">No upcoming sessions scheduled</p>
                                </div>
                            ) : (
                                <>
                                    {[
                                        { title: "Morning Rituals", icon: "🌅", range: [0, 12] },
                                        { title: "Afternoon Glow", icon: "🌤️", range: [12, 17] },
                                        { title: "Evening Serenity", icon: "🌙", range: [17, 24] }
                                    ].map((bucket, i) => {
                                        const bucketBookings = upcomingBookings.filter(b => {
                                            const hour = parseInt(b.booking_time.split(':')[0]);
                                            return hour >= bucket.range[0] && hour < bucket.range[1];
                                        });

                                        if (bucketBookings.length === 0) return null;

                                        return (
                                            <div key={i} className="fade-up-item">
                                                <div className="flex items-center gap-2 mb-6 border-b border-gold/10 pb-2">
                                                    <span className="text-2xl">{bucket.icon}</span>
                                                    <h2 className="font-serif text-xl text-charcoal">{bucket.title}</h2>
                                                    <span className="ml-auto bg-gold/10 text-gold text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                        {bucketBookings.length} SESSION{bucketBookings.length > 1 ? 'S' : ''}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {bucketBookings.map(renderBookingCard)}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </>
                            )
                        )}

                        {activeFilter === 'completed' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {completedBookings.length === 0 ? (
                                    <div className="col-span-full text-center py-16">
                                        <CheckCircle2 className="text-charcoal/20 mx-auto mb-4" size={48} />
                                        <p className="text-charcoal/40 italic">No completed sessions yet</p>
                                    </div>
                                ) : (
                                    completedBookings.map(renderBookingCard)
                                )}
                            </div>
                        )}


                        {activeFilter === 'reviews' && (
                            <div className="max-w-3xl mx-auto space-y-6">
                                {reviews.length === 0 ? (
                                    <div className="text-center py-16">
                                        <MessageSquare className="text-charcoal/20 mx-auto mb-4" size={48} />
                                        <p className="text-charcoal/40 italic">No reviews yet</p>
                                    </div>
                                ) : (
                                    reviews.map(review => (
                                        <div key={review.id} className="bg-white p-6 rounded-xl border border-gold/10">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center font-serif text-gold font-bold">
                                                        {review.profiles?.full_name?.charAt(0) || 'G'}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-charcoal">{review.profiles?.full_name || 'Guest'}</p>
                                                        <p className="text-xs text-charcoal/40">{new Date(review.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 bg-gold/5 px-2 py-1 rounded-lg">
                                                    <Star size={14} className="text-gold fill-gold" />
                                                    <span className="text-sm font-bold text-gold">{review.rating}.0</span>
                                                </div>
                                            </div>
                                            <p className="text-charcoal/80 italic">"{review.comment}"</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeFilter === 'profile' && therapistInfo && (
                            <div className="max-w-3xl mx-auto">
                                <div className="bg-white rounded-2xl border border-gold/10 overflow-hidden shadow-sm">
                                    <div className="h-32 bg-charcoal relative">
                                        <div className="absolute inset-0 bg-gold/10 pattern-grid-lg opacity-20" />
                                    </div>
                                    <div className="px-8 pb-8">
                                        <div className="relative -mt-16 mb-6 flex justify-between items-end">
                                            <div className="w-32 h-32 rounded-full border-4 border-white bg-white overflow-hidden shadow-lg">
                                                {therapistInfo.image_url ? (
                                                    <img src={therapistInfo.image_url} alt={therapistInfo.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-gold/10 flex items-center justify-center text-gold">
                                                        <UserCircle size={64} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="mb-2">
                                                <div className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                    {therapistInfo.active ? 'Active Status' : 'Inactive'}
                                                </div>
                                            </div>
                                        </div>

                                        <h2 className="font-serif text-3xl text-charcoal mb-2">{therapistInfo.name}</h2>
                                        <p className="text-gold font-bold uppercase tracking-widest text-sm mb-6">{therapistInfo.specialty}</p>

                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-xs font-bold uppercase tracking-widest text-charcoal/40 mb-2">About Me</h3>
                                                <p className="text-charcoal/70 leading-relaxed">{therapistInfo.bio || 'No bio available.'}</p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 rounded-xl bg-gold/5 border border-gold/10">
                                                    <h3 className="text-xs font-bold uppercase tracking-widest text-charcoal/40 mb-1">Passcode</h3>
                                                    <p className="text-charcoal font-mono">••••••••</p>
                                                </div>
                                                <div className="p-4 rounded-xl bg-gold/5 border border-gold/10">
                                                    <h3 className="text-xs font-bold uppercase tracking-widest text-charcoal/40 mb-1">Joined</h3>
                                                    <p className="text-charcoal">{new Date(therapistInfo.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default TherapistDashboard;
