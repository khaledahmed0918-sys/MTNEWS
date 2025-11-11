
export type Lang = 'en' | 'ar';
export type Theme = 'light' | 'dark';

export type Section = 'Home' | 'Gangs' | 'Threads' | 'Images' | 'Links' | 'Characters' | 'Credits';

export interface NavItem {
  id: Section;
  enabled: boolean;
}

export interface SocialLink {
  platform: 'Twitter' | 'Kick' | 'YouTube' | 'TikTok' | 'Discord';
  url: string;
  username?: string;
}

export interface Thread {
  id: string;
  owner: string;
  title: string;
  description?: string;
  image: string;
  date: string;
  characters: string[];
  sections: { [key: string]: string };
  socials: Partial<Record<'twitter' | 'kick' | 'youtube' | 'tiktok', string>>;
}

export interface ImageData {
  id: string;
  url: string;
  character: string;
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
   