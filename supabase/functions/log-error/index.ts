import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ErrorLogRequest {
    message: string;
    stack?: string;
    component_stack?: string;
    url?: string;
    user_agent?: string;
    user_id?: string;
    severity?: 'error' | 'warning' | 'info';
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const { message, stack, component_stack, url, user_agent, user_id, severity } = await req.json() as ErrorLogRequest;

        // 1. Insert into DB
        const { error: dbError } = await supabase
            .from('error_logs')
            .insert({
                message,
                stack,
                component_stack,
                url,
                user_agent,
                user_id: user_id || null, // Ensure null if undefined/empty
                severity: severity || 'error',
                status: 'open'
            });

        if (dbError) {
            console.error('DB Insert Error:', dbError);
            // Don't fail the request, try to send email anyway
        }

        // 2. Check for recent duplicates to prevent email spam
        // We only send an email if this specific error hasn't been logged in the last hour
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        const { data: recentLogs } = await supabase
            .from('error_logs')
            .select('id')
            .eq('message', message)
            .gte('created_at', oneHourAgo)
            .neq('id', 'placeholder') // optimization to force index usage if needed
            .limit(2); // We only need to know if there is AT LEAST one other log (current insert + 1 previous)

        // If recentLogs has > 0 entries (excluding the one we just inserted? No, we insert first usually)
        // Wait, we inserted above. So if we query now, we will find at least 1 (the one we just made).
        // Actually, let's just query before insert or check if count > 1.

        // Let's refine: Query for *previous* errors (not including the current one if we inserted it, but we haven't committed? 
        // Supabase insert is awaited above. So `recentLogs` will include the one we just inserted.
        // So if `recentLogs.length > 1`, it means there was ALREADY an error before this one.

        const shouldSendEmail = !recentLogs || recentLogs.length <= 1;

        if (shouldSendEmail) {
            const resendApiKey = Deno.env.get('RESEND_API_KEY') || 're_3b3HMFeH_GdvT4GmnroXWsRu9v2zXFsLh';
            if (resendApiKey) {
                const res = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${resendApiKey}`,
                    },
                    body: JSON.stringify({
                        from: 'Golden Tower Spa <system@goldentowerspa.com>',
                        to: ['gtowerspa@gmail.com'],
                        subject: `[${severity?.toUpperCase() || 'ERROR'}] System Alert: ${message.substring(0, 50)}...`,
                        html: `
                            <h1>System Error Reported</h1>
                            <p><strong>Message:</strong> ${message}</p>
                            <p><strong>URL:</strong> ${url}</p>
                            <p><strong>User:</strong> ${user_id || 'Anonymous'}</p>
                            <p><strong>Severity:</strong> ${severity || 'error'}</p>
                            <h3>Stack Trace:</h3>
                            <pre style="background: #f4f4f4; padding: 10px; border-radius: 5px;">${stack}</pre>
                            <h3>Component Stack:</h3>
                            <pre style="background: #f4f4f4; padding: 10px; border-radius: 5px;">${component_stack}</pre>
                            <hr />
                            <p style="font-size: 10px; color: #666;">
                                This email was sent because this error occurred for the first time in the last hour.
                                Subsequent identical errors will be logged to the database but silenced to prevent spam.
                            </p>
                        `
                    }),
                });

                if (!res.ok) {
                    const errorData = await res.text();
                    console.error('Resend Error:', errorData);
                }
            }
        } else {
            console.log('Email silenced for duplicate error:', message);
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
