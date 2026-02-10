
import { NavItem } from '../types';

// --- CREDENTIALS ---
export const ADMIN_CREDENTIALS = {
    username: 'ASWAYZ3297',
    password: 'mTcAs7293',
    authCode: '03829'
};

// --- APP CONFIGURATION ---
export const appConfig = {
    donateLink: 'https://dkn.to/mtnews',
};

// --- NAVIGATION CONFIG ---
export const navConfig: NavItem[] = [
  { id: 'Home', enabled: true },
  { id: 'Live', enabled: true },
  { id: 'Votes', enabled: true },
  { id: 'Map', enabled: true },
  { id: 'Threads', enabled: false },
  { id: 'Images', enabled: true },
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
