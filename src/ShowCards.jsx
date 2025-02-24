import React from 'react';
export default function ShowCards({ selectedGame, closeModal, modalVisible}) {

    if (!selectedGame) return null;

    return (
    <div className="modal show fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50" id="game-modal">
        <div className="modal-content bg-gray-900 p-6 rounded-lg max-w-md w-full">
            <span className="close-button" onClick={closeModal}>&times;</span>
            <img src={selectedGame.background_image} alt={selectedGame.name} className="rounded-lg mb-4 w-full object-cover" />
            <h2 className="text-3xl font-bold mb-4">{selectedGame.name}</h2>
            <p>Release Date: {selectedGame.released || "?"}</p>
            <p>Rating: {selectedGame.rating || "N/A"}/5</p>
            <p>Stores: {selectedGame.stores ? selectedGame.stores.map(store => store.store.name).join(", ") : "?"}</p>
            <p>Platforms: {selectedGame.platforms ? selectedGame.platforms.map(p => p.platform.name).join(", ") : "?"}</p>
            <div className="row">
                <p>Genres: <div id="tag"> {selectedGame.tags ? selectedGame.tags.map(g => g.name).join(", ") : "?"}</div></p>
            </div>
            <div className="collapsible">
                <div className="collapsible-header">Minimum Requirements </div>
                <ul className="collapsible-content">
                    <li>{selectedGame.requirements}</li>
                </ul>
            </div>
        </div>
    </div>
    );
}