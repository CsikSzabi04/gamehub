import { useState } from "react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from 'framer-motion';
import { BsStarFill } from "react-icons/bs";
import { releaseYear } from "../Components/GameCard.jsx";
import { rawgImg } from "../Components/rawgImage.js";
import { useT } from "../i18n/index.jsx";

const ROTATE_MS = 10000;

export default function MainSection({ allGames, showGameDetails }) {
  const { t } = useT();
  const [randomGames, setRandomGames] = useState([]);
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);

  useEffect(() => {
    setRandomGames([...allGames].sort(() => Math.random() - 0.5).slice(0, 4));
  }, [allGames]);

  useEffect(() => {
    if (randomGames.length > 0) {
      const interval = setInterval(() => {
        setCurrentFeaturedIndex((prevIndex) =>
          (prevIndex + 1) % randomGames.length
        );
      }, ROTATE_MS);
      return () => clearInterval(interval);
    }
  }, [randomGames, currentFeaturedIndex]);

  const currentGame = randomGames[currentFeaturedIndex];

  if (!currentGame) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-12">
        <div className="lg:col-span-9 h-[420px] md:h-[520px] rounded-2xl bg-[#111319] animate-pulse" />
        <div className="hidden lg:flex lg:col-span-3 flex-col gap-2">
          {[...Array(4)].map((_, i) => <div key={i} className="flex-1 rounded-xl bg-[#111319]" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-12">
      {/* Hero */}
      <section className="!mb-0 lg:col-span-9 relative overflow-hidden rounded-2xl bg-[#111319] h-[420px] md:h-[520px]">
        <img
          key={currentGame.id}
          src={rawgImg(currentGame.background_image, 1280)}
          srcSet={`${rawgImg(currentGame.background_image, 640)} 640w, ${rawgImg(currentGame.background_image, 1280)} 1280w`}
          sizes="(min-width: 1024px) 75vw, 100vw"
          alt={currentGame.name}
          fetchPriority="high"
          decoding="async"
          className="animate-fadeIn absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b0f] via-[#0a0b0f]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0b0f]/80 via-transparent to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
          <div key={currentGame.id} className="animate-fadeInUp max-w-xl">
            <p className="gh-eyebrow !text-[#c9ccd4] mb-3">{t('home.hero.featured')}</p>
            <h2 className="!mb-0 text-3xl md:text-5xl font-extrabold text-white leading-[1.05]">
              {currentGame.name}
            </h2>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#c9ccd4]">
              {currentGame.rating ? (
                <span className="inline-flex items-center gap-1.5">
                  <BsStarFill className="text-amber-400 text-xs" />
                  <span className="font-semibold text-white">{currentGame.rating}</span>
                </span>
              ) : null}
              <span>{releaseYear(currentGame.released)}</span>
              {currentGame.genres?.slice(0, 2).map(g => (
                <span key={g.id || g.name} className="text-[#a1a6b3]">{g.name}</span>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={() => showGameDetails(currentGame)} className="gh-btn gh-btn-light !h-11 !px-5">
                {t('home.hero.viewDetails')}
              </button>
              <Link to={`/allreview/${currentGame.id}`} className="gh-btn !h-11 !px-5 bg-white/10 text-white hover:bg-white/20">
                {t('home.hero.reviews')}
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile indicators */}
        <div className="lg:hidden absolute top-4 right-4 flex gap-1.5">
          {randomGames.map((_, index) => (
            <button
              key={index}
              aria-label={t('home.hero.showFeatured', { n: index + 1 })}
              onClick={() => setCurrentFeaturedIndex(index)}
              className={`h-1 rounded-full transition-all duration-300 ${index === currentFeaturedIndex ? 'w-6 bg-white' : 'w-3 bg-white/40'}`}
            />
          ))}
        </div>
      </section>

      {/* Queue */}
      <div className="hidden lg:flex lg:col-span-3 flex-col gap-2">
        {randomGames.map((game, index) => {
          const active = index === currentFeaturedIndex;
          return (
            <button
              key={game.id}
              onClick={() => setCurrentFeaturedIndex(index)}
              className={`relative flex-1 flex items-center gap-3 p-2.5 rounded-xl text-left overflow-hidden transition-colors ${active ? 'bg-[#1e222c]' : 'hover:bg-[#111319]'}`}
            >
              <img
                loading="lazy"
                decoding="async"
                src={rawgImg(game.background_image, 200)}
                alt=""
                width="96"
                height="128"
                className="h-full max-h-28 w-20 flex-shrink-0 rounded-lg object-cover"
              />
              <div className="min-w-0">
                <p className={`text-sm font-semibold leading-snug line-clamp-2 ${active ? 'text-white' : 'text-[#a1a6b3]'}`}>{game.name}</p>
                <p className="text-xs text-[#6b7080] mt-1">{releaseYear(game.released)}</p>
              </div>
              {active && (
                <motion.span
                  key={`progress-${currentFeaturedIndex}`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: ROTATE_MS / 1000, ease: 'linear' }}
                  className="absolute bottom-0 left-0 right-0 h-0.5 origin-left bg-white/30"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
