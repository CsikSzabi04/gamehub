import React, { useState, useEffect } from "react";
import '../body.css';

export default function RotateGamingNews({ articles, name }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => setCurrentIndex(i => (i + 1) % articles.length), 20000);
        return () => clearInterval(interval);
    }, [articles]);

    return (
        <div className="sm:p-10 rounded-lg">
            <section id="gaming-news" className="mb-2 p-6 ">
                <h2 className="text-2xl font-semibold mb-4">{name} 📰</h2>
                <div className="carousel-container overflow-hidden relative">
                    <div className="carousel flex transition-transform duration-1000 ease-in-out" style={{ transform: `translateX(-${currentIndex * 320}px)` }}>
                        {articles.map((article) => (
                            <div key={article.url} className="article-card flex-none w-full sm:w-1/2 md:w-1/3 lg:w-1/4 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 mr-6">
                               <a href={article.url} target="_blank"><img src={article.urlToImage} alt={article.title} className="object-cover rounded-md mb-4" /></a> 
                                <div className="article-details">
                                    <h3 className="text-lg font-bold">{article.title}</h3>
                                    <div className="mt-[5%]">
                                        <p className="text-sm text-gray-400">{article.description}</p>
                                        <div className="author text-sm text-gray-600">
                                            <span className="font-semibold">Author:</span> {article.author}
                                        </div>
                                        <p className="text-sm text-gray-500">Published: {new Date(article.publishedAt).toLocaleDateString()}</p><br />
                                        <br /><p className="text-gray-700 text-xs">Click on Image to Read More</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
