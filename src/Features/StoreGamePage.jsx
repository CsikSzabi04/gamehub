import { useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import {
    BsHeart, BsHeartFill, BsBoxArrowUpRight, BsPeopleFill, BsHandThumbsUp, BsTrophy, BsStarFill,
} from 'react-icons/bs';
import Header from '../Header.jsx';
import Footer from '../Footer.jsx';
import SystemRequirements from '../Components/SystemRequirements.jsx';
import ReviewsPanel from '../Components/ReviewsPanel.jsx';
import HubImage from '../Hub/HubImage.jsx';
import { useHub, hubUrl, formatCount } from '../Hub/hubApi.js';
import { SOURCE_LABELS } from '../Hub/StoreCard.jsx';
import { peekCached, useApi } from '../Components/apiCache.js';
import { optimizedSrc } from '../Components/imageMirror.js';
import { formatDate, DetailRow, DetailList, GameHero, PageState, Spinner } from './AllReview.jsx';
import useGameCommunity from './useGameCommunity.js';
import { useT } from '../i18n/index.jsx';
import { GameActions, GameBadges, GameAside, GameMain } from '../gamepage/GameExtras.jsx';

const RAWG_KEY = '984255fceb114b05b5e746dc24a8520a';
const SOURCES = ['steam', 'gog'];

/** Key used for GameDataHub reviews/favorites of store games, e.g. "steam-730". */
export const storeGameKey = (source, id) => `${source}-${id}`;

export const normalizeTitle = value => (value || '').toLowerCase().replace(/[^a-z0-9]/g, '');

/** 'exact' | 'close' ("Overwatch 2" vs "Overwatch®") | null ("Nox" vs "Nox Archaist") */
export function titleMatch(a, b) {
    const x = normalizeTitle(a);
    const y = normalizeTitle(b);
    if (!x || !y) return null;
    if (x === y) return 'exact';
    const [short, long] = x.length < y.length ? [x, y] : [y, x];
    return short.length >= 4 && long.startsWith(short) && short.length / long.length >= 0.7 ? 'close' : null;
}

function releaseYear(value) {
    if (!value) return null;
    const year = new Date(value).getFullYear();
    return Number.isNaN(year) ? null : year;
}

/** Different games often share a title (an itch.io "WARDOGS" vs the 2026 Steam one): compare years when both are known. */
export function sameRelease(a, b) {
    const x = releaseYear(a);
    const y = releaseYear(b);
    return x == null || y == null || Math.abs(x - y) <= 1;
}

/** Best RAWG search result for a store title (and release date, when known), or null when nothing is close enough. */
export function pickRawgMatch(results, name, releaseDate) {
    if (!Array.isArray(results)) return null;
    const candidates = results.filter(r => titleMatch(r.name, name) && sameRelease(r.released, releaseDate));
    return candidates.find(r => titleMatch(r.name, name) === 'exact') || candidates[0] || null;
}

/** Steam writes "OS *:" (footnote marker); the requirement parser expects "OS:". */
export function normalizeRequirements(requirements) {
    if (!requirements || (!requirements.minimum && !requirements.recommended)) return null;
    const fix = text => (typeof text === 'string' ? text.replace(/\bOS\s*\*+\s*:/g, 'OS:') : text);
    return { minimum: fix(requirements.minimum), recommended: fix(requirements.recommended) };
}

// Store lists already loaded on the home page / hub: lets a refreshed page find the item without a click
const CACHED_LISTS = {
    steam: [['/steam/featured', ['topSellers', 'newReleases', 'specials', 'comingSoon']], ['/steamspy/trending', ['items']], ['/steam/most-played', ['items']]],
    gog: [['/gog', ['trending', 'newest', 'deals']]],
};

export function findCachedItem(source, id) {
    for (const [path, keys] of CACHED_LISTS[source] || []) {
        const data = peekCached(hubUrl(path));
        for (const key of keys) {
            const list = data?.[key];
            const item = Array.isArray(list) ? list.find(i => String(i.id) === String(id)) : null;
            if (item) return item;
        }
    }
    return null;
}

const toResults = data => (Array.isArray(data?.results) ? data.results : []);
const toFound = data => (data?.found ? data : null);

const rawgSearchUrl = name =>
    name ? `https://api.rawg.io/api/games?key=${RAWG_KEY}&search=${encodeURIComponent(name)}&search_precise=true&page_size=6` : null;
const rawgGameUrl = id => (id ? `https://api.rawg.io/api/games/${id}?key=${RAWG_KEY}` : null);

const firstList = (...lists) => lists.find(list => Array.isArray(list) && list.length > 0) || [];

function Stat({ icon: Icon, label, value }) {
    return (
        <div className="rounded-xl bg-[#111319] border border-white/[0.06] px-3 py-2.5 min-w-0">
            <p className="gh-eyebrow flex items-center gap-1.5"><Icon className="text-[10px]" aria-hidden="true" /> {label}</p>
            <p className="mt-1 text-sm font-semibold text-[#eceef2] truncate">{value}</p>
        </div>
    );
}

function Price({ price, originalPrice, discount }) {
    if (!price) return null;
    return (
        <span className="inline-flex flex-wrap items-center gap-2">
            {discount > 0 && <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-xs font-bold text-emerald-400">-{discount}%</span>}
            {discount > 0 && originalPrice && <span className="text-[#6b7080] line-through">{originalPrice}</span>}
            <span className="font-semibold text-white">{price}</span>
        </span>
    );
}

function Chips({ items }) {
    return (
        <div className="flex flex-wrap gap-1.5 mt-1">
            {items.map(name => <span key={name} className="gh-chip">{name}</span>)}
        </div>
    );
}

export default function StoreGamePage() {
    const { source, id } = useParams();
    const { t, locale } = useT();
    const location = useLocation();
    const valid = SOURCES.includes(source) && /^\d{1,12}$/.test(id || '');
    const isSteam = source === 'steam';

    // The clicked card (router state) or a cached list entry renders the header immediately
    const stateItem = location.state?.item;
    const [item] = useState(() =>
        (stateItem && String(stateItem.id) === String(id) ? stateItem : null) || (valid ? findCachedItem(source, id) : null)
    );

    // Store details: Steam by appid, GOG by product id
    const { data: steamApp, error: steamError } = useHub(valid && isSteam ? `/steam/app/${id}` : null);
    const { data: gogGame, error: gogError } = useHub(valid && !isSteam ? `/gog/game/${id}` : null);
    const store = isSteam ? steamApp : gogGame;
    const storeError = isSteam ? steamError : gogError;

    const name = item?.name || store?.name;
    // Title-based lookups are only trusted once the store's own data (with its release date) has answered
    const storeSettled = Boolean(store || storeError);

    // A GOG game that is also on Steam gets live players, Steam reviews and news
    const { data: steamFound } = useHub(valid && !isSteam && name ? `/steam/lookup?name=${encodeURIComponent(name)}` : null, toFound);
    const steamLookup = storeSettled && steamFound && titleMatch(steamFound.name, name) && sameRelease(steamFound.releaseDate, gogGame?.releaseDate)
        ? steamFound
        : null;
    const steam = isSteam ? steamApp : steamLookup;

    // RAWG fills in what the stores don't give (and everything while the backend is unreachable)
    const { data: rawgResults } = useApi(rawgSearchUrl(name), toResults);
    const rawgMatch = storeSettled && rawgResults ? pickRawgMatch(rawgResults, name, store?.releaseDate) : null;
    const { data: rawg } = useApi(rawgGameUrl(rawgMatch?.id));

    const community = useGameCommunity(valid ? storeGameKey(source, id) : null, name);
    const [shot, setShot] = useState(null);

    if (!valid) {
        return <PageState><p className="text-[#a1a6b3]">{t('game.notFound')}</p></PageState>;
    }

    if (!name) {
        return <PageState>{storeError ? <p className="text-[#a1a6b3]">{t('storePage.unavailable')}</p> : <Spinner />}</PageState>;
    }

    const storeUrl = item?.url || store?.url || (isSteam ? `https://store.steampowered.com/app/${id}` : undefined);
    const rawgPc = rawg?.platforms?.find(p => p.platform?.slug === 'pc')?.requirements;
    const requirements = normalizeRequirements(store?.requirements) || normalizeRequirements(steamLookup?.requirements) || normalizeRequirements(rawgPc);

    const genres = firstList(store?.genres, steamLookup?.genres, rawg?.genres?.map(g => g.name), item?.tag ? [item.tag] : null);
    const developers = firstList(store?.developers, rawg?.developers?.map(d => d.name), item?.subtitle && !isSteam ? [item.subtitle] : null);
    const publishers = firstList(store?.publishers, rawg?.publishers?.map(p => p.name));
    const releaseDate = store?.releaseDate || rawg?.released;
    // Store descriptions lose their inline images, which leaves runs of blank lines behind
    const about = (store?.description || steamLookup?.description || rawg?.description_raw || '')
        .replace(/[ \t]+\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
    const metacritic = steam?.metacritic ?? rawg?.metacritic ?? null;
    const screenshots = firstList(store?.screenshots, steamLookup?.screenshots);
    const features = firstList(store?.categories, store?.features);
    const tags = firstList(gogGame?.tags, rawg?.tags?.map(tag => tag.name)).slice(0, 12);
    const ageRating = gogGame?.ageRating || rawg?.esrb_rating?.name || (steamApp?.requiredAge ? `${steamApp.requiredAge}+` : null);

    const platforms = steamApp?.platforms
        ? ['windows', 'mac', 'linux'].filter(p => steamApp.platforms[p]).map(p => ({ windows: 'Windows', mac: 'macOS', linux: 'Linux' })[p])
        : firstList(gogGame?.platforms, rawg?.platforms?.map(p => p.platform.name));

    const price = isSteam && steamApp
        ? { price: steamApp.isFree ? t('common.free') : steamApp.price?.final || item?.price, originalPrice: steamApp.price?.initial, discount: steamApp.price?.discount }
        : { price: item?.price, originalPrice: item?.originalPrice, discount: item?.discount };

    // Store art first (a full-size screenshot looks sharp as the banner), RAWG only as a fallback
    const extrasGame = {
        source, id, gameKey: storeGameKey(source, id), name,
        image: steam?.image || gogGame?.image || item?.image || rawg?.background_image || null,
        steamAppId: isSteam ? Number(id) : steamLookup?.id ?? null,
        releaseDate: store?.releaseDate || rawg?.released || null,
        comingSoon: Boolean(steamApp?.comingSoon || gogGame?.comingSoon),
        requirements, steam: steam || null,
    };

    const heroImage = steamApp?.screenshots?.[0]?.full || gogGame?.image || rawg?.background_image || steam?.image || item?.image;

    return (
        <>
            <Header />
            <main className="min-h-screen text-white">
                <GameHero game={{ name, background_image: heroImage }} genres={genres}>
                    <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-x-4 sm:gap-x-5 gap-y-2 text-sm text-[#a1a6b3]">
                        <Price {...price} />
                        {steam?.reviews ? (
                            <span className="inline-flex items-center gap-1.5">
                                <BsHandThumbsUp className="text-emerald-400" aria-hidden="true" />
                                <span className="font-semibold text-white">{steam.reviews.label}</span>
                                <span>({steam.reviews.percent}%)</span>
                            </span>
                        ) : rawg?.rating ? (
                            <span className="inline-flex items-center gap-1.5">
                                <BsStarFill className="text-amber-400" aria-hidden="true" />
                                <span className="font-semibold text-white">{rawg.rating}</span> / 5
                            </span>
                        ) : null}
                        {releaseDate && <span>{t('game.released', { date: formatDate(releaseDate, locale) })}</span>}
                        {metacritic ? (
                            <span className="inline-flex items-center gap-2">
                                <span className={`inline-flex h-6 min-w-6 items-center justify-center rounded px-1.5 text-xs font-bold ${metacritic >= 75 ? 'bg-emerald-500/15 text-emerald-400' : metacritic >= 50 ? 'bg-amber-500/15 text-amber-400' : 'bg-red-500/15 text-red-400'}`}>
                                    {metacritic}
                                </span>
                                Metacritic
                            </span>
                        ) : null}
                        {rawg?.playtime ? <span>{t('game.avgPlaytime', { hours: rawg.playtime })}</span> : null}
                    </div>

                    <div className="mt-5 flex flex-col sm:flex-row flex-wrap gap-3">
                        {community.isFavorite ? (
                            <button onClick={community.removeFavorite} className="gh-btn gh-btn-secondary !h-11 w-full sm:w-auto">
                                <BsHeartFill className="text-[#f87171]" />
                                {t('game.inFavorites')}
                            </button>
                        ) : (
                            <button onClick={community.addFavorite} className="gh-btn gh-btn-primary !h-11 w-full sm:w-auto">
                                <BsHeart />
                                {t('game.addFavorite')}
                            </button>
                        )}
                        <GameActions game={extrasGame} />
                        {storeUrl && (
                            <a href={storeUrl} target="_blank" rel="noopener noreferrer" className="gh-btn gh-btn-secondary !h-11 w-full sm:w-auto">
                                {t('storePage.viewOn', { store: SOURCE_LABELS[source] })} <BsBoxArrowUpRight className="w-3 h-3" />
                            </a>
                        )}
                    </div>
                    <GameBadges game={extrasGame} />
                    {community.favError && <p className="text-sm text-red-400 mt-3">{community.favError}</p>}
                </GameHero>

                <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-10 sm:mt-12 pb-10 grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-10 lg:items-start">
                    {/* Below lg the aside slots between the main blocks via order (display: contents) */}
                    <div className="contents lg:flex lg:flex-col lg:gap-10 lg:col-span-2 min-w-0">
                        {steam && (steam.players != null || steam.reviews || steam.achievements) && (
                            <div className="order-1 min-w-0 grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {steam.players != null && <Stat icon={BsPeopleFill} label={t('storePage.playingNow')} value={formatCount(steam.players, locale)} />}
                                {steam.reviews && <Stat icon={BsHandThumbsUp} label={t('storePage.steamReviews')} value={t('storePage.positive', { total: formatCount(steam.reviews.total, locale), percent: steam.reviews.percent })} />}
                                {steam.achievements ? <Stat icon={BsTrophy} label={t('storePage.achievements')} value={steam.achievements} /> : null}
                            </div>
                        )}

                        {about && (
                            <section className="order-1 min-w-0">
                                <h3 className="gh-section-title mb-3">{t('game.about')}</h3>
                                <p className="text-sm sm:text-[15px] leading-7 text-[#c9ccd4] whitespace-pre-line line-clamp-[12]">{about}</p>
                            </section>
                        )}

                        {screenshots.length > 0 && (
                            <section className="order-1 min-w-0">
                                <h3 className="gh-section-title mb-3">{t('storePage.screenshots')}</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {screenshots.map((s, i) => (
                                        <button
                                            key={s.thumb}
                                            type="button"
                                            onClick={() => setShot(s.full)}
                                            aria-label={t('storePage.openScreenshot', { n: i + 1 })}
                                            className="overflow-hidden rounded-lg border border-white/[0.06] hover:border-white/20 transition-colors"
                                        >
                                            <HubImage src={s.thumb} alt="" className="w-full aspect-video" />
                                        </button>
                                    ))}
                                </div>
                            </section>
                        )}

                        {requirements && (
                            <div className="order-1 min-w-0">
                                <SystemRequirements minimum={requirements.minimum} recommended={requirements.recommended} platform="PC" />
                            </div>
                        )}

                        <div className="order-1 min-w-0 flex flex-col gap-10 empty:hidden">
                            <GameMain game={extrasGame} />
                        </div>

                        {steam?.news?.length > 0 && (
                            <section className="order-3 min-w-0">
                                <h3 className="gh-section-title mb-3">{t('storePage.latestNews')}</h3>
                                <ul className="gh-surface divide-y divide-white/[0.06]">
                                    {steam.news.map(n => (
                                        <li key={n.id}>
                                            <a href={n.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors">
                                                <span className="text-sm text-[#d4d7de] truncate">{n.title}</span>
                                                <span className="text-xs text-[#6b7080] shrink-0">{formatDate(n.date, locale)}</span>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        <div className="order-3 min-w-0">
                            <ReviewsPanel
                                user={community.user}
                                reviews={community.reviews}
                                newReview={community.newReview}
                                setNewReview={community.setNewReview}
                                rating={community.rating}
                                setRating={community.setRating}
                                onSubmit={community.submitReview}
                                community={community}
                                error={community.reviewError}
                            />
                        </div>
                    </div>

                    <aside className="order-2 lg:order-none min-w-0 lg:sticky lg:top-24 flex flex-col gap-4">
                        <GameAside game={extrasGame} />
                        <div className="gh-surface p-4 sm:p-5">
                            <h3 className="text-sm font-semibold text-white mb-2">{t('game.details')}</h3>
                            <DetailList>
                                {price.price && <DetailRow label={t('storePage.priceOn', { store: SOURCE_LABELS[source] })}><Price {...price} /></DetailRow>}
                                <DetailRow label={t('game.releaseDate')}>{formatDate(releaseDate, locale)}</DetailRow>
                                {developers.length > 0 && <DetailRow label={t('game.developer')}>{developers.join(', ')}</DetailRow>}
                                {publishers.length > 0 && <DetailRow label={t('game.publisher')}>{publishers.join(', ')}</DetailRow>}
                                {ageRating && <DetailRow label={t('game.ageRating')}>{ageRating}</DetailRow>}
                                {platforms.length > 0 && <DetailRow label={t('game.platforms')} wide>{platforms.join(', ')}</DetailRow>}
                                {steam?.website && (
                                    <DetailRow label={t('storePage.website')} wide>
                                        <a href={steam.website} target="_blank" rel="noopener noreferrer" className="text-[#c4b5fd] hover:text-white break-all">
                                            {steam.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                                        </a>
                                    </DetailRow>
                                )}
                                {rawg?.stores?.length > 0 && (
                                    <DetailRow label={t('storePage.alsoOn')} wide>{rawg.stores.map(s => s.store.name).join(', ')}</DetailRow>
                                )}
                                {features.length > 0 && <DetailRow label={t('storePage.features')} wide><Chips items={features.slice(0, 8)} /></DetailRow>}
                                {tags.length > 0 && <DetailRow label={t('game.tags')} wide><Chips items={tags} /></DetailRow>}
                            </DetailList>
                        </div>
                    </aside>
                </div>
            </main>
            <Footer />

            {shot && (
                <div className="fixed inset-0 z-[210] bg-black/90 flex items-center justify-center p-4" onClick={() => setShot(null)} role="dialog" aria-label={t('storePage.screenshot')}>
                    <img
                        src={optimizedSrc(shot, 1920)}
                        onError={e => { if (e.currentTarget.src !== shot) e.currentTarget.src = shot; }}
                        alt={t('storePage.screenshot')}
                        decoding="async"
                        className="max-w-full max-h-full rounded-lg"
                    />
                </div>
            )}
        </>
    );
}
