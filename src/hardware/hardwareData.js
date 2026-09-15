// Relative performance scores for GPUs and CPUs + fuzzy matchers for requirement strings.
//
// Scores are roughly proportional to PassMark (G3D Mark for GPUs, CPU Mark for CPUs), so they
// can be compared within one table ("is my GPU at least as fast as a GTX 1060?"). They are
// estimates, not benchmarks: the UI treats anything within ~10% as equal.
//
//   matchGpu('NVIDIA GeForce GTX 1060 6GB')  -> { name, score, approx }
//   matchGpus('GTX 1060 6GB / AMD Radeon RX 580') -> [{...}, {...}]   (all alternatives)
//   matchCpu('Intel Core i5-4460') / matchCpus('Intel Core i5-4460 or AMD FX-6300')
//
// Table rows: [display name, score, 'alias|alias'?]. Without aliases the alias is the normalized
// name minus the vendor words (e.g. "NVIDIA GeForce RTX 3060" -> "rtx 3060").

/* ━━━━━━━━━━━━━━━━ NORMALIZATION ━━━━━━━━━━━━━━━━ */

/** Lowercase, drop ®/™, split letters from digits: "GeForce® RTX3060Ti" -> "geforce rtx 3060 ti". */
export function normalizeHw(text) {
    return ` ${String(text || '')} `
        .toLowerCase()
        .replace(/\((?:r|tm)\)|[®™©]/g, ' ')
        .replace(/(\d),(\d{3})\b/g, '$1$2')
        .replace(/[^a-z0-9.+]+/g, ' ')
        .replace(/\+/g, ' ')
        .replace(/(?<!\d)\.|\.(?!\d)/g, ' ')
        .replace(/([a-z])(?=\d)|(\d)(?=[a-z])/g, '$1$2 ')
        .replace(/\s+/g, ' ')
        .trim();
}

const GPU_VENDOR_WORDS = new Set(['nvidia', 'geforce', 'amd', 'ati', 'radeon', 'intel', 'apple', 'qualcomm']);
const CPU_VENDOR_WORDS = new Set(['intel', 'amd', 'core', 'apple', 'qualcomm']);

function deriveAlias(name, vendorWords) {
    return normalizeHw(name.replace(/\(.*?\)/g, ''))
        .split(' ')
        .filter(word => !vendorWords.has(word))
        .join(' ');
}

/* ━━━━━━━━━━━━━━━━ GPUS ━━━━━━━━━━━━━━━━ */

const GPU_ROWS = [
    // NVIDIA – pre-600 (still seen in older requirements)
    ['NVIDIA GeForce 8800 GT', 750, '8800 gt'],
    ['NVIDIA GeForce 9800 GT', 850, '9800 gt|9800 gtx'],
    ['NVIDIA GeForce GT 710', 650],
    ['NVIDIA GeForce GT 730', 900],
    ['NVIDIA GeForce GTS 450', 1450],
    ['NVIDIA GeForce GTX 460', 2100],
    ['NVIDIA GeForce GTX 550 Ti', 1800],
    ['NVIDIA GeForce GTX 560', 2500],
    ['NVIDIA GeForce GTX 560 Ti', 3000],
    ['NVIDIA GeForce GTX 570', 3600],
    ['NVIDIA GeForce GTX 580', 4100],
    // NVIDIA 600 / 700
    ['NVIDIA GeForce GT 640', 1200],
    ['NVIDIA GeForce GTX 600 series', 1800, 'gtx 600 series|geforce 600 series'],
    ['NVIDIA GeForce GTX 650', 1800],
    ['NVIDIA GeForce GTX 650 Ti', 2700],
    ['NVIDIA GeForce GTX 650 Ti Boost', 3300],
    ['NVIDIA GeForce GTX 660', 4000],
    ['NVIDIA GeForce GTX 660 Ti', 4700],
    ['NVIDIA GeForce GTX 670', 5500],
    ['NVIDIA GeForce GTX 680', 5800],
    ['NVIDIA GeForce GT 740', 1700],
    ['NVIDIA GeForce GTX 700 series', 3300, 'gtx 700 series|geforce 700 series'],
    ['NVIDIA GeForce GTX 750', 3300],
    ['NVIDIA GeForce GTX 750 Ti', 3900],
    ['NVIDIA GeForce GTX 760', 4500],
    ['NVIDIA GeForce GTX 770', 6000],
    ['NVIDIA GeForce GTX 780', 7700],
    ['NVIDIA GeForce GTX 780 Ti', 9000],
    ['NVIDIA GeForce GTX Titan', 8300, 'gtx titan|geforce titan'],
    ['NVIDIA GeForce GTX Titan X', 13000, 'gtx titan x|titan x'],
    // NVIDIA 900 / 10 / 16
    ['NVIDIA GeForce GTX 900 series', 5300, 'gtx 900 series|geforce 900 series'],
    ['NVIDIA GeForce GTX 950', 5300],
    ['NVIDIA GeForce GTX 960', 6000],
    ['NVIDIA GeForce GTX 970', 9600],
    ['NVIDIA GeForce GTX 980', 11200],
    ['NVIDIA GeForce GTX 980 Ti', 13500],
    ['NVIDIA GeForce MX150', 2800],
    ['NVIDIA GeForce MX250', 3000],
    ['NVIDIA GeForce MX350', 3300],
    ['NVIDIA GeForce MX450', 5000],
    ['NVIDIA GeForce MX550', 5500],
    ['NVIDIA GeForce GT 1030', 2700],
    ['NVIDIA GeForce GTX 1050', 4900],
    ['NVIDIA GeForce GTX 1050 Ti', 6200],
    ['NVIDIA GeForce GTX 1060 3GB', 9700, 'gtx 1060 3 gb|gtx 1060 3 gb vram'],
    ['NVIDIA GeForce GTX 1060', 10000, 'gtx 1060|gtx 1060 6 gb'],
    ['NVIDIA GeForce GTX 1070', 13500],
    ['NVIDIA GeForce GTX 1070 Ti', 14600],
    ['NVIDIA GeForce GTX 1080', 15400],
    ['NVIDIA GeForce GTX 1080 Ti', 18500],
    ['NVIDIA GeForce GTX 1630', 4500],
    ['NVIDIA GeForce GTX 1650', 7800],
    ['NVIDIA GeForce GTX 1650 Ti', 8500],
    ['NVIDIA GeForce GTX 1650 Super', 10100],
    ['NVIDIA GeForce GTX 1660', 11600],
    ['NVIDIA GeForce GTX 1660 Super', 12700],
    ['NVIDIA GeForce GTX 1660 Ti', 12800],
    // NVIDIA RTX 20 / 30
    ['NVIDIA GeForce RTX 2050', 6800],
    ['NVIDIA GeForce RTX 2060', 14000],
    ['NVIDIA GeForce RTX 2060 Super', 16400],
    ['NVIDIA GeForce RTX 2070', 16700],
    ['NVIDIA GeForce RTX 2070 Super', 18300],
    ['NVIDIA GeForce RTX 2080', 19000],
    ['NVIDIA GeForce RTX 2080 Super', 20000],
    ['NVIDIA GeForce RTX 2080 Ti', 21800],
    ['NVIDIA Titan RTX', 22500, 'titan rtx'],
    ['NVIDIA GeForce RTX 3050 6GB', 10500, 'rtx 3050 6 gb'],
    ['NVIDIA GeForce RTX 3050', 12900],
    ['NVIDIA GeForce RTX 3060', 17000],
    ['NVIDIA GeForce RTX 3060 Ti', 20300],
    ['NVIDIA GeForce RTX 3070', 22300],
    ['NVIDIA GeForce RTX 3070 Ti', 23300],
    ['NVIDIA GeForce RTX 3080', 25000],
    ['NVIDIA GeForce RTX 3080 Ti', 27000],
    ['NVIDIA GeForce RTX 3090', 26800],
    ['NVIDIA GeForce RTX 3090 Ti', 29500],
    // NVIDIA RTX 40 / 50
    ['NVIDIA GeForce RTX 4050', 15000],
    ['NVIDIA GeForce RTX 4060', 19500],
    ['NVIDIA GeForce RTX 4060 Ti', 22500],
    ['NVIDIA GeForce RTX 4070', 26900],
    ['NVIDIA GeForce RTX 4070 Super', 30000],
    ['NVIDIA GeForce RTX 4070 Ti', 31500],
    ['NVIDIA GeForce RTX 4070 Ti Super', 32000],
    ['NVIDIA GeForce RTX 4080', 34500],
    ['NVIDIA GeForce RTX 4080 Super', 34800],
    ['NVIDIA GeForce RTX 4090', 38500],
    ['NVIDIA GeForce RTX 5050', 18500],
    ['NVIDIA GeForce RTX 5060', 23000],
    ['NVIDIA GeForce RTX 5060 Ti', 25500],
    ['NVIDIA GeForce RTX 5070', 30500],
    ['NVIDIA GeForce RTX 5070 Ti', 34000],
    ['NVIDIA GeForce RTX 5080', 36500],
    ['NVIDIA GeForce RTX 5090', 42000],

    // AMD – HD 4000–6000
    ['ATI Radeon HD 4870', 1200],
    ['AMD Radeon HD 5770', 1700],
    ['AMD Radeon HD 5850', 2400],
    ['AMD Radeon HD 6570', 900],
    ['AMD Radeon HD 6670', 1200],
    ['AMD Radeon HD 6770', 1700],
    ['AMD Radeon HD 6850', 2300],
    ['AMD Radeon HD 6870', 2600],
    ['AMD Radeon HD 6950', 3000],
    ['AMD Radeon HD 6970', 3300],
    // AMD – HD 7000 / R7 / R9
    ['AMD Radeon HD 7000 series', 1900, 'hd 7000 series|radeon 7000 series'],
    ['AMD Radeon HD 7750', 1900],
    ['AMD Radeon HD 7770', 2500],
    ['AMD Radeon HD 7790', 3300],
    ['AMD Radeon HD 7850', 3900],
    ['AMD Radeon HD 7870', 4700],
    ['AMD Radeon HD 7950', 5700],
    ['AMD Radeon HD 7970', 6300],
    ['AMD Radeon R7 240', 1000],
    ['AMD Radeon R7 250', 1300],
    ['AMD Radeon R7 260X', 3000],
    ['AMD Radeon R7 265', 4000],
    ['AMD Radeon R7 360', 2800],
    ['AMD Radeon R7 370', 3600],
    ['AMD Radeon R9 270', 4600],
    ['AMD Radeon R9 270X', 5600],
    ['AMD Radeon R9 280', 5800],
    ['AMD Radeon R9 280X', 6500],
    ['AMD Radeon R9 285', 5700],
    ['AMD Radeon R9 290', 8000],
    ['AMD Radeon R9 290X', 8700],
    ['AMD Radeon R9 380', 5800],
    ['AMD Radeon R9 380X', 6500],
    ['AMD Radeon R9 390', 9000],
    ['AMD Radeon R9 390X', 9500],
    ['AMD Radeon R9 Fury', 11000],
    ['AMD Radeon R9 Fury X', 11200],
    // AMD – RX 400 / 500 / Vega
    ['AMD Radeon RX 460', 4200],
    ['AMD Radeon RX 470', 7500],
    ['AMD Radeon RX 480', 8700],
    ['AMD Radeon RX 550', 3000],
    ['AMD Radeon RX 560', 4200],
    ['AMD Radeon RX 570', 7800],
    ['AMD Radeon RX 580', 8900],
    ['AMD Radeon RX 590', 9500],
    ['AMD Radeon RX Vega 56', 12500, 'rx vega 56|vega 56'],
    ['AMD Radeon RX Vega 64', 13500, 'rx vega 64|vega 64'],
    ['AMD Radeon VII', 16000, 'radeon vii'],
    // AMD – RX 5000 / 6000
    ['AMD Radeon RX 5500 XT', 9300],
    ['AMD Radeon RX 5600 XT', 13600],
    ['AMD Radeon RX 5700', 14700],
    ['AMD Radeon RX 5700 XT', 16500],
    ['AMD Radeon RX 6400', 7200],
    ['AMD Radeon RX 6500 XT', 8300],
    ['AMD Radeon RX 6600', 14000],
    ['AMD Radeon RX 6600 XT', 15700],
    ['AMD Radeon RX 6650 XT', 16200],
    ['AMD Radeon RX 6700', 16800],
    ['AMD Radeon RX 6700 XT', 18800],
    ['AMD Radeon RX 6750 XT', 19700],
    ['AMD Radeon RX 6800', 22000],
    ['AMD Radeon RX 6800 XT', 24000],
    ['AMD Radeon RX 6900 XT', 25500],
    ['AMD Radeon RX 6950 XT', 26500],
    // AMD – RX 7000 / 9000
    ['AMD Radeon RX 7600', 16400],
    ['AMD Radeon RX 7600 XT', 17000],
    ['AMD Radeon RX 7700 XT', 21500],
    ['AMD Radeon RX 7800 XT', 24000],
    ['AMD Radeon RX 7900 GRE', 26000],
    ['AMD Radeon RX 7900 XT', 28500],
    ['AMD Radeon RX 7900 XTX', 31000],
    ['AMD Radeon RX 9060 XT', 22000],
    ['AMD Radeon RX 9070', 29000],
    ['AMD Radeon RX 9070 XT', 31500],
    // AMD – integrated
    ['AMD Radeon Vega 3 (integrated)', 1200, 'vega 3'],
    ['AMD Radeon Vega 8 (integrated)', 2400, 'vega 8|rx vega 8'],
    ['AMD Radeon Vega 11 (integrated)', 2700, 'vega 11|rx vega 11'],
    ['AMD Radeon Graphics (Ryzen integrated)', 2700, 'radeon graphics'],
    ['AMD Radeon 610M', 1500, 'radeon 610 m'],
    ['AMD Radeon 660M', 4500, 'radeon 660 m'],
    ['AMD Radeon 680M', 6200, 'radeon 680 m'],
    ['AMD Radeon 760M', 5800, 'radeon 760 m'],
    ['AMD Radeon 780M', 7500, 'radeon 780 m'],
    ['AMD Radeon 890M', 9000, 'radeon 890 m'],
    ['AMD Radeon 8060S', 18000, 'radeon 8060 s'],
    ['Steam Deck GPU (AMD Van Gogh)', 3800, 'custom gpu 0405|custom gpu 0932|van gogh|vangogh|steam deck'],

    // Intel – integrated
    ['Intel HD Graphics 3000', 400, 'hd graphics 3000|hd 3000'],
    ['Intel HD Graphics 4000', 650, 'hd graphics 4000|hd 4000'],
    ['Intel HD Graphics 4400', 750, 'hd graphics 4400|hd 4400'],
    ['Intel HD Graphics 4600', 950, 'hd graphics 4600|hd 4600'],
    ['Intel HD Graphics 520', 900, 'hd graphics 520|hd 520'],
    ['Intel HD Graphics 530', 1100, 'hd graphics 530|hd 530'],
    ['Intel HD Graphics 620', 950, 'hd graphics 620|hd 620'],
    ['Intel HD Graphics 630', 1300, 'hd graphics 630|hd 630'],
    ['Intel HD Graphics', 700, 'intel hd graphics'],
    ['Intel UHD Graphics 600', 500, 'uhd graphics 600|uhd 600'],
    ['Intel UHD Graphics 620', 1000, 'uhd graphics 620|uhd 620'],
    ['Intel UHD Graphics 630', 1300, 'uhd graphics 630|uhd 630'],
    ['Intel UHD Graphics 730', 1200, 'uhd graphics 730|uhd 730'],
    ['Intel UHD Graphics 750', 1500, 'uhd graphics 750|uhd 750'],
    ['Intel UHD Graphics 770', 1700, 'uhd graphics 770|uhd 770'],
    ['Intel UHD Graphics', 1100, 'uhd graphics'],
    ['Intel Iris Plus Graphics', 1900, 'iris plus'],
    ['Intel Iris Xe Graphics', 2800, 'iris xe'],
    ['Intel Arc Graphics (Core Ultra integrated)', 5500, 'arc graphics'],
    ['Intel Arc 130V', 6000, 'arc 130 v'],
    ['Intel Arc 140V', 7000, 'arc 140 v'],
    // Intel – Arc desktop
    ['Intel Arc A310', 4800, 'arc a 310|a 310'],
    ['Intel Arc A380', 5900, 'arc a 380|a 380'],
    ['Intel Arc A580', 11700, 'arc a 580|a 580'],
    ['Intel Arc A750', 13300, 'arc a 750|a 750'],
    ['Intel Arc A770', 15200, 'arc a 770|a 770'],
    ['Intel Arc B570', 15000, 'arc b 570|b 570'],
    ['Intel Arc B580', 16500, 'arc b 580|b 580'],

    // Apple / Qualcomm
    ['Apple M1', 6000, 'apple m 1'],
    ['Apple M1 Pro', 11000, 'apple m 1 pro|m 1 pro'],
    ['Apple M1 Max', 17000, 'apple m 1 max|m 1 max'],
    ['Apple M2', 7000, 'apple m 2'],
    ['Apple M2 Pro', 12500, 'apple m 2 pro|m 2 pro'],
    ['Apple M2 Max', 19000, 'apple m 2 max|m 2 max'],
    ['Apple M3', 8500, 'apple m 3'],
    ['Apple M3 Pro', 13000, 'apple m 3 pro|m 3 pro'],
    ['Apple M3 Max', 22000, 'apple m 3 max|m 3 max'],
    ['Apple M4', 10000, 'apple m 4'],
    ['Apple M4 Pro', 16000, 'apple m 4 pro|m 4 pro'],
    ['Apple M4 Max', 25000, 'apple m 4 max|m 4 max'],
    ['Qualcomm Adreno X1-85', 6000, 'adreno x 1 85|adreno x 1'],
];

// Integrated / family-level rows: fine for detecting the user's GPU, too vague as a requirement
const GENERIC_GPU = new Set(['radeon graphics', 'intel hd graphics', 'uhd graphics', 'arc graphics']);

/* ━━━━━━━━━━━━━━━━ CPUS ━━━━━━━━━━━━━━━━ */

const CPU_ROWS = [
    // Intel – Core 2 / Pentium / Xeon
    ['Intel Core 2 Duo E6600', 1100, 'e 6600'],
    ['Intel Core 2 Duo E8400', 1300, 'e 8400'],
    ['Intel Core 2 Quad Q6600', 1900, 'q 6600'],
    ['Intel Core 2 Quad Q9550', 2400, 'q 9550'],
    ['Intel Core 2 Duo', 1000, 'core 2 duo'],
    ['Intel Core 2 Quad', 1900, 'core 2 quad'],
    ['Intel Pentium G3258', 2200, 'g 3258'],
    ['Intel Pentium G4560', 3300, 'g 4560'],
    ['Intel Pentium Gold G5400', 3300, 'g 5400'],
    ['Intel Pentium Gold G6400', 4200, 'g 6400'],
    ['Intel Celeron G3900', 1700, 'g 3900'],
    ['Intel Xeon E3-1230 v2', 6100, 'e 3 1230 v 2|e 3 1230'],
    ['Intel Xeon E3-1231 v3', 7000, 'e 3 1231 v 3|e 3 1231'],
    // Intel Core 1st–4th gen
    ['Intel Core i3-530', 1300],
    ['Intel Core i5-750', 2500],
    ['Intel Core i5-760', 2600],
    ['Intel Core i7-920', 2850],
    ['Intel Core i7-950', 3100],
    ['Intel Core i3-2100', 2000],
    ['Intel Core i5-2300', 3400],
    ['Intel Core i5-2400', 3800],
    ['Intel Core i5-2500', 4000],
    ['Intel Core i5-2500K', 4100],
    ['Intel Core i7-2600', 5300],
    ['Intel Core i7-2600K', 5400],
    ['Intel Core i3-3220', 2200],
    ['Intel Core i5-3330', 4300],
    ['Intel Core i5-3470', 4700],
    ['Intel Core i5-3570K', 4800],
    ['Intel Core i7-3770', 6300],
    ['Intel Core i7-3770K', 6400],
    ['Intel Core i3-4130', 2400],
    ['Intel Core i3-4160', 2500],
    ['Intel Core i5-4430', 4500],
    ['Intel Core i5-4440', 4550],
    ['Intel Core i5-4460', 4600],
    ['Intel Core i5-4570', 4900],
    ['Intel Core i5-4590', 5000],
    ['Intel Core i5-4670K', 5200],
    ['Intel Core i5-4690', 5300],
    ['Intel Core i5-4690K', 5400],
    ['Intel Core i7-4770', 7000],
    ['Intel Core i7-4770K', 7300],
    ['Intel Core i7-4790', 7200],
    ['Intel Core i7-4790K', 8000],
    // Intel Core 6th–9th gen
    ['Intel Core i3-6100', 3650],
    ['Intel Core i5-6400', 5100],
    ['Intel Core i5-6500', 5600],
    ['Intel Core i5-6600', 5900],
    ['Intel Core i5-6600K', 6300],
    ['Intel Core i7-6700', 8000],
    ['Intel Core i7-6700K', 8900],
    ['Intel Core i7-6700HQ', 6400],
    ['Intel Core i3-7100', 3900],
    ['Intel Core i5-7400', 5500],
    ['Intel Core i5-7500', 6000],
    ['Intel Core i5-7600', 6600],
    ['Intel Core i5-7600K', 7000],
    ['Intel Core i7-7700', 8600],
    ['Intel Core i7-7700K', 9600],
    ['Intel Core i7-7700HQ', 6700],
    ['Intel Core i3-8100', 6100],
    ['Intel Core i5-8250U', 6000],
    ['Intel Core i5-8400', 9200],
    ['Intel Core i5-8500', 9500],
    ['Intel Core i5-8600K', 10000],
    ['Intel Core i7-8550U', 6300],
    ['Intel Core i7-8700', 12900],
    ['Intel Core i7-8700K', 13700],
    ['Intel Core i7-8750H', 10200],
    ['Intel Core i3-9100F', 6700, 'i 3 9100'],
    ['Intel Core i5-9400F', 9500, 'i 5 9400'],
    ['Intel Core i5-9600K', 10900],
    ['Intel Core i7-9700K', 14500],
    ['Intel Core i7-9750H', 11000],
    ['Intel Core i9-9900K', 18000],
    // Intel Core 10th–14th gen
    ['Intel Core i3-10100', 8800],
    ['Intel Core i5-10300H', 8700],
    ['Intel Core i5-10400', 12200],
    ['Intel Core i5-10500', 12700],
    ['Intel Core i5-10600K', 14200],
    ['Intel Core i7-1065G7', 8000],
    ['Intel Core i7-10700', 17200],
    ['Intel Core i7-10700K', 19100],
    ['Intel Core i7-10750H', 12500],
    ['Intel Core i9-10900K', 22500],
    ['Intel Core i5-1135G7', 10000],
    ['Intel Core i7-1165G7', 10500],
    ['Intel Core i5-11400', 17000],
    ['Intel Core i5-11400H', 17000],
    ['Intel Core i5-11600K', 19600],
    ['Intel Core i7-11700K', 24500],
    ['Intel Core i7-11800H', 21000],
    ['Intel Core i9-11900K', 25500],
    ['Intel Core i3-12100', 14500],
    ['Intel Core i5-1235U', 13000],
    ['Intel Core i5-12400', 19500],
    ['Intel Core i5-12450H', 16000],
    ['Intel Core i5-12600K', 27500],
    ['Intel Core i7-1255U', 13800],
    ['Intel Core i7-12650H', 23500],
    ['Intel Core i7-12700', 31000],
    ['Intel Core i7-12700H', 26500],
    ['Intel Core i7-12700K', 34500],
    ['Intel Core i9-12900K', 41500],
    ['Intel Core i3-13100', 14800],
    ['Intel Core i5-13400', 25500],
    ['Intel Core i5-13420H', 17500],
    ['Intel Core i5-13500H', 23000],
    ['Intel Core i5-13600K', 38000],
    ['Intel Core i7-13620H', 25000],
    ['Intel Core i7-13700H', 28000],
    ['Intel Core i7-13700K', 46500],
    ['Intel Core i9-13900K', 59500],
    ['Intel Core i9-13980HX', 50000],
    ['Intel Core i5-14400', 25800],
    ['Intel Core i5-14600K', 39500],
    ['Intel Core i7-14650HX', 36000],
    ['Intel Core i7-14700HX', 40000],
    ['Intel Core i7-14700K', 53500],
    ['Intel Core i9-14900HX', 52000],
    ['Intel Core i9-14900K', 60000],
    // Intel Core Ultra
    ['Intel Core Ultra 5 125H', 21500],
    ['Intel Core Ultra 7 155H', 25000],
    ['Intel Core Ultra 9 185H', 28000],
    ['Intel Core Ultra 5 226V', 17500],
    ['Intel Core Ultra 7 258V', 21000],
    ['Intel Core Ultra 5 225H', 25000],
    ['Intel Core Ultra 7 255H', 29000],
    ['Intel Core Ultra 5 245K', 43000],
    ['Intel Core Ultra 7 265K', 58000],
    ['Intel Core Ultra 9 275HX', 52000],
    ['Intel Core Ultra 9 285K', 67000],

    // AMD – FX / Phenom / Athlon / A-series
    ['AMD FX-4100', 3000],
    ['AMD FX-4300', 3600],
    ['AMD FX-4350', 4000],
    ['AMD FX-6300', 5600],
    ['AMD FX-6350', 6000],
    ['AMD FX-8320', 7300],
    ['AMD FX-8350', 7900],
    ['AMD FX-9590', 9800],
    ['AMD Phenom X3 8650', 1400, 'phenom x 3 8650'],
    ['AMD Phenom 9850 Quad-Core', 2000, 'phenom 9850'],
    ['AMD Phenom II X4 955', 2800, 'phenom ii x 4 955|x 4 955'],
    ['AMD Phenom II X4 965', 3000, 'phenom ii x 4 965|x 4 965'],
    ['AMD Phenom II X6 1090T', 4300, 'phenom ii x 6 1090|x 6 1090 t'],
    ['AMD Athlon II X2 250', 1000, 'athlon ii x 2 250'],
    ['AMD Athlon II X4 640', 2800, 'athlon ii x 4 640|x 4 640'],
    ['AMD Athlon X4 860K', 3500, 'athlon x 4 860 k|x 4 860'],
    ['AMD Athlon 200GE', 3400, 'athlon 200 ge'],
    ['AMD Athlon 3000G', 3600, 'athlon 3000 g'],
    ['AMD Athlon Gold 3150U', 2700, 'athlon gold 3150 u'],
    ['AMD A8-6600K', 3500, 'a 8 6600 k|a 8 6600'],
    ['AMD A10-5800K', 3400, 'a 10 5800 k|a 10 5800'],
    ['AMD A10-7850K', 3700, 'a 10 7850 k|a 10 7850'],
    ['AMD A12-9800', 4000, 'a 12 9800'],
    // AMD Ryzen 1000 / 2000
    ['AMD Ryzen 3 1200', 6300],
    ['AMD Ryzen 3 1300X', 7000],
    ['AMD Ryzen 5 1400', 7700],
    ['AMD Ryzen 5 1500X', 8700],
    ['AMD Ryzen 5 1600', 12300],
    ['AMD Ryzen 5 1600X', 13000],
    ['AMD Ryzen 7 1700', 15000],
    ['AMD Ryzen 7 1700X', 15700],
    ['AMD Ryzen 7 1800X', 16400],
    ['AMD Ryzen 3 2200G', 6800],
    ['AMD Ryzen 5 2400G', 8600],
    ['AMD Ryzen 5 2500X', 9000],
    ['AMD Ryzen 5 2600', 13100],
    ['AMD Ryzen 5 2600X', 14000],
    ['AMD Ryzen 7 2700', 16300],
    ['AMD Ryzen 7 2700X', 17500],
    // AMD Ryzen 3000 / 4000
    ['AMD Ryzen 3 3100', 11500],
    ['AMD Ryzen 3 3300X', 12600],
    ['AMD Ryzen 5 3400G', 9300],
    ['AMD Ryzen 5 3500U', 7000],
    ['AMD Ryzen 5 3500X', 13000],
    ['AMD Ryzen 5 3600', 17700],
    ['AMD Ryzen 5 3600X', 18200],
    ['AMD Ryzen 7 3700X', 22500],
    ['AMD Ryzen 7 3800X', 23400],
    ['AMD Ryzen 9 3900X', 31500],
    ['AMD Ryzen 9 3950X', 39000],
    ['AMD Ryzen 5 4500', 16000],
    ['AMD Ryzen 5 4600G', 16000],
    ['AMD Ryzen 5 4600H', 15500],
    ['AMD Ryzen 7 4700U', 14000],
    ['AMD Ryzen 7 4800H', 19000],
    // AMD Ryzen 5000 / 6000
    ['AMD Ryzen 5 5500', 19500],
    ['AMD Ryzen 5 5500U', 13000],
    ['AMD Ryzen 5 5600', 21500],
    ['AMD Ryzen 5 5600G', 19800],
    ['AMD Ryzen 5 5600H', 17000],
    ['AMD Ryzen 5 5600X', 22000],
    ['AMD Ryzen 7 5700G', 24500],
    ['AMD Ryzen 7 5700X', 26500],
    ['AMD Ryzen 7 5700X3D', 26500],
    ['AMD Ryzen 7 5800H', 21000],
    ['AMD Ryzen 7 5800X', 28000],
    ['AMD Ryzen 7 5800X3D', 27700],
    ['AMD Ryzen 9 5900X', 39000],
    ['AMD Ryzen 9 5950X', 46000],
    ['AMD Ryzen 5 6600H', 20000],
    ['AMD Ryzen 7 6800H', 23500],
    ['AMD Ryzen 7 6800U', 20000],
    // AMD Ryzen 7000 / 8000 / 9000
    ['AMD Ryzen 5 7500F', 27000],
    ['AMD Ryzen 5 7535HS', 20000],
    ['AMD Ryzen 5 7600', 27000],
    ['AMD Ryzen 5 7600X', 28500],
    ['AMD Ryzen 5 7640HS', 23500],
    ['AMD Ryzen 7 7700', 34500],
    ['AMD Ryzen 7 7700X', 36000],
    ['AMD Ryzen 7 7735HS', 24000],
    ['AMD Ryzen 7 7800X3D', 34500],
    ['AMD Ryzen 7 7840HS', 28500],
    ['AMD Ryzen 7 7840U', 25000],
    ['AMD Ryzen 9 7940HS', 30500],
    ['AMD Ryzen 3 7320U', 7500],
    ['AMD Ryzen 5 7520U', 9500],
    ['AMD Ryzen 9 7900', 49000],
    ['AMD Ryzen 9 7900X', 52000],
    ['AMD Ryzen 9 7900X3D', 50000],
    ['AMD Ryzen 9 7945HX', 55000],
    ['AMD Ryzen 9 7950X', 63000],
    ['AMD Ryzen 9 7950X3D', 62500],
    ['AMD Ryzen 5 8400F', 22000],
    ['AMD Ryzen 5 8500G', 20500],
    ['AMD Ryzen 5 8600G', 26500],
    ['AMD Ryzen 7 8700F', 32000],
    ['AMD Ryzen 7 8700G', 32000],
    ['AMD Ryzen 7 8845HS', 29000],
    ['AMD Ryzen 5 9600', 29000],
    ['AMD Ryzen 5 9600X', 30000],
    ['AMD Ryzen 7 9700X', 37000],
    ['AMD Ryzen 7 9800X3D', 40000],
    ['AMD Ryzen 9 9900X', 54000],
    ['AMD Ryzen 9 9900X3D', 53000],
    ['AMD Ryzen 9 9950X', 66000],
    ['AMD Ryzen 9 9950X3D', 68000],
    ['AMD Ryzen AI 7 350', 26000, 'ryzen ai 7 350|ai 7 350'],
    ['AMD Ryzen AI 9 HX 370', 32000, 'ryzen ai 9 hx 370|ai 9 hx 370|ai 9 370'],
    ['AMD Ryzen AI Max+ 395', 45000, 'ryzen ai max 395|ai max 395'],
    ['AMD Ryzen Threadripper 1950X', 25000, 'threadripper 1950 x'],
    ['AMD Ryzen Threadripper 3970X', 64000, 'threadripper 3970 x'],
    // Handhelds
    ['AMD Ryzen Z1', 18000, 'ryzen z 1'],
    ['AMD Ryzen Z1 Extreme', 25000, 'z 1 extreme'],
    ['Steam Deck APU (AMD Custom APU)', 8000, 'custom apu 0405|custom apu 0932|steam deck apu|steam deck'],

    // Apple / Qualcomm
    ['Apple M1', 14700, 'apple m 1'],
    ['Apple M1 Pro', 22000, 'apple m 1 pro|m 1 pro'],
    ['Apple M1 Max', 22500, 'apple m 1 max|m 1 max'],
    ['Apple M2', 15700, 'apple m 2'],
    ['Apple M2 Pro', 26000, 'apple m 2 pro|m 2 pro'],
    ['Apple M2 Max', 26500, 'apple m 2 max|m 2 max'],
    ['Apple M3', 19000, 'apple m 3'],
    ['Apple M3 Pro', 26500, 'apple m 3 pro|m 3 pro'],
    ['Apple M3 Max', 38000, 'apple m 3 max|m 3 max'],
    ['Apple M4', 23000, 'apple m 4'],
    ['Apple M4 Pro', 38000, 'apple m 4 pro|m 4 pro'],
    ['Apple M4 Max', 43000, 'apple m 4 max|m 4 max'],
    ['Qualcomm Snapdragon X Elite', 23000, 'snapdragon x elite|x elite|x 1 e'],
    ['Qualcomm Snapdragon X Plus', 18000, 'snapdragon x plus|x plus'],
];

const GENERIC_CPU = new Set(['core 2 duo', 'core 2 quad']);

function buildTable(rows, vendorWords, generic) {
    const entries = rows.map(([name, score, aliases]) => {
        const list = aliases ? aliases.split('|') : [deriveAlias(name, vendorWords)];
        return { name, score, aliases: list.map(a => normalizeHw(a)), generic: list.some(a => generic.has(a)) };
    });
    const index = entries
        .flatMap(entry => entry.aliases.map(alias => ({ alias, entry })))
        .sort((a, b) => b.alias.length - a.alias.length);
    return { entries, index };
}

export const GPU_TABLE = buildTable(GPU_ROWS, GPU_VENDOR_WORDS, GENERIC_GPU);
export const CPU_TABLE = buildTable(CPU_ROWS, CPU_VENDOR_WORDS, GENERIC_CPU);

/** Display names for autocomplete lists. */
export const GPU_NAMES = GPU_TABLE.entries.filter(e => !/series/i.test(e.name)).map(e => e.name);
export const CPU_NAMES = CPU_TABLE.entries.filter(e => !e.generic).map(e => e.name);

/* ━━━━━━━━━━━━━━━━ MATCHING ━━━━━━━━━━━━━━━━ */

/** All non-overlapping alias hits in normalized text, longest alias first. */
function tableHits(text, table) {
    const hay = ` ${text} `;
    const hits = [];
    for (const { alias, entry } of table.index) {
        const needle = ` ${alias} `;
        let pos = hay.indexOf(needle);
        while (pos !== -1) {
            hits.push({ start: pos + 1, end: pos + needle.length - 1, entry });
            pos = hay.indexOf(needle, pos + 1);
        }
    }
    const taken = [];
    for (const hit of hits) {
        if (!taken.some(t => hit.start < t.end && t.start < hit.end)) taken.push(hit);
    }
    return taken.sort((a, b) => a.start - b.start);
}

const overlaps = (hits, start, end) => hits.some(h => start < h.end && h.start < end);

const NV_FAMILIES = new Set(['gtx', 'rtx', 'gt', 'gts', 'mx']);
const AMD_FAMILIES = new Set(['rx', 'hd', 'r']);
const NOT_A_MODEL_AFTER = new Set(['gb', 'mb', 'series', 'p', 'hz', 'fps', 'bit', 'x', 'k', 'vram', 'dpi']);

function nvidiaPrefix(n) {
    const num = Number(n);
    if (n.length === 3 && num >= 600 && num <= 999) return [710, 720, 730, 740, 640].includes(num) ? 'gt' : 'gtx';
    if (n.length === 4 && num >= 1000 && num < 2000) return num === 1030 ? 'gt' : 'gtx';
    if (n.length === 4 && num >= 2000 && num < 6000 && num % 10 === 0) return 'rtx';
    return null;
}

/** GPU text: gives bare model numbers their family ("GTX 970 / 1060" -> "gtx 970 gtx 1060"). */
function expandGpuText(text) {
    const tokens = text.split(' ');
    const out = [];
    let vendor = null; // 'nv' | 'amd' | 'intel'
    let family = null;
    for (let i = 0; i < tokens.length; i++) {
        const tok = tokens[i];
        const prev = tokens[i - 1];
        if (tok === 'nvidia' || tok === 'geforce') { vendor = 'nv'; family = null; }
        else if (tok === 'amd' || tok === 'radeon' || tok === 'ati') { vendor = 'amd'; family = null; }
        else if (tok === 'intel' || tok === 'arc') { vendor = 'intel'; family = null; }
        else if (NV_FAMILIES.has(tok)) { vendor = 'nv'; family = tok; }
        else if (tok === 'rx' || tok === 'hd') { family = tok; }

        const bare = /^\d{3,4}$/.test(tok)
            && !NV_FAMILIES.has(prev) && !AMD_FAMILIES.has(prev) && !/^\d/.test(prev || '') && prev !== 'vega' && prev !== 'uhd' && prev !== 'graphics'
            && !NOT_A_MODEL_AFTER.has(tokens[i + 1]);
        if (bare) {
            if (vendor === 'nv' && nvidiaPrefix(tok)) out.push(nvidiaPrefix(tok));
            else if (family === 'rx' && Number(tok) >= 400) out.push('rx');
            else if (family === 'hd' && tok.length === 4) out.push('hd');
        }
        out.push(tok);
    }
    return out.join(' ');
}

const VRAM_STEPS = [[0.13, 150], [0.26, 300], [0.52, 700], [1, 1500], [2, 3000], [3, 4500], [4, 6000], [6, 9000], [8, 12000], [12, 16000], [16, 20000]];

/** Rough GPU class from "256 MB video memory" / "4 GB VRAM" when no model is named. */
function vramEstimate(text) {
    const match = /(\d+(?:\.\d+)?) ?(gb|mb)/.exec(text);
    if (!match) return null;
    const gb = match[2] === 'mb' ? Number(match[1]) / 1024 : Number(match[1]);
    if (!(gb > 0) || gb > 64) return null;
    let score = VRAM_STEPS[0][1];
    for (const [size, value] of VRAM_STEPS) if (gb >= size - 0.01) score = value;
    return { name: `${gb >= 1 ? `${Math.round(gb * 10) / 10} GB` : `${Math.round(gb * 1024)} MB`} VRAM`, score, approx: true, vramGb: gb };
}

/**
 * Every GPU named in a text (alternatives), e.g. requirement lines.
 * @param {string} text
 * @param {{ requirement?: boolean }} [options] requirement: skip vague "integrated graphics" rows, fall back to VRAM size
 * @returns {{ name: string, score: number, approx?: boolean }[]}
 */
export function matchGpus(text, { requirement = false } = {}) {
    const norm = expandGpuText(normalizeHw(text));
    if (!norm) return [];
    const laptop = / (laptop|mobile|max q)( |$)/.test(` ${norm} `);
    let hits = tableHits(norm, GPU_TABLE).map(h => h.entry);
    if (requirement && hits.some(e => !e.generic)) hits = hits.filter(e => !e.generic);
    const found = [];
    for (const entry of hits) {
        if (found.some(f => f.name === entry.name)) continue;
        found.push(laptop && !requirement
            ? { name: `${entry.name} Laptop GPU`, score: Math.round(entry.score * 0.8) }
            : { name: entry.name, score: entry.score, ...(entry.generic ? { approx: true } : {}) });
    }
    if (!found.length && requirement) {
        const vram = vramEstimate(norm);
        if (vram) found.push(vram);
    }
    return found;
}

/** Best single GPU for a user's own GPU string (first match). */
export function matchGpu(text) {
    return matchGpus(text)[0] || null;
}

/* ----- CPU heuristics for models missing from the table ----- */

// [i3, i5, i7, i9] by Intel Core generation (desktop)
const INTEL_GEN = {
    1: [1300, 2500, 2900, 2900], 2: [2000, 3800, 5300, 5300], 3: [2200, 4700, 6300, 6300], 4: [2450, 4900, 7200, 7200],
    5: [2500, 5000, 7400, 7400], 6: [3600, 5600, 8200, 8200], 7: [3900, 6000, 8800, 8800], 8: [6100, 9500, 13000, 13000],
    9: [6700, 9800, 14500, 17500], 10: [8800, 12500, 17500, 22000], 11: [10000, 17500, 23000, 25000],
    12: [14500, 21000, 32000, 41000], 13: [15000, 27000, 44000, 58000], 14: [15500, 28000, 50000, 60000],
};
// [Ryzen 3, 5, 7, 9] by Ryzen series (first digit of the model)
const RYZEN_SERIES = {
    1: [6500, 10500, 15500, 15500], 2: [7000, 13000, 16500, 16500], 3: [11500, 17500, 22500, 32000], 4: [11000, 16000, 19000, 19000],
    5: [13000, 21000, 26500, 40000], 6: [14000, 20000, 23500, 26000], 7: [15000, 27500, 35000, 52000],
    8: [16000, 21000, 32000, 32000], 9: [18000, 30000, 37000, 56000],
};
const TIER_INDEX = { 3: 0, 5: 1, 7: 2, 9: 3 };

function intelEstimate(tier, model, suffix) {
    let gen;
    if (model.length === 3) gen = 1;
    else if (model.length === 5 || model.startsWith('1')) gen = Number(model.slice(0, 2));
    else gen = Number(model[0]);
    const row = INTEL_GEN[gen];
    if (!row) return null;
    let score = row[TIER_INDEX[tier]];
    if (/^(u|y|g)/.test(suffix)) score *= 0.6;
    else if (/^h(?!x)/.test(suffix)) score *= 0.85;
    else if (/^k/.test(suffix)) score *= 1.05;
    return Math.round(score);
}

function ryzenEstimate(tier, model, suffix) {
    const row = RYZEN_SERIES[Number(model[0])];
    if (!row) return null;
    let score = row[TIER_INDEX[tier]];
    if (/^u/.test(suffix)) score *= 0.75;
    else if (/^h/.test(suffix)) score *= 0.85;
    else if (/^g/.test(suffix) && Number(model[0]) <= 3) score *= 0.75;
    else if (/^x/.test(suffix)) score *= 1.04;
    return Math.round(score);
}

function ghzEstimate(norm) {
    const match = /(\d+(?:\.\d+)?) ?ghz/.exec(norm);
    if (!match) return null;
    const ghz = Number(match[1]);
    if (!(ghz > 0.5 && ghz < 7)) return null;
    const cores = /quad|4 core|four core|4 cpus/.test(norm) ? 4 : /dual|2 core|two core|core 2|2 cpus/.test(norm) ? 2 : 1;
    const perGhz = { 1: 350, 2: 650, 4: 1100 }[cores];
    return { name: `${cores > 1 ? `${cores}× ` : ''}${ghz} GHz`, score: Math.round(ghz * perGhz), approx: true };
}

/**
 * Every CPU named in a text (alternatives).
 * @param {string} text
 * @param {{ requirement?: boolean }} [options]
 * @returns {{ name: string, score: number, approx?: boolean }[]}
 */
export function matchCpus(text, { requirement = false } = {}) {
    const norm = normalizeHw(text)
        .replace(/\br ?([3579]) (\d{4})\b/g, 'ryzen $1 $2')
        .replace(/\bryzen ([3579]) ?(\d{4})/g, 'ryzen $1 $2');
    if (!norm) return [];
    let hits = tableHits(norm, CPU_TABLE);
    // "Core 2 Quad CPU Q6600": the family row only counts when no specific model is named
    if (hits.some(h => !h.entry.generic)) hits = hits.filter(h => !h.entry.generic);
    const found = hits.map(h => ({ start: h.start, name: h.entry.name, score: h.entry.score, ...(h.entry.generic ? { approx: true } : {}) }));
    const add = (start, end, item) => {
        if (overlaps(hits, start, end) || found.some(f => f.name === item.name)) return;
        hits.push({ start, end });
        found.push({ start, ...item });
    };

    // Intel Core iX-NNNN(N) with optional suffix
    for (const m of norm.matchAll(/\bi ([3579]) (\d{3,5})((?: (?:kf|ks|k|f|te|t|u|y|hq|hk|hx|h|p|s|g)\b)?(?: \d\b)?)/g)) {
        const suffix = m[3].trim().replace(/ /g, '');
        const score = intelEstimate(m[1], m[2], suffix);
        if (score) add(m.index, m.index + m[0].length, { name: `Intel Core i${m[1]}-${m[2]}${suffix.toUpperCase()}`, score, approx: true });
    }
    // Intel Core Ultra X NNN
    for (const m of norm.matchAll(/\bultra ([579]) (\d{3})((?: (?:k|kf|f|hx|h|u|v)\b)?)/g)) {
        const base = { 5: 22000, 7: 27000, 9: 32000 }[m[1]];
        const suffix = m[3].trim();
        const score = Math.round(base * (m[2][0] === '2' ? 1.1 : 1) * (suffix === 'k' ? 1.9 : suffix === 'hx' ? 1.8 : suffix === 'v' || suffix === 'u' ? 0.75 : 1));
        add(m.index, m.index + m[0].length, { name: `Intel Core Ultra ${m[1]} ${m[2]}${suffix.toUpperCase()}`, score, approx: true });
    }
    // AMD Ryzen X NNNN with optional suffix
    for (const m of norm.matchAll(/\bryzen ([3579]) (\d{4})((?: (?:xt|x|ge|g|hs|hx|h|u|f)\b)?(?: 3 d\b)?)/g)) {
        const suffix = m[3].trim().replace(/ /g, '');
        const score = ryzenEstimate(m[1], m[2], suffix);
        if (score) add(m.index, m.index + m[0].length, { name: `AMD Ryzen ${m[1]} ${m[2]}${suffix.toUpperCase()}`, score, approx: true });
    }
    // AMD FX-NNNN
    for (const m of norm.matchAll(/\bfx (\d)(\d{3})\b/g)) {
        add(m.index, m.index + m[0].length, { name: `AMD FX-${m[1]}${m[2]}`, score: { 4: 3500, 6: 5600, 8: 7600, 9: 9500 }[m[1]] || 4000, approx: true });
    }
    // Family only: "Intel Core i5", "Ryzen 5 CPU or equivalent"
    for (const m of norm.matchAll(/\bi ([3579])\b(?! \d)/g)) {
        add(m.index, m.index + m[0].length, { name: `Intel Core i${m[1]}`, score: INTEL_GEN[2][TIER_INDEX[m[1]]], approx: true });
    }
    for (const m of norm.matchAll(/\bryzen ([3579])\b(?! \d)/g)) {
        add(m.index, m.index + m[0].length, { name: `AMD Ryzen ${m[1]}`, score: RYZEN_SERIES[1][TIER_INDEX[m[1]]], approx: true });
    }

    const result = found
        .sort((a, b) => a.start - b.start)
        .map(({ name, score, approx }) => (approx ? { name, score, approx } : { name, score }));
    if (!result.length && requirement) {
        const ghz = ghzEstimate(norm);
        if (ghz) result.push(ghz);
    }
    return result;
}

/** Best single CPU for a user's own CPU string. */
export function matchCpu(text) {
    return matchCpus(text)[0] || null;
}
