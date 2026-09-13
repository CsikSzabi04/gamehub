import { SiSteam, SiEpicgames, SiGogdotcom, SiPlaystation, SiNintendoswitch, SiAppstore, SiGoogleplay, SiItchdotio, SiBattledotnet, SiEa, SiUbisoft } from 'react-icons/si';
import { FaXbox } from 'react-icons/fa';

/**
 * Stores where the games shown on GameDataHub can be bought or downloaded.
 * `rawg` lists the store slugs used by the RAWG catalogue (game.stores[].store.slug),
 * so a store can report how many catalogue games it sells.
 * `mentioned` says where on the site the store shows up.
 */
export const STORE_GROUPS = [
    {
        id: 'pc',
        title: 'PC stores',
        stores: [
            {
                id: 'steam',
                name: 'Steam',
                url: 'https://store.steampowered.com/',
                icon: SiSteam,
                rawg: ['steam'],
                mentioned: 'Catalogue, store charts, free games, giveaways',
            },
            {
                id: 'epic-games',
                name: 'Epic Games Store',
                url: 'https://store.epicgames.com/',
                icon: SiEpicgames,
                rawg: ['epic-games'],
                mentioned: 'Catalogue, discounted games, giveaways',
            },
            {
                id: 'gog',
                name: 'GOG',
                url: 'https://www.gog.com/',
                icon: SiGogdotcom,
                rawg: ['gog'],
                mentioned: 'Catalogue, GOG trending and deals',
            },
            {
                id: 'itch',
                name: 'itch.io',
                url: 'https://itch.io/games',
                icon: SiItchdotio,
                rawg: ['itch'],
                mentioned: 'Indie games in search results',
            },
        ],
    },
    {
        id: 'console',
        title: 'Console stores',
        stores: [
            {
                id: 'playstation-store',
                name: 'PlayStation Store',
                url: 'https://store.playstation.com/',
                icon: SiPlaystation,
                rawg: ['playstation-store'],
                mentioned: 'Catalogue, PS4 and PS5 giveaways',
            },
            {
                id: 'xbox-store',
                name: 'Xbox Store',
                url: 'https://www.xbox.com/en-US/games/browse',
                icon: FaXbox,
                rawg: ['xbox-store', 'xbox360'],
                mentioned: 'Catalogue, Xbox giveaways',
            },
            {
                id: 'nintendo',
                name: 'Nintendo eShop',
                url: 'https://www.nintendo.com/store/games/',
                icon: SiNintendoswitch,
                rawg: ['nintendo'],
                mentioned: 'Catalogue, Switch giveaways',
            },
        ],
    },
    {
        id: 'mobile',
        title: 'Mobile stores',
        stores: [
            {
                id: 'apple-appstore',
                name: 'App Store',
                url: 'https://apps.apple.com/us/charts/iphone/top-free-games/6014',
                icon: SiAppstore,
                rawg: ['apple-appstore'],
                mentioned: 'Catalogue, iOS giveaways',
            },
            {
                id: 'google-play',
                name: 'Google Play',
                url: 'https://play.google.com/store/games',
                icon: SiGoogleplay,
                rawg: ['google-play'],
                mentioned: 'Catalogue, Android giveaways',
            },
        ],
    },
    {
        id: 'launchers',
        title: 'Publisher launchers',
        stores: [
            {
                id: 'battlenet',
                name: 'Battle.net',
                url: 'https://shop.battle.net/',
                icon: SiBattledotnet,
                rawg: [],
                mentioned: 'Overwatch 2 and other Blizzard games',
            },
            {
                id: 'ea-app',
                name: 'EA app',
                url: 'https://www.ea.com/ea-app',
                icon: SiEa,
                rawg: [],
                mentioned: 'Apex Legends and other EA games',
            },
            {
                id: 'ubisoft',
                name: 'Ubisoft Store',
                url: 'https://store.ubisoft.com/',
                icon: SiUbisoft,
                rawg: [],
                mentioned: "Rainbow Six Siege and other Ubisoft games",
            },
        ],
    },
];

/** Counts how many catalogue games each store sells, keyed by store id. */
export function countCatalogueGames(games) {
    const counts = {};
    if (!Array.isArray(games)) return counts;
    for (const group of STORE_GROUPS) {
        for (const store of group.stores) {
            if (!store.rawg.length) continue;
            counts[store.id] = games.filter(game =>
                game.stores?.some(entry => store.rawg.includes(entry.store?.slug))
            ).length;
        }
    }
    return counts;
}
