import React, { useMemo } from 'react';
import { Calendar, Clock } from 'lucide-react';
import type { Booking, Therapist } from '../../types';
import { formatTimeTo12h, getBusinessDate } from '../../lib/utils';

interface LiveTimelineProps {
    bookings: Booking[];
    therapists: Therapist[];
}

const LiveTimeline: React.FC<LiveTimelineProps> = ({ bookings, therapists }) => {
    // 1. Filter for today's current business shift (4 PM to 4 AM)
    const todayBookings = useMemo(() => {
        const todayBusinessStr = getBusinessDate(new Date());

        return bookings.filter(b => {
            let bBusinessDate = b.booking_date;
            if (b.booking_time) {
                // Determine the business date for this specific booking
                const h = parseInt(b.booking_time.split(':')[0]);
                const [year, month, day] = b.booking_date.split('-');
                if (year && month && day) {
                    const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), h, 0, 0);
                    bBusinessDate = getBusinessDate(dateObj);
                }
            }

            return bBusinessDate === todayBusinessStr &&
                (b.status === 'confirmed' || b.status === 'completed');
        }).sort((a, b) => {
            // Sort chronologically, treating times < 16:00 as next day for the shift
            const getTimeVal = (timeStr: string) => {
                const [hStr, mStr] = timeStr.split(':');
                let h = parseInt(hStr);
                if (h < 16) h += 24;
                return h * 60 + parseInt(mStr);
            };
            return getTimeVal(a.booking_time) - getTimeVal(b.booking_time);
        });
    }, [bookings]);

    // 2. Set up the hours for the timeline (4 PM to 4 AM)
    // 16 to 28 (where 24 is midnight, 25 is 1 AM, up to 28 which is 4 AM)
    const hours = Array.from({ length: 13 }, (_, i) => i + 16);

    // 3. Helper to calculate position/width of a booking block on the timeline
    // Assuming each hour block is 100px wide for calculation purposes, though CSS handles actual rendering percentages
    const getTimelinePosition = (timeStr: string) => {
        const [hoursStr, minsStr] = timeStr.split(':');
        let h = parseInt(hoursStr);
        const m = parseInt(minsStr);

        // If the hour is past midnight (0 to 15), add 24 to place it on the next day's tail end of the shift
        if (h < 16) h += 24;

        // Start from 4 PM (16:00) 
        const hourOffset = h - 16;

        if (hourOffset < 0 || hourOffset > 12) return { left: '0%', width: '0%' }; // Outside open hours (4pm - 4am)

        const leftPercent = ((hourOffset * 60 + m) / (12 * 60)) * 100;
        // Assume 1 hour default duration for visualization if exact duration isn't available
        const widthPercent = (60 / (12 * 60)) * 100;

        return {
            left: `${Math.max(0, Math.min(leftPercent, 100))}%`,
            width: `${Math.min(widthPercent, 100 - leftPercent)}%`
        };
    };

    const getStatusColor = (status: string) => {
        return status === 'completed'
            ? 'bg-emerald-500 text-white'
            : 'bg-blue-500 text-white';
    };

    return (
        <div className="bg-white rounded-xl md:rounded-2xl border border-gold/10 shadow-sm p-4 md:p-6 mb-8 overflow-hidden">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-serif text-lg md:text-xl text-charcoal flex items-center gap-2">
                        <Clock className="text-gold" size={20} />
                        Live Shift Timeline
                    </h3>
                    <p className="text-xs text-charcoal/50 mt-1">Today's appointments. <span className="md:hidden text-gold">Swipe horizontally to view all hours.</span></p>
                </div>
                <div className="bg-gold/10 px-3 py-1.5 rounded-lg flex items-center gap-2 text-charcoal text-xs font-bold font-serif">
                    <Calendar size={14} className="text-gold" />
                    {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
            </div>

            {/* Timeline UI */}
            <div className="relative overflow-x-auto pb-6 custom-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                <div className="min-w-[700px] md:min-w-[800px] pr-8">
                    {/* Time Header Row - Sticky Top */}
                    <div className="flex ml-24 md:ml-32 border-b border-charcoal/5 pb-2 mb-4 relative h-6 sticky top-0 bg-white z-20">
                        {hours.map(hour => {
                            let displayHour = hour >= 24 ? hour - 24 : hour;
                            let label = `${displayHour}A`;
                            if (displayHour === 0) label = '12A';
                            else if (displayHour === 12) label = '12P';
                            else if (displayHour > 12) label = `${displayHour - 12}P`;

                            return (
                                <div key={hour} className="absolute text-[10px] text-charcoal/40 font-bold -translate-x-1/2" style={{ left: `${((hour - 16) / 12) * 100}%` }}>
                                    {label}
                                </div>
                            );
                        })}
                    </div>

                    {/* Therapist Rows */}
                    <div className="space-y-6">
                        {therapists.filter(t => t.active).map(therapist => {
                            const therapistBookings = todayBookings.filter(b => b.therapist_id === therapist.id);

                            return (
                                <div key={therapist.id} className="relative flex items-center">
                                    {/* Therapist Info Column - Sticky Left */}
                                    <div className="w-24 md:w-32 flex-shrink-0 flex items-center gap-2 z-10 bg-white pr-2 sticky left-0 border-r border-gold/10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                        <div className="w-8 h-8 rounded-full bg-gold/10 text-gold flex items-center justify-center font-serif text-sm border-2 border-white">
                                            {therapist.name.charAt(0)}
                                        </div>
                                        <p className="text-xs md:text-sm font-semibold text-charcoal truncate">{therapist.name}</p>
                                    </div>

                                    {/* Timeline Area for this therapist */}
                                    <div className="flex-1 relative h-10 border-l border-gold/20 bg-charcoal/[0.02] rounded-r-lg group">
                                        {/* Grid Lines */}
                                        <div className="absolute inset-0 flex pointer-events-none">
                                            {hours.map((_, i) => i > 0 && (
                                                <div key={i} className="h-full border-l border-charcoal/5" style={{ left: `${(i / 12) * 100}%`, position: 'absolute' }} />
                                            ))}
                                        </div>

                                        {/* Booking Blocks */}
                                        {therapistBookings.map(b => {
                                            const { left, width } = getTimelinePosition(b.booking_time);
                                            return (
                                                <div
                                                    key={b.id}
                                                    className={`absolute top-1 bottom-1 rounded-md shadow-sm border border-white/20 p-1 md:p-1.5 flex flex-col justify-center overflow-hidden group/block hover:z-20 transition-all cursor-pointer hover:shadow-md ${getStatusColor(b.status)}`}
                                                    style={{ left, width, minWidth: '40px' }}
                                                    title={`${formatTimeTo12h(b.booking_time)} - ${b.services?.title} (${b.guest_name || b.user_email})`}
                                                >
                                                    <p className="text-[9px] md:text-[10px] font-bold truncate leading-tight drop-shadow-md">
                                                        {b.guest_name?.split(' ')[0] || b.user_email.split('@')[0]}
                                                    </p>
                                                    <p className="text-[8px] md:text-[9px] opacity-80 truncate hidden md:block">
                                                        {b.services?.title}
                                                    </p>
                                                    <p className="text-[8px] opacity-90 truncate block md:hidden">
                                                        {formatTimeTo12h(b.booking_time)}
                                                    </p>

                                                    {/* Tooltip on Hover */}
                                                    <div className="absolute opacity-0 group-hover/block:opacity-100 pointer-events-none bottom-full mb-2 left-1/2 -translate-x-1/2 bg-charcoal text-white text-[10px] px-2 py-1 rounded-lg whitespace-nowrap z-50 transition-opacity">
                                                        <p className="font-bold text-gold">{formatTimeTo12h(b.booking_time)}</p>
                                                        <p>{b.guest_name || b.user_email}</p>
                                                        <p className="text-white/60">{b.services?.title}</p>
                                                        <div className="w-2 h-2 bg-charcoal absolute -bottom-1 left-1/2 -translate-x-1/2 rotate-45" />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Unassigned Row */}
                        {(() => {
                            const unassigned = todayBookings.filter(b => !b.therapist_id);
                            if (unassigned.length === 0) return null;

                            return (
                                <div className="relative flex items-center opacity-70">
                                    <div className="w-24 md:w-32 flex-shrink-0 flex items-center gap-2 z-10 bg-white pr-2 sticky left-0 border-r border-gold/10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                        <div className="w-8 h-8 rounded-full border border-dashed border-charcoal/30 text-charcoal/50 flex items-center justify-center font-serif text-sm bg-white">
                                            ?
                                        </div>
                                        <p className="text-xs md:text-sm font-semibold text-charcoal/50 truncate">Unassigned</p>
                                    </div>
                                    <div className="flex-1 relative h-10 border-l border-gold/20 bg-charcoal/[0.02] rounded-r-lg">
                                        <div className="absolute inset-0 flex pointer-events-none">
                                            {hours.map((_, i) => i > 0 && (
                                                <div key={i} className="h-full border-l border-charcoal/5" style={{ left: `${(i / 12) * 100}%`, position: 'absolute' }} />
                                            ))}
                                        </div>
                                        {unassigned.map(b => {
                                            const { left, width } = getTimelinePosition(b.booking_time);
                                            return (
                                                <div
                                                    key={b.id}
                                                    className={`absolute top-1 bottom-1 rounded-md shadow-sm border border-charcoal/10 border-dashed p-1.5 flex flex-col justify-center overflow-hidden bg-amber-100 text-amber-800`}
                                                    style={{ left, width, minWidth: '40px' }}
                                                >
                                                    <p className="text-[9px] md:text-[10px] font-bold truncate leading-tight">
                                                        {b.guest_name?.split(' ')[0] || b.user_email.split('@')[0]}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })()}

                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-charcoal/5 flex flex-wrap gap-4 text-[10px] font-bold uppercase tracking-widest text-charcoal/50">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-emerald-500" /> Completed
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-blue-500" /> Confirmed
                </div>
                {todayBookings.some(b => !b.therapist_id) && (
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm bg-amber-100 border border-dashed border-amber-300" /> Unassigned
                    </div>
                )}
            </div>
        </div >
    );
};

export default LiveTimeline;
