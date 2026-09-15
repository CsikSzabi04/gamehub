// Community feature links (header menu, mobile menu, /community page)
import {
    BsCollection, BsPeople, BsCalendarEvent, BsGift, BsTag, BsXbox, BsActivity, BsRss, BsTrophy, BsFlag, BsListOl, BsTools, BsBell, BsAward, BsHeart, BsStars,
} from 'react-icons/bs';

export const COMMUNITY_GROUPS = [
    {
        id: 'play',
        links: [
            { to: '/for-you', key: 'forYou', icon: BsStars },
            { to: '/library', key: 'library', icon: BsCollection },
            { to: '/achievements', key: 'achievements', icon: BsAward },
            { to: '/lfg', key: 'lfg', icon: BsPeople },
            { to: '/calendar', key: 'calendar', icon: BsCalendarEvent },
        ],
    },
    {
        id: 'save',
        links: [
            { to: '/free-games', key: 'freeGames', icon: BsGift },
            { to: '/wishlist', key: 'wishlist', icon: BsHeart },
            { to: '/alerts', key: 'alerts', icon: BsTag },
            { to: '/subscriptions', key: 'subscriptions', icon: BsXbox },
            { to: '/status', key: 'status', icon: BsActivity },
        ],
    },
    {
        id: 'community',
        links: [
            { to: '/feed', key: 'feed', icon: BsRss },
            { to: '/leaderboard', key: 'leaderboard', icon: BsTrophy },
            { to: '/challenges', key: 'challenges', icon: BsFlag },
            { to: '/tierlist', key: 'tierlist', icon: BsListOl },
            { to: '/builds', key: 'builds', icon: BsTools },
            { to: '/notifications', key: 'notifications', icon: BsBell },
        ],
    },
];

export const COMMUNITY_LINKS = COMMUNITY_GROUPS.flatMap(group => group.links);
