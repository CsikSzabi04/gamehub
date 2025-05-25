import React, { useState, useEffect } from 'react';
import { ThreeDot } from "react-loading-indicators";
import "../body.css";
import { FaArrowLeftLong, FaArrowRightLong } from 'react-icons/fa6';

export default function StartUp({ onLoaded }) {
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [showWelcome, setShowWelcome] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                const newProgress = prev + 10;
                if (newProgress >= 100) {
                    clearInterval(interval);
                    setLoading(false);
                    setShowWelcome(true);
                    return newProgress;
                }
                return newProgress;
            });
        }, 400);

        return () => clearInterval(interval);
        
    }, []);

    function handleEnter() {
        setShowWelcome(false);
        setTimeout(() => {
            onLoaded();
        }, 500);
    };

    return (
        <div className={`fixed inset-0 flex flex-col justify-center items-center bg-gray-900 text-white z-50 transition-opacity duration-500 ${!loading && !showWelcome ? 'opacity-0 pointer-events-none' : ''}`}>
            {loading && (
                <div className="fixed inset-0 flex flex-col justify-center items-center  bg-gray-900  text-white text-3xl font-bold z-50">
                    <img  loading="lazy"  src="./main.png" alt="MainImgS" className="mb-10 rounded-3xl w-40 h-40 object-contain" onLoad={() => setProgress(30)} />
                    <div className="flex flex-col items-center">
                        <h1 className="flex items-center gap-2">
                            Loading <ThreeDot color="#fff" size="medium" />
                        </h1>
                        <div className="w-64 bg-gray-700 rounded-full h-2.5 mt-4">
                            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                        <span className="text-sm mt-2">{progress}%</span>
                    </div>
                </div>
            )}

            {showWelcome && (
                <div className="text-center animate-fadeIn ">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">Welcome to Game<span className="text-blue-500"> Data </span>Hub</h1>
                    <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl px-4 mx-auto"> Discover the best games, deals, and news in the gaming world </p>
                    <button onClick={handleEnter} className="group mb-6 mt-10 inline-flex items-center px-5 py-3 bg-gradient-to-r from-blue-900 to-blue-700 hover:from-gray-500 hover:to-gray-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 transform-gpu">
                        <span className="relative overflow-hidden">
                            <span className="block transition-transform duration-300 group-hover:-translate-y-[110%]">
                                Enter Home Page
                            </span>
                            <span className="absolute inset-0 block translate-y-[110%] transition-transform duration-300 group-hover:translate-y-0">
                                Let's go!
                            </span>
                           
                        </span>
                         <FaArrowRightLong className="ml-3 transition-transform duration-300 group-hover:-translate-x-1" />
                    </button>
                </div>
            )}
        </div>
    );
}