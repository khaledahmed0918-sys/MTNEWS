
import { API_BASE } from '../constants';

const DEFAULT_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second start

interface FetchOptions extends RequestInit {
    skipErrorLog?: boolean;
    retryForever?: boolean; // New option for critical polling
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const robustFetch = async (endpoint: string, options: FetchOptions = {}) => {
    let attempts = 0;
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
    
    // Headers optimization
    const headers: Record<string, string> = {
        "ngrok-skip-browser-warning": "true"
    };

    if (options.headers) {
        if (options.headers instanceof Headers) {
            options.headers.forEach((value, key) => { headers[key] = value; });
        } else if (Array.isArray(options.headers)) {
            (options.headers as string[][]).forEach(([key, value]) => { headers[key] = value; });
        } else {
            Object.assign(headers, options.headers);
        }
    }

    if (options.body instanceof FormData) {
        delete headers['Content-Type'];
    }

    // Determine max retries
    const maxRetries = options.retryForever ? Infinity : DEFAULT_RETRIES;

    while (attempts < maxRetries) {
        try {
            // Check abort signal before fetch
            if (options.signal?.aborted) {
                throw new DOMException('Aborted', 'AbortError');
            }

            const response = await fetch(url, { ...options, headers });
            
            // Server errors (500+) trigger retry. Client errors (400-499) return immediately.
            if (response.status >= 500 && response.status < 600) {
                throw new Error(`Server Error: ${response.status}`);
            }
            
            return response;
        } catch (error: any) {
            if (error.name === 'AbortError') throw error; // Stop immediately if user cancelled

            attempts++;
            const isLastAttempt = !options.retryForever && attempts >= maxRetries;
            
            if (!options.skipErrorLog && isLastAttempt) {
                console.warn(`Fetch failed for ${url}:`, error.message);
            }

            if (isLastAttempt) {
                throw error;
            }
            
            // Smart Backoff: Cap delay at 5 seconds to stay responsive
            const delay = Math.min(RETRY_DELAY * Math.pow(1.5, attempts), 5000);
            await sleep(delay);
        }
    }
    throw new Error('Fetch failed');
};
