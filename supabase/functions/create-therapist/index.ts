// deno-lint-ignore-file
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const { email, password, name, bio, specialty, image_url } = await req.json()

        console.log(`Creating therapist: ${name} (${email})`)

        // 1. Create Auth User
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: name, role: 'therapist' }
        })

        if (userError) {
            console.error('Create User Error:', userError)
            throw userError
        }

        const userId = userData.user.id

        // 2. Ensure Profile exists and has correct role (Trigger usually creates it, but we update role)
        // We wait a bit or just upsert. Upsert is safer.
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: userId,
                full_name: name,
                email: email,
                role: 'therapist'
            })

        if (profileError) {
            console.error('Profile Upsert Error:', profileError)
            // If profile errors, we might want to delete the user to keep state consistent? 
            // For now, let's just log it and try to continue as the user exists.
        }

        // 3. Create Therapist Record
        const { error: therapistError } = await supabaseAdmin
            .from('therapists')
            .insert({
                user_id: userId,
                name,
                bio,
                specialty,
                image_url,
                active: true
            })

        if (therapistError) {
            console.error('Therapist Record Error:', therapistError)
            throw therapistError
        }

        return new Response(
            JSON.stringify({ message: 'Therapist created successfully', userId }),
            {
            \n        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )
    } catch (error: any) {
        console.error('Function Error:', error.message)
        return new Response(
            JSON.stringify({ error: error.message }),
            {
            \n        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
