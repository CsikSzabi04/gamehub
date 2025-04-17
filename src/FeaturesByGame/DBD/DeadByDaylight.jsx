import React, { useEffect, useState } from "react";
import DbdApp from "./DbdApp.jsx"
import { FaArrowLeftLong } from "react-icons/fa6";
import { Link } from "react-router-dom";

export default function DeadByDaylight() {

    return (
        <section id="movies" className="mb-8 max-w-[80%] m-auto">
            <h1 className="text-4xl font-semibold mb-4 mt-5 text-center" >Dead By Daylight</h1>
            <Link to="/"><button type="button" className="mb-5 flex items-center bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg">
                <FaArrowLeftLong />
                <span className="ml-3">Home</span>
            </button></Link>
            
            <DbdApp />
        </section>
    );
}