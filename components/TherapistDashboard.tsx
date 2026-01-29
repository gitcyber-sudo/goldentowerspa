
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import {
    Calendar,
    Clock,
    LogOut,
    User,
    CheckCircle2,
    Clock3,
    ArrowLeft,
    Mail,
    Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from './LoadingScreen';

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
    const [activeFilter, setActiveFilter] = useState<'upcoming' | 'completed'>('upcoming');

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
                    services (title, duration),
                    profiles (full_name, email)
                `)
                .eq('therapist_id', therapist.id)
                .order('booking_date', { ascending: true });

            if (error) throw error;
            if (data) setBookings(data as any);
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
            new Date(b.booking_date) >= new Date()
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
            className="bg-white rounded-xl border border-gold/10 p-6 hover:shadow-lg transition-all"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
                        <User className="text-gold" size={20} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-charcoal">
                            {booking.profiles?.full_name || 'Guest'}
                        </h3>
                        <p className="text-xs text-charcoal/60 flex items-center gap-1">
                            <Mail size={12} />
                            {booking.user_email}
                        </p>
                    </div>
                </div>
                <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${getStatusColor(booking.status)}`}
                >
                    {booking.status}
                </span>
            </div>

            <div className="bg-cream/30 rounded-lg p-4 mb-3">
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
                        {booking.booking_time}
                    </div>
                    {booking.services?.duration && (
                        <div className="text-gold">
                            {booking.services.duration} min
                        </div>
                    )}
                </div>
            </div>

            <div className="text-xs text-charcoal/50">
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
                    <div className="bg-white p-6 rounded-xl border border-gold/10">
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
                    <div className="bg-white p-6 rounded-xl border border-gold/10">
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
                    <div className="bg-white p-6 rounded-xl border border-gold/10">
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
                </div>

                {/* Bookings Grid */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gold/20 border-t-gold" />
                        <p className="text-charcoal/40 mt-4 italic">Loading your schedule...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {activeFilter === 'upcoming' ? (
                            upcomingBookings.length === 0 ? (
                                <div className="col-span-full text-center py-16">
                                    <Sparkles className="text-gold/20 mx-auto mb-4" size={48} />
                                    <p className="text-charcoal/40 italic">No upcoming sessions scheduled</p>
                                </div>
                            ) : (
                                upcomingBookings.map(renderBookingCard)
                            )
                        ) : (
                            completedBookings.length === 0 ? (
                                <div className="col-span-full text-center py-16">
                                    <CheckCircle2 className="text-charcoal/20 mx-auto mb-4" size={48} />
                                    <p className="text-charcoal/40 italic">No completed sessions yet</p>
                                </div>
                            ) : (
                                completedBookings.map(renderBookingCard)
                            )
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default TherapistDashboard;
