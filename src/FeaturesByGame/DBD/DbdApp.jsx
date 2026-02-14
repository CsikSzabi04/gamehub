import React, { useEffect, useState } from "react";
import RotateDbd from "./RotateDbd.jsx";
import DbdCards from "./DbdCards.jsx";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaSkull, FaUserInjured, FaShieldAlt } from "react-icons/fa";
import DbdKiller from "./DbdKiller.jsx";
import "./DbdApp.css";

// DBD API Base URL - Original backend
const DBD_API = "https://gamehub-backend-zekj.onrender.com";

export default function DbdApp() {
    const [survivors, setSurvivors] = useState([]);
    const [killers, setKillers] = useState([]);
    const [perks, setPerks] = useState([]);
    const [selectedCharacter, setSelectedCharacter] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [activeTab, setActiveTab] = useState('survivors');
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        fetchAllData();
        
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };
        
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    async function fetchAllData() {
        try {
            setLoading(true);
            setLoadingProgress(10);
            
            // Fetch Survivors
            const survRes = await fetch(`${DBD_API}/characters`);
            const survData = await survRes.json();
            setLoadingProgress(40);
            
            // Fetch Killers
            const killRes = await fetch(`${DBD_API}/charactersK`);
            const killData = await killRes.json();
            setLoadingProgress(100);
            
            // No perks endpoint - skip
            const perksData = [];
            setLoadingProgress(100);
            
            // Format survivors
            const formattedSurvivors = survData.map(s => ({
                id: s._id,
                name: s.name,
                fullName: s.full_name || s.name,
                role: s.role,
                gender: s.gender,
                nationality: s.nationality,
                difficulty: s.difficulty,
                dlc: s.dlc,
                overview: s.overview,
                lore: s.lore,
                perks: s.perks || [],
                image: s.icon?.portrait || s.icon?.preview_portrait,
                isFree: s.is_free,
                isPtb: s.is_ptb
            }));
            
            // Format killers
            const formattedKillers = killData.map(k => ({
                id: k._id,
                name: k.name,
                fullName: k.full_name,
                role: "Killer",
                gender: k.gender,
                nationality: k.nationality,
                difficulty: k.difficulty,
                realm: k.realm,
                power: k.power,
                weapon: k.weapon,
                speed: k.speed,
                terrorRadius: k.terror_radius,
                height: k.height,
                dlc: k.dlc,
                overview: k.overview,
                lore: k.lore,
                perks: k.perks || [],
                image: k.icon?.portrait || k.icon?.preview_portrait,
                isFree: k.is_free,
                isPtb: k.is_ptb
            }));
            
            // Format perks
            const formattedPerks = perksData.map(p => ({
                id: p._id,
                name: p.perk_name,
                role: p.role,
                description: p.description,
                icon: p.icon,
                teachLevel: p.teach_level,
                isPtb: p.is_ptb
            }));
            
            setSurvivors(formattedSurvivors);
            setKillers(formattedKillers);
            setPerks(formattedPerks);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching DBD data:", error);
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

    const opacity = Math.max(1 - scrollY / 300, 0.3);

    if (loading) {
        return (
            <div className="dbd-loading">
                <div className="dbd-loading-content">
                    <div className="dbd-loading-icon">💀</div>
                    <h2 className="dbd-loading-title">Entering The Fog...</h2>
                    <div className="dbd-loading-bar">
                        <div 
                            className="dbd-loading-progress" 
                            style={{ width: `${loadingProgress}%` }}
                        ></div>
                    </div>
                    <p className="dbd-loading-text">Summoning characters from The Entity's realm...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dbd-page">
            {/* Hero Section */}
            <section className="dbd-hero" style={{ opacity }}>
                <div className="dbd-hero-overlay"></div>
                <div className="dbd-fog-effect"></div>
                
                <div className="dbd-hero-content">
                    <div className="dbd-logo-container">
                        <h1 className="dbd-main-title">DEAD BY</h1>
                        <h1 className="dbd-main-title dbd-title-outline">DAYLIGHT</h1>
                    </div>
                    <p className="dbd-subtitle">Choose your fate. Survive or hunt.</p>
                    
                    <div className="dbd-hero-stats">
                        <div className="dbd-stat">
                            <FaUserInjured className="dbd-stat-icon" />
                            <span className="dbd-stat-value">{survivors.length}</span>
                            <span className="dbd-stat-label">Survivors</span>
                        </div>
                        <div className="dbd-stat">
                            <FaSkull className="dbd-stat-icon" />
                            <span className="dbd-stat-value">{killers.length}</span>
                            <span className="dbd-stat-label">Killers</span>
                        </div>
                        <div className="dbd-stat">
                            <FaShieldAlt className="dbd-stat-icon" />
                            <span className="dbd-stat-value">{perks.length}</span>
                            <span className="dbd-stat-label">Perks</span>
                        </div>
                    </div>
                </div>
                
                <div className="dbd-scroll-indicator">
                    <span></span>
                </div>
            </section>

            {/* Navigation Tabs */}
            <nav className="dbd-nav">
                <div className="dbd-nav-container">
                    <button 
                        className={`dbd-nav-tab ${activeTab === 'survivors' ? 'active' : ''}`}
                        onClick={() => setActiveTab('survivors')}
                    >
                        <FaUserInjured />
                        <span>Survivors</span>
                    </button>
                    <button 
                        className={`dbd-nav-tab ${activeTab === 'killers' ? 'active' : ''}`}
                        onClick={() => setActiveTab('killers')}
                    >
                        <FaSkull />
                        <span>Killers</span>
                    </button>
                    <button 
                        className={`dbd-nav-tab ${activeTab === 'perks' ? 'active' : ''}`}
                        onClick={() => setActiveTab('perks')}
                    >
                        <FaShieldAlt />
                        <span>Perks</span>
                    </button>
                </div>
            </nav>

            {/* Content Section */}
            <section className="dbd-content">
                <div className="dbd-content-container">
                    {/* Back Button */}
                    <div className="dbd-back-section">
                        <Link to="/" className="dbd-back-btn">
                            <FaArrowLeft />
                            <span>Back to Hub</span>
                        </Link>
                    </div>

                    {/* Survivors Tab */}
                    {activeTab === 'survivors' && (
                        <div className="dbd-tab-content">
                            <div className="dbd-section-header">
                                <h2 className="dbd-section-title dbd-survivors-title">
                                    <FaUserInjured /> Survivors
                                </h2>
                                <p className="dbd-section-subtitle">
                                    Every survivor has unique perks and abilities. Choose wisely.
                                </p>
                            </div>
                            <RotateDbd 
                                characters={survivors} 
                                showCharacterDetails={showCharacterDetails} 
                            />
                        </div>
                    )}

                    {/* Killers Tab */}
                    {activeTab === 'killers' && (
                        <div className="dbd-tab-content">
                            <div className="dbd-section-header">
                                <h2 className="dbd-section-title dbd-killers-title">
                                    <FaSkull /> Killers
                                </h2>
                                <p className="dbd-section-subtitle">
                                    Each killer has their own power and playstyle. Embrace the hunt.
                                </p>
                            </div>
                            <DbdKiller 
                                killers={killers} 
                                showKillerDetails={showCharacterDetails} 
                            />
                        </div>
                    )}

                    {/* Perks Tab */}
                    {activeTab === 'perks' && (
                        <div className="dbd-tab-content">
                            <div className="dbd-section-header">
                                <h2 className="dbd-section-title">
                                    <FaShieldAlt /> All Perks
                                </h2>
                                <p className="dbd-section-subtitle">
                                    Browse all available perks for survivors and killers.
                                </p>
                            </div>
                            <div className="dbd-perks-grid">
                                {perks.slice(0, 50).map((perk) => (
                                    <div 
                                        key={perk.id} 
                                        className={`dbd-perk-card ${perk.role === 'Survivor' ? 'dbd-survivor-perk' : 'dbd-killer-perk'}`}
                                    >
                                        <div className="dbd-perk-icon">
                                            {perk.icon ? (
                                                <img src={perk.icon} alt={perk.name} />
                                            ) : (
                                                <FaShieldAlt />
                                            )}
                                        </div>
                                        <div className="dbd-perk-info">
                                            <h3>{perk.name}</h3>
                                            <span className={`dbd-perk-role ${perk.role === 'Survivor' ? 'survivor' : 'killer'}`}>
                                                {perk.role}
                                            </span>
                                            <p>{perk.description?.substring(0, 100)}...</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Modal */}
            {modalVisible && selectedCharacter && (
                <DbdCards 
                    selectedCharacter={selectedCharacter} 
                    closeModal={closeModal} 
                />
            )}

            {/* Footer */}
            <footer className="dbd-footer">
                <div className="dbd-footer-content">
                    <div className="dbd-footer-logo">💀 Dead by Daylight</div>
                    <p className="dbd-footer-text">
                        This is a fan-made website. Dead by Daylight™ is a trademark of Behaviour Interactive Inc.
                    </p>
                    <p className="dbd-footer-copyright">
                        Not affiliated with Behaviour Interactive. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
