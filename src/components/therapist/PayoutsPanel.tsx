import React, { useState } from 'react';
import { Wallet, TrendingUp, ChevronRight, Star } from 'lucide-react';
import { Booking, CommissionPayout } from '../../types';

interface PayoutsPanelProps {
    payouts: CommissionPayout[];
    bookings: Booking[];
}

const PayoutsPanel: React.FC<PayoutsPanelProps> = ({ payouts, bookings }) => {
    const [expandedPayoutId, setExpandedPayoutId] = useState<string | null>(null);

    if (payouts.length === 0) {
        return (
            <div className="text-center py-16 bg-white rounded-3xl border border-gold/10 shadow-sm">
                <Wallet className="text-charcoal/20 mx-auto mb-4" size={48} />
                <h3 className="font-serif text-xl text-charcoal mb-2">No Payouts Yet</h3>
                <p className="text-charcoal/40 italic">Your earnings will be listed here after processing.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                    <TrendingUp className="text-gold" size={20} />
                </div>
                <div>
                    <h2 className="font-serif text-xl text-charcoal">Payout History</h2>
                    <p className="text-xs text-charcoal/40">Track your processed commissions and tips.</p>
                </div>
            </div>

            {payouts.map(payout => {
                const payoutBookings = bookings.filter(b => b.payout_id === payout.id);
                const isExpanded = expandedPayoutId === payout.id;

                return (
                    <div key={payout.id} className="bg-white rounded-3xl border border-gold/10 overflow-hidden shadow-sm hover:shadow-md transition-all">
                        <div
                            className="p-6 md:p-8 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                            onClick={() => setExpandedPayoutId(isExpanded ? null : payout.id)}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-4 rounded-2xl ${payout.status === 'processed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                    <Wallet size={24} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-charcoal">₱{payout.amount.toLocaleString()}</h3>
                                        <span className={`px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-widest ${payout.status === 'processed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {payout.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-charcoal/40">
                                        Period: {new Date(payout.period_start).toLocaleDateString()} - {new Date(payout.period_end).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-none pt-4 md:pt-0">
                                <div className="text-left md:text-right">
                                    <p className="text-[10px] uppercase font-bold text-charcoal/30 tracking-widest mb-1">Breakdown</p>
                                    <p className="text-xs font-bold text-gold">{payoutBookings.length} Sessions</p>
                                </div>
                                <div className={`w-8 h-8 rounded-full bg-gold/5 flex items-center justify-center transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>
                                    <ChevronRight size={16} className="text-gold" />
                                </div>
                            </div>
                        </div>

                        {isExpanded && (
                            <div className="px-6 md:px-8 pb-8 animate-in slide-in-from-top-4 duration-300">
                                <div className="pt-6 border-t border-gold/5">
                                    <h4 className="text-[10px] uppercase font-bold text-charcoal/40 tracking-[0.2em] mb-4">Included Sessions</h4>
                                    <div className="space-y-3">
                                        {payoutBookings.length > 0 ? payoutBookings.map(b => (
                                            <div key={b.id} className="flex items-center justify-between p-3 bg-cream/30 rounded-2xl border border-gold/10 text-sm">
                                                <div className="flex items-center gap-3">
                                                    <Star size={14} className="text-gold" />
                                                    <div>
                                                        <p className="font-semibold text-charcoal">{b.services?.title}</p>
                                                        <p className="text-[10px] text-charcoal/40">{new Date(b.booking_date).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-charcoal">₱{(b.commission_amount || 0) + (b.tip_recipient === 'therapist' ? (b.tip_amount || 0) : 0)}</p>
                                                    <div className="flex flex-col items-end gap-0.5 mt-0.5">
                                                        <p className="text-[8px] text-charcoal/40 font-bold uppercase tracking-tight">Com: ₱{b.commission_amount || 0}</p>
                                                        {Number(b.tip_amount) > 0 && b.tip_recipient === 'therapist' && (
                                                            <p className="text-[8px] text-emerald-600 font-bold uppercase tracking-tight">Tip: ₱{b.tip_amount}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )) : (
                                            <p className="text-xs text-charcoal/40 italic">No detailed booking links found for this payout.</p>
                                        )}
                                        {payout.notes && (
                                            <div className="mt-4 p-4 bg-gold/5 rounded-2xl border border-gold/10">
                                                <p className="text-[10px] uppercase font-bold text-gold tracking-widest mb-1">Notes</p>
                                                <p className="text-xs text-charcoal/60 leading-relaxed">{payout.notes}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default PayoutsPanel;
