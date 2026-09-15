/* eslint-disable react/prop-types */
// "Add to library" split button on the Steam / GOG game page (GameActions).
import { useCallback, useContext, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BsChevronDown, BsCollection, BsPlusLg } from 'react-icons/bs';
import { UserContext } from '../Features/UserContext.jsx';
import { useT } from '../i18n/index.jsx';
import { useLibraryItem } from '../library/useLibrary.js';
import { STATUS_COLORS } from '../library/libraryApi.js';
import { STATUS_ICONS } from '../library/statusIcons.js';
import StatusMenu from '../library/StatusMenu.jsx';

export default function LibraryButton({ game }) {
    const { t } = useT();
    const { user, authReady } = useContext(UserContext) || {};
    const { item, loading, setStatus, remove } = useLibraryItem(game?.gameKey);
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(false);
    const anchorRef = useRef(null);
    const close = useCallback(() => setOpen(false), []);

    if (!game?.gameKey) return null;

    if (authReady && !user) {
        return (
            <Link to="/login" className="gh-btn gh-btn-secondary !h-11 w-full sm:w-auto">
                <BsCollection aria-hidden="true" />
                {t('library.button.add')}
            </Link>
        );
    }

    const run = async action => {
        setBusy(true);
        setError(false);
        try {
            await action();
            setOpen(false);
        } catch (err) {
            console.error('Library update failed:', err);
            setError(true);
        } finally {
            setBusy(false);
        }
    };

    const status = item?.status || null;
    const Icon = status ? STATUS_ICONS[status] : BsPlusLg;
    const defaultStatus = game.comingSoon ? 'wishlist' : 'backlog';
    const disabled = !authReady || loading || busy;

    const onMain = () => {
        if (status) setOpen(value => !value);
        else run(() => setStatus(game, defaultStatus));
    };

    return (
        <div ref={anchorRef} className="flex w-full sm:w-auto">
            <button
                type="button"
                onClick={onMain}
                disabled={disabled}
                title={error ? t('library.errors.save') : undefined}
                className="gh-btn gh-btn-secondary !h-11 flex-1 sm:flex-none !rounded-r-none min-w-0"
            >
                <Icon aria-hidden="true" style={status ? { color: STATUS_COLORS[status] } : undefined} />
                <span className="truncate">
                    {error ? t('library.errors.saveShort') : status ? t(`library.status.${status}`) : t('library.button.add')}
                </span>
            </button>
            <button
                type="button"
                onClick={() => setOpen(value => !value)}
                disabled={disabled}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label={t('library.button.choose')}
                className="gh-btn gh-btn-secondary !h-11 !px-3 !rounded-l-none !border-l-white/[0.12] -ml-px"
            >
                <BsChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>
            <StatusMenu
                open={open}
                anchorRef={anchorRef}
                onClose={close}
                current={status}
                busy={busy}
                onSelect={next => (next === status ? setOpen(false) : run(() => setStatus(game, next)))}
                onRemove={() => run(remove)}
            />
        </div>
    );
}
