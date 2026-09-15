// Community / buyer's-guide panels on the Steam & GOG game page (StoreGamePage).
//
// Every panel receives the same `game` prop:
//   {
//     source: 'steam' | 'gog', id: string, gameKey: 'steam-730',
//     name, image, steamAppId: number | null (GOG games found on Steam too),
//     releaseDate: string | null, comingSoon: boolean,
//     requirements: { minimum, recommended } | null   (HTML strings, as SystemRequirements gets them),
//     requirementsPending: boolean   (true while a source that may still supply requirements is loading),
//     steam: the /hub/steam/app/:appid response or null,
//   }
// RAWG game pages (AllReview, SearchReview) build the same object with useRawgGameExtras.
import LibraryButton from './LibraryButton.jsx';
import PlayButton from '../library/PlayButton.jsx';
import ReminderButton from './ReminderButton.jsx';
import SubscriptionBadge from './SubscriptionBadge.jsx';
import DeckBadge from './DeckBadge.jsx';
import PricePanel from './PricePanel.jsx';
import CanIRunIt from './CanIRunIt.jsx';
import GameFacts from './GameFacts.jsx';
import GameAchievements from './GameAchievements.jsx';

/** Green "Play" (games in the user's Steam library), first in the button row. */
export function GamePlay({ game }) {
    return <PlayButton steamAppId={game?.steamAppId} name={game?.name} image={game?.image} className="!h-11 w-full sm:w-auto" />;
}

/** Buttons and badges under the title (next to "Add to favorites"). */
export function GameActions({ game }) {
    return (
        <>
            <LibraryButton game={game} />
            <ReminderButton game={game} />
        </>
    );
}

export function GameBadges({ game }) {
    return (
        <div className="mt-4 flex flex-wrap items-center gap-2 empty:hidden">
            <SubscriptionBadge game={game} />
            <DeckBadge game={game} />
        </div>
    );
}

/** Aside panels (above "Game details"). */
export function GameAside({ game }) {
    return (
        <>
            <PricePanel game={game} />
        </>
    );
}

/** Main column panels (after system requirements). */
export function GameMain({ game }) {
    return (
        <>
            <CanIRunIt game={game} />
            <GameAchievements game={game} />
            <GameFacts game={game} />
        </>
    );
}
