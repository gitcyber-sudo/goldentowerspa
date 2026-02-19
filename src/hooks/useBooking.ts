import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

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
        if (!user && !formData.guest_phone.trim()) errors.guest_phone = 'Please enter your phone number.';
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
        } catch (err) {
            setErrorMessage('Something went wrong. Please try again or contact us directly.');
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
