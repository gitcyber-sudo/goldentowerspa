import React, { useMemo } from 'react';
import { Calendar, Clock, MapPin, User, Timer, ArrowRight } from 'lucide-react';
import type { Booking, Therapist } from '../../types';
import { formatTimeTo12h, getPHTDateString } from '../../lib/utils';

interface LiveTimelineProps {
    bookings: Booking[];
    therapists: Therapist[];
    /**
     * When true, renders a public-friendly version (no client names, simpler style).
     * When false (default), renders the full admin version.
     */
    isPublic?: boolean;
}

/**
 * Timeline slots: 3-hour increments from 12 AM today to 4 AM next day.
 * The slots represent boundaries. Bookings are placed into the slot whose
 * range contains their start time.
 *
 * Slots: 12AM, 3AM, 6AM, 9AM, 12PM, 3PM, 6PM, 9PM, 12AM (next day), 3AM (next day ends at 4AM)
 */
const TIMELINE_SLOTS = [0, 3, 6, 9, 12, 15, 18, 21, 24, 27]; // 24 = 12AM next day, 27 = 3AM next day

const getSlotLabel = (slot: number): string => {
    const hour = slot % 24;
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
};

const getEndTime = (startTime: string, durationMinutes: number): string => {
    const [h, m] = startTime.split(':').map(Number);
    const totalMinutes = h * 60 + m + durationMinutes;
    const endH = Math.floor(totalMinutes / 60) % 24;
    const endM = totalMinutes % 60;
    return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
};

const formatDurationShort = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

const LiveTimeline: React.FC<LiveTimelineProps> = ({ bookings, therapists, isPublic = false }) => {
    // Determine today in PHT. When the clock hits 12 AM PHT, todayPHT changes to the new date.
    const todayPHT = getPHTDateString(new Date());

    // "Next day" for the midnight marker — use PHT offset to avoid UTC date mismatch
    const phtOffset = 8 * 60 * 60 * 1000;
    const tomorrowTs = new Date(`${todayPHT}T00:00:00+08:00`).getTime() + 24 * 60 * 60 * 1000;
    const tomorrowPHT = new Date(tomorrowTs + phtOffset).toISOString().split('T')[0];
    const tomorrowLabel = new Date(`${tomorrowPHT}T00:00:00+08:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    // Filter bookings: today's bookings (confirmed/pending) + next day's early AM (0:00-3:59)
    const timelineBookings = useMemo(() => {
        const validStatuses = ['confirmed', 'completed'];
        const todayB = bookings.filter(b =>
            validStatuses.includes(b.status) && b.booking_date === todayPHT
        );
        // Next day's bookings that fall in 0:00-3:59 range (the tail of our timeline)
        const nextDayEarlyB = bookings.filter(b => {
            if (!validStatuses.includes(b.status)) return false;
            if (b.booking_date !== tomorrowPHT) return false;
            const h = parseInt((b.booking_time || '00:00').split(':')[0]);
            return h < 4;
        });
        return [...todayB, ...nextDayEarlyB].sort((a, b) => {
            // Sort by effective time (today bookings first, then tomorrow)
            const aIsNextDay = a.booking_date === tomorrowPHT;
            const bIsNextDay = b.booking_date === tomorrowPHT;
            if (aIsNextDay !== bIsNextDay) return aIsNextDay ? 1 : -1;
            return (a.booking_time || '').localeCompare(b.booking_time || '');
        });
    }, [bookings, todayPHT, tomorrowPHT]);

    // Group bookings into timeline slots
    const slotBookings = useMemo(() => {
        const groups: Record<number, Booking[]> = {};
        TIMELINE_SLOTS.forEach(s => { groups[s] = []; });

        timelineBookings.forEach(b => {
            const hour = parseInt((b.booking_time || '00:00').split(':')[0]);
            const isNextDay = b.booking_date === tomorrowPHT;
            const effectiveHour = isNextDay ? hour + 24 : hour;

            // Find which slot this belongs to (the largest slot <= effectiveHour)
            let targetSlot = TIMELINE_SLOTS[0];
            for (const slot of TIMELINE_SLOTS) {
                if (effectiveHour >= slot) targetSlot = slot;
            }
            if (groups[targetSlot]) {
                groups[targetSlot].push(b);
            }
        });
        return groups;
    }, [timelineBookings, tomorrowPHT]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'border-l-emerald-500 bg-emerald-50/50';
            case 'confirmed': return 'border-l-blue-500 bg-blue-50/50';
            default: return 'border-l-amber-500 bg-amber-50/50';
        }
    };

    const getStatusDotColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-emerald-400';
            case 'confirmed': return 'bg-blue-400';
            default: return 'bg-amber-400';
        }
    };

    // Current hour in PHT for precise "now" indicator
    const currentPHTDate = new Date(Date.now() + phtOffset);
    const currentHourPHT = currentPHTDate.getUTCHours();
    const currentMinPHT = currentPHTDate.getUTCMinutes();

    const BookingEntry = ({ booking }: { booking: Booking }) => {
        const therapist = therapists.find(t => t.id === booking.therapist_id);
        const duration = booking.services?.duration || 60;
        const endTime = getEndTime(booking.booking_time || '00:00', duration);
        const isHomeService = (booking.services?.title || '').toLowerCase().includes('home');

        return (
            <div className={`border-l-4 rounded-xl p-3 md:p-4 transition-all hover:shadow-md ${getStatusColor(booking.status)}`}>
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        {/* Time & Duration Row */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="text-xs font-bold text-charcoal">
                                {formatTimeTo12h(booking.booking_time || '00:00')}
                            </span>
                            <ArrowRight size={10} className="text-charcoal/30" />
                            <span className="text-xs font-bold text-charcoal/60">
                                {formatTimeTo12h(endTime)}
                            </span>
                            <span className="text-[9px] bg-charcoal/5 px-1.5 py-0.5 rounded text-charcoal/50 font-bold">
                                {formatDurationShort(duration)}
                            </span>
                            {isHomeService && (
                                <span className="text-[8px] bg-gold/10 text-gold px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5">
                                    <MapPin size={8} /> HOME
                                </span>
                            )}
                        </div>

                        {/* Service Title */}
                        <p className="text-[11px] md:text-xs text-charcoal/60 truncate mb-1.5">
                            {booking.services?.title || 'Service'}
                        </p>

                        {/* Client (admin only) */}
                        {!isPublic && (
                            <p className="text-[10px] text-charcoal/40 truncate">
                                {booking.guest_name || booking.user_email?.split('@')[0] || 'Walk-in'}
                            </p>
                        )}
                    </div>

                    {/* Therapist Badge */}
                    <div className="flex-shrink-0 flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-gold/10 shadow-sm">
                        {therapist?.image_url ? (
                            <img src={therapist.image_url} alt="" className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                            <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center text-[10px] font-bold text-gold">
                                {therapist ? therapist.name.charAt(0) : '?'}
                            </div>
                        )}
                        <span className="text-[10px] font-bold text-charcoal truncate max-w-[70px] md:max-w-[90px]">
                            {therapist ? therapist.name : 'Unassigned'}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    const totalBookings = timelineBookings.length;

    return (
        <div className={`${isPublic ? 'bg-white/80 backdrop-blur-md' : 'bg-white'} rounded-2xl border border-gold/10 shadow-sm p-4 md:p-6 overflow-hidden`}>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
                <div>
                    <h3 className="font-serif text-lg md:text-xl text-charcoal flex items-center gap-2">
                        <Clock className="text-gold" size={20} />
                        {isPublic ? 'Today\'s Schedule' : 'Live Shift Timeline'}
                    </h3>
                    <p className="text-[10px] md:text-xs text-charcoal/50 mt-1">
                        {isPublic
                            ? 'See which therapists are booked today — plan your visit accordingly'
                            : `${totalBookings} session${totalBookings !== 1 ? 's' : ''} scheduled today`
                        }
                    </p>
                </div>
                <div className="bg-gold/10 px-3 py-1.5 rounded-xl flex items-center gap-2 text-charcoal text-xs font-bold font-serif whitespace-nowrap self-start">
                    <Calendar size={14} className="text-gold" />
                    {new Date(`${todayPHT}T00:00:00+08:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </div>
            </div>

            {/* Timeline */}
            <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-[58px] md:left-[90px] top-0 bottom-0 w-px bg-gradient-to-b from-gold/30 via-charcoal/10 to-charcoal/5" />

                <div className="space-y-0">
                    {TIMELINE_SLOTS.map((slot, index) => {
                        const isNextDay = slot >= 24;
                        const displayHour = slot % 24;
                        const isMidnightNextDay = slot === 24;
                        const slotData = slotBookings[slot] || [];
                        const hasBookings = slotData.length > 0;

                        // Check if current time falls within this 3-hour slot
                        const slotStartHour = slot;
                        const slotEndHour = TIMELINE_SLOTS[index + 1] ?? 28;
                        const isCurrentSlot = !isNextDay
                            && currentHourPHT >= slotStartHour
                            && currentHourPHT < slotEndHour;

                        // Calculate "now" line position within this slot (0-100%)
                        const nowLinePercent = isCurrentSlot
                            ? ((currentHourPHT - slotStartHour) * 60 + currentMinPHT) / ((slotEndHour - slotStartHour) * 60) * 100
                            : 0;

                        return (
                            <React.Fragment key={slot}>
                                {/* Midnight next day marker */}
                                {isMidnightNextDay && (
                                    <div className="flex items-center gap-3 my-4">
                                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-gold/10 rounded-full border border-gold/20">
                                            <Calendar size={10} className="text-gold" />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-gold">
                                                {tomorrowLabel}
                                            </span>
                                        </div>
                                        <div className="h-px flex-1 bg-gradient-to-l from-transparent via-gold/40 to-transparent" />
                                    </div>
                                )}

                                <div className={`group flex gap-3 md:gap-6 ${hasBookings ? 'pb-5' : 'pb-1.5'} relative min-h-[48px]`}>
                                    {/* Time Label */}
                                    <div className="w-[40px] md:w-[60px] flex-shrink-0 text-right pt-[3px]">
                                        <span className={`text-[10px] md:text-xs font-bold font-serif transition-colors whitespace-nowrap leading-3 ${hasBookings ? 'text-charcoal/70' : 'text-charcoal/20'}`}>
                                            {getSlotLabel(slot)}
                                        </span>
                                    </div>

                                    {/* Node */}
                                    <div className="relative flex-shrink-0 w-3 flex items-start pt-[3px]">
                                        <div className={`w-3 h-3 rounded-full border-2 bg-white z-10 transition-all ${hasBookings ? 'border-gold scale-110' : 'border-charcoal/10 scale-75 group-hover:border-gold/30'}`} />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 relative">
                                        {hasBookings ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {slotData.map(b => (
                                                    <BookingEntry key={b.id} booking={b} />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="h-4" />
                                        )}
                                    </div>

                                    {/* NOW indicator line — positioned at the row level so it aligns with the vertical rail */}
                                    {isCurrentSlot && (
                                        <div
                                            className="absolute z-20 flex items-center pointer-events-none left-[52px] md:left-[84px] right-0"
                                            style={{ top: `${nowLinePercent}%` }}
                                        >
                                            {/* Blinking circle centered on the vertical rail */}
                                            <div className="relative flex-shrink-0 w-3 h-3">
                                                <div className="absolute inset-0 rounded-full bg-gold animate-ping" />
                                                <div className="absolute inset-0 rounded-full bg-gold border-2 border-white shadow-md" />
                                            </div>
                                            <div className="h-0.5 flex-1 bg-gold/60" />
                                            <span className="text-[8px] font-black uppercase tracking-widest text-gold bg-gold/10 px-1.5 py-0.5 rounded whitespace-nowrap ml-1">
                                                NOW {formatTimeTo12h(`${currentHourPHT.toString().padStart(2, '0')}:${currentMinPHT.toString().padStart(2, '0')}`)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </React.Fragment>
                        );
                    })}
                </div>
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-charcoal/5 flex flex-wrap gap-4 md:gap-6 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-charcoal/40">
                <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                    <span>Booked / Scheduled</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span>Completed</span>
                </div>
                {isPublic && (
                    <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-gold ring-2 ring-gold/20" />
                        <span>Now</span>
                    </div>
                )}
            </div>

        </div>
    );
};

export default LiveTimeline;
