import React from 'react';

export default function Mobile() {
    return (
        <section id="mobile" className="mb-6 mt-6" data-aos="fade-up">
            <h1 className="text-2xl font-semibold mb-4 text-center text-white">Game Data Hub Mobile</h1>
            <div className="container mx-auto py-8 px-4">
                <div className="flex flex-wrap justify-center gap-8">
                    {/* Left image - no hover effect */}
                    <div data-aos="fade-right" data-aos-delay="0" className="flex flex-col items-center w-[45%] p-4 bg-transparent rounded-lg">
                        <img loading="lazy" src="./installimg.png" alt="Game Data Hub Mobile" className="w-[100%] h-[100%] object-cover mb-4" />
                        <p className="text-center text-gray-400 text-base">
                            Games Data Hub Mobile: More games, new look, and free game giveaways! Store app available globally on Android, and on iPhone and iPad in the EU.
                        </p>
                    </div>

                    {/* Right image - QR code with zoom effect */}
                    <div
                        data-aos="fade-left"
                        data-aos-delay="200"
                        className="flex flex-col items-center w-[45%] p-4 bg-transparent rounded-lg group"
                    >
                        <div className="overflow-hidden rounded-lg w-full">
                            <img
                                src="./qrcode.png"
                                alt="Game Data Hub Store"
                                className="w-full h-auto object-contain mb-4 transition-transform duration-300 ease-in-out group-hover:scale-[1.6]"
                                loading="lazy"
                            />
                        </div>

                        <p className="text-center text-gray-400 text-base">
                            Discover new game releases, exclusive content, and community features in the Game Data Hub Store. Join now to explore amazing gaming experiences!
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
