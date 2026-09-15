/* eslint-disable react/prop-types */
// "My PC" on the own profile: CPU / GPU / RAM / OS used by the "Can I run it?" check on game pages.
import { lazy, Suspense, useContext, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaDesktop, FaMemory, FaMicrochip, FaPen } from 'react-icons/fa';
import { BsGpuCard } from 'react-icons/bs';
import { doc, setDoc } from 'firebase/firestore';
import { firestore } from '../../../firebaseConfig';
import { UserContext } from '../../Features/UserContext.jsx';
import { useT } from '../../i18n/index.jsx';
import { matchCpu, matchGpu } from '../../hardware/hardwareData.js';
import { EMPTY_SPECS, hasSpecs, sanitizeSpecs } from '../../hardware/specs.js';

const PcSpecsForm = lazy(() => import('../../hardware/PcSpecsForm.jsx'));

/** Rough class of a PC from the GPU score (PassMark-like scale: GTX 1060 ≈ 10000, RTX 3060 ≈ 17000). */
function pcTier(gpuScore) {
    if (!gpuScore) return null;
    if (gpuScore < 4500) return { key: 'entry', color: '#9ca3af' };
    if (gpuScore < 11000) return { key: 'mid', color: '#38bdf8' };
    if (gpuScore < 20000) return { key: 'high', color: '#a78bfa' };
    return { key: 'top', color: '#f472b6' };
}

function SpecRow({ icon: Icon, label, value, match }) {
    return (
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/5 min-w-0">
            <div className="p-2.5 rounded-xl bg-white/5 text-gray-300 shrink-0"><Icon className="w-4 h-4" /></div>
            <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.12em] text-gray-500">{label}</p>
                <p className="text-sm font-semibold text-white truncate">{value || '–'}</p>
                {match && <p className="text-[11px] text-gray-500 truncate">≈ {match}</p>}
            </div>
        </div>
    );
}

export default function MyPcCard({ Card, SectionTitle, accent, gradient }) {
    const { t } = useT();
    const { user, profile, setProfile } = useContext(UserContext) || {};
    const saved = profile?.pcSpecs;
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(null);
    const [saving, setSaving] = useState(false);

    const gpu = useMemo(() => (saved?.gpu ? matchGpu(saved.gpu) : null), [saved?.gpu]);
    const cpu = useMemo(() => (saved?.cpu ? matchCpu(saved.cpu) : null), [saved?.cpu]);
    const tier = pcTier(gpu?.score);

    const startEdit = () => {
        setDraft(saved || EMPTY_SPECS);
        setEditing(true);
    };

    const save = async () => {
        if (!user?.uid) return;
        setSaving(true);
        const pcSpecs = hasSpecs(draft) ? sanitizeSpecs(draft) : null;
        try {
            await setDoc(doc(firestore, 'users', user.uid), { pcSpecs }, { merge: true });
            setProfile(prev => ({ ...prev, pcSpecs }));
            setEditing(false);
        } catch (error) {
            console.error('Could not save PC specs:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card className="p-6">
            <SectionTitle
                accent={accent}
                action={!editing && hasSpecs(saved) && (
                    <button onClick={startEdit} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white"><FaPen className="w-3 h-3" /> {t('profileExtras.pc.edit')}</button>
                )}
            >
                {t('profileExtras.pcTitle')}
            </SectionTitle>

            {editing ? (
                <div className="space-y-4">
                    <Suspense fallback={<div className="h-40 rounded-2xl bg-white/[0.04] animate-pulse" />}>
                        <PcSpecsForm value={draft} onChange={setDraft} />
                    </Suspense>
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setEditing(false)} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-300 hover:bg-white/5">{t('common.cancel')}</button>
                        <button onClick={save} disabled={saving} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60" style={{ background: gradient }}>
                            {saving ? t('common.saving') : t('common.save')}
                        </button>
                    </div>
                </div>
            ) : hasSpecs(saved) ? (
                <>
                    {tier && (
                        <p className="mb-4 text-sm text-gray-400">
                            {t('profileExtras.pc.tierLabel')}{' '}
                            <span className="font-black uppercase tracking-wide" style={{ color: tier.color }}>{t(`profileExtras.pc.tiers.${tier.key}`)}</span>
                        </p>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <SpecRow icon={FaMicrochip} label={t('profileExtras.pc.cpu')} value={saved.cpu} match={cpu && cpu.name !== saved.cpu ? cpu.name : null} />
                        <SpecRow icon={BsGpuCard} label={t('profileExtras.pc.gpu')} value={saved.gpu} match={gpu && gpu.name !== saved.gpu ? gpu.name : null} />
                        <SpecRow icon={FaMemory} label={t('profileExtras.pc.ram')} value={saved.ramGb ? `${saved.ramGb} GB` : null} />
                        <SpecRow icon={FaDesktop} label={t('profileExtras.pc.os')} value={saved.os ? t(`hardware.form.osNames.${saved.os}`) : null} />
                    </div>
                    <p className="text-xs text-gray-500 mt-4">
                        {t('profileExtras.pc.usedFor')} <Link to="/hub" className="text-violet-300 hover:text-white">{t('profileExtras.pc.browse')}</Link>
                    </p>
                </>
            ) : (
                <div className="text-center py-6 px-4">
                    <FaDesktop className="mx-auto w-10 h-10 text-gray-700 mb-4" />
                    <p className="text-white font-semibold">{t('profileExtras.pc.emptyTitle')}</p>
                    <p className="text-gray-500 text-sm mt-1">{t('profileExtras.pcHint')}</p>
                    <button onClick={startEdit} className="inline-block mt-5 px-5 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: gradient }}>
                        {t('profileExtras.pc.add')}
                    </button>
                </div>
            )}
        </Card>
    );
}
