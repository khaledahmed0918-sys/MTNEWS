
import type { Channel, KickApiResponse } from '../types';

const DEFAULT_PROFILE_PIC = 'https://i.postimg.cc/xTTpBN0X/IMG-7992.png';

export const extractUsername = (input: string): string => {
    if (input.includes('kick.com/')) {
        return input.split('/').pop()?.split('?')[0].split('#')[0] || input;
    }
    return input;
};

// --- PROXY MANAGER ---
// Strong Protection: Rotates multiple proxies to avoid rate limits and "Proxy Failed" errors.
const PROXIES = [
    // Primary: AllOrigins - often reliable
    (target: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(target)}`,
    // Secondary: CorsProxy - good fallback
    (target: string) => `https://corsproxy.io/?${encodeURIComponent(target)}`,
    // Tertiary: CodeTabs - another reliable option
    (target: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(target)}`,
    // Quaternary: ThingProxy
    (target: string) => `https://thingproxy.freeboard.io/fetch/${target}`,
];

// Shuffle array helper for randomization to distribute load
const shuffle = <T>(array: T[]): T[] => {
    return array.sort(() => Math.random() - 0.5);
};

const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 8000): Promise<Response> => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, { 
            ...options, 
            signal: controller.signal,
            referrerPolicy: 'no-referrer' // Avoid leaking referrer to proxies
        });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
};

// Returns a safe default object to prevent crashes
const getSafeChannelObj = (username: string, error = false): Channel => ({
      username: username,
      display_name: username,
      profile_pic: DEFAULT_PROFILE_PIC,
      is_live: false,
      live_title: null,
      viewer_count: null,
      live_since: null,
      last_stream_start_time: null,
      live_url: `https://kick.com/${username}`,
      profile_url: `https://kick.com/${username}`,
      error: error,
      last_checked_at: new Date().toISOString(),
      bio: null,
      followers_count: null,
      banner_image: null,
      live_category: null,
      social_links: {},
      isLoading: false,
});

export const fetchKickChannel = async (originalUsername: string): Promise<Channel> => {
    // Timestamp for cache busting
    const t = Date.now();
    const targetUrl = `https://kick.com/api/v1/channels/${originalUsername}?_=${t}`;
    
    let responseData: any = null;
    let success = false;

    // Randomize proxies for every request to distribute load ("Strong Protection")
    const proxyList = shuffle([...PROXIES]);

    for (const proxyGen of proxyList) {
        if (success) break;
        try {
            const proxyUrl = proxyGen(targetUrl);
            const res = await fetchWithTimeout(proxyUrl, {
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            }, 6000);
            
            if (res.ok) {
                const text = await res.text();
                // Strict validation to ensure we didn't get an HTML error page from the proxy
                if (text.trim().startsWith('{')) {
                    try {
                        const json = JSON.parse(text);
                        // Check if it's the wrapper format or direct data
                        const root = json.data ? json.data : json;
                        // Validation: Must have user object or valid slug
                        if (root.user || root.slug || root.livestream !== undefined) {
                            responseData = json;
                            success = true;
                        }
                    } catch (e) {
                        // Invalid JSON, try next proxy
                    }
                }
            } else if (res.status === 404) {
                // User definitely doesn't exist on Kick
                return getSafeChannelObj(originalUsername, false);
            }
        } catch (e) {
            // Suppress "Proxy failed" logs to keep console clean as requested
            continue;
        }
    }

    if (!success || !responseData) {
        // Return error object but don't crash app
        return getSafeChannelObj(originalUsername, true);
    }

    // Parse Data safely (Supports V1 and V2 structures)
    try {
        const root = responseData.data ? responseData.data : responseData;
        const user = root.user || {};
        const livestream = root.livestream;

        const isLive = !!livestream;
        
        const socialLinks: { [key: string]: string } = {};
        if (user.twitter) socialLinks.twitter = user.twitter;
        if (user.youtube) socialLinks.youtube = user.youtube;
        if (user.instagram) socialLinks.instagram = user.instagram;
        if (user.discord) socialLinks.discord = user.discord;
        if (user.tiktok) socialLinks.tiktok = user.tiktok;

        return {
            username: originalUsername,
            display_name: user.username || originalUsername,
            profile_pic: user.profile_pic || DEFAULT_PROFILE_PIC,
            is_live: isLive,
            live_title: livestream?.session_title || null,
            viewer_count: livestream?.viewer_count || livestream?.viewers || 0,
            live_since: livestream?.created_at || null,
            last_stream_start_time: livestream?.created_at || null,
            live_url: `https://kick.com/${originalUsername}`,
            profile_url: `https://kick.com/${originalUsername}`,
            bio: user.bio || null,
            followers_count: root.followers_count || user.followers_count || 0,
            banner_image: root.banner_image?.url || root.banner_image || user.banner_image || null,
            live_category: livestream?.categories?.[0]?.name || null,
            social_links: socialLinks,
            isLoading: false,
            error: false
        };
    } catch (parseError) {
        return getSafeChannelObj(originalUsername, true);
    }
};

export const fetchChannelStatuses = async (streamers: any[]): Promise<KickApiResponse> => {
    return { checked_at: new Date().toISOString(), data: [] };
};
