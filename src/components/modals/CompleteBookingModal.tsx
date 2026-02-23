import React, { useState, useMemo, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { createPortal } from 'react-dom';
import CustomDatePicker from '../ui/CustomDatePicker';
import { formatTimeTo12h, formatCurrency } from '../../lib/utils';
import CustomTimePicker from '../ui/CustomTimePicker';

interface CompleteBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (completionTime: string, tipAmount: number, tipRecipient: 'management' | 'therapist' | null) => void;
    bookingDate: string;
    bookingTime?: string;
    duration?: number;
    servicePrice?: number;
}

const CompleteBookingModal: React.FC<CompleteBookingModalProps> = ({ isOpen, onClose, onConfirm, bookingDate, bookingTime, duration, servicePrice = 0 }) => {
    // Initialized calculated date and time based on booking start + duration
    const initialState = useMemo(() => {
        if (!bookingTime || !bookingDate) {
            return {
                date: bookingDate || new Date().toISOString().split('T')[0],
                time: new Date().toTimeString().slice(0, 5)
            };
        }

        try {
            const h = parseInt(bookingTime.split(':')[0] || '0');
            const m = parseInt(bookingTime.split(':')[1] || '0');
            const [year, month, day] = bookingDate.split('-').map(Number);

            const dateObj = new Date(year, month - 1, day, h, m + (duration || 60), 0, 0);

            if (isNaN(dateObj.getTime())) {
                throw new Error("Invalid date calculated");
            }

            // Use local date methods to avoid UTC timezone shifts when building YYYY-MM-DD
            const localDate = `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${dateObj.getDate().toString().padStart(2, '0')}`;
            const localTime = `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;

            return {
                date: localDate,
                time: localTime
            };
        } catch (e) {
            console.warn("Date calculation fallback:", e);
            return {
                date: bookingDate || new Date().toISOString().split('T')[0],
                time: new Date().toTimeString().slice(0, 5)
            };
        }
    }, [bookingDate, bookingTime, duration]);

    const [date, setDate] = useState(initialState.date);
    const [time, setTime] = useState(initialState.time);
    const [tipAmount, setTipAmount] = useState<number | ''>('');
    const [tipRecipient, setTipRecipient] = useState<'management' | 'therapist'>('management');

    const totalAmount = useMemo(() => {
        const tip = typeof tipAmount === 'number' ? tipAmount : 0;
        return servicePrice + tip;
    }, [servicePrice, tipAmount]);

    // Reset weights if props change/modal re-opens
    useEffect(() => {
        if (isOpen) {
            setDate(initialState.date);
            setTime(initialState.time);
            setTipAmount('');
            setTipRecipient('management');
        }
    }, [isOpen, initialState]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-charcoal/80 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="font-serif text-xl text-charcoal">Complete Booking</h2>
                    <button onClick={onClose} className="text-charcoal/40 hover:text-charcoal transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    <p className="text-sm text-charcoal/60 mb-4 pb-4 border-b border-charcoal/10">
                        Confirm completion details and enter any additional gratuity below.
                    </p>

                    <div className="space-y-4">
                        <CustomDatePicker
                            label="Completion Date"
                            value={date}
                            onChange={setDate}
                            direction="down"
                        />
                        <CustomTimePicker
                            label="Completion Time"
                            value={time}
                            onChange={setTime}
                            direction="down"
                        />
                    </div>

                    <div className="pt-4 space-y-4">
                        <div className="flex justify-between items-center text-charcoal/80">
                            <span className="font-semibold">Service Fee</span>
                            <span className="font-serif text-lg">{formatCurrency(servicePrice)}</span>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-charcoal/80">
                                Additional Tip
                            </label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/40 font-serif">₱</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={tipAmount}
                                        onChange={(e) => setTipAmount(e.target.value ? Number(e.target.value) : '')}
                                        className="w-full h-12 bg-charcoal/5 pl-8 pr-4 rounded-xl border-none focus:ring-2 focus:ring-gold/50 font-serif text-charcoal"
                                        placeholder="0.00"
                                    />
                                </div>
                                <select
                                    value={tipRecipient}
                                    onChange={(e) => setTipRecipient(e.target.value as 'management' | 'therapist')}
                                    className="h-12 bg-charcoal/5 px-4 rounded-xl border-none focus:ring-2 focus:ring-gold/50 outline-none text-charcoal text-sm font-medium"
                                >
                                    <option value="management">Management</option>
                                    <option value="therapist">Therapist</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-charcoal/10">
                            <span className="font-bold text-charcoal">Total Received</span>
                            <span className="font-serif text-2xl text-gold">{formatCurrency(totalAmount)}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 border border-charcoal/10 rounded-xl font-bold text-charcoal/60 hover:bg-charcoal/5 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(`${date}T${time}:00`, typeof tipAmount === 'number' ? tipAmount : 0, typeof tipAmount === 'number' && tipAmount > 0 ? tipRecipient : null)}
                        className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                    >
                        <Check size={18} /> Finish
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default CompleteBookingModal;
