
import { db, ref, get, push } from '../firebase';
import { LogEntry } from '../types';

let loggingEnabled: boolean | null = null;
let permissionDenied = false;

export const logAction = async (type: LogEntry['type'], message: string, details?: string) => {
    // If we already detected a permission issue, stop immediately to prevent errors.
    if (permissionDenied) return;

    try {
        if (loggingEnabled === null) {
            try {
                const snapshot = await get(ref(db, 'config/loggingEnabled'));
                loggingEnabled = snapshot.val() !== false; // Default to true if not set
            } catch (error: any) {
                // If reading config fails due to permission, assume we can't log either.
                if (error.code === 'PERMISSION_DENIED' || error.message?.includes('Permission denied')) {
                    permissionDenied = true;
                    return;
                }
                // For other errors, log warning and disable logging to be safe
                console.warn("Failed to check logging config:", error);
                loggingEnabled = false;
            }
        }

        if (!loggingEnabled) return; // Stop if logging is disabled

        const logsRef = ref(db, 'logs');
        await push(logsRef, {
            type,
            message,
            details: details || '',
            timestamp: Date.now()
        });
    } catch (e: any) {
        // Catch write errors (e.g. push failed due to rules)
        if (e.code === 'PERMISSION_DENIED' || e.message?.includes('Permission denied')) {
            permissionDenied = true;
            // Optionally log a warning once so developers know why logs aren't appearing
            console.warn("Logging disabled: Permission denied by database rules.");
        } else {
            console.error("Logging failed:", e);
        }
    }
};

export const setLoggingStatus = (status: boolean) => {
    loggingEnabled = status;
};

export const resolvePath = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('blob:') || path.startsWith('data:')) return path;
    const cleanPath = path.replace(/^(\.\/|\/)/, '');
    return `/${cleanPath}`;
};
