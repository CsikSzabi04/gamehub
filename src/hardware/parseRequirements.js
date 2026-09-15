// Steam/GOG requirement HTML -> comparable hardware requirements, and the "Can I run it?" verdict.
//
//   parseRequirements(html) -> { cpu: [candidates], gpu: [candidates], ramGb, storageGb, os, osVersion, cpuText, gpuText }
//   checkRequirements(specs, { minimum, recommended }, platforms) -> { overall, rows: [...] }
//
// When a line lists alternatives ("GTX 1060 / RX 580") the requirement is met by beating ANY candidate.
import { matchCpus, matchGpus, matchCpu, matchGpu } from './hardwareData.js';

const FIELDS = [
    ['additional notes', 'notes'],
    ['other requirements', 'notes'],
    ['hard disk space', 'storage'],
    ['hard drive', 'storage'],
    ['sound card', 'sound'],
    ['video card', 'gpu'],
    ['vr support', 'other'],
    ['processor', 'cpu'],
    ['graphics', 'gpu'],
    ['storage', 'storage'],
    ['directx', 'other'],
    ['network', 'other'],
    ['memory', 'ram'],
    ['display', 'other'],
    ['sound', 'sound'],
    ['cpu', 'cpu'],
    ['gpu', 'gpu'],
    ['ram', 'ram'],
    ['os', 'os'],
];

const FIELD_REGEX = new RegExp(`(?<![a-z])(${FIELDS.map(([label]) => label.replace(/ /g, '\\s')).join('|')})\\s*\\*?\\s*:`, 'gi');

function stripHtml(html) {
    return String(html || '')
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

const clean = value => value.replace(/\s+/g, ' ').replace(/^[\s,;:-]+|[\s,;]+$/g, '').trim();

function sizeGb(text) {
    const match = /(\d+(?:[.,]\d+)?)\s*(tb|gb|mb)\b/i.exec(text || '');
    if (!match) return null;
    const value = Number(match[1].replace(',', '.'));
    const unit = match[2].toLowerCase();
    const gb = unit === 'tb' ? value * 1024 : unit === 'mb' ? value / 1024 : value;
    return Number.isFinite(gb) && gb > 0 ? Math.round(gb * 100) / 100 : null;
}

const WINDOWS_VERSIONS = { xp: 5, vista: 6, 7: 7, 8: 8, 10: 10, 11: 11 };

/** Lowest Windows version named in an OS line ("Windows 10/11" -> 10), or null. */
function lowestWindows(text) {
    const lower = String(text || '').toLowerCase();
    if (!lower.includes('windows') && !/\bwin\s?\d/.test(lower)) return null;
    const versions = [...lower.replace(/\b8\.1\b/g, '8').matchAll(/(?<![\d.])(xp|vista|7|8|10|11)(?![\d.])/g)].map(m => WINDOWS_VERSIONS[m[1]]);
    return versions.length ? Math.min(...versions) : null;
}

/**
 * @param {string} html one requirement block (minimum OR recommended)
 */
export function parseRequirements(html) {
    const empty = { cpu: [], gpu: [], ramGb: null, storageGb: null, os: null, osVersion: null, cpuText: null, gpuText: null };
    if (!html) return empty;

    const text = stripHtml(html);
    const matches = [...text.matchAll(FIELD_REGEX)];
    const fields = {};
    matches.forEach((match, i) => {
        const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
        const value = clean(text.slice(match.index + match[0].length, end));
        const key = FIELDS.find(([label]) => label === match[1].toLowerCase().replace(/\s+/g, ' '))?.[1];
        if (!key || !value) return;
        fields[key] = fields[key] ? `${fields[key]}, ${value}` : value;
    });

    const storageGb = sizeGb(fields.storage) ?? sizeGb(/(\d+(?:\.\d+)?\s*(?:gb|mb))\s*(?:of\s*)?(?:available|free)?\s*(?:disk\s*)?space/i.exec(fields.notes || '')?.[1]);

    return {
        cpu: fields.cpu ? matchCpus(fields.cpu, { requirement: true }) : [],
        gpu: fields.gpu ? matchGpus(fields.gpu, { requirement: true }) : [],
        ramGb: sizeGb(fields.ram),
        storageGb,
        os: fields.os || null,
        osVersion: lowestWindows(fields.os),
        cpuText: fields.cpu || null,
        gpuText: fields.gpu || null,
    };
}

/* ━━━━━━━━━━━━━━━━ VERDICT ━━━━━━━━━━━━━━━━ */

// Scores are estimates: within 10% of a candidate counts as equal
const TOLERANCE = 0.9;

export const OS_OPTIONS = ['windows11', 'windows10', 'windowsOld', 'macos', 'linux', 'steamos'];
const USER_WINDOWS = { windows11: 11, windows10: 10, windowsOld: 7 };

/** 'yes' | 'no' | 'unknown' – beats any candidate? */
function beats(userScore, candidates) {
    if (!candidates?.length || !userScore) return 'unknown';
    const easiest = Math.min(...candidates.map(c => c.score));
    return userScore >= easiest * TOLERANCE ? 'yes' : 'no';
}

function atLeast(userValue, required) {
    if (!required || !userValue) return 'unknown';
    return Number(userValue) >= required * 0.95 ? 'yes' : 'no';
}

/**
 * Row status: 'rec' meets recommended · 'ok' meets the only requirement given · 'min' minimum only · 'below' · 'unknown'
 */
function rowStatus(minResult, recResult, hasMin, hasRec) {
    if (!hasMin && !hasRec) return null;
    if (hasRec && recResult === 'yes') return 'rec';
    if (hasMin && minResult === 'no') return 'below';
    if (!hasMin && recResult === 'no') return 'min'; // only a recommended spec, and we're under it
    if (hasMin && minResult === 'yes') return hasRec ? (recResult === 'unknown' ? 'ok' : 'min') : 'ok';
    return 'unknown';
}

function osStatus(os, min, rec, platforms) {
    if (!os) return null;
    if (os === 'macos') return platforms ? (platforms.mac ? 'ok' : 'below') : 'unknown';
    if (os === 'linux' || os === 'steamos') return platforms ? (platforms.linux ? 'ok' : 'min') : 'unknown';
    const userVersion = USER_WINDOWS[os];
    const need = min?.osVersion ?? rec?.osVersion;
    if (!need) return platforms && platforms.windows === false ? 'below' : 'ok';
    if (userVersion >= Math.max(need, rec?.osVersion ?? need)) return 'rec';
    return userVersion >= need ? 'min' : 'below';
}

/**
 * @param {{ cpu?: string, gpu?: string, ramGb?: number, os?: string }} specs the user's PC
 * @param {{ minimum?: string, recommended?: string }} requirements HTML blocks
 * @param {{ windows?: boolean, mac?: boolean, linux?: boolean } | null} platforms
 */
export function checkRequirements(specs, requirements, platforms = null) {
    const min = parseRequirements(requirements?.minimum);
    const rec = parseRequirements(requirements?.recommended);
    const userCpu = specs?.cpu ? matchCpu(specs.cpu) : null;
    const userGpu = specs?.gpu ? matchGpu(specs.gpu) : null;
    const ramGb = Number(specs?.ramGb) || null;

    const rows = [];
    const push = (key, status, extra) => status && rows.push({ key, status, ...extra });

    push('cpu', rowStatus(beats(userCpu?.score, min.cpu), beats(userCpu?.score, rec.cpu), min.cpu.length > 0, rec.cpu.length > 0), {
        user: userCpu?.name || specs?.cpu || null, recognized: Boolean(userCpu), minimum: min.cpu, recommended: rec.cpu,
    });
    push('gpu', rowStatus(beats(userGpu?.score, min.gpu), beats(userGpu?.score, rec.gpu), min.gpu.length > 0, rec.gpu.length > 0), {
        user: userGpu?.name || specs?.gpu || null, recognized: Boolean(userGpu), minimum: min.gpu, recommended: rec.gpu,
    });
    push('ram', rowStatus(atLeast(ramGb, min.ramGb), atLeast(ramGb, rec.ramGb), Boolean(min.ramGb), Boolean(rec.ramGb)), {
        user: ramGb, recognized: Boolean(ramGb), minimum: min.ramGb, recommended: rec.ramGb,
    });
    push('os', osStatus(specs?.os, min, rec, platforms), {
        user: specs?.os || null, recognized: Boolean(specs?.os), minimum: min.os, recommended: rec.os,
    });

    const statuses = rows.map(r => r.status);
    let overall = 'unknown';
    if (statuses.includes('below')) overall = 'below';
    else if (statuses.length && statuses.every(s => s === 'unknown')) overall = 'unknown';
    else if (statuses.includes('unknown')) overall = 'partial';
    else if (statuses.includes('min')) overall = 'min';
    else if (statuses.length) overall = 'great';

    return { overall, rows, minimum: min, recommended: rec };
}
