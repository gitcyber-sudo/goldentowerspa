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
        throw new Error('Unauthorized: Only admins can reset specialist passwords')
    }

    const { therapist_id, new_password, user_id } = await req.json()
    
    let targetUserId = user_id;

    // If therapist_id provided, look up the user_id
    if (!targetUserId && therapist_id) {
        const { data: therapist, error: fetchError } = await supabaseAdmin
            .from('therapists')
            .select('user_id')
            .eq('id', therapist_id)
            .single()
        
        if (fetchError) {
             console.error('Error fetching therapist:', fetchError)
             throw new Error(`Therapist not found: ${fetchError.message}`)
        }
        targetUserId = therapist.user_id
    }

    if (!targetUserId) throw new Error("Could not find User ID associated with this therapist")

    // Update Password
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        targetUserId,
        { password: new_password }
    )

    if (updateError) {
        console.error('Update User Error:', updateError)
        throw updateError
    }

    return new Response(
      JSON.stringify({ message: 'Password updated successfully', userId: targetUserId }),
      {\n        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error: any) {
    console.error('Function Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      {\n        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400, // Return 400 for client errors so frontend can catch it
      }
    )
  }
})
