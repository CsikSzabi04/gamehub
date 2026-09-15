import { useContext, useEffect, useState } from 'react';
import { BsBell, BsDownload, BsPhone } from 'react-icons/bs';
import { PageShell, RequireLogin, EmptyState, Tabs } from '../community/ui.jsx';
import { UserContext } from '../Features/UserContext.jsx';
import { useT } from '../i18n/index.jsx';
import useNotifications from '../notifications/useNotifications.js';
import NotificationItem from '../notifications/NotificationItem.jsx';
import EnablePushPrompt from '../notifications/EnablePushPrompt.jsx';
import usePush from '../notifications/usePush.js';
import { NOTIFICATION_TYPES, isPrefOn, setNotificationPref } from '../notifications/prefs.js';
import { TYPE_ICONS } from '../notifications/NotificationItem.jsx';
import { apiPost } from '../lib/api.js';
import InstallAppModal from '../pwa/InstallAppModal.jsx';
import { useInstall } from '../pwa/install.js';

function Toggle({ checked, onChange, label }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${checked ? 'bg-[#8b5cf6]' : 'bg-white/[0.12]'}`}
        >
            <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
        </button>
    );
}

function DeviceSettings() {
    const { t } = useT();
    const { user, support, subscribed, busy, disable } = usePush();
    const [test, setTest] = useState(null);

    async function sendTest() {
        setTest('sending');
        try {
            await apiPost('/notify/test', {}, user);
            setTest('sent');
        } catch {
            setTest('failed');
        }
    }

    return (
        <div className="gh-surface p-4 sm:p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-white"><BsPhone className="text-[#c4b5fd]" /> {t('notifications.deviceTitle')}</h3>
            <p className="text-sm text-[#a1a6b3] mt-1.5">
                {support === 'unsupported' ? t('notifications.deviceUnsupported') : subscribed ? t('notifications.deviceOn') : t('notifications.deviceOff')}
            </p>
            {!subscribed && support !== 'unsupported' && <div className="mt-3"><EnablePushPrompt force /></div>}
            <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={sendTest} disabled={test === 'sending'} className="gh-btn gh-btn-secondary !h-9">{t('notifications.sendTest')}</button>
                {subscribed && <button onClick={disable} disabled={busy} className="gh-btn gh-btn-secondary !h-9">{t('notifications.turnOff')}</button>}
            </div>
            {test === 'sent' && <p className="text-xs text-emerald-400 mt-2">{t('notifications.testSent')}</p>}
            {test === 'failed' && <p className="text-xs text-red-400 mt-2">{t('notifications.testFailed')}</p>}
        </div>
    );
}

function TypeSettings() {
    const { t } = useT();
    const { user, profile, setProfile } = useContext(UserContext) || {};
    return (
        <div className="gh-surface p-4 sm:p-5">
            <h3 className="text-sm font-semibold text-white">{t('notifications.typesTitle')}</h3>
            <p className="text-xs text-[#6b7080] mt-1">{t('notifications.typesHint')}</p>
            <ul className="mt-3 divide-y divide-white/[0.06]">
                {NOTIFICATION_TYPES.map(type => {
                    const Icon = TYPE_ICONS[type];
                    return (
                        <li key={type} className="flex items-center gap-3 py-3">
                            <Icon className="h-4 w-4 shrink-0 text-[#8a8f9c]" aria-hidden="true" />
                            <div className="min-w-0 flex-1">
                                <p className="text-sm text-[#eceef2]">{t(`notifications.types.${type}`)}</p>
                                <p className="text-xs text-[#6b7080]">{t(`notifications.typeHints.${type}`)}</p>
                            </div>
                            <Toggle
                                checked={isPrefOn(profile, type)}
                                label={t(`notifications.types.${type}`)}
                                onChange={value => setNotificationPref(user, setProfile, type, value)}
                            />
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

function InstallCard() {
    const { t } = useT();
    const { installed } = useInstall();
    const [open, setOpen] = useState(false);
    if (installed) return null;
    return (
        <div className="gh-surface p-4 sm:p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-white"><BsDownload className="text-[#c4b5fd]" /> {t('notifications.installTitle')}</h3>
            <p className="text-sm text-[#a1a6b3] mt-1.5">{t('notifications.installText')}</p>
            <button onClick={() => setOpen(true)} className="gh-btn gh-btn-primary !h-9 mt-3">{t('notifications.installButton')}</button>
            <InstallAppModal open={open} onClose={() => setOpen(false)} />
        </div>
    );
}

export default function NotificationsPage() {
    const { t } = useT();
    const { items, unread, markRead, markAllRead, remove, clearAll } = useNotifications();
    const [tab, setTab] = useState('all');

    useEffect(() => {
        if (window.location.hash === '#settings') {
            setTimeout(() => document.getElementById('settings')?.scrollIntoView({ behavior: 'smooth' }), 300);
        }
    }, []);

    const shown = tab === 'unread' ? items.filter(n => !n.read) : items;

    return (
        <PageShell eyebrow="GameDataHub" title={t('notifications.title')} subtitle={t('notifications.subtitle')}>
            <RequireLogin message={t('notifications.loginText')}>
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
                    <section className="min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                            <Tabs
                                value={tab}
                                onChange={setTab}
                                tabs={[{ id: 'all', label: t('notifications.all'), count: items.length }, { id: 'unread', label: t('notifications.unread'), count: unread }]}
                            />
                            <div className="flex gap-2">
                                {unread > 0 && <button onClick={markAllRead} className="gh-btn gh-btn-secondary !h-9">{t('notifications.markAllRead')}</button>}
                                {items.length > 0 && <button onClick={clearAll} className="gh-btn gh-btn-secondary !h-9">{t('notifications.clearAll')}</button>}
                            </div>
                        </div>
                        {shown.length === 0 ? (
                            <EmptyState icon={BsBell} title={t('notifications.empty')} text={t('notifications.emptyHint')} />
                        ) : (
                            <div className="gh-surface p-2 space-y-0.5">
                                {shown.map(item => (
                                    <NotificationItem key={item.id} item={item} onOpen={n => !n.read && markRead(n.id)} onRemove={remove} />
                                ))}
                            </div>
                        )}
                    </section>

                    <aside id="settings" className="min-w-0 flex flex-col gap-4 scroll-mt-24">
                        <h2 className="gh-section-title !mb-0">{t('notifications.settingsTitle')}</h2>
                        <DeviceSettings />
                        <TypeSettings />
                        <InstallCard />
                    </aside>
                </div>
            </RequireLogin>
        </PageShell>
    );
}
