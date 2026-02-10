
const API_BASE = "https://dolabriform-fascinatedly-lecia.ngrok-free.dev";

export const logAction = async (type: string, message: string, details?: string) => {
    try {
        await fetch(`${API_BASE}/logs/add`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                "ngrok-skip-browser-warning": "true"
            },
            body: JSON.stringify({ 
                type, 
                message: details ? `${message} | ${details}` : message 
            })
        });
    } catch (e) {
        // Silent fail
    }
};

export const setLoggingStatus = (status: boolean) => {
    // Deprecated in new API context
};

export const resolvePath = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('blob:') || path.startsWith('data:')) return path;
    const cleanPath = path.replace(/^(\.\/|\/)/, '');
    return `${API_BASE}/${cleanPath}`;
};
