import { useState, useEffect } from "react";

export default function StoresFooter() {
    const [stores, setStores] = useState([]);

    const allowedStores = [
        "Steam",
        "GamersGate",
        "Epic Games Store",
        "Gog",
        "Origin",
        "Direct2Drive",
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
        <div className="container mx-auto">
            <section id="stores-section" className="mb-8">
                <div id="stores-grid" className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 
            max-[1000px]:flex max-[1000px]:overflow-x-auto max-[1000px]:gap-4 max-[1000px]:py-4">
                    {stores.map(store => (
                        <div key={store.storeID} className="store-card flex flex-col items-center max-[1000px]:flex-shrink-0">
                            <img src={`https://www.cheapshark.com${store.images.logo}`} alt={store.storeName} />
                            <p className="text-lg font-semibold">{store.storeName}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
