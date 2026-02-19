import { supabase } from './supabase';

interface LogErrorParams {
    message: string;
    stack?: string;
    component_stack?: string;
    url?: string;
    severity?: 'error' | 'warning' | 'info';
    metadata?: Record<string, any>;
}

export const logError = async ({ message, stack, component_stack, url, severity = 'error', metadata }: LogErrorParams) => {
    try {
        // Try to get user, but don't block logging if it fails
        let userId: string | undefined = undefined;
        try {
            const { data: { user } } = await supabase.auth.getUser();
            userId = user?.id;
        } catch (e) {
            console.warn("Could not retrieve user ID for error log", e);
        }

        const payload = {
            message,
            stack,
            component_stack,
            url: url || window.location.href,
            user_agent: navigator.userAgent,
            user_id: userId,
            severity,
            metadata // Extra context if needed
        };

        const { error } = await supabase.functions.invoke('log-error', {
            body: payload
        });

        if (error) {
            console.error("Failed to send error to Edge Function:", error);
        } else {
            console.log("Error logged successfully to Supabase.");
        }

    } catch (e) {
        console.error("Critical failure in error logger:", e);
    }
};
