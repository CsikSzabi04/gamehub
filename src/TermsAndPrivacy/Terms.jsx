import React from 'react';
import Header from '../Header';
import Footer from '../Footer';
import { useT } from '../i18n/index.jsx';

// Renders **bold** parts of a translated string as <strong>
function rich(text) {
    return String(text).split(/\*\*(.+?)\*\*/g).map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : part));
}

export default function Terms() {
    const { t } = useT();
    const sections = t('legal.terms.sections');

    return (
        <>
            <Header />
            <main className="gh-doc">
                <div className="gh-doc-header">
                    <p className="gh-eyebrow">{t('legal.eyebrow')}</p>
                    <h1>{t('legal.terms.title')}</h1>
                    <p>{t('legal.effective')}</p>
                </div>
                {(Array.isArray(sections) ? sections : []).map((section, index, all) => (
                    <section key={section.title}>
                        <h2>{section.title}</h2>
                        {section.paragraphs?.map((paragraph, i) => <p key={`p${i}`}>{rich(paragraph)}</p>)}
                        {section.list && (
                            <ul>
                                {section.list.map((item, i) => <li key={i}>{rich(item)}</li>)}
                            </ul>
                        )}
                        {section.after?.map((paragraph, i) => <p key={`a${i}`}>{rich(paragraph)}</p>)}
                        {index === all.length - 1 && (
                            <p>
                                <strong>{t('legal.terms.contactName')}</strong> <br />
                                {t('legal.terms.email')} <a href="mailto:helpdesk.gamehub@gmail.com">helpdesk.gamehub@gmail.com</a> <br />
                                {t('legal.terms.website')} <a href="https://gamedatahub.netlify.app/">www.gamedatahub.com</a>
                            </p>
                        )}
                    </section>
                ))}
            </main>
            <Footer />
        </>
    );
};

