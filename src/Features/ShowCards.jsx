import React, { useContext, useState, useEffect, lazy, Suspense } from 'react';
import { UserContext } from '../Features/UserContext.jsx';
import { Link, useNavigate } from 'react-router-dom';
import { IoAddCircleOutline } from "react-icons/io5";
import { MdDeleteForever, MdClose, MdStar, MdCalendarToday, MdGamepad, MdStore, MdRateReview } from "react-icons/md";
import { motion, AnimatePresence } from 'framer-motion';
import { useT } from '../i18n/index.jsx';

const SteamInsights = lazy(() => import('../Hub/SteamInsights.jsx'));

export default function ShowCards({ selectedGame, closeModal, modalVisible }) {
  const { t } = useT();
  const { user } = useContext(UserContext);
  const [error, setError] = useState('');
  const [fav, setFav] = useState(false);
  const [favok, setFavok] = useState([]);

  useEffect(() => {
    if (modalVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [modalVisible]);

  useEffect(() => {
    async function getFavok() {
      if (!user?.uid) return;
      const resp = await fetch(`https://gamehub-backend-zekj.onrender.com/getFav?userId=${user.uid}`);
      const json = await resp.json();
      setFavok(json);
    }
    if (user) {
      getFavok();
    }

  }, [user, fav]);

  useEffect(() => {
    if (selectedGame && favok.length >= 0) {
      const isFavorite = favok.some(o => o.gameId === selectedGame.id);
      setFav(isFavorite);
    }
  }, [selectedGame, favok]);


  async function addFav() {
    if (!user) {
      setError("cards.loginRequired");
      return;
    }

    const favData = { name: selectedGame.name, gameId: selectedGame.id, userId: user.uid };
    const resp = await fetch("https://gamehub-backend-zekj.onrender.com/addfav", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(favData),
    });

    if (resp.ok) {
      setFavok([...favok, favData]);
      setFav(true);
    } else {
      setError("cards.addFailed");
    }
  }

  async function delFav() {
    const favData = { userId: user.uid };
    const resp = await fetch(`https://gamehub-backend-zekj.onrender.com/delfav/${selectedGame.id}`, {
      method: "DELETE",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(favData),
    });

    if (resp.ok) {
      setFavok(favok.filter(favItem => favItem.gameId !== selectedGame.id));
      setFav(false);
    } else {
      setError("cards.deleteFailed");
    }
  }

  if (!selectedGame) return null;

  const platforms = selectedGame.platforms?.map(p => p.platform.name).join(", ");
  const stores = selectedGame.stores?.map(s => s.store.name) || [];

  return (
    <AnimatePresence>
      {modalVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75"
          onClick={closeModal}
        >
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 12, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-2xl max-h-[92svh] sm:max-h-[90vh] overflow-y-auto overscroll-contain custom-scrollbar rounded-t-2xl sm:rounded-2xl bg-[#111319] border border-white/[0.08] shadow-[0_24px_60px_rgba(0,0,0,0.6)]"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button
              className="gh-icon-btn absolute top-3 right-3 z-10 !bg-black/60"
              onClick={closeModal}
              aria-label={t("common.close")}
            >
              <MdClose className="w-5 h-5" />
            </button>

            <div className="relative aspect-[16/9] sm:aspect-[16/8] overflow-hidden rounded-t-2xl bg-[#171a22]">
              <img
                src={selectedGame.background_image}
                alt={selectedGame.name}
                className="w-full h-full object-cover"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111319] via-transparent to-transparent"></div>
            </div>

            <div className="px-4 sm:px-6 md:px-8 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:pb-6 md:pb-8 -mt-8 sm:-mt-10 relative">
              <h2 className="!mb-0 text-xl sm:text-2xl md:text-3xl font-extrabold text-white break-words">{selectedGame.name}</h2>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#a1a6b3]">
                {selectedGame.rating ? (
                  <span className="inline-flex items-center gap-1.5">
                    <MdStar className="text-amber-400" />
                    <span className="font-semibold text-white">{selectedGame.rating}</span> / 5
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1.5">
                  <MdCalendarToday className="text-[#6b7080]" />
                  {selectedGame.released || t('cards.tba')}
                </span>
              </div>

              <dl className="mt-6 divide-y divide-white/[0.06] border-y border-white/[0.06]">
                <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr] gap-1 sm:gap-4 py-3">
                  <dt className="gh-eyebrow pt-0.5 flex items-center gap-1.5"><MdGamepad /> {t('cards.platforms')}</dt>
                  <dd className="text-sm text-[#d4d7de]">{platforms || '—'}</dd>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr] gap-1 sm:gap-4 py-3">
                  <dt className="gh-eyebrow pt-0.5 flex items-center gap-1.5"><MdStore /> {t('cards.stores')}</dt>
                  <dd className="text-sm text-[#d4d7de]">{stores.length ? stores.join(', ') : t('cards.noStores')}</dd>
                </div>
              </dl>

              {selectedGame.tags?.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {selectedGame.tags.slice(0, 8).map((g, i) => (
                    <span key={i} className="gh-chip">{g.name}</span>
                  ))}
                </div>
              )}

              <Suspense fallback={null}>
                <SteamInsights name={selectedGame.name} />
              </Suspense>

              {error && (
                <p className="mt-5 text-sm text-red-400">{t(error)}</p>
              )}

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                {fav ? (
                  <button onClick={delFav} className="gh-btn gh-btn-secondary flex-1 !h-11">
                    <MdDeleteForever className="w-5 h-5 text-[#f87171]" />
                    {t('cards.removeFavorite')}
                  </button>
                ) : (
                  <button onClick={addFav} className="gh-btn gh-btn-primary flex-1 !h-11">
                    <IoAddCircleOutline className="w-5 h-5" />
                    {t('cards.addFavorite')}
                  </button>
                )}
                <Link to={`/allreview/${selectedGame.id}`} className="gh-btn gh-btn-secondary flex-1 !h-11">
                  <MdRateReview className="w-5 h-5" />
                  {t('cards.gamePage')}
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
