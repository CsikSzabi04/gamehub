// "Can I run it?" – compares the user's PC (users/{uid}.pcSpecs or localStorage) with the game's requirements.
import { useCallback, useContext, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    BsCheckCircleFill, BsCpu, BsDisplay, BsExclamationTriangleFill, BsGpuCard, BsMemory, BsPcDisplay,
    BsPencil, BsQuestionCircleFill, BsXCircleFill,
} from 'react-icons/bs';
import { UserContext } from '../Features/UserContext.jsx';
import { Modal } from '../community/ui.jsx';
import { useT } from '../i18n/index.jsx';
import { firestore } from '../lib/firebase.js';
import PcSpecsForm from '../hardware/PcSpecsForm.jsx';
import { checkRequirements, parseRequirements } from '../hardware/parseRequirements.js';
import { EMPTY_SPECS, hasSpecs, readLocalSpecs, sanitizeSpecs, writeLocalSpecs } from '../hardware/specs.js';

const STATUS_META = {
    rec: { icon: BsCheckCircleFill, color: 'text-emerald-400' },
    ok: { icon: BsCheckCircleFill, color: 'text-emerald-400' },
    min: { icon: BsExclamationTriangleFill, color: 'text-amber-400' },
    below: { icon: BsXCircleFill, color: 'text-red-400' },
    unknown: { icon: BsQuestionCircleFill, color: 'text-[#6b7080]' },
};

const OVERALL_META = {
    great: { status: 'rec', ring: 'border-emerald-500/30 bg-emerald-500/[0.06]' },
    min: { status: 'min', ring: 'border-amber-500/30 bg-amber-500/[0.06]' },
    below: { status: 'below', ring: 'border-red-500/30 bg-red-500/[0.06]' },
    partial: { status: 'ok', ring: 'border-emerald-500/20 bg-emerald-500/[0.04]' },
    unknown: { status: 'unknown', ring: 'border-white/[0.08] bg-white/[0.02]' },
};

const ROW_ICONS = { cpu: BsCpu, gpu: BsGpuCard, ram: BsMemory, os: BsDisplay };

function candidatesText(list, t) {
    if (!list?.length) return null;
    return list.map(c => (c.approx ? `${c.name} (${t('hardware.check.estimated')})` : c.name)).join(' / ');
}

function specsSummary(specs, t) {
    return [
        specs.gpu,
        specs.cpu,
        specs.ramGb ? t('hardware.check.gb', { value: specs.ramGb }) : null,
        specs.os ? t(`hardware.form.osNames.${specs.os}`) : null,
    ].filter(Boolean).join(' · ');
}

function RequirementValue({ row, which }) {
    const { t } = useT();
    const value = row[which];
    let text;
    if (row.key === 'ram') text = value ? t('hardware.check.gb', { value }) : null;
    else if (row.key === 'os') text = value || null;
    else text = candidatesText(value, t);
    return <span className="text-[#c9ccd4]">{text || t('hardware.check.notListed')}</span>;
}

function VerdictRow({ row, platforms }) {
    const { t } = useT();
    const meta = STATUS_META[row.status] || STATUS_META.unknown;
    const StatusIcon = meta.icon;
    const RowIcon = ROW_ICONS[row.key];

    let userText;
    if (row.key === 'ram') userText = row.user ? t('hardware.check.gb', { value: row.user }) : null;
    else if (row.key === 'os') userText = row.user ? t(`hardware.form.osNames.${row.user}`) : null;
    else userText = row.user;

    let osNote = null;
    if (row.key === 'os' && platforms) {
        if (row.user === 'macos' && !platforms.mac) osNote = t('hardware.check.macNotSupported');
        if ((row.user === 'linux' || row.user === 'steamos') && !platforms.linux) osNote = t('hardware.check.linuxProton');
    }

    return (
        <li className="py-3 flex gap-3">
            <RowIcon className="mt-0.5 w-4 h-4 shrink-0 text-[#6b7080]" aria-hidden="true" />
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                    <span className="gh-eyebrow">{t(`hardware.check.rows.${row.key}`)}</span>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${meta.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" aria-hidden="true" />
                        {t(`hardware.check.status.${row.status}`)}
                    </span>
                </div>
                <p className="mt-1 text-sm text-white break-words">
                    {userText || <span className="text-[#6b7080]">{t('hardware.check.notSet')}</span>}
                </p>
                {osNote && <p className="mt-0.5 text-xs text-amber-300/90">{osNote}</p>}
                {row.key !== 'os' && (
                    <div className="mt-1 text-xs text-[#8a8f9c] space-y-0.5 break-words">
                        <p><span className="text-[#6b7080]">{t('hardware.check.minimum')}:</span> <RequirementValue row={row} which="minimum" /></p>
                        {(row.recommended?.length > 0 || (row.key === 'ram' && row.recommended)) && (
                            <p><span className="text-[#6b7080]">{t('hardware.check.recommended')}:</span> <RequirementValue row={row} which="recommended" /></p>
                        )}
                    </div>
                )}
            </div>
        </li>
    );
}

export default function CanIRunIt({ game }) {
    const { t } = useT();
    const { user, profile, setProfile } = useContext(UserContext) || {};
    const requirements = game?.requirements;

    const [localSpecs, setLocalSpecs] = useState(readLocalSpecs);
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState(EMPTY_SPECS);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [savedToProfile, setSavedToProfile] = useState(false);

    const rawProfileSpecs = profile?.pcSpecs;
    const profileSpecs = useMemo(() => (hasSpecs(rawProfileSpecs) ? sanitizeSpecs(rawProfileSpecs) : null), [rawProfileSpecs]);
    const specs = (user && profileSpecs) || localSpecs;
    const usingLocal = !(user && profileSpecs) && hasSpecs(localSpecs);
    const platforms = game?.steam?.platforms || null;

    // The section is always shown; a verdict needs requirements that name parts we can compare
    const comparable = useMemo(() => {
        if (!requirements?.minimum && !requirements?.recommended) return false;
        return [requirements.minimum, requirements.recommended].some(html => {
            const parsed = parseRequirements(html);
            return parsed.cpu.length > 0 || parsed.gpu.length > 0 || parsed.ramGb;
        });
    }, [requirements]);

    const result = useMemo(
        () => (comparable && hasSpecs(specs) ? checkRequirements(specs, requirements, platforms) : null),
        [comparable, specs, requirements, platforms],
    );

    const closeModal = useCallback(() => setOpen(false), []);

    if (!game) return null;
    const specsSet = hasSpecs(specs);
    const hasRequirements = Boolean(requirements?.minimum || requirements?.recommended);
    const pending = !hasRequirements && Boolean(game.requirementsPending);

    const openModal = () => {
        setDraft(specs ? { ...EMPTY_SPECS, ...specs } : EMPTY_SPECS);
        setError(null);
        setOpen(true);
    };

    const saveToProfile = async value => {
        const clean = sanitizeSpecs(value);
        const { db, doc, setDoc } = await firestore();
        await setDoc(doc(db, 'users', user.uid), { pcSpecs: clean }, { merge: true });
        setProfile?.(prev => ({ ...(prev || {}), pcSpecs: clean }));
        return clean;
    };

    const save = async () => {
        const clean = sanitizeSpecs(draft);
        if (!hasSpecs(clean)) {
            setError(t('hardware.check.empty'));
            return;
        }
        setSaving(true);
        setError(null);
        try {
            writeLocalSpecs(clean);
            setLocalSpecs(clean);
            if (user) await saveToProfile(clean);
            setOpen(false);
        } catch (err) {
            console.error('Saving PC specs failed:', err);
            setError(t('hardware.check.saveError'));
        } finally {
            setSaving(false);
        }
    };

    const promoteLocal = async () => {
        setSaving(true);
        try {
            await saveToProfile(localSpecs);
            setSavedToProfile(true);
        } catch (err) {
            console.error('Saving PC specs failed:', err);
        } finally {
            setSaving(false);
        }
    };

    const overallMeta = result ? OVERALL_META[result.overall] || OVERALL_META.unknown : null;
    const OverallIcon = overallMeta ? STATUS_META[overallMeta.status].icon : null;

    return (
        <section>
            <div className="flex items-center justify-between gap-3 mb-3">
                <h3 className="gh-section-title">{t('hardware.check.title')}</h3>
                {specsSet && (
                    <button type="button" onClick={openModal} className="gh-btn gh-btn-secondary !h-9 !px-3 text-xs shrink-0">
                        <BsPencil className="w-3.5 h-3.5" aria-hidden="true" />
                        {t('hardware.check.editSpecs')}
                    </button>
                )}
            </div>

            {pending ? (
                <div className="gh-surface h-[92px] animate-pulse" aria-busy="true" aria-label={t('hardware.check.loading')} />
            ) : !comparable ? (
                <div className="gh-surface p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex gap-3 min-w-0 flex-1">
                            <span className="w-10 h-10 rounded-xl bg-white/[0.05] text-[#a1a6b3] grid place-items-center shrink-0">
                                <BsQuestionCircleFill className="w-5 h-5" aria-hidden="true" />
                            </span>
                            <div className="min-w-0">
                                <p className="font-semibold text-white">
                                    {t(hasRequirements ? 'hardware.check.unreadableTitle' : 'hardware.check.noRequirementsTitle')}
                                </p>
                                <p className="text-sm text-[#a1a6b3] mt-0.5">
                                    {t(hasRequirements ? 'hardware.check.unreadableText' : 'hardware.check.noRequirementsText')}
                                </p>
                            </div>
                        </div>
                        {!specsSet && (
                            <button type="button" onClick={openModal} className="gh-btn gh-btn-secondary !h-11 w-full sm:w-auto shrink-0">
                                {t('hardware.check.ctaButton')}
                            </button>
                        )}
                    </div>
                    {specsSet && (
                        <p className="mt-3 pt-3 border-t border-white/[0.06] text-xs text-[#8a8f9c] break-words">
                            <span className="text-[#6b7080]">{t('hardware.check.you')}:</span>{' '}
                            <span className="text-[#c9ccd4]">{specsSummary(specs, t)}</span>
                        </p>
                    )}
                </div>
            ) : result ? (
                <div className="gh-surface p-4 sm:p-5">
                    <div className={`flex gap-3 rounded-xl border p-3 sm:p-4 ${overallMeta.ring}`}>
                        <OverallIcon className={`mt-0.5 w-5 h-5 shrink-0 ${STATUS_META[overallMeta.status].color}`} aria-hidden="true" />
                        <div className="min-w-0">
                            <p className="font-semibold text-white">{t(`hardware.check.overall.${result.overall}`)}</p>
                            <p className="text-sm text-[#a1a6b3] mt-0.5">{t(`hardware.check.overall.${result.overall}Text`)}</p>
                        </div>
                    </div>
                    <ul className="mt-2 divide-y divide-white/[0.06]">
                        {result.rows.map(row => <VerdictRow key={row.key} row={row} platforms={platforms} />)}
                    </ul>
                    {usingLocal && (
                        <div className="mt-2 pt-3 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-2 text-xs text-[#8a8f9c]">
                            {user ? (
                                savedToProfile ? (
                                    <span className="text-emerald-400">{t('hardware.check.savedToProfile')}</span>
                                ) : (
                                    <>
                                        <span>{t('hardware.check.localNotice')}</span>
                                        <button type="button" onClick={promoteLocal} disabled={saving} className="font-semibold text-[#c4b5fd] hover:text-white">
                                            {saving ? t('hardware.check.saving') : t('hardware.check.saveToProfile')}
                                        </button>
                                    </>
                                )
                            ) : (
                                <>
                                    <span>{t('hardware.check.loginHint')}</span>
                                    <Link to="/login" className="font-semibold text-[#c4b5fd] hover:text-white">{t('communityUi.login')}</Link>
                                </>
                            )}
                        </div>
                    )}
                    <p className="mt-3 text-[11px] leading-relaxed text-[#6b7080]">{t('hardware.check.disclaimer')}</p>
                </div>
            ) : (
                <div className="gh-surface p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex gap-3 min-w-0 flex-1">
                        <span className="w-10 h-10 rounded-xl bg-[#8b5cf6]/15 text-[#c4b5fd] grid place-items-center shrink-0">
                            <BsPcDisplay className="w-5 h-5" aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                            <p className="font-semibold text-white">{t('hardware.check.ctaTitle')}</p>
                            <p className="text-sm text-[#a1a6b3] mt-0.5">{t('hardware.check.ctaText')}</p>
                        </div>
                    </div>
                    <button type="button" onClick={openModal} className="gh-btn gh-btn-primary !h-11 w-full sm:w-auto shrink-0">
                        {t('hardware.check.ctaButton')}
                    </button>
                </div>
            )}

            <Modal open={open} onClose={closeModal} title={t('hardware.check.modalTitle')} subtitle={t('hardware.check.modalSubtitle')}>
                <PcSpecsForm value={draft} onChange={setDraft} />
                {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
                {!user && <p className="mt-4 text-xs text-[#8a8f9c]">{t('hardware.check.loginHint')}</p>}
                <div className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                    <button type="button" onClick={closeModal} className="gh-btn gh-btn-secondary w-full sm:w-auto">{t('common.cancel')}</button>
                    <button type="button" onClick={save} disabled={saving} className="gh-btn gh-btn-primary w-full sm:w-auto">
                        {saving ? t('hardware.check.saving') : user ? t('hardware.check.save') : t('hardware.check.saveLocal')}
                    </button>
                </div>
            </Modal>
        </section>
    );
}
