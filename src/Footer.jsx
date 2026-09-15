import React from 'react'
import { Link } from 'react-router-dom';
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { FaSquareInstagram } from "react-icons/fa6";
import { SiGmail } from "react-icons/si";
import { CgGames } from "react-icons/cg";
import { useT } from './i18n/index.jsx';
import LanguageSwitcher from './Components/LanguageSwitcher.jsx';
import { openCookieSettings } from './consent/consent.js';

const MAIL_URL = "https://mail.google.com/mail/u/0/?fs=1&to=helpdesk.gamehub@gmail.com&su=Collaboration+Opportunity+/+Egy%C3%BCttm%C5%B1k%C3%B6d%C3%A9si+Lehet%C5%91s%C3%A9g&body=Dear+Cs%C3%ADk+Szabolcs+Alex,%0A%0AI+would+like+to+discuss+a+collaboration+opportunity+with+you.%0A%0ABest+regards,%0A%0A%5BYour+Name%5D%0A%0A---%0A%0AKedves+Cs%C3%ADk+Szabolcs+Alex,%0A%0ASzeretn%C3%A9k+egy+egy%C3%BCttm%C5%B1k%C3%B6d%C3%A9si+lehet%C5%91s%C3%A9gr%C5%91l+besz%C3%A9lni+veled.%0A%0A%C3%9Cdv%C3%B6zlettel,%0A%0A%5BNeved%5D&tf=cm";

const socials = [
    { href: "https://github.com/CsikSzabi04", label: "GitHub", icon: FaGithub },
    { href: "https://www.linkedin.com/in/szabolcs-cs%C3%ADk-a4b767315/", label: "LinkedIn", icon: FaLinkedin },
    { href: "https://www.instagram.com/cs_szabj04/", label: "Instagram", icon: FaSquareInstagram },
    { href: MAIL_URL, label: "Email", labelKey: "footer.email", icon: SiGmail },
];

const linkClass = "text-sm text-[#a1a6b3] hover:text-white transition-colors";

function Column({ title, children }) {
    return (
        <div>
            <h4 className="gh-eyebrow mb-4">{title}</h4>
            <ul className="space-y-2.5">{children}</ul>
        </div>
    );
}

export default function Footer() {
    const { t } = useT();
    return (
        <footer>
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-10 sm:py-12">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-10 lg:gap-10">
                    <div className="col-span-2 md:col-span-3 lg:col-span-2">
                        <Link to="/" className="inline-flex items-center gap-2 mb-3">
                            <CgGames className="text-2xl text-[#8b5cf6]" />
                            <span className="gh-logo text-lg font-extrabold tracking-tight text-white">
                                Game<span className="text-[#8b5cf6]">Data</span>Hub
                            </span>
                        </Link>
                        <p className="text-sm leading-relaxed max-w-sm">
                            {t('footer.tagline')}
                        </p>
                        <div className="flex gap-2 mt-5">
                            {socials.map(({ href, label, labelKey, icon: Icon }) => (
                                <a
                                    key={label}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={labelKey ? t(labelKey) : label}
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.07] text-[#a1a6b3] hover:text-white hover:border-white/[0.16] transition-colors"
                                >
                                    <Icon size={16} />
                                </a>
                            ))}
                        </div>
                    </div>

                    <Column title={t('footer.explore')}>
                        <li><Link to="/hub" className={linkClass}>{t('footer.hub')}</Link></li>
                        <li><Link to="/review" className={linkClass}>{t('footer.reviews')}</Link></li>
                        <li><Link to="/contact" className={linkClass}>{t('footer.contact')}</Link></li>
                    </Column>

                    <Column title={t('footer.legal')}>
                        <li><Link to="/terms" className={linkClass}>{t('footer.terms')}</Link></li>
                        <li><Link to="/privacy" className={linkClass}>{t('footer.privacy')}</Link></li>
                        <li><Link to="/cookies" className={linkClass}>{t('footer.cookies')}</Link></li>
                        <li><Link to="/legal-notice" className={linkClass}>{t('footer.legalNotice')}</Link></li>
                        <li><button type="button" onClick={openCookieSettings} className={linkClass}>{t('footer.cookieSettings')}</button></li>
                    </Column>

                    <Column title={t('footer.madeBy')}>
                        <li><a href="https://csszabj.netlify.app/" target="_blank" rel="noopener noreferrer" className={linkClass}>Szabolcs Csík</a></li>
                        <li><span className="text-sm text-[#a1a6b3]">Balog Bence</span></li>
                        <li><span className="text-sm text-[#a1a6b3]">Furdan Milán</span></li>
                    </Column>
                </div>

                <div className="mt-10 sm:mt-12 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row justify-between gap-3 text-xs text-[#6b7080]">
                    <p className="text-[#6b7080] sm:self-center">{t('footer.rights', { year: new Date().getFullYear() })}</p>
                    <LanguageSwitcher className="self-start sm:self-center sm:order-last" />
                    <p className="text-[#6b7080] sm:self-center">{t('footer.dataSources')}</p>
                </div>
            </div>
        </footer>
    );
};
