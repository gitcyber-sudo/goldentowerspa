import React, { useMemo, useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Booking, Therapist, CommissionPayout } from '../../types';
import {
    Wallet,
    Users,
    Calendar,
    ArrowRight,
    DollarSign,
    ChevronDown,
    Filter,
    CheckCircle2,
    Clock,
    History,
    FileText,
    ArrowUpRight
} from 'lucide-react';
import { format } from 'date-fns';
import { formatTimeTo12h } from '../../lib/utils';

interface CommissionsTabProps {
    bookings: Booking[];
    therapists: Therapist[];
    onRefresh?: () => void;
}

const CommissionsTab: React.FC<CommissionsTabProps> = ({ bookings, therapists, onRefresh }) => {
    const [payouts, setPayouts] = useState<CommissionPayout[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedTherapistId, setSelectedTherapistId] = useState<string>('all');
    const [view, setView] = useState<'pending' | 'history'>('pending');

    useEffect(() => {
        fetchPayouts();
    }, []);

    const fetchPayouts = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('commission_payouts')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            if (data) setPayouts(data);
        } catch (err) {
            console.error('Error fetching payouts:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleProcessPayout = async (therapistId: string, amount: number, bookingIds: string[]) => {
        if (amount <= 0) return;
        if (!confirm(`Process payout of ₱${amount.toLocaleString()} for ${therapists.find(t => t.id === therapistId)?.name}?`)) return;

        try {
            // 1. Create payout record
            const { data: payout, error: payoutError } = await supabase
                .from('commission_payouts')
                .insert([{
                    therapist_id: therapistId,
                    amount: amount,
                    period_start: new Date(Math.min(...bookings.map(b => new Date(b.booking_date).getTime()))).toISOString().split('T')[0],
                    period_end: new Date().toISOString().split('T')[0],
                    status: 'processed'
                }])
                .select()
                .single();

            if (payoutError) throw payoutError;

            // 2. Link bookings to this payout
            const { error: linkError } = await supabase
                .from('bookings')
                .update({ payout_id: payout.id })
                .in('id', bookingIds);

            if (linkError) throw linkError;

            alert('Payout processed successfully');
            fetchPayouts();
            // Refresh parent data (bookings) without a hard reload
            onRefresh?.();
        } catch (err) {
            console.error('Error processing payout:', err);
            alert('Failed to process payout');
        }
    };

    const therapistStats = useMemo(() => {
        if (!therapists.length) return [];

        return therapists.map(t => {
            const pendingBookings = bookings.filter(b =>
                b.therapist_id === t.id &&
                b.status === 'completed' &&
                !b.payout_id &&
                !b.deleted_at
            );

            const unpaidAmount = pendingBookings.reduce((sum, b) => sum + (b.commission_amount || 0), 0);
            const paidAmount = payouts.filter(p => p.therapist_id === t.id && p.status === 'processed')
                .reduce((sum, p) => sum + p.amount, 0);

            return {
                ...t,
                unpaidAmount,
                paidAmount,
                pendingCount: pendingBookings.length,
                pendingBookingIds: pendingBookings.map(b => b.id)
            };
        }).filter(t => t.unpaidAmount > 0 || t.paidAmount > 0);
    }, [bookings, therapists, payouts]);

    const globalUnpaid = therapistStats.reduce((sum, t) => sum + t.unpaidAmount, 0);
    const globalPaid = payouts.filter(p => p.status === 'processed').reduce((sum, p) => sum + p.amount, 0);

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-8">
            {/* Header / Summary Cards */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-serif text-charcoal">Commission & Payout Management</h2>
                    <p className="text-xs text-charcoal/50 mt-1 uppercase tracking-widest font-bold">Track and settle specialist earnings</p>
                </div>
                <div className="flex bg-white rounded-xl p-1 border border-gold/10 shadow-sm">
                    <button
                        onClick={() => setView('pending')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${view === 'pending' ? 'bg-charcoal text-white shadow-lg' : 'text-charcoal/40 hover:text-charcoal'}`}
                    >
                        Pending Settlement
                    </button>
                    <button
                        onClick={() => setView('history')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${view === 'history' ? 'bg-charcoal text-white shadow-lg' : 'text-charcoal/40 hover:text-charcoal'}`}
                    >
                        Payout History
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gold/10 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-5">
                        <Clock size={80} />
                    </div>
                    <p className="text-[10px] uppercase tracking-widest font-black text-rose-500 mb-2">Awaiting Payout</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-serif text-charcoal">₱{globalUnpaid.toLocaleString()}</span>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gold/10 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-5">
                        <CheckCircle2 size={80} />
                    </div>
                    <p className="text-[10px] uppercase tracking-widest font-black text-emerald-500 mb-2">Total Settled</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-serif text-charcoal">₱{globalPaid.toLocaleString()}</span>
                    </div>
                </div>
                <div className="bg-charcoal p-6 rounded-2xl border border-gold/10 shadow-xl relative overflow-hidden text-white hidden lg:block">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <Wallet size={80} />
                    </div>
                    <h4 className="font-serif text-gold text-lg mb-1">Financial Health</h4>
                    <p className="text-xs text-white/40 mb-4">Payout efficiency and specialist satisfaction.</p>
                    <div className={`flex items-center gap-2 ${globalUnpaid > 0 ? 'text-amber-400' : 'text-emerald-400'} text-xs font-bold`}>
                        {globalUnpaid > 0 ? <Clock size={14} /> : <ArrowUpRight size={14} />}
                        {globalUnpaid > 0 ? 'Pending settlements found' : 'All balances reconciled'}
                    </div>
                </div>
            </div>

            {view === 'pending' ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Specialist Payout Cards */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Users size={18} className="text-gold" />
                            <h3 className="font-serif text-lg text-charcoal">Pending by Specialist</h3>
                        </div>
                        {therapistStats.filter(t => t.unpaidAmount > 0).length === 0 ? (
                            <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-2xl text-center">
                                <CheckCircle2 className="mx-auto text-emerald-500 mb-3" size={32} />
                                <p className="font-serif text-emerald-900">All Specialists Cleared</p>
                                <p className="text-xs text-emerald-600/60 mt-1 uppercase tracking-widest font-bold">Zero Pending Commissions</p>
                            </div>
                        ) : (
                            therapistStats.filter(t => t.unpaidAmount > 0).map(t => (
                                <div key={t.id} className="bg-white p-6 rounded-2xl border border-gold/10 shadow-sm hover:border-gold/30 transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-charcoal/5 flex items-center justify-center font-serif text-xl text-gold border border-gold/10">
                                                {t.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-serif text-lg text-charcoal group-hover:text-gold transition-colors">{t.name}</h4>
                                                <p className="text-[10px] text-charcoal/40 uppercase tracking-widest font-bold">{t.pendingCount} pending sessions</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] uppercase tracking-widest font-black text-rose-500 mb-1">DUE AMOUNT</p>
                                            <p className="text-2xl font-serif text-charcoal">₱{t.unpaidAmount.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleProcessPayout(t.id, t.unpaidAmount, t.pendingBookingIds)}
                                        className="w-full py-3 bg-charcoal text-white rounded-xl text-xs font-bold uppercase tracking-[0.2em] shadow-lg hover:bg-gold transition-all"
                                    >
                                        Process Settlement
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Pending Ledger */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <FileText size={18} className="text-gold" />
                            <h3 className="font-serif text-lg text-charcoal">Unpaid Session Ledger</h3>
                        </div>
                        <div className="bg-white rounded-2xl border border-gold/10 shadow-sm overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-[#Fdfbf7] border-b border-gold/10">
                                    <tr className="text-[8px] uppercase font-black text-charcoal/40 tracking-[0.2em]">
                                        <th className="px-5 py-4">Date/Time</th>
                                        <th className="px-5 py-4">Specialist</th>
                                        <th className="px-5 py-4 text-right">Commission</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gold/5">
                                    {bookings
                                        .filter(b => b.status === 'completed' && !b.payout_id && !b.deleted_at)
                                        .slice(0, 15)
                                        .map(b => (
                                            <tr key={b.id} className="text-xs hover:bg-cream/20 transition-colors">
                                                <td className="px-5 py-4">
                                                    <p className="font-bold text-charcoal">{format(new Date(b.booking_date), 'MMM dd')}</p>
                                                    <p className="text-[10px] text-charcoal/40 uppercase font-medium">{formatTimeTo12h(b.booking_time)}</p>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <p className="font-medium text-charcoal">{therapists.find(t => t.id === b.therapist_id)?.name}</p>
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <span className="font-serif text-charcoal">₱{(b.commission_amount || 0).toLocaleString()}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    {bookings.filter(b => b.status === 'completed' && !b.payout_id && !b.deleted_at).length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-5 py-8 text-center text-charcoal/30 italic">No pending items found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                /* Payout History View */
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <History size={18} className="text-gold" />
                        <h3 className="font-serif text-lg text-charcoal">Historical Settlement Ledger</h3>
                    </div>
                    <div className="bg-white rounded-2xl border border-gold/10 shadow-sm overflow-hidden text-sm">
                        <table className="w-full text-left">
                            <thead className="bg-[#Fdfbf7] border-b border-gold/10">
                                <tr className="text-[10px] uppercase font-black text-charcoal/40 tracking-[0.2em]">
                                    <th className="px-6 py-4">Settlement ID</th>
                                    <th className="px-6 py-4">Specialist</th>
                                    <th className="px-6 py-4">Period</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gold/5">
                                {payouts.map(p => (
                                    <tr key={p.id} className="hover:bg-cream/20 transition-colors group">
                                        <td className="px-6 py-5 font-mono text-[10px] text-charcoal/30 font-bold uppercase tracking-tighter">
                                            PAY-{p.id.slice(0, 8)}
                                        </td>
                                        <td className="px-6 py-5 font-bold text-charcoal">
                                            {therapists.find(t => t.id === p.therapist_id)?.name}
                                        </td>
                                        <td className="px-6 py-5 text-charcoal/60">
                                            {format(new Date(p.period_start), 'MMM d')} - {format(new Date(p.period_end), 'MMM d, yyyy')}
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="font-serif text-charcoal font-bold text-lg">₱{p.amount.toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-1.5">
                                                <CheckCircle2 size={12} /> {p.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {payouts.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-charcoal/30 italic">No historical settlements found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommissionsTab;
