
import { VoteGroup } from '../types';

export const voteGroups: VoteGroup[] = [
    {
        id: 'group-1',
        name: 'Best Faction',
        image: 'https://i.postimg.cc/k5YQLw5Y/burger.png',
        people: [
            {
                id: 'char-1',
                name: 'Scrap Gang',
                image: 'https://i.postimg.cc/FzvcRpm7/IMG-4249.png',
                tags: ['Gang', 'Illegal'],
                votes: 0,
                social: {}
            },
            {
                id: 'char-2',
                name: 'Police Department',
                image: 'https://i.postimg.cc/50HBJvHP/police-badge.png',
                tags: ['Government', 'Law'],
                votes: 0,
                social: {}
            }
        ]
    },
    {
        id: 'group-2',
        name: 'Best Streamer',
        image: 'https://i.postimg.cc/W3DGVrFs/tower.png',
        people: [
            {
                id: 'streamer-1',
                name: 'Tyros',
                image: 'https://i.postimg.cc/8kWggHj6/IMG-3577.jpg',
                tags: ['Content', 'Roleplay'],
                votes: 0,
                social: { kick: 'https://kick.com/tyros' }
            },
            {
                id: 'streamer-2',
                name: 'Badr',
                image: 'https://i.postimg.cc/PqrfTrx9/batman-red-2732x2732-19038.jpg$0',
                tags: ['Content'],
                votes: 0,
                social: { kick: 'https://kick.com/iiiBADR' }
            }
        ]
    }
];
