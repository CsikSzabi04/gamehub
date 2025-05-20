import React, { useState, useEffect } from 'react';
import { ThreeDot } from "react-loading-indicators";
import "../body.css";

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

    function handleEnter(){
        setShowWelcome(false);
        setTimeout(() => {
            onLoaded();
        }, 500);
    };

    return (
        <div className={`fixed inset-0 flex flex-col justify-center items-center bg-gray-900 text-white z-50 transition-opacity duration-500 ${!loading && !showWelcome ? 'opacity-0 pointer-events-none' : ''}`}>
            {loading && (
            <div className="fixed inset-0 flex flex-col justify-center items-center  bg-gray-900  text-white text-3xl font-bold z-50">
                <img src="./main.png" alt="MainImgS" className="mb-10 rounded-3xl w-40 h-40 object-contain" onLoad={() => setProgress(30)} /> 
                <div className="flex flex-col items-center">
                    <h1 className="flex items-center gap-2">
                        Loading <ThreeDot color="#fff" size="medium" />
                    </h1>
                    <div className="w-64 bg-gray-700 rounded-full h-2.5 mt-4">
                        <div className="bg-blue-600 h-2.5 rounded-full"  style={{ width: `${progress}%` }}></div>
                    </div>
                    <span className="text-sm mt-2">{progress}%</span>
                </div>
            </div>
        )}

            {showWelcome && (
                <div className="text-center animate-fadeIn ">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">Welcome to Game<span className="text-blue-500"> Data </span>Hub</h1>
                    <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl px-4 mx-auto"> Discover the best games, deals, and news in the gaming world </p>
                    <button  onClick={handleEnter} className="relative inline-flex items-center px-8 py-3 sm:px-10 sm:py-4 bg-blue-600 text-white font-medium rounded-lg overflow-hidden group transition-colors duration-300 hover:bg-blue-700" >
                        <span className="relative z-10 flex items-center">
                            Enter Site
                            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                        </span>
                    </button>
                </div>
            )}
        </div>
    );
}