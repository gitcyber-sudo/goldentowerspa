import React, { useState, useMemo } from 'react';
import { Clock, Check } from 'lucide-react';

interface CustomTimePickerProps {
    value: string; // HH:mm
    onChange: (time: string) => void;
    label?: string;
    step?: number; // minutes
}

const CustomTimePicker: React.FC<CustomTimePickerProps> = ({ value, onChange, label, step = 5 }) => {
    const [isOpen, setIsOpen] = useState(false);

    const timeSlots = useMemo(() => {
        const slots = [];
        for (let hour = 9; hour <= 23; hour++) { // 9 AM to 11 PM
            for (let min = 0; min < 60; min += step) {
                const h = hour.toString().padStart(2, '0');
                const m = min.toString().padStart(2, '0');
                const period = hour >= 12 ? 'PM' : 'AM';
                const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
                slots.push({
                    value: `${h}:${m}`,
                    label: `${displayHour}:${m} ${period}`
                });
            }
        }
        return slots;
    }, [step]);

    const handleSelect = (time: string) => {
        onChange(time);
        setIsOpen(false);
    };

    return (
        <div className="relative w-full">
            {label && (
                <label className="block text-xs uppercase tracking-widest font-bold text-gold mb-2 flex items-center">
                    <Clock size={14} className="mr-2" /> {label}
                </label>
            )}

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-white border border-gold/20 p-3.5 md:p-4 rounded-xl flex items-center justify-between text-charcoal hover:border-gold transition-colors focus:outline-none focus:ring-1 focus:ring-gold/30"
            >
                <span className="font-medium">
                    {value ? (
                        timeSlots.find(s => s.value === value)?.label || value
                    ) : 'Select Time'}
                </span>
                <Clock size={18} className="text-gold" />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-[120]" onClick={() => setIsOpen(false)} />
                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gold/20 rounded-2xl shadow-2xl p-4 z-[130] animate-in fade-in slide-in-from-bottom-2 duration-200">
                        {step <= 5 ? (
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-center gap-4 h-[200px]">
                                    {/* Hours Column */}
                                    <div className="flex-1 overflow-y-auto h-full space-y-1 pr-1 custom-scrollbar text-center">
                                        {Array.from({ length: 12 }, (_, i) => i + 1).map(h => {
                                            const currentH = parseInt(value.split(':')[0]);
                                            const displayH = currentH > 12 ? currentH - 12 : (currentH === 0 ? 12 : currentH);
                                            return (
                                                <button
                                                    key={h}
                                                    type="button"
                                                    onClick={() => {
                                                        const m = value.split(':')[1] || '00';
                                                        const p = parseInt(value.split(':')[0]) >= 12 ? 'PM' : 'AM';
                                                        let newH = h === 12 ? 0 : h;
                                                        if (p === 'PM') newH += 12;
                                                        onChange(`${newH.toString().padStart(2, '0')}:${m}`);
                                                    }}
                                                    className={`w-full py-2 rounded-lg text-sm font-bold transition-all ${displayH === h ? 'bg-gold text-white' : 'hover:bg-gold/5 text-charcoal/40'}`}
                                                >
                                                    {h.toString().padStart(2, '0')}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <div className="text-gold font-bold">:</div>
                                    {/* Minutes Column */}
                                    <div className="flex-1 overflow-y-auto h-full space-y-1 pr-1 custom-scrollbar text-center">
                                        {Array.from({ length: 60 }, (_, i) => i).map(m => {
                                            const currentM = parseInt(value.split(':')[1] || '0');
                                            return (
                                                <button
                                                    key={m}
                                                    type="button"
                                                    onClick={() => {
                                                        const h = value.split(':')[0] || '12';
                                                        onChange(`${h}:${m.toString().padStart(2, '0')}`);
                                                    }}
                                                    className={`w-full py-2 rounded-lg text-sm font-bold transition-all ${currentM === m ? 'bg-gold text-white' : 'hover:bg-gold/5 text-charcoal/40'}`}
                                                >
                                                    {m.toString().padStart(2, '0')}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {/* AM/PM Column */}
                                    <div className="flex-1 flex flex-col justify-center space-y-2 h-full">
                                        {['AM', 'PM'].map(p => {
                                            const currentH = parseInt(value.split(':')[0] || '0');
                                            const currentP = currentH >= 12 ? 'PM' : 'AM';
                                            return (
                                                <button
                                                    key={p}
                                                    type="button"
                                                    onClick={() => {
                                                        let [h, m] = value.split(':');
                                                        let newH = parseInt(h);
                                                        if (p === 'PM' && newH < 12) newH += 12;
                                                        if (p === 'AM' && newH >= 12) newH -= 12;
                                                        onChange(`${newH.toString().padStart(2, '0')}:${m}`);
                                                    }}
                                                    className={`w-full py-3 rounded-lg text-xs font-bold transition-all ${currentP === p ? 'bg-gold text-white shadow-md shadow-gold/20' : 'bg-gold/5 text-charcoal/40 border border-gold/10'}`}
                                                >
                                                    {p}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="w-full bg-charcoal text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gold transition-colors"
                                >
                                    Done
                                </button>
                            </div>
                        ) : (
                            <div className="max-h-[300px] overflow-y-auto grid grid-cols-3 gap-2 pr-1 custom-scrollbar">
                                {timeSlots.map((slot) => (
                                    <button
                                        key={slot.value}
                                        type="button"
                                        onClick={() => handleSelect(slot.value)}
                                        className={`
                                            p-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1
                                            ${value === slot.value
                                                ? 'bg-gold text-white shadow-md shadow-gold/20'
                                                : 'hover:bg-gold/10 text-charcoal/60 hover:text-gold border border-transparent hover:border-gold/20'
                                            }
                                        `}
                                    >
                                        {slot.label}
                                        {value === slot.value && <Check size={10} />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default CustomTimePicker;
