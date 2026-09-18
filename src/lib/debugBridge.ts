import { supabase } from './supabase';

const SESSION_ID = Math.random().toString(36).substring(7);

export const initDebugBridge = () => {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const isDebugUrl = window.location.search.includes('debug=true');

    if (!isLocalhost && !isDebugUrl) return;

    console.info(`[DebugBridge] Initialized. Session: ${SESSION_ID}. Mirroring to Supabase.`);

    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    const shipLog = async (level: string, args: any[]) => {
        try {
            // Fire and forget to avoid blocking main thread or causing recursion
            const message = args.map(arg =>
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' ');

            const { error } = await supabase.from('debug_logs').insert([{
                level,
                message,
                session_id: SESSION_ID,
                source: isLocalhost ? 'localhost' : 'remote',
                data: args.find(arg => typeof arg === 'object') || null
            }]);

            if (error) originalWarn("[DebugBridge] Failed to ship log:", error.message);
        } catch (err) {
            // Silently fail to avoid console noise or recursion
        }
    };

    console.log = (...args) => {
        originalLog(...args);
        shipLog('log', args);
    };

    console.warn = (...args) => {
        originalWarn(...args);
        shipLog('warn', args);
    };

    console.error = (...args) => {
        originalError(...args);
        shipLog('error', args);
    };

    // Periodic cleanup of old logs (triggered by the developer session)
    setInterval(async () => {
        const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
        await supabase.from('debug_logs').delete().lt('created_at', oneHourAgo);
    }, 300000); // Every 5 mins
};
