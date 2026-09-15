/* eslint-disable react/prop-types */
// "Gamer progress" on the own profile: achievement hunter level, playtime level and the key numbers.
import { Link } from 'react-router-dom';
import { FaClock, FaTrophy } from 'react-icons/fa';
import { useT } from '../../i18n/index.jsx';
import { hunterLevel, playtimeLevel } from '../../achievements/gamerProgress.js';

export function LevelBar({ icon: Icon, label, info, color, valueText }) {
    const { t } = useT();
    return (
        <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-4 min-w-0">
            <div className="flex items-center gap-3">
                <div className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center" style={{ background: `${color}22`, color }}>
                    <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-500">{label}</p>
                    <p className="text-white font-black text-lg leading-tight">
                        {t('profile.levelN', { level: info.level })}
                        <span className="ml-2 text-xs font-bold uppercase tracking-[0.12em]" style={{ color: info.tier.color }}>{t(`profile.tiers.${info.tier.name.toLowerCase()}`)}</span>
                    </p>
                </div>
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${Math.round(info.progress * 100)}%`, background: color }} />
            </div>
            <p className="text-[11px] text-gray-500 mt-1.5">{valueText}</p>
        </div>
    );
}

export default function GamerProgressCard({ Card, SectionTitle, accent, gamer, stats }) {
    const { t, locale } = useT();
    const nf = new Intl.NumberFormat(locale);
    const hunter = hunterLevel(gamer.hunterPoints);
    const playtime = playtimeLevel(gamer.hoursPlayed);
    const hasData = gamer.achievementsTotal > 0 || gamer.hoursPlayed > 0;

    const numbers = [
        { key: 'achievements', value: `${nf.format(gamer.achievements)}` },
        { key: 'perfect', value: nf.format(gamer.perfectGames) },
        { key: 'rare', value: nf.format(gamer.rareAchievements) },
        gamer.gamerscore > 0 && { key: 'gamerscore', value: nf.format(gamer.gamerscore) },
        stats?.trophies?.platinum > 0 && { key: 'platinum', value: nf.format(stats.trophies.platinum) },
        { key: 'hours', value: nf.format(gamer.hoursPlayed) },
    ].filter(Boolean);

    return (
        <Card className="p-6">
            <SectionTitle accent={accent} action={<Link to="/achievements" className="text-xs text-gray-400 hover:text-white">{t('achievements.open')}</Link>}>
                {t('achievements.gamerProgress')}
            </SectionTitle>
            {!hasData ? (
                <div className="text-sm text-gray-400">
                    <p>{t('achievements.profileEmpty')}</p>
                    <Link to="/achievements" className="inline-block mt-3 px-4 py-2 rounded-xl text-xs font-bold text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/10">
                        {t('achievements.connectCta')}
                    </Link>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <LevelBar icon={FaTrophy} label={t('achievements.hunterLevel')} info={hunter} color="#fbbf24" valueText={t('achievements.pointsToNext', { points: nf.format(hunter.toNext), level: hunter.level + 1 })} />
                        <LevelBar icon={FaClock} label={t('achievements.playtimeLevel')} info={playtime} color="#a78bfa" valueText={t('achievements.hoursToNext', { hours: nf.format(Math.ceil(playtime.toNext)), level: playtime.level + 1 })} />
                    </div>
                    <dl className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-3">
                        {numbers.map(({ key, value }) => (
                            <div key={key} className="rounded-xl bg-white/[0.02] border border-white/5 px-2 py-2.5 text-center min-w-0">
                                <dd className="text-base font-black text-white truncate">{value}</dd>
                                <dt className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-500 truncate">{t(`achievements.stats.${key}`)}</dt>
                            </div>
                        ))}
                    </dl>
                </>
            )}
        </Card>
    );
}
