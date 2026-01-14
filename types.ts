
export type Lang = 'en' | 'ar';
export type Theme = 'light' | 'dark';

export type Section = 'Home' | 'Map' | 'Votes' | 'Threads' | 'Images' | 'Links' | 'Tags' | 'Credits' | 'Logs' | 'Live';

export interface NavItem {
  id: Section;
  enabled: boolean;
}

export interface SocialLink {
  platform: 'Twitter' | 'Kick' | 'YouTube' | 'TikTok' | 'Discord' | 'Instagram';
  url: string;
  username?: string;
}

export interface ThreadMedia {
  type: 'image' | 'video';
  url: string;
}

export interface ThreadSection {
  content: string;
  media?: ThreadMedia[];
}

export interface Thread {
  id: string;
  owner: string;
  title: string;
  description?: string;
  image: string;
  date: string;
  tags: string[];
  sections: ThreadSection[];
  socials: Partial<Record<'twitter' | 'kick' | 'youtube' | 'tiktok', string>>;
}

export interface ImageData {
  id: string;
  url: string;
  tags: string[];
}

export interface LinkData {
  id: string;
  platform: 'Twitter' | 'Discord' | 'YouTube' | 'TikTok' | 'Instagram';
  url: string;
}

export interface CreditPerson {
  name: string;
  roleKey: 'founder' | 'developer' | 'contributor';
  image: string;
  socials: SocialLink[];
}

export interface MapObjectLocation {
  x: number;
  y: number;
}

export interface MapObjectItem {
  id: string;
  name: string;
  icon: string;
  size?: number;
  locations: MapObjectLocation[];
}

export interface MapObjectGroup {
  id: string;
  name: string;
  icon: string;
  objectIds: string[];
}

export interface VoteGroup {
    id: string;
    name: string;
    image: string;
}

export interface VoteCharacter {
    id: string;
    name: string;
    role: string; 
    faction: string;
    rank: string;
    note: string;
    image: string;
    socials: SocialLink[];
    tags?: string[];
}

export interface VoteHistoryItem {
    id: 'string';
    characterId: string;
    characterName: string;
    characterImage: string;
    timestamp: number;
    groupId: string;
    groupName: string;
}

export interface VoteConfig {
    deadline: string;
    cooldownTime: string; 
    onceVote: boolean;
}

export interface LogEntry {
    id: string;
    type: 'vote' | 'admin' | 'system' | 'image';
    message: string;
    details?: string;
    timestamp: number;
}

// --- LIVE SECTION TYPES ---

export interface KickChannelInfo {
    id: number;
    slug: string;
    user_id: number;
    username: string;
    profile_pic: string;
    banner: string;
    followers_count: number;
    created_at: string;
    bio: string;
}

export interface KickStreamInfo {
    id: number;
    is_live: boolean;
    viewers: number;
    start_time: string;
    title: string;
    category_name: string;
    category_icon: string; // usually parent_category.slug or similar
    thumbnail: string;
}

export interface Streamer {
    id: string; // unique ID
    kickUsername: string; // The identifier used for API
    kickData: KickChannelInfo; // Static data (avatar, banner, etc.)
    streamData: KickStreamInfo; // Live data (viewers, title, is_live)
    
    // User Custom Data
    customTitle?: string;
    tags: string[];
    notes?: string;
    
    // System Data
    isFavorite: boolean;
    notificationsEnabled: boolean;
    lastUpdated: number;
    addedAt: number;
}
