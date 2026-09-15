/* eslint-disable react/prop-types */
// /for-you: personal recommendations from the user's library, playtime, ratings, achievements and wishlist.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BsArrowCounterclockwise, BsAward, BsCollection, BsExclamationTriangle, BsInfoCircle, BsStars } from 'react-icons/bs';
import { EmptyState, PageShell, RequireLogin, Spinner, inputClass } from '../community/ui.jsx';
import { useT } from '../i18n/index.jsx';
import { PRICE_REGIONS, regionName, usePriceRegion } from '../prices/priceUtils.js';
import { BacklogCard, RecoCard, TasteCard } from '../recommendations/RecoCards.jsx';
import { useRecoTagNames, useRecommendations } from '../recommendations/useRecommendations.js';

const PAGE = 12;

export default function ForYouPage() {
    const { t, locale } = useT();
    const [region, setRegion] = usePriceRegion();
    return (
        <PageShell
            wide
            eyebrow={t('forYou.eyebrow')}
            title={t('forYou.title')}
            subtitle={t('forYou.subtitle')}
            actions={(
                <label className="block">
                    <span className="block text-xs font-semibold uppercase tracking-wide text-[#8a8f9c] mb-1.5">{t('prices.region')}</span>
                    <select value={region} onChange={e => setRegion(e.target.value)} className={`${inputClass} w-56`}>
                        {PRICE_REGIONS.map(code => <option key={code} value={code}>{regionName(code, locale)}</option>)}
                    </select>
                </label>
            )}
        >
            <RequireLogin>
                <Recommendations region={region} />
            </RequireLogin>
        </PageShell>
    );
}

function Recommendations({ region }) {
    const { t, lang } = useT();
    const reco = useRecommendations(region);
    const tagNames = useRecoTagNames(lang);
    const [visible, setVisible] = useState(PAGE);

    if (reco.status === 'loading') {
        return (
            <div className="text-center">
                <Spinner className="pt-16 pb-4" />
                <p className="text-sm text-[#8a8f9c]">{t('forYou.loading')}</p>
            </div>
        );
    }
    if (reco.status === 'error') return <ErrorNote code={reco.error} />;
    if (reco.status === 'empty') {
        return (
            <EmptyState
                icon={BsStars}
                title={t('forYou.empty.title')}
                text={t('forYou.empty.text')}
                action={(
                    <div className="flex flex-wrap justify-center gap-2">
                        <Link to="/library" className="gh-btn gh-btn-primary"><BsCollection aria-hidden="true" /> {t('forYou.empty.library')}</Link>
                        <Link to="/achievements" className="gh-btn gh-btn-secondary"><BsAward aria-hidden="true" /> {t('forYou.empty.achievements')}</Link>
                    </div>
                )}
            />
        );
    }

    const { taste, picks, deals, backlog } = reco.result;
    const actions = { tagNames, onWishlist: reco.addToWishlist, onHide: reco.hide };

    return (
        <div className="space-y-10">
            {reco.error && <ErrorNote code={reco.error} />}

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] items-start">
                <div className="space-y-10 min-w-0">
                    {backlog.length > 0 && (
                        <Section title={t('forYou.sections.backlogTitle')} text={t('forYou.sections.backlogText')}>
                            <ul className="grid gap-3">
                                {backlog.map((card, index) => <BacklogCard key={card.appid} card={card} rank={index} tagNames={tagNames} />)}
                            </ul>                        </Section>
                    )}

                    <Section title={t('forYou.sections.dealsTitle')} text={t('forYou.sections.dealsText')}>
                        {reco.candidatesLoading && !deals.length ? <Loading /> : deals.length ? (
                            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                {deals.slice(0, 6).map(card => <RecoCard key={card.appid} card={card} {...actions} />)}
                            </ul>
                        ) : <Nothing />}
                    </Section>
                </div>
                <div className="lg:sticky lg:top-24">
                    <TasteCard taste={taste} tagNames={tagNames} />
                </div>
            </div>

            <Section title={t('forYou.sections.picksTitle')} text={t('forYou.sections.picksText')}>
                {reco.candidatesLoading && !picks.length ? <Loading /> : picks.length ? (
                    <>
                        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {picks.slice(0, visible).map(card => <RecoCard key={card.appid} card={card} {...actions} />)}
                        </ul>
                        {picks.length > visible && (
                            <button type="button" onClick={() => setVisible(v => v + PAGE)} className="gh-btn gh-btn-secondary w-full mt-3">
                                {t('forYou.showMore', { count: Math.min(PAGE, picks.length - visible) })}
                            </button>
                        )}
                    </>
                ) : <Nothing />}
            </Section>

            <div className="flex flex-col md:flex-row gap-3">
                <details className="gh-surface p-4 flex-1 group">
                    <summary className="flex items-center gap-2 cursor-pointer font-semibold text-white list-none">
                        <BsInfoCircle className="text-[#c4b5fd]" aria-hidden="true" /> {t('forYou.how.title')}
                    </summary>
                    <p className="mt-2 text-sm text-[#a1a6b3] max-w-3xl">{t('forYou.how.text')}</p>
                </details>
                {reco.hiddenCount > 0 && (
                    <div className="gh-surface p-4 flex items-center gap-3 md:w-auto">
                        <span className="text-sm text-[#a1a6b3]">{t('forYou.hiddenCount', { count: reco.hiddenCount })}</span>
                        <button type="button" onClick={() => reco.unhideAll().catch(error => console.error('Could not restore hidden picks:', error))} className="gh-btn gh-btn-secondary !h-9">
                            <BsArrowCounterclockwise aria-hidden="true" /> {t('forYou.unhideAll')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function Section({ title, text, children }) {
    return (
        <section>
            <div className="mb-3">
                <h2 className="text-xl font-bold text-white">{title}</h2>
                {text && <p className="text-sm text-[#8a8f9c] mt-0.5">{text}</p>}
            </div>
            {children}
        </section>
    );
}

function Loading() {
    const { t } = useT();
    return (
        <div className="gh-surface py-8 text-center">
            <Spinner className="pb-3" />
            <p className="text-sm text-[#8a8f9c]">{t('forYou.loadingCandidates')}</p>
        </div>
    );
}

function Nothing() {
    const { t } = useT();
    return <p className="gh-surface p-4 text-sm text-[#8a8f9c]">{t('forYou.nothing')}</p>;
}

function ErrorNote({ code }) {
    const { t } = useT();
    return (
        <p className="gh-surface flex items-start gap-2 p-4 text-sm text-[#fcd34d]">
            <BsExclamationTriangle className="mt-0.5 shrink-0" aria-hidden="true" /> {t(`forYou.errors.${code || 'upstream'}`)}
        </p>
    );
}
