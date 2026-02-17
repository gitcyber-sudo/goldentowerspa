// ─── Database Models ─────────────────────────────────────────────
// These types mirror the Supabase `public` schema tables.

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type UserRole = 'user' | 'therapist' | 'admin';

export interface Profile {
    id: string;
    role: UserRole;
    full_name?: string;
    email?: string;
    created_at?: string;
}

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
    specialty?: string;
    bio?: string;
    image_url?: string;
    active: boolean;
    user_id?: string;
}

export interface Booking {
    id: string;
    user_email: string;
    guest_name?: string;
    guest_email?: string;
    guest_phone?: string;
    service_id: string;
    therapist_id?: string;
    booking_date: string;
    booking_time: string;
    status: BookingStatus;
    created_at: string;
    visitor_id?: string;
    // Joined relations
    services?: { title: string; price: number };
    therapists?: { name: string };
}

export interface TherapistFeedback {
    id: string;
    booking_id: string;
    therapist_id: string;
    rating: number;
    comment?: string;
    created_at: string;
}

export interface AnalyticsEvent {
    id: string;
    event_type: string;
    event_data: Record<string, unknown>;
    visitor_id?: string;
    session_id?: string;
    page_url?: string;
    created_at: string;
}

// ─── Component Prop Helpers ──────────────────────────────────────

export interface ManualBookingFormData {
    service_id: string;
    therapist_id: string;
    booking_date: string;
    booking_time: string;
    guest_name: string;
    guest_email: string;
    guest_phone: string;
    status: BookingStatus;
}

export interface EditBookingFormData {
    service_id: string;
    therapist_id: string;
    booking_date: string;
    booking_time: string;
    guest_name: string;
    guest_email: string;
    guest_phone: string;
    status: BookingStatus;
}
