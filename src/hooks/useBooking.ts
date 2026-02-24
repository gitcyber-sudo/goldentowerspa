import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { validatePhoneNumber, formatPhoneNumber, formatTimeTo12h } from '../lib/utils';

export interface Service {
    id: string;
    title: string;
    category: string;
    description: string;
    image_url: string;
    price: number;
    duration: number;
}

export interface Therapist {
    id: string;
    name: string;
    active: boolean;
    unavailable_blockouts?: string[] | string;
}

export interface BookingFormData {
    service_id: string;
    therapist_id: string;
    date: string;
    time: string;
    guest_name: string;
    guest_phone: string;
}

export const useBooking = (initialServiceId?: string, isOpen?: boolean) => {
    const { user, profile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    // Data Loading State
    const [services, setServices] = useState<Service[]>([]);
    const [therapists, setTherapists] = useState<Therapist[]>([]);

    // Form State
    const [formData, setFormData] = useState<BookingFormData>({
        service_id: initialServiceId || '',
        therapist_id: '',
        date: '',
        time: '',
        guest_name: '',
        guest_phone: ''
    });

    // Anti-bot State
    const [hpField, setHpField] = useState('');
    const [isReturningGuest, setIsReturningGuest] = useState(false);

    // Reset success/error on open
    useEffect(() => {
        if (isOpen) {
            setSuccess(false);
            setErrorMessage('');
            setValidationErrors({});
            // Don't reset form data completely, keep selection if needed
            if (initialServiceId) {
                setFormData(prev => ({ ...prev, service_id: initialServiceId }));
            }
            fetchData();
        }
    }, [isOpen, initialServiceId]);

    const fetchData = async () => {
        const { data: s } = await supabase.from('services').select('*');
        const { data: t } = await supabase.from('therapists').select('*').eq('active', true).order('name');

        // Check for returning guest
        const visitorId = localStorage.getItem('gt_visitor_id');
        if (visitorId && !user) {
            const { data: lastBooking } = await supabase
                .from('bookings')
                .select('guest_name, guest_phone')
                .eq('visitor_id', visitorId)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (lastBooking) {
                setFormData(prev => ({
                    ...prev,
                    guest_name: lastBooking.guest_name || '',
                    guest_phone: lastBooking.guest_phone || ''
                }));
                setIsReturningGuest(true);
            }
        }

        if (s) {
            const sortedServices = [...s].sort((a, b) => {
                const aTitle = a.title.toUpperCase();
                const bTitle = b.title.toUpperCase();
                const getPriority = (item: Service, title: string) => {
                    if (item.category === 'signature' || title.includes('SIGNATURE')) return 1;
                    if (title.includes('PACKAGE')) return 4;
                    if (item.category === 'express' || title.includes('EXPRESS')) return 3;
                    return 2;
                };
                const pA = getPriority(a, aTitle);
                const pB = getPriority(b, bTitle);
                if (pA !== pB) return pA - pB;
                if (pA === 4) return aTitle.localeCompare(bTitle, undefined, { numeric: true });
                return aTitle.localeCompare(bTitle);
            });
            setServices(sortedServices);
        }
        if (t) setTherapists(t);
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};
        if (!formData.service_id) errors.service = 'Please choose a massage treatment.';
        if (!user && !formData.guest_name.trim()) errors.guest_name = 'Please enter your name.';

        const phoneError = validatePhoneNumber(formData.guest_phone);
        if (phoneError) errors.guest_phone = phoneError === 'Incomplete number' ? 'Please enter a complete 11-digit phone number.' : phoneError;

        if (!formData.date) errors.date = 'Please select a date.';
        if (!formData.time) errors.time = 'Please select a time.';
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const submitBooking = async () => {
        setErrorMessage('');

        // Anti-Bot: Honeypot
        if (hpField) {
            setLoading(false);
            return;
        }

        if (!validateForm()) return;

        // Anti-Bot: Rate Limit
        const lastAttempt = localStorage.getItem('gt_last_booking_attempt');
        const now = Date.now();
        if (lastAttempt && (now - parseInt(lastAttempt) < 60000)) {
            setErrorMessage('Please wait a moment before submitting another request.');
            setLoading(false);
            return;
        }
        localStorage.setItem('gt_last_booking_attempt', now.toString());

        const visitorId = localStorage.getItem('gt_visitor_id');
        setLoading(true);

        try {
            // Check Limits
            const maxPending = user ? 2 : 1;
            const limitLabel = user ? 'registered users' : 'guests';
            let pendingQuery = supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'pending');

            if (user) pendingQuery = pendingQuery.eq('user_id', user.id);
            else if (visitorId) pendingQuery = pendingQuery.eq('visitor_id', visitorId);

            const { count: pendingCount } = await pendingQuery;

            if ((pendingCount ?? 0) >= maxPending) {
                setErrorMessage(`You already have ${pendingCount} pending booking${(pendingCount ?? 0) > 1 ? 's' : ''}. The limit for ${limitLabel} is ${maxPending}.`);
                setLoading(false);
                return;
            }

            // Therapist Time-Overlap Conflict Check
            if (formData.therapist_id) {
                const selectedService = services.find(s => s.id === formData.service_id);
                const newDuration = selectedService?.duration || 60;

                const { data: existingBookings } = await supabase
                    .from('bookings')
                    .select('id, booking_time, service_id, services(title, duration)')
                    .eq('therapist_id', formData.therapist_id)
                    .eq('booking_date', formData.date)
                    .in('status', ['confirmed', 'pending'])
                    .is('deleted_at', null);

                if (existingBookings && existingBookings.length > 0) {
                    const toMinutes = (t: string) => {
                        const [h, m] = t.split(':').map(Number);
                        return h * 60 + (m || 0);
                    };
                    const newStart = toMinutes(formData.time);
                    const newEnd = newStart + newDuration;

                    const conflict = existingBookings.find((b: any) => {
                        const existStart = toMinutes(b.booking_time || '00:00');
                        const existDuration = b.services?.duration || 60;
                        const existEnd = existStart + existDuration;
                        return newStart < existEnd && newEnd > existStart;
                    });

                    if (conflict) {
                        const therapist = therapists.find(t => t.id === formData.therapist_id);
                        const cStart = formatTimeTo12h((conflict as any).booking_time || '00:00');
                        const cService = (conflict as any).services?.title || 'Session';
                        setErrorMessage(
                            `Schedule conflict: ${therapist?.name || 'This therapist'} already has a "${cService}" booking at ${cStart} on this date. Please choose a different time or therapist.`
                        );
                        setLoading(false);
                        return;
                    }
                }
            }

            const { error } = await supabase.from('bookings').insert([{
                user_id: user?.id || null,
                user_email: user?.email || null,
                guest_name: user ? profile?.full_name : formData.guest_name,
                guest_phone: formData.guest_phone,
                visitor_id: visitorId,
                service_id: formData.service_id,
                therapist_id: formData.therapist_id || null,
                booking_date: formData.date,
                booking_time: formData.time,
                status: 'pending'
            }]);

            if (error) throw error;
            setSuccess(true);
        } catch (err: any) {
            setErrorMessage('Something went wrong. Please try again or contact us directly.');

            // Standardized Telemetry
            import('../lib/errorLogger').then(({ logError }) => {
                logError({
                    message: `[GTS-401]: Booking submission failed. ${err.message || ''}`,
                    severity: 'error',
                    metadata: {
                        userId: user?.id,
                        serviceId: formData.service_id,
                        originalError: err
                    }
                });
            });
        } finally {
            setLoading(false);
        }
    };

    return {
        // State
        formData, setFormData,
        loading, success, errorMessage, validationErrors,
        services, therapists,
        hpField, setHpField,
        // Methods
        submitBooking,
        setValidationErrors, // exposed if needed for field clearing
        isReturningGuest
    };
};
