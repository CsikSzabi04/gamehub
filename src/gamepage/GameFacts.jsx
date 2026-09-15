// "What to expect": Steam facts (online, purchases, anti-cheat, DRM, ratings, accessibility)
// plus community votes stored in gameFacts/{gameKey}/votes/{uid}.
import { useContext, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    BsBox2, BsCart3, BsController, BsLock, BsPeople, BsPersonBadge, BsShieldLock, BsUniversalAccessCircle,
    BsWifi, BsWifiOff,
} from 'react-icons/bs';
import { API_BASE, useApi } from '../Components/apiCache.js';
import { UserContext } from '../Features/UserContext.jsx';
import { useT } from '../i18n/index.jsx';
import { firestore } from '../lib/firebase.js';

const VOTE_QUESTIONS = ['payToWin', 'lootBoxes', 'alwaysOnline', 'grindy', 'goodPerformance', 'beginnerFriendly'];
const MAX_VOTES_READ = 500;

function FactRow({ icon: Icon, tone = 'text-[#a1a6b3]', children, sub }) {
    return (
        <li className="flex gap-3 py-2">
            <Icon className={`mt-0.5 w-4 h-4 shrink-0 ${tone}`} aria-hidden="true" />
            <div className="min-w-0 text-sm text-[#d4d7de] break-words">
                {children}
                {sub && <p className="text-xs text-[#8a8f9c] mt-0.5">{sub}</p>}
            </div>
        </li>
    );
}

function Chips({ title, items }) {
    if (!items.length) return null;
    return (
        <div>
            <p className="gh-eyebrow mb-2">{title}</p>
            <ul className="flex flex-wrap gap-1.5">
                {items.map(item => <li key={item} className="gh-chip text-xs">{item}</li>)}
            </ul>
        </div>
    );
}

function useVotes(key) {
    const [votes, setVotes] = useState(null);
    useEffect(() => {
        if (!key) return undefined;
        let active = true;
        (async () => {
            const { db, collection, getDocs, query, limit } = await firestore();
            const snap = await getDocs(query(collection(db, 'gameFacts', key, 'votes'), limit(MAX_VOTES_READ)));
            if (active) setVotes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        })().catch(err => {
            console.error('Loading game fact votes failed:', err);
            if (active) setVotes([]);
        });
        return () => { active = false; };
    }, [key]);
    return [votes, setVotes];
}

function VoteButton({ active, onClick, disabled, children, tone }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-pressed={active}
            className={`h-8 min-w-[3.25rem] px-2.5 rounded-lg border text-xs font-semibold transition-colors disabled:opacity-60 ${
                active ? tone : 'border-white/[0.1] bg-white/[0.03] text-[#a1a6b3] hover:text-white hover:bg-white/[0.06]'
            }`}
        >
            {children}
        </button>
    );
}

function CommunityVotes({ gameKeyValue, votes, setVotes }) {
    const { t } = useT();
    const { user } = useContext(UserContext) || {};
    const [error, setError] = useState(null);
    const [busy, setBusy] = useState(false);

    const mine = votes?.find(v => v.id === user?.uid) || null;
    const stats = useMemo(() => Object.fromEntries(VOTE_QUESTIONS.map(q => {
        const yes = (votes || []).filter(v => v[q] === true).length;
        const no = (votes || []).filter(v => v[q] === false).length;
        return [q, { yes, no, total: yes + no }];
    })), [votes]);

    if (!votes) return null;

    const vote = async (question, value) => {
        if (!user || busy) return;
        const next = mine?.[question] === value ? null : value;
        const previous = votes;
        const updated = mine
            ? votes.map(v => (v.id === user.uid ? { ...v, [question]: next } : v))
            : [...votes, { id: user.uid, uid: user.uid, [question]: next }];
        setVotes(updated);
        setError(null);
        setBusy(true);
        try {
            const { db, doc, setDoc, serverTimestamp } = await firestore();
            await setDoc(
                doc(db, 'gameFacts', gameKeyValue, 'votes', user.uid),
                { uid: user.uid, [question]: next, updatedAt: serverTimestamp() },
                { merge: true },
            );
        } catch (err) {
            console.error('Saving vote failed:', err);
            setVotes(previous);
            setError(t('gameInfo.votes.voteError'));
        } finally {
            setBusy(false);
        }
    };

    return (
        <div>
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                <p className="gh-eyebrow">{t('gameInfo.votes.title')}</p>
                {!user && <Link to="/login" className="text-xs font-semibold text-[#c4b5fd] hover:text-white">{t('gameInfo.votes.loginToVote')}</Link>}
            </div>
            <ul className="divide-y divide-white/[0.06]">
                {VOTE_QUESTIONS.map(q => {
                    const { yes, total } = stats[q];
                    const percent = total ? Math.round((yes / total) * 100) : 0;
                    return (
                        <li key={q} className="py-2.5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <div className="min-w-0 flex-1">
                                <div className="flex items-baseline justify-between gap-3">
                                    <span className="text-sm text-white">{t(`gameInfo.votes.questions.${q}`)}</span>
                                    <span className="text-xs text-[#8a8f9c] shrink-0">
                                        {total ? `${t('gameInfo.votes.percentYes', { percent })} · ${t('gameInfo.votes.votes', { count: total })}` : t('gameInfo.votes.noVotes')}
                                    </span>
                                </div>
                                <div className="mt-1.5 h-1.5 rounded-full bg-white/[0.06] overflow-hidden" aria-hidden="true">
                                    {total > 0 && <div className="h-full rounded-full bg-[#8b5cf6]" style={{ width: `${percent}%` }} />}
                                </div>
                            </div>
                            {user && (
                                <div className="flex gap-1.5 shrink-0">
                                    <VoteButton active={mine?.[q] === true} disabled={busy} onClick={() => vote(q, true)} tone="border-[#8b5cf6]/60 bg-[#8b5cf6]/20 text-white">
                                        {t('gameInfo.votes.yes')}
                                    </VoteButton>
                                    <VoteButton active={mine?.[q] === false} disabled={busy} onClick={() => vote(q, false)} tone="border-white/30 bg-white/[0.1] text-white">
                                        {t('gameInfo.votes.no')}
                                    </VoteButton>
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>
            {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
        </div>
    );
}

function AgeRating({ facts }) {
    const { t, lang } = useT();
    const ratings = facts.ratings || {};
    const order = lang === 'de' ? ['usk', 'pegi', 'esrb'] : ['pegi', 'esrb', 'usk'];
    const boards = order.filter(b => ratings[b]?.rating).slice(0, 2);
    const primary = boards[0] ? ratings[boards[0]] : null;
    const descriptors = (facts.contentDescriptors || []).map(d => {
        const key = `gameInfo.facts.content.${d.key}`;
        const text = t(key);
        return text === key ? d.label : text;
    });
    if (!boards.length && !facts.requiredAge && !descriptors.length) return null;

    return (
        <li className="flex gap-3 py-2">
            <span className="mt-0.5 w-4 h-4 shrink-0 grid place-items-center text-[9px] font-extrabold text-[#a1a6b3] border border-current rounded-[3px]" aria-hidden="true">
                {primary?.age || facts.requiredAge || '!'}
            </span>
            <div className="min-w-0 text-sm text-[#d4d7de]">
                <div className="flex flex-wrap items-center gap-1.5">
                    <span>{t('gameInfo.facts.ageRating')}:</span>
                    {boards.map(b => (
                        <span key={b} className="inline-flex items-center h-6 px-2 rounded-md bg-white/[0.06] border border-white/[0.08] text-xs font-bold text-white">
                            {b.toUpperCase()} {ratings[b].rating}
                        </span>
                    ))}
                    {!boards.length && facts.requiredAge > 0 && (
                        <span className="text-white font-semibold">{t('gameInfo.facts.minAge', { age: facts.requiredAge })}</span>
                    )}
                </div>
                {primary?.descriptors?.length > 0 && (
                    <p className="text-xs text-[#8a8f9c] mt-1">{primary.descriptors.join(' · ')}</p>
                )}
                {descriptors.length > 0 && <p className="text-xs text-[#8a8f9c] mt-0.5">{descriptors.join(' · ')}</p>}
            </div>
        </li>
    );
}

export default function GameFacts({ game }) {
    const { t } = useT();
    const { user } = useContext(UserContext) || {};
    const appid = game?.steamAppId;
    const { data: facts } = useApi(appid ? `${API_BASE}/hub/steam/facts/${appid}` : null);
    const [votes, setVotes] = useVotes(game?.gameKey);

    const translated = (prefix, list) => (list || []).map(item => {
        const key = `${prefix}.${item.key}`;
        const text = t(key);
        return text === key ? item.label : text;
    });

    const rows = [];
    if (facts && !facts.error) {
        if (facts.onlineReason) {
            rows.push(
                <FactRow key="online" icon={facts.onlineRequired ? BsWifi : BsWifiOff} tone={facts.onlineRequired ? 'text-amber-400' : 'text-emerald-400'}>
                    {t(`gameInfo.facts.online.${facts.onlineReason}`)}
                </FactRow>,
            );
        }
        if (facts.inAppPurchases) {
            rows.push(
                <FactRow key="iap" icon={BsCart3} tone="text-amber-400" sub={facts.randomItems ? t('gameInfo.facts.randomItems') : null}>
                    {t('gameInfo.facts.inAppPurchases')}
                </FactRow>,
            );
        } else if (facts.randomItems) {
            rows.push(<FactRow key="random" icon={BsBox2} tone="text-amber-400">{t('gameInfo.facts.randomItems')}</FactRow>);
        }
        if (facts.antiCheat) {
            const named = !/type not disclosed/i.test(facts.antiCheat);
            rows.push(
                <FactRow key="ac" icon={BsShieldLock} sub={facts.antiCheatDeckIssue ? t('gameInfo.facts.antiCheatDeck') : null}>
                    {named ? t('gameInfo.facts.antiCheat', { name: facts.antiCheat }) : t('gameInfo.facts.antiCheatUnknown')}
                </FactRow>,
            );
        }
        if (facts.accountNotice) {
            rows.push(<FactRow key="account" icon={BsPersonBadge} tone="text-amber-400">{t('gameInfo.facts.account', { name: facts.accountNotice })}</FactRow>);
        }
        if (facts.drmNotice) {
            rows.push(<FactRow key="drm" icon={BsLock}>{t('gameInfo.facts.drm', { name: facts.drmNotice })}</FactRow>);
        }
        if (facts.controller) {
            rows.push(<FactRow key="controller" icon={BsController}>{t(`gameInfo.facts.controller.${facts.controller}`)}</FactRow>);
        }
        if (facts.familySharing) {
            rows.push(<FactRow key="family" icon={BsPeople}>{t('gameInfo.facts.familySharing')}</FactRow>);
        }
    }

    const hasFacts = Boolean(facts && !facts.error);
    const accessibility = hasFacts ? translated('gameInfo.facts.accessibility', facts.accessibility) : [];
    const modes = hasFacts ? translated('gameInfo.facts.modes', facts.multiplayer) : [];
    const ageRow = hasFacts ? <AgeRating facts={facts} /> : null;
    const hasAge = hasFacts && (Object.keys(facts.ratings || {}).length > 0 || facts.requiredAge > 0 || facts.contentDescriptors?.length > 0);
    const factsVisible = rows.length > 0 || hasAge || accessibility.length > 0 || modes.length > 0;
    const votesVisible = Array.isArray(votes) && (votes.length > 0 || Boolean(user));

    if (!game?.gameKey || (!factsVisible && !votesVisible)) return null;

    return (
        <section>
            <h3 className="gh-section-title mb-3">{t('gameInfo.facts.title')}</h3>
            <div className="gh-surface p-4 sm:p-5 space-y-5">
                {factsVisible && (
                    <>
                        {(rows.length > 0 || hasAge) && (
                            <ul className="-my-2 divide-y divide-white/[0.04]">
                                {rows}
                                {ageRow}
                            </ul>
                        )}
                        <Chips title={t('gameInfo.facts.modesTitle')} items={modes} />
                        {accessibility.length > 0 && (
                            <div>
                                <p className="gh-eyebrow mb-2 flex items-center gap-1.5">
                                    <BsUniversalAccessCircle className="w-3.5 h-3.5" aria-hidden="true" />
                                    {t('gameInfo.facts.accessibilityTitle')}
                                </p>
                                <ul className="flex flex-wrap gap-1.5">
                                    {accessibility.map(item => <li key={item} className="gh-chip text-xs">{item}</li>)}
                                </ul>
                            </div>
                        )}
                        <p className="text-[11px] text-[#6b7080]">{t('gameInfo.facts.source')}</p>
                    </>
                )}
                {votesVisible && (
                    <div className={factsVisible ? 'pt-4 border-t border-white/[0.06]' : ''}>
                        <CommunityVotes gameKeyValue={game.gameKey} votes={votes} setVotes={setVotes} />
                    </div>
                )}
            </div>
        </section>
    );
}
