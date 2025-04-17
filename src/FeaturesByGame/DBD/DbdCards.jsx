import React, { useState } from "react";
import { FaTimes, FaSkull, FaRunning, FaVenusMars, FaRulerVertical } from "react-icons/fa";
import { GiBloodySword, GiMedicines } from "react-icons/gi";
import { motion, AnimatePresence } from "framer-motion";

export default function DbdCards({ selectedCharacter, closeModal }) {
    const [activeTab, setActiveTab] = useState('bio');
    const [imageLoaded, setImageLoaded] = useState(false);
    if (!selectedCharacter) return null;
    const roleColor = selectedCharacter.role == 'killer' ? 'red' : 'blue';

    return (
        <AnimatePresence>
            <motion.div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4 overflow-y-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} >
                <motion.div className={`bg-gray-900 rounded-xl overflow-hidden w-full max-w-4xl relative max-h-[90vh] overflow-y-auto border-l-4 border-${roleColor}-600`} initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} transition={{ duration: 0.3 }}>
                    <button onClick={closeModal} className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-2 transition-all duration-200 hover:bg-opacity-75" >
                        <FaTimes className="text-xl" />
                    </button>

                    <div className="flex flex-col lg:flex-row">
                        <div className="relative w-full lg:w-2/5 min-h-64">
                            {!imageLoaded && (<div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center"> <span className="text-gray-500">Loading image...</span> </div> )}
                            <img src={selectedCharacter.image} alt={selectedCharacter.name} className={`... ${imageLoaded ? 'block' : 'hidden'}`} onLoad={() => setImageLoaded(true)} onError={(e) => { e.target.src = selectedCharacter.role == 'killer' ? '/images/killer-placeholder.png': '/images/survivor-placeholder.png'; setImageLoaded(true);}}/>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                                <h2 className="text-3xl font-bold text-white"> {selectedCharacter.name}</h2>
                             <div className="flex items-center mt-1">
                                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${selectedCharacter.role == 'killer'? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}`}>{selectedCharacter.role.toUpperCase()}</span>
                                    {selectedCharacter.dlc && (<span className="ml-2 px-2 py-1 rounded-full text-xs bg-yellow-600 text-white"> DLC: {selectedCharacter.dlc}</span>)}
                                </div>
                            </div>
                        </div>

                        <div className="w-full lg:w-3/5 p-6">
                            <div className="flex border-b border-gray-700 mb-4">
                                <button className={`px-4 py-2 font-medium ${activeTab == 'bio' ? `text-${roleColor}-400 border-b-2 border-${roleColor}-400` : 'text-gray-400'}`} onClick={() => setActiveTab('bio')} >Biography</button>
                                <button className={`px-4 py-2 font-medium ${activeTab == 'story' ? `text-${roleColor}-400 border-b-2 border-${roleColor}-400` : 'text-gray-400'}`} onClick={() => setActiveTab('story')}> Backstory </button>
                                <button className={`px-4 py-2 font-medium ${activeTab == 'perks' ? `text-${roleColor}-400 border-b-2 border-${roleColor}-400` : 'text-gray-400'}`} onClick={() => setActiveTab('perks')}>Perks</button>
                            </div>

                            <div className="text-gray-300">
                                {activeTab == 'bio' && (
                                    <div>
                                        <p className="mb-4">{selectedCharacter.overview}</p>
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className="bg-gray-800 p-3 rounded-lg flex items-center">
                                                <FaVenusMars className={`text-${roleColor}-400 mr-2`} />
                                                <div>
                                                    <p className="text-xs text-gray-400">Gender</p>
                                                    <p className="capitalize">{selectedCharacter.gender}</p>
                                                </div>
                                            </div>
                                            <div className="bg-gray-800 p-3 rounded-lg flex items-center">
                                                <FaRulerVertical className={`text-${roleColor}-400 mr-2`} />
                                                <div>
                                                    <p className="text-xs text-gray-400">Height</p>
                                                    <p className="capitalize">{selectedCharacter.height}</p>
                                                </div>
                                            </div>
                                            <div className="bg-gray-800 p-3 rounded-lg flex items-center">
                                                <GiBloodySword className={`text-${roleColor}-400 mr-2`} />
                                                <div>
                                                    <p className="text-xs text-gray-400">Difficulty</p>
                                                    <p className="capitalize">{selectedCharacter.difficulty}</p>
                                                </div>
                                            </div>
                                            <div className="bg-gray-800 p-3 rounded-lg flex items-center">
                                                {selectedCharacter.role == 'killer' ? (<FaSkull className={`text-${roleColor}-400 mr-2`} />) : (<FaRunning className={`text-${roleColor}-400 mr-2`} />)}
                                                <div>
                                                    <p className="text-xs text-gray-400">Role</p>
                                                    <p className="capitalize">{selectedCharacter.role}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {activeTab == 'story' && ( <div><p className="whitespace-pre-line">{selectedCharacter.backstory}</p></div>)}
                                {activeTab == 'perks' && (
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-3">Unique Perks</h3>
                                        <div className="space-y-4">
                                            {selectedCharacter.perks.map((perk, index) => (
                                                <div key={index} className="bg-gray-800 p-4 rounded-lg">
                                                    <h4 className="font-bold text-lg text-white">{perk}</h4>
                                                    <p className="text-gray-400 text-sm mt-1">
                                                        {perk} is one of {selectedCharacter.name}'s unique perks that provides special abilities.
                                                    </p>
                                                </div>
                                            ))}
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