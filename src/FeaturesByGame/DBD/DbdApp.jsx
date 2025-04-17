import React, { useEffect, useState } from "react";
import RotateDbd from "./RotateDbd.jsx";
import DbdCards from "./DbdCards.jsx";
import { Link } from "react-router-dom";
import { FaArrowLeftLong } from "react-icons/fa6";

export default function DbdApp() {
    const [characters, setCharacters] = useState([]);
    const [charactersK, setCharactersK] = useState([]);
    const [selectedCharacter, setSelectedCharacter] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCharacters();
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


            const responseK = await fetch("https://gamehub-backend-zekj.onrender.com/characters");
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

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-900">
                <div className="text-red-600 text-xl">Loading characters from The Entity's realm...</div>
            </div>
        );
    }
    if (error) { return (<div className="flex justify-center items-center h-screen bg-gray-900"><div className="text-red-600 text-xl">Error: {error}</div></div>); }
    return (
        <section id="characters" className="bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl font-extrabold text-red-600 mb-2 text-center">Dead by Daylight Characters </h2>
                <p className="text-gray-400 text-center mb-8">Explore the survivors and killers of The Entity's realm </p>
                <Link to="/"><button type="button" className="mb-5 flex items-center bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg">
                    <FaArrowLeftLong />
                    <span className="ml-3">Home</span>
                </button></Link>
                <RotateDbd characters={characters} characterK={charactersK} showCharacterDetails={showCharacterDetails} />
                {modalVisible && selectedCharacter && (<DbdCards selectedCharacter={selectedCharacter} closeModal={closeModal} />)}
            </div>
        </section>
    );
}