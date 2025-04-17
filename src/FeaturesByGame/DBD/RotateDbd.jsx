import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function RotateDbd({ characters, showCharacterDetails }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const carouselRef = useRef(null);
    const itemWidth = 300; 
    const itemsToShow = 2; 
    const intervalTime = 12000; 

    useEffect(() => {
        if (characters.length == 0) return;
        const charactersToShow = [...characters, ...characters];
        const totalItems = characters.length;
        const carousel = carouselRef.current;

        const rotateInterval = setInterval(() => {
            setCurrentIndex(prevIndex => {
                const newIndex = (prevIndex + itemsToShow) % totalItems;
                
                gsap.to(carousel, {
                    x: -newIndex * itemWidth,
                    duration: 1.5,
                    ease: "power2.inOut",
                    overwrite: true,
                    onComplete: () => {
                        if (newIndex >= totalItems - itemsToShow) {
                            gsap.set(carousel, { x: 0 });
                            setCurrentIndex(0);
                        }
                    }
                });
                
                return newIndex;
            });
        }, intervalTime);

        return () => clearInterval(rotateInterval);
    }, [characters]);

    const nextItem = () => {
        const newIndex = (currentIndex + itemsToShow) % characters.length;
        gsap.to(carouselRef.current, {
            x: -newIndex * itemWidth,
            duration: 0.5,
            ease: "power2.inOut"
        });
        setCurrentIndex(newIndex);
    };

    const prevItem = () => {
        const newIndex = (currentIndex - itemsToShow + characters.length) % characters.length;
        gsap.to(carouselRef.current, {
            x: -newIndex * itemWidth,
            duration: 0.5,
            ease: "power2.inOut"
        });
        setCurrentIndex(newIndex);
    };

    const getRoleColor = (role) => {
        return role.toLowerCase().includes('killer') ? "bg-red-900" : "bg-blue-900";
    };

    return (
        <div className="relative">
            <div className="overflow-hidden py-4">
                <h1 className="text-3xl font-extrabold text-green-600 mb-5">Survivors: </h1>
                <div ref={carouselRef} className="flex" style={{  width: `${characters.length * itemWidth * 2}px` }}>
                    {[...characters, ...characters].map((character, index) => (
                        <div key={`${character.id}-${index}`} className="flex-shrink-0 px-2"  style={{ width: `${itemWidth}px` }} onClick={() => showCharacterDetails(character)}>
                            <div className={`relative rounded-lg overflow-hidden shadow-lg h-full ${getRoleColor(character.role)}`}>
                                <div className={`absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-bold text-white ${character.role.toLowerCase().includes('killer') ? 'bg-red-600' : 'bg-blue-600' }`}>
                                    {character.role.toUpperCase()}
                                </div>
                                <img src={character.image || character.imgs}  alt={character.name} className="w-full h-64 object-cover"/>
                                <div className="p-4">
                                    <h3 className="text-xl font-bold text-white mb-1">{character.name}</h3>
                                    <div className="flex flex-wrap gap-1 mb-2">
                                        <span className="text-xs px-2 py-1 rounded-full bg-gray-800 text-gray-300"> {character.difficulty}</span>
                                        <span className="text-xs px-2 py-1 rounded-full bg-gray-800 text-gray-300"> {character.gender}</span>
                                    </div>
                                    <p className="text-gray-300 text-sm line-clamp-3">{character.overview}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {characters.length > itemsToShow && (
                <>
                    <button onClick={prevItem} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-black bg-opacity-70 text-white p-3 rounded-full hover:bg-opacity-90 transition-all z-10 shadow-lg hover:scale-110" aria-label="Previous character">
                        <FaChevronLeft className="text-xl" />
                    </button>
                    <button onClick={nextItem} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-black bg-opacity-70 text-white p-3 rounded-full hover:bg-opacity-90 transition-all z-10 shadow-lg hover:scale-110" aria-label="Next character" >
                        <FaChevronRight className="text-xl" />
                    </button>
                </>
            )}
            <div className="flex justify-center mt-4 space-x-2">
                {characters.map((_, index) => (
                    <button key={index}
                        onClick={() => {
                            const newIndex = index;
                            gsap.to(carouselRef.current, {
                                x: -newIndex * itemWidth,
                                duration: 0.5,
                                ease: "power2.inOut"
                            });
                            setCurrentIndex(newIndex);
                        }}
                        className={`w-3 h-3 rounded-full transition-all ${currentIndex == index ? 'bg-yellow-500 w-6' : 'bg-gray-600 hover:bg-gray-500'  }`} aria-label={`Go to character ${index + 1}`}/>
                ))}
            </div>
        </div>
    );
}