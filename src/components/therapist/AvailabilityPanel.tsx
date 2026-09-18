import React from 'react';
import { Calendar, Save } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

interface AvailabilityPanelProps {
    unavailableDates: Date[];
    onSelect: (dates: Date[]) => void;
    onSave: () => void;
    isSaving: boolean;
}

const AvailabilityPanel: React.FC<AvailabilityPanelProps> = ({
    unavailableDates,
    onSelect,
    onSave,
    isSaving
}) => {
    return (
        <div className="mt-12 bg-white rounded-2xl border border-gold/10 p-6 md:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                            <Calendar className="text-gold" size={20} />
                        </div>
                        <div>
                            <h2 className="font-serif text-xl text-charcoal">Manage Availability</h2>
                            <p className="text-xs text-charcoal/50">Select days you will be completely unavailable for bookings.</p>
                        </div>
                    </div>
                    <p className="text-sm text-charcoal/70 mb-6 leading-relaxed">
                        Click on any date to toggle your availability. Dates selected here will be blocked off on the main booking calendar, preventing clients from selecting you on your days off.
                    </p>

                    <button
                        onClick={onSave}
                        disabled={isSaving}
                        className="w-full md:w-auto flex items-center justify-center gap-2 bg-charcoal text-white px-6 py-3 rounded-xl hover:bg-charcoal/90 transition-colors disabled:opacity-50 text-sm font-bold tracking-widest uppercase"
                    >
                        {isSaving ? (
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save size={16} />
                        )}
                        {isSaving ? 'Saving...' : 'Save Availability'}
                    </button>
                </div>

                <div className="bg-[#F9F7F2] p-4 rounded-xl border border-gold/10 mx-auto md:mx-0">
                    <style dangerouslySetInnerHTML={{
                        __html: `
                        .rdp { 
                            --rdp-accent-color: #E11D48;
                            --rdp-accent-color-dark: #BE123C;
                            margin: 0;
                        }
                        
                        /* Mobile responsiveness fix */
                        @media (max-width: 400px) {
                            .rdp {
                                --rdp-cell-size: 38px;
                            }
                            .rdp-month {
                                width: 100%;
                            }
                            .rdp-table {
                                max-width: 100%;
                            }
                        }

                        .rdp-selected .rdp-day_button {
                            background-color: #E11D48 !important;
                            color: white !important;
                            border-radius: 8px !important;
                        }

                        .rdp-selected {
                            background-color: #E11D48 !important;
                            color: white !important;
                            border-radius: 8px !important;
                        }
                        
                        /* Today's marker */
                        .rdp-today .rdp-day_button {
                            border: 2px solid #997B3D !important;
                            border-radius: 8px !important;
                            font-weight: bold !important;
                        }

                        .rdp-day_button:hover:not([disabled]) {
                            background-color: rgba(225, 29, 72, 0.1) !important;
                            border-radius: 8px !important;
                        }
                    `}} />
                    <DayPicker
                        mode="multiple"
                        selected={unavailableDates}
                        onSelect={(dates) => onSelect(dates as Date[])}
                        disabled={{ before: new Date() }}
                    />
                </div>
            </div>
        </div>
    );
};

export default AvailabilityPanel;
