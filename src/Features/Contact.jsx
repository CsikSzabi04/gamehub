import '../body.css';
import Footer from '../Footer.jsx';
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { FaSquareInstagram } from "react-icons/fa6";
import { SiGmail } from "react-icons/si";
import { BsArrowUpRight } from "react-icons/bs";
import Header from '../Header.jsx';

const MAIL_URL = "https://mail.google.com/mail/u/0/?fs=1&to=alexszabi04@gmail.com&su=Collaboration+Opportunity+/+Egy%C3%BCttm%C5%B1k%C3%B6d%C3%A9si+Lehet%C5%91s%C3%A9g&body=Dear+Cs%C3%ADk+Szabolcs+Alex,%0A%0AI+would+like+to+discuss+a+collaboration+opportunity+with+you.%0A%0ABest+regards,%0A%0A%5BYour+Name%5D%0A%0A---%0A%0AKedves+Cs%C3%ADk+Szabolcs+Alex,%0A%0ASzeretn%C3%A9k+egy+egy%C3%BCttm%C5%B1k%C3%B6d%C3%A9si+lehet%C5%91s%C3%A9gr%C5%91l+besz%C3%A9lni+veled.%0A%0A%C3%9Cdv%C3%B6zlettel,%0A%0A%5BNeved%5D&tf=cm";

const channels = [
    { href: MAIL_URL, label: "Email", detail: "Collaboration and support requests", icon: SiGmail },
    { href: "https://github.com/CsikSzabi04", label: "GitHub", detail: "Source code and issues", icon: FaGithub },
    { href: "https://www.linkedin.com/in/szabolcs-cs%C3%ADk-a4b767315/", label: "LinkedIn", detail: "Professional contact", icon: FaLinkedin },
    { href: "https://www.instagram.com/cs_szabj04/", label: "Instagram", detail: "Updates and behind the scenes", icon: FaSquareInstagram },
];

export default function Contact() {
    return (
        <>
            <Header />
            <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16 min-h-[60vh]">
                <p className="gh-eyebrow mb-3">Contact</p>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Have a question? Get in touch.</h1>
                <p className="mt-3 text-[#a1a6b3] max-w-xl">
                    Feedback, bug reports or collaboration ideas are all welcome. Pick the channel that suits you best.
                </p>

                <ul className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {channels.map(({ href, label, detail, icon: Icon }) => (
                        <li key={label}>
                            <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group gh-surface flex items-center gap-4 p-4 sm:p-5 hover:border-white/[0.16] transition-colors"
                            >
                                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#1e222c] text-white">
                                    <Icon size={20} />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block text-sm font-semibold text-white">{label}</span>
                                    <span className="block text-sm text-[#8a8f9c] truncate">{detail}</span>
                                </span>
                                <BsArrowUpRight className="flex-shrink-0 text-[#6b7080] group-hover:text-white transition-colors" />
                            </a>
                        </li>
                    ))}
                </ul>
            </main>
            <Footer />
        </>
    )
}
