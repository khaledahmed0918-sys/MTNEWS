
import type { Channel, KickApiResponse } from '../types';

// --- IMPORTANT ---
// This is a client-side implementation and is NOT recommended for production.
// A backend proxy should be used to handle API keys, caching, and rate limits to avoid CORS issues and exposure of secrets.
// This implementation is for demonstration purposes only.

const DEFAULT_PROFILE_PIC = 'https://i.postimg.cc/QNW4B8KQ/00WZrbng.png'; // Using the favicon as a fallback

/**
 * Extracts a clean username from a string, which can be a username or a full Kick URL.
 * @param input The string to parse.
 * @returns The extracted username.
 */
export const extractUsername = (input: string): string => {
    if (input.includes('kick.com/')) {
        // Find the last part of the path, removing query params or fragments
        return input.split('/').pop()?.split('?')[0].split('#')[0] || input;
    }
    return input;
};

/**
 * Helper to fetch with timeout
 */
const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 8000): Promise<Response> => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
};

/**
 * Fetches data for a single Kick channel, preserving the original username case.
 * @param originalUsername The Kick username with its intended capitalization.
 * @returns A Promise that resolves to a Channel object.
 */
export const fetchKickChannel = async (originalUsername: string): Promise<Channel> => {
  // Use CORS proxy for the main API call to avoid browser blocks
  const targetUrl = `https://kick.com/api/v1/channels/${originalUsername}?_=${Date.now()}`;
  const url = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
  
  try {
    const response = await fetchWithTimeout(url, {}, 8000); // 8s timeout

    if (response.status === 404) {
       return {
          username: originalUsername,
          display_name: originalUsername,
          profile_pic: DEFAULT_PROFILE_PIC,
          is_live: false,
          live_title: null,
          viewer_count: null,
          live_since: null,
          last_stream_start_time: null,
          live_url: `https://kick.com/${originalUsername}`,
          profile_url: `https://kick.com/${originalUsername}`,
          error: true,
          last_checked_at: new Date().toISOString(),
          bio: null,
          followers_count: null,
          banner_image: null,
          live_category: null,
          social_links: {},
          isLoading: false,
       };
    }
    
    if (!response.ok) {
      throw new Error(`API error for ${originalUsername}: ${response.status}`);
    }
    
    const data = await response.json();

    if (!data.user) {
        throw new Error(`User data not found for: ${originalUsername}`);
    }

    const isLive = data.livestream !== null;

    let lastStreamStartTime = null;
    if (!isLive) {
      try {
        const videosUrl = `https://kick.com/api/v2/channels/${originalUsername}/videos?_=${Date.now()}`;
        // Using a CORS proxy to bypass client-side fetch restrictions.
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(videosUrl)}`;
        const videosResponse = await fetchWithTimeout(proxyUrl, {}, 8000); 
        if (videosResponse.ok) {
          const videosData = await videosResponse.json();
          if (videosData && videosData.length > 0 && videosData[0].created_at) {
            lastStreamStartTime = videosData[0].created_at;
          }
        }
      } catch (videoError: any) {
        // Silent catch for video errors
      }
    }
    
    // Fallback if video fetch fails or returns no videos
    if (!lastStreamStartTime && !isLive && data.previous_livestreams && data.previous_livestreams.length > 0) {
      lastStreamStartTime = data.previous_livestreams[0].start_time;
    }

    const socialLinks: { [key: string]: string } = {};
    if (data.user?.twitter) socialLinks.twitter = data.user.twitter;
    if (data.user?.youtube) socialLinks.youtube = data.user.youtube;
    if (data.user?.instagram) socialLinks.instagram = data.user.instagram;
    if (data.user?.discord) socialLinks.discord = data.user.discord;

    // Robust follower count extraction
    // Check root, camelCase root, or inside user object
    const followersCount = data.followers_count ?? data.followersCount ?? data.user?.followers_count ?? 0;

    return {
      username: originalUsername,
      display_name: originalUsername,
      profile_pic: data.user.profile_pic || DEFAULT_PROFILE_PIC,
      is_live: isLive,
      live_title: data.livestream?.session_title || null,
      viewer_count: data.livestream?.viewer_count ?? null,
      live_since: data.livestream?.start_time || null,
      last_stream_start_time: lastStreamStartTime,
      live_url: `https://kick.com/${originalUsername}`,
      profile_url: `https://kick.com/${originalUsername}`,
      bio: data.user.bio || null,
      followers_count: Number(followersCount),
      banner_image: data.banner_image?.url || null,
      live_category: data.livestream?.category?.name || null,
      social_links: socialLinks,
      isLoading: false,
    };
  } catch (error: any) {
    // Return a default error state for this channel so the UI can handle it gracefully
    return {
      username: originalUsername,
      display_name: originalUsername,
      profile_pic: DEFAULT_PROFILE_PIC,
      is_live: false,
      live_title: null,
      viewer_count: null,
      live_since: null,
      last_stream_start_time: null,
      live_url: `https://kick.com/${originalUsername}`,
      profile_url: `https://kick.com/${originalUsername}`,
      error: true, // Flag for the UI
      last_checked_at: new Date().toISOString(),
      bio: null,
      followers_count: null,
      banner_image: null,
      live_category: null,
      social_links: {},
      isLoading: false,
    };
  }
};

/**
 * Fetches statuses for multiple Kick channels in parallel.
 * @deprecated Use fetchKickChannel in a loop in App.tsx for better control over rate limits and incremental loading.
 */
export const fetchChannelStatuses = async (streamers: { username: string; tags: string[]; character: string }[]): Promise<KickApiResponse> => {
  const channelDataPromises = streamers.map(async (streamerConfig) => {
    const username = extractUsername(streamerConfig.username);
    const channelData = await fetchKickChannel(username);
    return {
      ...channelData,
      // Merge original metadata from the constants file
      tags: streamerConfig.tags,
      character: streamerConfig.character,
    };
  });
  const results = await Promise.all(channelDataPromises);

  return {
    checked_at: new Date().toISOString(),
    data: results,
  };
};
