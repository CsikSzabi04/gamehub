/* eslint-disable react/prop-types */
import { useContext, useEffect, useState } from 'react';
import { BsClipboard, BsFlag, BsShare, BsTrash } from 'react-icons/bs';
import { UserContext } from '../Features/UserContext.jsx';
import { Field, Modal, RequireLogin, Spinner, inputClass } from '../community/ui.jsx';
import { API_BASE, cachedFetch } from '../Components/apiCache.js';
import { toDate } from '../lib/firebase.js';
import { useT } from '../i18n/index.jsx';
import PerkDiamond from './PerkDiamond.jsx';
import { AuthorLink, LikeButton } from './BuildCard.jsx';
import { REPORT_REASONS, reportBuild } from './buildsApi.js';

function PerkInfo({ perk, role }) {
    const { t } = useT();
    const [state, setState] = useState({ loading: true, data: null });

    useEffect(() => {
        let cancelled = false;
        setState({ loading: true, data: null });
        const path = role === 'killer' ? 'perksK' : 'perksS';
        cachedFetch(`${API_BASE}/${path}/${encodeURIComponent(perk.name)}`, { maxAge: 7 * 24 * 60 * 60 * 1000 })
            .then(data => { if (!cancelled) setState({ loading: false, data }); })
            .catch(() => { if (!cancelled) setState({ loading: false, data: null }); });
        return () => { cancelled = true; };
    }, [perk.name, role]);

    return (
        <div className="rounded-xl bg-[#0a0b0f] border border-white/[0.06] p-3 mt-3">
            <p className="font-semibold text-white">{perk.name}</p>
            {state.data?.survivorName || state.data?.killerName ? (
                <p className="text-xs text-[#6b7080] mt-0.5">
                    {['All', 'all'].includes(state.data.survivorName || state.data.killerName) ? t('builds.generalPerk') : t('builds.perkOf', { name: state.data.survivorName || state.data.killerName })}
                </p>
            ) : null}
            {state.loading ? (
                <Spinner className="py-4" />
            ) : state.data?.description ? (
                <p className="text-sm text-[#a1a6b3] mt-2 whitespace-pre-line leading-relaxed">{state.data.description}</p>
            ) : (
                <p className="text-sm text-[#6b7080] mt-2">{t('builds.perkInfoMissing')}</p>
            )}
        </div>
    );
}

function ReportForm({ buildId, onDone }) {
    const { t } = useT();
    const { user } = useContext(UserContext) || {};
    const [reason, setReason] = useState(REPORT_REASONS[0]);
    const [details, setDetails] = useState('');
    const [status, setStatus] = useState(null); // 'sending' | 'sent' | 'error'

    async function submit(e) {
        e.preventDefault();
        setStatus('sending');
        try {
            await reportBuild(user.uid, buildId, `${reason}${details.trim() ? `: ${details.trim()}` : ''}`);
            setStatus('sent');
        } catch (error) {
            console.error('Could not report build:', error);
            setStatus('error');
        }
    }

    if (status === 'sent') {
        return (
            <div className="text-center py-4">
                <p className="text-white font-semibold">{t('builds.reportSent')}</p>
                <button type="button" onClick={onDone} className="gh-btn gh-btn-secondary mt-4">{t('builds.close')}</button>
            </div>
        );
    }

    return (
        <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
                {REPORT_REASONS.map(r => (
                    <button key={r} type="button" onClick={() => setReason(r)} className={`h-10 rounded-lg text-sm font-medium border ${reason === r ? 'bg-white text-[#0a0b0f] border-transparent' : 'bg-white/[0.04] text-[#c9ccd4] border-white/[0.08]'}`}>
                        {t(`builds.reportReasons.${r}`)}
                    </button>
                ))}
            </div>
            <Field label={t('builds.reportDetails')}>
                <input value={details} onChange={e => setDetails(e.target.value.slice(0, 200))} maxLength={200} className={inputClass} />
            </Field>
            {status === 'error' && <p className="text-sm text-[#fca5a5]">{t('builds.reportError')}</p>}
            <button type="submit" disabled={status === 'sending'} className="gh-btn gh-btn-danger w-full">{t('builds.sendReport')}</button>
        </form>
    );
}

export default function BuildDetail({ build, loading, open, onClose, liked, likeBusy, onLike, onShare, onCopy, onDelete }) {
    const { t, locale } = useT();
    const { user } = useContext(UserContext) || {};
    const [activePerk, setActivePerk] = useState(null);
    const [reportOpen, setReportOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        setActivePerk(null);
        setReportOpen(false);
    }, [build?.id]);

    const isOwner = Boolean(user && build && user.uid === build.uid);
    const created = toDate(build?.createdAt);

    async function remove() {
        if (!window.confirm(t('builds.deleteConfirm'))) return;
        setDeleting(true);
        try {
            await onDelete(build);
        } finally {
            setDeleting(false);
        }
    }

    return (
        <>
            <Modal
                open={open && !reportOpen}
                onClose={onClose}
                title={build?.title || t('builds.buildTitle')}
                subtitle={build ? `${t(`builds.role.${build.role}`)}${build.character ? ` · ${build.character}` : ''}` : null}
            >
                {!build ? (
                    loading ? <Spinner /> : <p className="text-sm text-[#a1a6b3] text-center py-6">{t('builds.notFound')}</p>
                ) : (
                    <div>
                        <div className="flex justify-between sm:justify-center sm:gap-4 px-1">
                            {(build.perks || []).map(perk => (
                                <button key={perk.name} type="button" onClick={() => setActivePerk(activePerk?.name === perk.name ? null : perk)} aria-label={perk.name} className="flex flex-col items-center gap-1 w-[72px]">
                                    <PerkDiamond perk={perk} role={build.role} size={72} selected={activePerk?.name === perk.name} />
                                    <span className="text-[10px] leading-tight text-center text-[#c9ccd4] line-clamp-2">{perk.name}</span>
                                </button>
                            ))}
                        </div>
                        {activePerk ? <PerkInfo perk={activePerk} role={build.role} /> : <p className="text-xs text-[#6b7080] text-center mt-2">{t('builds.tapPerk')}</p>}

                        {build.description && <p className="text-sm text-[#c9ccd4] mt-4 whitespace-pre-line break-words leading-relaxed">{build.description}</p>}

                        {build.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                                {build.tags.map(tag => <span key={tag} className="text-xs px-2 py-0.5 rounded-md bg-white/[0.05] text-[#a1a6b3]">#{t(`builds.tags.${tag}`)}</span>)}
                            </div>
                        )}

                        <p className="text-xs text-[#6b7080] mt-4">
                            {t('builds.by')} <AuthorLink build={build} className="text-[#c4b5fd]" />
                            {created ? ` · ${created.toLocaleDateString(locale)}` : ''}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-white/[0.06]">
                            <LikeButton liked={liked} count={build.likeCount} busy={likeBusy} onClick={onLike} />
                            <button type="button" onClick={onShare} className="gh-btn gh-btn-secondary !h-9"><BsShare className="w-4 h-4" /> {t('builds.shareLink')}</button>
                            <button type="button" onClick={onCopy} className="gh-btn gh-btn-secondary !h-9"><BsClipboard className="w-4 h-4" /> {t('builds.copyText')}</button>
                            <span className="flex-1" />
                            {isOwner ? (
                                <button type="button" onClick={remove} disabled={deleting} className="gh-btn gh-btn-danger !h-9"><BsTrash className="w-4 h-4" /> {t('builds.delete')}</button>
                            ) : (
                                <button type="button" onClick={() => setReportOpen(true)} className="gh-icon-btn !w-9 !h-9" aria-label={t('builds.report')} title={t('builds.report')}>
                                    <BsFlag className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
            <Modal open={open && reportOpen} onClose={() => setReportOpen(false)} title={t('builds.reportTitle')} subtitle={build?.title}>
                <RequireLogin message={t('builds.loginToReport')}>
                    {build && <ReportForm buildId={build.id} onDone={() => setReportOpen(false)} />}
                </RequireLogin>
            </Modal>
        </>
    );
}
