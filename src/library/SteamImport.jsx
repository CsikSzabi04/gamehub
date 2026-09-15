/* eslint-disable react/prop-types */
// Bulk Steam library import (modal): profile -> preview with checkboxes -> batch write.
import { useContext, useMemo, useState } from 'react';
import { BsCheckCircleFill, BsExclamationTriangle, BsSteam } from 'react-icons/bs';
import { UserContext } from '../Features/UserContext.jsx';
import { useT } from '../i18n/index.jsx';
import { Field, Modal, Spinner, inputClass } from '../community/ui.jsx';
import { LIBRARY_STATUSES, fetchSteamOwned, saveSteamId, steamImportItem } from './libraryApi.js';

const PAGE = 100;
const PLAYING_THRESHOLD = 2; // hours

const errorCode = error => {
    if (error?.data?.code) return error.data.code;
    if (error?.status === 503) return 'not_configured';
    if (error?.status === 404) return 'not_found';
    if (error?.status === 403) return 'private';
    if (error?.status === 400) return 'invalid_profile';
    return 'upstream';
};

export default function SteamImport({ open, onClose, byKey, importItems }) {
    const { t, locale } = useT();
    const { user, profile, setProfile } = useContext(UserContext) || {};
    const [input, setInput] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const [selected, setSelected] = useState(() => new Set());
    const [mode, setMode] = useState('auto');
    const [filter, setFilter] = useState('');
    const [visible, setVisible] = useState(PAGE);
    const [saving, setSaving] = useState(false);
    const [added, setAdded] = useState(null);

    const nf = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }), [locale]);
    const profileValue = input ?? profile?.steamId ?? '';

    const games = useMemo(() => result?.games || [], [result]);
    const isOwned = game => Boolean(byKey[`steam-${game.appid}`]);
    const newGames = useMemo(() => games.filter(game => !byKey[`steam-${game.appid}`]), [games, byKey]);
    const shown = useMemo(() => {
        const q = filter.trim().toLowerCase();
        return q ? games.filter(game => game.name.toLowerCase().includes(q)) : games;
    }, [games, filter]);
    const selectedNew = newGames.filter(game => selected.has(game.appid));

    const statusFor = game => (mode === 'auto' ? (game.playtimeHours > PLAYING_THRESHOLD ? 'playing' : 'backlog') : mode);

    const reset = () => {
        setResult(null);
        setError(null);
        setAdded(null);
        setFilter('');
        setVisible(PAGE);
    };

    const close = () => {
        if (saving) return;
        reset();
        onClose();
    };

    const lookup = async event => {
        event.preventDefault();
        if (!profileValue.trim() || loading) return;
        setLoading(true);
        reset();
        try {
            const data = await fetchSteamOwned(profileValue);
            setResult(data);
            setSelected(new Set((data.games || []).filter(game => !byKey[`steam-${game.appid}`]).map(game => game.appid)));
            if (user?.uid && data.steamId && data.steamId !== profile?.steamId) {
                saveSteamId(user.uid, data.steamId)
                    .then(() => setProfile?.(current => (current ? { ...current, steamId: data.steamId } : current)))
                    .catch(err => console.error('Could not save Steam ID:', err));
            }
        } catch (err) {
            setError(errorCode(err));
        } finally {
            setLoading(false);
        }
    };

    const toggle = appid => setSelected(current => {
        const next = new Set(current);
        if (next.has(appid)) next.delete(appid);
        else next.add(appid);
        return next;
    });

    const allSelected = newGames.length > 0 && selectedNew.length === newGames.length;
    const toggleAll = () => setSelected(allSelected ? new Set() : new Set(newGames.map(game => game.appid)));

    const runImport = async () => {
        if (!selectedNew.length) return;
        setSaving(true);
        setError(null);
        try {
            const count = await importItems(selectedNew.map(game => steamImportItem(game, statusFor(game))));
            setAdded(count);
        } catch (err) {
            console.error('Steam import failed:', err);
            setError('save');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal open={open} onClose={close} title={t('library.import.title')} subtitle={t('library.import.subtitle')} maxWidth="max-w-2xl">
            {added != null ? (
                <div className="text-center py-6">
                    <BsCheckCircleFill className="mx-auto text-4xl text-[#34d399] mb-3" aria-hidden="true" />
                    <p className="text-white font-semibold">{t('library.import.done', { count: added })}</p>
                    <button type="button" onClick={close} className="gh-btn gh-btn-primary mt-5">{t('library.import.finish')}</button>
                </div>
            ) : (
                <div className="space-y-4">
                    <form onSubmit={lookup} className="space-y-3">
                        <Field label={t('library.import.profileLabel')} hint={t('library.import.profileHint')}>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    value={profileValue}
                                    onChange={e => setInput(e.target.value.slice(0, 200))}
                                    placeholder="https://steamcommunity.com/id/…"
                                    className={inputClass}
                                    inputMode="url"
                                    autoComplete="off"
                                    spellCheck="false"
                                />
                                <button type="submit" disabled={loading || !profileValue.trim()} className="gh-btn gh-btn-primary shrink-0">
                                    <BsSteam aria-hidden="true" />
                                    {t('library.import.load')}
                                </button>
                            </div>
                        </Field>
                    </form>

                    {loading && <Spinner className="py-8" />}

                    {error && (
                        <div className="rounded-xl border border-[#fbbf24]/25 bg-[#fbbf24]/[0.07] p-4 text-sm">
                            <p className="flex items-start gap-2 font-semibold text-[#fcd34d]">
                                <BsExclamationTriangle className="mt-0.5 shrink-0" aria-hidden="true" />
                                {t(`library.import.errors.${error}`)}
                            </p>
                            {error === 'private' && (
                                <ol className="mt-3 ml-6 list-decimal space-y-1 text-[#c9ccd4]">
                                    <li>{t('library.import.privacy.step1')}</li>
                                    <li>{t('library.import.privacy.step2')}</li>
                                    <li>{t('library.import.privacy.step3')}</li>
                                    <li>{t('library.import.privacy.step4')}</li>
                                </ol>
                            )}
                        </div>
                    )}

                    {result && !loading && (
                        games.length === 0 ? (
                            <p className="text-sm text-[#a1a6b3]">{t('library.import.noGames')}</p>
                        ) : (
                            <>
                                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                                    <p className="text-[#c9ccd4]">
                                        {t('library.import.found', { count: games.length, fresh: newGames.length })}
                                    </p>
                                    {newGames.length > 0 && (
                                        <button type="button" onClick={toggleAll} className="text-[#c4b5fd] hover:text-white font-medium">
                                            {allSelected ? t('library.import.selectNone') : t('library.import.selectAll')}
                                        </button>
                                    )}
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <Field label={t('library.import.statusLabel')}>
                                        <select value={mode} onChange={e => setMode(e.target.value)} className={inputClass}>
                                            <option value="auto">{t('library.import.auto', { hours: PLAYING_THRESHOLD })}</option>
                                            {LIBRARY_STATUSES.map(status => (
                                                <option key={status} value={status}>{t(`library.status.${status}`)}</option>
                                            ))}
                                        </select>
                                    </Field>
                                    {games.length > 12 && (
                                        <Field label={t('library.import.filterLabel')}>
                                            <input value={filter} onChange={e => { setFilter(e.target.value.slice(0, 80)); setVisible(PAGE); }} placeholder={t('library.searchPlaceholder')} className={inputClass} />
                                        </Field>
                                    )}
                                </div>

                                <ul className="divide-y divide-white/[0.05] rounded-xl border border-white/[0.06] bg-[#0a0b0f]">
                                    {shown.slice(0, visible).map(game => {
                                        const owned = isOwned(game);
                                        const checked = !owned && selected.has(game.appid);
                                        return (
                                            <li key={game.appid}>
                                                <label className={`flex items-center gap-3 px-3 py-2 min-w-0 ${owned ? 'opacity-50' : 'cursor-pointer hover:bg-white/[0.03]'}`}>
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        disabled={owned}
                                                        onChange={() => toggle(game.appid)}
                                                        className="h-4 w-4 shrink-0 accent-[#8b5cf6]"
                                                    />
                                                    <img src={game.image} alt="" loading="lazy" className="h-9 w-[76px] shrink-0 rounded object-cover bg-white/[0.04]" onError={e => { e.currentTarget.style.visibility = 'hidden'; }} />
                                                    <span className="flex-1 min-w-0">
                                                        <span className="block truncate text-sm text-white">{game.name}</span>
                                                        <span className="block text-xs text-[#6b7080]">
                                                            {owned
                                                                ? t('library.import.inLibrary')
                                                                : `${t('library.hoursShort', { hours: nf.format(game.playtimeHours) })} · ${t(`library.status.${statusFor(game)}`)}`}
                                                        </span>
                                                    </span>
                                                </label>
                                            </li>
                                        );
                                    })}
                                </ul>
                                {shown.length > visible && (
                                    <button type="button" onClick={() => setVisible(v => v + PAGE)} className="gh-btn gh-btn-secondary w-full">
                                        {t('library.showMore', { count: shown.length - visible })}
                                    </button>
                                )}

                                <div className="sticky bottom-0 -mx-4 sm:-mx-6 px-4 sm:px-6 pt-3 pb-1 bg-[#111319] border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                    <p className="text-sm text-[#a1a6b3]">{t('library.import.selected', { count: selectedNew.length })}</p>
                                    <button type="button" onClick={runImport} disabled={saving || !selectedNew.length} className="gh-btn gh-btn-primary">
                                        {saving ? t('library.import.saving') : t('library.import.importButton', { count: selectedNew.length })}
                                    </button>
                                </div>
                            </>
                        )
                    )}
                </div>
            )}
        </Modal>
    );
}
