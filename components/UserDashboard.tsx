
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
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

interface Booking {
    id: string;
    booking_date: string;
    booking_time: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    services: { title: string; duration: number; price: number };
    therapists: { name: string };
    created_at: string;
}

const UserDashboard: React.FC = () => {
    const { user, profile, role, signOut, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'current' | 'past'>('current');

    // Data fetching logic
    useEffect(() => {
        if (!authLoading && user) {
            fetchBookings();
        } else if (!authLoading && !user) {
            setLoading(false);
        }
    }, [user, authLoading]);

    const fetchBookings = async (retryCount = 0) => {
        setLoading(true);
        try {
            console.log("Dashboard: Fetching for user:", user?.id);
            const { data, error } = await supabase
                .from('bookings')
                .select(`
                    *,
                    services (title, duration, price),
                    therapists (name)
                `)
                .eq('user_id', user?.id)
                .order('booking_date', { ascending: false });

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

    const currentBookings = bookings.filter(b => b.status === 'pending' || b.status === 'confirmed');
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
                    <span className="text-sm">{booking.booking_time}</span>
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
            </div>
        </div>
    );

    if (authLoading) {
        return <LoadingScreen message="Restoring your session" />;
    }

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
                        <p className="text-xl font-serif text-charcoal text-center md:text-left">Welcome, <span className="text-gold italic">{profile?.full_name || user.email}</span></p>
                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-2 text-rose-600 hover:text-rose-700 transition-colors font-bold uppercase tracking-widest text-[10px] md:border-l md:border-gold/20 md:pl-6"
                        >
                            <LogOut size={16} />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-12">
                {/* Member Info Banner */}
                <div className="bg-gradient-to-r from-gold/10 via-gold/5 to-transparent rounded-2xl p-6 mb-8 border border-gold/10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center shadow-lg">
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
                                <Sparkles size={16} />
                                <span>Book New Treatment</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Grid - Improved */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-5 rounded-xl border border-gold/10 hover:shadow-md transition-all">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
                                <Clock3 className="text-amber-600" size={22} />
                            </div>
                            <div>
                                <p className="text-3xl font-serif text-charcoal">{currentBookings.length}</p>
                                <p className="text-xs uppercase tracking-widest text-charcoal/60">Active</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-gold/10 hover:shadow-md transition-all">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                                <CheckCircle2 className="text-emerald-600" size={22} />
                            </div>
                            <div>
                                <p className="text-3xl font-serif text-charcoal">{completedBookings.length}</p>
                                <p className="text-xs uppercase tracking-widest text-charcoal/60">Completed</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-gold/10 hover:shadow-md transition-all">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
                                <Sparkles className="text-gold" size={22} />
                            </div>
                            <div>
                                <p className="text-3xl font-serif text-charcoal">{bookings.length}</p>
                                <p className="text-xs uppercase tracking-widest text-charcoal/60">Total</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-gold to-gold-dark p-5 rounded-xl shadow-lg hover:shadow-xl transition-all">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
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
                                        <Sparkles className="text-gold" size={32} />
                                    </div>
                                    <h3 className="font-serif text-xl text-charcoal mb-2">No Active Bookings</h3>
                                    <p className="text-charcoal/50 mb-6 max-w-sm mx-auto">Ready for some relaxation? Book your next treatment and let us take care of you.</p>
                                    <button onClick={() => navigate('/')} className="bg-gradient-to-r from-gold to-gold-dark text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest hover:shadow-lg transition-all">
                                        <Sparkles size={16} className="inline mr-2" />
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
        </div>
    );
};

export default UserDashboard;
