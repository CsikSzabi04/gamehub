// PC specs helpers shared by PcSpecsForm, CanIRunIt and the profile screen.
//
//   specs shape: { cpu: string, gpu: string, ramGb: number | null, os: '' | 'windows11' | 'windows10' | 'windowsOld' | 'macos' | 'linux' | 'steamos' }
//   stored in users/{uid}.pcSpecs (signed in) or localStorage 'gdh-pc-specs' (signed out)
import { OS_OPTIONS } from './parseRequirements.js';

export const EMPTY_SPECS = { cpu: '', gpu: '', ramGb: null, os: '' };
export const LOCAL_SPECS_KEY = 'gdh-pc-specs';

/** Trimmed, size-limited copy that is safe to store. */
export function sanitizeSpecs(value) {
    const text = v => String(v || '').replace(/\s+/g, ' ').trim().slice(0, 80).trim();
    const ram = Number(value?.ramGb);
    return {
        cpu: text(value?.cpu),
        gpu: text(value?.gpu),
        ramGb: Number.isFinite(ram) && ram > 0 && ram <= 1024 ? ram : null,
        os: OS_OPTIONS.includes(value?.os) ? value.os : '',
    };
}

/** True when there is something to compare (GPU, CPU or RAM). */
export const hasSpecs = specs => Boolean(specs && (specs.gpu || specs.cpu || specs.ramGb));

export function readLocalSpecs() {
    try {
        const raw = localStorage.getItem(LOCAL_SPECS_KEY);
        return raw ? sanitizeSpecs(JSON.parse(raw)) : null;
    } catch {
        return null;
    }
}

export function writeLocalSpecs(specs) {
    try {
        localStorage.setItem(LOCAL_SPECS_KEY, JSON.stringify(sanitizeSpecs(specs)));
    } catch {
        // storage unavailable
    }
}
