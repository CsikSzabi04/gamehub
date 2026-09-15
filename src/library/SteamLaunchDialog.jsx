/* eslint-disable react/prop-types */
// GameDataHub's own launch dialog: confirm ("Launch GTA V?") -> "Starting…".
// Browsers always ask once before opening steam:// links; that prompt can't be replaced by a website,
// so the dialog tells the user to tick "Always allow" – after that only this dialog shows.
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BsCheck2, BsInfoCircle, BsPlayFill, BsSteam, BsX } from 'react-icons/bs';
import { useT } from '../i18n/index.jsx';
import { steamHeader } from '../lib/games.js';
import { steamRunUrl } from './steamLaunch.js';

const SKIP_CONFIRM_KEY = 'gdh-steam-skip-confirm';
const HINT_DONE_KEY = 'gdh-steam-browser-allowed';
const AUTO_CLOSE_MS = 4000;

const readFlag = key => {
    try { return localStorage.getItem(key) === '1'; } catch { return false; }
};
const writeFlag = (key, on) => {
    try { if (on) localStorage.setItem(key, '1'); else localStorage.removeItem(key); } catch { /* storage blocked */ }
};

export const skipsConfirm = () => readFlag(SKIP_CONFIRM_KEY);

export function launchSteam(appid) {
    window.location.href = steamRunUrl(appid);
}

/**
 * @param {{ game: { appid: number, name: string, image?: string } | null, startLaunched: boolean, onClose: () => void }} props
 */
export default function SteamLaunchDialog({ game, startLaunched, onClose }) {
    const { t } = useT();
    const [phase, setPhase] = useState(startLaunched ? 'launching' : 'confirm');
    const [dontAsk, setDontAsk] = useState(false);
    const [hintDone, setHintDone] = useState(() => readFlag(HINT_DONE_KEY));
    const open = Boolean(game);

    useEffect(() => {
        if (!open) return undefined;
        const onKey = e => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    // The "Starting…" card closes itself once the browser prompt is no longer expected
    useEffect(() => {
        if (phase !== 'launching' || !hintDone) return undefined;
        const timer = setTimeout(onClose, AUTO_CLOSE_MS);
        return () => clearTimeout(timer);
    }, [phase, hintDone, onClose]);

    const play = () => {
        writeFlag(SKIP_CONFIRM_KEY, dontAsk);
        launchSteam(game.appid);
        setPhase('launching');
    };

    const finishHint = () => {
        writeFlag(HINT_DONE_KEY, true);
        setHintDone(true);
    };

    const image = game?.image || (game ? steamHeader(game.appid) : null);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="fixed inset-0 z-[220] bg-black/75 flex items-end sm:items-center justify-center sm:p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ duration: 0.18 }}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="steam-launch-title"
                        onClick={e => e.stopPropagation()}
                        className="relative w-full sm:max-w-md overflow-hidden rounded-t-2xl sm:rounded-2xl bg-[#111319] border border-white/[0.08] shadow-[0_24px_60px_rgba(0,0,0,0.6)] pb-[env(safe-area-inset-bottom)]"
                    >
                        <div className="relative aspect-[460/215] bg-[#0a0b0f]">
                            {image && <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" onError={e => { e.currentTarget.style.visibility = 'hidden'; }} />}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#111319] via-[#111319]/30 to-transparent" />
                            <span className="absolute left-4 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-[#c7d5e0]">
                                <BsSteam className="w-3.5 h-3.5" aria-hidden="true" /> Steam
                            </span>
                            <button type="button" onClick={onClose} aria-label={t('library.play.close')} className="gh-icon-btn absolute right-3 top-3 !bg-black/60">
                                <BsX className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="px-5 pb-5 -mt-6 relative">
                            {phase === 'confirm' ? (
                                <>
                                    <h3 id="steam-launch-title" className="text-xl font-extrabold text-white break-words">
                                        {t('library.play.confirmTitle', { name: game.name })}
                                    </h3>
                                    <p className="mt-1.5 text-sm text-[#a1a6b3]">{t('library.play.confirmText')}</p>

                                    <label className="mt-4 flex items-center gap-2.5 text-sm text-[#c9ccd4] cursor-pointer select-none">
                                        <input type="checkbox" checked={dontAsk} onChange={e => setDontAsk(e.target.checked)} className="h-4 w-4 accent-[#75b022]" />
                                        {t('library.play.dontAsk')}
                                    </label>

                                    <div className="mt-5 flex flex-col-reverse sm:flex-row gap-2">
                                        <button type="button" onClick={onClose} className="gh-btn gh-btn-secondary !h-11 sm:flex-1">{t('library.play.cancel')}</button>
                                        <button type="button" onClick={play} autoFocus className="gh-btn gh-btn-play !h-11 sm:flex-1">
                                            <BsPlayFill className="w-5 h-5 -ml-1" aria-hidden="true" />
                                            {t('library.play.label')}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center gap-3">
                                        <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#75b022]/15 text-[#8ed629]">
                                            <span className="absolute inset-0 rounded-full border-2 border-[#75b022]/25 border-t-[#8ed629] animate-spin" aria-hidden="true" />
                                            <BsPlayFill className="w-5 h-5" aria-hidden="true" />
                                        </span>
                                        <div className="min-w-0">
                                            <h3 id="steam-launch-title" className="text-lg font-extrabold text-white break-words">
                                                {t('library.play.launching', { name: game.name })}
                                            </h3>
                                            <p className="text-sm text-[#a1a6b3]">{t('library.play.launchingText')}</p>
                                        </div>
                                    </div>

                                    {!hintDone && (
                                        <div className="mt-4 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 text-sm text-[#c9ccd4]">
                                            <p className="flex gap-2">
                                                <BsInfoCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#a1a6b3]" aria-hidden="true" />
                                                <span>{t('library.play.browserHint')}</span>
                                            </p>
                                            <button type="button" onClick={finishHint} className="mt-2.5 ml-6 inline-flex items-center gap-1.5 text-xs font-semibold text-[#8ed629] hover:text-white">
                                                <BsCheck2 className="h-4 w-4" aria-hidden="true" />
                                                {t('library.play.browserHintDone')}
                                            </button>
                                        </div>
                                    )}

                                    <div className="mt-5 flex flex-col-reverse sm:flex-row gap-2">
                                        <button type="button" onClick={onClose} className="gh-btn gh-btn-secondary !h-11 sm:flex-1">{t('library.play.close')}</button>
                                        <button type="button" onClick={() => launchSteam(game.appid)} className="gh-btn gh-btn-secondary !h-11 sm:flex-1">
                                            <BsSteam aria-hidden="true" />
                                            {t('library.play.retry')}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
