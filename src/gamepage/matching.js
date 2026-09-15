// Title / release matching between stores (Steam, GOG, RAWG) and requirement clean-up.

export const normalizeTitle = value => (value || '').toLowerCase().replace(/[^a-z0-9]/g, '');

/** 'exact' | 'close' ("Overwatch 2" vs "Overwatch®") | null ("Nox" vs "Nox Archaist") */
export function titleMatch(a, b) {
    const x = normalizeTitle(a);
    const y = normalizeTitle(b);
    if (!x || !y) return null;
    if (x === y) return 'exact';
    const [short, long] = x.length < y.length ? [x, y] : [y, x];
    return short.length >= 4 && long.startsWith(short) && short.length / long.length >= 0.7 ? 'close' : null;
}

function releaseYear(value) {
    if (!value) return null;
    const year = new Date(value).getFullYear();
    return Number.isNaN(year) ? null : year;
}

/** Different games often share a title (an itch.io "WARDOGS" vs the 2026 Steam one): compare years when both are known. */
export function sameRelease(a, b) {
    const x = releaseYear(a);
    const y = releaseYear(b);
    return x == null || y == null || Math.abs(x - y) <= 1;
}

/** Steam writes "OS *:" (footnote marker); the requirement parser expects "OS:". */
export function normalizeRequirements(requirements) {
    if (!requirements || (!requirements.minimum && !requirements.recommended)) return null;
    const fix = text => (typeof text === 'string' ? text.replace(/\bOS\s*\*+\s*:/g, 'OS:') : text);
    return { minimum: fix(requirements.minimum), recommended: fix(requirements.recommended) };
}
