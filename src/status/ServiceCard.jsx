// One service on the /status page: status, notices, player reports, follow + report buttons.
/* eslint-disable react/prop-types */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BsBell, BsBellFill, BsBoxArrowUpRight, BsChevronDown, BsExclamationCircle } from 'react-icons/bs';
import { useT } from '../i18n/index.jsx';
import { BUCKETS, statusStyle } from './statusApi.js';

const ISSUE = new Set(['degraded', 'partial_outage', 'major_outage']);

export function StatusDot({ status, className = '' }) {
    const style = statusStyle(status);
    const pulsing = ISSUE.has(status);
    return (
        <span className={`relative inline-flex h-2.5 w-2.5 shrink-0 ${className}`} aria-hidden="true">
            {pulsing && <span className="absolute inset-0 rounded-full animate-ping opacity-60" style={{ background: style.dot }} />}
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ background: style.dot }} />
        </span>
    );
}

function Sparkline({ buckets }) {
    const max = Math.max(1, ...buckets);
    const width = BUCKETS * 6;
    return (
        <svg width={width} height="18" viewBox={`0 0 ${width} 18`} className="shrink-0" aria-hidden="true">
            {buckets.map((value, i) => {
                const height = value ? Math.max(3, Math.round((value / max) * 18)) : 1.5;
                return (
                    <rect
                        key={i}
                        x={i * 6}
                        y={18 - height}
                        width="4"
                        height={height}
                        rx="1"
                        fill={value ? (max >= 5 ? '#f87171' : '#a78bfa') : 'rgba(255,255,255,0.12)'}
                    />
                );
            })}
        </svg>
    );
}

function IncidentList({ service }) {
    const { t, locale } = useT();
    const components = (service.components || []).filter(c => c.latencyMs != null || c.status !== 'operational');
    return (
        <div className="mt-3 space-y-2">
            {service.incidents.map((incident, i) => {
                const date = incident.updatedAt ? new Date(incident.updatedAt) : null;
                const statusLabel = t(`status.incidentStatus.${incident.status}`);
                return (
                    <div key={`${incident.name}-${i}`} className="rounded-lg bg-[#0a0b0f]/60 border border-white/[0.05] p-2.5">
                        <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium text-[#eceef2] min-w-0 break-words">{incident.name}</p>
                            {incident.status && (
                                <span className="shrink-0 rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[11px] text-[#c9ccd4]">
                                    {statusLabel.startsWith('status.') ? incident.status : statusLabel}
                                </span>
                            )}
                        </div>
                        {(incident.period || (date && !Number.isNaN(date.getTime()))) && (
                            <p className="mt-1 text-[11px] text-[#6b7080]">
                                {incident.period || date.toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' })}
                            </p>
                        )}
                        {incident.detail && <p className="mt-1.5 text-xs text-[#a1a6b3] line-clamp-4 break-words">{incident.detail}</p>}
                        {incident.url && (
                            <a href={incident.url} target="_blank" rel="noopener noreferrer" className="mt-1.5 inline-flex items-center gap-1 text-xs text-[#c4b5fd] hover:text-white">
                                {t('status.officialPage')} <BsBoxArrowUpRight className="w-2.5 h-2.5" aria-hidden="true" />
                            </a>
                        )}
                    </div>
                );
            })}
            {components.length > 0 && (
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6b7080] mb-1.5">{t('status.components')}</p>
                    <ul className="flex flex-wrap gap-1.5">
                        {components.map(component => (
                            <li key={component.name} className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.04] px-2 py-1 text-xs text-[#c9ccd4]">
                                <StatusDot status={component.status} className="scale-75" />
                                {component.name}
                                {component.latencyMs != null && <span className="text-[#6b7080]">{t('status.latency', { ms: component.latencyMs })}</span>}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

/**
 * @param {{ service: object, reports?: { count, buckets, lastMine }, user, following: boolean,
 *   onReport: (id) => Promise<string>, onFollow: (id, follow) => Promise<void> }} props
 */
export default function ServiceCard({ service, reports, user, following, onReport, onFollow }) {
    const { t } = useT();
    const [open, setOpen] = useState(false);
    const [reportState, setReportState] = useState(null); // 'busy' | 'ok' | 'cooldown' | 'error'
    const [followBusy, setFollowBusy] = useState(false);
    const [followError, setFollowError] = useState(false);
    const style = statusStyle(service.status);
    const detailCount = service.incidents?.length || 0;
    const hasSteamLatency = (service.components || []).some(c => c.latencyMs != null);
    const hasDetails = detailCount > 0 || hasSteamLatency || (service.components || []).some(c => c.status !== 'operational');
    const count = reports?.count || 0;

    const report = async () => {
        setReportState('busy');
        try {
            setReportState(await onReport(service.id));
        } catch (error) {
            console.error('Outage report failed:', error);
            setReportState('error');
        }
    };

    const toggleFollow = async () => {
        setFollowBusy(true);
        setFollowError(false);
        try {
            await onFollow(service.id, !following);
        } catch (error) {
            console.error('Follow failed:', error);
            setFollowError(true);
        } finally {
            setFollowBusy(false);
        }
    };

    const reportLabel = {
        ok: t('status.reported'),
        cooldown: t('status.reportWait'),
        error: t('status.reportFailed'),
    }[reportState] || t('status.report');

    return (
        <article className={`rounded-xl bg-[#111319] border ${style.ring} p-4 flex flex-col`}>
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h3 className="text-base font-bold text-white truncate">{service.name}</h3>
                    <p className={`mt-1 flex items-center gap-2 text-sm font-medium ${style.text}`}>
                        <StatusDot status={service.status} />
                        {t(`status.states.${service.status}`)}
                    </p>
                </div>
                {user ? (
                    <button
                        onClick={toggleFollow}
                        disabled={followBusy}
                        aria-pressed={following}
                        className={`shrink-0 inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-60 ${following ? 'bg-[#8b5cf6]/20 text-[#c4b5fd] hover:bg-[#8b5cf6]/30' : 'bg-white/[0.05] text-[#c9ccd4] hover:bg-white/[0.09]'}`}
                    >
                        {following ? <BsBellFill className="w-3.5 h-3.5" aria-hidden="true" /> : <BsBell className="w-3.5 h-3.5" aria-hidden="true" />}
                        {following ? t('status.following') : t('status.follow')}
                    </button>
                ) : (
                    <Link to="/login" className="shrink-0 inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-semibold bg-white/[0.05] text-[#c9ccd4] hover:bg-white/[0.09]">
                        <BsBell className="w-3.5 h-3.5" aria-hidden="true" />
                        {t('status.follow')}
                    </Link>
                )}
            </div>
            {followError && <p className="mt-2 text-xs text-red-400">{t('status.followFailed')}</p>}
            {service.status === 'unknown' && <p className="mt-2 text-xs text-[#6b7080]">{t('status.noData')}</p>}

            {hasDetails && (
                <>
                    <button
                        onClick={() => setOpen(v => !v)}
                        aria-expanded={open}
                        className="mt-3 self-start inline-flex items-center gap-1 text-xs font-medium text-[#a1a6b3] hover:text-white"
                    >
                        {open ? t('status.hideIncidents') : detailCount ? t('status.incidents', { count: detailCount }) : t('status.components')}
                        <BsChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
                    </button>
                    {open && <IncidentList service={service} />}
                </>
            )}

            <div className="mt-auto pt-3">
                <div className="flex items-center justify-between gap-3 border-t border-white/[0.05] pt-3">
                    <p className={`text-xs ${count ? 'text-[#c9ccd4]' : 'text-[#6b7080]'}`}>
                        {count ? t('status.reports', { count }) : t('status.noReports')}
                    </p>
                    <Sparkline buckets={reports?.buckets || new Array(BUCKETS).fill(0)} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                    {user ? (
                        <button
                            onClick={report}
                            disabled={reportState === 'busy' || reportState === 'ok' || reportState === 'cooldown'}
                            className={`flex-1 min-w-[9rem] inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg text-xs font-semibold transition-colors disabled:cursor-default ${reportState === 'ok' ? 'bg-[#22c55e]/15 text-[#86efac]' : reportState === 'error' ? 'bg-red-500/15 text-red-300' : 'bg-white/[0.06] text-[#eceef2] hover:bg-white/[0.1] disabled:opacity-70'}`}
                        >
                            <BsExclamationCircle className="w-3.5 h-3.5" aria-hidden="true" />
                            {reportLabel}
                        </button>
                    ) : (
                        <Link to="/login" className="flex-1 min-w-[9rem] inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg text-xs font-semibold bg-white/[0.06] text-[#c9ccd4] hover:bg-white/[0.1]">
                            <BsExclamationCircle className="w-3.5 h-3.5" aria-hidden="true" />
                            {t('status.reportLogin')}
                        </Link>
                    )}
                    <a
                        href={service.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={t('status.officialPage')}
                        title={t('status.officialPage')}
                        className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-white/[0.04] text-[#a1a6b3] hover:text-white hover:bg-white/[0.09]"
                    >
                        <BsBoxArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </a>
                </div>
            </div>
        </article>
    );
}
