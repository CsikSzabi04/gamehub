import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function DBD_Movies() {
    return (
        <section id="mobile" className="mb-4 mt-4">
            <h1 className="text-2xl font-semibold mb-1 text-center">More Datas</h1>
            <div className="container mx-auto py-8 px-4">
                <div className="flex flex-wrap justify-center gap-8">
                    <div className="game-card flex flex-col items-center  w-[45%]">
                        <Link to="/movies" className="w-[100%] h-[100%] object-cover" ><img src="./movies.png" alt="Movies Data Hub" /></Link>
                        <p className="text-center text-gray-400 text-base">
                          <strong> Movies Data Hub</strong> : If you want to catch a break and just relax and watch something, here you can search for your needs 
                        </p>
                    </div>

                    <div className="game-card flex flex-col items-center w-[45%] ">
                        <Link to="/dbd" className="w-[100%] h-[100%] object-cover" ><img src="./dbd.png" alt="DBD" /></Link>
                        <p className="text-center text-gray-400 text-base">
                         <strong>Dead By Daylight</strong>    <br /> Just one of my favourite games 
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}