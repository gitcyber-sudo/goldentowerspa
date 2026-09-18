import { supabase } from './supabase';

interface LogErrorParams {
    message: string;
    stack?: string;
    component_stack?: string;
    url?: string;
    severity?: 'error' | 'warning' | 'info';
    metadata?: Record<string, any>;
}

const sentErrors = new Set<string>();

export const logError = async ({ message, stack, component_stack, url, severity = 'error', metadata }: LogErrorParams) => {
    // 1. Normalize and Capture Synthetic Stack if missing
    // If we have no stack (common when strings are thrown), create a synthetic one 
    // to at least point us to where the logger was triggered.
    let finalStack = stack;
    if (!finalStack) {
        try {
            throw new Error("Synthetic Stack Trace");
        } catch (e: any) {
            finalStack = e.stack;
        }
    }

    // 2. Client-Side Deduplication (Debounce)
    const errorKey = `${message}-${finalStack || ''}-${component_stack || ''}`;
    if (sentErrors.has(errorKey)) {
        console.warn("Duplicate error suppressed:", message);
        return;
    }
    sentErrors.add(errorKey);
    setTimeout(() => sentErrors.delete(errorKey), 10000);

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
            stack: finalStack,
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
