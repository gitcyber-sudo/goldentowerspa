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
                    {therapists.map(t => (
                        <button key={t.id} onClick={() => onAssign(booking.id, t.id)} className="w-full p-4 border border-gold/10 rounded-xl hover:border-gold hover:bg-gold/5 flex items-center gap-4 transition-all">
                            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center font-serif text-gold">{t.name.charAt(0)}</div>
                            <div className="text-left"><p className="font-bold text-charcoal">{t.name}</p></div>
                        </button>
                    ))}
                </div>
                <button onClick={onClose} className="text-charcoal/40 text-xs font-bold uppercase tracking-widest">Cancel</button>
            </div>
        </div>
    );
};

export default AssignTherapistModal;
