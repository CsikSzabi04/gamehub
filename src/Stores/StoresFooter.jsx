import { useState, useEffect } from "react";
import { motion } from 'framer-motion';

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
        <div className="w-full mb-16">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-6 px-2">
                <div className="relative">
                    <h2 className="text-xl md:text-2xl font-bold text-white">Popular Stores</h2>
                    <div className="absolute -bottom-2 left-0 w-16 h-1 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full"></div>
                </div>
            </div>

            {/* Stores Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {stores.map((store, index) => (
                    <motion.div
                        key={store.storeID}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -4, scale: 1.02 }}
                        className="group flex flex-col items-center justify-center p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-violet-500/40 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                    >
                        <img
                            loading="lazy"
                            src={`https://www.cheapshark.com${store.images.logo}`}
                            alt={store.storeName}
                            className="h-12 w-auto object-contain mb-3 opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                        <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                            {store.storeName}
                        </p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
