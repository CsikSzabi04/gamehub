import React from 'react'
import { FaGithub } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";
import { FaGamepad, FaSquareInstagram } from "react-icons/fa6";
import { SiGmail } from "react-icons/si";

export default function Footer() {
    return (
        <>
        <footer className="bg-gray-900 text-white ">
            <div className="container mx-auto px-6 md:px-12 w-full">
                <div className="flex flex-col md:flex-row justify-between items-center md:items-start">
                <div className="flex flex-col items-center md:items-start">
                        <div className="flex items-center mb-4">
                            <FaGamepad className="text-sky-500 text-3xl mr-2" />
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-sky-500 to-cyan-700 bg-clip-text text-transparent">
                                Game Data Hub
                            </h3>
                        </div>
                        <p className="text-gray-400 text-center md:text-left ">Your one-stop hub for discovering and tracking your favorite games. Stay updated with news, multiplayer games, and more.</p>
                        <br />
                        <p className="text-gray-400 text-center md:text-left max-w-md">
                            The ultimate gaming companion. Discover, track, and stay updated with your favorite games.
                        </p>
                    </div>

                    <div className="mb-4 md:mb-0 text-center md:text-left">
                        <h4 className="text-lg font-semibold sm:text-xl">Quick Links</h4>
                        <ul className="space-y-2 mt-2 text-sm sm:text-base">
                            <li><a href="/" className="hover:text-lime-600">Home</a></li>
                            <li><a href="/discover" className="hover:text-lime-600">Discover</a></li>
                            <li><a href="/contact" className="hover:text-lime-600">Contact</a></li>
                            <li><a href="/review" className="hover:text-lime-600">Our Community</a></li>
                        </ul>
                    </div>

                    <div className="mb-4 md:mb-0 text-center md:text-left">
                        <h4 className="text-lg font-semibold sm:text-xl">Follow Us</h4>
                        <div className="flex justify-center md:justify-start space-x-6 mt-2">
                            <a href="https://github.com/CsikSzabi04" target="_blank" rel="noopener noreferrer" className="text-white hover:text-lime-600">
                                <FaGithub size={24} className="sm:text-3xl md:text-4xl" />
                            </a>
                            <a href="https://www.linkedin.com/in/szabolcs-cs%C3%ADk-a4b767315/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-lime-600">
                                <FaLinkedin size={24} className="sm:text-3xl md:text-4xl" />
                            </a>
                            <a href="https://www.instagram.com/cs_szabj04/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-lime-600">
                                <FaSquareInstagram size={24} className="sm:text-3xl md:text-4xl" />
                            </a>
                            <a href="https://mail.google.com/mail/u/0/?fs=1&to=helpdesk.gamehub@gmail.com.com&su=Collaboration+Opportunity+/+Egy%C3%BCttm%C5%B1k%C3%B6d%C3%A9si+Lehet%C5%91s%C3%A9g&body=Dear+Cs%C3%ADk+Szabolcs+Alex,%0A%0AI+would+like+to+discuss+a+collaboration+opportunity+with+you.%0A%0ABest+regards,%0A%0A%5BYour+Name%5D%0A%0A---%0A%0AKedves+Cs%C3%ADk+Szabolcs+Alex,%0A%0ASzeretn%C3%A9k+egy+egy%C3%BCttm%C5%B1k%C3%B6d%C3%A9si+lehet%C5%91s%C3%A9gr%C5%91l+besz%C3%A9lni+veled.%0A%0A%C3%9Cdv%C3%B6zlettel,%0A%0A%5BNeved%5D&tf=cm" target="_blank" rel="noopener noreferrer" className="text-white hover:text-lime-600">
                                <SiGmail size={24} className="sm:text-3xl md:text-4xl" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-8 border-t border-gray-700 pt-4 text-center">
                    <p className="text-sm sm:text-base">&copy; 2025 Game <span className='text-sky-500'> Data</span> Hub. All Rights Reserved.</p>
                    <div className="mt-2 text-sm sm:text-base">
                        <a href="/terms" className="text-white hover:text-lime-600">Terms of Service</a> |
                        <a href="/privacy" className="text-white hover:text-lime-600"> Privacy Policy</a>
                    </div>
                    <div className="mt-2 text-xs sm:text-base">
                       <span className='text-xs'>Made By:</span>  <a href="https://csszabj.netlify.app/" target='_blank' className="text-white hover:text-sky-600 text-xs">Szabolcs Csík</a> , <a href="" className="text-white hover:text-sky-600 text-xs">Balog Bence</a> , <a href="" className="text-white hover:text-sky-600 text-xs">Furdan Milán</a>
                    </div>
                </div>
            </div>
        </footer>
        </>
    );
};
