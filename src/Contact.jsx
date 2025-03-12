import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import './body.css';
import Search from './Search.jsx';
import "tailwindcss";
import { UserContext } from './UserContext.jsx';
import { auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import Footer from './Footer.jsx';
import { CiLogin } from "react-icons/ci";
import { FaGithub } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";
import { FaSquareInstagram } from "react-icons/fa6";
import { SiGmail } from "react-icons/si";
import Header from './Header.jsx';

export default function Contact() {
    const [allGames, setAllGames] = useState([]);
    const [multiplayerGames, setMultiplayerGames] = useState([]);
    const [actionGames, setActionGames] = useState([]);
    const [scifi, setScifi] = useState([]);
    const [exploration, setExplore] = useState([]);
    const [rating, setRatings] = useState([]);
    const [selectedGame, setSelectedGame] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [games, setGames] = useState([]);
    const [store, setStore] = useState([])
    const [modalStoreVisible, setStoreVisible] = useState(false);
    const [searchTrue, setSearchTrue] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const name = "";

    useEffect(() => {
        async function fetchFeaturedGames() {
            try {
                const response = await fetch('https://gamehub-backend-zekj.onrender.com/fetch-games');
                const data = await response.json();
                setAllGames(data.games); // Access games 
            } catch (error) {
                console.error("Error:", error);
            }
        }
        fetchFeaturedGames();
    }, []);


    useEffect(() => {
        if (allGames.length > 0) {
            categorizeGames();
        } setStoreVisible(false)
    }, [allGames]);


    function categorizeGames() {
        setMultiplayerGames(allGames.filter(game => game.tags?.some(tag => tag.name.toLowerCase().includes("multiplayer"))));
        setActionGames(allGames.filter(game => game.genres?.some(genre => genre.name.toLowerCase().includes("action"))));
        setScifi(allGames.filter(game => game.tags?.some(tag => tag.name.toLowerCase().includes("sci-fi"))));
        setExplore(allGames.filter(game => game.tags?.some(tag => tag.name.toLowerCase().includes("exploration"))));
    }


    function showGameDetails(game) {
        const requirements = game.platforms?.map(p => p.requirements_en?.minimum).join(", ");
        setSelectedGame({ ...game, requirements });
        setModalVisible(true);
    }


    function closeModal() {
        setModalVisible(false);
        setSelectedGame(null);
    }

    function ref() {
        window.location.reload();
    }
    useEffect(() => {
        async function getStores() {
            try {
                const resp = await fetch('https://gamehub-backend-zekj.onrender.com/stores');
                const data = await resp.json();
                setStore(data)
            } catch (error) { console.log({ "Fetch error: ": error }) }
        }
        getStores()
    }, [])
    function stores() {
        setStoreVisible(true)
        //console.log(store)
    }
    function closeStore() { setStoreVisible(false) }

    function openStoreUrl(name) {
        console.log(name);

        let url = "";

        if (name.toLowerCase() == 'steam') {
            url = 'store.steampowered.com/';
        } else if (name.toLowerCase() == 'getgamez') {
            url = 'getgamez.net/';
        } else if (name.toLowerCase() == 'playfield') {
            url = 'www.playitstore.hu/';
        } else if (name.toLowerCase() == 'imperial games') {
            url = 'imperial.games/';
        } else if (name.toLowerCase() == 'funstockdigital') {
            url = 'funstock.eu';
        } else if (name.toLowerCase() == 'razer game store') {
            url = 'www.razer.com/eu-en/store';
        } else {
            url = `${name.toLowerCase().replace(/\s+/g, '')}.com`; //itt Bence te a store.storeName.toLowerCase-t tetted... XDD
        }

        window.open(`https://${url}`, '_blank');
    }

    const [isFavModalOpen, setIsFavModalOpen] = useState(false);

    function openFavModal() {
        console.log('Opening favorites modal');
        setIsFavModalOpen(true);
    };

    function closeFavModal() {
        console.log('Closing favorites modal');
        setIsFavModalOpen(false);
    };

    const [favorites, setFavorites] = useState([]);
    const { user } = useContext(UserContext);


    useEffect(() => {
        async function getFavorites() {
            try {
                const resp = await fetch(`https://gamehub-backend-zekj.onrender.com/getFav?userId=${user.uid}`);
                const data = await resp.json();
                setFavorites(data);
            } catch (error) {
                setError("Error fetching favorites");
                console.error("Error fetching favorites:", error);
            }
        }
        if (user) {
            getFavorites();
            const intervalId = setInterval(getFavorites, 1000);
            return () => clearInterval(intervalId);
        }
    }, [user]);

    function handleLogout() {
        signOut(auth);
        async function getFavorites() {
            try {
                const resp = await fetch(`https://gamehub-backend-zekj.onrender.com/getFav`);
                const data = await resp.json();
                setFavorites(data);
            } catch (error) {
                setError("Error fetching favorites");
                console.error("Error fetching favorites:", error);
            }
        }
        getFavorites();
    };

    const [menuOpen, setMenuOpen] = useState(false);
    return (
        <>
            <div className='bg-gradient-to-r from-cyan-700 via-sky-800 to-blue-900'>
               <Header />

                <div className="main-content flex flex-col justify-center items-center p-8 shadow-lg">
                    <div className="text-center text-white">
                        <h4 className="text-4xl font-semibold mb-4 sm:text-3xl md:text-4xl lg:text-5xl">Have a question? Connect with us!</h4>
                        <div className="flex justify-center flex-wrap gap-6 mt-4">
                            <a href="https://github.com/CsikSzabi04" target="_blank" rel="noopener noreferrer" className="text-white hover:text-sky-600 p-3 rounded-full bg-gray-800 hover:bg-gray-700 transition duration-300">
                                <FaGithub size={40} className="sm:text-3xl md:text-4xl" />
                            </a>
                            <a href="https://www.linkedin.com/in/szabolcs-cs%C3%ADk-a4b767315/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-sky-600 p-3 rounded-full bg-gray-800 hover:bg-gray-700 transition duration-300">
                                <FaLinkedin size={40} className="sm:text-3xl md:text-4xl" />
                            </a>
                            <a href="https://www.instagram.com/cs_szabj04/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-sky-600 p-3 rounded-full bg-gray-800 hover:bg-gray-700 transition duration-300">
                                <FaSquareInstagram size={40} className="sm:text-3xl md:text-4xl" />
                            </a>
                            <a href="https://mail.google.com/mail/u/0/?fs=1&to=alexszabi04@gmail.com&su=Collaboration+Opportunity+/+Egy%C3%BCttm%C5%B1k%C3%B6d%C3%A9si+Lehet%C5%91s%C3%A9g&body=Dear+Cs%C3%ADk+Szabolcs+Alex,%0A%0AI+would+like+to+discuss+a+collaboration+opportunity+with+you.%0A%0ABest+regards,%0A%0A%5BYour+Name%5D%0A%0A---%0A%0AKedves+Cs%C3%ADk+Szabolcs+Alex,%0A%0ASzeretn%C3%A9k+egy+egy%C3%BCttm%C5%B1k%C3%B6d%C3%A9si+lehet%C5%91s%C3%A9gr%C5%91l+besz%C3%A9lni+veled.%0A%0A%C3%9Cdv%C3%B6zlettel,%0A%0A%5BNeved%5D&tf=cm" target="_blank" rel="noopener noreferrer" className="text-white hover:text-lime-600 p-3 rounded-full bg-gray-800 hover:bg-gray-700 transition duration-300">
                                <SiGmail size={40} className="sm:text-3xl md:text-4xl" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}
