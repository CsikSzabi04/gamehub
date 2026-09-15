import React, { useEffect, useState } from "react";
import { useT } from "../i18n/index.jsx";

const DBD_PRIMARY_URL = "https://www.dbdwiki.eu/";
const DBD_FALLBACK_URL = "https://dbdwiki.vercel.app/";
const DEBATER_URL = "https://debaterweb.vercel.app/";
const FORARCH_URL = "https://forarch.vercel.app/";

const DBD_CHECK_KEY = "dbdWikiCheck";
const ONE_DAY = 24 * 60 * 60 * 1000;

function readDbdCheck() {
    try {
        return JSON.parse(localStorage.getItem(DBD_CHECK_KEY)) || null;
    } catch {
        return null;
    }
}

function writeDbdCheck(url) {
    try {
        localStorage.setItem(DBD_CHECK_KEY, JSON.stringify({ url, checkedAt: Date.now() }));
    } catch {
        // storage unavailable - the check just runs again next visit
    }
}

// no-cors fetch resolves on any server response and rejects when the domain doesn't resolve / is unreachable
async function isReachable(url, timeoutMs = 6000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        await fetch(url, { mode: "no-cors", cache: "no-store", signal: controller.signal });
        return true;
    } catch {
        return false;
    } finally {
        clearTimeout(timer);
    }
}

function useDbdUrl() {
    const [url, setUrl] = useState(() => readDbdCheck()?.url || DBD_PRIMARY_URL);

    useEffect(() => {
        const cached = readDbdCheck();
        if (cached && Date.now() - cached.checkedAt < ONE_DAY) return;

        let cancelled = false;
        isReachable(DBD_PRIMARY_URL).then((ok) => {
            const resolved = ok ? DBD_PRIMARY_URL : DBD_FALLBACK_URL;
            writeDbdCheck(resolved);
            if (!cancelled) setUrl(resolved);
        });
        return () => { cancelled = true; };
    }, []);

    return url;
}

export default function DBD_Movies() {
    const { t } = useT();
    const dbdUrl = useDbdUrl();

    const projects = [
        { href: DEBATER_URL, img: '/dabter.webp', w: 1000, h: 522, title: 'Debater', text: t('dbd.moreProjects.debater') },
        { href: dbdUrl, img: '/dbd.webp', w: 1000, h: 448, title: 'DBD Wiki', text: t('dbd.moreProjects.dbd') },
        { href: FORARCH_URL, img: '/forarch.png', w: 1012, h: 980, imgPos: 'object-top', title: 'ForArch', text: t('dbd.moreProjects.forarch') },
    ];

    return (
        <section id="more-projects" className="!mb-12">
            <h2 className="gh-section-title !mb-4">{t('dbd.moreProjects.title')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {projects.map(project => (
                    <a
                        key={project.title}
                        href={project.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="game-card group flex flex-col sm:flex-row lg:flex-col xl:flex-row"
                    >
                        <div className="relative aspect-[16/9] sm:aspect-auto sm:w-2/5 lg:w-full lg:aspect-[16/9] xl:aspect-auto xl:w-2/5 sm:min-h-[8.5rem] flex-shrink-0 overflow-hidden bg-[#171a22]">
                            {project.img ? (
                                // absolute so a tall image gets cropped instead of stretching the card
                                <img src={project.img} alt={project.title} loading="lazy" decoding="async" width={project.w} height={project.h} className={`absolute inset-0 w-full h-full object-cover ${project.imgPos || ''}`} />
                            ) : (
                                <div className="w-full h-full min-h-[8rem] flex items-center justify-center bg-gradient-to-br from-[#2a1a4d] via-[#171a22] to-[#0f2a33]">
                                    <span className="text-2xl font-bold tracking-tight text-white/90">{project.title}</span>
                                </div>
                            )}
                        </div>
                        <div className="p-4 sm:p-5 flex flex-col justify-center min-w-0">
                            <h3 className="text-base font-semibold text-white">{project.title}</h3>
                            <p className="mt-1 text-sm text-[#8a8f9c] leading-relaxed">{project.text}</p>
                            <span className="mt-3 text-xs font-medium text-[#c9ccd4] group-hover:text-white">{t('dbd.moreProjects.visit')}</span>
                        </div>
                    </a>
                ))}
            </div>
        </section>
    );
}
