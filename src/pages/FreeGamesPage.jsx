/* eslint-disable react/prop-types */
import { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BsBoxArrowUpRight, BsCheck2Circle, BsCheckCircleFill, BsCircle, BsClock, BsGift, BsHourglassSplit, BsPiggyBank } from 'react-icons/bs';
import { EmptyState, PageShell, Spinner } from '../community/ui.jsx';
import { API_BASE, useApi } from '../Components/apiCache.js';
import { UserContext } from '../Features/UserContext.jsx';
import { useT } from '../i18n/index.jsx';
import { firestore } from '../lib/firebase.js';
import EnablePushPrompt from '../notifications/EnablePushPrompt.jsx';
import Countdown from '../releases/Countdown.jsx';
import PrefSwitch from '../releases/PrefSwitch.jsx';

// ━━━━━━━━━━━━━━━━ Data ━━━━━━━━━━━━━━━━

const STORE_COLORS = {
    epic: 'bg-[#2a2a2a] text-white',
    steam: 'bg-[#1b2838] text-[#66c0f4]',
    gog: 'bg-[#86328a] text-white',
    itch: 'bg-[#fa5c5c] text-white',
    prime: 'bg-[#00a8e1] text-white',
    ubisoft: 'bg-[#0070ff] text-white',
    mobile: 'bg-[#14532d] text-[#86efac]',
};

function toActive(raw) {
    if (!Array.isArray(raw?.items)) return undefined;
    return raw.items.filter(i => i && i.id && i.title && i.url);
}

// Fallback for the old backend (no /free/active): Epic promotions from /discounted + GamerPower from /loot
function epicFromDiscounted(raw) {
    const elements = raw?.data?.Catalog?.searchStore?.elements || [];
    const now = Date.now();
    const freeOffers = (groups, current) => (groups || [])
        .flatMap(g => g.promotionalOffers || [])
        .filter(p => p.discountSetting?.discountPercentage === 0)
        .filter(p => (current ? Date.parse(p.startDate) <= now && Date.parse(p.endDate) > now : Date.parse(p.startDate) > now));
    const items = [];
    for (const el of elements) {
        if (!el?.title || !el.promotions) continue;
        const current = freeOffers(el.promotions.promotionalOffers, true)[0];
        const promo = current || freeOffers(el.promotions.upcomingPromotionalOffers, false)[0];
        if (!promo) continue;
        const mapping = [...(el.offerMappings || []), ...(el.catalogNs?.mappings || [])].find(m => m.pageType === 'productHome' && m.pageSlug);
        const slug = mapping?.pageSlug || el.productSlug?.replace(/\/home$/, '') || el.urlSlug;
        const price = el.price?.totalPrice;
        const image = (el.keyImages || []).find(k => k.type === 'OfferImageWide')?.url || el.keyImages?.[0]?.url || null;
        items.push({
            id: `epic-${slug || el.id}`,
            title: el.title,
            store: 'Epic Games Store',
            storeId: 'epic',
            image,
            url: slug ? `https://store.epicgames.com/p/${slug}` : 'https://store.epicgames.com/free-games',
            worth: price?.originalPrice > 0 ? price.originalPrice / 10 ** (price.currencyInfo?.decimals ?? 2) : null,
            currency: price?.currencyCode || 'USD',
            startDate: promo.startDate,
            endDate: promo.endDate,
            upcoming: !current,
            type: 'game',
        });
    }
    return items;
}

function lootFromRaw(raw) {
    if (!Array.isArray(raw)) return [];
    return raw
        .filter(g => g?.id && /game/i.test(g.type || '') && (g.status || 'Active') === 'Active')
        .map(g => {
            const worth = parseFloat(String(g.worth || '').replace(/[^0-9.]/g, ''));
            const store = /steam/i.test(g.platforms) ? ['Steam', 'steam'] : /epic/i.test(g.platforms) ? ['Epic Games Store', 'epic'] : /gog/i.test(g.platforms) ? ['GOG', 'gog'] : /itch/i.test(g.platforms) ? ['itch.io', 'itch'] : /android|ios/i.test(g.platforms) ? ['Mobile', 'mobile'] : ['PC', 'other'];
            const end = /^\d{4}-\d{2}-\d{2}/.test(g.end_date || '') ? new Date(`${g.end_date.replace(' ', 'T')}Z`).toISOString() : null;
            return {
                id: `gp-${g.id}`,
                title: String(g.title).replace(/\s*giveaway\s*$/i, '').replace(/\s*\([^()]{1,30}\)\s*$/, ''),
                store: store[0],
                storeId: store[1],
                image: g.image || g.thumbnail || null,
                url: g.open_giveaway_url || g.gamerpower_url,
                worth: Number.isFinite(worth) && worth > 0 ? worth : null,
                currency: 'USD',
                startDate: null,
                endDate: end,
                upcoming: false,
                type: 'game',
            };
        })
        .filter(g => g.url && (!g.endDate || Date.parse(g.endDate) > Date.now()));
}

function useFreeGames() {
    const primary = useApi(`${API_BASE}/free/active`, toActive);
    const needFallback = Boolean(primary.error) && !primary.data;
    const epic = useApi(needFallback ? `${API_BASE}/discounted` : null, epicFromDiscounted);
    const loot = useApi(needFallback ? `${API_BASE}/loot` : null, lootFromRaw);

    return useMemo(() => {
        if (!needFallback) return { items: primary.data, loading: primary.loading, error: null, fallback: false };
        const epicItems = epic.data || [];
        const titles = new Set(epicItems.map(i => i.title.toLowerCase().replace(/[^a-z0-9]/g, '')));
        const lootItems = (loot.data || []).filter(i => !(i.storeId === 'epic' && titles.has(i.title.toLowerCase().replace(/[^a-z0-9]/g, ''))));
        const items = epic.data || loot.data ? [...epicItems, ...lootItems] : undefined;
        return {
            items,
            loading: !items && !(epic.error && loot.error),
            error: epic.error && loot.error ? epic.error : null,
            fallback: true,
        };
    }, [needFallback, primary.data, primary.loading, epic.data, epic.error, loot.data, loot.error]);
}

/** Claimed giveaways of the signed-in user: users/{uid}/claimedFree/{freeId} */
function useClaimed(user) {
    const [claimed, setClaimed] = useState({});
    useEffect(() => {
        if (!user?.uid) {
            setClaimed({});
            return undefined;
        }
        let unsubscribe = null;
        let cancelled = false;
        firestore().then(({ db, collection, onSnapshot }) => {
            if (cancelled) return;
            unsubscribe = onSnapshot(
                collection(db, 'users', user.uid, 'claimedFree'),
                snap => setClaimed(Object.fromEntries(snap.docs.map(d => [d.id, d.data()]))),
                error => console.error('claimedFree:', error),
            );
        });
        return () => {
            cancelled = true;
            unsubscribe?.();
        };
    }, [user?.uid]);
    return claimed;
}

const docId = id => String(id).replace(/\//g, '_').slice(0, 120);

async function setClaim(user, item, isClaimed) {
    const { db, doc, setDoc, deleteDoc, serverTimestamp } = await firestore();
    const ref = doc(db, 'users', user.uid, 'claimedFree', docId(item.id));
    if (!isClaimed) return deleteDoc(ref);
    return setDoc(ref, {
        freeId: docId(item.id),
        title: String(item.title).slice(0, 120),
        store: String(item.store || '').slice(0, 40),
        worth: typeof item.worth === 'number' && item.worth > 0 && item.worth < 1000 ? Math.round(item.worth * 100) / 100 : null,
        currency: /^[A-Z]{3}$/.test(item.currency || '') ? item.currency : 'USD',
        claimedAt: serverTimestamp(),
    });
}

// ━━━━━━━━━━━━━━━━ UI ━━━━━━━━━━━━━━━━

function FreeCard({ item, isClaimed, onToggleClaim, busy, money }) {
    const { t, locale } = useT();
    const ended = !item.upcoming && item.endDate && Date.parse(item.endDate) <= Date.now();
    return (
        <article className={`gh-surface overflow-hidden flex flex-col transition-opacity ${isClaimed ? 'opacity-70' : ''}`}>
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="relative block aspect-video bg-[#171a22] overflow-hidden">
                {item.image && <img src={item.image} alt="" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover" />}
                <span className={`absolute left-2 top-2 rounded-md px-2 py-1 text-[11px] font-bold shadow ${STORE_COLORS[item.storeId] || 'bg-black/70 text-white'}`}>{item.store}</span>
                {item.worth ? (
                    <span className="absolute right-2 top-2 rounded-md bg-black/75 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur">
                        <s className="text-[#a1a6b3] mr-1">{money(item.worth, item.currency)}</s>
                        <span className="text-emerald-400">{t('freeGames.free')}</span>
                    </span>
                ) : null}
                {isClaimed && (
                    <span className="absolute left-2 bottom-2 inline-flex items-center gap-1 rounded-md bg-emerald-500/90 px-2 py-1 text-[11px] font-bold text-white">
                        <BsCheckCircleFill /> {t('freeGames.claimed')}
                    </span>
                )}
            </a>
            <div className="p-3.5 flex flex-col gap-2 flex-1">
                <div className="flex items-start gap-2">
                    <h3 className="flex-1 min-w-0 text-[15px] font-semibold text-white leading-snug line-clamp-2">{item.title}</h3>
                    {item.type === 'dlc' && <span className="gh-chip !text-[10px] shrink-0">{t('freeGames.dlc')}</span>}
                </div>
                <p className="flex items-center gap-1.5 text-xs text-[#a1a6b3]">
                    {item.upcoming ? <BsHourglassSplit className="text-[#c4b5fd]" /> : <BsClock className={ended ? '' : 'text-amber-400'} />}
                    {item.upcoming ? (
                        item.startDate
                            ? <>{t('freeGames.startsIn')} <Countdown to={item.startDate} className="font-semibold text-[#c4b5fd]" /></>
                            : t('freeGames.soon')
                    ) : item.endDate ? (
                        ended ? t('freeGames.ended') : <>{t('freeGames.endsIn')} <Countdown to={item.endDate} className="font-semibold text-amber-300" /></>
                    ) : t('freeGames.noEnd')}
                </p>
                {item.endDate && !ended && (
                    <p className="text-[11px] text-[#6b7080] -mt-1">
                        {t(item.upcoming ? 'freeGames.startsOn' : 'freeGames.until', {
                            date: new Date(item.upcoming ? item.startDate : item.endDate).toLocaleString(locale, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                        })}
                    </p>
                )}
                <div className="mt-auto pt-2 flex gap-2">
                    <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`gh-btn flex-1 !h-10 ${item.upcoming ? 'gh-btn-secondary' : 'gh-btn-primary'}`}
                    >
                        {item.upcoming ? t('freeGames.viewStore') : t('freeGames.claim')} <BsBoxArrowUpRight className="w-3 h-3" />
                    </a>
                    {!item.upcoming && (
                        <button
                            type="button"
                            onClick={() => onToggleClaim(item)}
                            disabled={busy}
                            aria-pressed={isClaimed}
                            title={isClaimed ? t('freeGames.unmarkClaimed') : t('freeGames.markClaimed')}
                            className={`gh-btn !h-10 !px-3 ${isClaimed ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' : 'gh-btn-secondary'}`}
                        >
                            {isClaimed ? <BsCheck2Circle /> : <BsCircle />}
                            <span className="hidden min-[400px]:inline">{isClaimed ? t('freeGames.claimed') : t('freeGames.markClaimed')}</span>
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
}

function Section({ title, count, children }) {
    return (
        <section className="mb-10">
            <h2 className="gh-section-title mb-4 flex items-baseline gap-2">
                {title}
                <span className="text-sm font-medium text-[#6b7080]">{count}</span>
            </h2>
            {children}
        </section>
    );
}

export default function FreeGamesPage() {
    const { t, locale } = useT();
    const navigate = useNavigate();
    const { user } = useContext(UserContext) || {};
    const { items, loading, error, fallback } = useFreeGames();
    const claimed = useClaimed(user);
    const [store, setStore] = useState('all');
    const [hideClaimed, setHideClaimed] = useState(false);
    const [busyId, setBusyId] = useState(null);
    const [claimError, setClaimError] = useState('');

    const money = useMemo(() => {
        const formatters = {};
        return (value, currency = 'USD') => {
            try {
                formatters[currency] ||= new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 2 });
                return formatters[currency].format(value);
            } catch {
                return `${value} ${currency}`;
            }
        };
    }, [locale]);

    const stores = useMemo(() => {
        const map = new Map();
        for (const i of items || []) if (!map.has(i.storeId)) map.set(i.storeId, i.store);
        return [...map.entries()];
    }, [items]);

    const visible = (items || []).filter(i => (store === 'all' || i.storeId === store) && !(hideClaimed && claimed[docId(i.id)]));
    const now = visible.filter(i => !i.upcoming);
    const next = visible.filter(i => i.upcoming);

    const claimedList = Object.values(claimed);
    const savedByCurrency = claimedList.reduce((acc, c) => {
        if (typeof c.worth === 'number') acc[c.currency || 'USD'] = (acc[c.currency || 'USD'] || 0) + c.worth;
        return acc;
    }, {});
    const savedText = Object.entries(savedByCurrency).map(([cur, sum]) => money(sum, cur)).join(' + ') || money(0);

    async function toggleClaim(item) {
        if (!user) {
            navigate('/login');
            return;
        }
        setBusyId(item.id);
        setClaimError('');
        try {
            await setClaim(user, item, !claimed[docId(item.id)]);
        } catch (err) {
            console.error('claim:', err);
            setClaimError(t('freeGames.claimError'));
        } finally {
            setBusyId(null);
        }
    }

    const grid = list => (
        <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {list.map(item => (
                <FreeCard key={item.id} item={item} isClaimed={Boolean(claimed[docId(item.id)])} onToggleClaim={toggleClaim} busy={busyId === item.id} money={money} />
            ))}
        </div>
    );

    return (
        <PageShell eyebrow={t('freeGames.eyebrow')} title={t('freeGames.title')} subtitle={t('freeGames.subtitle')} wide>
            <div className="grid gap-4 md:grid-cols-2 mb-8">
                {user ? (
                    <div className="gh-surface p-4 sm:p-5 flex items-center gap-4">
                        <span className="grid place-items-center h-12 w-12 shrink-0 rounded-xl bg-emerald-500/15 text-emerald-400">
                            <BsPiggyBank className="w-6 h-6" />
                        </span>
                        <div className="min-w-0">
                            <p className="text-lg sm:text-xl font-bold text-white truncate">{t('freeGames.saved', { amount: savedText })}</p>
                            <p className="text-sm text-[#a1a6b3]">{t('freeGames.claimedCount', { count: claimedList.length })}</p>
                        </div>
                    </div>
                ) : (
                    <div className="gh-surface p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="min-w-0 flex-1">
                            <p className="font-semibold text-white">{t('freeGames.loginTitle')}</p>
                            <p className="text-sm text-[#a1a6b3] mt-0.5">{t('freeGames.loginText')}</p>
                        </div>
                        <Link to="/login" className="gh-btn gh-btn-primary shrink-0">{t('freeGames.login')}</Link>
                    </div>
                )}
                {user && (
                    <div className="gh-surface p-4 sm:p-5 space-y-3">
                        <PrefSwitch type="freeGames" label={t('freeGames.notifyLabel')} hint={t('freeGames.notifyHint')} />
                        <EnablePushPrompt compact />
                    </div>
                )}
            </div>

            {items?.length > 0 && (
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex gap-1.5 overflow-x-auto pb-1 -mb-1 min-w-0 flex-1" role="group">
                        {[['all', t('freeGames.allStores')], ...stores].map(([id, label]) => (
                            <button
                                key={id}
                                type="button"
                                onClick={() => setStore(id)}
                                aria-pressed={store === id}
                                className={`shrink-0 h-9 px-3.5 rounded-lg text-sm font-medium transition-colors ${store === id ? 'bg-white text-[#0a0b0f]' : 'bg-white/[0.05] text-[#c9ccd4] hover:bg-white/[0.09]'}`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                    {user && (
                        <label className="inline-flex items-center gap-2 text-sm text-[#c9ccd4] cursor-pointer select-none shrink-0">
                            <input type="checkbox" checked={hideClaimed} onChange={e => setHideClaimed(e.target.checked)} className="h-4 w-4 accent-[#8b5cf6]" />
                            {t('freeGames.hideClaimed')}
                        </label>
                    )}
                </div>
            )}

            {claimError && <p className="mb-4 text-sm text-red-400">{claimError}</p>}

            {loading ? (
                <Spinner />
            ) : error || !items ? (
                <EmptyState icon={BsGift} title={t('freeGames.error')} text={t('freeGames.errorText')} />
            ) : items.length === 0 ? (
                <EmptyState icon={BsGift} title={t('freeGames.empty')} text={t('freeGames.emptyText')} />
            ) : (
                <>
                    <Section title={t('freeGames.freeNow')} count={now.length}>
                        {now.length ? grid(now) : <p className="text-sm text-[#a1a6b3]">{t('freeGames.filteredEmpty')}</p>}
                    </Section>
                    {next.length > 0 && (
                        <Section title={t('freeGames.comingNext')} count={next.length}>
                            {grid(next)}
                        </Section>
                    )}
                </>
            )}

            <p className="text-xs text-[#6b7080]">{fallback ? t('freeGames.fallbackNote') : t('freeGames.source')}</p>
        </PageShell>
    );
}
