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
            const isActive = i >= currentIndex && i < currentIndex + itemsToShow.current;
            gsap.to(item, {
                scale: isActive ? 1.05 : 1,
                opacity: isActive ? 1 : 0.7,
                duration: 0.5,
                ease: "sine.out"
            });
        });
    }, [currentIndex, characters.length]);

    const nextItem = () => {setCurrentIndex(prev => (prev + itemsToShow.current) % characters.length);};
    const prevItem = () => {setCurrentIndex(prev => (prev - itemsToShow.current + characters.length) % characters.length);};
    const goToIndex = (index) => {setCurrentIndex(Math.min(index, characters.length - itemsToShow.current));};
    const getRoleColor = (role) => {return role.toLowerCase().includes('killer') ? "bg-gradient-to-b from-red-900 to-black" : "bg-gradient-to-b from-blue-900 to-black";};

    return (
        <div className="relative px-4 md:px-8 lg:px-12">
            <div className="overflow-hidden py-4">
                <h1 className="text-3xl md:text-4xl font-extrabold text-blue-400 mb-5 pb-2 border-b border-blue-500">Survivors</h1>
                <div className="relative">
                    <div ref={carouselRef} className="flex transition-transform duration-300" style={{ width: `${characters.length * itemWidth.current}px` }}>
                        {characters.map((character, index) => (
                            <div key={character.id}  ref={el => itemRefs.current[index] = el} className="flex-shrink-0 px-2 transition-all duration-300 cursor-pointer hover:opacity-90"  style={{ width: `${itemWidth.current}px` }}  onClick={() => showCharacterDetails(character)} > <div className={`relative rounded-lg overflow-hidden shadow-lg h-full ${getRoleColor(character.role)} transform hover:shadow-blue-300/30 transition-all duration-300`}>
                                    <div className={`absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-bold text-white z-10 shadow-md ${character.role.toLowerCase().includes('killer') ? 'bg-red-600' : 'bg-blue-600'}`}> {character.role.toUpperCase()}</div>
                                    <img src={character.image || character.imgs}  alt={character.name} className="w-full h-64 md:h-72 object-cover object-top transition-transform duration-500 hover:scale-105"/>
                                    <div className="p-4">
                                        <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{character.name}</h3>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            <span className="text-xs px-2 py-1 rounded-full bg-gray-800 text-gray-300 border border-gray-700">{character.difficulty}</span>
                                            <span className="text-xs px-2 py-1 rounded-full bg-gray-800 text-gray-300 border border-gray-700">{character.gender}</span>
                                        </div>
                                        <p className="text-gray-300 text-sm line-clamp-3">{character.overview}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {characters.length > itemsToShow.current && (
                <>
                    <button onClick={prevItem} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-4 bg-black bg-opacity-80 text-white p-2 md:p-3 rounded-full hover:bg-opacity-100 transition-all z-10 shadow-lg hover:scale-110 border border-blue-500" aria-label="Previous character"><FaChevronLeft className="text-lg md:text-xl" /> </button>
                    <button onClick={nextItem} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-4 bg-black bg-opacity-80 text-white p-2 md:p-3 rounded-full hover:bg-opacity-100 transition-all z-10 shadow-lg hover:scale-110 border border-blue-500" aria-label="Next character"><FaChevronRight className="text-lg md:text-xl" /></button>
                </>
            )}
            <div className="flex justify-center mt-6 space-x-2">
                {characters.slice(0, characters.length - itemsToShow.current + 1).map((_, index) => (
                    <button key={index} onClick={() => goToIndex(index)}  className={`w-3 h-3 rounded-full transition-all ${currentIndex == index ? 'bg-blue-500 w-6 scale-125' : 'bg-gray-600 hover:bg-gray-500'}`}  aria-label={`Go to character ${index + 1}`}/>
                ))}
            </div>
        </div>
    );
}