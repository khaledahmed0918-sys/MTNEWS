
export type Lang = 'en' | 'ar';
export type Theme = 'light' | 'dark';

export type Section = 'Home' | 'Map' | 'Votes' | 'Analyzing' | 'Threads' | 'Images' | 'Links' | 'Tags' | 'Credits' | 'Live' | 'Clips' | 'Logs';

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

export interface Clip {
    id: string;
    content: string;
    type: 'file' | 'url';
    path: string;
    url: string;
    createdAt: string;
    updatedAt?: string;
}

export interface ClipRequest {
    id: string;
    content: string;
    type: 'file' | 'url';
    path: string;
    url: string;
    status: 'pending';
    createdAt: string;
}

export interface LinkData {
  id: string;
  platform: 'Twitter' | 'Discord' | 'YouTube' | 'TikTok' | 'Instagram' | 'Kick';
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
    hasError?: boolean; // New error state
    
    lastUpdated: number;
    addedAt: number;
}

export interface StreamerRequest {
    id: string;
    username: string;
    tags: string[];
    characters: string[];
    createdAt: string;
}

// --- NEW KICK SERVICE TYPES ---
export interface Channel {
    username: string;
    display_name: string;
    profile_pic: string;
    is_live: boolean;
    live_title: string | null;
    viewer_count: number | null;
    live_since: string | null;
    last_stream_start_time: string | null;
    live_url: string;
    profile_url: string;
    bio: string | null;
    followers_count: number | null;
    banner_image: string | null;
    live_category: string | null;
    social_links: { [key: string]: string };
    isLoading: boolean;
    error?: boolean;
    last_checked_at?: string;
    tags?: string[];
    character?: string;
}

export interface KickApiResponse {
    checked_at: string;
    data: Channel[];
}

// --- ANALYZING / FORMS TYPES ---

export interface UserProfile {
    name: string;
    avatar: string; // Kept for compatibility but unused in UI
}

export interface FormAttachment {
    type: string; // mimetype
    path: string;
}

export interface FormAuthor {
    name: string;
    avatar: string;
}

export interface FormMessage {
    id: string;
    author: FormAuthor;
    content: string;
    date: string;
    replyTo?: string | null; // ID of message replying to
    attachments: FormAttachment[];
}

export interface AnalysisForm {
    id: string;
    title: string;
    targets: string | null;
    createdAt: string;
    initialMessage: FormMessage;
    messages: FormMessage[];
}

export interface LogEntry {
    type: string;
    message: string;
    date: string;
}
