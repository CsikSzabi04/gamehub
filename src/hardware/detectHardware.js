// Best-effort hardware detection in the browser.
//
//   const found = await detectHardware();
//   // { gpu, gpuRaw, gpuRecognized, ramGb, ramIsLowerBound, threads, os, mobile }
//
// Browsers only expose a little: the WebGL renderer string (GPU), navigator.deviceMemory (RAM,
// capped at 8 GB in Chromium, missing in Firefox/Safari), hardwareConcurrency (CPU threads, not
// the model) and the platform. The CPU model can't be detected.
import { matchGpu } from './hardwareData.js';

/** "ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 (0x00002504) Direct3D11 vs_5_0 ps_5_0, D3D11)" -> "NVIDIA GeForce RTX 3060" */
export function cleanRendererString(raw) {
    let text = String(raw || '').trim();
    const angle = /^ANGLE \((.*)\)$/i.exec(text);
    if (angle) {
        const parts = angle[1].split(/,\s*/);
        text = parts.length >= 2 ? parts[1] : parts[0];
    }
    return text
        .replace(/ANGLE Metal Renderer:\s*/i, '')
        .replace(/\(0x[0-9a-f]+\)/gi, '')
        .replace(/\b(Direct3D\d*|D3D\d+|vs_\d_\d|ps_\d_\d|OpenGL( Engine)?|Vulkan[\d.]*|Metal)\b.*$/i, '')
        .replace(/\/PCIe\/SSE2.*$/i, '')
        .replace(/\((R|TM)\)/gi, '')
        .replace(/\s*\((radeonsi|llvm|drm)[^)]*\)?/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function webglRenderer() {
    if (typeof document === 'undefined') return null;
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) return null;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const renderer = (ext && gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) || gl.getParameter(gl.RENDERER);
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return typeof renderer === 'string' ? renderer : null;
    } catch {
        return null;
    }
}

async function detectOs() {
    if (typeof navigator === 'undefined') return { os: null, mobile: false };
    const ua = navigator.userAgent || '';
    const data = navigator.userAgentData;
    const mobile = Boolean(data?.mobile) || /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
    if (mobile) return { os: null, mobile: true };

    const platform = data?.platform || navigator.platform || '';
    if (/win/i.test(platform) || /Windows/i.test(ua)) {
        if (data?.getHighEntropyValues) {
            try {
                const { platformVersion } = await data.getHighEntropyValues(['platformVersion']);
                const major = Number(String(platformVersion || '').split('.')[0]);
                if (major >= 13) return { os: 'windows11', mobile };
                if (major > 0) return { os: 'windows10', mobile };
            } catch {
                // fall through to the user agent
            }
        }
        return { os: /Windows NT (6\.[0-3]|5\.)/.test(ua) ? 'windowsOld' : 'windows10', mobile };
    }
    if (/mac/i.test(platform) || /Mac OS X/.test(ua)) return { os: 'macos', mobile };
    if (/SteamOS|Valve Steam/i.test(ua)) return { os: 'steamos', mobile };
    if (/linux|cros|x11/i.test(platform) || /Linux|CrOS|X11/.test(ua)) return { os: 'linux', mobile };
    return { os: null, mobile };
}

export async function detectHardware() {
    const gpuRaw = webglRenderer();
    const cleaned = gpuRaw ? cleanRendererString(gpuRaw) : null;
    const match = cleaned ? matchGpu(cleaned) || matchGpu(gpuRaw) : null;
    const memory = typeof navigator !== 'undefined' ? Number(navigator.deviceMemory) : NaN;
    const { os, mobile } = await detectOs();

    // Safari/Firefox often hide the real GPU ("Apple GPU", "Mali-G78"): keep it as a hint only
    const vague = !match && (!cleaned || /^(apple gpu|webkit webgl|mozilla|generic|swiftshader|llvmpipe)/i.test(cleaned));

    return {
        gpu: match?.name || (vague ? null : cleaned),
        gpuRaw,
        gpuRecognized: Boolean(match),
        ramGb: Number.isFinite(memory) && memory > 0 ? memory : null,
        ramIsLowerBound: Number.isFinite(memory) && memory >= 8,
        threads: typeof navigator !== 'undefined' && navigator.hardwareConcurrency ? navigator.hardwareConcurrency : null,
        os,
        mobile,
    };
}
