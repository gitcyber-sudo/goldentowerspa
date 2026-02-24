import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSEO } from '../hooks/useSEO';
import gsap from 'gsap';
import AnalyticsDashboard from './AnalyticsDashboard';
import RevenueDashboard from './RevenueDashboard';
import TherapistManagement from './TherapistManagement';
import ClientIntelligence from './ClientIntelligence';
import ManualBookingModal from './modals/ManualBookingModal';
import EditBookingModal from './modals/EditBookingModal';
import CompleteBookingModal from './modals/CompleteBookingModal';
import { formatTimeTo12h } from '../lib/utils';

// Decomposed Components
import AdminSidebar from './admin/AdminSidebar';
import AdminHeader from './admin/AdminHeader';
import ReviewsPanel from './admin/ReviewsPanel';
import BookingsTab from './admin/BookingsTab';
import ErrorLogs from './admin/ErrorLogs';
import LiveTimeline from './admin/LiveTimeline';
import CommissionsTab from './admin/CommissionsTab';
import ServicesPricingTab from './admin/ServicesPricingTab';
import InventoryTab from './admin/InventoryTab';
import ExpensesTab from './admin/ExpensesTab';

import type { Booking, Therapist, Service } from '../types';

const AdminDashboard: React.FC = () => {
    useSEO({
        title: 'Admin Command Center',
        description: 'Secure administrative portal for Golden Tower Spa management and business analytics.'
    });
    const { signOut } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [therapists, setTherapists] = useState<Therapist[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    // Manual Booking State
    const [showManualBooking, setShowManualBooking] = useState(false);
    const [manualBookingData, setManualBookingData] = useState({
        guest_name: '',
        guest_phone: '09',
        service_id: '',
        therapist_id: '',
        date: '',
        time: ''
    });

    const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
    const [editFormData, setEditFormData] = useState<any>({});
    const [viewingReview, setViewingReview] = useState<{ booking: Booking, feedback: any } | null>(null);
    const [feedbacks, setFeedbacks] = useState<Record<string, any>>({});
    const [completingBooking, setCompletingBooking] = useState<Booking | null>(null);

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('bookings')
                .select(`*, services (title, price, duration), therapists (name)`)
                .is('deleted_at', null)
                .order('created_at', { ascending: false });
            if (error) throw error;
            if (data) setBookings(data as any);

            // Fetch all feedbacks
            const { data: feedbackData } = await supabase
                .from('therapist_feedback')
                .select('*');

            if (feedbackData) {
                const feedbackMap: Record<string, any> = {};
                feedbackData.forEach(f => {
                    feedbackMap[f.booking_id] = f;
                });
                setFeedbacks(feedbackMap);
            }
        } catch (err) {
            console.error('Error fetching bookings:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchTherapists = useCallback(async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.from('therapists').select('*').is('deleted_at', null);
            if (error) throw error;
            if (data) setTherapists(data as any);
        } catch (err) {
            console.error('Error fetching therapists:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchServices = useCallback(async () => {
        try {
            const { data, error } = await supabase.from('services').select('*').is('deleted_at', null);
            if (error) throw error;
            if (data) {
                const sorted = [...data].sort((a, b) => {
                    const aTitle = a.title.toUpperCase();
                    const bTitle = b.title.toUpperCase();
                    const aIsSignature = a.category === 'signature' || aTitle.includes('SIGNATURE');
                    const bIsSignature = b.category === 'signature' || bTitle.includes('SIGNATURE');
                    const aIsPackage = aTitle.includes('PACKAGE');
                    const bIsPackage = bTitle.includes('PACKAGE');

                    if (aIsSignature && !bIsSignature) return -1;
                    if (!aIsSignature && bIsSignature) return 1;
                    if (aIsPackage && !bIsPackage) return 1;
                    if (!aIsPackage && bIsPackage) return -1;
                    if (aIsPackage && bIsPackage) return aTitle.localeCompare(bTitle, undefined, { numeric: true });
                    return aTitle.localeCompare(bTitle);
                });
                setServices(sorted as any);
            }
        } catch (err) {
            console.error('Error fetching services:', err);
        }
    }, []);

    useEffect(() => {
        if (showManualBooking || editingBooking) {
            fetchServices();
            if (therapists.length === 0) fetchTherapists();
        }
    }, [showManualBooking, editingBooking, fetchServices, fetchTherapists, therapists.length]);

    useEffect(() => {
        if (activeTab === 'dashboard' || activeTab === 'bookings' || activeTab === 'revenue') {
            fetchBookings();
            // Need therapists for Live Timeline on dashboard and dropdown in bookings
            if (therapists.length === 0) fetchTherapists();
        } else if (activeTab === 'services') {
            fetchServices();
        }
    }, [activeTab, fetchBookings, fetchTherapists, fetchServices]);

    const handleRefresh = useCallback(async () => {
        setLoading(true);
        await Promise.all([
            fetchBookings(),
            fetchTherapists(),
            fetchServices()
        ]);
        setLoading(false);
    }, [fetchBookings, fetchTherapists, fetchServices]);

    useEffect(() => {
        // Animate tab transition
        if (contentRef.current) {
            gsap.fromTo(contentRef.current,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", clearProps: "transform" }
            );
        }
    }, [activeTab, fetchBookings, fetchTherapists]);

    const updateStatus = useCallback(async (id: string, newStatus: string, therapistId?: string, completionTime?: string, tipAmount?: number, tipRecipient?: 'management' | 'therapist' | null) => {
        const booking = bookings.find(b => b.id === id);
        if (!booking) return;

        // Availability Check if therapist is being assigned/changed
        if (therapistId) {
            const therapist = therapists.find(t => t.id === therapistId);
            if (therapist?.unavailable_blockouts && Array.isArray(therapist.unavailable_blockouts)) {
                const isBlocked = therapist.unavailable_blockouts.some(d =>
                    new Date(d).toDateString() === new Date(booking.booking_date).toDateString()
                );
                if (isBlocked) {
                    alert(`CONFLICT: ${therapist.name} is unavailable on ${booking.booking_date}.`);
                    return;
                }
            }
        }

        if (newStatus === 'completed' && !completionTime) {
            setCompletingBooking(booking);
            return;
        }

        try {
            const updateData: any = { status: newStatus };
            if (therapistId) updateData.therapist_id = therapistId;
            if (newStatus === 'completed') {
                updateData.completed_at = completionTime || new Date().toISOString();
                updateData.tip_amount = tipAmount || 0;
                updateData.tip_recipient = tipRecipient || null;

                // Calculate Commission (30% rounded up) and Revenue (Remainder)
                const servicePrice = booking.price_at_booking || booking.services?.price || 0;
                updateData.price_at_booking = servicePrice;
                const commission = Math.ceil(servicePrice * 0.30);
                updateData.commission_amount = commission;
                updateData.revenue_amount = servicePrice - commission;
            }
            const { error } = await supabase.from('bookings').update(updateData).eq('id', id);
            if (error) throw error;
            setCompletingBooking(null);
            fetchBookings();
        } catch (err) {
            console.error('Error updating status:', err);
        }
    }, [fetchBookings, bookings]);

    /**
     * Checks if a therapist has an existing booking that overlaps with the
     * requested time window (considering service duration).
     * Returns a descriptive conflict message, or null if no conflict.
     */
    const checkTherapistTimeConflict = useCallback((
        therapistId: string,
        date: string,
        time: string,
        durationMinutes: number,
        excludeBookingId: string | null
    ): string | null => {
        const toMinutes = (t: string) => {
            const [h, m] = t.split(':').map(Number);
            return h * 60 + (m || 0);
        };

        const newStart = toMinutes(time);
        const newEnd = newStart + durationMinutes;

        // Check all existing confirmed/pending bookings for this therapist on this date
        const conflicts = bookings.filter(b => {
            if (excludeBookingId && b.id === excludeBookingId) return false;
            if (b.therapist_id !== therapistId) return false;
            if (b.booking_date !== date) return false;
            if (!['confirmed', 'pending'].includes(b.status)) return false;

            const existingStart = toMinutes(b.booking_time || '00:00');
            const existingDuration = b.services?.duration || 60;
            const existingEnd = existingStart + existingDuration;

            // Overlap: new booking starts before existing ends AND new booking ends after existing starts
            return newStart < existingEnd && newEnd > existingStart;
        });

        if (conflicts.length === 0) return null;

        const therapist = therapists.find(t => t.id === therapistId);
        const conflictDetails = conflicts.map(c => {
            const startLabel = formatTimeTo12h(c.booking_time || '00:00');
            const endMin = toMinutes(c.booking_time || '00:00') + (c.services?.duration || 60);
            const endH = Math.floor(endMin / 60) % 24;
            const endM = endMin % 60;
            const endLabel = formatTimeTo12h(`${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`);
            return `${c.services?.title || 'Session'} (${startLabel} – ${endLabel})`;
        }).join('\n• ');

        return `SCHEDULE CONFLICT: ${therapist?.name || 'This therapist'} already has overlapping booking(s) on ${date}:\n\n• ${conflictDetails}\n\nThe new ${durationMinutes}-minute session (${formatTimeTo12h(time)}) would overlap. Please choose a different time or therapist.`;
    }, [bookings, therapists]);

    const handleManualBooking = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualBookingData.service_id) {
            alert("RITUAL REQUIRED: Please select a massage type.");
            return;
        }
        if (!manualBookingData.therapist_id) {
            alert("SPECIALIST REQUIRED: Please assign an available therapist.");
            return;
        }

        // Check for time overlap conflicts
        const selectedService = services.find(s => s.id === manualBookingData.service_id);
        const conflictMsg = checkTherapistTimeConflict(
            manualBookingData.therapist_id,
            manualBookingData.date,
            manualBookingData.time,
            selectedService?.duration || 60,
            null // no booking to exclude (new booking)
        );
        if (conflictMsg) {
            alert(conflictMsg);
            return;
        }

        // Final Availability Check
        const selectedTherapist = therapists.find(t => t.id === manualBookingData.therapist_id);
        if (selectedTherapist?.unavailable_blockouts && Array.isArray(selectedTherapist.unavailable_blockouts)) {
            const isBlocked = selectedTherapist.unavailable_blockouts.some(d =>
                new Date(d).toDateString() === new Date(manualBookingData.date).toDateString()
            );
            if (isBlocked) {
                alert(`CONFLICT: ${selectedTherapist.name} is marked as unavailable on this date.`);
                return;
            }
        }

        setLoading(true);
        try {
            let linkedUserId = null;
            const { error } = await supabase.from('bookings').insert([{
                guest_name: manualBookingData.guest_name,
                guest_phone: manualBookingData.guest_phone === '09' ? null : manualBookingData.guest_phone,
                service_id: manualBookingData.service_id,
                therapist_id: manualBookingData.therapist_id || null,
                booking_date: manualBookingData.date,
                booking_time: manualBookingData.time,
                price_at_booking: services.find(s => s.id === manualBookingData.service_id)?.price || 0,
                status: 'pending'
            }]);
            if (error) throw error;
            setShowManualBooking(false);
            setManualBookingData({
                guest_name: '',
                guest_phone: '09',
                service_id: '',
                therapist_id: '',
                date: '',
                time: ''
            });
            fetchBookings();
        } catch (err: unknown) {
            console.error('Error creating manual booking:', err);
            alert('Failed to create manual booking. Please check console for details.');
        } finally {
            setLoading(false);
        }
    }, [manualBookingData, fetchBookings, therapists]);

    const openEditModal = useCallback((booking: Booking) => {
        setEditingBooking(booking);
        setEditFormData({
            guest_name: booking.guest_name || '',
            guest_email: booking.guest_email || booking.user_email || '',
            guest_phone: booking.guest_phone || '',
            service_id: booking.service_id,
            therapist_id: booking.therapist_id || '',
            booking_date: booking.booking_date,
            booking_time: booking.booking_time,
            status: booking.status
        });
    }, []);

    const handleEditBooking = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBooking) return;

        // Final Availability Check
        if (editFormData.therapist_id) {
            const selectedTherapist = therapists.find(t => t.id === editFormData.therapist_id);
            if (selectedTherapist?.unavailable_blockouts && Array.isArray(selectedTherapist.unavailable_blockouts)) {
                const isBlocked = selectedTherapist.unavailable_blockouts.some(d =>
                    new Date(d).toDateString() === new Date(editFormData.booking_date).toDateString()
                );
                if (isBlocked) {
                    alert(`CONFLICT: ${selectedTherapist.name} is marked as unavailable on this date.`);
                    return;
                }
            }

            // Check for time overlap conflicts (exclude the booking being edited)
            const selectedService = services.find(s => s.id === editFormData.service_id);
            const conflictMsg = checkTherapistTimeConflict(
                editFormData.therapist_id,
                editFormData.booking_date,
                editFormData.booking_time,
                selectedService?.duration || 60,
                editingBooking.id
            );
            if (conflictMsg) {
                alert(conflictMsg);
                return;
            }
        }

        setLoading(true);
        try {
            let linkedUserId = editingBooking.user_id;
            if (editFormData.guest_email && editFormData.guest_email !== (editingBooking.guest_email || editingBooking.user_email)) {
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('email', editFormData.guest_email)
                    .single();
                if (profileData) linkedUserId = profileData.id;
            }

            const { error } = await supabase.from('bookings').update({
                user_id: linkedUserId,
                guest_name: editFormData.guest_name,
                guest_email: editFormData.guest_email,
                guest_phone: editFormData.guest_phone === '09' ? null : editFormData.guest_phone,
                service_id: editFormData.service_id,
                therapist_id: editFormData.therapist_id || null,
                booking_date: editFormData.booking_date,
                booking_time: editFormData.booking_time,
                status: editFormData.status,
                price_at_booking: editFormData.status === 'completed' && !editingBooking.price_at_booking
                    ? (services.find(s => s.id === editFormData.service_id)?.price || editingBooking.price_at_booking || 0)
                    : editingBooking.price_at_booking,
                completed_at: editFormData.status === 'completed' ? (editingBooking.completed_at || new Date().toISOString()) : null,
                commission_amount: editFormData.status === 'completed'
                    ? Math.ceil((services.find(s => s.id === editFormData.service_id)?.price || editingBooking.price_at_booking || 0) * 0.30)
                    : 0,
                revenue_amount: editFormData.status === 'completed'
                    ? ((services.find(s => s.id === editFormData.service_id)?.price || editingBooking.price_at_booking || 0) - Math.ceil((services.find(s => s.id === editFormData.service_id)?.price || editingBooking.price_at_booking || 0) * 0.30))
                    : 0,
                user_email: editFormData.guest_email || editingBooking.user_email
            }).eq('id', editingBooking.id);

            if (error) throw error;
            setEditingBooking(null);
            fetchBookings();
        } catch (err: unknown) {
            alert("Error updating booking: " + (err instanceof Error ? err.message : 'Unknown error'));
        } finally {
            setLoading(false);
        }
    }, [editingBooking, editFormData, fetchBookings]);

    const deleteBooking = useCallback(async (id: string) => {
        if (!confirm("Are you sure you want to delete this booking? This action cannot be undone.")) return;

        try {
            const { error } = await supabase.from('bookings').update({ deleted_at: new Date().toISOString() }).eq('id', id);
            if (error) throw error;
            fetchBookings();
        } catch (err: unknown) {
            alert("Error deleting booking: " + (err instanceof Error ? err.message : 'Unknown error'));
        }
    }, [fetchBookings]);

    // Calculate Stats - Memoized
    const stats = useMemo(() => ({
        total: bookings.length,
        pending: bookings.filter(b => b.status === 'pending').length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        completed: bookings.filter(b => b.status === 'completed').length,
        cancelled: bookings.filter(b => b.status === 'cancelled').length,
    }), [bookings]);

    const revenueStats = useMemo(() => {
        // Today in Philippine time (UTC+8)
        const phtOffset = 8 * 60 * 60 * 1000;
        const todayPHT = new Date(Date.now() + phtOffset).toISOString().split('T')[0];
        return {
            totalRevenue: bookings
                .filter(b => b.status === 'completed')
                .reduce((sum, b) => sum + (b.services?.price || 0), 0),
            pendingRevenue: bookings
                .filter(b => b.status === 'confirmed' || b.status === 'pending')
                .reduce((sum, b) => sum + (b.price_at_booking || b.services?.price || 0), 0),
            todayRevenue: bookings
                .filter(b => {
                    if (b.status !== 'completed' || !b.completed_at) return false;
                    // Compare against PHT calendar date of completion
                    const completionPHT = new Date(new Date(b.completed_at).getTime() + phtOffset).toISOString().split('T')[0];
                    return completionPHT === todayPHT;
                })
                .reduce((sum, b) => sum + (b.price_at_booking || b.services?.price || 0), 0),
        };
    }, [bookings]);

    const getPageTitle = useCallback(() => {
        switch (activeTab) {
            case 'dashboard': return 'Overview';
            case 'bookings': return 'Bookings';
            case 'therapists': return 'Specialists';
            case 'website-analytics': return 'Website Analytics';
            case 'revenue': return 'Revenue Analytics';
            case 'clients': return 'Client Intelligence';
            case 'inventory': return 'Inventory & Supplies';
            case 'expenses': return 'Expense & Profit Hub';
            case 'errors': return 'System Error Logs';
            case 'services': return 'Services & Pricing';
            default: return 'Admin Panel';
        }
    }, [activeTab]);

    return (
        <div className="h-screen bg-[#F9F7F2] flex overflow-hidden">
            <AdminSidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isOpen={sidebarOpen}
                setIsOpen={setSidebarOpen}
                onSignOut={async () => { await signOut(); navigate('/'); }}
            />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto h-screen relative">
                <AdminHeader
                    title={getPageTitle()}
                    setSidebarOpen={setSidebarOpen}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    onRefresh={handleRefresh}
                    onManualBooking={() => setShowManualBooking(true)}
                    showSearch={activeTab === 'bookings' || activeTab === 'dashboard'}
                />

                {/* Content Area */}
                <div ref={contentRef}>
                    {(activeTab === 'dashboard' || activeTab === 'bookings') && (
                        <>
                            {activeTab === 'dashboard' && <LiveTimeline bookings={bookings} therapists={therapists} />}
                            <BookingsTab
                                bookings={bookings}
                                therapists={therapists}
                                feedbacks={feedbacks}
                                stats={stats}
                                revenueStats={revenueStats}
                                searchTerm={searchTerm}
                                onUpdateStatus={updateStatus}
                                onEdit={openEditModal}
                                onDelete={deleteBooking}
                                onViewReview={setViewingReview}
                            />
                        </>
                    )}
                    {activeTab === 'website-analytics' && <AnalyticsDashboard />}
                    {activeTab === 'revenue' && <RevenueDashboard bookings={bookings} />}
                    {activeTab === 'commissions' && <CommissionsTab bookings={bookings} therapists={therapists} onRefresh={fetchBookings} />}
                    {activeTab === 'therapists' && <TherapistManagement />}
                    {activeTab === 'clients' && <ClientIntelligence />}
                    {activeTab === 'inventory' && <InventoryTab />}
                    {activeTab === 'expenses' && <ExpensesTab />}
                    {activeTab === 'services' && <ServicesPricingTab services={services} onRefresh={fetchServices} />}
                    {activeTab === 'errors' && <ErrorLogs />}
                </div>

                {/* Modals */}
                <ManualBookingModal
                    isOpen={showManualBooking}
                    onClose={() => setShowManualBooking(false)}
                    onSubmit={handleManualBooking}
                    data={manualBookingData}
                    setData={setManualBookingData}
                    services={services}
                    therapists={therapists}
                />
                <EditBookingModal
                    isOpen={!!editingBooking}
                    onClose={() => setEditingBooking(null)}
                    onSubmit={handleEditBooking}
                    data={editFormData}
                    setData={setEditFormData}
                    services={services}
                    therapists={therapists}
                />
                <ReviewsPanel
                    isOpen={!!viewingReview}
                    onClose={() => setViewingReview(null)}
                    review={viewingReview}
                />
                <CompleteBookingModal
                    isOpen={!!completingBooking}
                    onClose={() => setCompletingBooking(null)}
                    onConfirm={(time, tipAmount, tipRecipient) => updateStatus(completingBooking!.id, 'completed', undefined, time, tipAmount, tipRecipient)}
                    bookingDate={completingBooking?.booking_date || ''}
                    bookingTime={completingBooking?.booking_time}
                    duration={completingBooking?.services?.duration}
                    servicePrice={completingBooking?.services?.price}
                />
            </main>
        </div>
    );
};

export default AdminDashboard;
