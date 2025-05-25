import React from 'react';

export default function Mobile() {
    return (
        <section id="mobile" className="mb-[8%] mt-[7%]">
            <h1 className="text-2xl font-semibold mb-4 text-center">Game Data Hub Mobile</h1>
            <div className="container mx-auto py-8 px-4">
                <div className="flex flex-wrap justify-center gap-8">
                    <div className="game-card flex flex-col items-center  w-[45%] ">
                        <img  loading="lazy" src="./installimg.png" alt="Game Data Hub Mobile"className="w-[100%] h-[100%] object-cover mb-4"/>
                        <p className="text-center text-gray-400 text-base">
                            Games Data Hub Mobile: More games, new look, and free game giveaways! Store app available globally on Android, and on iPhone and iPad in the EU.
                        </p>
                    </div>

                    <div className="game-card flex flex-col items-center w-[45%] ">
                        <img src="./qrcode.png" alt="Game Data Hub Store" className="w-[100%] h-[100%] object-cover mb-4"  loading="lazy" />
                        <p className="text-center text-gray-400 text-base">
                            Discover new game releases, exclusive content, and community features in the Game Data Hub Store. Join now to explore amazing gaming experiences!
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
