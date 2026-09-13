import React, { useState, useEffect } from "react";
import '../body.css';
import SectionHeader, { SectionLoader } from '../Components/SectionHeader.jsx';

export default function RotateGamingNews({ articles, name }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!articles?.length) return;
        const interval = setInterval(() => setCurrentIndex(i => (i + 1) % articles.length), 20000);
        return () => clearInterval(interval);
    }, [articles]);

    if (!articles || articles.length === 0) {
        return <SectionLoader title={name} />;
    }

    const next = () => setCurrentIndex(i => (i + 1) % articles.length);
    const prev = () => setCurrentIndex(i => (i - 1 + articles.length) % articles.length);

    return (
        <div>
            <SectionHeader title={name} subtitle="Headlines from around the industry" onPrev={prev} onNext={next} />
            <div className="gh-scroller overflow-hidden -mx-2">
                <div className="gh-track flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                    {articles.map((article) => (
                        <div key={article.url} className="flex-none w-[78%] sm:w-[46%] md:w-1/3 lg:w-1/4 px-2">
                            <a
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group block h-full"
                            >
                                <div className="aspect-[16/9] overflow-hidden rounded-xl bg-[#111319] border border-white/[0.06]">
                                    {article.urlToImage && (
                                        <img
                                            loading="lazy"
                                            decoding="async"
                                            src={article.urlToImage}
                                            alt=""
                                            width="365"
                                            height="206"
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                        />
                                    )}
                                </div>
                                <p className="mt-3 text-xs text-[#6b7080]">
                                    {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    {article.author ? ` · ${article.author}` : ''}
                                </p>
                                <h3 className="mt-1 text-[15px] font-semibold leading-snug text-[#eceef2] group-hover:text-white group-hover:underline decoration-white/30 underline-offset-4 line-clamp-2">{article.title}</h3>
                                <p className="mt-1.5 text-sm text-[#8a8f9c] line-clamp-2">{article.description}</p>
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
