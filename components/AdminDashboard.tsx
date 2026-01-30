import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatTimeTo12h } from '../lib/utils';
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
    Shield,
    ChevronRight,
    BarChart3,
    TrendingUp,
    DollarSign,
    Eye,
    Edit3,
    X,
    Check,
    Phone,
    Mail,
    Save,
    RefreshCcw,
    Menu,
    ChevronLeft,
    PlayCircle,
    MoreVertical,
    Trash2
} from 'lucide-react';
import AnalyticsDashboard from './AnalyticsDashboard';
import RevenueDashboard from './RevenueDashboard';
import TherapistManagement from './TherapistManagement';
import ManualBookingModal from './modals/ManualBookingModal';
import EditBookingModal from './modals/EditBookingModal';

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
    services: { title: string; price: number };
    therapists?: { name: string };
    created_at: string;
}

const AdminDashboard: React.FC = () => {
    const { user, role, loading: authLoading, signOut } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [therapists, setTherapists] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Manual Booking State
    const [showManualBooking, setShowManualBooking] = useState(false);
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
    const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
    const [editFormData, setEditFormData] = useState<any>({});
    const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
    const [viewingReview, setViewingReview] = useState<any>(null);
    const [feedbacks, setFeedbacks] = useState<Record<string, any>>({});

    // Redundant auth check removed - handled by ProtectedRoute in App.tsx

    useEffect(() => {
        if (showManualBooking || editingBooking) {
            fetchServices();
            if (therapists.length === 0) fetchTherapists();
        }
    }, [showManualBooking, editingBooking]);

    useEffect(() => {
        if (activeTab === 'dashboard' || activeTab === 'bookings') {
            fetchBookings();
        } else if (activeTab === 'therapists') {
            fetchTherapists();
        }
    }, [activeTab]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('bookings')
                .select(`*, services (title, price), therapists (name)`)
                .order('created_at', { ascending: false });
            if (error) throw error;
            if (data) setBookings(data as any);

            // Fetch all feedbacks
            const { data: feedbackData } = await supabase
                .from('therapist_feedback')
                .select('*');

            if (feedbackData) {
                const feedbackMap: Record<string, any> = {};
                feedbackData.forEach(f => {
                    feedbackMap[f.booking_id] = f;
                });
                setFeedbacks(feedbackMap);
            }
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
            setActionMenuOpen(null);
            fetchBookings();
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    const fetchServices = async () => {
        const { data } = await supabase.from('services').select('*');
        if (data) {
            const sorted = [...data].sort((a, b) => {
                const aTitle = a.title.toUpperCase();
                const bTitle = b.title.toUpperCase();
                const aIsSignature = a.category === 'signature' || aTitle.includes('SIGNATURE');
                const bIsSignature = b.category === 'signature' || bTitle.includes('SIGNATURE');
                const aIsPackage = aTitle.includes('PACKAGE');
                const bIsPackage = bTitle.includes('PACKAGE');

                if (aIsSignature && !bIsSignature) return -1;
                if (!aIsSignature && bIsSignature) return 1;
                if (aIsPackage && !bIsPackage) return 1;
                if (!aIsPackage && bIsPackage) return -1;
                if (aIsPackage && bIsPackage) return aTitle.localeCompare(bTitle, undefined, { numeric: true });
                return aTitle.localeCompare(bTitle);
            });
            setServices(sorted);
        }
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
                guest_phone: manualBookingData.guest_phone || null,
                service_id: manualBookingData.service_id,
                therapist_id: manualBookingData.therapist_id,
                booking_date: manualBookingData.date,
                booking_time: manualBookingData.time,
                status: 'confirmed',
                user_email: manualBookingData.guest_email || 'Walk-in Client'
            }]);
            if (error) throw error;
            setShowManualBooking(false);
            setManualBookingData({
                guest_name: '',
                guest_email: '',
                guest_phone: '',
                service_id: '',
                therapist_id: '',
                date: '',
                time: ''
            });
            fetchBookings();
        } catch (err: any) {
            alert("Error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Edit booking functions
    const openEditModal = (booking: Booking) => {
        setEditingBooking(booking);
        setEditFormData({
            guest_name: booking.guest_name || '',
            guest_email: booking.guest_email || booking.user_email || '',
            guest_phone: booking.guest_phone || '',
            service_id: booking.service_id,
            therapist_id: booking.therapist_id || '',
            booking_date: booking.booking_date,
            booking_time: booking.booking_time,
            status: booking.status
        });
        setActionMenuOpen(null);
    };

    const handleEditBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBooking) return;

        setLoading(true);
        try {
            const { error } = await supabase.from('bookings').update({
                guest_name: editFormData.guest_name,
                guest_email: editFormData.guest_email,
                guest_phone: editFormData.guest_phone,
                service_id: editFormData.service_id,
                therapist_id: editFormData.therapist_id || null,
                booking_date: editFormData.booking_date,
                booking_time: editFormData.booking_time,
                status: editFormData.status,
                user_email: editFormData.guest_email || editingBooking.user_email
            }).eq('id', editingBooking.id);

            if (error) throw error;
            setEditingBooking(null);
            fetchBookings();
        } catch (err: any) {
            alert("Error updating booking: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const deleteBooking = async (id: string) => {
        if (!confirm("Are you sure you want to delete this booking? This action cannot be undone.")) return;

        try {
            const { error } = await supabase.from('bookings').delete().eq('id', id);
            if (error) throw error;
            setActionMenuOpen(null);
            fetchBookings();
        } catch (err: any) {
            alert("Error deleting booking: " + err.message);
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
        cancelled: bookings.filter(b => b.status === 'cancelled').length,
    };

    // Calculate revenue stats
    const revenueStats = {
        totalRevenue: bookings
            .filter(b => b.status === 'completed')
            .reduce((sum, b) => sum + (b.services?.price || 0), 0),
        pendingRevenue: bookings
            .filter(b => b.status === 'confirmed' || b.status === 'pending')
            .reduce((sum, b) => sum + (b.services?.price || 0), 0),
        todayRevenue: bookings
            .filter(b => {
                // Determine today's date in Philippine Time (PHT - UTC+8) reliably
                const phtToday = new Intl.DateTimeFormat('en-CA', {
                    timeZone: 'Asia/Manila',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                }).format(new Date());

                return b.status === 'completed' && b.booking_date === phtToday;
            })
            .reduce((sum, b) => sum + (b.services?.price || 0), 0),
    };

    const renderAssignTherapistModal = () => (
        assigningBooking && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/80 backdrop-blur-sm">
                <div className="bg-white w-full max-w-md rounded-2xl p-6 md:p-8 shadow-2xl text-center">
                    <Users className="text-gold mx-auto mb-4" size={32} />
                    <h2 className="font-serif text-xl md:text-2xl text-charcoal mb-2">Assign Specialist</h2>
                    <p className="text-sm text-charcoal/60 mt-1">Manage and monitor client treatments</p>
                    <p className="text-sm text-charcoal/60 mb-6">Select a therapist for <b>{assigningBooking.guest_name || assigningBooking.user_email}</b></p>
                    <div className="space-y-3 mb-8 max-h-[40vh] overflow-y-auto">
                        {therapists.map(t => (
                            <button key={t.id} onClick={() => updateStatus(assigningBooking.id, 'confirmed', t.id)} className="w-full p-4 border border-gold/10 rounded-xl hover:border-gold hover:bg-gold/5 flex items-center gap-4 transition-all">
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

    const renderViewReviewModal = () => (
        viewingReview && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/80 backdrop-blur-sm">
                <div className="bg-white w-full max-w-lg rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                    <div className="flex justify-between items-center mb-6 relative z-10">
                        <div>
                            <h2 className="font-serif text-2xl text-charcoal">Treatment Review</h2>
                            <p className="text-xs text-charcoal/40 uppercase font-black tracking-widest mt-1">Feedback from {viewingReview.booking.guest_name || viewingReview.booking.user_email}</p>
                        </div>
                        <button onClick={() => setViewingReview(null)} className="text-charcoal/40 hover:text-charcoal transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="space-y-6 relative z-10">
                        {/* Current Review */}
                        <div className="bg-gold/5 p-6 rounded-2xl border border-gold/10">
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <Star key={s} size={16} className={s <= viewingReview.feedback.rating ? 'text-gold fill-gold' : 'text-gold/20'} />
                                    ))}
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gold/60">Current Review</span>
                            </div>
                            <p className="text-charcoal leading-relaxed italic">"{viewingReview.feedback.comment}"</p>
                            <div className="mt-4 flex justify-between items-end">
                                <p className="text-[10px] text-charcoal/40">Therapist: <span className="font-bold">{viewingReview.booking.therapists?.name}</span></p>
                                <p className="text-[10px] text-charcoal/40">{new Date(viewingReview.feedback.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>

                        {/* History if edited */}
                        {viewingReview.feedback.edit_count > 0 && (
                            <div className="opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="h-[1px] flex-1 bg-gold/10" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-charcoal/40">Original Review (Past)</span>
                                    <div className="h-[1px] flex-1 bg-gold/10" />
                                </div>
                                <div className="p-5 border border-dashed border-gold/20 rounded-xl bg-cream/20">
                                    <div className="flex gap-1 mb-2">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <Star key={s} size={12} className={s <= viewingReview.feedback.previous_rating ? 'text-gold fill-gold' : 'text-gold/10'} />
                                        ))}
                                    </div>
                                    <p className="text-sm text-charcoal/60 italic">"{viewingReview.feedback.previous_comment}"</p>
                                    <p className="text-[9px] text-charcoal/30 mt-3">Modified on {new Date(viewingReview.feedback.edited_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        )}

                        <button onClick={() => setViewingReview(null)} className="w-full py-4 bg-charcoal text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-black transition-colors">Close Review</button>
                    </div>
                </div>
            </div>
        )
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-amber-100 text-amber-700';
            case 'confirmed': return 'bg-blue-100 text-blue-700';
            case 'completed': return 'bg-emerald-100 text-emerald-700';
            case 'cancelled': return 'bg-rose-100 text-rose-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const renderBookingsView = () => (
        <div className="p-4 md:p-6 lg:p-8">
            {/* Quick Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6 mb-6 md:mb-8">
                {[
                    { label: 'Total', value: stats.total, color: 'bg-white', icon: ClipboardList },
                    { label: 'Pending', value: stats.pending, color: 'bg-amber-50', icon: Clock3 },
                    { label: 'Confirmed', value: stats.confirmed, color: 'bg-blue-50', icon: CheckCircle2 },
                    { label: 'Finished', value: stats.completed, color: 'bg-emerald-50', icon: Check },
                    { label: 'Cancelled', value: stats.cancelled, color: 'bg-rose-50', icon: XCircle, hideOnMobile: true }
                ].map((stat, i) => (
                    <div key={i} className={`${stat.color} ${stat.hideOnMobile ? 'hidden lg:block' : ''} p-4 md:p-6 rounded-xl md:rounded-2xl border border-gold/10 shadow-sm`}>
                        <div className="flex items-center gap-2 mb-2">
                            <stat.icon size={16} className="text-gold/60" />
                            <p className="text-[10px] md:text-xs uppercase font-bold opacity-70">{stat.label}</p>
                        </div>
                        <p className="text-2xl md:text-3xl font-serif">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Revenue Summary - Enhanced Glassmorphism */}
            <div className="bg-gradient-to-br from-charcoal to-charcoal/90 rounded-2xl p-8 mb-8 border border-white/10 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-gold/20 transition-all duration-1000" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />

                <div className="flex items-center gap-3 mb-8 relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center border border-gold/30">
                        <DollarSign className="text-gold" size={20} />
                    </div>
                    <h3 className="font-serif text-xl text-white tracking-wide">Revenue Highlight</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative z-10">
                    <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-colors">
                        <p className="text-gold/60 text-[10px] uppercase font-bold tracking-[0.2em] mb-2">Today</p>
                        <p className="text-3xl font-serif text-white">₱{revenueStats.todayRevenue.toLocaleString()}</p>
                        <div className="w-12 h-1 bg-gold/30 mt-4 rounded-full" />
                    </div>
                    <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-colors">
                        <p className="text-emerald-400/60 text-[10px] uppercase font-bold tracking-[0.2em] mb-2">Completed</p>
                        <p className="text-3xl font-serif text-white">₱{revenueStats.totalRevenue.toLocaleString()}</p>
                        <div className="w-12 h-1 bg-emerald-500/30 mt-4 rounded-full" />
                    </div>
                    <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-colors">
                        <p className="text-blue-400/60 text-[10px] uppercase font-bold tracking-[0.2em] mb-2">Pending</p>
                        <p className="text-3xl font-serif text-white">₱{revenueStats.pendingRevenue.toLocaleString()}</p>
                        <div className="w-12 h-1 bg-blue-500/30 mt-4 rounded-full" />
                    </div>
                </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2 mb-4 md:mb-6">
                {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${filter === f ? 'bg-gold text-white' : 'bg-white border border-gold/20 text-charcoal/60 hover:border-gold'}`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Bookings List - Mobile Card View / Desktop Table View */}
            <div className="bg-white rounded-xl md:rounded-2xl border border-gold/10 shadow-sm glass-panel">
                {/* Desktop Table View */}
                <div className="hidden md:block">
                    <table className="w-full text-left">
                        <thead className="bg-[#Fdfbf7] border-b border-gold/10 text-xs uppercase font-bold text-charcoal/50">
                            <tr>
                                <th className="px-6 py-4">Client</th>
                                <th className="px-6 py-4">Service</th>
                                <th className="px-6 py-4">Date & Time</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gold/5">
                            {filteredBookings.map(b => (
                                <tr key={b.id} className="hover:bg-cream/30">
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-semibold">{b.guest_name || b.user_email}</p>
                                        {b.guest_phone && <p className="text-xs text-charcoal/40">{b.guest_phone}</p>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm">{b.services?.title}</p>
                                        <p className="text-xs text-gold italic">{b.therapists?.name || 'Any Specialist'}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm">{b.booking_date}</p>
                                        <p className="text-xs text-charcoal/50">{formatTimeTo12h(b.booking_time)}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusColor(b.status)}`}>
                                            {b.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {/* Quick Actions */}
                                            {b.status === 'pending' && (
                                                <button
                                                    onClick={() => !b.therapist_id ? setAssigningBooking(b) : updateStatus(b.id, 'confirmed')}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Confirm Booking"
                                                >
                                                    <CheckCircle2 size={18} />
                                                </button>
                                            )}
                                            {b.status === 'confirmed' && (
                                                <button
                                                    onClick={() => updateStatus(b.id, 'completed')}
                                                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                    title="Mark as Completed"
                                                >
                                                    <Check size={18} />
                                                </button>
                                            )}
                                            {(b.status === 'pending' || b.status === 'confirmed') && (
                                                <button
                                                    onClick={() => openEditModal(b)}
                                                    className="p-2 text-gold hover:bg-gold/10 rounded-lg transition-colors"
                                                    title="Edit Booking"
                                                >
                                                    <Edit3 size={18} />
                                                </button>
                                            )}
                                            {b.status === 'completed' && feedbacks[b.id] && (
                                                <button
                                                    onClick={() => setViewingReview({ booking: b, feedback: feedbacks[b.id] })}
                                                    className="p-2 text-gold hover:bg-gold/10 rounded-lg transition-colors"
                                                    title="View Review"
                                                >
                                                    <Star size={18} fill={feedbacks[b.id].rating >= 4 ? 'currentColor' : 'none'} />
                                                </button>
                                            )}
                                            {/* More Actions Menu */}
                                            <div className="relative">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActionMenuOpen(actionMenuOpen === b.id ? null : b.id);
                                                    }}
                                                    className="p-2 text-charcoal/40 hover:bg-charcoal/5 rounded-lg transition-colors relative z-10"
                                                >
                                                    <MoreVertical size={18} />
                                                </button>
                                                {actionMenuOpen === b.id && (
                                                    <div className="absolute right-0 top-full mt-1 bg-white border border-gold/10 rounded-xl shadow-xl py-2 z-[100] min-w-[180px]">
                                                        {b.status !== 'completed' && b.status !== 'cancelled' && (
                                                            <>
                                                                <button
                                                                    onClick={() => { setAssigningBooking(b); setActionMenuOpen(null); }}
                                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gold/5 flex items-center gap-2"
                                                                >
                                                                    <Users size={14} /> Assign Therapist
                                                                </button>
                                                                <button
                                                                    onClick={() => updateStatus(b.id, 'cancelled')}
                                                                    className="w-full px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                                                                >
                                                                    <XCircle size={14} /> Cancel Booking
                                                                </button>
                                                            </>
                                                        )}
                                                        {b.status === 'cancelled' && (
                                                            <button
                                                                onClick={() => updateStatus(b.id, 'pending')}
                                                                className="w-full px-4 py-2 text-left text-sm hover:bg-gold/5 flex items-center gap-2"
                                                            >
                                                                <RefreshCcw size={14} /> Restore Booking
                                                            </button>
                                                        )}
                                                        <hr className="my-2 border-gold/10" />
                                                        <button
                                                            onClick={() => deleteBooking(b.id)}
                                                            className="w-full px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                                                        >
                                                            <Trash2 size={14} /> Delete Permanently
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-gold/10">
                    {filteredBookings.map(b => (
                        <div key={b.id} className="p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <p className="font-semibold text-charcoal">{b.guest_name || b.user_email}</p>
                                    <p className="text-xs text-charcoal/50">{b.services?.title}</p>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusColor(b.status)}`}>
                                    {b.status}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-charcoal/60 mb-3">
                                <span className="flex items-center gap-1"><Calendar size={12} /> {b.booking_date}</span>
                                <span className="flex items-center gap-1"><Clock size={12} /> {formatTimeTo12h(b.booking_time)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gold mb-3">
                                <User size={12} />
                                <span>{b.therapists?.name || 'Any Specialist'}</span>
                            </div>
                            {/* Mobile Action Buttons */}
                            <div className="flex gap-2 flex-wrap">
                                {b.status === 'pending' && (
                                    <button
                                        onClick={() => !b.therapist_id ? setAssigningBooking(b) : updateStatus(b.id, 'confirmed')}
                                        className="flex-1 min-w-[100px] px-3 py-2 bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                                    >
                                        <CheckCircle2 size={14} /> Confirm
                                    </button>
                                )}
                                {b.status === 'confirmed' && (
                                    <button
                                        onClick={() => updateStatus(b.id, 'completed')}
                                        className="flex-1 min-w-[100px] px-3 py-2 bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                                    >
                                        <Check size={14} /> Complete
                                    </button>
                                )}
                                {(b.status === 'pending' || b.status === 'confirmed') && (
                                    <>
                                        <button
                                            onClick={() => openEditModal(b)}
                                            className="px-3 py-2 bg-gold/10 text-gold rounded-lg text-xs font-bold flex items-center gap-1"
                                        >
                                            <Edit3 size={14} /> Edit
                                        </button>
                                        <button
                                            onClick={() => updateStatus(b.id, 'cancelled')}
                                            className="px-3 py-2 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold flex items-center gap-1"
                                        >
                                            <XCircle size={14} /> Cancel
                                        </button>
                                    </>
                                )}
                                {b.status === 'completed' && feedbacks[b.id] && (
                                    <button
                                        onClick={() => setViewingReview({ booking: b, feedback: feedbacks[b.id] })}
                                        className="px-3 py-2 bg-gold/10 text-gold rounded-lg text-xs font-bold flex items-center gap-1"
                                    >
                                        <Star size={14} fill="currentColor" /> Review
                                    </button>
                                )}
                                {b.status === 'cancelled' && (
                                    <button
                                        onClick={() => updateStatus(b.id, 'pending')}
                                        className="px-3 py-2 bg-charcoal/10 text-charcoal rounded-lg text-xs font-bold flex items-center gap-1"
                                    >
                                        <RefreshCcw size={14} /> Restore
                                    </button>
                                )}
                                {/* Delete button - always visible on mobile */}
                                <button
                                    onClick={() => deleteBooking(b.id)}
                                    className="px-3 py-2 bg-rose-100 text-rose-600 rounded-lg text-xs font-bold flex items-center gap-1"
                                >
                                    <Trash2 size={14} /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                    {filteredBookings.length === 0 && (
                        <div className="p-8 text-center text-charcoal/40">
                            <ClipboardList size={40} className="mx-auto mb-3 opacity-40" />
                            <p>No bookings found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderSidebarItem = (id: string, icon: React.ReactNode, label: string) => (
        <button
            onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === id ? 'bg-gold/10 text-gold' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
        >
            {icon}{label}
        </button>
    );

    const getPageTitle = () => {
        switch (activeTab) {
            case 'dashboard': return 'Overview';
            case 'bookings': return 'Bookings';
            case 'therapists': return 'Specialists';
            case 'website-analytics': return 'Website Analytics';
            case 'revenue': return 'Revenue Analytics';
            default: return 'Admin Panel';
        }
    };

    return (
        <div className="min-h-screen bg-[#F9F7F2] flex">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-charcoal/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-charcoal text-white flex flex-col z-50 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="p-6 lg:p-8 border-b border-white/10 flex items-center justify-between">
                    <h2 className="font-serif text-xl lg:text-2xl text-gold">Golden Tower</h2>
                    <button className="lg:hidden text-white/60" onClick={() => setSidebarOpen(false)}>
                        <X size={24} />
                    </button>
                </div>
                <nav className="flex-1 p-4 lg:p-6 space-y-2">
                    {renderSidebarItem('dashboard', <LayoutDashboard size={20} />, 'Dashboard')}
                    {renderSidebarItem('bookings', <ClipboardList size={20} />, 'Bookings')}
                    {renderSidebarItem('therapists', <Users size={20} />, 'Specialists')}
                    <div className="pt-4 pb-2">
                        <p className="text-xs uppercase text-white/30 font-bold tracking-widest px-4">Analytics</p>
                    </div>
                    {renderSidebarItem('website-analytics', <Eye size={20} />, 'Website Visits')}
                    {renderSidebarItem('revenue', <TrendingUp size={20} />, 'Revenue')}
                </nav>
                <div className="p-4 lg:p-6 border-t border-white/10">
                    <button onClick={async () => { await signOut(); navigate('/'); }} className="w-full flex items-center gap-3 px-4 py-3 text-rose-400 hover:bg-white/5 rounded-xl transition-all">
                        <LogOut size={20} />Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto h-screen">
                {/* Mobile-Friendly Header */}
                <header className="bg-white border-b border-gold/10 p-4 lg:p-6 sticky top-0 z-30">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <button
                                className="lg:hidden p-2 -ml-2 text-charcoal"
                                onClick={() => setSidebarOpen(true)}
                            >
                                <Menu size={24} />
                            </button>
                            <h1 className="text-xl lg:text-2xl font-serif">{getPageTitle()}</h1>
                        </div>
                        <div className="flex items-center gap-2 lg:gap-3">
                            <div className="relative hidden sm:block">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/30" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="pl-9 pr-4 py-2 border rounded-xl w-40 lg:w-auto text-sm"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button onClick={() => fetchBookings()} className="p-2 border rounded-xl hover:bg-gold/5 transition-colors" title="Refresh">
                                <RefreshCcw size={18} className="text-charcoal/60" />
                            </button>
                            <button onClick={() => setShowManualBooking(true)} className="bg-gold text-white px-3 lg:px-4 py-2 rounded-xl text-xs lg:text-sm font-bold flex items-center gap-1 lg:gap-2">
                                <span>Manual Booking</span>
                            </button>
                        </div>
                    </div>
                    {/* Mobile Search */}
                    <div className="sm:hidden mt-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/30" size={16} />
                            <input
                                type="text"
                                placeholder="Search bookings..."
                                className="pl-9 pr-4 py-2 border rounded-xl w-full text-sm"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                {(activeTab === 'dashboard' || activeTab === 'bookings') && renderBookingsView()}
                {activeTab === 'website-analytics' && <AnalyticsDashboard />}
                {activeTab === 'revenue' && <RevenueDashboard bookings={bookings} />}
                {activeTab === 'therapists' && <TherapistManagement />}

                {/* Modals */}
                <ManualBookingModal
                    isOpen={showManualBooking}
                    onClose={() => setShowManualBooking(false)}
                    onSubmit={handleManualBooking}
                    data={manualBookingData}
                    setData={setManualBookingData}
                    services={services}
                    therapists={therapists}
                />
                <EditBookingModal
                    isOpen={!!editingBooking}
                    onClose={() => setEditingBooking(null)}
                    onSubmit={handleEditBooking}
                    data={editFormData}
                    setData={setEditFormData}
                    services={services}
                    therapists={therapists}
                />
                {renderAssignTherapistModal()}
                {renderViewReviewModal()}
            </main>

            {/* Click outside to close action menu */}
            {actionMenuOpen && (
                <div className="fixed inset-0 z-0" onClick={() => setActionMenuOpen(null)} />
            )}
        </div>
    );
};

export default AdminDashboard;
