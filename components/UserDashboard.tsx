
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
    History
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
    const { user, profile, signOut, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'current' | 'past'>('current');

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
        <div key={booking.id} className="bg-white rounded-xl border border-gold/10 p-6 hover:shadow-lg transition-all">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="font-serif text-xl text-charcoal mb-1">{booking.services?.title || 'Service'}</h3>
                    <p className="text-sm text-gold italic">with {booking.therapists?.name || 'Any Specialist'}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${getStatusColor(booking.status)}`}>{booking.status}</span>
            </div>
            <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-charcoal/70">
                    <Calendar size={16} className="text-gold" />
                    <span className="text-sm">{new Date(booking.booking_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2 text-charcoal/70">
                    <Clock size={16} className="text-gold" />
                    <span className="text-sm">{booking.booking_time}</span>
                </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gold/10">
                <div className="text-xs text-charcoal/50">Booked {new Date(booking.created_at).toLocaleDateString()}</div>
                {booking.status === 'pending' && (
                    <button onClick={() => cancelBooking(booking.id)} className="text-rose-600 hover:text-rose-700 text-sm font-medium flex items-center gap-1">
                        <XCircle size={16} /> Cancel
                    </button>
                )}
            </div>
        </div>
    );

    if (authLoading) {
        return (
            <div className="min-h-screen bg-cream flex items-center justify-center">
                <div className="text-center p-8">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gold/20 border-t-gold mb-4" />
                    <p className="font-serif text-2xl text-charcoal mb-2">Restoring your session...</p>
                    <p className="text-sm text-charcoal/40 mb-8 max-w-xs mx-auto italic">This usually takes a few seconds.</p>
                    <div className="pt-8 border-t border-gold/10">
                        <button onClick={() => { localStorage.clear(); sessionStorage.clear(); window.location.href = '/'; }} className="text-gold text-xs font-bold uppercase tracking-widest hover:text-gold-dark transition-all border-b border-gold/30 pb-1">Stuck? Click here to Reset & Fix</button>
                    </div>
                </div>
            </div>
        );
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
                        className="flex items-center gap-2 bg-gold/5 hover:bg-gold/10 text-gold px-5 py-2.5 rounded-full transition-all border border-gold/10 font-bold uppercase tracking-widest text-[10px]"
                    >
                        <ArrowLeft size={16} />
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white p-6 rounded-xl border border-gold/10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center"><Clock3 className="text-gold" size={20} /></div>
                            <div>
                                <p className="text-2xl font-serif text-charcoal">{currentBookings.length}</p>
                                <p className="text-xs uppercase tracking-widest text-charcoal/60">Active</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gold/10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center"><CheckCircle2 className="text-emerald-600" size={20} /></div>
                            <div>
                                <p className="text-2xl font-serif text-charcoal">{pastBookings.filter(b => b.status === 'completed').length}</p>
                                <p className="text-xs uppercase tracking-widest text-charcoal/60">Completed</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gold/10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center"><Sparkles className="text-gold" size={20} /></div>
                            <div>
                                <p className="text-2xl font-serif text-charcoal">{bookings.length}</p>
                                <p className="text-xs uppercase tracking-widest text-charcoal/60">Total Treatments</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 mb-8 border-b border-gold/10">
                    <button onClick={() => setActiveTab('current')} className={`pb-4 px-2 font-bold uppercase tracking-widest text-sm transition-all relative ${activeTab === 'current' ? 'text-gold' : 'text-charcoal/40 hover:text-charcoal/60'}`}>
                        Current Bookings
                        {activeTab === 'current' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />}
                    </button>
                    <button onClick={() => setActiveTab('past')} className={`pb-4 px-2 font-bold uppercase tracking-widest text-sm transition-all relative ${activeTab === 'past' ? 'text-gold' : 'text-charcoal/40 hover:text-charcoal/60'}`}>
                        <History size={16} className="inline mr-2" />
                        Past Bookings
                        {activeTab === 'past' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />}
                    </button>
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
                                <div className="col-span-full text-center py-16">
                                    <Sparkles className="text-gold/20 mx-auto mb-4" size={48} />
                                    <p className="text-charcoal/40 italic mb-4">No active bookings</p>
                                    <button onClick={() => navigate('/')} className="bg-gold text-white px-6 py-3 rounded-full font-bold uppercase tracking-widest hover:bg-gold-dark transition-all">Book a Treatment</button>
                                </div>
                            ) : (
                                currentBookings.map(renderBookingCard)
                            )
                        ) : (
                            pastBookings.length === 0 ? (
                                <div className="col-span-full text-center py-16">
                                    <History className="text-charcoal/20 mx-auto mb-4" size={48} />
                                    <p className="text-charcoal/40 italic">No past bookings yet</p>
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
