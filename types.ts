
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
  apiType?: 'file' | 'url';
}

export interface ImageCategory {
    id: string;
    name: string;
    tags: string[];
    createdAt?: string;
    updatedAt?: string;
}

export interface ImageRequest {
    id: string;
    type: 'file' | 'url';
    url: string;
    path: string; // from backend
    tags: string[];
    status: 'pending' | 'accepted' | 'denied';
    createdAt: string;
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

// Updated Vote Types for New API
export interface VoteGroup {
    id: string;
    name: string;
    image: string;
    people: VoteCharacter[]; 
}

export interface VoteCharacter {
    id: string;
    name: string;
    image: string;
    tags: string[];
    votes: number;
    social: {
        discord?: string;
        kick?: string;
        instagram?: string;
        youtube?: string;
        twitter?: string;
    };
    // Mapped properties for UI compatibility
    role?: string;
    faction?: string;
    rank?: string;
    note?: string;
}

export interface LogEntry {
    type: string;
    message: string;
    date: string;
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
    category_icon: string;
    thumbnail: string;
}

export interface StreamerLinks {
    discord?: string;
    kick?: string;
    instagram?: string;
    youtube?: string;
    twitter?: string;
}

export interface Streamer {
    id: string;
    kickUsername: string; // Used for API calls
    kickData?: KickChannelInfo; // From Kick API
    streamData?: KickStreamInfo; // From Kick API
    
    // User/System Defined Data
    customTitle?: string;
    tags: string[];
    characters?: string[]; // Added for Admin System
    notes?: string;
    links?: StreamerLinks; // Added for Admin System
    
    // System Flags
    isSystem: boolean; // True if from Admin API
    isFavorite: boolean;
    notificationsEnabled: boolean;
    
    lastUpdated: number;
    addedAt: number;
}