import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import '../body.css';
import { FaChevronRight } from "react-icons/fa6";
import { FaAngleLeft } from "react-icons/fa6";


export default function Rotate({ games, showGameDetails, name, intervalTimeA, k }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const carouselRef = useRef(null);

    useEffect(() => {
        const totalItems = games.length;
        const intervalTime = intervalTimeA;

        const gamesToShow = [...games, ...games];

        const carousel = carouselRef.current;
        const totalItemsToShow = gamesToShow.length;

        const rotateInterval = setInterval(() => {
            setCurrentIndex(prevIndex => {
                const newIndex = (prevIndex + 2) % totalItems;
                gsap.to(carousel, {
                    x: -newIndex * k,
                    duration: 1.5,
                    ease: "power2.inOut",
                    overwrite: true
                });
                return newIndex;
            });
        }, intervalTime);

        return () => clearInterval(rotateInterval);
    }, [games]);

    const nextItem = () => {
        setCurrentIndex(prevIndex => (prevIndex + 1) % games.length);
    };

    const prevItem = () => {
        setCurrentIndex(prevIndex => (prevIndex - 1 + games.length) % games.length);
    };

    return (
        <div className="relative">
            <section id="multiplayer-games" className="mb-8 relative s">
                <h2 className="text-2xl font-semibold mb-4">{name}</h2>
                <div className="overflow-hidden relative ">
                    <div className="flex space-x-4 ">
                        <div className="overflow-hidden relative ">
                            <div className="flex transition-transform" ref={carouselRef} style={{ transform: `translateX(-${currentIndex * 300}px)`, transition: "transform 1s ease" }}>
                                {games.concat(games).map((x, index) => (
                                    <div key={`${x.id}-${index}`} className="game-card carousel-item" onClick={() => showGameDetails(x)}>
                                        <img src={x.background_image} alt={x.name} className="game-image" />
                                        <div className="game-details">
                                            <h3 className="text-lg font-bold mb-2">{x.name}</h3>
                                            <p className="text-sm text-gray-400"> Released: {x.released || "?"} </p>
                                            <p className="text-sm text-gray-400"> Rating: {x.rating || "?"}/5 </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <div className="d">
                <button onClick={prevItem} className="absolute left-0 top-1/2 transform -translate-y-1/2  text-white p-2 rounded-full arr" > <FaAngleLeft /> </button>
                <button onClick={nextItem} className="absolute right-0 top-1/2 transform -translate-y-1/2 text-white p-2 rounded-full arr" ><FaChevronRight /> </button>
            </div>
            </div>
    );
}
