import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import {
    Users, UserCheck, UserX, Search, ChevronRight, X, Phone, Mail,
    Smartphone, Monitor, Tablet, Calendar, Clock, Star, Shield,
    Globe, Activity, ChevronDown, ArrowUpDown, Wifi
} from 'lucide-react';

interface ClientDevice {
    id: string;
    device_model: string;
    os_name: string;
    os_version: string;
    browser: string;
    browser_version: string;
    device_type: string;
    screen_resolution: string;
    app_context: string;
    first_seen: string;
    last_seen: string;
    session_count: number;
}

interface ClientRecord {
    type: 'registered' | 'unregistered';
    id: string; // user_id or visitor_id
    name: string;
    email: string | null;
    phone: string | null;
    role?: string;
    created_at: string;
    bookingCount: number;
    lastBookingDate: string | null;
    lastActive: string | null;
    devices: ClientDevice[];
}

const ClientIntelligence: React.FC = () => {
    const [clients, setClients] = useState<ClientRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'registered' | 'unregistered'>('all');
    const [sortBy, setSortBy] = useState<'recent' | 'bookings' | 'name'>('recent');
    const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [clientBookings, setClientBookings] = useState<any[]>([]);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        setLoading(true);
        try {
            // 1. Get all registered users (non-admin, non-therapist)
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, email, full_name, role, created_at')
                .in('role', ['user']);

            // 2. Get all bookings to build client records
            const { data: bookings } = await supabase
                .from('bookings')
                .select('user_id, visitor_id, guest_name, guest_phone, guest_email, booking_date, status, created_at')
                .order('booking_date', { ascending: false });

            // 3. Get all devices
            const { data: devices } = await supabase
                .from('client_devices')
                .select('*')
                .order('last_seen', { ascending: false });

            // 4. Get visitors for last_active
            const { data: visitors } = await supabase
                .from('visitors')
                .select('visitor_id, user_id, last_visit, visit_count, first_visit');

            // Build registered client records
            const registeredMap = new Map<string, ClientRecord>();
            (profiles || []).forEach(p => {
                const userBookings = (bookings || []).filter(b => b.user_id === p.id);
                const userDevices = (devices || []).filter(d => d.user_id === p.id);
                const userVisitors = (visitors || []).filter(v => v.user_id === p.id);

                // Get most recent activity across all sources
                const lastVisit = userVisitors.length > 0
                    ? Math.max(...userVisitors.map(v => new Date(v.last_visit || 0).getTime()))
                    : 0;
                const lastDeviceSeen = userDevices.length > 0
                    ? Math.max(...userDevices.map(d => new Date(d.last_seen || 0).getTime()))
                    : 0;
                const lastBooking = userBookings.length > 0
                    ? Math.max(...userBookings.map(b => new Date(b.created_at || 0).getTime()))
                    : 0;
                const profileCreated = new Date(p.created_at).getTime();

                const maxActive = Math.max(lastVisit, lastDeviceSeen, lastBooking, profileCreated);

                registeredMap.set(p.id, {
                    type: 'registered',
                    id: p.id,
                    name: p.full_name || p.email || 'Unknown',
                    email: p.email,
                    phone: userBookings.find(b => b.guest_phone)?.guest_phone || null,
                    role: p.role,
                    created_at: p.created_at,
                    bookingCount: userBookings.length,
                    lastBookingDate: userBookings[0]?.booking_date || null,
                    lastActive: new Date(maxActive).toISOString(),
                    devices: userDevices as ClientDevice[]
                });
            });

            // Build unregistered guest records (grouped by visitor_id)
            const guestMap = new Map<string, ClientRecord>();
            (bookings || []).filter(b => !b.user_id && b.visitor_id).forEach(b => {
                const existing = guestMap.get(b.visitor_id);
                if (existing) {
                    existing.bookingCount++;
                    if (!existing.name || existing.name === 'Guest') existing.name = b.guest_name || 'Guest';
                    if (!existing.phone) existing.phone = b.guest_phone || null;
                    if (!existing.email) existing.email = b.guest_email || null;
                    if (!existing.lastBookingDate || b.booking_date > existing.lastBookingDate) {
                        existing.lastBookingDate = b.booking_date;
                    }
                    // Update lastActive for guest
                    const lastActiveTime = Math.max(
                        new Date(existing.lastActive || 0).getTime(),
                        new Date(b.created_at).getTime()
                    );
                    existing.lastActive = new Date(lastActiveTime).toISOString();
                } else {
                    const guestDevices = (devices || []).filter(d => d.visitor_id === b.visitor_id && !d.user_id);
                    const visitor = (visitors || []).find(v => v.visitor_id === b.visitor_id);

                    const lastVisit = visitor ? new Date(visitor.last_visit || 0).getTime() : 0;
                    const lastDeviceSeen = guestDevices.length > 0
                        ? Math.max(...guestDevices.map(d => new Date(d.last_seen || 0).getTime()))
                        : 0;
                    const lastBooking = new Date(b.created_at).getTime();

                    const maxActive = Math.max(lastVisit, lastDeviceSeen, lastBooking);

                    guestMap.set(b.visitor_id, {
                        type: 'unregistered',
                        id: b.visitor_id,
                        name: b.guest_name || 'Guest',
                        email: b.guest_email || null,
                        phone: b.guest_phone || null,
                        created_at: b.created_at,
                        bookingCount: 1,
                        lastBookingDate: b.booking_date,
                        lastActive: new Date(maxActive).toISOString(),
                        devices: guestDevices as ClientDevice[]
                    });
                }
            });

            const allClients = [...registeredMap.values(), ...guestMap.values()];
            setClients(allClients);
        } catch (err) {
            console.error('Error fetching clients:', err);
        } finally {
            setLoading(false);
        }
    };

    const openClientDrawer = async (client: ClientRecord) => {
        setSelectedClient(client);
        setDrawerOpen(true);

        // Fetch full booking history for this client
        let query = supabase
            .from('bookings')
            .select('*, services(title, price), therapists(name)')
            .order('booking_date', { ascending: false });

        if (client.type === 'registered') {
            query = query.eq('user_id', client.id);
        } else {
            query = query.eq('visitor_id', client.id);
        }

        const { data } = await query;
        setClientBookings(data || []);
    };

    const closeDrawer = () => {
        setDrawerOpen(false);
        setTimeout(() => { setSelectedClient(null); setClientBookings([]); }, 300);
    };

    // ─── Filtering & Sorting ───
    const filteredClients = useMemo(() => {
        let result = clients;

        if (filterType !== 'all') {
            result = result.filter(c => c.type === filterType);
        }

        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            result = result.filter(c =>
                (c.name || '').toLowerCase().includes(search) ||
                (c.email || '').toLowerCase().includes(search) ||
                (c.phone || '').includes(search) ||
                (c.id || '').toLowerCase().includes(search)
            );
        }

        result.sort((a, b) => {
            switch (sortBy) {
                case 'recent':
                    return new Date(b.lastActive || 0).getTime() - new Date(a.lastActive || 0).getTime();
                case 'bookings':
                    return b.bookingCount - a.bookingCount;
                case 'name':
                    return (a.name || '').localeCompare(b.name || '');
                default:
                    return 0;
            }
        });

        return result;
    }, [clients, filterType, searchTerm, sortBy]);

    const stats = useMemo(() => ({
        total: clients.length,
        registered: clients.filter(c => c.type === 'registered').length,
        unregistered: clients.filter(c => c.type === 'unregistered').length,
        activeToday: clients.filter(c => {
            if (!c.lastActive) return false;
            return new Date(c.lastActive).toDateString() === new Date().toDateString();
        }).length
    }), [clients]);

    const getRelativeTime = (dateStr: string | null) => {
        if (!dateStr) return 'Never';
        const date = new Date(dateStr);
        if (isNaN(date.getTime()) || date.getTime() === 0) return 'Never';

        const diff = Date.now() - date.getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 30) return `${days}d ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getDeviceIcon = (type: string) => {
        switch (type) {
            case 'mobile': return <Smartphone size={14} />;
            case 'tablet': return <Tablet size={14} />;
            default: return <Monitor size={14} />;
        }
    };

    const getOSEmoji = (os: string) => {
        if (os === 'Android') return '🤖';
        if (os === 'iOS' || os === 'iPadOS') return '🍎';
        if (os === 'Windows') return '🪟';
        if (os === 'macOS') return '🍏';
        return '💻';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-amber-100 text-amber-700';
            case 'confirmed': return 'bg-blue-100 text-blue-700';
            case 'completed': return 'bg-emerald-100 text-emerald-700';
            case 'cancelled': return 'bg-rose-100 text-rose-700';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    // ─── Render ───
    return (
        <div className="p-4 md:p-6 lg:p-8">
            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
                {[
                    { icon: <Users size={20} className="text-gold" />, bg: 'bg-gold/10', value: stats.total, label: 'Total Clients' },
                    { icon: <UserCheck size={20} className="text-emerald-600" />, bg: 'bg-emerald-50', value: stats.registered, label: 'Registered' },
                    { icon: <UserX size={20} className="text-amber-600" />, bg: 'bg-amber-50', value: stats.unregistered, label: 'Unregistered' },
                    { icon: <Activity size={20} className="text-blue-600" />, bg: 'bg-blue-50', value: stats.activeToday, label: 'Active Today' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-4 md:p-5 rounded-xl border border-gold/10 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`w-10 h-10 rounded-full ${stat.bg} flex items-center justify-center`}>{stat.icon}</div>
                            <div>
                                <p className="text-2xl font-serif text-charcoal">{stat.value}</p>
                                <p className="text-[10px] uppercase tracking-widest text-charcoal/50 font-bold">{stat.label}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/30" size={16} />
                    <input
                        type="text"
                        placeholder="Search by name, email, or phone..."
                        className="w-full pl-10 pr-4 py-2.5 border border-gold/20 rounded-xl text-sm focus:outline-none focus:border-gold bg-white"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                {/* Filter Pills */}
                <div className="flex gap-2">
                    {(['all', 'registered', 'unregistered'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilterType(f)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap ${filterType === f
                                ? 'bg-gold text-white shadow-sm'
                                : 'bg-white border border-gold/20 text-charcoal/60 hover:border-gold'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                {/* Sort */}
                <div className="relative">
                    <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value as any)}
                        className="appearance-none px-4 py-2.5 pr-8 bg-white border border-gold/20 rounded-xl text-xs font-bold uppercase tracking-wide text-charcoal/60 cursor-pointer focus:outline-none focus:border-gold"
                    >
                        <option value="recent">Recent Activity</option>
                        <option value="bookings">Most Bookings</option>
                        <option value="name">Name A–Z</option>
                    </select>
                    <ArrowUpDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/30 pointer-events-none" />
                </div>
            </div>

            {/* Client List */}
            {loading ? (
                <div className="text-center py-16">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-gold/20 border-t-gold" />
                    <p className="text-charcoal/40 mt-4 italic">Loading client data...</p>
                </div>
            ) : filteredClients.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gold/10 shadow-sm">
                    <Users className="text-charcoal/20 mx-auto mb-4" size={48} />
                    <h3 className="font-serif text-xl text-charcoal mb-2">No Clients Found</h3>
                    <p className="text-charcoal/40 text-sm">Try adjusting your search or filter criteria.</p>
                </div>
            ) : (
                <>
                    {/* Desktop Table */}
                    <div className="hidden md:block bg-white rounded-2xl border border-gold/10 shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-[#Fdfbf7] border-b border-gold/10">
                                <tr className="text-[10px] uppercase font-bold text-charcoal/50 tracking-widest">
                                    <th className="px-5 py-3.5">Client</th>
                                    <th className="px-5 py-3.5">Status</th>
                                    <th className="px-5 py-3.5">Contact</th>
                                    <th className="px-5 py-3.5 text-center">Bookings</th>
                                    <th className="px-5 py-3.5">Last Booking</th>
                                    <th className="px-5 py-3.5">Devices</th>
                                    <th className="px-5 py-3.5">Last Active</th>
                                    <th className="px-5 py-3.5"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gold/5">
                                {filteredClients.map(client => (
                                    <tr
                                        key={client.id}
                                        className="hover:bg-cream/30 cursor-pointer transition-colors group"
                                        onClick={() => openClientDrawer(client)}
                                    >
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-serif text-sm font-bold ring-2 ${client.type === 'registered'
                                                    ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                                                    : 'bg-amber-50 text-amber-700 ring-amber-200'
                                                    }`}>
                                                    {client.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-charcoal text-sm group-hover:text-gold transition-colors">{client.name}</p>
                                                    {client.type === 'registered' && (
                                                        <p className="text-[10px] text-charcoal/40">Since {new Date(client.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${client.type === 'registered'
                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                                                }`}>
                                                {client.type === 'registered' ? '✓ Registered' : '⊘ Unregistered'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="space-y-0.5 text-xs text-charcoal/60">
                                                {client.email && <p className="flex items-center gap-1"><Mail size={10} /> {client.email}</p>}
                                                {client.phone && <p className="flex items-center gap-1"><Phone size={10} /> {client.phone}</p>}
                                                {!client.email && !client.phone && <p className="italic text-charcoal/30">No contact info</p>}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <span className="text-lg font-serif text-charcoal">{client.bookingCount}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            {client.lastBookingDate ? (
                                                <div className="flex items-center gap-1.5 text-xs text-charcoal/70">
                                                    <Calendar size={12} className="text-gold" />
                                                    {new Date(client.lastBookingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                            ) : (
                                                <span className="text-[10px] text-charcoal/30 italic">No bookings</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1">
                                                {client.devices.length > 0 ? (
                                                    <>
                                                        {client.devices.slice(0, 3).map((d, i) => (
                                                            <div key={i} className="w-7 h-7 rounded-lg bg-charcoal/5 flex items-center justify-center text-charcoal/50" title={`${d.device_model} — ${d.os_name} ${d.os_version}`}>
                                                                {getDeviceIcon(d.device_type)}
                                                            </div>
                                                        ))}
                                                        {client.devices.length > 3 && (
                                                            <span className="text-[10px] font-bold text-charcoal/40 ml-1">+{client.devices.length - 3}</span>
                                                        )}
                                                    </>
                                                ) : (
                                                    <span className="text-[10px] text-charcoal/30 italic">No data</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-charcoal/70">{getRelativeTime(client.lastActive)}</span>
                                                <span className="text-[9px] text-charcoal/30 uppercase tracking-tighter">Activity</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <ChevronRight size={16} className="text-charcoal/20 group-hover:text-gold transition-colors inline-block" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>


                    {/* Mobile Card View */}
                    < div className="md:hidden space-y-3" >
                        {
                            filteredClients.map(client => (
                                <div
                                    key={client.id}
                                    className="bg-white p-4 rounded-xl border border-gold/10 shadow-sm active:bg-cream/30 transition-colors cursor-pointer"
                                    onClick={() => openClientDrawer(client)}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-serif text-sm font-bold ring-2 ${client.type === 'registered'
                                                ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                                                : 'bg-amber-50 text-amber-700 ring-amber-200'
                                                }`}>
                                                {client.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-charcoal text-sm">{client.name}</p>
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${client.type === 'registered'
                                                    ? 'bg-emerald-50 text-emerald-700'
                                                    : 'bg-amber-50 text-amber-700'
                                                    }`}>
                                                    {client.type === 'registered' ? 'Registered' : 'Unregistered'}
                                                </span>
                                            </div>
                                        </div>
                                        <ChevronRight size={16} className="text-charcoal/20 mt-2" />
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-charcoal/50">
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-1"><Calendar size={11} /> {client.bookingCount} bookings</span>
                                            <span className="flex items-center gap-1">
                                                {client.devices.slice(0, 2).map((d, i) => (
                                                    <span key={i}>{getDeviceIcon(d.device_type)}</span>
                                                ))}
                                                {client.devices.length > 2 && <span className="font-bold">+{client.devices.length - 2}</span>}
                                                {client.devices.length === 0 && <span className="italic">No devices</span>}
                                            </span>
                                        </div>
                                        <span>{getRelativeTime(client.lastActive)}</span>
                                    </div>
                                </div>
                            ))
                        }
                    </div >

                    <p className="text-center text-xs text-charcoal/30 mt-4 font-bold uppercase tracking-widest">
                        {filteredClients.length} client{filteredClients.length !== 1 ? 's' : ''} shown
                    </p>
                </>
            )}

            {/* ─── Detail Drawer ─── */}
            {
                selectedClient && (
                    <>
                        {/* Overlay */}
                        <div
                            className={`fixed inset-0 bg-charcoal/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${drawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                            onClick={closeDrawer}
                        />
                        {/* Drawer */}
                        <div className={`fixed top-0 right-0 h-full w-full sm:w-[480px] bg-[#F9F7F2] z-50 shadow-2xl transform transition-transform duration-300 overflow-y-auto ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                            {/* Drawer Header */}
                            <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-gold/10 p-5 z-10">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-serif text-lg font-bold ring-2 ${selectedClient.type === 'registered'
                                            ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                                            : 'bg-amber-50 text-amber-700 ring-amber-200'
                                            }`}>
                                            {selectedClient.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h2 className="font-serif text-xl text-charcoal">{selectedClient.name}</h2>
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${selectedClient.type === 'registered'
                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                                                }`}>
                                                {selectedClient.type === 'registered' ? '✓ Registered' : '⊘ Unregistered'}
                                            </span>
                                        </div>
                                    </div>
                                    <button onClick={closeDrawer} className="p-2 text-charcoal/40 hover:text-charcoal hover:bg-charcoal/5 rounded-xl transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="p-5 space-y-6">
                                {/* Contact Info */}
                                <div className="bg-white p-4 rounded-xl border border-gold/10">
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-charcoal/40 mb-3">Contact Information</h3>
                                    <div className="space-y-2">
                                        {selectedClient.email && (
                                            <div className="flex items-center gap-2 text-sm text-charcoal/70">
                                                <Mail size={14} className="text-gold" /> {selectedClient.email}
                                            </div>
                                        )}
                                        {selectedClient.phone && (
                                            <div className="flex items-center gap-2 text-sm text-charcoal/70">
                                                <Phone size={14} className="text-gold" /> {selectedClient.phone}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-sm text-charcoal/70">
                                            <Calendar size={14} className="text-gold" />
                                            {selectedClient.type === 'registered'
                                                ? `Member since ${new Date(selectedClient.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
                                                : `First visit: ${new Date(selectedClient.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                                            }
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-charcoal/70">
                                            <Clock size={14} className="text-gold" />
                                            Last active: {getRelativeTime(selectedClient.lastActive)}
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-white p-3 rounded-xl border border-gold/10 text-center">
                                        <p className="text-xl font-serif text-charcoal">{selectedClient.bookingCount}</p>
                                        <p className="text-[9px] uppercase tracking-widest text-charcoal/40 font-bold">Bookings</p>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl border border-gold/10 text-center">
                                        <p className="text-xl font-serif text-charcoal">{selectedClient.devices.length}</p>
                                        <p className="text-[9px] uppercase tracking-widest text-charcoal/40 font-bold">Devices</p>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl border border-gold/10 text-center">
                                        <p className="text-xl font-serif text-charcoal">
                                            {selectedClient.devices.reduce((sum, d) => sum + d.session_count, 0)}
                                        </p>
                                        <p className="text-[9px] uppercase tracking-widest text-charcoal/40 font-bold">Sessions</p>
                                    </div>
                                </div>

                                {/* ─── Device Gallery ─── */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Smartphone size={14} className="text-gold" />
                                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-charcoal/40">Devices ({selectedClient.devices.length})</h3>
                                    </div>
                                    {selectedClient.devices.length === 0 ? (
                                        <div className="bg-white p-6 rounded-xl border border-gold/10 text-center">
                                            <Wifi className="text-charcoal/15 mx-auto mb-3" size={32} />
                                            <p className="text-xs text-charcoal/40 italic">No device data recorded yet. Data will appear after the client's next visit.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {selectedClient.devices.map((device, i) => (
                                                <div key={device.id || i} className="bg-white p-4 rounded-xl border border-gold/10 hover:shadow-md transition-all group">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-charcoal/5 flex items-center justify-center text-charcoal/60 group-hover:bg-gold/10 group-hover:text-gold transition-all">
                                                                {getDeviceIcon(device.device_type)}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-charcoal text-sm">{device.device_model || 'Unknown Device'}</p>
                                                                <p className="text-[10px] text-charcoal/40">{device.device_type.charAt(0).toUpperCase() + device.device_type.slice(1)}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[10px] text-charcoal/40">{device.session_count} session{device.session_count !== 1 ? 's' : ''}</p>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                                        <div className="flex items-center gap-1.5 text-charcoal/60">
                                                            <span>{getOSEmoji(device.os_name)}</span>
                                                            <span>{device.os_name} {device.os_version}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-charcoal/60">
                                                            <Globe size={11} className="text-gold" />
                                                            <span>{device.browser} {device.browser_version ? device.browser_version.split('.')[0] : ''}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-charcoal/60">
                                                            <Monitor size={11} className="text-gold" />
                                                            <span>{device.screen_resolution}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-charcoal/60">
                                                            <Globe size={11} className="text-gold" />
                                                            <span>{device.app_context}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-gold/5 text-[10px] text-charcoal/35">
                                                        <span>First seen: {new Date(device.first_seen).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                        <span>Last seen: {getRelativeTime(device.last_seen)}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* ─── Booking History ─── */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Calendar size={14} className="text-gold" />
                                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-charcoal/40">Booking History ({clientBookings.length})</h3>
                                    </div>
                                    {clientBookings.length === 0 ? (
                                        <div className="bg-white p-6 rounded-xl border border-gold/10 text-center">
                                            <p className="text-xs text-charcoal/40 italic">Loading booking history...</p>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <div className="absolute left-4 top-0 bottom-0 w-px bg-gold/10" aria-hidden="true" />
                                            <div className="space-y-3">
                                                {clientBookings.map((booking, i) => (
                                                    <div key={booking.id} className="relative pl-9">
                                                        <div className={`absolute left-2.5 top-4 w-3 h-3 rounded-full border-2 border-white shadow-sm z-10 ${booking.status === 'completed' ? 'bg-emerald-500'
                                                            : booking.status === 'confirmed' ? 'bg-blue-500'
                                                                : booking.status === 'pending' ? 'bg-amber-400'
                                                                    : 'bg-rose-400'
                                                            }`} />
                                                        <div className="bg-white p-4 rounded-xl border border-gold/10">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <p className="font-semibold text-charcoal text-sm">{booking.services?.title || 'Service'}</p>
                                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${getStatusColor(booking.status)}`}>
                                                                    {booking.status}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-3 text-xs text-charcoal/50">
                                                                <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(booking.booking_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                                                {booking.therapists?.name && (
                                                                    <span className="flex items-center gap-1 text-gold italic">{booking.therapists.name}</span>
                                                                )}
                                                                {booking.services?.price && (
                                                                    <span className="font-bold text-gold">₱{booking.services.price}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )
            }
        </div >
    );
};

export default ClientIntelligence;
