const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local
const envFile = fs.readFileSync('.env.local', 'utf8');
const envLines = envFile.split('\n');
const env = {};
for (const line of envLines) {
    if (line && line.includes('=')) {
        const [key, ...value] = line.split('=');
        env[key.trim()] = value.join('=').trim().replace(/['"]/g, '');
    }
}

const supabaseAdmin = createClient(
    env.VITE_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY // Since we need to update passwords, we MUST use the Service Role Key
);

async function resetAllTherapistPasswords() {
    console.log("Fetching therapists...");
    const { data: therapists, error: fetchError } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, email')
        .eq('role', 'therapist');

    if (fetchError) {
        console.error("Error fetching therapists:", fetchError.message);
        return;
    }

    if (!therapists || therapists.length === 0) {
        console.log("No therapists found in the profiles table.");
        return;
    }

    console.log(`Found ${therapists.length} therapists. Resetting passwords to 0000 (padded to 0000-GTS)...`);

    for (const therapist of therapists) {
        if (!therapist.id || !therapist.email) {
            console.log(`Skipping null id/email: ${therapist.full_name}`);
            continue;
        }

        console.log(`Updating ${therapist.full_name} (${therapist.email})...`);

        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            therapist.id,
            { password: '0000-GTS' }
        );

        if (updateError) {
            console.error(`  [FAILED] ${therapist.full_name}:`, updateError.message);
        } else {
            console.log(`  [SUCCESS] ${therapist.full_name}`);
        }
    }

    console.log("Done.");
}

resetAllTherapistPasswords();
