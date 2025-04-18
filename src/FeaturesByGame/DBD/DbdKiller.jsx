import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function DbdKiller({ killers, showKillerDetails }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const carouselRef = useRef(null);
    const itemRefs = useRef([]);
    const itemWidth = useRef(500);
    const itemsToShow = useRef(3);
    const intervalTime = 13000;
    const autoplayRef = useRef(null);

    useEffect(() => {
        const updateDimensions = () => {
            itemWidth.current = window.innerWidth < 768 ? 280 : 320;
            itemsToShow.current = window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3;
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    useEffect(() => {
        if (killers.length == 0) return;
        
        const startAutoplay = () => {
            autoplayRef.current = setInterval(() => {
                setCurrentIndex(prev => (prev + itemsToShow.current) % killers.length);
            }, intervalTime);
        };

        const stopAutoplay = () => {
            if (autoplayRef.current) clearInterval(autoplayRef.current);
        };

        startAutoplay();
        return () => stopAutoplay();
    }, [killers.length]);

    useEffect(() => {
        if (!carouselRef.current || killers.length == 0) return;
        
        gsap.to(carouselRef.current, {
            x: -currentIndex * itemWidth.current,
            duration: 0.8,
            ease: "power3.out",
            overwrite: true
        });

        itemRefs.current.forEach((item, i) => {
            const isActive = i >= currentIndex && i < currentIndex + itemsToShow.current;
            gsap.to(item, {
                scale: isActive ? 1.05 : 1,
                opacity: isActive ? 1 : 0.7,
                duration: 0.5,
                ease: "sine.out"
            });
        });
    }, [currentIndex, killers.length]);

    const nextItem = () => {setCurrentIndex(prev => (prev + itemsToShow.current) % killers.length);};
    const prevItem = () => {setCurrentIndex(prev => (prev - itemsToShow.current + killers.length) % killers.length);};
    const goToIndex = (index) => {setCurrentIndex(Math.min(index, killers.length - itemsToShow.current));};

    return (
        <div className="relative px-4 md:px-8 lg:px-12">
            <div className="overflow-hidden py-4">
                <h1 className="text-3xl md:text-4xl font-extrabold text-red-600 mb-5 pb-2 border-b border-red-900">Killers</h1>
                <div className="relative">
                    <div ref={carouselRef} className="flex transition-transform duration-300" style={{ width: `${killers.length * itemWidth.current}px` }}>
                        {killers.map((killer, index) => (
                            <div key={killer.id} ref={el => itemRefs.current[index] = el} className="flex-shrink-0 px-2 transition-all duration-300 cursor-pointer hover:opacity-90"  style={{ width: `${itemWidth.current}px` }}  onClick={() => showKillerDetails(killer)} > <div className="relative rounded-lg overflow-hidden shadow-lg h-full bg-gradient-to-b from-red-900 to-black transform hover:shadow-red-500/30 transition-all duration-300">
                                    <div className="absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-bold text-white bg-red-600 z-10 shadow-md">KILLER</div>
                                    <img src={killer.image || killer.imgs}   alt={killer.name}  className="w-full h-64 md:h-72 object-cover object-top transition-transform duration-500 hover:scale-105" onError={(e) => { e.target.src = '/images/killer-placeholder.png'; }}/>
                                    <div className="p-4">
                                        <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{killer.name}</h3>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            <span className="text-xs px-2 py-1 rounded-full bg-gray-800 text-gray-300 border border-gray-700">{killer.difficulty}</span>
                                            <span className="text-xs px-2 py-1 rounded-full bg-gray-800 text-gray-300 border border-gray-700">{killer.moveSpeed}</span>
                                            <span className="text-xs px-2 py-1 rounded-full bg-gray-800 text-gray-300 border border-gray-700">{killer.weapon}</span>
                                        </div>
                                        <p className="text-gray-300 text-sm line-clamp-3">{killer.overview}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {killers.length > itemsToShow.current && (
                <>
                    <button onClick={prevItem}  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-4 bg-black bg-opacity-80 text-white p-2 md:p-3 rounded-full hover:bg-opacity-100 transition-all z-10 shadow-lg hover:scale-110 border border-red-900"  aria-label="Previous killer"> <FaChevronLeft className="text-lg md:text-xl" /></button> 
                    <button onClick={nextItem}  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-4 bg-black bg-opacity-80 text-white p-2 md:p-3 rounded-full hover:bg-opacity-100 transition-all z-10 shadow-lg hover:scale-110 border border-red-900"  aria-label="Next killer" > <FaChevronRight className="text-lg md:text-xl" /></button>
                </>
            )}
            <div className="flex justify-center mt-6 space-x-2">
                {killers.slice(0, killers.length - itemsToShow.current + 1).map((_, index) => (
                    <button key={index} onClick={() => goToIndex(index)} className={`w-3 h-3 rounded-full transition-all ${currentIndex == index ? 'bg-red-800 w-6 scale-125' : 'bg-gray-600 hover:bg-gray-500'}`} aria-label={`Go to killer ${index + 1}`} />
                ))}
            </div>
        </div>
    );
}