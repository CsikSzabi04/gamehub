import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../Features/UserContext.jsx';
import { IoAddCircleOutline } from "react-icons/io5";
import { MdDeleteForever, MdClose, MdStar, MdStore, MdShoppingCart } from "react-icons/md";
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={closeModal}
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              onClick={closeModal}
            >
              <MdClose className="w-5 h-5 text-white" />
            </button>

            <div className="relative h-64 md:h-80 overflow-hidden rounded-t-3xl">
              <img 
                src={selectedGame.background_image} 
                alt={selectedGame.name} 
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>
              
              {discountPercent > 0 && (
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-bold flex items-center gap-1">
                  <MdShoppingCart className="text-sm" />
                  -{discountPercent}% OFF
                </div>
              )}
            </div>

            <div className="p-6 md:p-8 -mt-12 relative">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">{selectedGame.name}</h2>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="p-2 rounded-lg bg-gray-500/20 text-gray-400">
                    <MdStore className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Original Price</p>
                    <p className="text-sm text-gray-400 line-through">${originalPrice.toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-green-500/20 border border-green-500/30">
                  <div className="p-2 rounded-lg bg-green-500/30 text-green-400">
                    <MdShoppingCart className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Discounted Price</p>
                    <p className="text-lg text-green-400 font-bold">${discountedPrice.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="p-2 rounded-lg bg-green-500/20 text-green-400">
                    <MdStar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Deal Status</p>
                    <p className="text-sm text-green-400 font-medium">{selectedGame.Status || "Active"}</p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-4 border-t border-white/10">
                {fav ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={delFav}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 font-semibold hover:bg-red-500/30 transition-all"
                  >
                    <MdDeleteForever className="w-5 h-5" />
                    Remove
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={addFav}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 text-white font-semibold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all"
                  >
                    <IoAddCircleOutline className="w-5 h-5" />
                    Add to Favorites
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
