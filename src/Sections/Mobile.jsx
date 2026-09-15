import React from 'react';
import { useT } from '../i18n/index.jsx';

export default function Mobile() {
    const { t } = useT();
    return (
        <section id="mobile" className="!mb-12">
            <div className="gh-surface overflow-hidden grid grid-cols-1 lg:grid-cols-5">
                <div className="lg:col-span-3 p-5 sm:p-10 flex flex-col justify-center">
                    <p className="gh-eyebrow mb-3">{t('home.mobile.eyebrow')}</p>
                    <h2 className="!mb-0 text-2xl sm:text-3xl font-extrabold text-white">{t('home.mobile.title')}</h2>
                    <p className="mt-3 text-[#a1a6b3] leading-relaxed max-w-lg">
                        {t('home.mobile.text')}
                    </p>
                    <p className="mt-2 text-sm text-[#6b7080] leading-relaxed max-w-lg">
                        {t('home.mobile.subtext')}
                    </p>
                    <div className="mt-6 hidden md:flex items-center gap-4">
                        {/* The white padding is the QR quiet zone; the image itself is cropped to the code */}
                        <div className="rounded-xl bg-white p-2 flex-shrink-0">
                            <img
                                src="./qrcode-scan.png"
                                alt={t('home.mobile.qrAlt')}
                                loading="lazy"
                                decoding="async"
                                width="112"
                                height="112"
                                className="block h-28 w-28 [image-rendering:pixelated]"
                            />
                        </div>
                        <p className="text-sm text-[#a1a6b3]">{t('home.mobile.scanLine1')}<br />{t('home.mobile.scanLine2')}</p>
                    </div>
                </div>
                {/* The artwork covers the whole right column (below lg it becomes a banner) */}
                <div className="relative lg:col-span-2 bg-[#171a22] aspect-[16/9] lg:aspect-auto lg:min-h-full overflow-hidden">
                    <picture>
                        <source srcSet="./installimg.webp" type="image/webp" />
                        <img
                            loading="lazy"
                            decoding="async"
                            src="./installimg.png"
                            alt="Game Data Hub Mobile"
                            className="absolute inset-0 h-full w-full object-cover object-center"
                        />
                    </picture>
                </div>
            </div>
        </section>
    );
}
