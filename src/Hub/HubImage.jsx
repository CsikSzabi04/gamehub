import React, { useEffect, useState } from 'react';
import { mirrorSrc, optimizedSrc } from '../Components/imageMirror.js';

/**
 * Lazy image for third-party game artwork.
 * Tries, in order: our build-time mirror → a resized WebP from the image proxy → the original URL
 * → the item's initial as a placeholder. (Some APIs serve 1 MB PNGs for ~250 px cards.)
 */
export default function HubImage({ src, alt, className = '', fit = 'cover', width = 480 }) {
    const [attempt, setAttempt] = useState(0);
    useEffect(() => setAttempt(0), [src]);

    const candidates = src ? [...new Set([mirrorSrc(src) === src ? optimizedSrc(src, width) : mirrorSrc(src), src])] : [];
    const current = candidates[attempt];

    if (!current) {
        return (
            <div className={`flex items-center justify-center bg-[#171a22] text-2xl font-bold text-[#3a3f4b] ${className}`}>
                {(alt || '?').trim()[0]?.toUpperCase()}
            </div>
        );
    }

    return (
        <img
            src={current}
            alt={alt}
            loading="lazy"
            decoding="async"
            onError={() => setAttempt(a => a + 1)}
            className={`${fit === 'contain' ? 'object-contain' : 'object-cover'} ${className}`}
        />
    );
}
