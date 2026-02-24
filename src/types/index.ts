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
    deleted_at?: string;
}

export interface Therapist {
    id: string;
    name: string;
    specialty?: string;
    bio?: string;
    image_url?: string;
    active: boolean;
    user_id?: string;
    unavailable_blockouts?: string[];
    deleted_at?: string;
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
    completed_at?: string;
    user_id?: string;
    visitor_id?: string;
    tip_amount?: number;
    tip_recipient?: 'management' | 'therapist' | null;
    commission_amount?: number;
    revenue_amount?: number;
    price_at_booking?: number;
    deleted_at?: string;
    payout_id?: string;
    // Joined relations
    services?: { title: string; price: number; duration: number };
    therapists?: { name: string };
}

export interface ServicePriceHistory {
    id: string;
    service_id: string;
    old_price: number;
    new_price: number;
    changed_at: string;
    changed_by?: string;
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

export interface InventoryItem {
    id: string;
    name: string;
    unit: string;
    current_stock: number;
    unit_price?: number;
    alert_threshold: number;
    category: string;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
}

export interface InventoryLog {
    id: string;
    item_id: string;
    change_amount: number;
    type: 'consumed' | 'restocked' | 'adjustment';
    notes?: string;
    created_at: string;
    performed_by?: string;
}

export interface Expense {
    id: string;
    amount: number;
    category: string;
    description?: string;
    date: string;
    created_at: string;
    created_by?: string;
    deleted_at?: string;
}

export interface CommissionPayout {
    id: string;
    therapist_id: string;
    amount: number;
    period_start: string;
    period_end: string;
    status: 'pending' | 'processed' | 'cancelled';
    paid_at: string;
    processed_by?: string;
    notes?: string;
    created_at: string;
}
