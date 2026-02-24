import React, { useMemo } from 'react';
import { Calendar, Clock, MapPin, User, ChevronRight } from 'lucide-react';
import type { Booking, Therapist } from '../../types';
import { formatTimeTo12h, getBusinessDate } from '../../lib/utils';

interface LiveTimelineProps {
    bookings: Booking[];
    therapists: Therapist[];
}

const LiveTimeline: React.FC<LiveTimelineProps> = ({ bookings, therapists }) => {
    const todayBusinessStr = getBusinessDate(new Date());

    // 1. Organize and Filter bookings
    const { inShiftBookings, outOfShiftBookings } = useMemo(() => {

        const sorted = bookings.filter(b =>
            b.status === 'confirmed'
        ).sort((a, b) => {
            const timeA = a.booking_time || '00:00';
            const timeB = b.booking_time || '00:00';

            // Normalize for business day (shifting everything past 4pm to come first)
            const getVal = (t: string) => {
                const [h, m] = t.split(':').map(Number);
                return (h < 16 ? h + 24 : h) * 60 + m;
            };
            return getVal(timeA) - getVal(timeB);
        });

        const inShift: Booking[] = [];
        const outShift: Booking[] = [];
        const now = new Date();
        const todayCalendarStr = now.toLocaleDateString('en-CA');

        sorted.forEach(b => {
            let bBusinessDate = b.booking_date;
            let bCalendarDate = b.booking_date;

            if (b.booking_time) {
                const h = parseInt(b.booking_time.split(':')[0]);
                const [year, month, day] = b.booking_date.split('-');
                if (year && month && day) {
                    const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), h, 0, 0);
                    bBusinessDate = getBusinessDate(dateObj);
                }
            }

            if (bBusinessDate === todayBusinessStr || bCalendarDate === todayCalendarStr) {
                const h = parseInt((b.booking_time || '00:00').split(':')[0]);
                // Shift range: 4 PM (16:00) to 4 AM (04:00)
                if (h >= 16 || h < 4) {
                    inShift.push(b);
                } else {
                    outShift.push(b);
                }
            }
        });

        return { inShiftBookings: inShift, outOfShiftBookings: outShift };
    }, [bookings]);

    // 2. Define standard shift hours (4 PM to 4 AM)
    const shiftHours = [16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3];

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-emerald-50 border-emerald-100 text-emerald-800';
            case 'confirmed': return 'bg-blue-50 border-blue-100 text-blue-800';
            default: return 'bg-amber-50 border-amber-100 text-amber-800';
        }
    };

    const BookingCard = ({ booking, isYesterday }: { booking: Booking, isYesterday?: boolean }) => {
        const therapist = therapists.find(t => t.id === booking.therapist_id);
        const isHomeService = (booking.services?.title || '').toLowerCase().includes('home');

        return (
            <div className={`relative flex flex-col gap-2 p-3 md:p-4 rounded-xl border shadow-sm transition-all hover:shadow-md ${getStatusStyles(booking.status)}`}>
                <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            {isHomeService && <MapPin size={12} className="text-gold" />}
                            <span className="text-[10px] uppercase tracking-widest font-black opacity-60">
                                {formatTimeTo12h(booking.booking_time || '00:00')}
                            </span>
                            {isYesterday && (
                                <span className="text-[8px] bg-charcoal/10 px-1.5 py-0.5 rounded text-charcoal/50 whitespace-nowrap">
                                    Yesterday's Shift
                                </span>
                            )}
                        </div>
                        <h4 className="font-serif text-sm md:text-base font-bold truncate">
                            {booking.guest_name || booking.user_email.split('@')[0]}
                        </h4>
                        <p className="text-[10px] md:text-xs opacity-70 truncate">
                            {booking.services?.title}
                        </p>
                    </div>

                    {/* Therapist Tag on the Right */}
                    <div className="flex-shrink-0 flex items-center gap-2 bg-white/50 backdrop-blur-sm px-2 py-1 rounded-lg border border-white/50">
                        <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center text-[10px] font-bold text-gold">
                            {therapist ? therapist.name.charAt(0) : '?'}
                        </div>
                        <span className="text-[10px] font-bold truncate max-w-[80px]">
                            {therapist ? therapist.name : 'Unassigned'}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-2xl border border-gold/10 shadow-sm p-4 md:p-6 mb-8 overflow-hidden">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h3 className="font-serif text-xl text-charcoal flex items-center gap-2">
                        <Clock className="text-gold" size={24} />
                        Live Shift Timeline
                    </h3>
                    <p className="text-xs text-charcoal/50 mt-1">Real-time chronologies for today's session</p>
                </div>
                <div className="bg-gold/10 px-4 py-2 rounded-xl flex items-center gap-3 text-charcoal text-xs font-bold font-serif whitespace-nowrap self-start">
                    <Calendar size={16} className="text-gold" />
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </div>
            </div>

            {/* Timeline Container */}
            <div className="relative space-y-12">
                {/* 1. Out of Shift Bookings (Special Section) */}
                {outOfShiftBookings.length > 0 && (
                    <div className="relative">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/20" />
                            <span className="text-[10px] uppercase tracking-[0.2em] font-black text-gold/60">Extra-Shift Rituals</span>
                            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/20" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {outOfShiftBookings.map(b => {
                                const h = parseInt((b.booking_time || '00:00').split(':')[0]);
                                const [year, month, day] = b.booking_date.split('-');
                                const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), h, 0, 0);
                                const isYesterday = getBusinessDate(dateObj) < todayBusinessStr;
                                return <BookingCard key={b.id} booking={b} isYesterday={isYesterday} />;
                            })}
                        </div>
                    </div>
                )}

                {/* 2. Main Shift (Vertical Timeline) */}
                <div className="relative">
                    {/* Central Vertical Line (Decorative) */}
                    <div className="absolute left-12 md:left-24 top-0 bottom-0 w-px bg-charcoal/5" />

                    <div className="space-y-0">
                        {shiftHours.map((hour) => {
                            const bookingsForHour = inShiftBookings.filter(b => {
                                const bHour = parseInt((b.booking_time || '00:00').split(':')[0]);
                                return bHour === hour;
                            });

                            const hasBookings = bookingsForHour.length > 0;
                            const timeLabel = formatTimeTo12h(`${hour.toString().padStart(2, '0')}:00`);

                            return (
                                <div key={hour} className={`group flex gap-4 md:gap-8 ${hasBookings ? 'pb-8' : 'pb-2'}`}>
                                    {/* Time Label Column */}
                                    <div className="w-10 md:w-20 pt-1 flex-shrink-0 text-right">
                                        <span className={`text-[10px] md:text-xs font-bold font-serif transition-colors ${hasBookings ? 'text-gold' : 'text-charcoal/20'}`}>
                                            {timeLabel.replace(':00 ', '')}
                                        </span>
                                    </div>

                                    {/* Timeline Node & Content Area */}
                                    <div className="flex-1 relative">
                                        {/* Node */}
                                        <div className={`absolute -left-[3.25rem] md:-left-[4.25rem] top-2 w-3 h-3 rounded-full border-2 bg-white z-10 transition-all ${hasBookings ? 'border-gold scale-125' : 'border-charcoal/10 scale-75 group-hover:border-gold/30'}`} />

                                        {/* Content Area */}
                                        <div className="space-y-3">
                                            {hasBookings ? (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {bookingsForHour.map(b => {
                                                        const h = parseInt((b.booking_time || '00:00').split(':')[0]);
                                                        const [year, month, day] = b.booking_date.split('-');
                                                        const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), h, 0, 0);
                                                        const isYesterday = getBusinessDate(dateObj) < todayBusinessStr;
                                                        return <BookingCard key={b.id} booking={b} isYesterday={isYesterday} />;
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="h-3 w-8 bg-charcoal/[0.02] rounded-full hidden md:block" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="mt-8 pt-6 border-t border-charcoal/5 flex flex-wrap gap-6 text-[10px] font-bold uppercase tracking-widest text-charcoal/50">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm" />
                    <span>Completed Ritual</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm" />
                    <span>Confirmed Session</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm" />
                    <span>Awaiting Attention</span>
                </div>
            </div>
        </div>
    );
};

export default LiveTimeline;
