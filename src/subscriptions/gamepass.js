// Game Pass catalog helpers shared by the /subscriptions page and the game page badge.
import { API_BASE } from '../Components/apiCache.js';

/** Tab order on the page. Ids match the backend `list` parameter. */
export const GAMEPASS_LISTS = ['recent', 'leaving', 'coming', 'console', 'pc', 'eaplay', 'essential'];

export const gamepassListUrl = list => `${API_BASE}/subscriptions/gamepass?list=${encodeURIComponent(list)}`;

export const subscriptionCheckUrl = title => `${API_BASE}/subscriptions/check?title=${encodeURIComponent(String(title || '').trim().slice(0, 200))}`;

export const steamSearchUrl = name => `https://store.steampowered.com/search/?term=${encodeURIComponent(name)}`;

/** Official catalogs of services without a public data feed. `key` -> subscriptions.links.<key> */
export const EXTERNAL_CATALOGS = [
    { key: 'gamepass', url: 'https://www.xbox.com/xbox-game-pass/games', color: '#22c55e' },
    { key: 'psplus', url: 'https://www.playstation.com/ps-plus/games/', color: '#3b82f6' },
    { key: 'ubisoft', url: 'https://store.ubisoft.com/ubisoftplus/games', color: '#60a5fa' },
    { key: 'eaplay', url: 'https://www.ea.com/ea-play/games', color: '#f87171' },
    { key: 'geforcenow', url: 'https://www.nvidia.com/geforce-now/games/', color: '#84cc16' },
];

/** Response transforms for useApi (module level = stable). */
export const toList = raw => ({
    items: Array.isArray(raw?.items) ? raw.items : [],
    updatedAt: raw?.updatedAt || null,
});

export const toMatches = raw => (Array.isArray(raw?.matches) ? raw.matches.map(m => m.list) : []);

export const searchKey = value => String(value || '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]/g, '');
