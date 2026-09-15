import { Link } from 'react-router-dom';
import Header from '../Header';
import Footer from '../Footer';
import { useT } from '../i18n/index.jsx';
import { openCookieSettings } from '../consent/consent.js';
import { OPERATOR, AUTHORITY, LEGAL_VERSION } from './operator.js';

/*
 * Shared layout of the legal pages (Terms, Privacy, Cookies, Legal notice).
 *
 * Content comes from a translation namespace: t(`${ns}.title`), t(`${ns}.intro`) (optional string)
 * and t(`${ns}.sections`), an array of
 *   { id?, title, paragraphs?: string[], list?: string[], table?: { head: string[], rows: string[][] }, after?: string[] }
 * Inside strings: **bold**, and placeholders filled from operator.js:
 *   {siteName} {website} {operatorName} {address} {email} {authorityName} {authorityAddress} {authorityEmail} {authorityUrl}
 * [[cookieSettings]] renders a button that re-opens the cookie settings.
 */

const LEGAL_PATHS = ['/terms', '/privacy', '/cookies', '/legal-notice'];

function placeholders(t) {
    const missing = label => `⚠ ${t('legalCommon.toComplete', { field: label })}`;
    return {
        siteName: OPERATOR.siteName,
        website: OPERATOR.website,
        operatorName: OPERATOR.name || missing(t('legalCommon.fields.name')),
        address: OPERATOR.address || missing(t('legalCommon.fields.address')),
        email: OPERATOR.email,
        authorityName: AUTHORITY.name,
        authorityAddress: AUTHORITY.address,
        authorityEmail: AUTHORITY.email,
        authorityUrl: AUTHORITY.url,
    };
}

function fill(text, values) {
    return String(text).replace(/\{(\w+)\}/g, (match, key) => (values[key] !== undefined ? values[key] : match));
}

function Rich({ text, values, t }) {
    const parts = fill(text, values).split(/(\*\*.+?\*\*|\[\[cookieSettings\]\]|https?:\/\/[^\s)]+|[\w.+-]+@[\w-]+\.[\w.]*\w|\/(?:terms|privacy|cookies|legal-notice)\b)/g);
    return parts.map((part, i) => {
        if (!part) return null;
        if (LEGAL_PATHS.includes(part)) return <Link key={i} to={part}>{part}</Link>;
        if (part.startsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
        if (part === '[[cookieSettings]]') {
            return <button key={i} type="button" onClick={openCookieSettings} className="underline text-[#c4b5fd] hover:text-white">{t('legalCommon.cookieSettings')}</button>;
        }
        if (/^https?:\/\//.test(part)) return <a key={i} href={part} target="_blank" rel="noopener noreferrer">{part}</a>;
        if (/@/.test(part) && !part.includes(' ')) return <a key={i} href={`mailto:${part}`}>{part}</a>;
        if (part.startsWith('⚠')) return <mark key={i} className="bg-amber-400/15 text-amber-300 px-1 rounded">{part}</mark>;
        return part;
    });
}

export default function LegalDoc({ ns }) {
    const { t, locale } = useT();
    const sections = t(`${ns}.sections`);
    const list = Array.isArray(sections) ? sections : [];
    const intro = t(`${ns}.intro`);
    const values = placeholders(t);
    const effective = new Date(LEGAL_VERSION).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <>
            <Header />
            <main className="gh-doc">
                <div className="gh-doc-header">
                    <p className="gh-eyebrow">{t('legalCommon.eyebrow')}</p>
                    <h1>{t(`${ns}.title`)}</h1>
                    <p>{t('legalCommon.effective', { date: effective })}</p>
                </div>

                {intro && intro !== `${ns}.intro` && <p><Rich text={intro} values={values} t={t} /></p>}

                {list.length > 3 && (
                    <nav aria-label={t('legalCommon.contents')} className="gh-surface p-4 sm:p-5 my-6">
                        <p className="gh-eyebrow mb-2">{t('legalCommon.contents')}</p>
                        <ol className="!list-none !pl-0 grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                            {list.map((section, i) => (
                                <li key={section.id || i}><a href={`#${section.id || `s${i + 1}`}`} className="text-[#a1a6b3] hover:text-white">{section.title}</a></li>
                            ))}
                        </ol>
                    </nav>
                )}

                {list.map((section, i) => (
                    <section key={section.id || i} id={section.id || `s${i + 1}`} className="scroll-mt-24">
                        <h2>{section.title}</h2>
                        {section.paragraphs?.map((p, j) => <p key={`p${j}`}><Rich text={p} values={values} t={t} /></p>)}
                        {section.list && (
                            <ul>
                                {section.list.map((item, j) => <li key={j}><Rich text={item} values={values} t={t} /></li>)}
                            </ul>
                        )}
                        {section.table && (
                            <div className="overflow-x-auto my-4">
                                <table className="w-full text-sm border-collapse">
                                    <thead>
                                        <tr>{section.table.head.map(h => <th key={h} className="text-left font-semibold text-white border-b border-white/10 py-2 pr-4 align-bottom">{h}</th>)}</tr>
                                    </thead>
                                    <tbody>
                                        {section.table.rows.map((row, r) => (
                                            <tr key={r} className="border-b border-white/[0.06] align-top">
                                                {row.map((cell, c) => <td key={c} className="py-2 pr-4 text-[#c9ccd4]"><Rich text={cell} values={values} t={t} /></td>)}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {section.after?.map((p, j) => <p key={`a${j}`}><Rich text={p} values={values} t={t} /></p>)}
                    </section>
                ))}
            </main>
            <Footer />
        </>
    );
}
