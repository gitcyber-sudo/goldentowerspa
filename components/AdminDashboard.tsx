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
    service_id: string;
    therapist_id?: string;
    booking_date: string;
    booking_time: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    services: { title: string };
    therapists?: { name: string };
    created_at: string;
}

import SelectionGrid from './SelectionGrid';

const AdminDashboard: React.FC = () => {
    const { user, role, loading: authLoading, signOut } = useAuth();
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

    const [assigningBooking, setAssigningBooking] = useState<Booking | null>(null);

    useEffect(() => {
        const checkAdmin = async () => {
            if (authLoading) return;
            if (!user) {
                navigate('/');
                return;
            }
            if ((role as string) !== 'admin') {
                if (role === null) {
                    const timeout = setTimeout(() => {
                        if ((role as string) !== 'admin') navigate('/');
                    }, 2000);
                    return () => clearTimeout(timeout);
                } else {
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
        if ((role as string) === 'admin') {
            if (activeTab === 'dashboard' || activeTab === 'bookings') {
                fetchBookings();
            } else if (activeTab === 'therapists') {
                fetchTherapists();
            }
        }
    }, [activeTab, role]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('bookings')
                .select(`*, services (title), therapists (name)`)
                .order('created_at', { ascending: false });
            if (error) throw error;
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

    const updateStatus = async (id: string, newStatus: string, therapistId?: string) => {
        try {
            const updateData: any = { status: newStatus };
            if (therapistId) updateData.therapist_id = therapistId;
            const { error } = await supabase.from('bookings').update(updateData).eq('id', id);
            if (error) throw error;
            setAssigningBooking(null);
            fetchBookings();
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    const fetchServices = async () => {
        const { data } = await supabase.from('services').select('*').order('title');
        if (data) setServices(data);
    };

    const handleManualBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualBookingData.service_id) {
            alert("RITUAL REQUIRED: Please select a massage type.");
            return;
        }
        if (!manualBookingData.therapist_id) {
            alert("SPECIALIST REQUIRED: Please assign an available therapist.");
            return;
        }
        setLoading(true);
        try {
            const { error } = await supabase.from('bookings').insert([{
                user_id: null,
                guest_name: manualBookingData.guest_name,
                guest_email: manualBookingData.guest_email || null,
                guest_phone: manualBookingData.guest_phone,
                service_id: manualBookingData.service_id,
                therapist_id: manualBookingData.therapist_id,
                booking_date: manualBookingData.date,
                booking_time: manualBookingData.time,
                status: 'confirmed',
                user_email: manualBookingData.guest_email || 'Walk-in Client'
            }]);
            if (error) throw error;
            setShowManualBooking(false);
            fetchBookings();
        } catch (err: any) {
            alert("Error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const filteredBookings = bookings.filter(b => {
        const matchesFilter = filter === 'all' || b.status === filter;
        const search = searchTerm.toLowerCase();
        return matchesFilter && (
            (b.user_email || '').toLowerCase().includes(search) ||
            (b.guest_name || '').toLowerCase().includes(search) ||
            (b.services?.title || '').toLowerCase().includes(search)
        );
    });

    const stats = {
        total: bookings.length,
        pending: bookings.filter(b => b.status === 'pending').length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        completed: bookings.filter(b => b.status === 'completed').length,
    };

    const renderManualBookingModal = () => (
        showManualBooking && (
            <div className="fixed inset-0 z-50 overflow-y-auto flex justify-center items-start md:items-center p-6 bg-charcoal/80 backdrop-blur-sm">
                <div className="bg-white w-full max-w-lg rounded-2xl p-8 shadow-2xl relative my-auto">
                    <button onClick={() => setShowManualBooking(false)} className="absolute top-4 right-4 text-charcoal/40 hover:text-gold"><XCircle size={24} /></button>
                    <h2 className="font-serif text-2xl text-charcoal mb-6">New Guest Reservation</h2>
                    <form onSubmit={handleManualBooking} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-gold block mb-1">Guest Name *</label>
                                <input required type="text" className="w-full border border-gold/20 rounded-lg p-3" value={manualBookingData.guest_name} onChange={e => setManualBookingData({ ...manualBookingData, guest_name: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-gold block mb-1">Email</label>
                                <input type="email" className="w-full border border-gold/20 rounded-lg p-3" value={manualBookingData.guest_email} onChange={e => setManualBookingData({ ...manualBookingData, guest_email: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-gold block mb-1">Phone *</label>
                                <input required type="tel" className="w-full border border-gold/20 rounded-lg p-3" value={manualBookingData.guest_phone} onChange={e => setManualBookingData({ ...manualBookingData, guest_phone: e.target.value })} />
                            </div>
                        </div>
                        <SelectionGrid
                            label="Select Ritual"
                            options={services.map(s => ({ id: s.id, title: s.title, subtitle: s.category, imageUrl: s.image_url, price: s.price, duration: s.duration }))}
                            selectedId={manualBookingData.service_id}
                            onSelect={(id) => setManualBookingData({ ...manualBookingData, service_id: id })}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-gold block mb-1">Assigned Specialist *</label>
                                <select required className="w-full border border-gold/20 rounded-lg p-3" value={manualBookingData.therapist_id} onChange={e => setManualBookingData({ ...manualBookingData, therapist_id: e.target.value })}>
                                    <option value="">-- Choose Specialist --</option>
                                    {therapists.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                            <input required type="date" className="border border-gold/20 rounded-lg p-3" value={manualBookingData.date} onChange={e => setManualBookingData({ ...manualBookingData, date: e.target.value })} />
                            <input required type="time" className="border border-gold/20 rounded-lg p-3" value={manualBookingData.time} onChange={e => setManualBookingData({ ...manualBookingData, time: e.target.value })} />
                        </div>
                        <button type="submit" className="w-full bg-gold text-white font-bold uppercase tracking-widest py-4 rounded-xl mt-4">Confirm Reservation</button>
                    </form>
                </div>
            </div>
        )
    );

    const renderAssignTherapistModal = () => (
        assigningBooking && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/80 backdrop-blur-sm">
                <div className="bg-white w-full max-w-md rounded-2xl p-8 shadow-2xl text-center">
                    <Users className="text-gold mx-auto mb-4" size={32} />
                    <h2 className="font-serif text-2xl text-charcoal mb-2">Assign Specialist</h2>
                    <p className="text-sm text-charcoal/60 mb-6">Select a therapist for <b>{assigningBooking.user_email}</b></p>
                    <div className="space-y-3 mb-8 max-h-[40vh] overflow-y-auto">
                        {therapists.map(t => (
                            <button key={t.id} onClick={() => updateStatus(assigningBooking.id, 'confirmed', t.id)} className="w-full p-4 border border-gold/10 rounded-xl hover:border-gold hover:bg-gold/5 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center font-serif text-gold">{t.name.charAt(0)}</div>
                                <div className="text-left"><p className="font-bold text-charcoal">{t.name}</p></div>
                            </button>
                        ))}
                    </div>
                    <button onClick={() => setAssigningBooking(null)} className="text-charcoal/40 text-xs font-bold uppercase tracking-widest">Cancel</button>
                </div>
            </div>
        )
    );

    const renderBookingsView = () => (
        <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[{ label: 'Total', value: stats.total, color: 'bg-white' }, { label: 'Pending', value: stats.pending, color: 'bg-amber-50' }, { label: 'Confirmed', value: stats.confirmed, color: 'bg-emerald-50' }, { label: 'Finished', value: stats.completed, color: 'bg-blue-50' }].map((stat, i) => (
                    <div key={i} className={`${stat.color} p-6 rounded-2xl border border-gold/10 shadow-sm`}>
                        <p className="text-xs uppercase font-bold opacity-70 mb-2">{stat.label}</p>
                        <p className="text-3xl font-serif">{stat.value}</p>
                    </div>
                ))}
            </div>
            <div className="bg-white rounded-2xl border border-gold/10 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-[#Fdfbf7] border-b border-gold/10 text-xs uppercase font-bold text-charcoal/50">
                        <tr><th className="px-6 py-4">Client</th><th className="px-6 py-4">Service</th><th className="px-6 py-4">Date</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Actions</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gold/5">
                        {filteredBookings.map(b => (
                            <tr key={b.id} className="hover:bg-cream/30">
                                <td className="px-6 py-4"><p className="text-sm font-semibold">{b.guest_name || b.user_email}</p></td>
                                <td className="px-6 py-4"><p className="text-sm">{b.services?.title}</p><p className="text-xs text-gold italic">{b.therapists?.name || 'Any Specialist'}</p></td>
                                <td className="px-6 py-4"><p className="text-xs">{b.booking_date} at {b.booking_time}</p></td>
                                <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${b.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{b.status}</span></td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        {b.status === 'pending' && <button onClick={() => !b.therapist_id ? setAssigningBooking(b) : updateStatus(b.id, 'confirmed')} className="text-emerald-600"><CheckCircle2 size={18} /></button>}
                                        {b.status !== 'cancelled' && <button onClick={() => updateStatus(b.id, 'cancelled')} className="text-rose-600"><XCircle size={18} /></button>}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderSidebarItem = (id: string, icon: React.ReactNode, label: string) => (
        <button onClick={() => setActiveTab(id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${activeTab === id ? 'bg-gold/10 text-gold' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>{icon}{label}</button>
    );

    return (
        <div className="min-h-screen bg-[#F9F7F2] flex">
            <aside className="w-64 bg-charcoal text-white flex flex-col hidden lg:flex border-r border-gold/10">
                <div className="p-8 border-b border-white/10"><h2 className="font-serif text-2xl text-gold">Golden Tower</h2></div>
                <nav className="flex-1 p-6 space-y-2">
                    {renderSidebarItem('dashboard', <LayoutDashboard size={20} />, 'Dashboard')}
                    {renderSidebarItem('bookings', <ClipboardList size={20} />, 'Bookings')}
                </nav>
                <div className="p-6 border-t border-white/10">
                    <button onClick={() => navigate('/')} className="w-full flex items-center gap-3 px-4 py-3 text-white/60"><ArrowLeft size={20} />Back to Site</button>
                    <button onClick={async () => { await signOut(); navigate('/'); }} className="w-full flex items-center gap-3 px-4 py-3 text-rose-400"><LogOut size={20} />Sign Out</button>
                </div>
            </aside>
            <main className="flex-1 overflow-y-auto h-screen">
                <header className="bg-white border-b border-gold/10 p-6 flex justify-between items-center">
                    <h1 className="text-2xl font-serif">{activeTab === 'dashboard' ? 'Overview' : 'Rituals'}</h1>
                    <div className="flex gap-3">
                        <input type="text" placeholder="Search..." className="px-4 py-2 border rounded-xl" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        <button onClick={() => fetchBookings()} className="p-2 border rounded-xl"><Clock3 /></button>
                        <button onClick={() => setShowManualBooking(true)} className="bg-gold text-white px-4 py-2 rounded-xl">Manual Booking</button>
                    </div>
                </header>
                {activeTab === 'dashboard' && renderBookingsView()}
                {activeTab === 'bookings' && renderBookingsView()}
                {renderManualBookingModal()}
                {renderAssignTherapistModal()}
            </main>
        </div>
    );
};

export default AdminDashboard;
