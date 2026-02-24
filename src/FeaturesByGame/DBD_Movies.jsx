import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function DBD_Movies() {
    return (
        <section id="mobile" className="mb-4 mt-4">
            <h1 className="text-2xl font-semibold mb-1 text-center text-white">More Datas</h1>
            <div className="container mx-auto py-8 px-4">
                <div className="flex flex-wrap justify-center gap-8">
                    {/* Movies Section - Disabled */}
                    <div className="game-card flex flex-col items-center w-[45%] relative">
                        <div className="relative w-full">
                            <img src="./movies.png" alt="Movies Data Hub" loading="lazy" className="w-full h-full object-cover opacity-50" />
                            {/* Disabled Overlay */}
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <div className="relative w-32 h-32 bg-white transform rotate-45 flex items-center justify-center">
                                    <span className="transform -rotate-45 text-red-600 font-bold text-center text-sm">
                                        fejlesztés<br/>alatt
                                    </span>
                                </div>
                            </div>
                        </div>
                        <p className="text-center text-gray-400 text-base mt-4">
                          <strong> Movies Data Hub</strong> : If you want to catch a break and just relax and watch something, here you can search for your needs 
                        </p>
                    </div>

                    {/* DBD Section - Disabled */}
                    <div className="game-card flex flex-col items-center w-[45%] relative">
                        <div className="relative w-full">
                            <img src="./dbd.png" alt="DBD" loading="lazy" className="w-full h-full object-cover opacity-50" />
                            {/* Disabled Overlay */}
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <div className="relative w-32 h-32 bg-white transform rotate-45 flex items-center justify-center">
                                    <span className="transform -rotate-45 text-red-600 font-bold text-center text-sm">
                                        fejlesztés<br/>alatt
                                    </span>
                                </div>
                            </div>
                        </div>
                        <p className="text-center text-gray-400 text-base mt-4">
                         <strong>Dead By Daylight</strong>    <br /> Just one of my favourite games 
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
