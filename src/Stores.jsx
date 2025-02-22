import React, { useEffect, useRef, useState } from "react";

export default function Stores({ modalStoreVisible}) {
    const [store, setStore] = useState([])

    useEffect(() => {
        async function getStores() {
            try {
                const response = await fetch('https://gamehub-backend-zekj.onrender.com/stores');
                const stores = await response.json();

                const dropdown = document.getElementById('stores-dropdown');

                // Urls
                stores.forEach(store => {
                    const link = document.createElement('a');
                    link.textContent = store.storeName;

                    if (store.storeName.toLowerCase() == 'steam') {
                        link.href = 'https://store.steampowered.com/';
                    }
                    else if (store.storeName.toLowerCase() == 'getgamez') {
                        link.href = 'https://getgamez.net/';
                    }
                    else if (store.storeName.toLowerCase() == 'playfield') {
                        link.href = 'https://www.playitstore.hu/';
                    }
                    else if (store.storeName.toLowerCase() == 'imperial games') {
                        link.href = 'https://imperial.games/';
                    }
                    else if (store.storeName.toLowerCase() == 'funstockdigital') {
                        link.href = 'https://funstock.eu';
                    }
                    else if (store.storeName.toLowerCase() == 'razer game store') {
                        link.href = 'https://www.razer.com/eu-en/store';
                    }
                    else {
                        link.href = `https://${store.storeName.toLowerCase().replace(/\s+/g, '')}.com`;
                    }

                    link.target = '_blank';
                    dropdown.appendChild(link);
                });
                setStore(stores)
            } catch (error) { console.log({ "Fetch error: ": error }) }
        }
        getStores()
    }, [])

    function stores() {
        setStoreVisible(true)
        //console.log(store)
    }
    function closeStore() { setStoreVisible(false) }

    if (!modalStoreVisible) return null;
    <div className="modal show fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50" id="game-modal">
    <div className="modal-content bg-gray-900 p-6 rounded-lg max-w-md w-full">
        <span className="close-button" onClick={closeStore}>&times;</span>
        <div className='store'>
        {store.map((x,i)=> <div className='inlinestore'> <div className='flex w-full h-auto rounded-md mb-2'> {<img className='store-pic' src={`https://www.cheapshark.com${x.images.logo}`}/>} <p  className='store-row' key={x.storeID}>{x.storeName} </p></div></div>)}
        </div>
    </div>
</div>
}