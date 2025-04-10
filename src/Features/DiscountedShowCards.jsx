import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../Features/UserContext.jsx';

export default function DiscountedShowCards({ selectedGame, closeModal, modalVisible }) {
  const { user } = useContext(UserContext);
  const [error, setError] = useState('');
  const [fav, setFav] = useState(false);
  const [favok, setFavok] = useState([]);
  const [priceDifference, setPriceDifference] = useState(0);

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
    const differences = [5, 10, 15];
    const randomDifference = differences[Math.floor(Math.random() * differences.length)];
    setPriceDifference(randomDifference);
  }, [selectedGame]);

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
    if (favok.length >= 0 && selectedGame) {
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
  const originalPrice = (selectedGame.discountPrice || 0) + priceDifference;

  return (
    <div className="modal show fixed inset-0 bg-black bg-opacity-75 flex z-50" id="game-modal">
      <div className="modal-content bg-gray-900 rounded-lg sm:max-w-lg mx-4 sm:mx-auto my-8 p-6 overflow-y-auto max-h-screen sm:max-h-[80vh]">
        <div className='flex justify-between items-start mb-4'>
          <div>
            {fav ? (
              <button  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm" onClick={delFav} > Remove from Favorites</button>
            ) : (
              <button  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm" onClick={addFav}> Add to Favorites </button>)}
          </div>
          <button  className="text-white text-2xl font-bold hover:text-gray-300" onClick={closeModal} > &times;</button>
        </div>
        
        {error && <p className="error text-red-500 text-sm mb-4">{error}</p>} 
        <img src={selectedGame.background_image} alt={selectedGame.name} className="rounded-lg mb-4 w-full h-48 sm:h-64 object-cover"/>
        
        <h2 className="text-2xl font-bold mb-2 text-white">{selectedGame.name}</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-800 p-3 rounded-lg">
            <p className="text-gray-400 text-sm">Original Price</p>
            <p className="text-white line-through">${originalPrice}</p>
          </div>
          <div className="bg-green-900 p-3 rounded-lg">
            <p className="text-gray-300 text-sm">Discounted Price</p>
            <p className="text-white font-bold">${selectedGame.discountPrice || "0.00"}</p>
          </div>
        </div>
        
        <div className="bg-gray-800 p-3 rounded-lg mb-4">
          <p className="text-gray-400 text-sm">Deal Status</p>
          <p className="text-green-500 font-medium">{selectedGame.Status || "?"}</p>
        </div>

        <div className="bg-blue-900 p-3 rounded-lg">
          <p className="text-gray-300 text-sm">You Save</p>
          <p className="text-white font-bold">${priceDifference} (${((priceDifference / originalPrice) * 100).toFixed(0)}%)</p>
        </div>
      </div>
    </div>
  );
}