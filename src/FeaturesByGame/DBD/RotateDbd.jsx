import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function RotateDbd({ characters, showCharacterDetails }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const carouselRef = useRef(null);
    const itemRefs = useRef([]);
    const itemWidth = useRef(300);
    const itemsToShow = useRef(2);
    const intervalTime = 15000;
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
        if (characters.length == 0) return;
        
        const startAutoplay = () => {
            autoplayRef.current = setInterval(() => {
                setCurrentIndex(prev => (prev + itemsToShow.current) % characters.length);
            }, intervalTime);
        };

        const stopAutoplay = () => {
            if (autoplayRef.current) clearInterval(autoplayRef.current);
        };

        startAutoplay();
        return () => stopAutoplay();
    }, [characters.length]);

    useEffect(() => {
        if (!carouselRef.current || characters.length == 0) return;
        
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
    }, [currentIndex, characters.length]);

    const nextItem = () => {
        setCurrentIndex(prev => (prev + itemsToShow.current) % characters.length);
    };

    const prevItem = () => {
        setCurrentIndex(prev => (prev - itemsToShow.current + characters.length) % characters.length);
    };

    const goToIndex = (index) => {
        setCurrentIndex(Math.min(index, characters.length - itemsToShow.current));
    };

    return (
        <div className="relative px-4 md:px-8 lg:px-12">
            <div className="overflow-hidden py-4">
                <div className="relative">
                    <div 
                        ref={carouselRef} 
                        className="flex transition-transform duration-300" 
                        style={{ width: `${characters.length * itemWidth.current}px` }}
                    >
                        {characters.map((character, index) => (
                            <div 
                                key={character.id}  
                                ref={el => itemRefs.current[index] = el} 
                                className="flex-shrink-0 px-2 transition-all duration-300 cursor-pointer"
                                style={{ width: `${itemWidth.current}px` }}  
                                onClick={() => showCharacterDetails(character)}
                            > 
                                <div className="dbd-character-card dbd-survivor-card h-full">
                                    <div className="dbd-role-badge dbd-survivor-badge">
                                        SURVIVOR
                                    </div>
                                    <img 
                                        src={character.image || character.imgs}  
                                        alt={character.name} 
                                        className="w-full h-64 md:h-72 object-cover object-top"
                                    />
                                    <div className="p-4">
                                        <h3 className="dbd-character-name">{character.name}</h3>
                                        <div className="dbd-character-details">
                                            <span className="dbd-character-tag">{character.difficulty}</span>
                                            <span className="dbd-character-tag">{character.gender}</span>
                                            {character.licensed && <span className="dbd-character-tag text-yellow-500">DLC</span>}
                                        </div>
                                        <p className="dbd-character-desc line-clamp-2">{character.overview}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {characters.length > itemsToShow.current && (
                <>
                    <button 
                        onClick={prevItem} 
                        className="dbd-nav-btn dbd-survivor-nav left-0 -translate-x-2 md:-translate-x-4"
                        aria-label="Previous character"
                    >
                        <FaChevronLeft className="text-lg md:text-xl" />
                    </button>
                    <button 
                        onClick={nextItem} 
                        className="dbd-nav-btn dbd-survivor-nav right-0 translate-x-2 md:translate-x-4"
                        aria-label="Next character"
                    >
                        <FaChevronRight className="text-lg md:text-xl" />
                    </button>
                </>
            )}
            
            <div className="dbd-dots">
                {characters.slice(0, characters.length - itemsToShow.current + 1).map((_, index) => (
                    <button 
                        key={index} 
                        onClick={() => goToIndex(index)}  
                        className={`dbd-dot dbd-survivor-dot ${currentIndex == index ? 'active' : ''}`}
                        aria-label={`Go to character ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
