import React, { useState, useMemo, useEffect } from 'react';
import gsap from 'gsap';
import {
    ClipboardList, Clock3, CheckCircle2, Check, XCircle, DollarSign,
    Calendar, Clock, User, Edit3, RefreshCcw, Trash2, Star, MoreVertical, Users
} from 'lucide-react';
import { formatTimeTo12h } from '../../lib/utils';
import type { Booking, Therapist } from '../../types';
import AssignTherapistModal from './AssignTherapistModal';
import { exportBookingsToExcel } from '../../lib/excelExport';

interface BookingsTabProps {
    bookings: Booking[];
    therapists: Therapist[];
    feedbacks: Record<string, any>;
    stats: {
        total: number;
        pending: number;
        confirmed: number;
        completed: number;
        cancelled: number;
    };
    revenueStats: {
        totalRevenue: number;
        pendingRevenue: number;
        todayRevenue: number;
    };
    searchTerm: string;
    onUpdateStatus: (id: string, status: string, therapistId?: string) => void;
    onEdit: (booking: Booking) => void;
    onDelete: (id: string) => void;
    onViewReview: (review: { booking: Booking, feedback: any }) => void;
}

const BookingsTab: React.FC<BookingsTabProps> = React.memo(({
    bookings,
    therapists,
    feedbacks,
    stats,
    revenueStats,
    searchTerm,
    onUpdateStatus,
    onEdit,
    onDelete,
    onViewReview
}) => {
    const [filter, setFilter] = useState('all');
    const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
    const [assigningBooking, setAssigningBooking] = useState<Booking | null>(null);

    const filteredBookings = useMemo(() => {
        return bookings.filter(b => {
            const matchesFilter = filter === 'all' || b.status === filter;
            const search = searchTerm.toLowerCase();
            return matchesFilter && (
                (b.user_email || '').toLowerCase().includes(search) ||
                (b.guest_name || '').toLowerCase().includes(search) ||
                (b.services?.title || '').toLowerCase().includes(search)
            );
        });
    }, [bookings, filter, searchTerm]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-amber-100 text-amber-700';
            case 'confirmed': return 'bg-blue-100 text-blue-700';
            case 'completed': return 'bg-emerald-100 text-emerald-700';
            case 'cancelled': return 'bg-rose-100 text-rose-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    // Animate empty state
    useEffect(() => {
        gsap.to('.animate-float-bookings', {
            y: -10,
            duration: 2,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1
        });
    }, []);

    return (
        <div className="p-4 md:p-6 lg:p-8" onClick={() => setActionMenuOpen(null)}>
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
                        <span className="text-gold font-bold text-lg">₱</span>
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

            {/* Filter Pills and Export Action */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4 md:mb-6">
                <div className="flex flex-wrap gap-2">
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

                <button
                    onClick={() => exportBookingsToExcel(filteredBookings, filter === 'all' ? 'All-Bookings' : `${filter}-Bookings`)}
                    className="flex items-center gap-2 bg-charcoal text-white px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-gold transition-colors"
                >
                    <ClipboardList size={16} />
                    Export to Excel
                </button>
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
                                        {(b.status === 'pending' || b.status === 'confirmed') ? (
                                            <div onClick={(e) => e.stopPropagation()} className="mt-2">
                                                <div className="relative inline-block w-full max-w-[180px]">
                                                    <select
                                                        value={b.therapist_id || ''}
                                                        onChange={(e) => {
                                                            const newTherapistId = e.target.value;
                                                            if (newTherapistId !== (b.therapist_id || '')) {
                                                                onUpdateStatus(b.id, b.status, newTherapistId || undefined);
                                                            }
                                                        }}
                                                        className="appearance-none w-full bg-charcoal/5 border border-gold/30 rounded-lg px-3 py-1.5 text-xs text-charcoal font-semibold focus:outline-none focus:border-gold cursor-pointer hover:bg-gold/5 transition-colors"
                                                    >
                                                        <option value="">Assign Specialist...</option>
                                                        {therapists.filter(t => t.active).map(t => (
                                                            <option key={t.id} value={t.id}>{t.name}</option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gold">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="mt-2 flex items-center gap-1.5 text-xs text-charcoal/60 bg-charcoal/5 w-fit px-2 py-1 rounded-md">
                                                <User size={12} className="text-gold" />
                                                <span>{b.therapists?.name || 'Unassigned'}</span>
                                            </div>
                                        )}
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
                                                    onClick={(e) => { e.stopPropagation(); !b.therapist_id ? setAssigningBooking(b) : onUpdateStatus(b.id, 'confirmed'); }}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Confirm Booking"
                                                >
                                                    <CheckCircle2 size={18} />
                                                </button>
                                            )}
                                            {b.status === 'confirmed' && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onUpdateStatus(b.id, 'completed'); }}
                                                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                    title="Mark as Completed"
                                                >
                                                    <Check size={18} />
                                                </button>
                                            )}
                                            {(b.status === 'pending' || b.status === 'confirmed') && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onEdit(b); }}
                                                    className="p-2 text-gold hover:bg-gold/10 rounded-lg transition-colors"
                                                    title="Edit Booking"
                                                >
                                                    <Edit3 size={18} />
                                                </button>
                                            )}
                                            {b.status === 'completed' && feedbacks[b.id] && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onViewReview({ booking: b, feedback: feedbacks[b.id] }); }}
                                                    className="p-2 text-gold hover:bg-gold/10 rounded-lg transition-colors group relative"
                                                    title="View Review"
                                                >
                                                    <Star size={18} fill={feedbacks[b.id].rating >= 4 ? 'currentColor' : 'none'} />
                                                    {feedbacks[b.id].edit_count > 0 && (
                                                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
                                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-gold border border-white"></span>
                                                        </span>
                                                    )}
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
                                                                    onClick={(e) => { e.stopPropagation(); setAssigningBooking(b); setActionMenuOpen(null); }}
                                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-gold/5 flex items-center gap-2"
                                                                >
                                                                    <Users size={14} /> Assign Therapist
                                                                </button>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); onUpdateStatus(b.id, 'cancelled'); }}
                                                                    className="w-full px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                                                                >
                                                                    <XCircle size={14} /> Cancel Booking
                                                                </button>
                                                            </>
                                                        )}
                                                        {b.status === 'cancelled' && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); onUpdateStatus(b.id, 'pending'); }}
                                                                className="w-full px-4 py-2 text-left text-sm hover:bg-gold/5 flex items-center gap-2"
                                                            >
                                                                <RefreshCcw size={14} /> Restore Booking
                                                            </button>
                                                        )}
                                                        <hr className="my-2 border-gold/10" />
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); onDelete(b.id); }}
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
                        <div key={b.id} className="p-4" onClick={() => setActionMenuOpen(null)}>
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
                            <div className="flex items-center gap-2 mb-4">
                                <User size={14} className="text-gold flex-shrink-0" />
                                {(b.status === 'pending' || b.status === 'confirmed') ? (
                                    <div onClick={(e) => e.stopPropagation()} className="flex-1 relative">
                                        <select
                                            value={b.therapist_id || ''}
                                            onChange={(e) => {
                                                const newTherapistId = e.target.value;
                                                if (newTherapistId !== (b.therapist_id || '')) {
                                                    onUpdateStatus(b.id, b.status, newTherapistId || undefined);
                                                }
                                            }}
                                            className="appearance-none w-full bg-charcoal/5 border border-gold/30 rounded-lg px-3 py-2 text-xs text-charcoal font-semibold focus:outline-none focus:border-gold cursor-pointer transition-colors"
                                        >
                                            <option value="">Assign Specialist...</option>
                                            {therapists.filter(t => t.active).map(t => (
                                                <option key={t.id} value={t.id}>{t.name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gold">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 bg-charcoal/5 px-3 py-1.5 rounded-md">
                                        <span className="text-xs text-charcoal/80 font-semibold">{b.therapists?.name || 'Unassigned'}</span>
                                    </div>
                                )}
                            </div>
                            {/* Mobile Action Buttons */}
                            <div className="flex gap-2 flex-wrap">
                                {b.status === 'pending' && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); !b.therapist_id ? setAssigningBooking(b) : onUpdateStatus(b.id, 'confirmed'); }}
                                        className="flex-1 min-w-[100px] px-3 py-2 bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                                    >
                                        <CheckCircle2 size={14} /> Confirm
                                    </button>
                                )}
                                {b.status === 'confirmed' && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onUpdateStatus(b.id, 'completed'); }}
                                        className="flex-1 min-w-[100px] px-3 py-2 bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                                    >
                                        <Check size={14} /> Complete
                                    </button>
                                )}
                                {(b.status === 'pending' || b.status === 'confirmed') && (
                                    <>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onEdit(b); }}
                                            className="px-3 py-2 bg-gold/10 text-gold rounded-lg text-xs font-bold flex items-center gap-1"
                                        >
                                            <Edit3 size={14} /> Edit
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onUpdateStatus(b.id, 'cancelled'); }}
                                            className="px-3 py-2 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold flex items-center gap-1"
                                        >
                                            <XCircle size={14} /> Cancel
                                        </button>
                                    </>
                                )}
                                {b.status === 'completed' && feedbacks[b.id] && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onViewReview({ booking: b, feedback: feedbacks[b.id] }); }}
                                        className="px-3 py-2 bg-gold/10 text-gold rounded-lg text-xs font-bold flex items-center gap-1"
                                    >
                                        <Star size={14} fill="currentColor" /> Review
                                    </button>
                                )}
                                {b.status === 'cancelled' && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onUpdateStatus(b.id, 'pending'); }}
                                        className="px-3 py-2 bg-charcoal/10 text-charcoal rounded-lg text-xs font-bold flex items-center gap-1"
                                    >
                                        <RefreshCcw size={14} /> Restore
                                    </button>
                                )}
                                {/* Delete button - always visible on mobile */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDelete(b.id); }}
                                    className="px-3 py-2 bg-rose-100 text-rose-600 rounded-lg text-xs font-bold flex items-center gap-1"
                                >
                                    <Trash2 size={14} /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                    {filteredBookings.length === 0 && (
                        <div className="p-8 text-center text-charcoal/40">
                            <ClipboardList size={40} className="mx-auto mb-3 opacity-40 animate-float-bookings" />
                            <p>No bookings found</p>
                        </div>
                    )}
                </div>
            </div>

            <AssignTherapistModal
                isOpen={!!assigningBooking}
                onClose={() => setAssigningBooking(null)}
                booking={assigningBooking}
                therapists={therapists}
                onAssign={(bookingId, therapistId) => {
                    onUpdateStatus(bookingId, 'confirmed', therapistId);
                    setAssigningBooking(null);
                }}
            />
        </div>
    );
});

export default BookingsTab;
