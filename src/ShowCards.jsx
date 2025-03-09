import React, { useContext, useState } from 'react';
import { UserContext } from './UserContext.jsx'; 

export default function ShowCards({ selectedGame, closeModal, modalVisible }) {
  const [refresh, setRefresh] = useState(false);
  const [name, setName] = useState('');
  const { user } = useContext(UserContext); 
  const [error, setError] = useState('');

  async function addFav() {
    if (!user) {
      setError("You must log in to add favorites.");
      return;
    }
  
    setName(selectedGame.name);
    const fav = { name: selectedGame.name, userId: user.uid }; 
  
    const resp = await fetch("https://gamehub-backend-zekj.onrender.com/addfav", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fav),
    });
  
    if (resp.ok) {
      setRefresh(!refresh);
    } else {
      setError("Failed to add to favorites.");
    }
    setName('');
  }

  if (!selectedGame) return null;

  return (
    <div className="modal show fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50" id="game-modal">
      <div className="modal-content rounded-lg sm:max-w-lg mx-4 sm:mx-0 p-6 sm:p-8">
        <span className="close-button text-2xl font-bold text-white absolute top-3 right-2 cursor-pointer" onClick={closeModal}>&times;</span>
        <span className="add-button bg-blue-500 text-white px-4 py-2 rounded-md cursor-pointer" onClick={addFav}>Add to Fav</span><br />
        {error && <> <br /><br /> <p className="error text-red-500 text-sm mt-2">{error}</p></>} 
        <img src={selectedGame.background_image} alt={selectedGame.name} className="rounded-lg mb-4 mt-8 object-cover w-full sm:h-80" />
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">{selectedGame.name}</h2>
        <p className="text-sm sm:text-base">Release Date: {selectedGame.released || "?"}</p>
        <p className="text-sm sm:text-base">Rating: {selectedGame.rating || "?"}/5</p>
        <p className="text-sm sm:text-base">Stores: {selectedGame.stores ? selectedGame.stores.map(store => store.store.name).join(", ") : "?"}</p>
        <p className="text-sm sm:text-base">Platforms: {selectedGame.platforms ? selectedGame.platforms.map(p => p.platform.name).join(", ") : "?"}</p>
        <div className="row mt-2">
          <p className="text-sm sm:text-base">Genres: 
            <div id="tag" className="text-xs sm:text-sm text-gray-500">
              {selectedGame.tags ? selectedGame.tags.map(g => g.name).join(", ") : "?"}
            </div>
          </p>
        </div>
        <div className="collapsible mt-4">
          <div className="collapsible-header text-lg font-semibold cursor-pointer">Minimum Requirements</div>
          <ul className="collapsible-content list-disc pl-5">
            <li className="text-sm sm:text-base">{selectedGame.requirements}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
