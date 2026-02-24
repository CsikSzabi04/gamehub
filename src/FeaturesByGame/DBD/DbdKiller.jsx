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
            if (!item) return;
            const isActive = i >= currentIndex && i < currentIndex + itemsToShow.current;
            gsap.to(item, {
                scale: isActive ? 1.02 : 0.95,
                opacity: isActive ? 1 : 0.6,
                duration: 0.5,
                ease: "sine.out"
            });
        });
    }, [currentIndex, killers.length]);

    const nextItem = () => {
        setCurrentIndex(prev => (prev + itemsToShow.current) % killers.length);
    };

    const prevItem = () => {
        setCurrentIndex(prev => (prev - itemsToShow.current + killers.length) % killers.length);
    };

    const goToIndex = (index) => {
        setCurrentIndex(Math.min(index, killers.length - itemsToShow.current));
    };

    return (
        <div className="relative px-4 md:px-8 lg:px-12">
            <div className="overflow-hidden py-4">
                <div className="relative">
                    <div 
                        ref={carouselRef} 
                        className="flex transition-transform duration-300" 
                        style={{ width: `${killers.length * itemWidth.current}px` }}
                    >
                        {killers.map((killer, index) => (
                            <div 
                                key={killer.id} 
                                ref={el => itemRefs.current[index] = el} 
                                className="flex-shrink-0 px-2 transition-all duration-300 cursor-pointer"
                                style={{ width: `${itemWidth.current}px` }}  
                                onClick={() => showKillerDetails(killer)}
                            > 
                                <div className="dbd-character-card dbd-killer-card h-full">
                                    <div className="dbd-role-badge dbd-killer-badge">
                                        KILLER
                                    </div>
                                    <img 
                                        src={killer.image || killer.imgs}   
                                        alt={killer.name}  
                                        className="w-full h-64 md:h-72 object-cover object-top"
                                        loading="lazy"
                                        onError={(e) => { e.target.src = '/images/killer-placeholder.png'; }}
                                    />
                                    <div className="p-4">
                                        <h3 className="dbd-character-name">{killer.name}</h3>
                                        <div className="dbd-character-details">
                                            <span className="dbd-character-tag">{killer.difficulty}</span>
                                            <span className="dbd-character-tag">{killer.moveSpeed}</span>
                                            <span className="dbd-character-tag">{killer.weapon}</span>
                                            {killer.licensed && <span className="dbd-character-tag text-yellow-500">DLC</span>}
                                        </div>
                                        <p className="dbd-character-desc line-clamp-2">{killer.overview}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            {killers.length > itemsToShow.current && (
                <>
                    <button 
                        onClick={prevItem}  
                        className="dbd-nav-btn dbd-killer-nav left-0 -translate-x-2 md:-translate-x-4"
                        aria-label="Previous killer"
                    >
                        <FaChevronLeft className="text-lg md:text-xl" />
                    </button> 
                    <button 
                        onClick={nextItem}  
                        className="dbd-nav-btn dbd-killer-nav right-0 translate-x-2 md:translate-x-4"
                        aria-label="Next killer"
                    >
                        <FaChevronRight className="text-lg md:text-xl" />
                    </button>
                </>
            )}
            
            <div className="dbd-dots">
                {killers.slice(0, killers.length - itemsToShow.current + 1).map((_, index) => (
                    <button 
                        key={index} 
                        onClick={() => goToIndex(index)} 
                        className={`dbd-dot dbd-killer-dot ${currentIndex == index ? 'active' : ''}`}
                        aria-label={`Go to killer ${index + 1}`} 
                    />
                ))}
            </div>
        </div>
    );
}
