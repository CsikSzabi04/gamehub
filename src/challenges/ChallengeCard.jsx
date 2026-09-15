import { Link } from 'react-router-dom';
import { BsCheckCircleFill, BsGift } from 'react-icons/bs';
import { useT } from '../i18n/index.jsx';

/**
 * One monthly challenge with progress.
 * progress: number | null (null = signed out / unknown), claimed: bool, onClaim: fn | undefined
 */
export default function ChallengeCard({ challenge, progress, claimed, claiming, onClaim }) {
    const { t } = useT();
    const Icon = challenge.icon;
    const known = typeof progress === 'number';
    const value = known ? Math.min(progress, challenge.target) : 0;
    const done = known && progress >= challenge.target;
    const pct = Math.round((value / challenge.target) * 100);

    return (
        <article className={`gh-surface p-4 sm:p-5 flex flex-col ${claimed ? 'border-emerald-400/25' : ''}`}>
            <div className="flex items-start gap-3">
                <span
                    className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center"
                    style={{ background: `${challenge.color}22`, color: challenge.color, boxShadow: done ? `0 0 22px ${challenge.color}40` : undefined }}
                >
                    <Icon className="w-5 h-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-white leading-snug">{t(`challenges.items.${challenge.id}.title`)}</h3>
                        <span className="shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#8b5cf6]/15 text-[#c4b5fd]">+{challenge.xp} XP</span>
                    </div>
                    <p className="text-sm text-[#a1a6b3] mt-1">{t(`challenges.items.${challenge.id}.desc`, { target: challenge.target })}</p>
                </div>
            </div>

            <div className="mt-4">
                <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={challenge.target} aria-valuenow={value}>
                    <div
                        className="h-full rounded-full transition-[width] duration-700"
                        style={{ width: `${known ? pct : 0}%`, background: done ? '#34d399' : challenge.color }}
                    />
                </div>
                <div className="flex items-center justify-between gap-2 mt-1.5 text-xs text-[#6b7080]">
                    <span>{known ? t('challenges.progress', { value, target: challenge.target }) : t('challenges.progressHidden', { target: challenge.target })}</span>
                    {known && <span>{pct}%</span>}
                </div>
            </div>

            <div className="flex-1" />
            <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
                {claimed ? (
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-400">
                        <BsCheckCircleFill aria-hidden="true" /> {t('challenges.claimed')}
                    </span>
                ) : done && onClaim ? (
                    <button type="button" onClick={onClaim} disabled={claiming} className="gh-btn gh-btn-primary !h-9 w-full sm:w-auto">
                        <BsGift aria-hidden="true" /> {t('challenges.claim')}
                    </button>
                ) : challenge.cta ? (
                    <Link to={challenge.cta} className="text-sm font-medium text-[#c4b5fd] hover:text-white">{t(`challenges.cta.${challenge.id}`)} →</Link>
                ) : (
                    <span className="text-xs text-[#6b7080]">{t('challenges.keepGoing')}</span>
                )}
            </div>
        </article>
    );
}
