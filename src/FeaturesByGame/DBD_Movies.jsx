import React, { useEffect, useState } from "react";

const DBD_PRIMARY_URL = "https://www.dbdwiki.eu/";
const DBD_FALLBACK_URL = "https://dbdwiki.vercel.app/";
const DEBATER_URL = "https://debaterweb.vercel.app/";

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
    const dbdUrl = useDbdUrl();

    const projects = [
        { href: DEBATER_URL, img: '/dabter.webp', w: 1000, h: 522, title: 'Debater', text: 'Rank every character in fiction, vote on the lists and open debates.' },
        { href: dbdUrl, img: '/dbd.webp', w: 1000, h: 448, title: 'Dead By Daylight', text: 'A wiki for one of my favourite games.' },
    ];

    return (
        <section id="more-projects" className="!mb-12">
            <h2 className="gh-section-title !mb-4">More from us</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {projects.map(project => (
                    <a
                        key={project.title}
                        href={project.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="game-card group flex flex-col sm:flex-row lg:flex-col xl:flex-row"
                    >
                        <div className="aspect-[16/9] sm:aspect-auto sm:w-2/5 lg:w-full lg:aspect-[16/9] xl:aspect-auto xl:w-2/5 flex-shrink-0 overflow-hidden bg-[#171a22]">
                            <img src={project.img} alt={project.title} loading="lazy" decoding="async" width={project.w} height={project.h} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-4 sm:p-5 flex flex-col justify-center min-w-0">
                            <h3 className="text-base font-semibold text-white">{project.title}</h3>
                            <p className="mt-1 text-sm text-[#8a8f9c] leading-relaxed">{project.text}</p>
                            <span className="mt-3 text-xs font-medium text-[#c9ccd4] group-hover:text-white">Visit site →</span>
                        </div>
                    </a>
                ))}
            </div>
        </section>
    );
}
