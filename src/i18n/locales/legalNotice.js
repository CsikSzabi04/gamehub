// Legal notice / Impresszum / Impressum (src/TermsAndPrivacy/LegalNotice.jsx, rendered by src/legal/LegalDoc.jsx)
// Operator details come from src/legal/operator.js through the {placeholders}.
export default {
    en: {
        title: 'Legal notice',
        intro: 'Information about the provider of {siteName} ({website}) under the Hungarian E-commerce Act (Act CVIII of 2001, Section 4) and the EU Digital Services Act (Regulation (EU) 2022/2065).',
        sections: [
            {
                id: 'provider',
                title: '1. Service provider',
                list: [
                    '**Name:** {operatorName}',
                    '**Postal address:** {address}',
                    '**Email:** {email}',
                    '**Website:** {website}',
                    '**Company / sole trader registration number and tax number:** stated here where applicable.',
                ],
                paragraphs: [
                    '{siteName} is a free, non-commercial gaming information and community website. It does not sell goods or services and shows no advertising.',
                ],
            },
            {
                id: 'hosting',
                title: '2. Hosting providers and technical service providers',
                paragraphs: ['The website and its data are hosted by the following providers:'],
                table: {
                    head: ['Provider', 'Service', 'Location', 'Privacy information'],
                    rows: [
                        ['Netlify, Inc.', 'Website hosting', 'USA', 'https://www.netlify.com/privacy/'],
                        ['Render Services, Inc.', 'Backend API server', 'USA', 'https://render.com/privacy'],
                        ['Google Ireland Limited (Firebase)', 'Sign-in and database (Firebase Authentication, Cloud Firestore)', 'EU / USA', 'https://firebase.google.com/support/privacy'],
                    ],
                },
            },
            {
                id: 'contact-point',
                title: '3. Single point of contact (DSA Articles 11 and 12)',
                paragraphs: [
                    'Authorities of the EU Member States, the European Commission, the European Board for Digital Services and users of the service can contact us electronically at **{email}**.',
                    'Communication is possible in **Hungarian or English**.',
                ],
            },
            {
                id: 'report',
                title: '4. Reporting illegal content',
                paragraphs: [
                    'If you find content on {siteName} that you consider illegal (for example a review, LFG post, build, tier list or profile), use the **Report** button next to the content or send a notice to **{email}**. Please include:',
                ],
                list: [
                    'a sufficiently substantiated explanation of why you consider the content illegal;',
                    'the exact web address (URL) of the content;',
                    'your name and email address (not required for notices about child sexual abuse material);',
                    'a statement that you believe in good faith that the information in the notice is accurate and complete.',
                ],
                after: [
                    'We confirm receipt, handle notices without undue delay and inform you of our decision. Details of content moderation, statements of reasons and complaints are in the Terms of Service (/terms).',
                ],
            },
            {
                id: 'copyright',
                title: '5. Copyright and trademarks',
                paragraphs: [
                    'The code, design and texts of {siteName} are protected by copyright and belong to {operatorName}, unless stated otherwise.',
                    'Game titles, logos, cover art, screenshots and other trademarks belong to their respective owners. They are shown only to identify the games and to provide information. {siteName} is **not affiliated with, sponsored or endorsed by** Valve, Epic Games, GOG, Behaviour Interactive, Twitch, RAWG or any other publisher, developer or store mentioned on the site.',
                    '**Rights holders:** if you believe material on the site infringes your rights, write to **{email}** with the URL of the material, proof of your rights and your contact details. We remove infringing material without undue delay.',
                ],
            },
            {
                id: 'sources',
                title: '6. Data sources',
                paragraphs: [
                    'Game information, prices, giveaways, news and statistics come from third-party services, including RAWG, CheapShark, FreeToGame, GamerPower, Steam, GOG, Twitch/IGDB, speedrun.com, IsThereAnyDeal, TMDB and OpenCritic. We do our best to keep them up to date, but **we do not guarantee that they are accurate, complete or current**. Prices and offers are always those shown on the store\'s own website.',
                ],
            },
            {
                id: 'authorities',
                title: '7. Supervisory authorities',
                list: [
                    '**Data protection:** {authorityName}, {authorityAddress}, {authorityEmail}, {authorityUrl}',
                    '**Digital services (Hungarian Digital Services Coordinator):** Nemzeti Média- és Hírközlési Hatóság (NMHH), https://nmhh.hu',
                ],
            },
            {
                id: 'languages',
                title: '8. Language versions and related documents',
                paragraphs: [
                    'This legal notice is available in Hungarian, English and German. In case of any discrepancy, the Hungarian version prevails.',
                    'Related documents: Terms of Service (/terms), Privacy Policy (/privacy), Cookie Policy (/cookies).',
                ],
            },
        ],
    },
    hu: {
        title: 'Impresszum',
        intro: 'A(z) {siteName} ({website}) szolgáltatójának adatai az elektronikus kereskedelmi szolgáltatások, valamint az információs társadalommal összefüggő szolgáltatások egyes kérdéseiről szóló 2001. évi CVIII. törvény 4. §-a és az (EU) 2022/2065 rendelet (digitális szolgáltatásokról szóló rendelet, DSA) alapján.',
        sections: [
            {
                id: 'provider',
                title: '1. A szolgáltató adatai',
                list: [
                    '**Név:** {operatorName}',
                    '**Postai cím:** {address}',
                    '**E-mail:** {email}',
                    '**Weboldal:** {website}',
                    '**Cégjegyzékszám / nyilvántartási szám és adószám:** amennyiben van, itt kerül feltüntetésre.',
                ],
                paragraphs: [
                    'A(z) {siteName} ingyenes, nem kereskedelmi célú játékinformációs és közösségi weboldal. Árut vagy szolgáltatást nem értékesít, és hirdetéseket nem jelenít meg.',
                ],
            },
            {
                id: 'hosting',
                title: '2. Tárhelyszolgáltatók és technikai szolgáltatók',
                paragraphs: ['A weboldalt és az adatokat az alábbi szolgáltatók tárolják:'],
                table: {
                    head: ['Szolgáltató', 'Szolgáltatás', 'Helyszín', 'Adatvédelmi tájékoztató'],
                    rows: [
                        ['Netlify, Inc.', 'A weboldal tárhelye', 'USA', 'https://www.netlify.com/privacy/'],
                        ['Render Services, Inc.', 'Háttérszerver (API)', 'USA', 'https://render.com/privacy'],
                        ['Google Ireland Limited (Firebase)', 'Bejelentkezés és adatbázis (Firebase Authentication, Cloud Firestore)', 'EU / USA', 'https://firebase.google.com/support/privacy'],
                    ],
                },
            },
            {
                id: 'contact-point',
                title: '3. Egyedüli kapcsolattartási pont (DSA 11. és 12. cikk)',
                paragraphs: [
                    'Az uniós tagállamok hatóságai, az Európai Bizottság, a Digitális Szolgáltatások Európai Testülete és a szolgáltatás felhasználói elektronikus úton a **{email}** címen érhetnek el bennünket.',
                    'A kapcsolattartás **magyar vagy angol nyelven** lehetséges.',
                ],
            },
            {
                id: 'report',
                title: '4. Jogellenes tartalom bejelentése',
                paragraphs: [
                    'Ha a(z) {siteName} oldalon olyan tartalmat talál, amelyet jogellenesnek tart (például értékelést, LFG-hirdetést, buildet, tier listát vagy profilt), használja a tartalom melletti **Jelentés** gombot, vagy küldjön bejelentést a **{email}** címre. A bejelentés tartalmazza:',
                ],
                list: [
                    'annak kellően alátámasztott indokolását, hogy miért tartja a tartalmat jogellenesnek;',
                    'a tartalom pontos internetes címét (URL);',
                    'nevét és e-mail-címét (gyermekek szexuális bántalmazását ábrázoló anyag bejelentésekor nem kötelező);',
                    'nyilatkozatát arról, hogy jóhiszeműen úgy véli, a bejelentésben szereplő információk pontosak és hiánytalanok.',
                ],
                after: [
                    'A bejelentés beérkezését visszaigazoljuk, azt indokolatlan késedelem nélkül kivizsgáljuk, és döntésünkről tájékoztatjuk. A tartalommoderálás, az indokolás és a panaszkezelés részletei az Általános Szerződési Feltételekben (/terms) találhatók.',
                ],
            },
            {
                id: 'copyright',
                title: '5. Szerzői jogok és védjegyek',
                paragraphs: [
                    'A(z) {siteName} forráskódja, arculata és szövegei szerzői jogi védelem alatt állnak, és – eltérő jelzés hiányában – {operatorName} tulajdonát képezik.',
                    'A játékok címei, logói, borítóképei, képernyőképei és egyéb védjegyei a jogosultjaik tulajdonát képezik; azokat kizárólag a játékok azonosítása és tájékoztatás céljából jelenítjük meg. A(z) {siteName} **nem áll kapcsolatban** a Valve, az Epic Games, a GOG, a Behaviour Interactive, a Twitch, a RAWG vagy az oldalon említett bármely más kiadóval, fejlesztővel vagy áruházzal, és azok nem támogatják vagy szponzorálják.',
                    '**Jogosultak részére:** ha úgy véli, hogy az oldalon található anyag sérti az Ön jogait, írjon a **{email}** címre, megadva az anyag URL-jét, jogosultsága igazolását és elérhetőségeit. A jogsértő anyagot indokolatlan késedelem nélkül eltávolítjuk.',
                ],
            },
            {
                id: 'sources',
                title: '6. Adatforrások',
                paragraphs: [
                    'A játékinformációk, árak, ajándékjátékok, hírek és statisztikák harmadik felek szolgáltatásaiból származnak, többek között a RAWG, a CheapShark, a FreeToGame, a GamerPower, a Steam, a GOG, a Twitch/IGDB, a speedrun.com, az IsThereAnyDeal, a TMDB és az OpenCritic szolgáltatásaiból. Igyekszünk naprakészen tartani őket, de **nem vállalunk felelősséget azok pontosságáért, teljességéért és időszerűségéért**. Az árak és ajánlatok tekintetében mindig az adott áruház saját weboldalán feltüntetett adatok az irányadók.',
                ],
            },
            {
                id: 'authorities',
                title: '7. Felügyeleti hatóságok',
                list: [
                    '**Adatvédelem:** {authorityName}, {authorityAddress}, {authorityEmail}, {authorityUrl}',
                    '**Digitális szolgáltatások (magyar digitális szolgáltatási koordinátor):** Nemzeti Média- és Hírközlési Hatóság (NMHH), https://nmhh.hu',
                ],
            },
            {
                id: 'languages',
                title: '8. Nyelvi változatok és kapcsolódó dokumentumok',
                paragraphs: [
                    'Az impresszum magyar, angol és német nyelven érhető el. Eltérés esetén a magyar nyelvű változat az irányadó.',
                    'Kapcsolódó dokumentumok: Általános Szerződési Feltételek (/terms), Adatkezelési tájékoztató (/privacy), Süti tájékoztató (/cookies).',
                ],
            },
        ],
    },
    de: {
        title: 'Impressum',
        intro: 'Angaben zum Anbieter von {siteName} ({website}) gemäß § 4 des ungarischen Gesetzes über den elektronischen Geschäftsverkehr (Gesetz CVIII von 2001) und dem EU-Gesetz über digitale Dienste (Verordnung (EU) 2022/2065, DSA).',
        sections: [
            {
                id: 'provider',
                title: '1. Diensteanbieter',
                list: [
                    '**Name:** {operatorName}',
                    '**Postanschrift:** {address}',
                    '**E-Mail:** {email}',
                    '**Website:** {website}',
                    '**Handelsregister- bzw. Registernummer und Steuernummer:** werden hier angegeben, sofern vorhanden.',
                ],
                paragraphs: [
                    '{siteName} ist eine kostenlose, nicht kommerzielle Informations- und Community-Website rund um Videospiele. Es werden weder Waren noch Dienstleistungen verkauft, und es wird keine Werbung angezeigt.',
                ],
            },
            {
                id: 'hosting',
                title: '2. Hosting- und technische Dienstleister',
                paragraphs: ['Die Website und ihre Daten werden von folgenden Anbietern gehostet:'],
                table: {
                    head: ['Anbieter', 'Leistung', 'Standort', 'Datenschutzhinweise'],
                    rows: [
                        ['Netlify, Inc.', 'Hosting der Website', 'USA', 'https://www.netlify.com/privacy/'],
                        ['Render Services, Inc.', 'Backend-API-Server', 'USA', 'https://render.com/privacy'],
                        ['Google Ireland Limited (Firebase)', 'Anmeldung und Datenbank (Firebase Authentication, Cloud Firestore)', 'EU / USA', 'https://firebase.google.com/support/privacy'],
                    ],
                },
            },
            {
                id: 'contact-point',
                title: '3. Zentrale Kontaktstelle (Art. 11 und 12 DSA)',
                paragraphs: [
                    'Behörden der EU-Mitgliedstaaten, die Europäische Kommission, das Europäische Gremium für digitale Dienste sowie die Nutzer des Dienstes erreichen uns elektronisch unter **{email}**.',
                    'Die Kommunikation ist auf **Ungarisch oder Englisch** möglich.',
                ],
            },
            {
                id: 'report',
                title: '4. Meldung rechtswidriger Inhalte',
                paragraphs: [
                    'Wenn Sie auf {siteName} Inhalte finden, die Sie für rechtswidrig halten (z. B. eine Bewertung, einen LFG-Beitrag, einen Build, eine Tierliste oder ein Profil), nutzen Sie die Schaltfläche **Melden** neben dem Inhalt oder senden Sie eine Meldung an **{email}**. Bitte geben Sie an:',
                ],
                list: [
                    'eine hinreichend begründete Erklärung, warum Sie den Inhalt für rechtswidrig halten;',
                    'die genaue Internetadresse (URL) des Inhalts;',
                    'Ihren Namen und Ihre E-Mail-Adresse (nicht erforderlich bei Meldungen von Darstellungen sexuellen Missbrauchs von Kindern);',
                    'eine Erklärung, dass Sie in gutem Glauben davon überzeugt sind, dass die Angaben in der Meldung richtig und vollständig sind.',
                ],
                after: [
                    'Wir bestätigen den Eingang, bearbeiten Meldungen unverzüglich und teilen Ihnen unsere Entscheidung mit. Einzelheiten zur Inhaltsmoderation, zu Begründungen und Beschwerden finden Sie in den Nutzungsbedingungen (/terms).',
                ],
            },
            {
                id: 'copyright',
                title: '5. Urheberrecht und Marken',
                paragraphs: [
                    'Quellcode, Gestaltung und Texte von {siteName} sind urheberrechtlich geschützt und gehören, soweit nicht anders angegeben, {operatorName}.',
                    'Spieletitel, Logos, Cover, Screenshots und andere Marken gehören ihren jeweiligen Inhabern. Sie werden ausschließlich zur Identifizierung der Spiele und zu Informationszwecken angezeigt. {siteName} steht **in keiner Verbindung zu** Valve, Epic Games, GOG, Behaviour Interactive, Twitch, RAWG oder anderen auf der Website genannten Publishern, Entwicklern oder Shops und wird von diesen weder gesponsert noch unterstützt.',
                    '**Für Rechteinhaber:** Wenn Sie der Ansicht sind, dass Material auf der Website Ihre Rechte verletzt, schreiben Sie an **{email}** und geben Sie die URL des Materials, einen Nachweis Ihrer Rechte und Ihre Kontaktdaten an. Rechtsverletzendes Material entfernen wir unverzüglich.',
                ],
            },
            {
                id: 'sources',
                title: '6. Datenquellen',
                paragraphs: [
                    'Spielinformationen, Preise, Gratisspiele, News und Statistiken stammen von Diensten Dritter, darunter RAWG, CheapShark, FreeToGame, GamerPower, Steam, GOG, Twitch/IGDB, speedrun.com, IsThereAnyDeal, TMDB und OpenCritic. Wir bemühen uns um Aktualität, **übernehmen jedoch keine Gewähr für Richtigkeit, Vollständigkeit und Aktualität**. Maßgeblich für Preise und Angebote sind stets die Angaben auf der Website des jeweiligen Shops.',
                ],
            },
            {
                id: 'authorities',
                title: '7. Aufsichtsbehörden',
                list: [
                    '**Datenschutz:** {authorityName}, {authorityAddress}, {authorityEmail}, {authorityUrl}',
                    '**Digitale Dienste (ungarischer Koordinator für digitale Dienste):** Nemzeti Média- és Hírközlési Hatóság (NMHH), https://nmhh.hu',
                ],
            },
            {
                id: 'languages',
                title: '8. Sprachfassungen und weitere Dokumente',
                paragraphs: [
                    'Dieses Impressum ist auf Ungarisch, Englisch und Deutsch verfügbar. Bei Abweichungen ist die ungarische Fassung maßgeblich.',
                    'Weitere Dokumente: Nutzungsbedingungen (/terms), Datenschutzerklärung (/privacy), Cookie-Richtlinie (/cookies).',
                ],
            },
        ],
    },
};
