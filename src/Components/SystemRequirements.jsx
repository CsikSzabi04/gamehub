import React, { useState } from 'react';
import { BsWindows, BsCpu, BsMemory, BsGpuCard, BsDeviceHdd, BsVolumeUp, BsWifi, BsDisplay, BsBadgeVr, BsMotherboard, BsInfoCircle } from 'react-icons/bs';

// Order matters: longer labels first so "Sound Card" wins over "Sound".
const LABELS = [
    ['Additional Notes', 'notes'],
    ['Other requirements', 'notes'],
    ['Partner Requirements', 'notes'],
    ['Hard Disk Space', 'storage'],
    ['Hard Drive', 'storage'],
    ['Sound Card', 'sound'],
    ['Video Card', 'graphics'],
    ['VR Support', 'vr'],
    ['Processor', 'cpu'],
    ['Graphics', 'graphics'],
    ['Storage', 'storage'],
    ['DirectX', 'directx'],
    ['Network', 'network'],
    ['Memory', 'memory'],
    ['Display', 'display'],
    ['Sound', 'sound'],
    ['OS', 'os'],
];

const SPEC_META = {
    os: { label: 'OS', icon: BsWindows },
    cpu: { label: 'Processor', icon: BsCpu },
    memory: { label: 'Memory', icon: BsMemory },
    graphics: { label: 'Graphics', icon: BsGpuCard },
    directx: { label: 'DirectX', icon: BsMotherboard },
    storage: { label: 'Storage', icon: BsDeviceHdd },
    sound: { label: 'Sound', icon: BsVolumeUp },
    network: { label: 'Network', icon: BsWifi },
    display: { label: 'Display', icon: BsDisplay },
    vr: { label: 'VR', icon: BsBadgeVr },
};

const LABEL_REGEX = new RegExp(
    `(${LABELS.map(([l]) => (l === 'OS' ? '(?<![A-Za-z])OS' : l.replace(/ /g, '\\s'))).join('|')})\\s*:`,
    'g'
);

function stripHtml(text) {
    return text
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/?(li|ul|p|div)[^>]*>/gi, '\n')
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
}

function clean(value) {
    return value.replace(/\s+/g, ' ').replace(/^[\s,;:-]+|[\s,;]+$/g, '').trim();
}

export function parseRequirements(raw) {
    if (!raw) return { specs: [], notes: [] };

    const text = stripHtml(raw).replace(/^\s*(minimum|recommended)\s*(requirements)?\s*:?/i, '');
    const matches = [...text.matchAll(LABEL_REGEX)];
    const specs = [];
    const notes = [];

    const intro = clean(matches.length ? text.slice(0, matches[0].index) : text);
    if (intro) notes.push(intro);

    matches.forEach((match, i) => {
        const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
        const value = clean(text.slice(match.index + match[0].length, end));
        if (!value) return;

        const label = match[1].replace(/\s+/g, ' ');
        const key = LABELS.find(([l]) => l.toLowerCase() === label.toLowerCase())?.[1];

        if (key === 'notes') {
            notes.push(value);
        } else if (key) {
            const existing = specs.find(s => s.key === key);
            if (existing) existing.value += `, ${value}`;
            else specs.push({ key, value });
        }
    });

    return { specs, notes };
}

// Two columns when there is room: full width (single card) from sm, or stacked cards
// between md and lg (they sit side by side from lg, where one column fits better).
function SpecList({ specs, layout }) {
    const columns = layout === 'wide'
        ? 'sm:grid-cols-2 sm:gap-x-8'
        : 'md:grid-cols-2 md:gap-x-8 lg:grid-cols-1';
    return (
        // Rows draw a top border; the -1px offset + overflow clip hides the first row's line
        <div className="overflow-hidden">
            <dl className={`-mt-px grid grid-cols-1 ${columns}`}>
            {specs.map(({ key, value }) => {
                const { label, icon: Icon } = SPEC_META[key];
                return (
                    <div key={key} className="flex gap-3 py-3 border-t border-white/[0.06]">
                        <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#6b7080]" aria-hidden="true" />
                        <div className="min-w-0">
                            <dt className="gh-eyebrow mb-0.5">{label}</dt>
                            <dd className="text-sm leading-relaxed text-[#d4d7de] break-words">{value}</dd>
                        </div>
                    </div>
                );
            })}
            </dl>
        </div>
    );
}

function Notes({ notes }) {
    const [open, setOpen] = useState(false);
    const text = notes.join(' ');
    if (!text) return null;

    const isLong = text.length > 180;

    return (
        <div className="mt-4 flex gap-3 rounded-lg bg-white/[0.02] border border-white/[0.05] p-3">
            <BsInfoCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#6b7080]" aria-hidden="true" />
            <div className="min-w-0 text-xs leading-relaxed text-[#8a8f9c]">
                <p className={`text-[#8a8f9c] ${!open && isLong ? 'line-clamp-2' : ''}`}>{text}</p>
                {isLong && (
                    <button
                        type="button"
                        onClick={() => setOpen(o => !o)}
                        className="mt-1.5 font-medium text-[#c4b5fd] hover:text-white transition-colors"
                    >
                        {open ? 'Show less' : 'Show full notes'}
                    </button>
                )}
            </div>
        </div>
    );
}

function RequirementColumn({ title, raw, accent, layout }) {
    const { specs, notes } = parseRequirements(raw);
    if (!specs.length && !notes.length) return null;

    return (
        <div className="gh-surface p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-2">
                <span className={`h-1.5 w-1.5 rounded-full ${accent}`} />
                <h4 className="text-sm font-semibold text-white">{title}</h4>
            </div>
            {specs.length > 0 && <SpecList specs={specs} layout={layout} />}
            <Notes notes={notes} />
        </div>
    );
}

export default function SystemRequirements({ minimum, recommended, platform = 'PC', className = '' }) {
    if (!minimum && !recommended) return null;
    const both = Boolean(minimum && recommended);

    return (
        <div className={className}>
            <div className="flex items-baseline justify-between gap-4 mb-4">
                <h3 className="gh-section-title">System Requirements</h3>
                <span className="gh-chip">{platform}</span>
            </div>
            <div className={`grid gap-4 ${both ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
                {minimum && <RequirementColumn title="Minimum" raw={minimum} accent="bg-[#6b7080]" layout={both ? 'stacked' : 'wide'} />}
                {recommended && <RequirementColumn title="Recommended" raw={recommended} accent="bg-[#8b5cf6]" layout={both ? 'stacked' : 'wide'} />}
            </div>
        </div>
    );
}
