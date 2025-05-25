import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../Features/UserContext.jsx';
import { IoAddCircleOutline } from "react-icons/io5";
import { MdDeleteForever } from "react-icons/md";
import { FaAngleLeft, FaChevronRight } from 'react-icons/fa6';

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
    const differences = [10];
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

  const discountedPrice = selectedGame.discountPrice || 0;
  const originalPrice = discountedPrice + priceDifference;
  return (
    <div className="modal show fixed inset-0 bg-black bg-opacity-75 flex z-50 items-center justify-center p-4">
      <div className="modal-content bg-gray-900 rounded-lg w-full max-w-md mx-auto p-6 overflow-y-auto max-h-[90vh]">
        <div className='flex justify-between items-start mb-4'>
          <div>{fav ? (<button className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full text-lg md:text-xl"onClick={delFav}> <MdDeleteForever /></button>) : ( <button className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-full text-lg md:text-xl"onClick={addFav} ><IoAddCircleOutline /> </button> )}</div>
          <button  className="text-white text-2xl md:text-3xl font-bold hover:text-gray-300 p-1" onClick={closeModal} > &times;</button>
        </div>
        {error && <p className="error text-red-500 text-sm mb-4 text-center">{error}</p>}
        <img  loading="lazy" src={selectedGame.background_image} alt={selectedGame.name} className="rounded-lg mb-4 w-full h-48 md:h-64 object-cover"/>
        <h2 className="text-xl md:text-2xl font-bold mb-2 text-white text-center">{selectedGame.name}</h2>
        <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4">
          <div className="bg-gray-800 p-2 md:p-3 rounded-lg">
            <p className="text-gray-400 text-xs md:text-sm">Original Price</p>
            <p className="text-white line-through text-sm md:text-base">${(selectedGame.originalPrice * 1.3).toFixed(2)} </p>
          </div>
          <div className="bg-green-900 p-2 md:p-3 rounded-lg">
            <p className="text-gray-300 text-xs md:text-sm">Discounted Price</p>
            <p className="text-white font-bold text-sm md:text-base">${(selectedGame.discountPrice / 1).toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-gray-800 p-3 rounded-lg w-full max-w-xs mx-auto">
          <p className="text-gray-400 text-xs md:text-sm text-center">Deal Status</p>
          <p className="text-green-500 font-medium text-sm md:text-base text-center">{selectedGame.Status || "Active"}</p>
        </div>
      </div>
    </div>
  );
}