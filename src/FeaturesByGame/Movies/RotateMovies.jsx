import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import '../../body.css';
import { FaAngleLeft, FaChevronRight } from "react-icons/fa6";
import { useT } from "../../i18n/index.jsx";

export default function RotateMovies({ movies, showMovieDetails, name }) {
    const { t } = useT();
    const [currentIndex, setCurrentIndex] = useState(0);
    const carouselRef = useRef(null);
    const itemWidth = 400;

    useEffect(() => {
        const totalItems = movies.length;
        if (!totalItems) return;
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
    }, [movies]);

    function nextItem() {
        if (!movies.length) return;
        const carousel = carouselRef.current;
        const newIndex = (currentIndex + 2) % movies.length;
        gsap.to(carousel, {
            x: -newIndex * itemWidth,
            duration: 0.5,
            ease: "power2.inOut",
            overwrite: true
        });
        setCurrentIndex(newIndex);
    }

    function prevItem() {
        if (!movies.length) return;
        const carousel = carouselRef.current;
        const newIndex = (currentIndex - 2 + movies.length) % movies.length;
        gsap.to(carousel, {
            x: -newIndex * itemWidth,
            duration: 0.5,
            ease: "power2.inOut",
            overwrite: true
        });
        setCurrentIndex(newIndex);
    }

    return (
        <div className="relative">
            <section id="movies" className="mb-8 s">
                <h2 className="text-2xl font-semibold mb-4">{t('movies.some', { name: name ?? '' })}</h2>
                <span className="text-sm text-gray-700">{t('movies.breakHint')}</span>
                <div className="carousel-container overflow-hidden relative">
                    <div className="carousel flex space-x-4" ref={carouselRef} style={{ width: `${movies.length * 2 * itemWidth}px` }}>
                        {movies.concat(movies).map((movie, index) => (
                            <div key={`${movie.id}-${index}`} className="movies carousel-item  flex flex-col justify-between" style={{ width: `${itemWidth}px` }} onClick={() => showMovieDetails(movie)}>
                                <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} className="movie-image " loading="lazy" />
                                <div className="movie-details mt-10">
                                    <h3 className="text-lg font-bold mb-2">{movie.title}</h3>
                                    <p className="text-sm text-gray-400">{t('movies.release', { date: movie.release_date ?? '' })}</p>
                                    <p className="text-sm text-gray-400">{t('movies.rating', { rating: movie.vote_average ?? '' })}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <div className="d">
                <button onClick={prevItem} className="absolute -left-5 top-1/2 transform -translate-y-1/2 text-white p-2 rounded-full arr"><FaAngleLeft /> </button>
                <button onClick={nextItem} className="absolute -right-10 top-1/2 transform -translate-y-1/2 text-white p-2 rounded-full arr"><FaChevronRight /> </button>
            </div>
        </div>
    );
}