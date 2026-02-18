import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface CustomDatePickerProps {
    value: string; // YYYY-MM-DD
    onChange: (date: string) => void;
    minDate?: string;
    label?: string;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ value, onChange, minDate, label }) => {
    const [viewDate, setViewDate] = useState(new Date(value || new Date()));
    const [isOpen, setIsOpen] = useState(false);

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const handleSelectDate = (day: number) => {
        const selected = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        const dateStr = selected.toISOString().split('T')[0];
        onChange(dateStr);
        setIsOpen(false);
    };

    const calendarDays = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const totalDays = daysInMonth(year, month);
        const startDay = firstDayOfMonth(year, month);
        const days = [];

        // Padding for previous month
        for (let i = 0; i < startDay; i++) {
            days.push(null);
        }

        // Days of current month
        for (let i = 1; i <= totalDays; i++) {
            days.push(i);
        }

        return days;
    }, [viewDate]);

    const isSelected = (day: number) => {
        if (!value) return false;
        const d = new Date(value);
        return d.getFullYear() === viewDate.getFullYear() &&
            d.getMonth() === viewDate.getMonth() &&
            d.getDate() === day;
    };

    const isDisabled = (day: number) => {
        if (!minDate) return false;
        const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        const m = new Date(minDate);
        m.setHours(0, 0, 0, 0);
        return d < m;
    };

    const isToday = (day: number) => {
        const today = new Date();
        return today.getFullYear() === viewDate.getFullYear() &&
            today.getMonth() === viewDate.getMonth() &&
            today.getDate() === day;
    };

    return (
        <div className="relative w-full">
            {label && (
                <label className="block text-xs uppercase tracking-widest font-bold text-gold mb-2 flex items-center">
                    <CalendarIcon size={14} className="mr-2" /> {label}
                </label>
            )}

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-white border border-gold/20 p-3.5 md:p-4 rounded-xl flex items-center justify-between text-charcoal hover:border-gold transition-colors focus:outline-none focus:ring-1 focus:ring-gold/30"
            >
                <span className="font-medium">
                    {value ? new Date(value).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Select Date'}
                </span>
                <CalendarIcon size={18} className="text-gold" />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-[120]" onClick={() => setIsOpen(false)} />
                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gold/20 rounded-2xl shadow-2xl p-4 z-[130] animate-in fade-in slide-in-from-bottom-2 duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <button
                                type="button"
                                onClick={handlePrevMonth}
                                className="p-2 hover:bg-gold/5 rounded-full text-gold transition-colors"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <h4 className="font-serif font-bold text-charcoal">
                                {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
                            </h4>
                            <button
                                type="button"
                                onClick={handleNextMonth}
                                className="p-2 hover:bg-gold/5 rounded-full text-gold transition-colors"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>

                        {/* Weekdays */}
                        <div className="grid grid-cols-7 mb-2">
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                <div key={d} className="text-center text-[10px] font-bold uppercase tracking-widest text-gold/50 py-2">
                                    {d}
                                </div>
                            ))}
                        </div>

                        {/* Days */}
                        <div className="grid grid-cols-7 gap-1">
                            {calendarDays.map((day, i) => (
                                <div key={i} className="aspect-square flex items-center justify-center">
                                    {day ? (
                                        <button
                                            type="button"
                                            disabled={isDisabled(day)}
                                            onClick={() => handleSelectDate(day)}
                                            className={`
                                                w-full h-full rounded-lg text-sm font-medium transition-all flex items-center justify-center
                                                ${isSelected(day)
                                                    ? 'bg-gold text-white shadow-lg shadow-gold/30'
                                                    : isDisabled(day)
                                                        ? 'text-charcoal/10 cursor-not-allowed'
                                                        : isToday(day)
                                                            ? 'bg-gold/10 text-gold border border-gold/30 font-bold'
                                                            : 'text-charcoal/70 hover:bg-gold/10 hover:text-gold'
                                                }
                                            `}
                                        >
                                            {day}
                                        </button>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CustomDatePicker;
