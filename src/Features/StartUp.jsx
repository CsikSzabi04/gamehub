import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaGamepad, FaRocket, FaArrowRight } from 'react-icons/fa';
import "../body.css";

export default function StartUp({ onLoaded }) {
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [showWelcome, setShowWelcome] = useState(false);
    const [slogans] = useState([
        "Loading amazing games...",
        "Preparing your gaming experience...",
        "Discovering new worlds...",
        "Almost ready to play..."
    ]);
    const [currentSlogan, setCurrentSlogan] = useState(0);

    useEffect(() => {
        // Progress simulation
        const interval = setInterval(() => {
            setProgress(prev => {
                const increment = Math.random() * 15 + 5;
                const newProgress = Math.min(prev + increment, 100);
                
                if (newProgress >= 100) {
                    clearInterval(interval);
                    setLoading(false);
                    setTimeout(() => setShowWelcome(true), 300);
                    return 100;
                }
                return newProgress;
            });
        }, 400);

        // Slogan rotation
        const sloganInterval = setInterval(() => {
            setCurrentSlogan(prev => (prev + 1) % slogans.length);
        }, 800);

        return () => {
            clearInterval(interval);
            clearInterval(sloganInterval);
        };
        
    }, [slogans]);

    function handleEnter() {
        setShowWelcome(false);
        setTimeout(() => {
            onLoaded();
        }, 500);
    };

    return (
        <div className={`fixed inset-0 flex flex-col justify-center items-center bg-[#030712] z-50 transition-all duration-700 ${!loading && !showWelcome ? 'opacity-0 pointer-events-none' : ''}`}>
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 via-[#030712] to-cyan-900/20"></div>
                {/* Floating particles */}
                <motion.div
                    animate={{ 
                        y: [0, -100, 0],
                        opacity: [0.3, 0.8, 0.3]
                    }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-violet-500"
                />
                <motion.div
                    animate={{ 
                        y: [0, -80, 0],
                        opacity: [0.2, 0.6, 0.2]
                    }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute top-1/3 right-1/3 w-3 h-3 rounded-full bg-cyan-500"
                />
                <motion.div
                    animate={{ 
                        y: [0, -120, 0],
                        opacity: [0.3, 0.7, 0.3]
                    }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute bottom-1/4 right-1/4 w-2 h-2 rounded-full bg-pink-500"
                />
                <motion.div
                    animate={{ 
                        y: [0, -60, 0],
                        opacity: [0.2, 0.5, 0.2]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    className="absolute bottom-1/3 left-1/3 w-1 h-1 rounded-full bg-violet-400"
                />
            </div>

            {/* Loading State */}
            {loading && (
                <div className="relative z-10 flex flex-col items-center">
                    {/* Logo Animation */}
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="relative mb-12"
                    >
                        <motion.div
                            animate={{ 
                                boxShadow: [
                                    '0 0 20px rgba(139, 92, 246, 0.3)',
                                    '0 0 40px rgba(139, 92, 246, 0.5)',
                                    '0 0 20px rgba(139, 92, 246, 0.3)'
                                ]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-32 h-32 rounded-3xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center"
                        >
                            <FaGamepad className="w-16 h-16 text-white" />
                        </motion.div>
                        
                        {/* Glow effect */}
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 rounded-3xl bg-violet-500 blur-xl -z-10"
                        />
                    </motion.div>

                    {/* Title */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-4xl md:text-5xl font-bold mb-2"
                    >
                        <span className="text-white">Game</span>
                        <span className="text-violet-500">Data</span>
                        <span className="text-white">Hub</span>
                    </motion.h1>

                    {/* Slogan */}
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={currentSlogan}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="text-gray-400 text-sm mb-8 h-6"
                        >
                            {slogans[currentSlogan]}
                        </motion.p>
                    </AnimatePresence>

                    {/* Progress Bar */}
                    <div className="w-72 md:w-96">
                        <div className="flex justify-between text-xs text-gray-500 mb-2">
                            <span>Loading</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.3 }}
                                className="h-full rounded-full bg-gradient-to-r from-violet-600 via-purple-500 to-cyan-500"
                            />
                        </div>
                    </div>

                    {/* Loading dots */}
                    <div className="flex gap-1 mt-6">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                animate={{ 
                                    scale: [1, 1.5, 1],
                                    opacity: [0.3, 1, 0.3]
                                }}
                                transition={{ 
                                    duration: 1, 
                                    repeat: Infinity, 
                                    delay: i * 0.2 
                                }}
                                className="w-2 h-2 rounded-full bg-violet-500"
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Welcome Screen */}
            <AnimatePresence>
                {showWelcome && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.5 }}
                        className="relative z-10 text-center px-4"
                    >
                        {/* Success Icon */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="w-24 h-24 mx-auto mb-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30"
                        >
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                            >
                                <FaRocket className="w-10 h-10 text-white" />
                            </motion.div>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-4xl md:text-6xl font-bold mb-6"
                        >
                            <span className="text-white">Welcome to </span>
                            <span className="bg-gradient-to-r from-violet-500 to-cyan-500 bg-clip-text text-transparent">
                                GameDataHub
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-lg md:text-xl text-gray-400 mb-4 max-w-2xl mx-auto"
                        >
                            Discover the best games, amazing deals, and latest gaming news
                        </motion.p>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="text-gray-500 mb-12"
                        >
                            Your ultimate gaming destination
                        </motion.p>

                        {/* Enter Button */}
                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleEnter}
                            className="group relative px-10 py-4 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-2xl text-white font-semibold text-lg shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all"
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                Start Exploring
                                <FaArrowRight className="transition-transform group-hover:translate-x-1" />
                            </span>
                            {/* Button glow */}
                            <motion.div
                                animate={{ 
                                    boxShadow: [
                                        '0 0 20px rgba(139, 92, 246, 0.3)',
                                        '0 0 40px rgba(139, 92, 246, 0.5)',
                                        '0 0 20px rgba(139, 92, 246, 0.3)'
                                    ]
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute inset-0 rounded-2xl"
                            />
                        </motion.button>

                        {/* Decorative elements - removed emojis per user request */}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
