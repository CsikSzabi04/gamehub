import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../Features/UserContext.jsx';
import { IoAddCircleOutline } from "react-icons/io5";
import { MdDeleteForever } from "react-icons/md";

export default function ShowCardsSearch({ selectedGame, closeModal, modalVisible }) {
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
      try {
        const resp = await fetch(`https://gamehub-backend-zekj.onrender.com/getFav?userId=${user.uid}`);
        const json = await resp.json();
        setFavok(json);
      } catch (err) {
        console.error("Failed to fetch favorites:", err);
      }
    }
    if (user) {
      getFavok();
    }
  }, [user, fav]);

  useEffect(() => {
    if (selectedGame && favok) {
      const isFavorite = favok.some(o => o.gameId === selectedGame.gameID);
      setFav(isFavorite);
    }
  }, [selectedGame, favok]);

  const handleAddFavorite = (e) => {
    e.stopPropagation();
    addFav();
  };

  const handleRemoveFavorite = (e) => {
    e.stopPropagation();
    delFav();
  };

  async function addFav() {
    if (!user) {
      setError("You must log in to add favorites.");
      return;
    }

    try {
      const favData = {
        name: selectedGame.external,
        gameId: selectedGame.gameID,
        userId: user.uid
      };

      const resp = await fetch("https://gamehub-backend-zekj.onrender.com/addfav", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(favData),
      });

      if (resp.ok) {
        setFav(true);
        setFavok([...favok, favData]);
        setError('');
      } else {
        setError("Failed to add to favorites.");
      }
    } catch (err) {
      setError("An error occurred while adding favorite.");
      console.error(err);
    }
  }

  async function delFav() {
    try {
      const resp = await fetch(`https://gamehub-backend-zekj.onrender.com/delfav/${selectedGame.gameID}`, {
        method: "DELETE",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid }),
      });

      if (resp.ok) {
        setFavok(favok.filter(favItem => favItem.gameId !== selectedGame.gameID));
        setFav(false);
        setError('');
      } else {
        setError("Failed to delete from favorites.");
      }
    } catch (err) {
      setError("An error occurred while deleting favorite.");
      console.error(err);
    }
  }

  if (!selectedGame) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={closeModal}
    >
      <div 
        className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >

        <div className="sticky top-0 bg-gray-900/80 backdrop-blur-sm p-4 border-b border-gray-800 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-white line-clamp-1 pr-4">
            {selectedGame.external}
          </h2>
          <button 
            onClick={closeModal}
            className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="relative aspect-video w-full">
          <img
            src={selectedGame.thumb || `https://via.placeholder.com/800x450?text=${encodeURIComponent(selectedGame.external)}`}
            alt={selectedGame.external}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute bottom-4 right-4 bg-green-600 text-white font-bold px-3 py-1 rounded-md text-sm">
            ${selectedGame.cheapest}
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            {fav ? (
              <button 
                onClick={handleRemoveFavorite}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors justify-center"
              >
                <MdDeleteForever className="text-lg" />
                Remove from Favorites
              </button>
            ) : (
              <button 
                onClick={handleAddFavorite}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors  justify-center"
              >
                <IoAddCircleOutline className="text-lg" />
                Add to Favorites
              </button>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-900/50 text-red-200 rounded-lg text-sm">
              {error}
            </div>
          )}

          <a
            href={`https://rawg.io/games/${selectedGame.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="w-full inline-flex items-center justify-center bg-blue-900 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-md text-sm transition-colors duration-200"
          >
            View Details
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}