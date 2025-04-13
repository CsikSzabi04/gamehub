import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap"; 
import '../body.css';
import { FaAngleLeft, FaChevronRight } from "react-icons/fa6";

export default function RotateDiscounted({ games, showGameDetails, name }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const carouselRef = useRef(null);
    const itemWidth = 400;

    useEffect(() => {
        const totalItems = games.length;
        const intervalTime = 15000; 
        const carousel = carouselRef.current;

        const rotateInterval = setInterval(() => {
            setCurrentIndex(prevIndex => {
                const newIndex = (prevIndex + 1) % totalItems;
                gsap.to(carousel, {
                    x: -newIndex * itemWidth, 
                    duration: 1.5,
                    ease: "power2.inOut",
                    overwrite: true
                });
                return newIndex;
            });
        }, intervalTime);
        return () => clearInterval(rotateInterval);
    }, [games]);

    function nextItem(){
        const carousel = carouselRef.current;
        const newIndex = (currentIndex + 2) % games.length;
        gsap.to(carousel, {
            x: -newIndex * 500,
            duration: 0.5,
            ease: "power2.inOut",
            overwrite: true
        });
        setCurrentIndex(newIndex);
    };

    function prevItem() {
        const carousel = carouselRef.current;
        const newIndex = (currentIndex - 2 + games.length) % games.length;
        gsap.to(carousel, {
            x: -newIndex * 500,
            duration: 0.5,
            ease: "power2.inOut",
            overwrite: true
        });
        setCurrentIndex(newIndex);
    };

    return (
        <div className="relative">
            <section id="free-games" className="mb-8 s">
                <h2 className="text-2xl font-semibold mb-4">{name} 💸</h2>
                <div className="carousel-container overflow-hidden relative">
                    <div className="carousel flex space-x-4"  ref={carouselRef} style={{ width: `${games.length * 2 * itemWidth}px` }}>
                        {games.concat(games).map((game, index) => (
                            <div key={`${game.id}-${index}`} className="game-carda carousel-item min-h-[20%] max-h-[80%] flex flex-col justify-between" style={{ width: `${itemWidth}px` }} onClick={() => showGameDetails(game)}>
                                <img src={game.background_image} alt={game.name} className="game-imagea " />
                                <div className="game-details">
                                    <h3 className="text-lg font-bold mb-2">{game.name}</h3>
                                    <p className="text-sm text-gray-400">Original Price: {game.originalPrice} USD</p>
                                    <p className="text-sm text-gray-400">Discount Price: {game.discountPrice} USD</p>
                                </div>
                                <div className="justify-end mt-10 mb-0 pb-0 ml-4">
                                    <p className="text-sm text-gray-400">Deal Status: <span className="text-green-500">{game.Status}</span></p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <div className="d">
                <button onClick={prevItem} className="absolute left-0 top-1/2 transform -translate-y-1/2 text-white p-2 rounded-full arr"><FaAngleLeft /> </button>
                <button onClick={nextItem}  className="absolute right-0 top-1/2 transform -translate-y-1/2 text-white p-2 rounded-full arr" ><FaChevronRight /> </button>
            </div>
        </div>
    );
}
