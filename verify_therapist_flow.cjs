const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Manually read .env.local
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
    if (line.includes('=')) {
        const [key, value] = line.split('=');
        envVars[key.trim()] = value.trim();
    }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Environment variables not found. Make sure .env.local exists.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyTherapistFlow() {
    console.log('--- Starting Therapist Flow Verification ---');

    // 1. Check for therapists without user_id
    console.log('1. Checking for therapists without login accounts...');
    const { data: therapists, error: tError } = await supabase
        .from('therapists')
        .select('id, name, user_id')
        .is('user_id', null);

    if (tError) {
        console.error('Error fetching therapists:', tError);
    } else {
        console.log(`Found ${therapists.length} therapists without accounts:`, therapists.map(t => t.name).join(', '));
    }

    // 2. Test name-to-email lookup (case-insensitive)
    console.log('\n2. Testing name-to-email lookup logic...');
    const testNames = ['Test Therapist', 'test therapist', 'TEST THERAPIST'];

    for (const name of testNames) {
        const { data: profile, error: pError } = await supabase
            .from('profiles')
            .select('email')
            .ilike('full_name', name)
            .eq('role', 'therapist')
            .maybeSingle();

        if (pError) {
            console.error(`Error looking up "${name}":`, pError);
        } else if (profile) {
            console.log(`OK: Found email for "${name}": ${profile.email}`);
        } else {
            console.warn(`WARN: No profile found for "${name}" (this is expected if "Test Therapist" doesn't exist yet)`);
        }
    }

    // 3. Verify specific therapist "Test Therapist"
    console.log('\n3. Verifying "Test Therapist" account...');
    const { data: testTherapist, error: testError } = await supabase
        .from('therapists')
        .select('*')
        .eq('name', 'Test Therapist')
        .maybeSingle();

    if (testError) {
        console.error('Error fetching "Test Therapist":', testError);
    } else if (testTherapist) {
        console.log('SUCCESS: Found "Test Therapist":');
        console.log(`- ID: ${testTherapist.id}`);
        console.log(`- User ID: ${testTherapist.user_id}`);

        if (testTherapist.user_id) {
            const { data: profile, error: pError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', testTherapist.user_id)
                .maybeSingle();

            if (pError) {
                console.error('Error fetching profile:', pError);
            } else if (profile) {
                console.log(`- Profile Email: ${profile.email}`);
                console.log(`- Profile Role: ${profile.role}`);
            } else {
                console.warn('- WARNING: No matching profile found for this user_id!');
            }
        }
    } else {
        console.warn('INFO: "Test Therapist" not found in therapists table.');
    }

    console.log('\n--- Verification Complete ---');
}

verifyTherapistFlow();
