// /status – live status of gaming services, community outage reports, follow alerts and patch notes.
import { useCallback, useContext } from 'react';
import { BsArrowRepeat, BsCheckCircleFill, BsExclamationTriangleFill } from 'react-icons/bs';
import { EmptyState, PageShell, Spinner } from '../community/ui.jsx';
import { UserContext } from '../Features/UserContext.jsx';
import EnablePushPrompt from '../notifications/EnablePushPrompt.jsx';
import { useNotificationPref } from '../notifications/prefs.js';
import { useT } from '../i18n/index.jsx';
import ServiceCard from '../status/ServiceCard.jsx';
import PatchNotes from '../status/PatchNotes.jsx';
import { CATEGORIES, ISSUE_STATES, sendOutageReport, setFollowService, useOutageReports, useServiceStatus } from '../status/statusApi.js';

export default function StatusPage() {
    const { t, locale } = useT();
    const { user, profile, setProfile } = useContext(UserContext) || {};
    const { data, error, refreshing, reload } = useServiceStatus();
    const { byService, addLocal } = useOutageReports(user?.uid);
    const [statusPrefOn, setStatusPref] = useNotificationPref('status');

    const services = data?.services || [];
    const followed = Array.isArray(profile?.followedServices) ? profile.followedServices : [];
    const issues = services.filter(s => ISSUE_STATES.includes(s.status));
    const checkedAt = data?.checkedAt ? new Date(data.checkedAt) : null;

    const onReport = useCallback(async service => {
        const result = await sendOutageReport(user, service, byService[service]?.lastMine || 0);
        if (result === 'ok') addLocal(service, user.uid);
        return result;
    }, [user, byService, addLocal]);

    const onFollow = useCallback((service, follow) => setFollowService(user, setProfile, service, follow), [user, setProfile]);

    const refreshButton = (
        <button onClick={reload} disabled={refreshing} className="gh-btn gh-btn-secondary" title={t('status.autoRefresh')}>
            <BsArrowRepeat className={refreshing ? 'animate-spin' : ''} aria-hidden="true" />
            {t('status.refresh')}
        </button>
    );

    return (
        <PageShell eyebrow={t('status.eyebrow')} title={t('status.pageTitle')} subtitle={t('status.subtitle')} actions={refreshButton}>
            {!data && !error && <Spinner />}
            {!data && error && (
                <EmptyState
                    icon={BsExclamationTriangleFill}
                    title={t('status.loadError')}
                    text={t('status.loadErrorText')}
                    action={<button onClick={reload} className="gh-btn gh-btn-secondary"><BsArrowRepeat /> {t('status.retry')}</button>}
                />
            )}

            {data && (
                <>
                    <div className={`mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border p-4 ${issues.length ? 'border-[#f97316]/30 bg-[#f97316]/[0.08]' : 'border-[#22c55e]/25 bg-[#22c55e]/[0.07]'}`}>
                        <p className={`flex items-center gap-2.5 font-semibold ${issues.length ? 'text-[#fdba74]' : 'text-[#86efac]'}`}>
                            {issues.length
                                ? <BsExclamationTriangleFill className="w-5 h-5 shrink-0" aria-hidden="true" />
                                : <BsCheckCircleFill className="w-5 h-5 shrink-0" aria-hidden="true" />}
                            {issues.length ? t('status.issues', { count: issues.length }) : t('status.allGood')}
                        </p>
                        {checkedAt && !Number.isNaN(checkedAt.getTime()) && (
                            <p className="text-xs text-[#a1a6b3]">
                                {t('status.lastChecked', { time: checkedAt.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }) })}
                                {' · '}{t('status.autoRefresh')}
                            </p>
                        )}
                    </div>

                    {user ? (
                        <div className="mb-6 space-y-3">
                            {followed.length > 0 && <EnablePushPrompt compact />}
                            {followed.length > 0 && !statusPrefOn && (
                                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/[0.06] bg-[#111319] p-3 text-sm text-[#c9ccd4]">
                                    <span>{t('status.statusPrefOff')}</span>
                                    <button onClick={() => setStatusPref(true)} className="gh-btn gh-btn-secondary !h-8 text-xs">{t('status.turnOn')}</button>
                                </div>
                            )}
                            {followed.length === 0 && <p className="text-sm text-[#a1a6b3]">{t('status.followHint')}</p>}
                        </div>
                    ) : (
                        <p className="mb-6 text-sm text-[#a1a6b3]">{t('status.followHint')}</p>
                    )}

                    {CATEGORIES.map(category => {
                        const list = services.filter(s => s.category === category);
                        if (!list.length) return null;
                        return (
                            <section key={category} className="mb-10">
                                <h2 className="gh-section-title mb-3">{t(`status.categories.${category}`)}</h2>
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {list.map(service => (
                                        <ServiceCard
                                            key={service.id}
                                            service={service}
                                            reports={byService[service.id]}
                                            user={user}
                                            following={followed.includes(service.id)}
                                            onReport={onReport}
                                            onFollow={onFollow}
                                        />
                                    ))}
                                </div>
                            </section>
                        );
                    })}

                    <p className="text-xs text-[#6b7080] max-w-3xl">{t('status.disclaimer')}</p>
                </>
            )}

            <PatchNotes user={user} />
        </PageShell>
    );
}
