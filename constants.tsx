import { NavItem, Thread, ImageData, LinkData, CreditPerson } from './types';
// FIX: Removed Kick, Tiktok, Discord from lucide-react import as they don't exist.
import { Twitter, Youtube, Instagram, Sun, Moon, Languages, Star, Search, ChevronDown, Link as LinkIcon, ExternalLink, ClipboardCopy, Home, Users, MessageSquare, Image as ImageIcon, Link2, UserCircle, Award, X, Check } from 'lucide-react';
import React from 'react';

// --- ICONS ---
// FIX: Added custom components for icons not available in lucide-react.
const Kick = (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img src="https://i.postimg.cc/65CJczDK/1726118265kick-logo-white.png" alt="Kick Logo" {...props} className={`${props.className || ''} object-contain`} />
);
const Tiktok = (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img src="https://i.postimg.cc/hhWshLr1/tiktok-512.png" alt="TikTok Logo" {...props} />
);
const Discord = (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img src="https://i.postimg.cc/FFMX0wCJ/pngkey-com-discord-png-200938.png" alt="Discord Logo" {...props} className={`${props.className || ''} object-contain`} />
);

export const Icons = {
  Twitter: (props: React.SVGProps<SVGSVGElement>) => <Twitter {...props} />,
  Kick: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <Kick {...props} />,
  YouTube: (props: React.SVGProps<SVGSVGElement>) => <Youtube {...props} />,
  TikTok: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <Tiktok {...props} />,
  Instagram: (props: React.SVGProps<SVGSVGElement>) => <Instagram {...props} />,
  Discord: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <Discord {...props} />,
  Sun: (props: React.SVGProps<SVGSVGElement>) => <Sun {...props} />,
  Moon: (props: React.SVGProps<SVGSVGElement>) => <Moon {...props} />,
  Languages: (props: React.SVGProps<SVGSVGElement>) => <Languages {...props} />,
  Star: (props: React.SVGProps<SVGSVGElement>) => <Star {...props} />,
  Search: (props: React.SVGProps<SVGSVGElement>) => <Search {...props} />,
  ChevronDown: (props: React.SVGProps<SVGSVGElement>) => <ChevronDown {...props} />,
  Link: (props: React.SVGProps<SVGSVGElement>) => <LinkIcon {...props} />,
  ExternalLink: (props: React.SVGProps<SVGSVGElement>) => <ExternalLink {...props} />,
  ClipboardCopy: (props: React.SVGProps<SVGSVGElement>) => <ClipboardCopy {...props} />,
  Home: (props: React.SVGProps<SVGSVGElement>) => <Home {...props} />,
  Gangs: (props: React.SVGProps<SVGSVGElement>) => <Users {...props} />,
  Threads: (props: React.SVGProps<SVGSVGElement>) => <MessageSquare {...props} />,
  Images: (props: React.SVGProps<SVGSVGElement>) => <ImageIcon {...props} />,
  Links: (props: React.SVGProps<SVGSVGElement>) => <Link2 {...props} />,
  Characters: (props: React.SVGProps<SVGSVGElement>) => <UserCircle {...props} />,
  Credits: (props: React.SVGProps<SVGSVGElement>) => <Award {...props} />,
  X: (props: React.SVGProps<SVGSVGElement>) => <X {...props} />,
  Check: (props: React.SVGProps<SVGSVGElement>) => <Check {...props} />,
};

// --- NAVIGATION CONFIG ---
export const navConfig: NavItem[] = [
  { id: 'Home', enabled: true },
  { id: 'Gangs', enabled: true },
  { id: 'Threads', enabled: true },
  { id: 'Images', enabled: true },
  { id: 'Links', enabled: true },
  { id: 'Characters', enabled: false },
  { id: 'Credits', enabled: true },
];

// --- TRANSLATIONS ---
export const translations = {
  en: {
    // Nav
    Home: 'Home',
    Gangs: 'Gangs',
    Threads: 'Threads',
    Images: 'Images',
    Links: 'Links',
    Characters: 'Characters',
    Credits: 'Credits',
    
    // Home Page
    mtnewsCardTitle: 'MTNEWS Card',
    cardInfoTitle: 'Card Informations',
    cardInfoDescription: 'MTNEWS Sharing all news about MTRP Server',
    followers: 'Followers',
    teamWorkers: 'Team Workers',
    goal: 'MTNEWS Goal',
    donatePrompt: 'If You Hope To Donate Me 🧡.',
    donateButton: 'Donate',

    // Gangs Page
    gangsWip: 'This section is under development.',

    // Threads Page
    searchPlaceholder: 'Search by title or owner...',
    sortBy: 'Sort By',
    sortByName: 'Owner Name',
    sortByDate: 'Date',
    sortBySections: 'Sections Count',
    return: 'Return',
    threadCharacters: 'Characters',
    threadSocialMedia: 'Social Media',
    thanks: 'Thanks for Visiting Us 🧡.',
    sectionNumbers: 'Section Numbers',
    owner: 'Owner',

    // Images Page
    searchImagesPlaceholder: 'Search by character...',
    linkButton: 'Link',

    // Links Page
    mtrpOn: 'MTRP on',

    // Credits Page
    founder: 'Founder',
    developer: 'Developer',
    creditsFor: 'Credits For',
    contributor: 'Contributor',
    copied: 'Copied!',

    // General
    loading: 'Loading...'
  },
  ar: {
    // Nav
    Home: 'الرئيسية',
    Gangs: 'العصابات',
    Threads: 'المواضيع',
    Images: 'الصور',
    Links: 'الروابط',
    Characters: 'الشخصيات',
    Credits: 'الشكر',

    // Home Page
    mtnewsCardTitle: 'بطاقة MTNEWS',
    cardInfoTitle: 'معلومات البطاقة',
    cardInfoDescription: 'MTNEWS لمشاركة جميع أخبار سيرفر MTRP',
    followers: 'متابع',
    teamWorkers: 'أعضاء الفريق',
    goal: 'هدف MTNEWS',
    donateButton: 'تبرع',

    // Gangs Page
    gangsWip: 'هذا القسم قيد التطوير.',

    // Threads Page
    searchPlaceholder: 'ابحث بالعنوان أو المالك...',
    sortBy: 'ترتيب حسب',
    sortByName: 'اسم المالك',
    sortByDate: 'التاريخ',
    sortBySections: 'عدد الأقسام',
    return: 'العودة',
    threadCharacters: 'الشخصيات',
    threadSocialMedia: 'وسائل التواصل الاجتماعي',
    thanks: 'شكراً لزيارتنا 🧡.',
    sectionNumbers: 'أرقام الأقسام',
    owner: 'المالك',

    // Images Page
    searchImagesPlaceholder: 'ابحث بالشخصية...',
    linkButton: 'رابط',

    // Links Page
    mtrpOn: 'MTRP على',

    // Credits Page
    founder: 'المؤسس',
    developer: 'المطور',
    creditsFor: 'شكر خاص لـ',
    contributor: 'مساهم',
    copied: 'تم النسخ!',

    // General
    loading: 'جاري التحميل...'
  }
};

// --- MOCK DATA ---

export const threadsData: Thread[] = [
  {
    id: 'thread-1',
    owner: 'Alpha',
    title: 'The Grand Heist of the Century',
    description: 'A deep dive into the planning and execution of the biggest bank job in the city\'s history.',
    image: 'https://picsum.photos/seed/heist/800/400',
    date: '2024-07-20',
    characters: ['Alpha', 'Bravo', 'Charlie'],
    sections: {
      s1: 'The plan was simple, yet elegant. We needed three things: a driver, a hacker, and a distraction. Each role was critical, and failure was not an option. The target was the Pacific Standard Bank, known for its impenetrable vault.',
      s2: 'Bravo, our tech genius, spent weeks bypassing their security systems from a remote location. His fingers danced across the keyboard, disabling cameras and alarms one by one. Meanwhile, Charlie created a massive diversion on the other side of town, drawing the police away from our real target.',
      s3: 'With the path clear, I went in. The adrenaline was pumping, every second felt like an hour. We cleared the vault in under five minutes, a new record. The city wouldn\'t know what hit them until morning.',
    },
    socials: {
      twitter: 'https://twitter.com/MT_FiveM',
      youtube: 'https://www.youtube.com/@MT_FiveM',
    },
  },
  {
    id: 'thread-2',
    owner: 'Bravo',
    title: 'Digital Ghosts: A Hacker\'s Tale',
    description: 'Exploring the shadows of the digital world, where information is power and code is the weapon.',
    image: 'https://picsum.photos/seed/hacker/800/400',
    date: '2024-07-18',
    characters: ['Bravo', 'Echo'],
    sections: {
      s1: 'They call me a ghost. I move through networks unseen, unheard. For this operation, I had to become more than a ghost. I had to become a phantom, erasing our digital footprints as we made them.',
      s2: 'The challenge was not just breaking in, but staying invisible. I built custom backdoors and routed our traffic through a dozen countries. The corporation we targeted had state-of-the-art defenses, but every system has a weakness.',
    },
    socials: {
      kick: 'https://kick.com/MTNEWS',
    },
  },
  {
    id: 'thread-3',
    owner: 'Alpha',
    title: 'Street Politics and Power Plays',
    description: 'Navigating the complex web of alliances and rivalries that define the city\'s underworld.',
    image: 'https://picsum.photos/seed/politics/800/400',
    date: '2024-07-15',
    characters: ['Alpha', 'Delta', 'Foxtrot'],
    sections: {
      s1: 'Power in this city isn\'t taken, it\'s earned. Respect is the currency, and loyalty is the law. We had to make a statement, to show the other crews that we were a force to be reckoned with.',
      s2: 'The meeting was tense. Old rivals sat across from us, their faces unreadable. Words were chosen carefully, promises made and threats veiled. By the end of the night, new territories were drawn, and the balance of power had shifted.',
      s3: 'This is a never-ending game of chess. Every move is calculated, every piece has its role. We won this round, but the next is always just around the corner.',
      s4: 'And as the sun sets, we look over our new empire, knowing that the peace is temporary. The city is always hungry.',
    },
    socials: {
      twitter: 'https://twitter.com/MT_FiveM',
      tiktok: 'https://www.tiktok.com/@mysterytown.gg',
    },
  },
];

export const imagesData: ImageData[] = [
    { id: 'img-1', url: 'https://picsum.photos/seed/char1/600/800', character: 'Alpha' },
    { id: 'img-2', url: 'https://picsum.photos/seed/char2/600/800', character: 'Bravo' },
    { id: 'img-3', url: 'https://picsum.photos/seed/char3/600/800', character: 'Charlie' },
    { id: 'img-4', url: 'https://picsum.photos/seed/char4/600/800', character: 'Alpha' },
    { id: 'img-5', url: 'https://picsum.photos/seed/char5/600/800', character: 'Delta' },
    { id: 'img-6', url: 'https://picsum.photos/seed/char6/600/800', character: 'Echo' },
    { id: 'img-7', url: 'https://picsum.photos/seed/char7/600/800', character: 'Bravo' },
    { id: 'img-8', url: 'https://picsum.photos/seed/char8/600/800', character: 'Foxtrot' },
];

export const linksData: LinkData[] = [
  { id: 'link-1', platform: 'Twitter', url: 'https://twitter.com/MT_FiveM' },
  { id: 'link-2', platform: 'Discord', url: 'https://discord.gg/mt' },
  { id: 'link-3', platform: 'YouTube', url: 'https://www.youtube.com/@MT_FiveM' },
  { id: 'link-4', platform: 'TikTok', url: 'https://www.tiktok.com/@mysterytown.gg?is_from_webapp=1&sender_device=pc' },
];

export const creditsData: CreditPerson[] = [
  {
    name: 'MTNEWS',
    roleKey: 'founder',
    image: 'https://i.postimg.cc/PrqvJ5RX/IMG-7993.png',
    socials: [
      { platform: 'Twitter', url: 'https://x.com/mtnews_?s=21' },
      { platform: 'Kick', url: 'https://kick.com/MTNEWS' },
    ],
  },
  {
    name: 'Mohammed',
    roleKey: 'developer',
    image: 'https://i.postimg.cc/vmGs8c0W/91106cac524b2ae1dfe17ea8ff2b46d6.png',
    socials: [
      { platform: 'Twitter', url: 'https://x.com/i_mohammedqht?s=21' },
      { platform: 'Discord', url: '#', username: '221.k' },
      { platform: 'Kick', url: 'https://kick.com/221k' },
    ],
  },
  {
    name: 'Contributor 1',
    roleKey: 'contributor',
    image: 'https://picsum.photos/seed/contrib1/200/200',
    socials: [{ platform: 'Twitter', url: '#' }],
  },
  {
    name: 'Contributor 2',
    roleKey: 'contributor',
    image: 'https://picsum.photos/seed/contrib2/200/200',
    socials: [{ platform: 'Twitter', url: '#' }],
  },
  {
    name: 'Contributor 3',
    roleKey: 'contributor',
    image: 'https://picsum.photos/seed/contrib3/200/200',
    socials: [{ platform: 'Kick', url: '#' }],
  },
  {
    name: 'Contributor 4',
    roleKey: 'contributor',
    image: 'https://picsum.photos/seed/contrib4/200/200',
    socials: [{ platform: 'YouTube', url: '#' }],
  },
  {
    name: 'Contributor 5',
    roleKey: 'contributor',
    image: 'https://picsum.photos/seed/contrib5/200/200',
    socials: [{ platform: 'Discord', url: '#', username: 'contrib5' }],
  },
];