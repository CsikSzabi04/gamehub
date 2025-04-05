import { useState, useEffect } from "react";
import { ThreeDot } from "react-loading-indicators";
import React from 'react';

export default function StartUp({ onLoaded }) {
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                const newProgress = prev + 10;
                if (newProgress >= 100) {
                    clearInterval(interval);
                    setLoading(false);
                    onLoaded();
                }
                return newProgress;
            });
        }, 350); 

        return () => clearInterval(interval);
    }, [onLoaded]);

    return (
        loading && (
            <div className="fixed inset-0 flex flex-col justify-center items-center bg-black text-white text-3xl font-bold z-50">
                <img src="./main.png" alt="Main" className="mb-10 rounded-3xl w-40 h-40 object-contain" onLoad={() => setProgress(30)} /> 
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
        )
    );
}