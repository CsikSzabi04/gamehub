/* eslint-disable react/prop-types */
// Green Steam-style "Play" button for games in the user's Steam library. Opens GameDataHub's own
// launch dialog (SteamLaunchDialog) instead of jumping straight to the steam:// link.
//
//   <PlayButton item={libraryItem} />                                   // library card: the item is known
//   <PlayButton steamAppId={730} name="Counter-Strike 2" image={url} />  // game page: looks the game up in the library
import { useCallback, useContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { BsPlayFill } from 'react-icons/bs';
import { UserContext } from '../Features/UserContext.jsx';
import { useT } from '../i18n/index.jsx';
import {
    canLaunchSteam, findOwnedSteamGame, launchableAppId, loadOwnedSteamGames, onOwnedSteamGamesChange,
} from './steamLaunch.js';
import SteamLaunchDialog, { launchSteam, skipsConfirm } from './SteamLaunchDialog.jsx';

function useOwnedSteamItem({ item, steamAppId, name }) {
    const { user } = useContext(UserContext) || {};
    const uid = item ? null : user?.uid || null;
    const [found, setFound] = useState({ key: null, item: null });
    const [version, setVersion] = useState(0);
    const key = uid && (steamAppId || name) ? `${uid}|${steamAppId || ''}|${name || ''}` : null;

    useEffect(() => (key ? onOwnedSteamGamesChange(() => setVersion(v => v + 1)) : undefined), [key]);

    useEffect(() => {
        if (!key) return undefined;
        let active = true;
        loadOwnedSteamGames(uid).then(items => {
            if (active) setFound({ key, item: findOwnedSteamGame(items, { steamAppId, name }) });
        });
        return () => { active = false; };
    }, [key, uid, steamAppId, name, version]);

    if (item) return launchableAppId(item) ? item : null;
    return found.key === key ? found.item : null;
}

export default function PlayButton({ item, steamAppId, name, image, className = '' }) {
    const { t } = useT();
    const owned = useOwnedSteamItem({ item, steamAppId, name });
    const [dialog, setDialog] = useState(null); // { game, startLaunched }
    const close = useCallback(() => setDialog(null), []);

    const appid = launchableAppId(owned);
    if (!appid || !canLaunchSteam()) return null;

    const onClick = e => {
        e.preventDefault();
        e.stopPropagation();
        const game = { appid, name: owned.name || name, image: image || owned.image };
        // "Don't ask again": launch right away, the dialog only shows "Starting…"
        const skip = skipsConfirm();
        if (skip) launchSteam(appid);
        setDialog({ game, startLaunched: skip });
    };

    return (
        <>
            <button type="button" onClick={onClick} className={`gh-btn gh-btn-play ${className}`} title={t('library.play.title')}>
                <BsPlayFill className="w-5 h-5 -ml-1" aria-hidden="true" />
                {t('library.play.label')}
            </button>
            {/* Portal: cards and heroes must not clip or offset the fixed dialog */}
            {dialog && createPortal(
                <SteamLaunchDialog key={dialog.game.appid} game={dialog.game} startLaunched={dialog.startLaunched} onClose={close} />,
                document.body,
            )}
        </>
    );
}
