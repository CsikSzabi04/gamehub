import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../Features/UserContext.jsx';
import { IoAddCircleOutline } from "react-icons/io5";
import { MdDeleteForever } from "react-icons/md";

export default function ShowCards({ selectedGame, closeModal, modalVisible }) {
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
      const resp = await fetch(`https://gamehub-backend-zekj.onrender.com/getFav?userId=${user.uid}`);
      const json = await resp.json();
      setFavok(json);
    }
    if (user) {
      getFavok();
    }

  }, [user, fav]);

  useEffect(() => {
    if (favok.length >= 0 && selectedGame) {
      for (let o of favok) {
        if (o.gameId != selectedGame.id) {
          setFav(false)
        } else {
          setFav(true)
        }
      }
    }
  }, [selectedGame, fav]);


  async function addFav() {
    if (!user) {
      setError("You must log in to add favorites.");
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

  return (
    <div className="modal show fixed inset-0 bg-black bg-opacity-75 flexz-50 " id="game-modal">
      <div className="modal-content fr rounded-lg sm:max-w-lg mx-4 sm:mx-0 sm:p-8 overflow-y-auto max-h-screen sm:max-h-[80vh] md:max-h-[80%] ">
        <div className='flex justify-between items-start mb-4'>
          <div>{fav ? (<button className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full text-lg md:text-xl" onClick={delFav}> <MdDeleteForever /></button>) : (<button className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-full text-lg md:text-xl" onClick={addFav} ><IoAddCircleOutline /> </button>)}</div>
          <button className="text-white text-2xl md:text-3xl font-bold hover:text-gray-300 p-1" onClick={closeModal} > &times;</button>
        </div>
        {error && <> <br /><br /> <p className="error text-red-500 text-sm mt-2">{error}</p></>}
        <img src={selectedGame.background_image} alt={selectedGame.name} className="rounded-lg mb-4 mt-8 object-cover w-full sm:h-80"  loading="lazy" />
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">{selectedGame.name}</h2>
        <p className="text-sm sm:text-base">Release Date: {selectedGame.released}</p>
        <p className="text-sm sm:text-base">Rating: {selectedGame.rating}/5</p>
        <p className="text-sm sm:text-base">Stores: {selectedGame.stores ? selectedGame.stores.map(store => store.store.name).join(", ") : "?"}</p>
        <p className="text-sm sm:text-base">Platforms: {selectedGame.platforms ? selectedGame.platforms.map(p => p.platform.name).join(", ") : "?"}</p>
        <div>
          <span className="font-medium">Genres:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {selectedGame.tags?.map((g, i) => (
              <span key={i} className="bg-gray-700 px-2 py-1 rounded text-xs">{g.name}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}