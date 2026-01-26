import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Calendar,
    Clock,
    User,
    CheckCircle2,
    XCircle,
    Clock3,
    Search,
    ChevronDown,
    LayoutDashboard,
    ClipboardList,
    Users,
    Settings,
    LogOut,
    ArrowLeft,
    Shield,
    ChevronRight,
    Sparkles
} from 'lucide-react';

interface Booking {
    id: string;
    user_email: string;
    guest_name?: string;
    guest_email?: string;
    guest_phone?: string;
    booking_date: string;
    booking_time: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    services: { title: string };
    therapists: { name: string };
    created_at: string;
}

import SelectionGrid from './SelectionGrid';

const AdminDashboard: React.FC = () => {
    const { user, role, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [therapists, setTherapists] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Manual Booking State
    const [showManualBooking, setShowManualBooking] = useState(false);
    const [services, setServices] = useState<any[]>([]);
    const [manualBookingData, setManualBookingData] = useState({
        guest_name: '',
        guest_email: '',
        guest_phone: '',
        service_id: '',
        therapist_id: '',
        date: '',
        time: ''
    });

    useEffect(() => {
        const checkAdmin = async () => {
            console.log("AdminDashboard: Checking access...", { user: !!user, role, authLoading });

            if (authLoading) return;

            if (!user) {
                console.log("AdminDashboard: No user found, redirecting...");
                navigate('/');
                return;
            }

            if (role !== 'admin') {
                // Check if profile is still being fetched (role null but user exists)
                if (role === null) {
                    console.log("AdminDashboard: User exists but role is null, waiting...");
                    // Give it a bit more time before giving up
                    const timeout = setTimeout(() => {
                        if (role !== 'admin') {
                            console.log("AdminDashboard: Still not admin after wait, redirecting...");
                            navigate('/');
                        }
                    }, 2000);
                    return () => clearTimeout(timeout);
                } else {
                    console.log("AdminDashboard: Role is not admin, redirecting...", role);
                    navigate('/');
                }
            }
        };

        checkAdmin();
    }, [user, role, authLoading, navigate]);

    useEffect(() => {
        if (showManualBooking) {
            fetchServices();
            if (therapists.length === 0) fetchTherapists();
        }
    }, [showManualBooking]);

    useEffect(() => {
        if (role === 'admin') {
            if (activeTab === 'dashboard' || activeTab === 'bookings') {
                fetchBookings();
            } else if (activeTab === 'therapists') {
                fetchTherapists();
            }
        }
    }, [activeTab, role]);

    const fetchBookings = async () => {
        setLoading(true);
        console.log("AdminDashboard: Fetching bookings...");
        try {
            const { data, error } = await supabase
                .from('bookings')
                .select(`
                    *,
                    services (title),
                    therapists (name)
                `)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("AdminDashboard: Fetch error:", error);
                throw error;
            }

            console.log("AdminDashboard: Found bookings count:", data?.length || 0);
            if (data) setBookings(data as any);
        } catch (err) {
            console.error('Error fetching bookings:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchTherapists = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.from('therapists').select('*');
            if (error) throw error;
            if (data) setTherapists(data);
        } catch (err) {
            console.error('Error fetching therapists:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('bookings')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;
            fetchBookings();
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    const filteredBookings = bookings.filter(b => {
        const matchesFilter = filter === 'all' || b.status === filter;

        const search = searchTerm.toLowerCase();
        const email = (b.user_email || '').toLowerCase();
        const guestName = (b.guest_name || '').toLowerCase();
        const serviceTitle = (b.services?.title || '').toLowerCase();

        const matchesSearch = email.includes(search) ||
            guestName.includes(search) ||
            serviceTitle.includes(search);

        return matchesFilter && matchesSearch;
    });

    const stats = {
        total: bookings.length,
        pending: bookings.filter(b => b.status === 'pending').length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        completed: bookings.filter(b => b.status === 'completed').length,
    };

    const fetchServices = async () => {
        const { data } = await supabase.from('services').select('*').order('title');
        if (data) {
            const processedServices = data.map(service => ({
                ...service,
                image_url: service.title === 'Shiatsu Massage'
                    ? 'https://images.unsplash.com/photo-1611077544192-fa35438177e7?q=80&w=2070'
                    : service.image_url
            }));
            setServices(processedServices);
        }
    };

    const handleManualBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.from('bookings').insert([{
                user_id: null,
                guest_name: manualBookingData.guest_name,
                guest_email: manualBookingData.guest_email || null,
                guest_phone: manualBookingData.guest_phone,
                service_id: manualBookingData.service_id,
                therapist_id: manualBookingData.therapist_id || null,
                booking_date: manualBookingData.date,
                booking_time: manualBookingData.time,
                status: 'confirmed',
                user_email: manualBookingData.guest_email || 'Walk-in Client'
            }]);

            if (error) throw error;
            alert('Guest booking created successfully!');
            setShowManualBooking(false);
            await fetchBookings(); // Ensure this is awaited
            setManualBookingData({
                guest_name: '', guest_email: '', guest_phone: '',
                service_id: '', therapist_id: '', date: '', time: ''
            });
        } catch (err: any) {
            console.error("Manual booking error:", err);
            alert("Failed to create booking: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-[#F9F7F2] flex items-center justify-center">
                <div className="text-center">
                    <Shield className="w-12 h-12 text-gold animate-pulse mx-auto mb-4" />
                    <p className="font-serif text-xl text-charcoal">Validating credentials...</p>
                </div>
            </div>
        );
    }

    if (!user || role !== 'admin') {
        return null; // Will redirect via useEffect
    }

    const renderManualBookingModal = () => (
        showManualBooking && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/80 backdrop-blur-sm">
                <div className="bg-white w-full max-w-lg rounded-2xl p-8 shadow-2xl overflow-hidden animate-fade-in relative">
                    <button
                        onClick={() => setShowManualBooking(false)}
                        className="absolute top-4 right-4 text-charcoal/40 hover:text-gold"
                    >
                        <XCircle size={24} />
                    </button>
                    <h2 className="font-serif text-2xl text-charcoal mb-6">New Guest Reservation</h2>

                    <form onSubmit={handleManualBooking} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-gold text-left block mb-1">Guest Name *</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full border border-gold/20 rounded-lg p-3 bg-cream/10"
                                    value={manualBookingData.guest_name}
                                    onChange={e => setManualBookingData({ ...manualBookingData, guest_name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-gold text-left block mb-1">Email (Optional)</label>
                                <input
                                    type="email"
                                    placeholder="For account linking"
                                    className="w-full border border-gold/20 rounded-lg p-3 bg-cream/10"
                                    value={manualBookingData.guest_email}
                                    onChange={e => setManualBookingData({ ...manualBookingData, guest_email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-gold text-left block mb-1">Phone *</label>
                                <input
                                    required
                                    type="tel"
                                    className="w-full border border-gold/20 rounded-lg p-3 bg-cream/10"
                                    value={manualBookingData.guest_phone}
                                    onChange={e => setManualBookingData({ ...manualBookingData, guest_phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="col-span-2">
                            <SelectionGrid
                                label="Select Ritual"
                                options={services.map(s => ({
                                    id: s.id,
                                    title: s.title,
                                    subtitle: s.category === 'signature' ? 'Signature Treatment' : undefined,
                                    description: s.description,
                                    imageUrl: s.image_url,
                                    price: s.price,
                                    duration: s.duration
                                }))}
                                selectedId={manualBookingData.service_id}
                                onSelect={(id) => setManualBookingData({ ...manualBookingData, service_id: id })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-gold text-left block mb-1">Therapist</label>
                                <div className="relative">
                                    <select
                                        className="w-full border border-gold/20 rounded-lg p-3 bg-white appearance-none"
                                        value={manualBookingData.therapist_id}
                                        onChange={e => setManualBookingData({ ...manualBookingData, therapist_id: e.target.value })}
                                    >
                                        <option value="">Any Specialist</option>
                                        {therapists.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gold">
                                        <ChevronDown size={14} />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-gold text-left block mb-1">Date *</label>
                                <input
                                    required
                                    type="date"
                                    className="w-full border border-gold/20 rounded-lg p-3 bg-white"
                                    value={manualBookingData.date}
                                    onChange={e => setManualBookingData({ ...manualBookingData, date: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-gold text-left block mb-1">Time *</label>
                                <input
                                    required
                                    type="time"
                                    className="w-full border border-gold/20 rounded-lg p-3 bg-white"
                                    value={manualBookingData.time}
                                    onChange={e => setManualBookingData({ ...manualBookingData, time: e.target.value })}
                                />
                            </div>
                        </div>

                        <button type="submit" className="w-full bg-gold text-white font-bold uppercase tracking-widest py-4 rounded-xl hover:bg-gold-dark transition-colors mt-4">
                            Confirm Reservation
                        </button>
                    </form>
                </div>
            </div>
        )
    );

    const renderSidebarItem = (id: string, icon: React.ReactNode, label: string) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === id
                ? 'bg-gold/10 text-gold'
                : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
        >
            {icon}
            <span className="font-medium">{label}</span>
        </button>
    );

    const renderBookingsView = () => (
        <>
            <div className="p-6 md:p-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {[
                        { label: 'Total Requests', value: stats.total, color: 'bg-white text-charcoal' },
                        { label: 'Pending', value: stats.pending, color: 'bg-amber-50 text-amber-700' },
                        { label: 'Confirmed', value: stats.confirmed, color: 'bg-emerald-50 text-emerald-700' },
                        { label: 'Finished', value: stats.completed, color: 'bg-blue-50 text-blue-700' },
                    ].map((stat, i) => (
                        <div key={i} className={`${stat.color} p-6 rounded-2xl border border-gold/10 shadow-sm`}>
                            <p className="text-xs uppercase tracking-widest font-bold opacity-70 mb-2">{stat.label}</p>
                            <p className="text-3xl font-serif">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${filter === f
                                ? 'bg-gold text-white shadow-lg shadow-gold/20'
                                : 'bg-white text-charcoal/60 border border-gold/10 hover:border-gold/30'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Bookings Table */}
                <div className="bg-white rounded-2xl border border-gold/10 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#Fdfbf7] border-b border-gold/10 font-bold text-xs uppercase tracking-widest text-charcoal/50">
                                <tr>
                                    <th className="px-6 py-4">Client</th>
                                    <th className="px-6 py-4">Service & Specialist</th>
                                    <th className="px-6 py-4">Appt. Date</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gold/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gold italic">Gathering scroll data...</td>
                                    </tr>
                                ) : filteredBookings.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-charcoal/40 italic">No rituals found matching your criteria.</td>
                                    </tr>
                                ) : (
                                    filteredBookings.map((booking) => (
                                        <tr key={booking.id} className="hover:bg-cream/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                                                        <User size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-charcoal">
                                                            {booking.guest_name ? `${booking.guest_name} (Guest)` : booking.user_email}
                                                        </p>
                                                        {booking.guest_phone && <p className="text-[10px] text-charcoal/40">{booking.guest_phone}</p>}
                                                        <p className="text-[10px] text-charcoal/40">ID: {booking.id.slice(0, 8)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-medium text-charcoal">{booking.services?.title || 'Unknown Service'}</p>
                                                <p className="text-xs text-gold font-medium italic">{booking.therapists?.name || 'Any Specialist'}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 text-charcoal">
                                                        <Calendar size={12} className="text-gold" />
                                                        <span className="text-xs">{booking.booking_date}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-charcoal/60">
                                                        <Clock size={12} className="text-gold" />
                                                        <span className="text-xs">{booking.booking_time}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${booking.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                    booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                                                        booking.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-rose-100 text-rose-700'
                                                    }`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {booking.status === 'pending' && (
                                                        <button
                                                            onClick={() => updateStatus(booking.id, 'confirmed')}
                                                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                            title="Confirm"
                                                        >
                                                            <CheckCircle2 size={18} />
                                                        </button>
                                                    )}
                                                    {booking.status !== 'cancelled' && (
                                                        <button
                                                            onClick={() => updateStatus(booking.id, 'cancelled')}
                                                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                            title="Cancel"
                                                        >
                                                            <XCircle size={18} />
                                                        </button>
                                                    )}
                                                    {booking.status === 'confirmed' && (
                                                        <button
                                                            onClick={() => updateStatus(booking.id, 'completed')}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Complete"
                                                        >
                                                            <CheckCircle2 size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );

    const renderTherapistsView = () => (
        <div className="p-6 md:p-8">
            <div className="bg-white rounded-2xl border border-gold/10 shadow-sm overflow-hidden p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-serif text-charcoal">Our Specialists</h2>
                    <button className="bg-gold text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-gold-dark transition-colors">
                        Add New
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-3 text-center py-12 text-gold italic">Loading specialists...</div>
                    ) : therapists.length === 0 ? (
                        <div className="col-span-3 text-center py-12 text-charcoal/40 italic">No therapists active.</div>
                    ) : (
                        therapists.map(t => (
                            <div key={t.id} className="bg-cream/20 border border-gold/10 p-6 rounded-xl flex items-center gap-4 hover:shadow-md transition-shadow">
                                <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center text-gold font-serif text-2xl">
                                    {t.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-charcoal">{t.name}</h3>
                                    <p className="text-xs text-gold uppercase tracking-widest mt-1">Therapist</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );

    const renderSettingsView = () => (
        <div className="p-6 md:p-8">
            <div className="bg-white rounded-2xl border border-gold/10 shadow-sm overflow-hidden p-8 max-w-2xl mx-auto">
                <h2 className="text-2xl font-serif text-charcoal mb-6">System Settings</h2>
                <div className="space-y-6">
                    <div>
                        <label className="block text-xs uppercase tracking-widest font-bold text-gold mb-2">Spa Name</label>
                        <input type="text" defaultValue="Golden Tower Spa" className="w-full bg-cream/20 border border-gold/20 p-3 rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-xs uppercase tracking-widest font-bold text-gold mb-2">Contact Email</label>
                        <input type="email" defaultValue="concierge@goldentowerspa.ph" className="w-full bg-cream/20 border border-gold/20 p-3 rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-xs uppercase tracking-widest font-bold text-gold mb-2">Booking Notification Email</label>
                        <input type="email" defaultValue="bookings@goldentowerspa.ph" className="w-full bg-cream/20 border border-gold/20 p-3 rounded-lg" />
                    </div>
                    <button className="bg-charcoal text-white px-8 py-3 rounded-lg font-bold uppercase tracking-widest hover:bg-gold transition-colors w-full">
                        Save Changes
                    </button>
                    <div className="pt-6 border-t border-gold/10 text-center">
                        <p className="text-xs text-gold font-medium italic">Database permissions are active and managed via Supabase RLS.</p>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F9F7F2] flex">
            {/* Sidebar */}
            <aside className="w-64 bg-charcoal text-white flex flex-col hidden lg:flex">
                <div className="p-8 border-b border-white/10">
                    <h2 className="font-serif text-2xl text-gold">Golden Tower</h2>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-white/50 mt-1">Management Portal</p>
                </div>
                <nav className="flex-1 p-6 space-y-2">
                    {renderSidebarItem('dashboard', <LayoutDashboard size={20} />, 'Dashboard')}
                    {renderSidebarItem('bookings', <ClipboardList size={20} />, 'Bookings')}
                    {renderSidebarItem('therapists', <Users size={20} />, 'Therapists')}
                    {renderSidebarItem('settings', <Settings size={20} />, 'Settings')}
                </nav>
                <div className="p-6 border-t border-white/10">
                    <button
                        onClick={() => window.location.href = '/'}
                        className="w-full flex items-center gap-3 px-4 py-3 text-white/60 hover:text-white transition-all"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Exit Admin</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto h-screen">
                <header className="bg-white border-b border-gold/10 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-serif text-charcoal">
                            {activeTab === 'dashboard' ? 'Dashboard Overview' :
                                activeTab === 'bookings' ? 'Booking Reservations' :
                                    activeTab === 'therapists' ? 'Specialist Management' : 'System Configuration'}
                        </h1>
                        <p className="text-sm text-charcoal/60 mt-1">Manage and monitor client rituals</p>
                    </div>

                    <div className="flex gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/30" size={18} />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-10 pr-4 py-2 border border-gold/20 rounded-xl focus:outline-none focus:border-gold text-sm w-64"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={async () => {
                                console.log("Manual refresh triggered");
                                await fetchBookings();
                                if (activeTab === 'therapists') await fetchTherapists();
                            }}
                            className="bg-white border border-gold/20 p-2 rounded-xl text-gold hover:bg-gold hover:text-white transition-all flex items-center gap-2 px-4"
                            title="Refresh Data"
                        >
                            <Clock3 size={20} />
                            <span className="text-xs font-bold uppercase tracking-widest hidden md:inline">Refresh</span>
                        </button>
                        <button
                            onClick={() => setShowManualBooking(true)}
                            className="bg-gold text-white px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-gold-dark transition-colors shadow-lg shadow-gold/20 flex items-center gap-2"
                        >
                            <ClipboardList size={16} />
                            <span>Manual Booking</span>
                        </button>
                    </div>
                </header>

                {activeTab === 'dashboard' && renderBookingsView()}
                {activeTab === 'bookings' && renderBookingsView()}
                {activeTab === 'therapists' && renderTherapistsView()}
                {activeTab === 'settings' && renderSettingsView()}
                {renderManualBookingModal()}
            </main>
        </div>
    );
};

export default AdminDashboard;
