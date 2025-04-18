import React, { useState, useEffect } from "react";
import { FaTimes, FaSkull, FaRunning, FaVenusMars, FaRulerVertical } from "react-icons/fa";
import { GiBloodySword, GiMedicines } from "react-icons/gi";
import { motion, AnimatePresence } from "framer-motion";

export default function DbdCards({ selectedCharacter, closeModal }) {
    const [activeTab, setActiveTab] = useState('bio');
    const [imageLoaded, setImageLoaded] = useState(false);
    const [hoveredPerk, setHoveredPerk] = useState(null);
    const [perkDetails, setPerkDetails] = useState(null);
    const [loadingPerk, setLoadingPerk] = useState(false);

    if (!selectedCharacter) return null;
    const isKiller = selectedCharacter.role.toLowerCase().includes('killer');
    const roleColor = isKiller ? 'red' : 'blue';
    const bgGradient = isKiller ? 'bg-gradient-to-b from-red-900/90 to-black' : 'bg-gradient-to-b from-blue-900/90 to-black';


    useEffect(() => {
        if (hoveredPerk) {
            setLoadingPerk(true);
            const endpoint = isKiller ? `https://gamehub-backend-zekj.onrender.com/perksK/${encodeURIComponent(hoveredPerk)}` : `https://gamehub-backend-zekj.onrender.com/perksS/${encodeURIComponent(hoveredPerk)}`;
            fetch(endpoint).then(response => {return response.json();}).then(data => { setPerkDetails(data); setLoadingPerk(false);})
        } else {
            setPerkDetails(null);
        }
    }, [hoveredPerk, isKiller]);
    

    return (
        <AnimatePresence>
            <motion.div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4 overflow-y-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <motion.div className={`${bgGradient} rounded-xl overflow-hidden w-full max-w-5xl relative max-h-[90vh] overflow-y-auto border-l-4 border-${roleColor}-600 shadow-2xl shadow-${roleColor}-900/50`} initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} transition={{ duration: 0.3 }}>
                    <button onClick={closeModal} className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-black/70 rounded-full p-2 transition-all duration-200 hover:bg-${roleColor}-600"><FaTimes className="text-xl" /></button>

                    <div className="flex flex-col lg:flex-row">
                        <div className="relative w-full lg:w-2/5 min-h-64 lg:min-h-[400px]">
                            {!imageLoaded && <div className="absolute inset-0 bg-gray-900 animate-pulse flex items-center justify-center"><span className="text-gray-500">Loading image...</span></div>}
                            <img src={selectedCharacter.image} alt={selectedCharacter.name} className={`w-full h-full object-cover ${imageLoaded ? 'block' : 'hidden'} ${isKiller ? 'brightness-90 contrast-110' : 'brightness-100'}`} onLoad={() => setImageLoaded(true)} onError={(e) => { e.target.src = isKiller ? '/images/killer-placeholder.png' : '/images/survivor-placeholder.png'; setImageLoaded(true);}}/>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                                <h2 className="text-2xl md:text-3xl font-bold text-white">{selectedCharacter.name}</h2>
                                <div className="flex items-center mt-1">
                                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${isKiller ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}`}>{selectedCharacter.role.toUpperCase()}</span>
                                    {selectedCharacter.dlc && <span className="ml-2 px-2 py-1 rounded-full text-xs bg-yellow-600 text-white">DLC: {selectedCharacter.dlc}</span>}
                                </div>
                            </div>
                        </div>

                        <div className="w-full lg:w-3/5 p-4 md:p-6">
                            <div className="flex border-b border-gray-700 mb-4 overflow-x-auto">
                                <button className={`px-3 py-2 text-sm md:text-base md:px-4 font-medium whitespace-nowrap ${activeTab == 'bio' ? `text-${roleColor}-400 border-b-2 border-${roleColor}-400` : 'text-gray-400'}`} onClick={() => setActiveTab('bio')}>Biography</button>
                                <button className={`px-3 py-2 text-sm md:text-base md:px-4 font-medium whitespace-nowrap ${activeTab == 'story' ? `text-${roleColor}-400 border-b-2 border-${roleColor}-400` : 'text-gray-400'}`} onClick={() => setActiveTab('story')}>Backstory</button>
                                <button className={`px-3 py-2 text-sm md:text-base md:px-4 font-medium whitespace-nowrap ${activeTab == 'perks' ? `text-${roleColor}-400 border-b-2 border-${roleColor}-400` : 'text-gray-400'}`} onClick={() => setActiveTab('perks')}>Perks</button>
                            </div>

                            <div className="text-gray-300">
                                {activeTab == 'bio' && (
                                    <div>
                                        <p className="mb-4">{selectedCharacter.overview}</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                                            <div className="bg-gray-800/70 p-3 rounded-lg flex items-center border border-gray-700"><FaVenusMars className={`text-${roleColor}-400 mr-2`} /><div><p className="text-xs text-gray-400">Gender</p><p className="capitalize">{selectedCharacter.gender}</p></div></div>
                                            <div className="bg-gray-800/70 p-3 rounded-lg flex items-center border border-gray-700"><FaRulerVertical className={`text-${roleColor}-400 mr-2`} /><div><p className="text-xs text-gray-400">Height</p><p className="capitalize">{selectedCharacter.height}</p></div></div>
                                            <div className="bg-gray-800/70 p-3 rounded-lg flex items-center border border-gray-700"><GiBloodySword className={`text-${roleColor}-400 mr-2`} /><div><p className="text-xs text-gray-400">Difficulty</p><p className="capitalize">{selectedCharacter.difficulty}</p></div></div>
                                            <div className="bg-gray-800/70 p-3 rounded-lg flex items-center border border-gray-700">{isKiller ? <FaSkull className={`text-${roleColor}-400 mr-2`} /> : <FaRunning className={`text-${roleColor}-400 mr-2`} />}<div><p className="text-xs text-gray-400">Role</p><p className="capitalize">{selectedCharacter.role}</p></div></div>
                                        </div>
                                    </div>
                                )}
                                {activeTab == 'story' && <div className="max-h-64 md:max-h-79 overflow-y-auto pr-2 custom-scrollbar"><p className="whitespace-pre-line">{selectedCharacter.backstory}</p></div>}
                                {activeTab == 'perks' && (
                                    <div className="flex">
                                        <div className="w-full md:w-1/2 pr-0 md:pr-4">
                                            <h3 className="text-xl font-bold text-white mb-3">Unique Perks</h3>
                                            <div className="space-y-3">
                                                {selectedCharacter.perks.map((perk, index) => (
                                                    <div key={index} className={`bg-gray-800/70 p-3 md:p-4 rounded-lg border border-gray-700 hover:border-${roleColor}-400 transition-all cursor-pointer`} onClick={() => setHoveredPerk(perk)} >
                                                        <h4 className={`font-bold text-${roleColor}-400`}>{perk}</h4>
                                                        <p className="text-gray-400 text-sm mt-1">Hover to see details</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="hidden md:block w-1/2 pl-4 max-h-64 md:max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                                            <div className="sticky top-4">
                                                {loadingPerk ? (
                                                    <div className="bg-gray-800/70 p-4 rounded-lg border border-gray-700 h-64 flex items-center justify-center">
                                                        <div className="animate-pulse text-gray-400">Loading perk details</div>
                                                    </div>
                                                ) : perkDetails ? (
                                                    <motion.div  initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-800/70 p-4 rounded-lg border border-gray-700">
                                                        <div className="flex items-center mb-3">
                                                            {perkDetails.icon && (
                                                                <img src={perkDetails.icon} alt={perkDetails.name} className="w-12 h-12 object-contain mr-3" />
                                                            )}
                                                            <h4 className={`text-xl font-bold text-${roleColor}-400`}>{perkDetails.name}</h4>
                                                        </div>
                                                        <div className="text-gray-300 whitespace-pre-line">
                                                            {perkDetails.description.split('\n').map((paragraph, i) => (
                                                                <p key={i} className="mb-2">{paragraph}</p>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                ) : (<div className="bg-gray-800/70 p-4 rounded-lg border border-gray-700 h-64 flex items-center justify-center"><p className="text-gray-400">Click on a perk to see details!</p></div> )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}