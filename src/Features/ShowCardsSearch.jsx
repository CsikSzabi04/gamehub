import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../Features/UserContext.jsx'; import { IoAddCircleOutline } from "react-icons/io5"; import { MdDeleteForever } from "react-icons/md";



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
      }, [user,favok]);     
    
      useEffect(() => {
        if (favok.length > 0 && selectedGame) {
          const isFav = favok.some(favItem => favItem.gameId == selectedGame.id);
          setFav(isFav);
        }
      }, [favok, selectedGame]);
    
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
        <div className="modal show fixed inset-0 bg-black bg-opacity-75 flex z-50" id="game-modal">
            <div className="modal-content p-10 bg-gray-900 rounded-lg sm:max-w-lg mx-4 sm:mx-0 sm:p-8 overflow-y-auto max-h-screen sm:max-h-[80vh] md:max-h-[80%] relative  ">
                <div className='flex justify-between items-start'>
                    <div className='inp flex '>
                         <div>{fav ? (<button className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full text-lg md:text-xl"onClick={delFav}> <MdDeleteForever /></button>) : ( <button className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-full text-lg md:text-xl"onClick={addFav} ><IoAddCircleOutline /> </button> )}</div>
                          <button  className="text-white text-2xl md:text-3xl font-bold hover:text-gray-300 p-1" onClick={closeModal} > &times;</button>
                      </div>
                </div>
                {error && <p className="error text-red-500 text-sm mt-2 p-5">{error}</p>}
                <div className="mt-4">
                    <img src={selectedGame.thumb || `https://via.placeholder.com/400x225?text=${encodeURIComponent(selectedGame.external)}`} alt={selectedGame.external} className="rounded-lg mb-4 w-full h-48 sm:h-64 object-cover" />
                    <h2 className="text-2xl sm:text-3xl font-bold mb-2">{selectedGame.external}</h2>
                    <div className="space-y-2">
                        <p className="text-sm sm:text-base">
                            <span className="font-semibold">Price:</span> ${selectedGame.cheapest}
                        </p>
                        <a href={`https://www.cheapshark.com/redirect?dealID=${selectedGame.cheapestDealID}`} target="_blank" rel="noopener noreferrer" className="inline-block mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md" >View Deal on CheapShark </a>
                    </div>
                </div>
            </div>
        </div>
    );
}