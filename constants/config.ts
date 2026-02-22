
import { NavItem } from '../types';

// --- API CONFIGURATION ---
export const API_BASE = "https://dolabriform-fascinatedly-lecia.ngrok-free.dev";

// --- CREDENTIALS ---
// Credentials handled via API


// --- APP CONFIGURATION ---
export const appConfig = {
    donateLink: 'https://dkn.to/mtnews',
    addImages: true, // Enable/Disable User Image Requests
    ramadanMode: true, // Enable/Disable Ramadan Theme (Intro + Lanterns)
};

// --- NAVIGATION CONFIG ---
export const navConfig: NavItem[] = [
  { id: 'Home', enabled: true },
  { id: 'Live', enabled: true },
  { id: 'Votes', enabled: false },
  { id: 'Map', enabled: true },
  { id: 'Analyzing', enabled: true },
  { id: 'Threads', enabled: false },
  { id: 'Images', enabled: true },
  { id: 'Clips', enabled: false },
  { id: 'Links', enabled: true },
  { id: 'Tags', enabled: false },
  { id: 'Credits', enabled: true },
];

// --- VOTE CONFIG ---
export const voteConfig = {
    enabled: true,
    deadline: '2025-12-29T13:33:00', 
    cooldownHours: 0.0001, 
};
