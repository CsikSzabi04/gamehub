/* eslint-disable react/prop-types */
import { useContext, useEffect, useMemo, useState } from 'react';
import { BsCheck2, BsSearch, BsXLg } from 'react-icons/bs';
import { UserContext } from '../Features/UserContext.jsx';
import { Field, RequireLogin, Spinner, inputClass } from '../community/ui.jsx';
import { API_BASE, useApi } from '../Components/apiCache.js';
import { postActivity } from '../social/activity.js';
import { useT } from '../i18n/index.jsx';
import { DBD_PERKS } from './dbdPerks.js';
import PerkDiamond from './PerkDiamond.jsx';
import { BUILD_TAGS, DAILY_LIMIT, DESCRIPTION_MAX, MAX_TAGS, ROLES, TITLE_MAX, countRecentBuilds, createBuild } from './buildsApi.js';

const toCharacters = data => (Array.isArray(data) ? data.map(c => ({ name: c.name, perks: Array.isArray(c.perks) ? c.perks : [] })).filter(c => c.name) : []);

function CreatorForm({ onCreated }) {
    const { t } = useT();
    const { user, profile } = useContext(UserContext) || {};
    const [role, setRole] = useState('survivor');
    const [character, setCharacter] = useState('');
    const [perks, setPerks] = useState([]);
    const [perkQuery, setPerkQuery] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState([]);
    const [recent, setRecent] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const { data: characters } = useApi(`${API_BASE}/${role === 'killer' ? 'charactersK' : 'characters'}`, toCharacters);

    useEffect(() => {
        let cancelled = false;
        countRecentBuilds(user.uid)
            .then(count => { if (!cancelled) setRecent(count); })
            .catch(() => { if (!cancelled) setRecent(0); });
        return () => { cancelled = true; };
    }, [user.uid]);

    const ownPerks = useMemo(() => new Set(characters?.find(c => c.name === character)?.perks || []), [characters, character]);

    const perkList = useMemo(() => {
        const q = perkQuery.trim().toLowerCase();
        const list = DBD_PERKS[role].filter(p => !q || p.name.toLowerCase().includes(q) || p.owner.toLowerCase().includes(q));
        return ownPerks.size ? [...list].sort((a, b) => Number(ownPerks.has(b.name)) - Number(ownPerks.has(a.name))) : list;
    }, [role, perkQuery, ownPerks]);

    function switchRole(next) {
        if (next === role) return;
        setRole(next);
        setCharacter('');
        setPerks([]);
        setPerkQuery('');
    }

    function togglePerk(perk) {
        setError(null);
        setPerks(prev => {
            if (prev.some(p => p.name === perk.name)) return prev.filter(p => p.name !== perk.name);
            return prev.length >= 4 ? prev : [...prev, perk];
        });
    }

    function toggleTag(tag) {
        setTags(prev => (prev.includes(tag) ? prev.filter(x => x !== tag) : prev.length >= MAX_TAGS ? prev : [...prev, tag]));
    }

    const used = recent ?? 0;
    const limitReached = recent != null && used >= DAILY_LIMIT;

    async function submit(e) {
        e.preventDefault();
        setError(null);
        const cleanTitle = title.trim();
        if (perks.length !== 4 || new Set(perks.map(p => p.name)).size !== 4) return setError(t('builds.errors.perks'));
        if (cleanTitle.length < 3) return setError(t('builds.errors.title'));
        if (limitReached) return setError(t('builds.errors.limit', { max: DAILY_LIMIT }));
        const valid = new Set(DBD_PERKS[role].map(p => p.name));
        if (!perks.every(p => valid.has(p.name))) return setError(t('builds.errors.perks'));

        setSubmitting(true);
        try {
            const build = await createBuild(user, profile, { role, character, perks, title: cleanTitle, description, tags });
            setRecent(count => (count || 0) + 1);
            postActivity(user, profile, {
                type: 'build',
                gameKey: 'steam-381210',
                gameName: 'Dead by Daylight',
                text: build.title,
                url: `/builds?id=${build.id}`,
                image: build.perks[0]?.image || null,
            });
            onCreated(build);
        } catch (err) {
            console.error('Could not create build:', err);
            setError(t('builds.errors.save'));
        } finally {
            setSubmitting(false);
        }
    }

    if (recent == null) return <Spinner />;

    return (
        <form onSubmit={submit} className="space-y-5">
            {limitReached && <p className="rounded-lg bg-[#f59e0b]/10 border border-[#f59e0b]/30 text-[#fcd34d] text-sm p-3">{t('builds.errors.limit', { max: DAILY_LIMIT })}</p>}

            <div>
                <p className="block text-xs font-semibold uppercase tracking-wide text-[#8a8f9c] mb-1.5">{t('builds.form.role')}</p>
                <div className="grid grid-cols-2 gap-2">
                    {ROLES.map(r => (
                        <button key={r} type="button" onClick={() => switchRole(r)} className={`h-10 rounded-lg text-sm font-semibold border transition-colors ${role === r ? (r === 'killer' ? 'bg-[#7f1d1d] border-[#f87171]/60 text-white' : 'bg-[#4c1d95] border-[#a78bfa]/60 text-white') : 'bg-white/[0.04] border-white/[0.08] text-[#c9ccd4]'}`}>
                            {t(`builds.role.${r}`)}
                        </button>
                    ))}
                </div>
            </div>

            <Field label={t('builds.form.character')} hint={t('builds.form.characterHint')}>
                <select value={character} onChange={e => setCharacter(e.target.value)} className={inputClass}>
                    <option value="">{t('builds.form.anyCharacter')}</option>
                    {(characters || []).map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
            </Field>

            <div>
                <p className="block text-xs font-semibold uppercase tracking-wide text-[#8a8f9c] mb-2">{t('builds.form.perks', { count: perks.length })}</p>
                <div className="flex justify-between sm:justify-start sm:gap-3 mb-3">
                    {[0, 1, 2, 3].map(i => {
                        const perk = perks[i];
                        return (
                            <button key={perk?.name || `slot-${i}`} type="button" disabled={!perk} onClick={() => perk && togglePerk(perk)} aria-label={perk ? t('builds.form.removePerk', { name: perk.name }) : t('builds.form.emptySlot')} className="flex flex-col items-center gap-1 w-[68px]">
                                <PerkDiamond perk={perk} role={role} size={60} empty={!perk} />
                                <span className="text-[10px] leading-tight text-center text-[#a1a6b3] line-clamp-2 min-h-[2.2em]">{perk?.name || ''}</span>
                            </button>
                        );
                    })}
                </div>
                <label className="relative block mb-2">
                    <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7080] text-sm" />
                    <input value={perkQuery} onChange={e => setPerkQuery(e.target.value)} placeholder={t('builds.form.perkSearch')} aria-label={t('builds.form.perkSearch')} className={`${inputClass} !pl-9`} />
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-h-[320px] overflow-y-auto overscroll-contain custom-scrollbar pr-1" data-lenis-prevent>
                    {perkList.map(perk => {
                        const picked = perks.some(p => p.name === perk.name);
                        const full = perks.length >= 4 && !picked;
                        return (
                            <button
                                key={perk.name}
                                type="button"
                                onClick={() => togglePerk(perk)}
                                disabled={full}
                                aria-pressed={picked}
                                title={perk.owner ? `${perk.name} · ${perk.owner}` : perk.name}
                                className={`relative flex flex-col items-center gap-1 rounded-lg p-1.5 border transition-colors touch-manipulation ${picked ? 'bg-[#8b5cf6]/15 border-[#8b5cf6]/60' : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.06]'} ${full ? 'opacity-40' : ''}`}
                            >
                                {picked && <BsCheck2 className="absolute top-1 right-1 w-4 h-4 text-[#c4b5fd]" />}
                                {ownPerks.has(perk.name) && <span className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-[#facc15]" aria-hidden="true" />}
                                <PerkDiamond perk={perk} role={role} size={48} />
                                <span className="text-[10px] leading-tight text-center text-[#c9ccd4] line-clamp-2">{perk.name}</span>
                            </button>
                        );
                    })}
                    {perkList.length === 0 && <p className="col-span-full text-sm text-[#6b7080] text-center py-4">{t('builds.form.noPerks')}</p>}
                </div>
            </div>

            <Field label={t('builds.form.title')} hint={`${title.length}/${TITLE_MAX}`}>
                <input value={title} onChange={e => setTitle(e.target.value.slice(0, TITLE_MAX))} maxLength={TITLE_MAX} placeholder={t('builds.form.titlePlaceholder')} className={inputClass} required />
            </Field>

            <Field label={t('builds.form.description')} hint={`${description.length}/${DESCRIPTION_MAX}`}>
                <textarea value={description} onChange={e => setDescription(e.target.value.slice(0, DESCRIPTION_MAX))} maxLength={DESCRIPTION_MAX} rows={4} placeholder={t('builds.form.descriptionPlaceholder')} className={`${inputClass} !h-auto py-2 resize-y`} />
            </Field>

            <div>
                <p className="block text-xs font-semibold uppercase tracking-wide text-[#8a8f9c] mb-2">{t('builds.form.tags', { count: tags.length, max: MAX_TAGS })}</p>
                <div className="flex flex-wrap gap-1.5">
                    {BUILD_TAGS.map(tag => {
                        const on = tags.includes(tag);
                        return (
                            <button key={tag} type="button" onClick={() => toggleTag(tag)} aria-pressed={on} disabled={!on && tags.length >= MAX_TAGS} className={`h-8 px-3 rounded-full text-xs font-medium border transition-colors ${on ? 'bg-white text-[#0a0b0f] border-transparent' : 'bg-white/[0.04] text-[#c9ccd4] border-white/[0.08] disabled:opacity-40'}`}>
                                #{t(`builds.tags.${tag}`)}
                            </button>
                        );
                    })}
                </div>
            </div>

            {error && <p className="text-sm text-[#fca5a5] flex items-center gap-2"><BsXLg className="shrink-0" /> {error}</p>}

            <button type="submit" disabled={submitting || limitReached} className="gh-btn gh-btn-primary w-full">
                {submitting ? <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <BsCheck2 className="w-4 h-4" />}
                {t('builds.form.publish')}
            </button>
            <p className="text-xs text-[#6b7080] text-center">{t('builds.form.limitInfo', { used, max: DAILY_LIMIT })}</p>
        </form>
    );
}

/** Build creator body (render inside a Modal). */
export default function BuildCreator({ onCreated }) {
    const { t } = useT();
    return (
        <RequireLogin message={t('builds.loginToCreate')}>
            <CreatorForm onCreated={onCreated} />
        </RequireLogin>
    );
}
