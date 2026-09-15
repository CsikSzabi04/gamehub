import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BsArrowRight, BsDownload } from 'react-icons/bs';
import { PageShell } from '../community/ui.jsx';
import { COMMUNITY_GROUPS } from '../community/links.js';
import { useT } from '../i18n/index.jsx';
import EnablePushPrompt from '../notifications/EnablePushPrompt.jsx';
import InstallAppModal from '../pwa/InstallAppModal.jsx';
import { useInstall } from '../pwa/install.js';

export default function CommunityPage() {
    const { t } = useT();
    const { installed } = useInstall();
    const [installOpen, setInstallOpen] = useState(false);

    return (
        <PageShell
            eyebrow={t('nav.community')}
            title={t('nav.communityTitle')}
            subtitle={t('nav.communitySubtitle')}
            actions={!installed && (
                <button onClick={() => setInstallOpen(true)} className="gh-btn gh-btn-primary !h-10">
                    <BsDownload /> {t('nav.installApp')}
                </button>
            )}
        >
            <div className="mb-8"><EnablePushPrompt /></div>
            <div className="space-y-10">
                {COMMUNITY_GROUPS.map(group => (
                    <section key={group.id}>
                        <h2 className="gh-section-title mb-4">{t(`nav.groups.${group.id}`)}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {group.links.map(link => {
                                const Icon = link.icon;
                                return (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        className="group flex items-center gap-4 rounded-xl bg-[#111319] border border-white/[0.06] p-4 hover:border-white/[0.16] hover:bg-[#171a22] transition-colors"
                                    >
                                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#8b5cf6]/10 text-[#c4b5fd]">
                                            <Icon className="h-5 w-5" aria-hidden="true" />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block text-sm font-semibold text-white">{t(`nav.links.${link.key}`)}</span>
                                            <span className="block text-xs text-[#8a8f9c] mt-0.5">{t(`nav.hints.${link.key}`)}</span>
                                        </span>
                                        <BsArrowRight className="h-4 w-4 shrink-0 text-[#6b7080] group-hover:text-white transition-colors" aria-hidden="true" />
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                ))}
            </div>
            <InstallAppModal open={installOpen} onClose={() => setInstallOpen(false)} />
        </PageShell>
    );
}
