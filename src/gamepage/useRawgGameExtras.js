// The GameExtras `game` object for RAWG game pages (AllReview, SearchReview), with the Steam
// version's requirements, facts and platforms when the game is on Steam.
import { normalizeRequirements } from './matching.js';
import useSteamMatch from './useSteamMatch.js';

/**
 * @param {object|null} game RAWG game (list entry or detail response)
 * @param {{ minimum?: string, recommended?: string } | null} rawgRequirements PC requirements RAWG already has
 * @returns {{ extrasGame: object|null, requirements: object|null }} requirements: PC, as SystemRequirements takes them
 */
export default function useRawgGameExtras(game, rawgRequirements) {
    const match = useSteamMatch({
        enabled: Boolean(game?.id),
        rawgId: game?.id ?? null,
        name: game?.name,
        releaseDate: game?.released,
    });

    if (!game?.id) return { extrasGame: null, requirements: null };

    // Steam's requirement lists are the most complete; RAWG's copy is often missing or outdated
    const requirements = normalizeRequirements(match.steam?.requirements) || normalizeRequirements(rawgRequirements);

    const extrasGame = {
        source: 'rawg',
        id: String(game.id),
        // Votes are shared with the Steam game page once the Steam version is known
        gameKey: match.settled ? (match.steamAppId ? `steam-${match.steamAppId}` : `rawg-${game.id}`) : null,
        name: game.name,
        image: game.background_image || match.steam?.image || null,
        steamAppId: match.steamAppId,
        releaseDate: game.released || null,
        comingSoon: Boolean(game.tba || match.steam?.comingSoon),
        requirements,
        requirementsPending: !requirements && !match.settled,
        steam: match.steam || null,
    };

    return { extrasGame, requirements };
}
