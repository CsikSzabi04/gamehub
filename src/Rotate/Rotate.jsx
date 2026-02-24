import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import '../body.css';
import { FaChevronRight, FaAngleLeft } from "react-icons/fa6";
import { FaExternalLinkAlt, FaStar } from "react-icons/fa";
import { Link } from "react-router-dom";
import { motion } from 'framer-motion';

export default function Rotate({ games, showGameDetails, name, intervalTimeA, k }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const carouselRef = useRef(null);

    useEffect(() => {
        const totalItems = games.length;
        const intervalTime = intervalTimeA;

        const gamesToShow = [...games, ...games];

        const carousel = carouselRef.current;
        
        const rotateInterval = setInterval(() => {
            setCurrentIndex(prevIndex => {
                const newIndex = (prevIndex + 2) % totalItems;
                if (carousel) {
                    gsap.to(carousel, {
                        x: -newIndex * k,
                        duration: 1.5,
                        ease: "power2.inOut",
                        overwrite: true
                    });
                }
                return newIndex;
            });
        }, intervalTime);

        return () => clearInterval(rotateInterval);
    }, [games, intervalTimeA, k]);

    const nextItem = () => {
        setCurrentIndex(prevIndex => (prevIndex + 1) % games.length);
    };

    const prevItem = () => {
        setCurrentIndex(prevIndex => (prevIndex - 1 + games.length) % games.length);
    };

    return (
        <div className="relative mb-8">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-6 px-2">
                <div className="relative">
                    <h2 className="text-xl md:text-2xl font-bold text-white">{name}</h2>
                    <div className="absolute -bottom-2 left-0 w-16 h-1 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full"></div>
                </div>
            </div>

            {/* Carousel Container */}
            <div className="relative overflow-hidden rounded-2xl">
                <div className="overflow-hidden relative">
                    <div 
                        className="flex gap-4 transition-transform duration-500 ease-out" 
                        ref={carouselRef} 
                        style={{ transform: `translateX(-${currentIndex * (window.innerWidth < 640 ? 240 : 320)}px)` }}
                    >
                        {games.concat(games).map((x, index) => (
                            <motion.div
                                key={`${x.id}-${index}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ y: -8, scale: 1.02 }}
                                onClick={() => showGameDetails(x)}
                                className="game-card carousel-item w-[220px] sm:w-[260px] md:w-[300px] flex-shrink-0 cursor-pointer bg-white/5 border border-white/5 hover:border-violet-500/40 transition-all duration-300 rounded-2xl overflow-hidden"
                            >
                                {/* Image Container */}
                                <div className="relative overflow-hidden aspect-[16/10]">
                                    <img
                                        loading="lazy"
                                        src={x.background_image}
                                        alt={x.name}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent opacity-80"></div>
                                    
                                    {/* Rating Badge */}
                                    {x.rating && (
                                        <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center gap-1">
                                            <FaStar className="text-[10px]" />
                                            {x.rating}
                                        </div>
                                    )}
                                    
                                    {/* External Link */}
                                    <Link 
                                        to={`/allreview/${x.id}`}
                                        className="absolute top-3 left-3 z-20 p-2 rounded-lg bg-black/60 hover:bg-violet-600 opacity-0 hover:opacity-100 transition-all duration-300"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <FaExternalLinkAlt className="w-3 h-3 text-white" />
                                    </Link>
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <h3 className="text-white font-semibold text-sm md:text-base truncate mb-2">
                                        {x.name}
                                    </h3>
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            📅 {x.released || 'TBA'}
                                        </span>
                                        {x.genres?.[0] && (
                                            <span className="px-2 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-violet-400">
                                                {x.genres[0].name}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Bottom Accent */}
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 to-cyan-500 transform scale-x-0 hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Navigation Controls */}
            <div className="controls flex justify-between items-center absolute inset-0 pointer-events-none">
                <button 
                    onClick={prevItem} 
                    className="pointer-events-auto ml-2 md:ml-4 p-3 rounded-full bg-white/10 border border-white/10 hover:bg-violet-500/20 hover:border-violet-500/30 text-white shadow-lg transition-all duration-300 hover:scale-110 backdrop-blur-sm"
                >
                    <FaAngleLeft className="text-xl" />
                </button>
                <button 
                    onClick={nextItem} 
                    className="pointer-events-auto mr-2 md:mr-4 p-3 rounded-full bg-white/10 border border-white/10 hover:bg-violet-500/20 hover:border-violet-500/30 text-white shadow-lg transition-all duration-300 hover:scale-110 backdrop-blur-sm"
                >
                    <FaChevronRight className="text-xl" />
                </button>
            </div>
        </div>
    );
}
