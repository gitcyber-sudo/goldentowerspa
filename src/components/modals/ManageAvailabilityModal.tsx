import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Save, RefreshCw, AlertCircle } from 'lucide-react';
import { createPortal } from 'react-dom';
import { DayPicker } from 'react-day-picker';
import { format, parseISO, isSameDay } from 'date-fns';
import { supabase } from '../../lib/supabase';
import type { Therapist } from '../../types';

interface ManageAvailabilityModalProps {
    isOpen: boolean;
    onClose: () => void;
    therapist: Therapist | null;
    onSuccess: () => void;
}

const ManageAvailabilityModal: React.FC<ManageAvailabilityModalProps> = ({ isOpen, onClose, therapist, onSuccess }) => {
    const [selectedDates, setSelectedDates] = useState<Date[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen && therapist) {
            // Initialize selected dates from therapist.unavailable_blockouts
            const blockouts = therapist.unavailable_blockouts || [];
            const dates = blockouts.map((d: string) => parseISO(d));
            setSelectedDates(dates);
        }
    }, [isOpen, therapist]);

    const handleSave = async () => {
        if (!therapist) return;
        setSaving(true);

        try {
            const formattedDates = selectedDates
                .sort((a, b) => a.getTime() - b.getTime())
                .map(d => format(d, 'yyyy-MM-dd'));

            const { error } = await supabase
                .from('therapists')
                .update({ unavailable_blockouts: formattedDates })
                .eq('id', therapist.id);

            if (error) throw error;

            alert(`Availability updated for ${therapist.name}`);
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error saving availability:', error);
            alert('Error saving availability: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen || !therapist) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-6 md:p-8 border-b border-gold/10 flex justify-between items-center bg-cream/30">
                    <div>
                        <p className="text-gold font-bold tracking-[0.2em] uppercase text-[10px] mb-1">Manage Schedule</p>
                        <h2 className="text-2xl font-serif text-charcoal">{therapist.name}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gold/10 rounded-full transition-colors">
                        <X size={24} className="text-charcoal/40" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 md:p-8">
                    <div className="mb-6 bg-gold/5 border border-gold/10 rounded-2xl p-4 flex gap-3 items-start">
                        <AlertCircle size={20} className="text-gold shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-bold text-charcoal mb-1">Block Unavailable Dates</p>
                            <p className="text-xs text-charcoal/60 leading-relaxed">
                                Select dates on the calendar to mark them as **Unavailable**. Patients will not be able to book this specialist on selected dates.
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-center mb-6 availability-calendar-wrapper">
                        <style>{`
                            .availability-calendar-wrapper .rdp {
                                --rdp-accent-color: #F87171;
                                --rdp-accent-color-dark: #EF4444;
                                margin: 0;
                            }
                            .availability-calendar-wrapper .rdp-day_selected,
                            .availability-calendar-wrapper .rdp-selected {
                                background-color: #F87171 !important;
                                color: white !important;
                                border-radius: 10px !important;
                            }
                            .availability-calendar-wrapper .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
                                background-color: rgba(153, 123, 61, 0.1);
                                border-radius: 10px;
                            }
                        `}</style>
                        <DayPicker
                            mode="multiple"
                            min={1}
                            selected={selectedDates}
                            onSelect={(dates) => setSelectedDates(dates || [])}
                            modifiers={{
                                today: new Date()
                            }}
                            modifiersStyles={{
                                today: { border: '2px solid #997B3D', borderRadius: '10px' }
                            }}
                        />
                    </div>

                    <div className="flex justify-between items-center text-xs text-charcoal/40 font-medium px-4 mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-400 rounded-[4px]" />
                            <span>Blocked (Unavailable)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 border border-charcoal/10 rounded-[4px]" />
                            <span>Available</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 md:p-8 bg-charcoal/5 border-t border-gold/10 flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 border border-charcoal/10 rounded-2xl font-bold text-charcoal/60 hover:bg-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-[2] py-4 bg-gold text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gold-dark transition-all shadow-lg shadow-gold/20 disabled:opacity-50 active:scale-95"
                    >
                        {saving ? (
                            <RefreshCw size={18} className="animate-spin" />
                        ) : (
                            <Save size={18} />
                        )}
                        <span>Save Availability</span>
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ManageAvailabilityModal;
