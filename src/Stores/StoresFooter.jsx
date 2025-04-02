import { useState, useEffect } from "react";

export default function StoresFooter() {
    const [stores, setStores] = useState([]);

    const allowedStores = [
        "Steam",
        "GamersGate",
        "Epic Games Store",
        "Gog",
        "Origin",
        "Direct2Drive"
    ];

    useEffect(() => {
        fetchStores();
    }, []);

    async function fetchStores() {
        try {
            const response = await fetch("https://gamehub-backend-zekj.onrender.com/stores");
            const data = await response.json();
            const filteredStores = data.filter(store => allowedStores.includes(store.storeName));
            setStores(filteredStores); 
           
        } catch (error) {
            console.error("Error fetching stores:", error);
        }
    }

    return (
        <div className="container mx-auto p-4">
            <section id="stores-section" className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Main Game Stores </h2>
                <div id="stores-grid" className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {stores.map(store => ( 
                        <div key={store.storeID} className="store-card flex flex-col items-center">
                            <img src={`https://www.cheapshark.com${store.images.logo}`} alt={store.storeName}  />
                            <p className="text-lg font-semibold ">{store.storeName}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
