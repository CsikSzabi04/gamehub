import React, { useState, useEffect } from "react";
import { API_BASE, useApi } from "../Components/apiCache.js";
import SectionHeader, { SectionLoader } from "../Components/SectionHeader.jsx";

const toNews = data => (Array.isArray(data) ? data : []);

// Card width as a percentage of the track, matching w-[80%] sm:w-1/2 md:w-1/3 lg:w-1/4
function getCardPercent() {
  if (window.innerWidth >= 1024) return 25;
  if (window.innerWidth >= 768) return 100 / 3;
  if (window.innerWidth >= 640) return 50;
  return 80;
}

export default function News() {
  const { data: newsItems, loading } = useApi(`${API_BASE}/news`, toNews);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardPercent, setCardPercent] = useState(getCardPercent);

  useEffect(() => {
    const handleResize = () => setCardPercent(getCardPercent());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const total = Array.isArray(newsItems) ? newsItems.length : 0;
  const maxIndex = Math.max(0, total - Math.floor(100 / cardPercent));

  useEffect(() => {
    if (!total) return;
    const rotateInterval = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex >= maxIndex ? 0 : prevIndex + 1));
    }, 20000);
    return () => clearInterval(rotateInterval);
  }, [total, maxIndex]);

  const nextItem = () => setCurrentIndex(prevIndex => (prevIndex >= maxIndex ? 0 : prevIndex + 1));
  const prevItem = () => setCurrentIndex(prevIndex => (prevIndex <= 0 ? maxIndex : prevIndex - 1));

  return (
    <section id="news" className="!mb-12">
      {loading || !newsItems ? (
        <SectionLoader title="Latest Steam news" height="h-[320px]" />
      ) : (
        <>
          <SectionHeader title="Latest Steam news" onPrev={prevItem} onNext={nextItem} />
          <div className="gh-scroller relative overflow-hidden -mx-2">
            <div
              className="gh-track flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${Math.min(currentIndex, maxIndex) * cardPercent}%)` }}
            >
              {newsItems.map((news) => (
                <div key={news.id} className="flex-none w-[78%] sm:w-[46%] md:w-1/3 lg:w-1/4 px-2">
                  <a
                    href={news.game_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="game-card group h-full flex flex-col"
                  >
                    <div className="aspect-[16/9] overflow-hidden bg-[#171a22]">
                      {news.thumbnail && (
                        <img loading="lazy" decoding="async" src={news.thumbnail} alt="" width="365" height="206" className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="text-[15px] font-semibold text-white line-clamp-2">{news.title}</h3>
                      <p className="text-sm text-[#8a8f9c] mt-1.5 line-clamp-3">{news.short_description}</p>
                      <div className="mt-auto pt-4 flex items-center justify-between gap-3 text-xs text-[#6b7080]">
                        <span className="truncate">{news.publisher}</span>
                        <span className="flex-shrink-0">{news.release_date}</span>
                      </div>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
