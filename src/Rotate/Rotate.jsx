import { useEffect, useState } from "react";
import '../body.css';
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import GameCard from "../Components/GameCard.jsx";
import { useT } from "../i18n/index.jsx";

// Card width + gap-4 (16px) from md (300px cards). Below md the track is a native swipe scroller
// (.gh-scroller/.gh-track in body.css) and the translate is ignored.
function getStep() {
    if (window.innerWidth >= 768) return 316;
    if (window.innerWidth >= 640) return 276;
    return 236;
}

export default function Rotate({ games, showGameDetails, name, intervalTimeA }) {
    const { t } = useT();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [step, setStep] = useState(getStep);

    useEffect(() => {
        const handleResize = () => setStep(getStep());
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        // With an empty list the modulo would be NaN and the carousel would stay broken forever
        if (!games.length) return;
        setCurrentIndex(0);

        const rotateInterval = setInterval(() => {
            setCurrentIndex(prevIndex => (prevIndex + 2) % games.length);
        }, intervalTimeA);

        return () => clearInterval(rotateInterval);
    }, [games, intervalTimeA]);

    const nextItem = () => {
        if (!games.length) return;
        setCurrentIndex(prevIndex => (prevIndex + 1) % games.length);
    };

    const prevItem = () => {
        if (!games.length) return;
        setCurrentIndex(prevIndex => (prevIndex - 1 + games.length) % games.length);
    };

    return (
        <div className="relative mb-10 sm:mb-12">
            <div className="flex items-end justify-between gap-4 mb-4">
                <h2 className="gh-section-title">{name}</h2>
                <div className="hidden md:flex items-center gap-2">
                    <button onClick={prevItem} className="gh-icon-btn !w-9 !h-9" aria-label={t('rotate.previous', { name })}>
                        <BsChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={nextItem} className="gh-icon-btn !w-9 !h-9" aria-label={t('rotate.next', { name })}>
                        <BsChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="gh-scroller overflow-hidden -my-2 py-2">
                <div
                    className="gh-track flex gap-4 transition-transform duration-700 ease-in-out"
                    style={{ transform: `translateX(-${currentIndex * step}px)` }}
                >
                    {games.concat(games).map((x, index) => (
                        <GameCard
                            key={`${x.id}-${index}`}
                            game={x}
                            onClick={showGameDetails}
                            className="w-[44vw] sm:w-[34vw] md:w-[300px] flex-shrink-0"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
