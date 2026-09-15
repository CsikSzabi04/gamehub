// Home page teaser for /for-you. Reads the last picks saved on users/{uid}.forYou (no extra requests);
// guests and users without saved picks get a call to action.
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { BsArrowRight, BsStars } from 'react-icons/bs';
import SectionHeader from '../Components/SectionHeader.jsx';
import { UserContext } from '../Features/UserContext.jsx';
import { useT } from '../i18n/index.jsx';
import { MatchPill } from './RecoCards.jsx';
import { reasonText } from './recoText.js';

export default function ForYouTeaser() {
    const { t, locale } = useT();
    const { user, profile, authReady } = useContext(UserContext) || {};
    if (!authReady) return null;
    const picks = user ? profile?.forYou?.picks || [] : [];

    if (!picks.length) {
        const guest = !user;
        return (
            <section className="w-full mb-12">
                <div className="gh-surface relative overflow-hidden p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#8b5cf6]/20 blur-3xl" aria-hidden="true" />
                    <BsStars className="h-10 w-10 shrink-0 text-[#c4b5fd]" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                        <p className="gh-eyebrow mb-1">{t('forYou.teaser.eyebrow')}</p>
                        <h2 className="text-xl sm:text-2xl font-extrabold text-white">{guest ? t('forYou.teaser.guestTitle') : t('forYou.teaser.emptyTitle')}</h2>
                        <p className="text-sm text-[#a1a6b3] mt-1 max-w-2xl">{guest ? t('forYou.teaser.guestText') : t('forYou.teaser.emptyText')}</p>
                    </div>
                    <Link to={guest ? '/login' : '/for-you'} className="gh-btn gh-btn-primary shrink-0">
                        {guest ? t('forYou.teaser.guestCta') : t('forYou.teaser.emptyCta')} <BsArrowRight aria-hidden="true" />
                    </Link>
                </div>
            </section>
        );
    }

    return (
        <section className="w-full mb-12">
            <SectionHeader
                title={t('forYou.teaser.title')}
                action={<Link to="/for-you" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#c4b5fd] hover:text-white">{t('forYou.teaser.cta')} <BsArrowRight aria-hidden="true" /></Link>}
            />
            <ul className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {picks.map(pick => (
                    <li key={pick.appid} className="gh-surface overflow-hidden">
                        <Link to={`/game/steam/${pick.appid}`} className="block group">
                            <div className="relative aspect-[460/215] bg-[#171a22] overflow-hidden">
                                <img src={pick.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                                <MatchPill match={pick.match} className="absolute left-2 top-2 shadow" />
                                {pick.discount > 0 && <span className="absolute right-2 top-2 inline-flex items-center h-6 px-1.5 rounded bg-emerald-500 text-[#0a0b0f] text-xs font-extrabold">-{pick.discount}%</span>}
                            </div>
                            <div className="p-3">
                                <p className="font-semibold text-white truncate group-hover:text-[#c4b5fd]">{pick.name}</p>
                                {pick.because && <p className="text-xs text-[#a1a6b3] mt-1 line-clamp-2">{reasonText(t, locale, pick.because)}</p>}
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        </section>
    );
}
