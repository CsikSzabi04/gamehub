export default function MainSection({ allGames, showGameDetails }) {
    return (
        <div className="container mx-auto p-2">
            <section id="featured-games" className="mb-6 ">
                <h2 className="text-xl font-semibold mb-3"></h2>
                <div id="games-grid" className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {Array.isArray(allGames) && allGames.length >= 4 ? (
                        <>
                            <div 
                                key={allGames[8].id} 
                                className="`game-card md:col-span-2 md:row-span-1 hover:shadow-lg mr-5 transition transform cursor-pointer  bg-[url${allGames[8].background_image}]`"
                                onClick={() => showGameDetails(allGames[8])}
                            >
                                <img src={allGames[8].background_image} alt={allGames[8].name} className="w-10% h-10%  object-cover rounded-md" />
                                    <h3 className="text-md font-bold truncate">{allGames[8].name}</h3>
                                    <p className="text-xs text-gray-400">Released: {allGames[8].released || 'N/A'}</p>
                                    <p className="text-xs text-gray-400">Rating: {allGames[8].rating || 'N/A'}/5</p>
                            </div>
                            <div className="md:col-span-1 flex flex-col gap-2">
                                {allGames.slice(15, 18).map((game) => (
                                    <div 
                                        key={game.id} 
                                        className="`game-card hover:shadow-lg hover:scale-105 transition transform cursor-pointer flex flex-col bg-[url${game.background_image}]`"
                                        onClick={() => showGameDetails(game)}
                                    >
                                        <img src={game.background_image} alt={game.name} className="w-full h-24  object-cover rounded-md" />
                                        <div className="game-details p-1">
                                            <h3 className="text-sm font-bold truncate">{game.name}</h3>
                                            <p className="text-xs text-gray-400">Released: {game.released || 'N/A'}</p>
                                            <p className="text-xs text-gray-400">Rating: {game.rating || 'N/A'}/5</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (<p className="text-white">No games found.</p>)}
                </div>
            </section>
        </div>
    );
}
