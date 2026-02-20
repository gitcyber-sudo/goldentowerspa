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
import { getBusinessDate } from '../lib/utils';

// Decomposed Components
import AdminSidebar from './admin/AdminSidebar';
import AdminHeader from './admin/AdminHeader';
import ReviewsPanel from './admin/ReviewsPanel';
import BookingsTab from './admin/BookingsTab';
import ErrorLogs from './admin/ErrorLogs';
import LiveTimeline from './admin/LiveTimeline';

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
        guest_email: '',
        guest_phone: '',
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
            const { data, error } = await supabase.from('therapists').select('*');
            if (error) throw error;
            if (data) setTherapists(data as any);
        } catch (err) {
            console.error('Error fetching therapists:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchServices = useCallback(async () => {
        const { data } = await supabase.from('services').select('*');
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
        } else if (activeTab === 'therapists') {
            fetchTherapists();
        }

        // Animate tab transition
        if (contentRef.current) {
            gsap.fromTo(contentRef.current,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
            );
        }
    }, [activeTab, fetchBookings, fetchTherapists]);

    const updateStatus = useCallback(async (id: string, newStatus: string, therapistId?: string, completionTime?: string, tipAmount?: number, tipRecipient?: 'management' | 'therapist' | null) => {
        if (newStatus === 'completed' && !completionTime) {
            const booking = bookings.find(b => b.id === id);
            if (booking) {
                setCompletingBooking(booking);
                return;
            }
        }

        try {
            const updateData: any = { status: newStatus };
            if (therapistId) updateData.therapist_id = therapistId;
            if (newStatus === 'completed') {
                updateData.completed_at = completionTime || new Date().toISOString();
                updateData.tip_amount = tipAmount || 0;
                updateData.tip_recipient = tipRecipient || null;
            }
            const { error } = await supabase.from('bookings').update(updateData).eq('id', id);
            if (error) throw error;
            setCompletingBooking(null);
            fetchBookings();
        } catch (err) {
            console.error('Error updating status:', err);
        }
    }, [fetchBookings, bookings]);

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
        setLoading(true);
        try {
            let linkedUserId = null;
            if (manualBookingData.guest_email) {
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('email', manualBookingData.guest_email)
                    .single();
                if (profileData) linkedUserId = profileData.id;
            }

            const { error } = await supabase.from('bookings').insert([{
                user_id: linkedUserId,
                guest_name: manualBookingData.guest_name,
                guest_email: manualBookingData.guest_email || null,
                guest_phone: manualBookingData.guest_phone || null,
                service_id: manualBookingData.service_id,
                therapist_id: manualBookingData.therapist_id,
                booking_date: manualBookingData.date,
                booking_time: manualBookingData.time,
                status: 'confirmed',
                user_email: manualBookingData.guest_email || 'Walk-in Client'
            }]);
            if (error) throw error;
            setShowManualBooking(false);
            setManualBookingData({
                guest_name: '',
                guest_email: '',
                guest_phone: '',
                service_id: '',
                therapist_id: '',
                date: '',
                time: ''
            });
            fetchBookings();
        } catch (err: unknown) {
            alert("Error: " + (err instanceof Error ? err.message : 'Unknown error'));
        } finally {
            setLoading(false);
        }
    }, [manualBookingData, fetchBookings]);

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
                guest_phone: editFormData.guest_phone,
                service_id: editFormData.service_id,
                therapist_id: editFormData.therapist_id || null,
                booking_date: editFormData.booking_date,
                booking_time: editFormData.booking_time,
                status: editFormData.status,
                completed_at: editFormData.status === 'completed' ? new Date().toISOString() : null,
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
            const { error } = await supabase.from('bookings').delete().eq('id', id);
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
        const businessToday = getBusinessDate(new Date());
        return {
            totalRevenue: bookings
                .filter(b => b.status === 'completed')
                .reduce((sum, b) => sum + (b.services?.price || 0), 0),
            pendingRevenue: bookings
                .filter(b => b.status === 'confirmed' || b.status === 'pending')
                .reduce((sum, b) => sum + (b.services?.price || 0), 0),
            todayRevenue: bookings
                .filter(b => {
                    if (b.status !== 'completed' || !b.completed_at) return false;
                    return getBusinessDate(new Date(b.completed_at)) === businessToday;
                })
                .reduce((sum, b) => sum + (b.services?.price || 0), 0),
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
            case 'errors': return 'System Error Logs';
            default: return 'Admin Panel';
        }
    }, [activeTab]);

    return (
        <div className="min-h-screen bg-[#F9F7F2] flex">
            <AdminSidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isOpen={sidebarOpen}
                setIsOpen={setSidebarOpen}
                onSignOut={async () => { await signOut(); navigate('/'); }}
            />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto h-screen">
                <AdminHeader
                    title={getPageTitle()}
                    setSidebarOpen={setSidebarOpen}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    onRefresh={fetchBookings}
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
                    {activeTab === 'therapists' && <TherapistManagement />}
                    {activeTab === 'clients' && <ClientIntelligence />}
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
