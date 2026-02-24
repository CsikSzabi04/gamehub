import React from 'react'
import { FaGithub } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";
import { FaGamepad, FaSquareInstagram } from "react-icons/fa6";
import { SiGmail } from "react-icons/si";
import { motion } from 'framer-motion';

export default function Footer() {
    return (
        <>
        <footer className="bg-gradient-to-t from-[#030712] to-transparent border-t border-white/5 mt-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                    {/* Brand Section */}
                    <div className="lg:col-span-1">
                        <div className="flex items-center mb-4">
                            <FaGamepad className="text-3xl text-violet-500 mr-2" />
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-violet-500 to-cyan-500 bg-clip-text text-transparent">
                                Game Data Hub
                            </h3>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed mb-4">
                            Your one-stop hub for discovering and tracking your favorite games. Stay updated with news, multiplayer games, and more.
                        </p>
                        <div className="flex gap-3">
                            <motion.a 
                                whileHover={{ scale: 1.1, y: -2 }}
                                href="https://github.com/CsikSzabi04" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="p-2.5 rounded-xl bg-white/5 hover:bg-violet-500/20 border border-white/5 hover:border-violet-500/30 transition-all text-gray-400 hover:text-white"
                            >
                                <FaGithub size={20} />
                            </motion.a>
                            <motion.a 
                                whileHover={{ scale: 1.1, y: -2 }}
                                href="https://www.linkedin.com/in/szabolcs-cs%C3%ADk-a4b767315/" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="p-2.5 rounded-xl bg-white/5 hover:bg-blue-500/20 border border-white/5 hover:border-blue-500/30 transition-all text-gray-400 hover:text-white"
                            >
                                <FaLinkedin size={20} />
                            </motion.a>
                            <motion.a 
                                whileHover={{ scale: 1.1, y: -2 }}
                                href="https://www.instagram.com/cs_szabj04/" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="p-2.5 rounded-xl bg-white/5 hover:bg-pink-500/20 border border-white/5 hover:border-pink-500/30 transition-all text-gray-400 hover:text-white"
                            >
                                <FaSquareInstagram size={20} />
                            </motion.a>
                            <motion.a 
                                whileHover={{ scale: 1.1, y: -2 }}
                                href="https://mail.google.com/mail/u/0/?fs=1&to=helpdesk.gamehub@gmail.com.com&su=Collaboration+Opportunity+/+Egy%C3%BCttm%C5%B1k%C3%B6d%C3%A9si+Lehet%C5%91s%C3%A9g&body=Dear+Cs%C3%ADk+Szabolcs+Alex,%0A%0AI+would+like+to+discuss+a+collaboration+opportunity+with+you.%0A%0ABest+regards,%0A%0A%5BYour+Name%5D%0A%0A---%0A%0AKedves+Cs%C3%ADk+Szabolcs+Alex,%0A%0ASzeretn%C3%A9k+egy+egy%C3%BCttm%C5%B1k%C3%B6d%C3%A9si+lehet%C5%91s%C3%A9gr%C5%91l+besz%C3%A9lni+veled.%0A%0A%C3%9Cdv%C3%B6zlettel,%0A%0A%5BNeved%5D&tf=cm" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="p-2.5 rounded-xl bg-white/5 hover:bg-red-500/20 border border-white/5 hover:border-red-500/30 transition-all text-gray-400 hover:text-white"
                            >
                                <SiGmail size={20} />
                            </motion.a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
                        <ul className="space-y-3">
                  
                            <li>
                                <a href="/discover" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm flex items-center group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/50 mr-3 group-hover:bg-cyan-400 transition-colors"></span>
                                    Discover
                                </a>
                            </li>
                            <li>
                                <a href="/contact" className="text-gray-400 hover:text-pink-400 transition-colors text-sm flex items-center group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500/50 mr-3 group-hover:bg-pink-400 transition-colors"></span>
                                    Contact
                                </a>
                            </li>
                            <li>
                                <a href="/review" className="text-gray-400 hover:text-amber-400 transition-colors text-sm flex items-center group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500/50 mr-3 group-hover:bg-amber-400 transition-colors"></span>
                                    Our Community
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-4">Legal</h4>
                        <ul className="space-y-3">
                            <li>
                                <a href="/terms" className="text-gray-400 hover:text-violet-400 transition-colors text-sm flex items-center group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500/50 mr-3 group-hover:bg-violet-400 transition-colors"></span>
                                    Terms of Service
                                </a>
                            </li>
                            <li>
                                <a href="/privacy" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm flex items-center group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/50 mr-3 group-hover:bg-cyan-400 transition-colors"></span>
                                    Privacy Policy
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Made By */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-4">Made By</h4>
                        <ul className="space-y-3">
                            <li>
                                <a 
                                    href="https://csszabj.netlify.app/" 
                                    target='_blank' 
                                    className="text-gray-400 hover:text-violet-400 transition-colors text-sm flex items-center group"
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500/50 mr-3 group-hover:bg-violet-400 transition-colors"></span>
                                    Szabolcs Csík
                                </a>
                            </li>
                            <li>
                                <a 
                                    href="#" 
                                    className="text-gray-400 hover:text-cyan-400 transition-colors text-sm flex items-center group"
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/50 mr-3 group-hover:bg-cyan-400 transition-colors"></span>
                                    Balog Bence
                                </a>
                            </li>
                            <li>
                                <a 
                                    href="#" 
                                    className="text-gray-400 hover:text-pink-400 transition-colors text-sm flex items-center group"
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500/50 mr-3 group-hover:bg-pink-400 transition-colors"></span>
                                    Furdan Milán
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="mt-12 pt-8 border-t border-white/5">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-gray-500 text-sm">
                            © 2025 Game <span className='text-violet-500'>Data</span> Hub. All Rights Reserved.
                        </p>
                        <div className="flex items-center gap-6">
                            <span className="text-gray-600 text-sm">Powered by</span>
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400">RAWG API</span>
                                <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400">CheapShark</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
        </>
    );
};
