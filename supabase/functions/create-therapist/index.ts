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

        // Manual Session verification
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            throw new Error('Missing Authorization header')
        }

        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)

        if (userError || !user) {
            console.error('Auth Error:', userError)
            throw new Error('Invalid or expired session')
        }

        // Check if user is admin
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profileError || profile?.role !== 'admin') {
            throw new Error('Unauthorized: Only admins can create/link specialist accounts')
        }

        const { email, password, name, bio, specialty, image_url, existing_therapist_id } = await req.json()

        console.log(`Creating/Linking therapist: ${name} (${email})`)

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

        // 2. Ensure Profile exists and has correct role
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

        // 3. Create or Update Therapist Record
        if (existing_therapist_id) {
            console.log(`Linking existing therapist ${existing_therapist_id} to user ${userId}`)
            // Link to existing record
            const { error: updateError } = await supabaseAdmin
                .from('therapists')
                .update({
                    user_id: userId,
                    name,
                    bio,
                    specialty,
                    image_url
                })
                .eq('id', existing_therapist_id)

            if (updateError) {
                console.error('Update Therapist Record Error:', updateError)
                throw updateError
            }
            console.log(`Successfully linked therapist ${existing_therapist_id}`)
        } else {
            console.log(`Creating new therapist record for ${name}`)
            // Create NEW therapist record
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
            console.log(`Successfully created therapist record for ${name}`)
        }

        return new Response(
            JSON.stringify({ message: 'Therapist created successfully', userId }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )
    } catch (error: any) {
        console.error('Function Error:', error.message)
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
