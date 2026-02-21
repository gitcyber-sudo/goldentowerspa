import React from 'react';
import { Users } from 'lucide-react';
import type { Booking, Therapist } from '../../types';

interface AssignTherapistModalProps {
    isOpen: boolean;
    onClose: () => void;
    booking: Booking | null;
    therapists: Therapist[];
    onAssign: (bookingId: string, therapistId: string) => void;
}

const AssignTherapistModal: React.FC<AssignTherapistModalProps> = ({ isOpen, onClose, booking, therapists, onAssign }) => {
    if (!isOpen || !booking) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/80 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-2xl p-6 md:p-8 shadow-2xl text-center">
                <Users className="text-gold mx-auto mb-4" size={32} />
                <h2 className="font-serif text-xl md:text-2xl text-charcoal mb-2">Assign Specialist</h2>
                <p className="text-sm text-charcoal/60 mt-1">Manage and monitor client treatments</p>
                <p className="text-sm text-charcoal/60 mb-6">Select a therapist for <b>{booking.guest_name || booking.user_email}</b></p>
                <div className="space-y-3 mb-8 max-h-[40vh] overflow-y-auto">
                    {therapists.map(t => {
                        const isUnavailable = booking.booking_date && t.unavailable_blockouts &&
                            Array.isArray(t.unavailable_blockouts) &&
                            t.unavailable_blockouts.some(d => {
                                const blockedDate = new Date(d).toDateString();
                                const selectedDate = new Date(booking.booking_date).toDateString();
                                return blockedDate === selectedDate;
                            });

                        return (
                            <button
                                key={t.id}
                                onClick={() => !isUnavailable && onAssign(booking.id, t.id)}
                                disabled={!!isUnavailable}
                                className={`w-full p-4 border rounded-xl flex items-center gap-4 transition-all ${isUnavailable
                                        ? 'opacity-50 grayscale border-gray-200 bg-gray-50 cursor-not-allowed'
                                        : 'border-gold/10 hover:border-gold hover:bg-gold/5'
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-serif ${isUnavailable ? 'bg-gray-200 text-gray-400' : 'bg-gold/10 text-gold'}`}>
                                    {t.name.charAt(0)}
                                </div>
                                <div className="text-left">
                                    <p className={`font-bold ${isUnavailable ? 'text-gray-400' : 'text-charcoal'}`}>
                                        {t.name} {isUnavailable && <span className="text-[10px] font-normal block text-rose-500">(Unavailable on this date)</span>}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>
                <button onClick={onClose} className="text-charcoal/40 text-xs font-bold uppercase tracking-widest">Cancel</button>
            </div>
        </div>
    );
};

export default AssignTherapistModal;
