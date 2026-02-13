
// Logging system disabled per user request
export const logAction = async (type: string, message: string, details?: string) => {
    // No-op
};

export const setLoggingStatus = (status: boolean) => {
    // No-op
};

export const resolvePath = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http') || path.startsWith('blob:') || path.startsWith('data:')) return path;
    const cleanPath = path.replace(/^(\.\/|\/)/, '');
    // Using API_BASE from constants if needed, but keeping it simple here
    return `https://dolabriform-fascinatedly-lecia.ngrok-free.dev/${cleanPath}`;
};
