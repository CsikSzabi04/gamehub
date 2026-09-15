/* eslint-disable react/prop-types */
// Xbox / PlayStation library import (modal): credential -> preview with checkboxes -> batch write.
// The credential is sent once to the backend and never stored.
import { useMemo, useState } from 'react';
import { BsBoxArrowUpRight, BsCheckCircleFill, BsExclamationTriangle, BsPlaystation, BsXbox } from 'react-icons/bs';
import { useT } from '../i18n/index.jsx';
import { Field, Modal, Spinner, inputClass } from '../community/ui.jsx';
import { apiPost } from '../lib/api.js';
import { LIBRARY_STATUSES } from './libraryApi.js';

const PAGE = 100;

export const PLATFORM_IMPORTS = {
    xbox: {
        icon: BsXbox,
        endpoint: '/xbox/titles',
        field: 'apiKey',
        helpUrl: 'https://xbl.io/',
        keyPrefix: 'xbox',
    },
    psn: {
        icon: BsPlaystation,
        endpoint: '/psn/titles',
        field: 'npsso',
        helpUrl: 'https://ca.account.sony.com/api/v1/ssocookie',
        keyPrefix: 'psn',
    },
};

const errorCode = error => error?.data?.code || (error?.status === 401 ? 'invalid_credentials' : error?.status === 400 ? 'invalid_input' : error?.status === 404 ? 'not_deployed' : 'upstream');

export default function PlatformImport({ platform, open, onClose, byKey, importItems }) {
    const { t, locale } = useT();
    const config = PLATFORM_IMPORTS[platform];
    const [credential, setCredential] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [games, setGames] = useState(null);
    const [selected, setSelected] = useState(() => new Set());
    const [status, setStatus] = useState('backlog');
    const [filter, setFilter] = useState('');
    const [saving, setSaving] = useState(false);
    const [added, setAdded] = useState(null);

    const nf = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }), [locale]);
    const keyOf = game => `${config.keyPrefix}-${game.id}`;
    const newGames = useMemo(() => (games || []).filter(g => !byKey[`${config.keyPrefix}-${g.id}`]), [games, byKey, config.keyPrefix]);
    const shown = useMemo(() => {
        const q = filter.trim().toLowerCase();
        return (games || []).filter(g => !q || g.name.toLowerCase().includes(q)).slice(0, PAGE);
    }, [games, filter]);
    const selectedNew = newGames.filter(g => selected.has(g.id));
    const Icon = config.icon;

    const close = () => {
        if (saving) return;
        setCredential('');
        setGames(null);
        setError(null);
        setAdded(null);
        setFilter('');
        onClose();
    };

    const load = async event => {
        event.preventDefault();
        if (!credential.trim() || loading) return;
        setLoading(true);
        setError(null);
        setGames(null);
        try {
            const data = await apiPost(config.endpoint, { [config.field]: credential.trim() });
            const list = Array.isArray(data?.games) ? data.games : [];
            setGames(list);
            setSelected(new Set(list.filter(g => !byKey[`${config.keyPrefix}-${g.id}`]).map(g => g.id)));
            setCredential('');
        } catch (err) {
            setError(errorCode(err));
        } finally {
            setLoading(false);
        }
    };

    const toggle = id => setSelected(current => {
        const next = new Set(current);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
    });

    const runImport = async () => {
        if (!selectedNew.length) return;
        setSaving(true);
        try {
            const count = await importItems(selectedNew.map(game => ({
                gameKey: keyOf(game),
                name: game.name,
                image: game.image,
                source: config.keyPrefix,
                sourceId: game.id,
                platform: game.platform,
                status: status === 'auto' ? (game.playtimeHours > 2 ? 'playing' : 'backlog') : status,
                steamPlaytimeHours: game.playtimeHours,
                lastPlayed: game.lastPlayed,
            })));
            setAdded(count);
        } catch (err) {
            console.error(`${platform} import failed:`, err);
            setError('save');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal open={open} onClose={close} title={t(`profileExtras.import.${platform}.title`)} subtitle={t(`profileExtras.import.${platform}.subtitle`)} maxWidth="max-w-2xl">
            {added != null ? (
                <div className="text-center py-6">
                    <BsCheckCircleFill className="mx-auto text-4xl text-[#34d399] mb-3" aria-hidden="true" />
                    <p className="text-white font-semibold">{t('profileExtras.import.done', { count: added })}</p>
                    <button type="button" onClick={close} className="gh-btn gh-btn-primary mt-5">{t('profileExtras.import.finish')}</button>
                </div>
            ) : (
                <div className="space-y-4">
                    {!games && (
                        <>
                            <ol className="ml-5 list-decimal space-y-1.5 text-sm text-[#c9ccd4]">
                                <li>
                                    {t(`profileExtras.import.${platform}.step1`)}{' '}
                                    <a href={config.helpUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[#c4b5fd] hover:text-white">
                                        {t('profileExtras.import.openLink')} <BsBoxArrowUpRight className="h-3 w-3" />
                                    </a>
                                </li>
                                <li>{t(`profileExtras.import.${platform}.step2`)}</li>
                                <li>{t(`profileExtras.import.${platform}.step3`)}</li>
                            </ol>
                            <form onSubmit={load}>
                                <Field label={t(`profileExtras.import.${platform}.label`)} hint={t('profileExtras.import.privacyHint')}>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <input
                                            type="password"
                                            value={credential}
                                            onChange={e => setCredential(e.target.value.slice(0, 300))}
                                            className={inputClass}
                                            autoComplete="off"
                                            spellCheck="false"
                                        />
                                        <button type="submit" disabled={loading || !credential.trim()} className="gh-btn gh-btn-primary shrink-0">
                                            <Icon aria-hidden="true" /> {t('profileExtras.import.load')}
                                        </button>
                                    </div>
                                </Field>
                            </form>
                        </>
                    )}

                    {loading && <Spinner className="py-8" />}

                    {error && (
                        <p className="flex items-start gap-2 rounded-xl border border-[#fbbf24]/25 bg-[#fbbf24]/[0.07] p-4 text-sm font-semibold text-[#fcd34d]">
                            <BsExclamationTriangle className="mt-0.5 shrink-0" aria-hidden="true" />
                            {t(`profileExtras.import.errors.${error}`)}
                        </p>
                    )}

                    {games && !loading && (games.length === 0 ? (
                        <p className="text-sm text-[#a1a6b3]">{t('profileExtras.import.noGames')}</p>
                    ) : (
                        <>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <Field label={t('profileExtras.import.statusLabel')}>
                                    <select value={status} onChange={e => setStatus(e.target.value)} className={inputClass}>
                                        {platform === 'psn' && <option value="auto">{t('profileExtras.import.auto')}</option>}
                                        {LIBRARY_STATUSES.map(s => <option key={s} value={s}>{t(`library.status.${s}`)}</option>)}
                                    </select>
                                </Field>
                                <Field label={t('profileExtras.import.filter')}>
                                    <input value={filter} onChange={e => setFilter(e.target.value.slice(0, 80))} className={inputClass} />
                                </Field>
                            </div>
                            <p className="text-sm text-[#c9ccd4]">{t('profileExtras.import.found', { count: games.length, fresh: newGames.length })}</p>
                            <ul className="max-h-[45vh] overflow-y-auto divide-y divide-white/[0.05] rounded-xl border border-white/[0.06] bg-[#0a0b0f]" data-lenis-prevent>
                                {shown.map(game => {
                                    const owned = Boolean(byKey[keyOf(game)]);
                                    return (
                                        <li key={game.id}>
                                            <label className={`flex items-center gap-3 px-3 py-2 min-w-0 ${owned ? 'opacity-50' : 'cursor-pointer hover:bg-white/[0.03]'}`}>
                                                <input type="checkbox" disabled={owned} checked={!owned && selected.has(game.id)} onChange={() => toggle(game.id)} className="accent-[#8b5cf6]" />
                                                {game.image ? <img src={game.image} alt="" loading="lazy" className="h-9 w-9 rounded object-cover shrink-0" /> : <span className="h-9 w-9 rounded bg-white/[0.06] shrink-0" />}
                                                <span className="min-w-0 flex-1">
                                                    <span className="block truncate text-sm text-white">{game.name}</span>
                                                    <span className="block text-xs text-[#6b7080]">
                                                        {game.platform?.toUpperCase()}
                                                        {game.playtimeHours ? ` · ${nf.format(game.playtimeHours)} h` : ''}
                                                        {owned ? ` · ${t('profileExtras.import.inLibrary')}` : ''}
                                                    </span>
                                                </span>
                                            </label>
                                        </li>
                                    );
                                })}
                            </ul>
                            <button type="button" onClick={runImport} disabled={saving || !selectedNew.length} className="gh-btn gh-btn-primary w-full !h-11">
                                {saving ? t('profileExtras.import.saving') : t('profileExtras.import.importSelected', { count: selectedNew.length })}
                            </button>
                        </>
                    ))}
                </div>
            )}
        </Modal>
    );
}
