import React, { useEffect, useState } from "react";
import RotateDbd from "./RotateDbd.jsx";
import DbdCards from "./DbdCards.jsx";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaSkull, FaUserInjured, FaShieldAlt } from "react-icons/fa";
import DbdKiller from "./DbdKiller.jsx";
import "./DbdApp.css";
import { API_BASE, cachedFetch } from "../../Components/apiCache.js";
import { useT } from "../../i18n/index.jsx";

// DBD API Base URL - Original backend
const DBD_API = API_BASE;

export default function DbdApp() {
    const { t } = useT();
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
            
            // Survivors and killers in parallel, from the persistent cache when available
            const [survData, killData] = await Promise.all([
                cachedFetch(`${DBD_API}/characters`, { maxAge: 24 * 60 * 60 * 1000 }),
                cachedFetch(`${DBD_API}/charactersK`, { maxAge: 24 * 60 * 60 * 1000 }),
            ]);
            setLoadingProgress(100);
            
            // No perks endpoint - skip
            const perksData = [];
            setLoadingProgress(100);
            
            // Format survivors
            const formattedSurvivors = survData.map(s => ({
                id: s._id ?? s.id,
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
                image: s.icon?.portrait || s.icon?.preview_portrait || s.imgs,
                isFree: s.is_free,
                isPtb: s.is_ptb
            }));
            
            // Format killers
            const formattedKillers = killData.map(k => ({
                id: k._id ?? k.id,
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
                image: k.icon?.portrait || k.icon?.preview_portrait || k.imgs,
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
                    <h2 className="dbd-loading-title">{t('dbd.loadingTitle')}</h2>
                    <div className="dbd-loading-bar">
                        <div 
                            className="dbd-loading-progress" 
                            style={{ width: `${loadingProgress}%` }}
                        ></div>
                    </div>
                            <p className="dbd-loading-text">{t('dbd.loadingText')}</p>
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
                    <p className="dbd-subtitle">{t('dbd.subtitle')}</p>
                    
                    <div className="dbd-hero-stats">
                        <div className="dbd-stat">
                            <FaUserInjured className="dbd-stat-icon" />
                            <span className="dbd-stat-value">{survivors.length}</span>
                            <span className="dbd-stat-label">{t('dbd.survivors')}</span>
                        </div>
                        <div className="dbd-stat">
                            <FaSkull className="dbd-stat-icon" />
                            <span className="dbd-stat-value">{killers.length}</span>
                            <span className="dbd-stat-label">{t('dbd.killers')}</span>
                        </div>
                        <div className="dbd-stat">
                            <FaShieldAlt className="dbd-stat-icon" />
                            <span className="dbd-stat-value">{perks.length}</span>
                            <span className="dbd-stat-label">{t('dbd.perks')}</span>
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
                        <span>{t('dbd.survivors')}</span>
                    </button>
                    <button 
                        className={`dbd-nav-tab ${activeTab === 'killers' ? 'active' : ''}`}
                        onClick={() => setActiveTab('killers')}
                    >
                        <FaSkull />
                        <span>{t('dbd.killers')}</span>
                    </button>
                    <button 
                        className={`dbd-nav-tab ${activeTab === 'perks' ? 'active' : ''}`}
                        onClick={() => setActiveTab('perks')}
                    >
                        <FaShieldAlt />
                        <span>{t('dbd.perks')}</span>
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
                            <span>{t('dbd.backToHub')}</span>
                        </Link>
                    </div>

                    {/* Survivors Tab */}
                    {activeTab === 'survivors' && (
                        <div className="dbd-tab-content">
                            <div className="dbd-section-header">
                                <h2 className="dbd-section-title dbd-survivors-title">
                                    <FaUserInjured /> {t('dbd.survivors')}
                                </h2>
                                <p className="dbd-section-subtitle">
                                    {t('dbd.survivorsSubtitle')}
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
                                    <FaSkull /> {t('dbd.killers')}
                                </h2>
                                <p className="dbd-section-subtitle">
                                    {t('dbd.killersSubtitle')}
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
                                    <FaShieldAlt /> {t('dbd.allPerks')}
                                </h2>
                                <p className="dbd-section-subtitle">
                                    {t('dbd.perksSubtitle')}
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
                                                <img src={perk.icon} alt={perk.name} loading="lazy" />
                                            ) : (
                                                <FaShieldAlt />
                                            )}
                                        </div>
                                        <div className="dbd-perk-info">
                                            <h3>{perk.name}</h3>
                                            <span className={`dbd-perk-role ${perk.role === 'Survivor' ? 'survivor' : 'killer'}`}>
                                                {perk.role === 'Survivor' ? t('dbd.survivor') : perk.role === 'Killer' ? t('dbd.killer') : perk.role}
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
                        {t('dbd.fanMade')}
                    </p>
                    <p className="dbd-footer-copyright">
                        {t('dbd.notAffiliated')}
                    </p>
                </div>
            </footer>
        </div>
    );
}
