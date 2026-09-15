// Controlled PC specs form: GPU / CPU (autocomplete from the hardware table), RAM, OS and auto-detect.
//
//   const [specs, setSpecs] = useState({ cpu: '', gpu: '', ramGb: null, os: '' });
//   <PcSpecsForm value={specs} onChange={setSpecs} />
//
// Value shape: { cpu: string, gpu: string, ramGb: number | null, os: '' | 'windows11' | 'windows10' | 'windowsOld' | 'macos' | 'linux' | 'steamos' }
import { useId, useState } from 'react';
import { BsCheckCircleFill, BsExclamationCircle, BsMagic } from 'react-icons/bs';
import { Field, inputClass } from '../community/ui.jsx';
import { useT } from '../i18n/index.jsx';
import { CPU_NAMES, GPU_NAMES, matchCpu, matchGpu } from './hardwareData.js';
import { detectHardware } from './detectHardware.js';
import { OS_OPTIONS } from './parseRequirements.js';
import { EMPTY_SPECS } from './specs.js';

const RAM_OPTIONS = [2, 4, 6, 8, 12, 16, 24, 32, 48, 64, 96, 128];

function MatchHint({ text, match }) {
    const { t } = useT();
    if (!String(text || '').trim()) return null;
    return match ? (
        <span className="mt-1 flex items-center gap-1.5 text-xs text-emerald-400/90">
            <BsCheckCircleFill className="w-3 h-3 shrink-0" aria-hidden="true" />
            <span className="truncate">{t('hardware.form.recognized', { name: match.name })}</span>
        </span>
    ) : (
        <span className="mt-1 flex items-center gap-1.5 text-xs text-amber-400/90">
            <BsExclamationCircle className="w-3 h-3 shrink-0" aria-hidden="true" />
            <span>{t('hardware.form.notRecognized')}</span>
        </span>
    );
}

export default function PcSpecsForm({ value, onChange }) {
    const { t } = useT();
    const id = useId();
    const specs = { ...EMPTY_SPECS, ...(value || {}) };
    const [detecting, setDetecting] = useState(false);
    const [notes, setNotes] = useState([]);

    const set = patch => onChange?.({ ...specs, ...patch });
    const gpuMatch = specs.gpu ? matchGpu(specs.gpu) : null;
    const cpuMatch = specs.cpu ? matchCpu(specs.cpu) : null;

    const detect = async () => {
        setDetecting(true);
        try {
            const found = await detectHardware();
            const patch = {};
            const lines = [];
            if (found.mobile) lines.push(t('hardware.form.detectMobile'));
            if (!found.mobile) {
                if (found.gpu) {
                    patch.gpu = found.gpu;
                    lines.push(t('hardware.form.detectedGpu', { name: found.gpu }));
                } else {
                    lines.push(t('hardware.form.detectNoGpu'));
                }
                if (found.ramGb && !specs.ramGb) {
                    patch.ramGb = RAM_OPTIONS.find(r => r >= found.ramGb) || found.ramGb;
                }
                if (found.ramGb) {
                    lines.push(t(found.ramIsLowerBound ? 'hardware.form.detectRamLowerBound' : 'hardware.form.detectRam', { value: found.ramGb }));
                }
                if (found.os && !specs.os) patch.os = found.os;
                if (!specs.cpu) lines.push(t('hardware.form.detectCpu', { count: found.threads || '?' }));
            }
            setNotes(lines);
            if (Object.keys(patch).length) set(patch);
        } finally {
            setDetecting(false);
        }
    };

    return (
        <div className="space-y-4">
            <button type="button" onClick={detect} disabled={detecting} className="gh-btn gh-btn-secondary w-full sm:w-auto">
                <BsMagic className="w-4 h-4" aria-hidden="true" />
                {detecting ? t('hardware.form.detecting') : t('hardware.form.detect')}
            </button>
            {notes.length > 0 && (
                <ul className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3 space-y-1 text-xs text-[#a1a6b3]" aria-live="polite">
                    {notes.map(note => <li key={note}>{note}</li>)}
                </ul>
            )}

            <div>
                <Field label={t('hardware.form.gpu')}>
                    <input
                        type="text"
                        list={`${id}-gpus`}
                        value={specs.gpu}
                        maxLength={80}
                        autoComplete="off"
                        placeholder={t('hardware.form.gpuPlaceholder')}
                        onChange={e => set({ gpu: e.target.value })}
                        className={inputClass}
                    />
                </Field>
                <MatchHint text={specs.gpu} match={gpuMatch} />
                <datalist id={`${id}-gpus`}>
                    {GPU_NAMES.map(name => <option key={name} value={name} />)}
                </datalist>
            </div>

            <div>
                <Field label={t('hardware.form.cpu')}>
                    <input
                        type="text"
                        list={`${id}-cpus`}
                        value={specs.cpu}
                        maxLength={80}
                        autoComplete="off"
                        placeholder={t('hardware.form.cpuPlaceholder')}
                        onChange={e => set({ cpu: e.target.value })}
                        className={inputClass}
                    />
                </Field>
                <MatchHint text={specs.cpu} match={cpuMatch} />
                <datalist id={`${id}-cpus`}>
                    {CPU_NAMES.map(name => <option key={name} value={name} />)}
                </datalist>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label={t('hardware.form.ram')}>
                    <select
                        value={specs.ramGb ?? ''}
                        onChange={e => set({ ramGb: e.target.value ? Number(e.target.value) : null })}
                        className={inputClass}
                    >
                        <option value="">{t('hardware.form.ramUnknown')}</option>
                        {[...new Set([...RAM_OPTIONS, ...(specs.ramGb ? [specs.ramGb] : [])])].sort((a, b) => a - b).map(gb => (
                            <option key={gb} value={gb}>{t('hardware.form.ramOption', { value: gb })}</option>
                        ))}
                    </select>
                </Field>
                <Field label={t('hardware.form.os')}>
                    <select value={specs.os || ''} onChange={e => set({ os: e.target.value })} className={inputClass}>
                        <option value="">{t('hardware.form.osUnknown')}</option>
                        {OS_OPTIONS.map(os => <option key={os} value={os}>{t(`hardware.form.osNames.${os}`)}</option>)}
                    </select>
                </Field>
            </div>
            <p className="text-xs text-[#6b7080]">{t('hardware.form.hint')}</p>
        </div>
    );
}
