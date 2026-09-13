import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../Features/UserContext.jsx';
import { IoAddCircleOutline } from "react-icons/io5";
import { MdDeleteForever, MdClose, MdStore } from "react-icons/md";
import { motion, AnimatePresence } from 'framer-motion';

export default function DiscountedShowCards({ selectedGame, closeModal, modalVisible }) {
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
      const resp = await fetch(`https://gamehub-backend-zekj.onrender.com/getFav?userId=${user?.uid}`);
      const json = await resp.json();
      setFavok(json);
    }
    if (user) {
      getFavok();
    }
  }, [user, fav]);

  useEffect(() => {
    if (selectedGame && favok) {
      const isFavorite = favok.some(item => item.gameId === selectedGame.id);
      setFav(isFavorite);
    }
  }, [selectedGame, favok]);

  async function addFav() {
    if (!user) {
      setError("You must log in to add favorites.");
      return;
    }

    const favData = { 
      name: selectedGame.name, 
      gameId: selectedGame.id, 
      userId: user.uid,
      background_image: selectedGame.background_image
    };
    
    const resp = await fetch("https://gamehub-backend-zekj.onrender.com/addfav", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(favData),
    });

    if (resp.ok) {
      setFavok([...favok, favData]);
      setFav(true);
    } else {
      setError("Failed to add to favorites.");
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
      setError("Failed to delete from favorites.");
    }
  }

  if (!selectedGame) return null;

  const discountedPrice = selectedGame.discountPrice || 0;
  const originalPrice = selectedGame.originalPrice * 1.3 || discountedPrice * 1.3;
  const discountPercent = originalPrice > 0 ? Math.round((1 - discountedPrice / originalPrice) * 100) : 0;

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
            className="relative w-full max-w-xl max-h-[92svh] sm:max-h-[90vh] overflow-y-auto overscroll-contain custom-scrollbar rounded-t-2xl sm:rounded-2xl bg-[#111319] border border-white/[0.08] shadow-[0_24px_60px_rgba(0,0,0,0.6)]"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button className="gh-icon-btn absolute top-3 right-3 z-10 !bg-black/60" onClick={closeModal} aria-label="Close">
              <MdClose className="w-5 h-5" />
            </button>

            <div className="aspect-[16/9] overflow-hidden rounded-t-2xl bg-[#171a22]">
              <img src={selectedGame.background_image} alt={selectedGame.name} className="w-full h-full object-cover" decoding="async" />
            </div>

            <div className="p-4 sm:p-6 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:pb-6">
              <div className="flex items-start justify-between gap-4">
                <h2 className="!mb-0 text-xl sm:text-2xl font-extrabold text-white">{selectedGame.name}</h2>
                {discountPercent > 0 && (
                  <span className="flex-shrink-0 rounded-md bg-emerald-500/15 px-2 py-1 text-sm font-bold text-emerald-400">-{discountPercent}%</span>
                )}
              </div>

              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-3xl font-bold text-white">${discountedPrice.toFixed(2)}</span>
                <span className="text-base text-[#6b7080] line-through">${originalPrice.toFixed(2)}</span>
              </div>

              <div className="mt-4 flex items-center gap-2 text-sm text-[#a1a6b3]">
                <MdStore className="text-[#6b7080]" />
                Epic Games Store
                <span className="text-[#3a3f4b]">·</span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {String(selectedGame.Status || "Active").toLowerCase().replace(/^./, c => c.toUpperCase())}
                </span>
              </div>

              {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

              <div className="mt-6 pt-5 border-t border-white/[0.06]">
                {fav ? (
                  <button onClick={delFav} className="gh-btn gh-btn-secondary w-full !h-11">
                    <MdDeleteForever className="w-5 h-5 text-[#f87171]" />
                    Remove from favorites
                  </button>
                ) : (
                  <button onClick={addFav} className="gh-btn gh-btn-primary w-full !h-11">
                    <IoAddCircleOutline className="w-5 h-5" />
                    Add to favorites
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
