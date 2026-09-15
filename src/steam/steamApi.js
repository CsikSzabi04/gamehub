// Backend calls for the linked Steam account (routes/steamAccount.js in the backend).
//
//   const me = await fetchSteamMe(user);                 // profile, level, badges, recently played, friends, bans
//   const wl = await fetchWishlist(user, 'hu');          // { items: [{ appid, name, image, price, addedAt ... }], alerts }
//   await saveWishlistAlerts(user, { enabled: true, minDiscount: 25, cc: 'hu' });
import { apiGet, apiPost } from '../lib/api.js';

export const fetchSteamMe = (user, refresh = false) => apiGet(`/steam/me${refresh ? '?refresh=1' : ''}`, user);
export const fetchWishlist = (user, cc, refresh = false) => apiGet(`/steam/wishlist?cc=${encodeURIComponent(cc)}${refresh ? '&refresh=1' : ''}`, user);
export const saveWishlistAlerts = (user, settings) => apiPost('/steam/wishlist/alerts', settings, user);

/** Backend error -> key of steam.errors */
export function steamErrorCode(error) {
    const code = error?.data?.code;
    if (['no_account', 'private', 'not_configured', 'rate_limited'].includes(code)) return code;
    if (error?.status === 404) return 'not_deployed';
    return 'upstream';
}
