
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testBooking() {
    console.log('Testing booking insertion...');

    // 1. Get a service and therapist ID
    const { data: services } = await supabase.from('services').select('id').limit(1);
    const { data: therapists } = await supabase.from('therapists').select('id').limit(1);

    if (!services || !therapists) {
        console.error('Cant fetch prerequisites');
        return;
    }

    const booking = {
        user_email: 'test_admin_debug@example.com',
        service_id: services[0].id,
        therapist_id: therapists[0].id,
        booking_date: '2026-02-01',
        booking_time: '10:00',
        status: 'pending'
    };

    const { data, error } = await supabase.from('bookings').insert([booking]).select();

    if (error) {
        console.error('Insert Error:', error);
    } else {
        console.log('Insert Success:', data);
    }

    console.log('Testing fetching all bookings...');
    const { data: allBookings, error: fetchError } = await supabase.from('bookings').select('*');
    if (fetchError) {
        console.error('Fetch Error:', fetchError);
    } else {
        console.log(`Fetched ${allBookings.length} bookings.`);
        if (allBookings.length > 0) {
            console.log('Sample:', allBookings[0]);
        }
    }
}

testBooking();
