import React, { useEffect, useState } from "react";
import RotateDbd from "./RotateDbd.jsx";
import DbdCards from "./DbdCards.jsx";
import { Link } from "react-router-dom";
import { FaArrowLeftLong } from "react-icons/fa6";
import DbdKiller from "./DbdKiller.jsx";
import "./DbdApp.css";
import { useRef } from "react";

export default function DbdApp() {
    const [characters, setCharacters] = useState([]);
    const [charactersK, setCharactersK] = useState([]);
    const [selectedCharacter, setSelectedCharacter] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [scrollY, setScrollY] = useState(0);
    const charactersSectionRef = useRef(null);

    useEffect(() => {
        fetchCharacters();
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };
        
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    async function fetchCharacters() {
        try {
            setLoading(true);
            const response = await fetch("https://gamehub-backend-zekj.onrender.com/characters");
            const data = await response.json();
            const formattedCharacters = data.map(character => ({
                id: character.id,
                name: character.name,
                role: character.role,
                difficulty: character.difficulty,
                nationality: character.nationality,
                dlc: character.dlc,
                perks: character.perks,
                overview: character.overview,
                backstory: character.backstory,
                gender: character.gender,
                image: character.imgs,
                licensed: character.dlc !== "Base game",
                perks_names: character.perks,
                perks_ids: character.perks.map((_, index) => character.id * 10 + index),
            }));
            setCharacters(formattedCharacters);

            const responseK = await fetch("https://gamehub-backend-zekj.onrender.com/charactersK");
            const dataK = await responseK.json();
            const formattedCharactersK = dataK.map(killer => ({
                id: killer.id,
                name: killer.name,
                fullName: killer.fullname,
                role: "Killer",
                difficulty: killer.difficulty,
                nationality: killer.nationality,
                realm: killer.realm,
                power: killer.power,
                powerAttackType: killer.powerAttackType,
                weapon: killer.weapon,
                moveSpeed: killer.moveSpeed,
                terrorRadius: killer.terrorRadius,
                height: killer.height,
                dlc: killer.dlc,
                perks: killer.perks,
                overview: killer.overview,
                backstory: killer.backstory,
                gender: killer.gender,
                image: killer.imgs,
                licensed: killer.dlc !== "Base game",
                perks_names: killer.perks,
                perks_ids: killer.perks.map((_, index) => killer.id * 10 + index),
                powerDescription: `${killer.power}: ${killer.powerAttackType}`,
                stats: {
                    speed: killer.moveSpeed,
                    terrorRadius: killer.terrorRadius,
                    height: killer.height
                }
            }));
            setCharactersK(formattedCharactersK);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching characters:", error);
            setError(error.message);
            setLoading(false);
        }
    }

    function showCharacterDetails(character) {
        setSelectedCharacter(character);
        setModalVisible(true);
    }

    function closeModal() {
        setModalVisible(false);
        setSelectedCharacter(null);
    }

    const opacity = Math.max(1 - scrollY / 200, 0); 

    if (loading) {return ( <div className="flex justify-center items-center h-screen bg-black"> <div className="text-red-600 text-xl animate-pulse">Loading characters from The Entity's realm...</div></div> ); }

    return (
        <div className="bg-black">
            <section className="hero-section h-screen w-full flex items-center justify-center snap-start" style={{ opacity }}>
                <div className="absolute inset-0 bg-[url('https://static.tumblr.com/maopbtg/E9Bmgtoht/splash.png')] opacity-20 mix-blend-overlay"></div>
                <div className="relative row z-10 text-center">
                    <h1 className="dbd-title  font-bold mb-4 animate-pulse">Dead by <br /> Daylight</h1>
                    <img className="dbd-logo " src="dbdL.png" alt="Dead by Daylight logo" />
                </div>
            </section>
            <div ref={charactersSectionRef} className="bg-black py-12 px-4 sm:px-6 lg:px-8  snap-start"></div>
            <section id="characters"   className="bg-black py-12 px-4 sm:px-6 lg:px-8 min-h-screen snap-start">
                <div className="max-w-[90%] mx-auto">
                    <h2 className="text-4xl md:text-6xl font-extrabold text-red-600 mb-10 text-center" > Dead by Daylight </h2>
                    <p className="text-gray-400 text-center mb-8 text-lg"> Explore the survivors and killers of The Entity's realm</p>
                    <Link to="/">
                        <button type="button" className="mb-10 flex items-center bg-gray-800 hover:bg-red-900 text-white px-4 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-red-500/30">
                            <FaArrowLeftLong /> <span className="ml-3">Home</span>
                        </button>
                    </Link>
                    <RotateDbd characters={characters} showCharacterDetails={showCharacterDetails} />
                    <DbdKiller killers={charactersK} showKillerDetails={showCharacterDetails} />
                    {modalVisible && selectedCharacter && (<DbdCards selectedCharacter={selectedCharacter} closeModal={closeModal} />)}
                </div>
            </section>
        </div>
    );
}