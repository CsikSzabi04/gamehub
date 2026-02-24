import React, { useState, useEffect } from "react";
import '../body.css';

export default function RotateGamingNews({ articles, name }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => setCurrentIndex(i => (i + 1) % articles.length), 20000);
        return () => clearInterval(interval);
    }, [articles]);

    if (!articles || articles.length === 0) {
        return (
            <div className="sm:p-10 rounded-lg" data-aos="fade-up">
                <section id="gaming-news" className="mb-2 p-6 bg-gray-900 rounded-lg">
                    <h2 className="text-2xl font-semibold mb-4 text-white">{name}</h2>
                    <p className="text-gray-400">Loading news...</p>
                </section>
            </div>
        );
    }

    return (
        <div className="sm:p-6 rounded-lg" data-aos="fade-up">
            <section id="gaming-news" className="mb-2 p-4 bg-gray-900 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4 text-white">{name}</h2>
                <div className="carousel-container overflow-hidden relative">
                    <div className="carousel flex transition-transform duration-1000 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                        {articles.map((article) => (
                            <a 
                                key={article.url} 
                                href={article.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex-none w-full sm:w-1/2 md:w-1/3 lg:w-1/4 rounded-lg shadow-md mr-4 block cursor-pointer no-underline"
                            >
                                <div className="overflow-hidden rounded-md mb-3">
                                    <img 
                                        loading="lazy" 
                                        src={article.urlToImage} 
                                        alt={article.title} 
                                        className="object-cover w-full h-40 transition-transform duration-300 hover:scale-110" 
                                    />
                                </div>
                                <div className="article-details">
                                    <h3 className="text-lg font-bold text-white line-clamp-2">{article.title}</h3>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-400 line-clamp-2">{article.description}</p>
                                        <div className="author text-sm text-gray-500 mt-2">
                                            <span className="font-semibold">Author:</span> {article.author || 'Unknown'}
                                        </div>
                                        <p className="text-sm text-gray-500">{new Date(article.publishedAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
