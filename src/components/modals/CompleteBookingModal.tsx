import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import CustomDatePicker from '../ui/CustomDatePicker';
import CustomTimePicker from '../ui/CustomTimePicker';

interface CompleteBookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (completionTime: string) => void;
    bookingDate: string;
}

const CompleteBookingModal: React.FC<CompleteBookingModalProps> = ({ isOpen, onClose, onConfirm, bookingDate }) => {
    const [date, setDate] = useState(bookingDate);
    const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-charcoal/80 backdrop-blur-sm">
            <div className="bg-white w-full max-sm rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="font-serif text-xl text-charcoal">Complete Booking</h2>
                    <button onClick={onClose} className="text-charcoal/40 hover:text-charcoal transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    <p className="text-sm text-charcoal/60 mb-4">
                        Please confirm the actual date and time when the service was completed.
                    </p>
                    <CustomDatePicker
                        label="Completion Date"
                        value={date}
                        onChange={setDate}
                    />
                    <CustomTimePicker
                        label="Completion Time"
                        value={time}
                        onChange={setTime}
                        step={1} // Precision of 1 minute for completion
                    />
                </div>

                <div className="mt-8 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 border border-charcoal/10 rounded-xl font-bold text-charcoal/60 hover:bg-charcoal/5 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(`${date}T${time}:00`)}
                        className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                    >
                        <Check size={18} /> Finish
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CompleteBookingModal;
