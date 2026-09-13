import React from 'react';

export default function Mobile() {
    return (
        <section id="mobile" className="!mb-12">
            <div className="gh-surface overflow-hidden grid grid-cols-1 lg:grid-cols-5">
                <div className="lg:col-span-3 p-5 sm:p-10 flex flex-col justify-center">
                    <p className="gh-eyebrow mb-3">Mobile app</p>
                    <h2 className="!mb-0 text-2xl sm:text-3xl font-extrabold text-white">Game Data Hub on your phone</h2>
                    <p className="mt-3 text-[#a1a6b3] leading-relaxed max-w-lg">
                        More games, a new look and free game giveaways. Available globally on Android, and on iPhone and iPad in the EU.
                    </p>
                    <p className="mt-2 text-sm text-[#6b7080] leading-relaxed max-w-lg">
                        Discover new releases, exclusive content and community features in the Game Data Hub Store.
                    </p>
                    <div className="mt-6 hidden md:flex items-center gap-4">
                        <div className="group rounded-xl bg-white p-2 flex-shrink-0 overflow-hidden">
                            <img
                                src="./qrcode.png"
                                alt="QR code for the Game Data Hub Store"
                                loading="lazy"
                                decoding="async"
                                width="96"
                                height="96"
                                className="h-24 w-24 object-contain transition-transform duration-300 group-hover:scale-110"
                            />
                        </div>
                        <p className="text-sm text-[#a1a6b3]">Scan the code with your phone<br />to open the store page.</p>
                    </div>
                </div>
                <div className="lg:col-span-2 bg-[#171a22] flex items-center justify-center pt-6 px-6 max-h-[260px] sm:max-h-[340px] lg:max-h-none overflow-hidden">
                    <img
                        loading="lazy"
                        decoding="async"
                        src="./installimg.png"
                        alt="Game Data Hub Mobile"
                        className="w-full max-w-xs sm:max-w-sm object-contain object-top"
                    />
                </div>
            </div>
        </section>
    );
}
