import React from 'react';
import { Calendar, Clock, Mail, Phone, Star, Wallet, CheckCircle2, Clock3 } from 'lucide-react';
import { formatTimeTo12h } from '../../lib/utils';
import { Booking } from '../../types';

interface SessionCardProps {
    booking: Booking;
}

const getStatusConfig = (status: string) => {
    switch (status) {
        case 'pending': return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-l-amber-400', dot: 'bg-amber-400', icon: <Clock3 size={12} /> };
        case 'confirmed': return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-l-emerald-500', dot: 'bg-emerald-500', icon: <CheckCircle2 size={12} /> };
        case 'completed': return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-l-blue-500', dot: 'bg-blue-500', icon: <CheckCircle2 size={12} /> };
        case 'cancelled': return { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-l-rose-400', dot: 'bg-rose-400', icon: null };
        default: return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-l-gray-300', dot: 'bg-gray-400', icon: null };
    }
};

const SessionCard: React.FC<SessionCardProps> = ({ booking }) => {
    const status = getStatusConfig(booking.status);
    const clientName = booking.profiles?.full_name || booking.guest_name || 'Guest';
    const clientInitial = clientName.charAt(0).toUpperCase();

    return (
        <div className="booking-card bg-white rounded-3xl border border-gold/10 overflow-hidden hover:shadow-2xl hover:border-gold/30 transition-all duration-300 group relative">
            {/* Status Border Accent */}
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${status.dot}`} aria-hidden="true" />

            <div className="p-6 md:p-8">
                {/* Top row: client + status */}
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center ring-4 ring-white shadow-inner font-serif text-gold font-bold text-xl transition-transform group-hover:scale-110 duration-500">
                            {clientInitial}
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-serif text-xl text-charcoal group-hover:text-gold transition-colors truncate">
                                {clientName}
                            </h3>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                {booking.profiles?.email && (
                                    <p className="text-[11px] text-charcoal/40 flex items-center gap-1.5">
                                        <Mail size={12} className="text-gold" /> {booking.profiles.email}
                                    </p>
                                )}
                                {(booking.guest_phone || booking.profiles?.phone) && (
                                    <p className="text-[11px] text-charcoal/40 flex items-center gap-1.5">
                                        <Phone size={12} className="text-gold" /> {booking.guest_phone || booking.profiles?.phone}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.15em] flex items-center gap-2 shadow-sm ${status.bg} ${status.text} border border-gold/5`}>
                            {status.icon} {booking.status}
                        </span>
                    </div>
                </div>

                {/* Service details */}
                <div className="bg-cream/20 rounded-2xl p-5 mb-4 border border-gold/5 group-hover:bg-cream/40 transition-all duration-300 hover:border-gold/20">
                    <div className="flex items-center gap-2 mb-3">
                        <Star size={14} className="text-gold fill-gold" />
                        <p className="font-serif text-lg md:text-xl text-charcoal">{booking.services?.title || 'Service'}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                        <div className="flex items-center gap-2 text-charcoal/70">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-gold/5">
                                <Calendar size={14} className="text-gold" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest">
                                {new Date(booking.booking_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-charcoal/70">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-gold/5">
                                <Clock size={14} className="text-gold" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-widest">
                                {formatTimeTo12h(booking.booking_time)}
                            </span>
                        </div>
                        {booking.services?.duration && (
                            <div className="ml-auto bg-gold/10 text-gold px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-gold/10">
                                {booking.services.duration} min
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-between items-center px-1">
                    <p className="text-[10px] text-charcoal/30 font-bold uppercase tracking-widest">Ref: {booking.id.substring(0, 8)}</p>
                    <div className="flex items-center gap-2">
                        {Number(booking.tip_amount) > 0 && booking.tip_recipient === 'therapist' && (
                            <div className="flex items-center gap-1.5 bg-gold/5 text-gold px-3 py-1 rounded-full border border-gold/10">
                                <Star size={10} className="fill-gold" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Tip ₱{booking.tip_amount}</span>
                            </div>
                        )}
                        {Number(booking.commission_amount) > 0 && (
                            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100/50">
                                <Wallet size={10} />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Earned ₱{booking.commission_amount}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SessionCard;
