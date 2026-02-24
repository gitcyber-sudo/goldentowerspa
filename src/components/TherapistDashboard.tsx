import React, { useState, useEffect, useLayoutEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import {
    Calendar, CheckCircle2, Clock3, LogOut,
    Star, User, UserCircle, Wallet
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { formatTimeTo12h } from '../lib/utils';
import LoadingScreen from './LoadingScreen';
import Logo from './Logo';
import { Booking, Therapist, CommissionPayout } from '../types';
import SessionCard from './therapist/SessionCard';
import StatsOverview from './therapist/StatsOverview';
import PayoutsPanel from './therapist/PayoutsPanel';
import AvailabilityPanel from './therapist/AvailabilityPanel';
import ProfilePanel from './therapist/ProfilePanel';

type TabId = 'schedule' | 'history' | 'profile' | 'payouts';

const TherapistDashboard: React.FC = () => {
    // useSEO({
    //     title: 'Specialist Workstation',
    //     description: 'Professional dashboard for Golden Tower Spa therapists to manage schedules and client care.'
    // });
    const { user, profile, signOut } = useAuth();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [therapistInfo, setTherapistInfo] = useState<Therapist | null>(null);
    const [loading, setLoading] = useState(true);
    const [payouts, setPayouts] = useState<CommissionPayout[]>([]);
    const [activeTab, setActiveTab] = useState<TabId>('schedule');

    // Commission Filter State
    const [timeRange, setTimeRange] = useState<'all' | 'today' | '7d' | '30d' | 'month' | 'date'>('all');
    const [specificDate, setSpecificDate] = useState(new Date().toISOString().split('T')[0]);
    const [specificMonth, setSpecificMonth] = useState(new Date().getMonth());
    const [specificYear, setSpecificYear] = useState(new Date().getFullYear());

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const years = useMemo(() => {
        const currentYear = new Date().getFullYear();
        return [currentYear, currentYear - 1, currentYear - 2];
    }, []);

    // Calendar blockouts state
    const [unavailableDates, setUnavailableDates] = useState<Date[]>([]);
    const [savingDates, setSavingDates] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    // ─── Animations ───
    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const stats = document.querySelectorAll(".dashboard-stat");
            if (stats.length > 0) {
                gsap.from(".dashboard-stat", { y: 20, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" });
            }
            const cards = document.querySelectorAll(".booking-card");
            if (cards.length > 0) {
                gsap.fromTo(".booking-card",
                    { y: 20, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, delay: 0.2, ease: "power2.out" }
                );
            }
        });
        return () => ctx.revert();
    }, [loading, activeTab, bookings]);

    // ─── Data ───
    const fetchTherapistData = useCallback(async () => {
        setLoading(true);
        try {
            const { data: therapist, error: therapistError } = await supabase
                .from('therapists').select('*').eq('user_id', user?.id).single();
            if (therapistError) { console.error('Not linked to therapist account:', therapistError); return; }
            setTherapistInfo(therapist);

            // Parse blockouts
            if (therapist.unavailable_blockouts) {
                try {
                    const parsedDates = Array.isArray(therapist.unavailable_blockouts)
                        ? therapist.unavailable_blockouts.map((d: string) => new Date(d))
                        : JSON.parse(therapist.unavailable_blockouts).map((d: string) => new Date(d));
                    setUnavailableDates(parsedDates);
                } catch (e) {
                    console.error('Failed to parse blockout dates', e);
                }
            }

            const { data, error } = await supabase.from('bookings')
                .select(`*, services(title, duration), profiles(full_name, email)`)
                .eq('therapist_id', therapist.id)
                .order('booking_date', { ascending: true });
            if (error) throw error;
            if (data) setBookings(data as any);

            const { data: payoutData } = await supabase.from('commission_payouts')
                .select(`*`)
                .eq('therapist_id', therapist.id)
                .order('created_at', { ascending: false });
            if (payoutData) setPayouts(payoutData as any);
        } catch (err) { console.error('Error fetching therapist data:', err); }
        finally { setLoading(false); }
    }, [user]);

    useEffect(() => {
        let isSubscribed = true;

        const loadData = async () => {
            if (!user) return;
            await fetchTherapistData();
        };

        loadData();

        // Subscribe to real-time status updates ONLY
        const statusSubscription = supabase
            .channel('therapist_status_changes')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'bookings',
                    filter: `therapist_id=eq.${therapistInfo?.id}`
                },
                (payload) => {
                    // Only update if it's a status change (like confirmation or cancellation)
                    if (payload.new && payload.old && payload.new.status !== payload.old.status) {
                        if (isSubscribed) {
                            fetchTherapistData();
                        }
                    }
                }
            )
            .subscribe();

        return () => {
            isSubscribed = false;
            supabase.removeChannel(statusSubscription);
        };
    }, [user, fetchTherapistData]);

    // Animate tab transition
    useEffect(() => {
        if (contentRef.current) {
            gsap.fromTo(contentRef.current,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
            );
        }
    }, [activeTab]);

    const handleSaveBlockouts = async () => {
        if (!therapistInfo) return;
        setSavingDates(true);
        try {
            // Store as purely ISO string arrays
            const datesToSave = unavailableDates.map(d => d.toISOString());
            const { error } = await supabase
                .from('therapists')
                .update({ unavailable_blockouts: datesToSave })
                .eq('id', therapistInfo.id);

            if (error) throw error;
            // Show brief success alert
            alert("Availability updated successfully");
        } catch (error) {
            console.error('Error saving blockout dates:', error);
            alert("Failed to save availability");
        } finally {
            setSavingDates(false);
        }
    };

    const handleSignOut = async () => { await signOut(); navigate('/'); };

    // ─── Computed ───
    const upcomingBookings = useMemo(() => bookings.filter(
        (b: any) => (b.status === 'pending' || b.status === 'confirmed') &&
            new Date(b.booking_date).setHours(0, 0, 0, 0) >= new Date().setHours(0, 0, 0, 0)
    ), [bookings]);

    const completedBookings = useMemo(() => bookings.filter((b: any) => b.status === 'completed'), [bookings]);

    const todayBookings = useMemo(() => upcomingBookings.filter(
        (b: any) => new Date(b.booking_date).toDateString() === new Date().toDateString()
    ), [upcomingBookings]);

    const avgRating = 0; // Legacy or from aggregated stats if needed

    const filteredBookingsByDate = useMemo(() => {
        let filtered = completedBookings;
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

        if (timeRange === 'today') {
            filtered = filtered.filter(b => new Date(b.booking_date).getTime() === today);
        } else if (timeRange === '7d') {
            const sevenDaysAgo = today - (7 * 24 * 60 * 60 * 1000);
            filtered = filtered.filter(b => new Date(b.booking_date).getTime() >= sevenDaysAgo);
        } else if (timeRange === '30d') {
            const thirtyDaysAgo = today - (30 * 24 * 60 * 60 * 1000);
            filtered = filtered.filter(b => new Date(b.booking_date).getTime() >= thirtyDaysAgo);
        } else if (timeRange === 'date') {
            filtered = filtered.filter(b => b.booking_date === specificDate);
        } else if (timeRange === 'month') {
            filtered = filtered.filter(b => {
                const bDate = new Date(b.booking_date);
                return bDate.getMonth() === specificMonth && bDate.getFullYear() === specificYear;
            });
        }
        return filtered;
    }, [completedBookings, timeRange, specificDate, specificMonth, specificYear]);

    const totalTips = useMemo(() => {
        return filteredBookingsByDate.reduce((sum: number, b: Booking) => {
            return b.tip_recipient === 'therapist' ? sum + (b.tip_amount || 0) : sum;
        }, 0);
    }, [filteredBookingsByDate]);

    const totalCommissions = useMemo(() => {
        return filteredBookingsByDate.reduce((sum: number, b: Booking) => sum + (b.commission_amount || 0), 0);
    }, [filteredBookingsByDate]);

    // ─── Tabs config ───
    const tabs: { id: TabId; label: string; icon: React.ReactNode; mobileLabel: string }[] = [
        { id: 'schedule', label: 'Schedule', icon: <Calendar size={18} />, mobileLabel: 'Schedule' },
        { id: 'history', label: 'Past Sessions', icon: <CheckCircle2 size={18} />, mobileLabel: 'History' },
        { id: 'payouts', label: 'My Payouts', icon: <Wallet size={18} />, mobileLabel: 'Payouts' },
        { id: 'profile', label: 'My Profile', icon: <UserCircle size={18} />, mobileLabel: 'Profile' }
    ];

    // ─── Time Buckets ───
    const timeBuckets = [
        { title: "Morning Rituals", icon: "🌅", range: [0, 12] },
        { title: "Afternoon Glow", icon: "🌤️", range: [12, 17] },
        { title: "Evening Serenity", icon: "🌙", range: [17, 24] }
    ];

    // ─── Guards ───
    if (!user || profile?.role !== 'therapist') return <LoadingScreen message="Access Denied" />;
    if (!therapistInfo) return <LoadingScreen message="Linking Profile..." />;

    return (
        <div className="min-h-screen bg-[#F9F7F2] flex flex-col">
            {/* ─── Desktop Header ─── */}
            <header className="bg-white/80 backdrop-blur-xl border-b border-gold/10 px-4 md:px-6 py-4 md:py-5 sticky top-0 z-40">
                <div className="flex justify-between items-center bg-white/80 backdrop-blur-md rounded-3xl p-5 border border-gold/20 shadow-xl mb-6">
                    <div className="flex items-center gap-5">
                        <div className="relative group">
                            {therapistInfo.image_url ? (
                                <img src={therapistInfo.image_url} alt="" className="w-14 h-14 md:w-16 md:h-16 rounded-3xl object-cover shadow-lg border-2 border-gold/10 group-hover:border-gold/30 transition-all duration-500" />
                            ) : (
                                <div className="w-14 h-14 md:w-16 md:h-16 rounded-3xl bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center shadow-lg border-2 border-gold/10">
                                    <User className="text-white" size={24} />
                                </div>
                            )}
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h1 className="font-serif text-xl md:text-2xl text-charcoal">{therapistInfo.name}</h1>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-[0.2em] bg-emerald-50 px-2 py-0.5 rounded-md">{therapistInfo.specialty || 'Master Specialist'}</span>
                                <span className="w-1 h-1 rounded-full bg-gold/30" />
                                <span className="text-[10px] text-charcoal/40 font-bold uppercase tracking-widest">Therapist Portal</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={handleSignOut} className="p-3 bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl transition-all shadow-sm border border-rose-100 group" title="Sign Out">
                        <LogOut size={20} className="group-hover:scale-110 transition-transform" />
                    </button>
                </div>
            </header>

            {/* ─── Main Content ─── */}
            <main className="max-w-6xl mx-auto w-full px-4 md:px-6 py-4 md:py-6 flex-1 pb-24 md:pb-10" id="main-content">

                {/* ─── Compact Filter Bar ─── */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-cream/30 p-4 rounded-3xl border border-gold/10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
                            <Wallet size={14} className="text-gold" />
                        </div>
                        <h3 className="text-[10px] uppercase font-bold text-charcoal/60 tracking-[0.2em]">Financial Insights</h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center bg-white rounded-2xl border border-gold/5 p-1 shadow-sm">
                            {(['all', 'today', '7d', '30d', 'month', 'date'] as const).map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${timeRange === range ? 'bg-gold text-white shadow-md' : 'text-charcoal/40 hover:text-charcoal'}`}
                                >
                                    {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range}
                                </button>
                            ))}
                        </div>

                        {timeRange === 'date' && (
                            <input
                                type="date"
                                value={specificDate}
                                onChange={(e) => setSpecificDate(e.target.value)}
                                className="bg-white border border-gold/10 rounded-2xl px-4 py-2 text-[10px] font-bold text-charcoal shadow-sm focus:ring-2 focus:ring-gold/20 focus:outline-none transition-all"
                            />
                        )}

                        {timeRange === 'month' && (
                            <div className="flex items-center gap-1">
                                <select
                                    value={specificMonth}
                                    onChange={(e) => setSpecificMonth(parseInt(e.target.value))}
                                    className="bg-cream/50 border border-gold/10 rounded-lg px-3 py-1.5 text-[10px] font-bold text-charcoal focus:outline-none"
                                >
                                    {months.map((m, i) => <option key={m} value={i}>{m.substring(0, 3)}</option>)}
                                </select>
                                <select
                                    value={specificYear}
                                    onChange={(e) => setSpecificYear(parseInt(e.target.value))}
                                    className="bg-cream/50 border border-gold/10 rounded-lg px-3 py-1.5 text-[10px] font-bold text-charcoal focus:outline-none"
                                >
                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                {/* ─── Premium Stats Row ─── */}
                <StatsOverview
                    totalCommissions={totalCommissions}
                    totalTips={totalTips}
                    sessionCount={filteredBookingsByDate.length}
                    todayCount={todayBookings.length}
                    pendingCount={upcomingBookings.length}
                    completedCount={completedBookings.length}
                />

                {/* ─── Desktop Tab Navigation ─── */}
                <div className="hidden md:flex gap-1 mb-8 bg-white rounded-xl p-1.5 border border-gold/10 shadow-sm" role="tablist" aria-label="Dashboard sections">
                    {tabs.map(tab => (
                        <button key={tab.id} role="tab" aria-selected={activeTab === tab.id} aria-controls={`panel-${tab.id}`}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all flex-1 justify-center ${activeTab === tab.id
                                ? 'bg-gold text-white shadow-md'
                                : 'text-charcoal/40 hover:text-charcoal/70 hover:bg-gold/5'
                                }`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* ─── Content Panels ─── */}
                {loading ? (
                    <div className="text-center py-16">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gold/20 border-t-gold" role="status" aria-label="Loading" />
                        <p className="text-charcoal/40 mt-4 italic">Loading your schedule...</p>
                    </div>
                ) : (
                    <div ref={contentRef}>
                        {/* ─── Schedule Panel ─── */}
                        <div id="panel-schedule" role="tabpanel" className={activeTab !== 'schedule' ? 'hidden' : ''}>
                            {/* Today's Timeline */}
                            {todayBookings.length > 0 && (
                                <div className="mb-8">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center"><Calendar className="text-gold" size={16} /></div>
                                        <h2 className="font-serif text-lg text-charcoal">Today's Schedule</h2>
                                        <span className="ml-auto bg-gold text-white text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">{todayBookings.length} session{todayBookings.length > 1 ? 's' : ''}</span>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute left-5 top-0 bottom-0 w-px bg-gold/15" aria-hidden="true" />
                                        <div className="space-y-3">
                                            {todayBookings.sort((a: any, b: any) => a.booking_time.localeCompare(b.booking_time)).map((booking: any) => (
                                                <div key={booking.id} className="relative pl-12">
                                                    <div className={`absolute left-3.5 top-6 w-3 h-3 rounded-full border-2 border-white shadow-sm z-10 bg-amber-400`} aria-hidden="true" />
                                                    <div className="absolute left-0 top-5 text-[10px] font-mono text-gold font-bold">
                                                        {formatTimeTo12h(booking.booking_time).replace(/ /g, '')}
                                                    </div>
                                                    <SessionCard booking={booking} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ─── Upcoming Feed (One by One) ─── */}
                            <div className="mb-12">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                                        <Clock3 className="text-gold" size={20} />
                                    </div>
                                    <div>
                                        <h2 className="font-serif text-xl text-charcoal">Upcoming Schedule</h2>
                                        <p className="text-xs text-charcoal/40">Chronological list of your future sessions.</p>
                                    </div>
                                </div>

                                {upcomingBookings.filter(b => new Date(b.booking_date).toDateString() !== new Date().toDateString()).length === 0 ? (
                                    <div className="text-center py-16 bg-white rounded-3xl border border-gold/10 shadow-sm">
                                        <Logo className="h-10 w-10 mx-auto mb-4 opacity-20" color="#997B3D" />
                                        <p className="text-charcoal/40 italic font-serif">Your future schedule is clear.</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4 max-w-3xl">
                                        {upcomingBookings
                                            .filter(b => new Date(b.booking_date).toDateString() !== new Date().toDateString())
                                            .sort((a, b) => {
                                                const dateCompare = a.booking_date.localeCompare(b.booking_date);
                                                if (dateCompare !== 0) return dateCompare;
                                                return a.booking_time.localeCompare(b.booking_time);
                                            })
                                            .map(booking => <SessionCard key={booking.id} booking={booking} />)}
                                    </div>
                                )}
                            </div>

                            {/* ─── Schedule Management (Calendar) ─── */}
                            <AvailabilityPanel
                                unavailableDates={unavailableDates}
                                onSelect={setUnavailableDates}
                                onSave={handleSaveBlockouts}
                                isSaving={savingDates}
                            />
                        </div>

                        {/* ─── History Panel ─── */}
                        <div id="panel-history" role="tabpanel" className={activeTab !== 'history' ? 'hidden' : ''}>
                            {completedBookings.length === 0 ? (
                                <div className="text-center py-16 bg-white rounded-2xl border border-gold/10">
                                    <CheckCircle2 className="text-charcoal/20 mx-auto mb-4" size={48} />
                                    <h3 className="font-serif text-xl text-charcoal mb-2">No Completed Sessions</h3>
                                    <p className="text-charcoal/40 italic">Sessions you finish will be listed here.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4 max-w-2xl mx-auto">
                                    {completedBookings.sort((a, b) => new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime()).map(booking => <SessionCard key={booking.id} booking={booking} />)}
                                </div>
                            )}
                        </div>

                        <div id="panel-payouts" role="tabpanel" className={activeTab !== 'payouts' ? 'hidden' : ''}>
                            <PayoutsPanel payouts={payouts} bookings={bookings} />
                        </div>

                        <div id="panel-profile" role="tabpanel" className={activeTab !== 'profile' ? 'hidden' : ''}>
                            <ProfilePanel
                                therapistInfo={therapistInfo}
                                completedCount={completedBookings.length}
                            />
                        </div>
                    </div>
                )}
            </main>

            {/* ─── Mobile Bottom Tab Bar ─── */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gold/10 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]" role="tablist" aria-label="Dashboard navigation">
                <div className="flex justify-around py-2">
                    {tabs.map(tab => (
                        <button key={tab.id} role="tab" aria-selected={activeTab === tab.id} aria-controls={`panel-${tab.id}`}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[60px] ${activeTab === tab.id
                                ? 'text-gold'
                                : 'text-charcoal/30 hover:text-charcoal/50'
                                }`}
                        >
                            {tab.icon}
                            <span className="text-[9px] font-bold uppercase tracking-wider">{tab.mobileLabel}</span>
                            {activeTab === tab.id && <div className="w-5 h-0.5 bg-gold rounded-full" />}
                        </button>
                    ))}
                </div>
            </nav>
        </div>
    );
};

export default TherapistDashboard;
