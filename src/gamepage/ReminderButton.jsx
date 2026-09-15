/* eslint-disable react/prop-types */
import ReminderToggle from '../releases/ReminderToggle.jsx';
import { parseReleaseDate } from '../releases/dates.js';

/** "Remind me" on the Steam / GOG game page, only for unreleased games. */
export default function ReminderButton({ game }) {
    if (!game?.gameKey) return null;
    const parsed = parseReleaseDate(game.releaseDate, game.comingSoon);
    // A day-exact date decides on its own; vague dates ("Q3 2026", "Coming soon") also count when the store says coming soon
    const upcoming = parsed.precision === 'day' ? parsed.future : parsed.future || game.comingSoon;
    if (!upcoming) return null;

    const steamPlatforms = game.steam?.platforms;
    const platforms = steamPlatforms && typeof steamPlatforms === 'object' && !Array.isArray(steamPlatforms)
        ? Object.entries(steamPlatforms).filter(([, on]) => on).map(([name]) => (name === 'windows' ? 'pc' : name))
        : ['pc'];

    const entry = {
        gameKey: game.gameKey,
        name: game.name,
        image: game.image,
        releaseDate: parsed.date,
        releaseText: parsed.precision === 'day' ? null : game.releaseDate,
        url: `/game/${game.source}/${game.id}`,
        platforms,
    };

    return <ReminderToggle entry={entry} withPrompt className="!h-11 w-full sm:w-auto" />;
}
