/* eslint-disable react/prop-types */
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { BsArrowCounterclockwise, BsCheck2, BsCloudCheck, BsSearch, BsX } from 'react-icons/bs';
import { UserContext } from '../Features/UserContext.jsx';
import { Modal, RequireLogin, Spinner, inputClass } from '../community/ui.jsx';
import { firestore } from '../lib/firebase.js';
import { postActivity } from '../social/activity.js';
import { useT } from '../i18n/index.jsx';
import TierTile, { TierLabel } from './TierTile.jsx';
import ShareImageButton from './ShareImageButton.jsx';
import { TIERS, TIER_COLORS, MAX_RANKED, cleanTiers, readDraft, sameTiers, writeDraft } from './tierUtils.js';

const POOL = 'pool';

/**
 * Personal tier list editor. Desktop: HTML5 drag & drop. Touch: tap an item, then tap a tier row
 * (or a tier in the bottom bar). Works signed out (local draft), saving needs an account.
 */
export default function TierEditor({ docId, items, universe, section, onSaved }) {
    const { t } = useT();
    const { user, profile, authReady } = useContext(UserContext) || {};
    const [tiers, setTiers] = useState(null); // null while loading
    const [saved, setSaved] = useState({});
    const [existed, setExisted] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [dragOver, setDragOver] = useState(null);
    const [poolQuery, setPoolQuery] = useState('');
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState(null); // 'saved' | 'error' | 'limit'
    const [loginOpen, setLoginOpen] = useState(false);
    const draggingRef = useRef(null);

    const uid = user?.uid || null;

    // Load: unsaved local draft wins, then the saved vote doc
    useEffect(() => {
        if (!authReady) return undefined;
        let cancelled = false;
        const draft = readDraft(docId);
        (async () => {
            let remote = {};
            let exists = false;
            if (uid) {
                try {
                    const { db, doc, getDoc } = await firestore();
                    const snap = await getDoc(doc(db, 'tierVotes', docId, 'votes', uid));
                    exists = snap.exists();
                    remote = cleanTiers(snap.data()?.tiers, items);
                } catch (error) {
                    console.error('Could not load your tier list:', error);
                }
            }
            if (cancelled) return;
            setSaved(remote);
            setExisted(exists);
            setTiers(draft ? cleanTiers(draft, items) : remote);
        })();
        return () => { cancelled = true; };
    }, [docId, uid, authReady, items]);

    const dirty = tiers != null && !sameTiers(tiers, saved);

    useEffect(() => {
        if (tiers == null) return;
        writeDraft(docId, dirty ? tiers : null);
    }, [docId, tiers, dirty]);

    const byTier = useMemo(() => {
        const rows = { S: [], A: [], B: [], C: [], D: [], [POOL]: [] };
        for (const item of items) rows[tiers?.[String(item.id)] || POOL].push(item);
        return rows;
    }, [items, tiers]);

    const rankedCount = items.length - byTier[POOL].length;
    const itemById = useMemo(() => new Map(items.map(i => [String(i.id), i])), [items]);
    const selectedItem = selectedId ? itemById.get(selectedId) : null;

    const poolItems = useMemo(() => {
        const q = poolQuery.trim().toLowerCase();
        return q ? byTier[POOL].filter(i => i.name.toLowerCase().includes(q)) : byTier[POOL];
    }, [byTier, poolQuery]);

    function move(id, target) {
        if (!id) return;
        const next = { ...(tiers || {}) };
        if (target === POOL) delete next[id];
        else if (!next[id] && Object.keys(next).length >= MAX_RANKED) {
            setStatus('limit');
            return;
        } else next[id] = target;
        setStatus(null);
        setTiers(next);
        setSelectedId(null);
    }

    function tapTile(id) {
        setSelectedId(current => (current === id ? null : id));
    }

    function tapRow(target) {
        if (selectedId) move(selectedId, target);
    }

    const dropProps = target => ({
        onDragOver: e => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            if (dragOver !== target) setDragOver(target);
        },
        onDragLeave: e => {
            if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(null);
        },
        onDrop: e => {
            e.preventDefault();
            const id = e.dataTransfer.getData('text/plain') || draggingRef.current;
            setDragOver(null);
            if (id && itemById.has(id)) move(id, target);
        },
    });

    const tileProps = id => ({
        draggable: true,
        selected: selectedId === id,
        onClick: e => {
            e.stopPropagation();
            tapTile(id);
        },
        onDragStart: e => {
            draggingRef.current = id;
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', id);
        },
        onDragEnd: () => {
            draggingRef.current = null;
            setDragOver(null);
        },
    });

    async function save() {
        if (!user) {
            setLoginOpen(true);
            return;
        }
        setSaving(true);
        setStatus(null);
        const clean = cleanTiers(tiers, items);
        try {
            const { db, doc, setDoc, serverTimestamp } = await firestore();
            await setDoc(doc(db, 'tierVotes', docId, 'votes', user.uid), { tiers: clean, updatedAt: serverTimestamp() });
            if (!existed && Object.keys(clean).length) {
                postActivity(user, profile, {
                    type: 'tierlist',
                    gameName: universe.name,
                    text: section.title,
                    url: `/tierlist/${encodeURIComponent(universe.id)}?section=${encodeURIComponent(section.id)}`,
                    image: universe.cover || null,
                });
            }
            setExisted(true);
            setSaved(clean);
            setTiers(clean);
            writeDraft(docId, null);
            setStatus('saved');
            onSaved?.(user.uid, clean);
        } catch (error) {
            console.error('Could not save tier list:', error);
            setStatus('error');
        } finally {
            setSaving(false);
        }
    }

    function reset() {
        if (rankedCount && !window.confirm(t('tierlists.resetConfirm'))) return;
        setTiers({});
        setSelectedId(null);
        setStatus(null);
    }

    if (tiers == null) return <Spinner />;

    const rowHighlight = target => (dragOver === target ? 'border-[#8b5cf6] bg-[#8b5cf6]/10' : selectedId ? 'border-white/[0.14] cursor-pointer' : 'border-white/[0.06]');

    return (
        <div className={selectedItem ? 'pb-28' : ''}>
            <div className="flex flex-wrap items-center gap-2 mb-3">
                <button type="button" onClick={save} disabled={saving || (existed ? !dirty : !rankedCount)} className="gh-btn gh-btn-primary !h-9">
                    {saving ? <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <BsCheck2 className="w-4 h-4" />}
                    {t('tierlists.save')}
                </button>
                <button type="button" onClick={reset} disabled={!rankedCount} className="gh-btn gh-btn-secondary !h-9">
                    <BsArrowCounterclockwise className="w-4 h-4" /> {t('tierlists.reset')}
                </button>
                <ShareImageButton
                    disabled={!rankedCount}
                    className="gh-btn gh-btn-secondary !h-9"
                    fileName={`tierlist-${docId}.png`}
                    getData={() => ({
                        title: `${universe.name} · ${section.title}`,
                        subtitle: t('tierlists.myImageTag', { name: profile?.username || t('tierlists.me') }),
                        rows: Object.fromEntries(TIERS.map(tier => [tier, byTier[tier]])),
                    })}
                />
                <span className="text-xs text-[#6b7080] ml-auto" aria-live="polite">
                    {status === 'saved' ? (
                        <span className="text-[#86efac] inline-flex items-center gap-1"><BsCloudCheck /> {t('tierlists.saved')}</span>
                    ) : status === 'error' ? (
                        <span className="text-[#fca5a5]">{t('tierlists.saveError')}</span>
                    ) : status === 'limit' ? (
                        <span className="text-[#fcd34d]">{t('tierlists.limit', { max: MAX_RANKED })}</span>
                    ) : dirty ? (
                        t(user ? 'tierlists.unsaved' : 'tierlists.localDraft')
                    ) : (
                        t('tierlists.rankedCount', { ranked: rankedCount, total: items.length })
                    )}
                </span>
            </div>
            <p className="text-xs text-[#6b7080] mb-3">{t('tierlists.editorHint')}</p>

            <div className="space-y-1.5">
                {TIERS.map(tier => (
                    <div
                        key={tier}
                        {...dropProps(tier)}
                        onClick={() => tapRow(tier)}
                        className={`flex rounded-xl bg-[#111319] border min-h-[64px] sm:min-h-[84px] transition-colors ${rowHighlight(tier)}`}
                    >
                        <TierLabel tier={tier} />
                        <div className="flex flex-wrap gap-1.5 p-1.5 sm:p-2 flex-1 min-w-0 content-start">
                            {byTier[tier].map(item => {
                                const id = String(item.id);
                                return <TierTile key={id} item={item} {...tileProps(id)} />;
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div
                {...dropProps(POOL)}
                onClick={() => tapRow(POOL)}
                className={`mt-5 rounded-xl bg-[#0e1016] border border-dashed p-3 transition-colors ${rowHighlight(POOL)}`}
            >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <p className="text-sm font-semibold text-[#c9ccd4]">{t('tierlists.pool', { count: byTier[POOL].length })}</p>
                    {byTier[POOL].length > 12 && (
                        <label className="relative w-full sm:w-56" onClick={e => e.stopPropagation()}>
                            <BsSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7080] text-sm" />
                            <input value={poolQuery} onChange={e => setPoolQuery(e.target.value)} placeholder={t('tierlists.poolSearch')} aria-label={t('tierlists.poolSearch')} className={`${inputClass} !h-9 !pl-9`} />
                        </label>
                    )}
                </div>
                {byTier[POOL].length === 0 ? (
                    <p className="text-sm text-[#6b7080] py-3 text-center">{t('tierlists.poolEmpty')}</p>
                ) : (
                    <div className="flex flex-wrap gap-1.5">
                        {poolItems.map(item => {
                            const id = String(item.id);
                            return <TierTile key={id} item={item} {...tileProps(id)} />;
                        })}
                    </div>
                )}
            </div>

            {selectedItem && (
                <div className="fixed inset-x-0 bottom-0 z-[150] p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:bottom-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-[440px] sm:p-0">
                    <div className="rounded-2xl bg-[#171a22] border border-white/[0.1] shadow-[0_12px_40px_rgba(0,0,0,0.6)] p-3">
                        <div className="flex items-center justify-between gap-2 mb-2">
                            <p className="text-sm text-[#c9ccd4] truncate">{t('tierlists.moveTo', { name: selectedItem.name })}</p>
                            <button type="button" onClick={() => setSelectedId(null)} aria-label={t('tierlists.close')} className="p-1 rounded-lg text-[#a1a6b3] hover:text-white hover:bg-white/[0.06]">
                                <BsX className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="grid grid-cols-6 gap-1.5">
                            {TIERS.map(tier => (
                                <button
                                    key={tier}
                                    type="button"
                                    onClick={() => move(selectedId, tier)}
                                    className={`h-11 rounded-lg text-lg font-black text-[#0a0b0f] ${tiers[selectedId] === tier ? 'ring-2 ring-white' : ''}`}
                                    style={{ backgroundColor: TIER_COLORS[tier] }}
                                >
                                    {tier}
                                </button>
                            ))}
                            <button type="button" onClick={() => move(selectedId, POOL)} aria-label={t('tierlists.unrank')} title={t('tierlists.unrank')} className="h-11 rounded-lg bg-white/[0.08] text-[#c9ccd4] flex items-center justify-center">
                                <BsX className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Modal open={loginOpen} onClose={() => setLoginOpen(false)} title={t('tierlists.save')}>
                <RequireLogin message={t('tierlists.loginToSave')}>
                    <p className="text-sm text-[#a1a6b3]">{t('tierlists.loggedInNow')}</p>
                </RequireLogin>
            </Modal>
        </div>
    );
}
