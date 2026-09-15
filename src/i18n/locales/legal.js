// Terms of Service (rendered by src/legal/LegalDoc.jsx with ns="legal.terms").
// Shared labels (eyebrow, effective date, contents) live in legalCommon.js.
// Strings may contain **bold** and the placeholders {siteName} {operatorName} {address} {email} {website},
// which LegalDoc fills from src/legal/operator.js.
// Each section: { id, title, paragraphs?, list?, table?, after? }. Keep the three languages structurally identical
// (same sections, same number of paragraphs and list items) and the Hungarian text authoritative (section 20).
export default {
    en: {
        terms: {
            title: 'Terms of Service',
            intro: 'These Terms of Service (the **Terms**) govern the use of {siteName} ({website}). Please read them carefully, in particular the provisions highlighted in section 2. The Terms are available on this page at any time, and you can save or print them.',
            sections: [
                {
                    id: 'about',
                    title: '1. About these Terms',
                    paragraphs: [
                        '{siteName} (the **Service**) is a free, community-based website with information about video games. It is operated by **{operatorName}**, a natural person based in Hungary (the **Operator**, "we", "us"). Postal address: {address}. Contact email: {email}',
                        'These Terms are general terms and conditions (standard contract terms) within the meaning of sections 6:77 and 6:78 of the Hungarian Civil Code (Act V of 2013, **Ptk.**). They form the contract between you (the **User**, "you") and the Operator for the use of the Service. The Service is an information society service under Act CVIII of 2001 on electronic commerce (**Eker. tv.**), and for content posted by users the Operator is a hosting service provider under Regulation (EU) 2022/2065, the Digital Services Act (**DSA**).',
                    ],
                },
                {
                    id: 'key-points',
                    title: '2. Highlighted provisions',
                    paragraphs: [
                        'In accordance with section 6:78 of the Ptk., we draw your particular attention to the following provisions, which may differ from usual contractual practice or from the default rules of law. By creating an account, you accept them:',
                    ],
                    list: [
                        '**Free service, nothing for sale:** the Service costs nothing and shows no advertising, and the Operator does not sell games or any other products (sections 4 and 7).',
                        '**Third-party data:** game data, prices and deals come from third parties and may be wrong or out of date. Purchases are made with the external store, not with the Operator (section 7).',
                        '**Public profile by default:** your profile is public when your account is created. You can make it private at any time in Edit profile (section 6).',
                        '**Licence to your content:** you grant the Operator a free, non-exclusive licence to host and display the content you post (section 9).',
                        '**Moderation and suspension:** we may remove content and restrict or suspend accounts that break these Terms, with a statement of reasons and a right to complain (sections 11 to 14).',
                        '**Limited liability:** the Service is provided "as is", and the Operator’s liability is limited to the extent permitted by law (sections 15 and 16).',
                        '**Changes:** we may amend these Terms with at least 15 days’ notice (section 18).',
                        '**Governing law:** Hungarian law applies, without affecting your mandatory rights as a consumer (section 19).',
                    ],
                },
                {
                    id: 'contract',
                    title: '3. Conclusion of the contract',
                    paragraphs: [
                        'You can browse most of the Service without an account. In that case, the provisions of these Terms that concern the use of the site (in particular sections 7, 8, 10, 15 and 16) apply to your use.',
                        'The contract between you and the Operator is concluded when you complete the sign-up form and your account is created. The contract is concluded by electronic means, for an indefinite period and free of charge. Under section 5 of the Eker. tv. and section 6:82 of the Ptk., we inform you of the following:',
                    ],
                    list: [
                        '**Technical steps:** you enter your email address, a username and a password in the sign-up form and submit it. Your account is then created, and a verification email is sent to you through Firebase (Google).',
                        '**Correcting input errors:** you can check and correct the data in the form before you submit it. After sign-up, you can change your profile details in Edit profile, reset your password, or ask us by email to correct other data.',
                        '**Filing:** the contract is not filed as a separate document and cannot be retrieved later as an individual document. The current version of these Terms is always available on this page ({website}/terms), and you can save or print it.',
                        '**Language:** the contract can be concluded in Hungarian, English or German (on precedence, see section 20).',
                        '**Codes of conduct:** the Operator has not subscribed to any code of conduct.',
                    ],
                },
                {
                    id: 'service',
                    title: '4. The Service',
                    paragraphs: [
                        'The Service helps you discover games and find information about them: a game catalogue and search, store charts, deals, free-game giveaways, news, a release calendar, system requirements, hub pages for individual games, Dead by Daylight data and builds, movies, speedruns and a status page. Signed-in users can also use community and personal features such as reviews, looking-for-group (LFG) posts, a game library, favourites, price alerts, release reminders, follows, a leaderboard and optional push notifications.',
                        'The Service is **free of charge**. It contains no advertising, there are no paid plans, and no goods or paid services are sold through it. You can end the contract at any time without giving reasons (section 14).',
                        'The Service is under continuous development. We may add, change, restrict or remove features, for example when a third-party data source changes or stops working. You are not entitled to any particular feature or level of availability. Where possible, we announce significant changes that affect your account on the site in advance.',
                    ],
                },
                {
                    id: 'age',
                    title: '5. Minimum age',
                    paragraphs: [
                        'You must be at least **16 years old** to create an account. If you are under 16, you may create an account and use the community features only with the consent of your parent or legal guardian, who is also responsible for supervising your use of the Service.',
                        'If we learn that an account was created without the required consent, we may suspend or delete it. Parents and guardians can contact us for this purpose at {email} at any time.',
                    ],
                },
                {
                    id: 'accounts',
                    title: '6. Accounts and security',
                    paragraphs: [
                        'To create an account, you need a valid email address, a username and a password. Sign-in is provided through Firebase Authentication (Google). If you have an account:',
                    ],
                    list: [
                        'provide accurate information and keep your email address up to date, because we may send important notices there;',
                        'your account is personal: do not share, sell or transfer it to anyone else;',
                        'keep your password confidential, and tell us without delay at {email} if you think someone else has access to your account;',
                        'choose a username that does not impersonate anyone, infringe anyone’s rights or break the community rules (section 10);',
                        'only link or import data from gaming accounts that belong to you (for example Steam, Xbox or PlayStation); the terms of those platforms also apply;',
                        'you are responsible for activity in your account, unless it results from unauthorised access that you could not reasonably have prevented.',
                    ],
                    after: [
                        '**Your profile is public by default.** This means that your username, avatar, banner, bio, the game you are currently playing, your platforms, favourite genres, level and XP, streaks, library statistics, badges, social handles and linked gaming accounts can be seen by anyone, and your activity can appear in the public activity feed and on the leaderboard. You can make your profile private at any time in Edit profile; a private profile is not published and no activity is posted. Details are in the Privacy Policy.',
                    ],
                },
                {
                    id: 'third-party',
                    title: '7. Third-party data, prices and external links',
                    paragraphs: [
                        'Most game information on the Service, including prices, deals, giveaways, news, ratings, system requirements and images, comes from third-party sources such as RAWG, CheapShark, FreeToGame, GamerPower, Steam, GOG, Twitch/IGDB, speedrun.com, IsThereAnyDeal, TMDB and OpenCritic. We display this data for information only, and **we do not guarantee that it is accurate, complete or up to date.** In particular, prices, discounts, availability and free-game offers can change at any time and may differ by region.',
                        '**The Operator is not a seller.** The Service does not sell games or game keys. Links to stores are provided for convenience, and any purchase is a contract between you and the store under its own terms. Always check the price and conditions on the store’s own website before you buy.',
                        'Price alerts, release reminders, free-game and other notifications are an additional convenience. They may arrive late or not at all, and prices may have changed by the time you see them. Content stored for offline use by the installable app may be out of date.',
                        'The Service contains links to external websites (stores, publishers, YouTube, Twitch and others). We do not control these websites and are not responsible for their content, availability, data processing or cookies. Their own terms and privacy policies apply when you visit them.',
                        '{siteName} is an independent project and is **not affiliated with, endorsed by or sponsored by** Valve, Epic Games, GOG, Microsoft, Sony, Behaviour Interactive, Twitch, RAWG or any other store, platform or publisher.',
                    ],
                },
                {
                    id: 'intellectual-property',
                    title: '8. Copyright and trademarks',
                    paragraphs: [
                        'The source code, design and original texts of the Service are protected by copyright and belong to the Operator, unless stated otherwise. You may use the Service for personal, non-commercial purposes. You may not copy, republish, sell or otherwise exploit the Service or substantial parts of it without the Operator’s prior written permission, except where the law expressly allows it.',
                        'Game titles, cover art, screenshots, logos and trademarks belong to their respective owners. They are shown on the Service to identify the games and to inform users, and showing them does not mean that the rights holders endorse the Service. Data from third-party sources is subject to the terms of those sources.',
                        'If you believe that content on the Service infringes your copyright or trademark, please report it as described in section 12. We remove or disable access to infringing content without undue delay.',
                    ],
                },
                {
                    id: 'user-content',
                    title: '9. User content and licence',
                    paragraphs: [
                        '**User content** means anything you post or submit on the Service, such as reviews (text, rating, pros and cons), LFG posts and join requests, Dead by Daylight builds, votes and likes, outage reports, your profile texts and images, and reports.',
                        'You are responsible for your user content, and you must hold the rights needed to post it. **You keep ownership of your user content.** By posting it, you grant the Operator a **non-exclusive, free of charge, worldwide licence** to store, reproduce, display and make it available on the Service, and to adapt it technically (for example by resizing images or translating it), to the extent needed to operate the Service. The licence lasts until the content is deleted, except where we must keep it longer to comply with the law or to handle a notice or complaint.',
                        'Some user content is public: reviews (with your username and rating), LFG posts, builds, follows and activity-feed entries can be seen by anyone. LFG join requests, including the contact details you give in them, are visible only to you and the owner of the post. Do not put personal data into public content if you do not want others to see it.',
                        'You can delete your own content where the Service offers this option, or ask us to delete it by writing to {email} at any time. When an account is deleted, its reviews may be anonymised instead of deleted.',
                        'We do not check user content before it is published, and we have no general obligation to monitor it (DSA Art. 8). As a hosting service provider, we are not liable for user content as long as we have no actual knowledge of its illegality and act expeditiously to remove it once we become aware of it (DSA Art. 6). We may, however, review and moderate user content as described in section 11.',
                    ],
                },
                {
                    id: 'conduct',
                    title: '10. Community rules and prohibited conduct',
                    paragraphs: [
                        'You must use the Service lawfully and treat other users with respect. In particular, the following are **not allowed**:',
                    ],
                    list: [
                        'illegal content of any kind, including content that infringes another person’s copyright, trademark or other rights;',
                        'harassment, bullying, threats, hate speech, or incitement to violence or discrimination;',
                        'sharing other people’s personal data without their permission (doxxing);',
                        'any sexual content involving minors, and explicit sexual content in general;',
                        'spam, advertising or commercial promotion, scams, and phishing or malware links;',
                        'cheating tools, hacks, pirated games or links to piracy;',
                        'impersonating other people, brands or the Operator;',
                        'spoilers posted without the spoiler flag;',
                        'manipulating votes, ratings, reviews, the leaderboard or the reporting system, for example with multiple accounts or false reports;',
                        'attacking, overloading or disrupting the Service, circumventing rate limits or security measures, accessing other users’ accounts or data, or collecting data from the Service by automated means (scraping).',
                    ],
                    after: [
                        'Reviews should reflect your own experience with the game. Breaking these rules may lead to the measures described in section 11.',
                    ],
                },
                {
                    id: 'moderation',
                    title: '11. Content moderation',
                    paragraphs: [
                        'We moderate content to keep the Service lawful and in line with these Terms. We act diligently, objectively and proportionately, with due regard to the rights and legitimate interests of everyone involved, including freedom of expression (DSA Art. 14). Moderation works as follows:',
                    ],
                    list: [
                        '**Reports:** signed-in users can report reviews, LFG posts, builds and profiles with the Report button, and anyone can report content by email (section 12).',
                        '**Automated step:** a review is **hidden automatically after 5 user reports** until it has been reviewed. This step is a temporary precaution, not a final decision.',
                        '**Human review:** reported and hidden content is reviewed by the Operator, who decides whether it is illegal or breaks these Terms.',
                        '**Possible measures:** removing or hiding content, restricting access to certain features, and suspending the account temporarily or permanently. The measure depends on how serious the breach is, whether it was repeated, and the intent behind it.',
                        '**Repeat infringers and misuse:** after a prior warning, we suspend accounts that frequently post manifestly illegal content or repeatedly break these rules. We may also, after a warning and for a reasonable period, stop processing reports from anyone who frequently submits manifestly unfounded reports (DSA Art. 23).',
                    ],
                    after: [
                        'If we become aware of information giving rise to a suspicion that a criminal offence threatening the life or safety of a person has taken place or is likely to take place, we inform the competent authorities (DSA Art. 18).',
                        'Every measure comes with a statement of reasons and can be challenged (section 13).',
                    ],
                },
                {
                    id: 'notices',
                    title: '12. Reporting illegal content',
                    paragraphs: [
                        'Anyone can report content they consider illegal, using the **Report** button next to the content or by email to {email} (notice and action mechanism, DSA Art. 16). So that we can handle the notice quickly, it should contain:',
                    ],
                    list: [
                        'a sufficiently substantiated explanation of why you consider the content illegal;',
                        'the exact electronic location of the content, such as its URL;',
                        'your name and email address, except for notices concerning child sexual abuse material;',
                        'a statement that you believe in good faith that the information and allegations in the notice are accurate and complete.',
                    ],
                    after: [
                        'We confirm receipt of your notice by email and later inform you of our decision and of the ways to challenge it. We handle notices in a timely, diligent, non-arbitrary and objective manner, and we tell you if automated means were used in the process.',
                        'Content that is not illegal but breaks these Terms (for example spam or unmarked spoilers) can be reported in the same way.',
                    ],
                },
                {
                    id: 'complaints',
                    title: '13. Statement of reasons, complaints and redress',
                    paragraphs: [
                        'If we remove or restrict your content, restrict your use of features or suspend your account, we inform you by email and give you a clear statement of reasons (DSA Art. 17), unless the law provides otherwise. The statement of reasons includes:',
                    ],
                    list: [
                        'the measure taken and, where relevant, its scope and duration;',
                        'the facts and circumstances on which the decision is based, including whether it was taken in response to a notice;',
                        'whether automated means were used;',
                        'the legal provision or the rule of these Terms concerned, and why the content or conduct is considered to breach it;',
                        'the available means of redress.',
                    ],
                    after: [
                        '**Internal complaints (DSA Art. 20):** you can complain about a moderation decision, or about our decision not to act on your notice, within **6 months** of being informed of it, by replying to our email or by writing to {email} at any time within that period. Complaints are free of charge and are handled by a person, not solely by automated means. If the complaint shows that the decision was unfounded, we reverse it without undue delay. We inform you of the outcome and of your further options.',
                        '**Out-of-court dispute settlement (DSA Art. 21):** you may also turn to an out-of-court dispute settlement body certified under the DSA. The European Commission publishes the list of certified bodies. We engage in good faith with the body you select. Its decisions are not binding, and this option does not affect your right to go to court.',
                        '**Authorities and courts:** you can lodge a complaint about an infringement of the DSA with the Hungarian Digital Services Coordinator, the **Nemzeti Média- és Hírközlési Hatóság (NMHH)** (https://nmhh.hu), or with the Digital Services Coordinator of the EU Member State where you live. You may also bring your case before the competent court at any time.',
                    ],
                },
                {
                    id: 'termination',
                    title: '14. Suspension and termination',
                    paragraphs: [
                        '**You can end the contract at any time** by asking us to delete your account, preferably from the email address linked to your account, at {email} (self-service deletion is not available yet). We delete the account and its personal data within **30 days** of the request. Your public content is deleted or, in the case of reviews, anonymised. Data that we must keep by law is kept only for the period required.',
                        'We may **suspend** your account temporarily or permanently, or restrict certain features, if you seriously or repeatedly breach these Terms or the law, or if this is necessary to protect other users, third parties or the Service. Except in urgent cases or serious breaches, we warn you first. We always tell you the reasons and how to challenge the decision (section 13). A permanent suspension ends the contract, and you may not create a new account to get around it.',
                        'We may discontinue the Service as a whole. In that case, we announce it on the site at least 15 days in advance where possible, and we delete account data in accordance with the Privacy Policy.',
                        'Provisions that by their nature continue to apply after the contract ends (in particular sections 16, 19 and 20) remain in effect.',
                    ],
                },
                {
                    id: 'disclaimer',
                    title: '15. Availability and "as is" disclaimer',
                    paragraphs: [
                        'The Service is provided free of charge, **"as is" and "as available"**. We work to keep it running and correct, but we do not guarantee that it will be available without interruption or errors, that the data shown will be accurate or complete, or that it will be suitable for a particular purpose.',
                        'The Service depends on third-party providers, such as hosting services, Firebase and game data APIs. Maintenance, outages or changes at these providers can make parts of the Service temporarily or permanently unavailable. Please do not rely on the Service as the only copy of information that is important to you, such as your library notes.',
                        'Nothing in this section limits your mandatory rights as a consumer.',
                    ],
                },
                {
                    id: 'liability',
                    title: '16. Limitation of liability',
                    paragraphs: [
                        'Because the Service is free and its data comes largely from third parties, **to the extent permitted by law, the Operator is not liable** for damage arising from:',
                    ],
                    list: [
                        'inaccurate, incomplete or outdated game data, prices, deals or notifications;',
                        'purchases or other dealings with stores or other third parties;',
                        'the content of external websites, and user content posted by others, subject to the DSA rules on hosting services;',
                        'interruptions, errors, data loss or security incidents that the Operator could not reasonably have prevented;',
                        'the loss of user content or account data as a result of a suspension or deletion carried out in accordance with these Terms.',
                    ],
                    after: [
                        '**These limitations do not apply** to liability for damage caused intentionally, by gross negligence or by a criminal offence, or for damage to human life, physical integrity or health, because under section 6:152 of the Ptk. such liability cannot be excluded. Nor do they affect any liability that cannot be limited under mandatory consumer protection law.',
                        'You are liable under the general rules of law for damage you cause to the Operator or to third parties by breaching these Terms or the law, for example by posting infringing content.',
                    ],
                },
                {
                    id: 'privacy',
                    title: '17. Privacy and cookies',
                    paragraphs: [
                        'How personal data is processed in connection with the Service is described in the **Privacy Policy** ({website}/privacy), and how the site uses browser storage (localStorage, IndexedDB and Cache Storage) is described in the **Cookie Policy** ({website}/cookies). These policies are provided under the General Data Protection Regulation (Regulation (EU) 2016/679, GDPR), explain your rights and how to exercise them, and are separate documents from these Terms.',
                        'The Service shows no advertising and uses no analytics or tracking tools. Push notifications are sent only if you enable them, and you can turn them off at any time.',
                    ],
                },
                {
                    id: 'changes',
                    title: '18. Changes to these Terms',
                    paragraphs: [
                        'We may amend these Terms for the following reasons:',
                    ],
                    list: [
                        'changes in the law, or decisions or guidance of courts and authorities;',
                        'new, changed or discontinued features of the Service;',
                        'changes in the services or terms of third-party providers that the Service relies on;',
                        'security reasons or the prevention of misuse;',
                        'correcting errors or making the Terms clearer.',
                    ],
                    after: [
                        'We publish the amended Terms on the site **at least 15 days before they take effect**, and we **clearly highlight the changes** compared with the previous version. For changes that materially affect your rights, we also notify you in the Service or by email. A change may take effect sooner only where the law requires it.',
                        'If you do not agree with the changes, you can end the contract before they take effect by asking us to delete your account (section 14). If you continue to use your account after the effective date, the amended Terms apply to you. The effective date of the current version is shown at the top of this page.',
                    ],
                },
                {
                    id: 'law',
                    title: '19. Governing law and jurisdiction',
                    paragraphs: [
                        'These Terms and any disputes relating to them are governed by **Hungarian law**, in particular the Ptk. and the Eker. tv., together with directly applicable EU law such as the DSA.',
                        'If you are a consumer habitually resident in another EU Member State, this choice of law does not deprive you of the protection of the mandatory provisions of the law of your country of residence, where Article 6 of Regulation (EC) No 593/2008 (Rome I) applies. **Mandatory EU and national consumer protection rules remain unaffected.**',
                        'Disputes are decided by the Hungarian court that has jurisdiction under the general rules of civil procedure. If you are a consumer, you may also bring proceedings in the courts of the EU Member State where you live, and the Operator may bring proceedings against you only there, to the extent provided by Regulation (EU) No 1215/2012 (Brussels I bis).',
                        'Before going to court, please contact us at {email} first, as most issues can be resolved quickly and informally. For disputes about content moderation, the options described in section 13 are also available.',
                    ],
                },
                {
                    id: 'contact',
                    title: '20. Languages, contact and final provisions',
                    paragraphs: [
                        'These Terms are available in Hungarian, English and German. **If the language versions differ, the Hungarian version prevails.**',
                        'If any provision of these Terms is or becomes invalid, the remaining provisions remain in effect. If we do not enforce a provision immediately, this does not mean that we waive our right to do so.',
                        'You can contact the Operator with any question about these Terms, the Service or your account:',
                    ],
                    list: [
                        '**Service provider:** {operatorName}',
                        '**Postal address:** {address}',
                        '**Email:** {email}',
                        '**Website:** {website}',
                    ],
                    after: [
                        'The email address {email} is also the **single point of contact under Articles 11 and 12 of the DSA** for the authorities of the EU Member States, the European Commission, the European Board for Digital Services and users of the Service. You can write to us in Hungarian or English.',
                    ],
                },
            ],
        },
    },
    hu: {
        terms: {
            title: 'Általános Szerződési Feltételek',
            intro: 'A jelen Általános Szerződési Feltételek (a továbbiakban: **ÁSZF**) a(z) {siteName} ({website}) használatának feltételeit szabályozzák. Kérjük, figyelmesen olvassa el, különösen a 2. pontban kiemelt rendelkezéseket. Az ÁSZF ezen az oldalon bármikor elérhető, és Ön azt elmentheti vagy kinyomtathatja.',
            sections: [
                {
                    id: 'about',
                    title: '1. Az ÁSZF tárgya',
                    paragraphs: [
                        'A(z) {siteName} (a továbbiakban: **Szolgáltatás**) ingyenes, közösségi alapú, videojátékokkal kapcsolatos információs weboldal. A Szolgáltatást **{operatorName}**, Magyarországon élő természetes személy (a továbbiakban: **Üzemeltető**, „mi”) üzemelteti. Postai cím: {address}. Kapcsolattartási e-mail-cím: {email}',
                        'Az ÁSZF a Polgári Törvénykönyvről szóló 2013. évi V. törvény (a továbbiakban: **Ptk.**) 6:77. és 6:78. §-a szerinti általános szerződési feltételeket tartalmaz, és az Ön (a továbbiakban: **Felhasználó**) és az Üzemeltető között a Szolgáltatás használatára létrejövő szerződés részét képezi. A Szolgáltatás az elektronikus kereskedelmi szolgáltatások, valamint az információs társadalommal összefüggő szolgáltatások egyes kérdéseiről szóló 2001. évi CVIII. törvény (a továbbiakban: **Eker. tv.**) szerinti információs társadalommal összefüggő szolgáltatás. A felhasználók által közzétett tartalmak tekintetében az Üzemeltető a digitális szolgáltatásokról szóló (EU) 2022/2065 rendelet (a továbbiakban: **DSA**) szerinti tárhelyszolgáltató.',
                    ],
                },
                {
                    id: 'key-points',
                    title: '2. Kiemelt rendelkezések',
                    paragraphs: [
                        'A Ptk. 6:78. §-ának megfelelően külön felhívjuk figyelmét az alábbi rendelkezésekre, amelyek eltérhetnek a szokásos szerződési gyakorlattól vagy a jogszabályok diszpozitív rendelkezéseitől. Fiókja létrehozásával Ön ezeket is elfogadja:',
                    ],
                    list: [
                        '**Ingyenes szolgáltatás, értékesítés nélkül:** a Szolgáltatás díjmentes, nem tartalmaz hirdetést, és az Üzemeltető nem értékesít játékokat vagy más termékeket (4. és 7. pont).',
                        '**Harmadik felektől származó adatok:** a játékadatok, árak és akciók harmadik felektől származnak, ezért hibásak vagy elavultak lehetnek. A vásárlás a külső áruháznál történik, nem az Üzemeltetőnél (7. pont).',
                        '**Alapértelmezetten nyilvános profil:** a fiók létrehozásakor profilja nyilvános. A Profil szerkesztése menüpontban bármikor priváttá teheti (6. pont).',
                        '**Felhasználási engedély a tartalmaira:** Ön ingyenes, nem kizárólagos felhasználási engedélyt ad az Üzemeltetőnek az Ön által közzétett tartalmak tárolására és megjelenítésére (9. pont).',
                        '**Moderálás és felfüggesztés:** az ÁSZF-et sértő tartalmakat eltávolíthatjuk, a fiókokat korlátozhatjuk vagy felfüggeszthetjük, indokolással és panaszjoggal (11–14. pont).',
                        '**Korlátozott felelősség:** a Szolgáltatás „adott állapotában” érhető el, és az Üzemeltető felelőssége a jogszabályok által megengedett mértékben korlátozott (15. és 16. pont).',
                        '**Módosítás:** az ÁSZF-et legalább 15 nappal előre közölt módon módosíthatjuk (18. pont).',
                        '**Irányadó jog:** a magyar jog az irányadó, a fogyasztókat megillető kógens jogok sérelme nélkül (19. pont).',
                    ],
                },
                {
                    id: 'contract',
                    title: '3. A szerződés létrejötte',
                    paragraphs: [
                        'A Szolgáltatás nagy része fiók nélkül is böngészhető. Ebben az esetben az ÁSZF-nek a weboldal használatára vonatkozó rendelkezései (különösen a 7., 8., 10., 15. és 16. pont) irányadók az Ön által folytatott használatra.',
                        'Az Ön és az Üzemeltető közötti szerződés a regisztrációs űrlap kitöltésével és a fiók létrejöttével jön létre. A szerződés elektronikus úton, határozatlan időre és ingyenesen jön létre. Az Eker. tv. 5. §-a és a Ptk. 6:82. §-a alapján az alábbiakról tájékoztatjuk:',
                    ],
                    list: [
                        '**Technikai lépések:** a regisztrációs űrlapon megadja e-mail-címét, felhasználónevét és jelszavát, majd elküldi az űrlapot. Ezt követően létrejön a fiókja, és a Firebase (Google) útján megerősítő e-mailt küldünk Önnek.',
                        '**Az adatbeviteli hibák javítása:** az űrlapon megadott adatokat elküldés előtt ellenőrizheti és javíthatja. Regisztráció után profiladatait a Profil szerkesztése menüpontban módosíthatja, jelszavát visszaállíthatja, más adatok javítását pedig e-mailben kérheti.',
                        '**Iktatás:** a szerződést nem iktatjuk külön dokumentumként, és az utólag önálló dokumentumként nem érhető el. Az ÁSZF hatályos szövege mindig elérhető ezen az oldalon ({website}/terms), és Ön azt elmentheti vagy kinyomtathatja.',
                        '**Nyelv:** a szerződés magyar, angol vagy német nyelven köthető meg (az irányadó nyelvi változatról lásd a 20. pontot).',
                        '**Magatartási kódex:** az Üzemeltető nem vetette alá magát magatartási kódexnek.',
                    ],
                },
                {
                    id: 'service',
                    title: '4. A Szolgáltatás',
                    paragraphs: [
                        'A Szolgáltatás segít játékokat felfedezni és információt találni róluk: játékkatalógus és keresés, áruházi toplisták, akciók, ingyenes játékok, hírek, megjelenési naptár, gépigények, egyes játékok gyűjtőoldalai, Dead by Daylight-adatok és buildek, filmek, speedrunok és állapotoldal. A bejelentkezett Felhasználók közösségi és személyes funkciókat is használhatnak, például értékeléseket, csapattárs-kereső (LFG) bejegyzéseket, játékkönyvtárat, kedvenceket, árfigyelőt, megjelenési emlékeztetőket, követést, ranglistát és opcionális push-értesítéseket.',
                        'A Szolgáltatás **ingyenes**. Nem tartalmaz hirdetést, nincsenek fizetős csomagok, és rajta keresztül nem értékesítünk termékeket vagy fizetős szolgáltatásokat. Ön a szerződést bármikor, indokolás nélkül megszüntetheti (14. pont).',
                        'A Szolgáltatás folyamatos fejlesztés alatt áll. Funkciókat bővíthetünk, módosíthatunk, korlátozhatunk vagy megszüntethetünk, például ha egy harmadik féltől származó adatforrás megváltozik vagy megszűnik. Ön nem jogosult meghatározott funkcióra vagy rendelkezésre állási szintre. A fiókját érintő jelentős változásokat lehetőség szerint előzetesen közzétesszük a weboldalon.',
                    ],
                },
                {
                    id: 'age',
                    title: '5. Korhatár',
                    paragraphs: [
                        'Fiókot a **16. életévét betöltött** személy hozhat létre. Ha Ön 16 évesnél fiatalabb, fiókot létrehozni és a közösségi funkciókat használni kizárólag szülője vagy törvényes képviselője hozzájárulásával jogosult, aki a Szolgáltatás Ön általi használatának felügyeletéért is felel.',
                        'Ha tudomásunkra jut, hogy egy fiókot a szükséges hozzájárulás nélkül hoztak létre, a fiókot felfüggeszthetjük vagy törölhetjük. A szülők és törvényes képviselők ebben az ügyben a(z) {email} címen bármikor felvehetik velünk a kapcsolatot.',
                    ],
                },
                {
                    id: 'accounts',
                    title: '6. Fiók és biztonság',
                    paragraphs: [
                        'Fiók létrehozásához érvényes e-mail-cím, felhasználónév és jelszó szükséges. A bejelentkezést a Firebase Authentication (Google) biztosítja. Ha Önnek fiókja van:',
                    ],
                    list: [
                        'valós adatokat adjon meg, és e-mail-címét tartsa naprakészen, mert oda fontos értesítéseket küldhetünk;',
                        'fiókja személyes: ne ossza meg, ne adja el és ne ruházza át másra;',
                        'jelszavát tartsa titokban, és haladéktalanul értesítsen minket a(z) {email} címen, ha úgy véli, hogy más is hozzáfér a fiókjához;',
                        'olyan felhasználónevet válasszon, amely nem kelti más személy látszatát, nem sérti mások jogait és a közösségi szabályokat (10. pont);',
                        'kizárólag a saját játékplatform-fiókjait (például Steam, Xbox vagy PlayStation) kapcsolja össze vagy importálja; ezekre az adott platform feltételei is vonatkoznak;',
                        'a fiókjával végzett tevékenységért Ön felel, kivéve, ha az olyan jogosulatlan hozzáférés eredménye, amelyet észszerűen nem előzhetett meg.',
                    ],
                    after: [
                        '**Profilja alapértelmezetten nyilvános.** Ez azt jelenti, hogy felhasználóneve, avatarja, borítóképe, bemutatkozása, az éppen játszott játék, platformjai, kedvenc műfajai, szintje és XP-je, sorozatai, könyvtári statisztikái, jelvényei, közösségimédia-elérhetőségei és összekapcsolt játékfiókjai bárki számára láthatók, tevékenysége pedig megjelenhet a nyilvános hírfolyamban és a ranglistán. Profilját a Profil szerkesztése menüpontban bármikor priváttá teheti; a privát profil nem kerül közzétételre, és tevékenység sem jelenik meg róla. A részleteket az Adatkezelési tájékoztató tartalmazza.',
                    ],
                },
                {
                    id: 'third-party',
                    title: '7. Harmadik felektől származó adatok, árak és külső hivatkozások',
                    paragraphs: [
                        'A Szolgáltatásban megjelenő játékinformációk – köztük az árak, akciók, ingyenes játékok, hírek, értékelések, gépigények és képek – többsége harmadik felektől származik, például a RAWG, a CheapShark, a FreeToGame, a GamerPower, a Steam, a GOG, a Twitch/IGDB, a speedrun.com, az IsThereAnyDeal, a TMDB és az OpenCritic szolgáltatásaiból. Ezeket az adatokat kizárólag tájékoztató jelleggel jelenítjük meg, és **nem vállalunk garanciát azok pontosságáért, teljességéért vagy naprakészségéért.** Az árak, kedvezmények, elérhetőségek és ingyenes ajánlatok különösen bármikor változhatnak, és régiónként eltérhetnek.',
                        '**Az Üzemeltető nem eladó.** A Szolgáltatás nem értékesít játékokat vagy játékkulcsokat. Az áruházakra mutató hivatkozások a kényelmet szolgálják; a vásárlás Ön és az adott áruház között, annak feltételei szerint jön létre. Vásárlás előtt mindig ellenőrizze az árat és a feltételeket az áruház saját oldalán.',
                        'Az árfigyelő, a megjelenési emlékeztetők, az ingyenes játékokról és egyéb eseményekről szóló értesítések kiegészítő kényelmi funkciók. Késve vagy egyáltalán nem is érkezhetnek meg, és mire Ön látja őket, az ár már megváltozhatott. A telepíthető alkalmazás által offline használatra tárolt tartalom elavult lehet.',
                        'A Szolgáltatás külső weboldalakra (áruházakra, kiadókra, a YouTube-ra, a Twitchre és másokra) mutató hivatkozásokat tartalmaz. Ezeket a weboldalakat nem mi üzemeltetjük, ezért nem felelünk azok tartalmáért, elérhetőségéért, adatkezeléséért vagy sütijeiért. Meglátogatásukkor azok saját feltételei és adatvédelmi szabályai irányadók.',
                        'A(z) {siteName} független projekt, és **nem áll kapcsolatban** a Valve, az Epic Games, a GOG, a Microsoft, a Sony, a Behaviour Interactive, a Twitch, a RAWG vagy bármely más áruház, platform vagy kiadó egyikével sem, és azok **nem támogatják vagy szponzorálják**.',
                    ],
                },
                {
                    id: 'intellectual-property',
                    title: '8. Szerzői jogok és védjegyek',
                    paragraphs: [
                        'A Szolgáltatás forráskódja, dizájnja és saját szövegei – eltérő jelzés hiányában – szerzői jogi védelem alatt állnak, és az Üzemeltetőt illetik. A Szolgáltatást személyes, nem kereskedelmi célra használhatja. A Szolgáltatást vagy annak jelentős részét az Üzemeltető előzetes írásbeli engedélye nélkül nem másolhatja, nem teheti közzé újra, nem értékesítheti és más módon sem hasznosíthatja, kivéve, ha azt jogszabály kifejezetten megengedi.',
                        'A játékok címei, borítóképei, képernyőképei, logói és védjegyei a jogosultjaik tulajdonát képezik. A Szolgáltatásban a játékok azonosítása és a Felhasználók tájékoztatása céljából jelennek meg, megjelenítésük nem jelenti azt, hogy a jogosultak támogatnák a Szolgáltatást. A harmadik felektől származó adatokra az adott forrás feltételei vonatkoznak.',
                        'Ha úgy véli, hogy a Szolgáltatásban megjelenő tartalom sérti szerzői jogát vagy védjegyét, kérjük, jelentse a 12. pontban leírt módon. A jogsértő tartalmat indokolatlan késedelem nélkül eltávolítjuk, vagy az ahhoz való hozzáférést megszüntetjük.',
                    ],
                },
                {
                    id: 'user-content',
                    title: '9. Felhasználói tartalom és felhasználási engedély',
                    paragraphs: [
                        '**Felhasználói tartalom** minden, amit Ön a Szolgáltatásban közzétesz vagy beküld, például értékelések (szöveg, pontszám, előnyök és hátrányok), LFG-bejegyzések és csatlakozási kérelmek, Dead by Daylight-buildek, szavazatok és kedvelések, hibabejelentések, profilszövegek és -képek, valamint bejelentések.',
                        'Felhasználói tartalmáért Ön felel, és rendelkeznie kell a közzétételhez szükséges jogokkal. **A felhasználói tartalom az Ön tulajdonában marad.** A közzététellel Ön **nem kizárólagos, ingyenes, területi korlátozás nélküli felhasználási engedélyt** ad az Üzemeltetőnek arra, hogy a tartalmat a Szolgáltatás működtetéséhez szükséges mértékben tárolja, többszörözze, megjelenítse, a Szolgáltatásban hozzáférhetővé tegye és technikailag átalakítsa (például képeket átméretezzen vagy szöveget lefordítson). Az engedély a tartalom törléséig tart, kivéve, ha a tartalmat jogszabályi kötelezettség teljesítése vagy bejelentés, illetve panasz kezelése érdekében tovább kell megőriznünk.',
                        'Egyes felhasználói tartalmak nyilvánosak: az értékeléseket (felhasználónevével és pontszámával), az LFG-bejegyzéseket, a buildeket, a követéseket és a hírfolyam bejegyzéseit bárki láthatja. Az LFG-csatlakozási kérelmeket – a bennük megadott elérhetőségekkel együtt – csak Ön és a bejegyzés tulajdonosa látja. Nyilvános tartalomban ne adjon meg olyan személyes adatot, amelyet nem szeretne mások tudomására hozni.',
                        'Saját tartalmait ott, ahol a Szolgáltatás erre lehetőséget ad, maga is törölheti, vagy törlésüket a(z) {email} címen bármikor kérheti. A fiók törlésekor az értékelések törlés helyett anonimizálhatók.',
                        'A felhasználói tartalmakat közzétételük előtt nem ellenőrizzük, és nem terhel bennünket általános nyomonkövetési kötelezettség (DSA 8. cikk). Tárhelyszolgáltatóként nem felelünk a felhasználói tartalmakért mindaddig, amíg jogellenességükről tényleges tudomásunk nincs, és tudomásszerzést követően haladéktalanul intézkedünk eltávolításukról (DSA 6. cikk). A felhasználói tartalmakat ugyanakkor a 11. pontban leírtak szerint ellenőrizhetjük és moderálhatjuk.',
                    ],
                },
                {
                    id: 'conduct',
                    title: '10. Közösségi szabályok és tiltott magatartások',
                    paragraphs: [
                        'A Szolgáltatást jogszerűen és a többi Felhasználót tiszteletben tartva kell használnia. Különösen **tilos**:',
                    ],
                    list: [
                        'bármilyen jogellenes tartalom, ideértve a más személy szerzői jogát, védjegyét vagy egyéb jogát sértő tartalmat;',
                        'a zaklatás, a megfélemlítés, a fenyegetés, a gyűlöletbeszéd, valamint az erőszakra vagy megkülönböztetésre való uszítás;',
                        'mások személyes adatainak engedélyük nélküli közzététele (doxxolás);',
                        'kiskorúakat érintő bármilyen szexuális tartalom, valamint általában a nyíltan szexuális tartalom;',
                        'a kéretlen üzenetek (spam), a hirdetés vagy kereskedelmi célú reklám, a csalás, valamint az adathalász vagy kártevőt terjesztő hivatkozások;',
                        'csalóprogramok, hackek, kalózmásolatok vagy kalózoldalakra mutató hivatkozások;',
                        'más személynek, márkának vagy az Üzemeltetőnek való kiadás;',
                        'spoilerek közzététele a spoiler-jelölés használata nélkül;',
                        'a szavazatok, pontszámok, értékelések, a ranglista vagy a bejelentési rendszer manipulálása, például több fiókkal vagy hamis bejelentésekkel;',
                        'a Szolgáltatás elleni támadás, túlterhelése vagy működésének zavarása, a lekérdezési korlátok vagy biztonsági intézkedések megkerülése, más Felhasználók fiókjaihoz vagy adataihoz való hozzáférés, illetve adatok automatizált eszközökkel történő gyűjtése a Szolgáltatásból (scraping).',
                    ],
                    after: [
                        'Az értékelések a játékkal kapcsolatos saját tapasztalatait tükrözzék. E szabályok megsértése a 11. pontban leírt intézkedéseket vonhatja maga után.',
                    ],
                },
                {
                    id: 'moderation',
                    title: '11. Tartalommoderálás',
                    paragraphs: [
                        'A tartalmakat azért moderáljuk, hogy a Szolgáltatás jogszerű és az ÁSZF-nek megfelelő maradjon. Gondosan, tárgyilagosan és arányosan járunk el, kellő figyelemmel minden érintett jogaira és jogos érdekeire, köztük a véleménynyilvánítás szabadságára (DSA 14. cikk). A moderálás a következőképpen működik:',
                    ],
                    list: [
                        '**Bejelentések:** a bejelentkezett Felhasználók a Jelentés gombbal jelenthetik az értékeléseket, LFG-bejegyzéseket, buildeket és profilokat, e-mailben pedig bárki bejelenthet tartalmat (12. pont).',
                        '**Automatizált lépés:** egy értékelés **5 felhasználói bejelentés után automatikusan elrejtésre kerül** a felülvizsgálatáig. Ez ideiglenes óvintézkedés, nem végleges döntés.',
                        '**Emberi felülvizsgálat:** a bejelentett és elrejtett tartalmakat az Üzemeltető vizsgálja felül, és ő dönt arról, hogy a tartalom jogellenes-e vagy sérti-e az ÁSZF-et.',
                        '**Lehetséges intézkedések:** a tartalom eltávolítása vagy elrejtése, egyes funkciók használatának korlátozása, valamint a fiók ideiglenes vagy végleges felfüggesztése. Az intézkedés a jogsértés súlyától, ismétlődésétől és szándékosságától függ.',
                        '**Ismételt jogsértők és visszaélés:** előzetes figyelmeztetést követően felfüggesztjük azokat a fiókokat, amelyek gyakran tesznek közzé nyilvánvalóan jogellenes tartalmat, vagy ismételten megszegik e szabályokat. Figyelmeztetést követően, észszerű időtartamra felfüggeszthetjük azok bejelentéseinek feldolgozását is, akik gyakran nyújtanak be nyilvánvalóan megalapozatlan bejelentést (DSA 23. cikk).',
                    ],
                    after: [
                        'Ha olyan információ jut tudomásunkra, amely személy életét vagy biztonságát veszélyeztető bűncselekmény elkövetésének vagy várható elkövetésének gyanúját veti fel, értesítjük az illetékes hatóságokat (DSA 18. cikk).',
                        'Minden intézkedésről indokolást adunk, és az intézkedés megtámadható (13. pont).',
                    ],
                },
                {
                    id: 'notices',
                    title: '12. Jogellenes tartalom bejelentése',
                    paragraphs: [
                        'Bárki bejelentheti az általa jogellenesnek tartott tartalmat a tartalom mellett található **Jelentés** gombbal vagy a(z) {email} címre küldött e-mailben (értesítési és cselekvési mechanizmus, DSA 16. cikk). A gyors ügyintézés érdekében a bejelentés tartalmazza:',
                    ],
                    list: [
                        'kellően alátámasztott magyarázatát annak, hogy miért tartja a tartalmat jogellenesnek;',
                        'a tartalom pontos elektronikus helyét, például URL-címét;',
                        'nevét és e-mail-címét, kivéve a gyermekek szexuális bántalmazását ábrázoló anyagokra vonatkozó bejelentéseket;',
                        'nyilatkozatát arról, hogy jóhiszeműen úgy véli, a bejelentésben szereplő információk és állítások pontosak és hiánytalanok.',
                    ],
                    after: [
                        'A bejelentés beérkezését e-mailben visszaigazoljuk, később pedig tájékoztatjuk döntésünkről és a vele szemben igénybe vehető jogorvoslati lehetőségekről. A bejelentéseket időben, gondosan, önkényességtől mentesen és tárgyilagosan kezeljük, és tájékoztatjuk, ha a folyamat során automatizált eszközt használtunk.',
                        'Az olyan tartalom, amely nem jogellenes, de sérti az ÁSZF-et (például spam vagy jelöletlen spoiler), ugyanígy bejelenthető.',
                    ],
                },
                {
                    id: 'complaints',
                    title: '13. Indokolás, panaszkezelés és jogorvoslat',
                    paragraphs: [
                        'Ha tartalmát eltávolítjuk vagy korlátozzuk, egyes funkciók használatát korlátozzuk, vagy fiókját felfüggesztjük, erről e-mailben tájékoztatjuk, és világos indokolást adunk (DSA 17. cikk), kivéve, ha jogszabály eltérően rendelkezik. Az indokolás tartalmazza:',
                    ],
                    list: [
                        'a meghozott intézkedést, valamint adott esetben annak kiterjedését és időtartamát;',
                        'a döntés alapjául szolgáló tényeket és körülményeket, ideértve azt is, hogy a döntés bejelentés alapján született-e;',
                        'azt, hogy használtunk-e automatizált eszközt;',
                        'az érintett jogszabályi rendelkezést vagy ÁSZF-pontot, és annak magyarázatát, hogy a tartalom vagy magatartás miért sérti azt;',
                        'az igénybe vehető jogorvoslati lehetőségeket.',
                    ],
                    after: [
                        '**Belső panaszkezelés (DSA 20. cikk):** a moderálási döntés, illetve az ellen, hogy bejelentése alapján nem intézkedtünk, a döntésről való tájékoztatástól számított **6 hónapon belül** panaszt tehet az e-mailünkre adott válaszban vagy a(z) {email} címre írva. A panasz ingyenes, és azt nem kizárólag automatizált eszközökkel, hanem ember bírálja el. Ha a panasz alapján a döntés megalapozatlannak bizonyul, azt indokolatlan késedelem nélkül visszavonjuk. A panasz eredményéről és a további lehetőségekről tájékoztatjuk.',
                        '**Peren kívüli vitarendezés (DSA 21. cikk):** a DSA alapján tanúsított peren kívüli vitarendezési testülethez is fordulhat. A tanúsított testületek listáját az Európai Bizottság teszi közzé. Az Ön által választott testülettel jóhiszeműen együttműködünk. A testület döntése nem kötelező, és ez a lehetőség nem érinti az Ön bírósághoz fordulási jogát.',
                        '**Hatóság és bíróság:** a DSA megsértésével kapcsolatban panaszt tehet a magyar digitális szolgáltatási koordinátornál, a **Nemzeti Média- és Hírközlési Hatóságnál (NMHH)** (https://nmhh.hu), vagy a lakóhelye szerinti uniós tagállam digitális szolgáltatási koordinátoránál. Ügyével bármikor az illetékes bírósághoz is fordulhat.',
                    ],
                },
                {
                    id: 'termination',
                    title: '14. Felfüggesztés és a szerződés megszűnése',
                    paragraphs: [
                        '**Ön a szerződést bármikor megszüntetheti** azzal, hogy – lehetőleg a fiókjához tartozó e-mail-címről – a(z) {email} címen kéri fiókja törlését (önálló fióktörlési funkció egyelőre nem áll rendelkezésre). A fiókot és a hozzá tartozó személyes adatokat a kérelemtől számított **30 napon belül** töröljük. Nyilvános tartalmait töröljük, értékelései esetében pedig anonimizáljuk. A jogszabály alapján megőrzendő adatokat csak az előírt ideig őrizzük meg.',
                        'Fiókját ideiglenesen vagy véglegesen **felfüggeszthetjük**, illetve egyes funkciók használatát korlátozhatjuk, ha Ön súlyosan vagy ismételten megszegi az ÁSZF-et vagy a jogszabályokat, vagy ha ez más Felhasználók, harmadik személyek vagy a Szolgáltatás védelme érdekében szükséges. Sürgős esetek és súlyos jogsértések kivételével előbb figyelmeztetjük. Az indokokról és a döntés megtámadásának módjáról mindig tájékoztatjuk (13. pont). A végleges felfüggesztés a szerződés megszűnését eredményezi, és annak megkerülésére új fiók nem hozható létre.',
                        'A Szolgáltatás egészét megszüntethetjük. Ebben az esetben ezt lehetőség szerint legalább 15 nappal előre közzétesszük a weboldalon, és a fiókadatokat az Adatkezelési tájékoztatónak megfelelően töröljük.',
                        'Azok a rendelkezések, amelyek természetüknél fogva a szerződés megszűnése után is alkalmazandók (különösen a 16., 19. és 20. pont), hatályban maradnak.',
                    ],
                },
                {
                    id: 'disclaimer',
                    title: '15. Rendelkezésre állás és „adott állapotban” történő nyújtás',
                    paragraphs: [
                        'A Szolgáltatást ingyenesen, **„adott állapotában” és „rendelkezésre állás szerint”** nyújtjuk. Törekszünk a folyamatos és hibátlan működésre, de nem szavatoljuk, hogy a Szolgáltatás megszakítás és hiba nélkül elérhető lesz, hogy a megjelenített adatok pontosak vagy teljesek, vagy hogy a Szolgáltatás egy adott célra alkalmas.',
                        'A Szolgáltatás harmadik fél szolgáltatóktól függ, például tárhelyszolgáltatóktól, a Firebase-től és a játékadat-API-któl. E szolgáltatóknál végzett karbantartás, üzemzavar vagy változás miatt a Szolgáltatás egyes részei ideiglenesen vagy véglegesen elérhetetlenné válhatnak. Kérjük, ne a Szolgáltatásban tárolja az Ön számára fontos információk egyetlen példányát (például könyvtári jegyzeteit).',
                        'E pont egyetlen rendelkezése sem korlátozza az Önt fogyasztóként megillető kógens jogokat.',
                    ],
                },
                {
                    id: 'liability',
                    title: '16. A felelősség korlátozása',
                    paragraphs: [
                        'Mivel a Szolgáltatás ingyenes, és adatai nagyrészt harmadik felektől származnak, **az Üzemeltető a jogszabályok által megengedett mértékben nem felel** az alábbiakból eredő károkért:',
                    ],
                    list: [
                        'pontatlan, hiányos vagy elavult játékadatok, árak, akciók vagy értesítések;',
                        'áruházakkal vagy más harmadik felekkel kötött vásárlások vagy egyéb ügyletek;',
                        'külső weboldalak tartalma, valamint mások által közzétett felhasználói tartalmak, a DSA tárhelyszolgáltatásokra vonatkozó szabályainak megfelelően;',
                        'olyan üzemszünetek, hibák, adatvesztések vagy biztonsági incidensek, amelyeket az Üzemeltető észszerűen nem előzhetett meg;',
                        'felhasználói tartalmak vagy fiókadatok elvesztése az ÁSZF-nek megfelelően végrehajtott felfüggesztés vagy törlés következtében.',
                    ],
                    after: [
                        '**E korlátozások nem vonatkoznak** a szándékosan, súlyosan gondatlanul vagy bűncselekménnyel okozott károkért, valamint az emberi életet, testi épséget vagy egészséget megsértő szerződésszegésért való felelősségre, mivel a Ptk. 6:152. §-a alapján az ilyen felelősség nem zárható ki. Nem érintik továbbá azt a felelősséget sem, amelyet a kógens fogyasztóvédelmi szabályok szerint nem lehet korlátozni.',
                        'Ön a jogszabályok általános szabályai szerint felel azokért a károkért, amelyeket az ÁSZF vagy a jogszabályok megszegésével – például jogsértő tartalom közzétételével – az Üzemeltetőnek vagy harmadik személyeknek okoz.',
                    ],
                },
                {
                    id: 'privacy',
                    title: '17. Adatvédelem és sütik',
                    paragraphs: [
                        'A Szolgáltatással összefüggő személyesadat-kezelést az **Adatkezelési tájékoztató** ({website}/privacy), a böngészőben történő adattárolást (localStorage, IndexedDB és Cache Storage) pedig a **Süti-tájékoztató** ({website}/cookies) ismerteti. E tájékoztatók az általános adatvédelmi rendelet ((EU) 2016/679 rendelet, GDPR) alapján készültek, bemutatják az Ön jogait és azok gyakorlásának módját, és az ÁSZF-től különálló dokumentumok.',
                        'A Szolgáltatás nem jelenít meg hirdetést, és nem használ analitikai vagy nyomkövető eszközöket. Push-értesítést csak akkor küldünk, ha Ön azt engedélyezi, és azt bármikor kikapcsolhatja.',
                    ],
                },
                {
                    id: 'changes',
                    title: '18. Az ÁSZF módosítása',
                    paragraphs: [
                        'Az ÁSZF-et az alábbi okokból módosíthatjuk:',
                    ],
                    list: [
                        'jogszabályváltozás, illetve bírósági vagy hatósági döntés vagy iránymutatás;',
                        'a Szolgáltatás új, módosított vagy megszűnő funkciói;',
                        'a Szolgáltatás által igénybe vett harmadik fél szolgáltatók szolgáltatásainak vagy feltételeinek változása;',
                        'biztonsági okok vagy a visszaélések megelőzése;',
                        'hibák javítása vagy az ÁSZF érthetőbbé tétele.',
                    ],
                    after: [
                        'A módosított ÁSZF-et **legalább 15 nappal a hatálybalépése előtt** közzétesszük a weboldalon, és a korábbi változathoz képest történt **változásokat egyértelműen kiemeljük**. Az Ön jogait lényegesen érintő módosításokról a Szolgáltatásban vagy e-mailben is értesítjük. Módosítás rövidebb határidővel csak akkor léphet hatályba, ha azt jogszabály írja elő.',
                        'Ha nem ért egyet a módosításokkal, a hatálybalépésük előtt fiókja törlésének kérésével megszüntetheti a szerződést (14. pont). Ha a hatálybalépés után is használja fiókját, a módosított ÁSZF vonatkozik Önre. A hatályos változat hatálybalépésének napja az oldal tetején látható.',
                    ],
                },
                {
                    id: 'law',
                    title: '19. Irányadó jog és joghatóság',
                    paragraphs: [
                        'Az ÁSZF-re és az azzal kapcsolatos jogvitákra a **magyar jog**, különösen a Ptk. és az Eker. tv., valamint a közvetlenül alkalmazandó uniós jog, például a DSA az irányadó.',
                        'Ha Ön más uniós tagállamban szokásos tartózkodási hellyel rendelkező fogyasztó, e jogválasztás – amennyiben az 593/2008/EK rendelet (Róma I.) 6. cikke alkalmazandó – nem fosztja meg Önt a szokásos tartózkodási helye szerinti ország jogának kógens rendelkezései által biztosított védelemtől. **Az uniós és a nemzeti kógens fogyasztóvédelmi szabályok érintetlenek maradnak.**',
                        'A jogvitákat a polgári perrendtartás általános szabályai szerint illetékes magyar bíróság bírálja el. Ha Ön fogyasztó, az 1215/2012/EU rendeletben (Brüsszel Ia) meghatározott mértékben a lakóhelye szerinti uniós tagállam bíróságai előtt is eljárást indíthat, az Üzemeltető pedig Ön ellen csak ott indíthat eljárást.',
                        'Mielőtt bírósághoz fordulna, kérjük, először keressen meg minket a(z) {email} címen, mert a legtöbb ügy gyorsan és közvetlenül rendezhető. A tartalommoderálással kapcsolatos vitákban a 13. pontban leírt lehetőségek is rendelkezésére állnak.',
                    ],
                },
                {
                    id: 'contact',
                    title: '20. Nyelvi változatok, kapcsolat és záró rendelkezések',
                    paragraphs: [
                        'Az ÁSZF magyar, angol és német nyelven érhető el. **A nyelvi változatok közötti eltérés esetén a magyar nyelvű változat az irányadó.**',
                        'Ha az ÁSZF valamely rendelkezése érvénytelen, vagy azzá válik, az a többi rendelkezés érvényességét nem érinti. Ha valamely rendelkezést nem érvényesítünk azonnal, az nem jelenti az ahhoz fűződő jogunkról való lemondást.',
                        'Az ÁSZF-fel, a Szolgáltatással vagy fiókjával kapcsolatos kérdéseivel az alábbi elérhetőségeken fordulhat az Üzemeltetőhöz:',
                    ],
                    list: [
                        '**Szolgáltató:** {operatorName}',
                        '**Postai cím:** {address}',
                        '**E-mail:** {email}',
                        '**Weboldal:** {website}',
                    ],
                    after: [
                        'A(z) {email} cím egyben a **DSA 11. és 12. cikke szerinti egyedüli kapcsolattartási pont** az uniós tagállamok hatóságai, az Európai Bizottság, a Digitális Szolgáltatások Európai Testülete és a Szolgáltatás felhasználói számára. Magyar vagy angol nyelven írhat nekünk.',
                    ],
                },
            ],
        },
    },
    de: {
        terms: {
            title: 'Nutzungsbedingungen',
            intro: 'Diese Nutzungsbedingungen (die **Bedingungen**) regeln die Nutzung von {siteName} ({website}). Bitte lesen Sie sie sorgfältig, insbesondere die in Abschnitt 2 hervorgehobenen Bestimmungen. Die Bedingungen sind jederzeit auf dieser Seite abrufbar, und Sie können sie speichern oder ausdrucken.',
            sections: [
                {
                    id: 'about',
                    title: '1. Über diese Bedingungen',
                    paragraphs: [
                        '{siteName} (der **Dienst**) ist eine kostenlose, gemeinschaftsbasierte Website mit Informationen über Videospiele. Betrieben wird der Dienst von **{operatorName}**, einer natürlichen Person mit Sitz in Ungarn (der **Betreiber**, „wir“). Postanschrift: {address}. Kontakt-E-Mail: {email}',
                        'Diese Bedingungen sind Allgemeine Geschäftsbedingungen im Sinne der §§ 6:77 und 6:78 des ungarischen Bürgerlichen Gesetzbuchs (Gesetz V von 2013, **Ptk.**). Sie bilden den Vertrag zwischen Ihnen (dem **Nutzer**, „Sie“) und dem Betreiber über die Nutzung des Dienstes. Der Dienst ist ein Dienst der Informationsgesellschaft im Sinne des ungarischen Gesetzes CVIII von 2001 über den elektronischen Geschäftsverkehr (**Eker. tv.**). Für die von Nutzern veröffentlichten Inhalte ist der Betreiber Hosting-Diensteanbieter im Sinne der Verordnung (EU) 2022/2065 über digitale Dienste (**DSA**).',
                    ],
                },
                {
                    id: 'key-points',
                    title: '2. Hervorgehobene Bestimmungen',
                    paragraphs: [
                        'Gemäß § 6:78 Ptk. weisen wir Sie besonders auf die folgenden Bestimmungen hin, die von der üblichen Vertragspraxis oder von den dispositiven gesetzlichen Regelungen abweichen können. Mit der Erstellung eines Kontos akzeptieren Sie diese:',
                    ],
                    list: [
                        '**Kostenloser Dienst, kein Verkauf:** Der Dienst ist kostenlos und werbefrei, und der Betreiber verkauft weder Spiele noch andere Produkte (Abschnitte 4 und 7).',
                        '**Daten Dritter:** Spieldaten, Preise und Angebote stammen von Dritten und können falsch oder veraltet sein. Käufe erfolgen beim externen Shop, nicht beim Betreiber (Abschnitt 7).',
                        '**Standardmäßig öffentliches Profil:** Ihr Profil ist bei der Kontoerstellung öffentlich. Sie können es jederzeit unter „Profil bearbeiten“ auf privat stellen (Abschnitt 6).',
                        '**Lizenz an Ihren Inhalten:** Sie räumen dem Betreiber eine unentgeltliche, nicht ausschließliche Lizenz zum Speichern und Anzeigen Ihrer veröffentlichten Inhalte ein (Abschnitt 9).',
                        '**Moderation und Sperrung:** Wir können Inhalte entfernen und Konten, die gegen diese Bedingungen verstoßen, einschränken oder sperren, jeweils mit Begründung und Beschwerderecht (Abschnitte 11 bis 14).',
                        '**Beschränkte Haftung:** Der Dienst wird „wie besehen“ bereitgestellt, und die Haftung des Betreibers ist im gesetzlich zulässigen Umfang beschränkt (Abschnitte 15 und 16).',
                        '**Änderungen:** Wir können diese Bedingungen mit einer Ankündigungsfrist von mindestens 15 Tagen ändern (Abschnitt 18).',
                        '**Anwendbares Recht:** Es gilt ungarisches Recht, unbeschadet Ihrer zwingenden Rechte als Verbraucher (Abschnitt 19).',
                    ],
                },
                {
                    id: 'contract',
                    title: '3. Vertragsschluss',
                    paragraphs: [
                        'Den Großteil des Dienstes können Sie ohne Konto nutzen. In diesem Fall gelten für Ihre Nutzung die Bestimmungen dieser Bedingungen, die die Nutzung der Website betreffen (insbesondere die Abschnitte 7, 8, 10, 15 und 16).',
                        'Der Vertrag zwischen Ihnen und dem Betreiber kommt zustande, wenn Sie das Registrierungsformular absenden und Ihr Konto erstellt wird. Der Vertrag wird elektronisch, auf unbestimmte Zeit und unentgeltlich geschlossen. Gemäß § 5 Eker. tv. und § 6:82 Ptk. informieren wir Sie über Folgendes:',
                    ],
                    list: [
                        '**Technische Schritte:** Sie geben im Registrierungsformular Ihre E-Mail-Adresse, einen Benutzernamen und ein Passwort ein und senden das Formular ab. Danach wird Ihr Konto erstellt, und Sie erhalten über Firebase (Google) eine Bestätigungs-E-Mail.',
                        '**Korrektur von Eingabefehlern:** Sie können die Angaben im Formular vor dem Absenden prüfen und korrigieren. Nach der Registrierung können Sie Ihre Profildaten unter „Profil bearbeiten“ ändern, Ihr Passwort zurücksetzen oder die Berichtigung sonstiger Daten per E-Mail verlangen.',
                        '**Speicherung des Vertragstextes:** Der Vertrag wird nicht als gesondertes Dokument gespeichert und ist später nicht als einzelnes Dokument abrufbar. Die aktuelle Fassung dieser Bedingungen ist stets auf dieser Seite ({website}/terms) verfügbar, und Sie können sie speichern oder ausdrucken.',
                        '**Sprache:** Der Vertrag kann auf Ungarisch, Englisch oder Deutsch geschlossen werden (zum Vorrang siehe Abschnitt 20).',
                        '**Verhaltenskodizes:** Der Betreiber hat sich keinem Verhaltenskodex unterworfen.',
                    ],
                },
                {
                    id: 'service',
                    title: '4. Der Dienst',
                    paragraphs: [
                        'Der Dienst hilft Ihnen, Spiele zu entdecken und Informationen über sie zu finden: Spielekatalog und Suche, Shop-Charts, Angebote, Gratisspiele, News, Release-Kalender, Systemanforderungen, Hub-Seiten zu einzelnen Spielen, Dead-by-Daylight-Daten und Builds, Filme, Speedruns und eine Statusseite. Angemeldete Nutzer können außerdem Community- und persönliche Funktionen nutzen, etwa Bewertungen, Mitspielersuche (LFG), eine Spielebibliothek, Favoriten, Preisalarme, Release-Erinnerungen, Folgen, eine Rangliste und optionale Push-Benachrichtigungen.',
                        'Der Dienst ist **kostenlos**. Er enthält keine Werbung, es gibt keine kostenpflichtigen Tarife, und über ihn werden weder Waren noch kostenpflichtige Dienstleistungen verkauft. Sie können den Vertrag jederzeit ohne Angabe von Gründen beenden (Abschnitt 14).',
                        'Der Dienst wird laufend weiterentwickelt. Wir können Funktionen hinzufügen, ändern, einschränken oder entfernen, zum Beispiel wenn sich eine Datenquelle eines Dritten ändert oder eingestellt wird. Sie haben keinen Anspruch auf bestimmte Funktionen oder eine bestimmte Verfügbarkeit. Wesentliche Änderungen, die Ihr Konto betreffen, kündigen wir nach Möglichkeit vorab auf der Website an.',
                    ],
                },
                {
                    id: 'age',
                    title: '5. Mindestalter',
                    paragraphs: [
                        'Um ein Konto zu erstellen, müssen Sie **mindestens 16 Jahre alt** sein. Wenn Sie jünger als 16 Jahre sind, dürfen Sie ein Konto nur mit Zustimmung Ihrer Eltern oder Ihres gesetzlichen Vertreters erstellen und die Community-Funktionen nutzen; diese sind auch für die Aufsicht über Ihre Nutzung des Dienstes verantwortlich.',
                        'Erfahren wir, dass ein Konto ohne die erforderliche Zustimmung erstellt wurde, können wir es sperren oder löschen. Eltern und gesetzliche Vertreter können sich zu diesem Zweck jederzeit unter {email} an uns wenden.',
                    ],
                },
                {
                    id: 'accounts',
                    title: '6. Konto und Sicherheit',
                    paragraphs: [
                        'Für ein Konto benötigen Sie eine gültige E-Mail-Adresse, einen Benutzernamen und ein Passwort. Die Anmeldung erfolgt über Firebase Authentication (Google). Wenn Sie ein Konto haben:',
                    ],
                    list: [
                        'machen Sie wahrheitsgemäße Angaben und halten Sie Ihre E-Mail-Adresse aktuell, da wir Ihnen dorthin wichtige Mitteilungen senden können;',
                        'Ihr Konto ist persönlich: Sie dürfen es nicht teilen, verkaufen oder an andere übertragen;',
                        'halten Sie Ihr Passwort geheim und informieren Sie uns unverzüglich unter {email}, wenn Sie vermuten, dass jemand anderes Zugriff auf Ihr Konto hat;',
                        'wählen Sie einen Benutzernamen, der niemanden nachahmt, keine Rechte Dritter verletzt und nicht gegen die Community-Regeln verstößt (Abschnitt 10);',
                        'verknüpfen oder importieren Sie nur Spielekonten, die Ihnen gehören (zum Beispiel Steam, Xbox oder PlayStation); es gelten zusätzlich die Bedingungen dieser Plattformen;',
                        'Sie sind für Aktivitäten in Ihrem Konto verantwortlich, es sei denn, sie beruhen auf einem unbefugten Zugriff, den Sie vernünftigerweise nicht verhindern konnten.',
                    ],
                    after: [
                        '**Ihr Profil ist standardmäßig öffentlich.** Das bedeutet, dass Ihr Benutzername, Avatar, Banner, Ihre Bio, das Spiel, das Sie gerade spielen, Ihre Plattformen, Lieblingsgenres, Level und XP, Serien, Bibliotheksstatistiken, Abzeichen, Social-Media-Namen und verknüpften Spielekonten für alle sichtbar sind und Ihre Aktivitäten im öffentlichen Aktivitätsfeed und in der Rangliste erscheinen können. Sie können Ihr Profil jederzeit unter „Profil bearbeiten“ auf privat stellen; ein privates Profil wird nicht veröffentlicht, und es werden keine Aktivitäten angezeigt. Einzelheiten finden Sie in der Datenschutzerklärung.',
                    ],
                },
                {
                    id: 'third-party',
                    title: '7. Daten Dritter, Preise und externe Links',
                    paragraphs: [
                        'Die meisten Spielinformationen im Dienst, darunter Preise, Angebote, Gratisspiele, News, Bewertungen, Systemanforderungen und Bilder, stammen aus Quellen Dritter wie RAWG, CheapShark, FreeToGame, GamerPower, Steam, GOG, Twitch/IGDB, speedrun.com, IsThereAnyDeal, TMDB und OpenCritic. Wir zeigen diese Daten nur zu Informationszwecken an und **übernehmen keine Gewähr für ihre Richtigkeit, Vollständigkeit oder Aktualität.** Insbesondere Preise, Rabatte, Verfügbarkeit und Gratisangebote können sich jederzeit ändern und je nach Region abweichen.',
                        '**Der Betreiber ist kein Verkäufer.** Über den Dienst werden keine Spiele oder Spielschlüssel verkauft. Links zu Shops dienen der Bequemlichkeit; ein Kauf ist ein Vertrag zwischen Ihnen und dem Shop zu dessen eigenen Bedingungen. Prüfen Sie Preis und Bedingungen vor dem Kauf stets auf der Website des Shops.',
                        'Preisalarme, Release-Erinnerungen sowie Benachrichtigungen über Gratisspiele und andere Ereignisse sind eine zusätzliche Komfortfunktion. Sie können verspätet oder gar nicht ankommen, und der Preis kann sich geändert haben, bis Sie sie sehen. Inhalte, die die installierbare App für die Offline-Nutzung speichert, können veraltet sein.',
                        'Der Dienst enthält Links zu externen Websites (Shops, Publisher, YouTube, Twitch und andere). Wir haben keinen Einfluss auf diese Websites und sind nicht für deren Inhalte, Verfügbarkeit, Datenverarbeitung oder Cookies verantwortlich. Beim Besuch gelten deren eigene Bedingungen und Datenschutzbestimmungen.',
                        '{siteName} ist ein unabhängiges Projekt und steht **in keiner Verbindung zu** Valve, Epic Games, GOG, Microsoft, Sony, Behaviour Interactive, Twitch, RAWG oder anderen Shops, Plattformen oder Publishern und wird **von diesen weder unterstützt noch gesponsert**.',
                    ],
                },
                {
                    id: 'intellectual-property',
                    title: '8. Urheberrecht und Marken',
                    paragraphs: [
                        'Quellcode, Design und eigene Texte des Dienstes sind urheberrechtlich geschützt und stehen, sofern nicht anders angegeben, dem Betreiber zu. Sie dürfen den Dienst für persönliche, nicht kommerzielle Zwecke nutzen. Ohne vorherige schriftliche Zustimmung des Betreibers dürfen Sie den Dienst oder wesentliche Teile davon nicht kopieren, erneut veröffentlichen, verkaufen oder anderweitig verwerten, soweit das Gesetz dies nicht ausdrücklich erlaubt.',
                        'Spieletitel, Cover, Screenshots, Logos und Marken gehören ihren jeweiligen Inhabern. Sie werden im Dienst zur Identifizierung der Spiele und zur Information der Nutzer angezeigt; ihre Anzeige bedeutet nicht, dass die Rechteinhaber den Dienst unterstützen. Für Daten aus Quellen Dritter gelten die Bedingungen dieser Quellen.',
                        'Wenn Sie der Ansicht sind, dass Inhalte im Dienst Ihr Urheber- oder Markenrecht verletzen, melden Sie diese bitte wie in Abschnitt 12 beschrieben. Rechtsverletzende Inhalte entfernen wir unverzüglich oder sperren den Zugang zu ihnen.',
                    ],
                },
                {
                    id: 'user-content',
                    title: '9. Nutzerinhalte und Lizenz',
                    paragraphs: [
                        '**Nutzerinhalte** sind alle Inhalte, die Sie im Dienst veröffentlichen oder übermitteln, etwa Bewertungen (Text, Wertung, Vor- und Nachteile), LFG-Beiträge und Beitrittsanfragen, Dead-by-Daylight-Builds, Stimmen und Likes, Störungsmeldungen, Ihre Profiltexte und -bilder sowie Meldungen.',
                        'Sie sind für Ihre Nutzerinhalte verantwortlich und müssen die für die Veröffentlichung erforderlichen Rechte besitzen. **Ihre Nutzerinhalte bleiben Ihr Eigentum.** Mit der Veröffentlichung räumen Sie dem Betreiber eine **nicht ausschließliche, unentgeltliche, weltweite Lizenz** ein, die Inhalte im für den Betrieb des Dienstes erforderlichen Umfang zu speichern, zu vervielfältigen, anzuzeigen, im Dienst zugänglich zu machen und technisch anzupassen (zum Beispiel Bilder zu verkleinern oder Texte zu übersetzen). Die Lizenz gilt bis zur Löschung der Inhalte, außer soweit wir sie zur Erfüllung gesetzlicher Pflichten oder zur Bearbeitung einer Meldung oder Beschwerde länger aufbewahren müssen.',
                        'Manche Nutzerinhalte sind öffentlich: Bewertungen (mit Ihrem Benutzernamen und Ihrer Wertung), LFG-Beiträge, Builds, Folgen und Einträge im Aktivitätsfeed sind für alle sichtbar. LFG-Beitrittsanfragen einschließlich der darin angegebenen Kontaktdaten sehen nur Sie und der Ersteller des Beitrags. Geben Sie in öffentlichen Inhalten keine personenbezogenen Daten an, die andere nicht sehen sollen.',
                        'Sie können Ihre eigenen Inhalte löschen, soweit der Dienst dies anbietet, oder die Löschung jederzeit unter {email} verlangen. Wird ein Konto gelöscht, können dessen Bewertungen anonymisiert statt gelöscht werden.',
                        'Wir prüfen Nutzerinhalte nicht vor ihrer Veröffentlichung und sind nicht allgemein zu ihrer Überwachung verpflichtet (Art. 8 DSA). Als Hosting-Diensteanbieter haften wir nicht für Nutzerinhalte, solange wir keine tatsächliche Kenntnis von ihrer Rechtswidrigkeit haben und sie nach Kenntniserlangung zügig entfernen (Art. 6 DSA). Wir können Nutzerinhalte jedoch wie in Abschnitt 11 beschrieben prüfen und moderieren.',
                    ],
                },
                {
                    id: 'conduct',
                    title: '10. Community-Regeln und verbotenes Verhalten',
                    paragraphs: [
                        'Sie müssen den Dienst rechtmäßig und respektvoll gegenüber anderen Nutzern verwenden. Insbesondere ist **Folgendes nicht erlaubt**:',
                    ],
                    list: [
                        'rechtswidrige Inhalte jeder Art, einschließlich Inhalten, die Urheber-, Marken- oder sonstige Rechte anderer verletzen;',
                        'Belästigung, Mobbing, Drohungen, Hassrede sowie Aufstachelung zu Gewalt oder Diskriminierung;',
                        'die Veröffentlichung personenbezogener Daten anderer ohne deren Erlaubnis (Doxxing);',
                        'jegliche sexuelle Inhalte mit Bezug zu Minderjährigen sowie explizite sexuelle Inhalte im Allgemeinen;',
                        'Spam, Werbung oder kommerzielle Promotion, Betrug sowie Phishing- oder Malware-Links;',
                        'Cheat-Tools, Hacks, Raubkopien oder Links zu Piraterie;',
                        'das Ausgeben als andere Personen, Marken oder als der Betreiber;',
                        'Spoiler ohne Verwendung der Spoiler-Markierung;',
                        'die Manipulation von Stimmen, Wertungen, Bewertungen, der Rangliste oder des Meldesystems, zum Beispiel mit mehreren Konten oder falschen Meldungen;',
                        'Angriffe auf den Dienst, seine Überlastung oder Störung, die Umgehung von Anfragelimits oder Sicherheitsmaßnahmen, der Zugriff auf Konten oder Daten anderer Nutzer sowie das automatisierte Auslesen von Daten aus dem Dienst (Scraping).',
                    ],
                    after: [
                        'Bewertungen sollen Ihre eigenen Erfahrungen mit dem Spiel wiedergeben. Verstöße gegen diese Regeln können zu den in Abschnitt 11 beschriebenen Maßnahmen führen.',
                    ],
                },
                {
                    id: 'moderation',
                    title: '11. Moderation von Inhalten',
                    paragraphs: [
                        'Wir moderieren Inhalte, damit der Dienst rechtmäßig bleibt und diesen Bedingungen entspricht. Dabei gehen wir sorgfältig, objektiv und verhältnismäßig vor und berücksichtigen die Rechte und berechtigten Interessen aller Beteiligten, einschließlich der Meinungsfreiheit (Art. 14 DSA). Die Moderation funktioniert wie folgt:',
                    ],
                    list: [
                        '**Meldungen:** Angemeldete Nutzer können Bewertungen, LFG-Beiträge, Builds und Profile über die Schaltfläche „Melden“ melden, und jede Person kann Inhalte per E-Mail melden (Abschnitt 12).',
                        '**Automatisierter Schritt:** Eine Bewertung wird **nach 5 Nutzermeldungen automatisch ausgeblendet**, bis sie geprüft wurde. Dies ist eine vorläufige Vorsichtsmaßnahme und keine endgültige Entscheidung.',
                        '**Menschliche Prüfung:** Gemeldete und ausgeblendete Inhalte prüft der Betreiber, der entscheidet, ob sie rechtswidrig sind oder gegen diese Bedingungen verstoßen.',
                        '**Mögliche Maßnahmen:** Entfernen oder Ausblenden von Inhalten, Einschränkung bestimmter Funktionen sowie vorübergehende oder dauerhafte Sperrung des Kontos. Die Maßnahme richtet sich nach der Schwere des Verstoßes, seiner Wiederholung und der dahinterstehenden Absicht.',
                        '**Wiederholte Verstöße und Missbrauch:** Nach vorheriger Warnung sperren wir Konten, die häufig offensichtlich rechtswidrige Inhalte veröffentlichen oder wiederholt gegen diese Regeln verstoßen. Ebenso können wir nach einer Warnung für einen angemessenen Zeitraum die Bearbeitung von Meldungen von Personen aussetzen, die häufig offensichtlich unbegründete Meldungen einreichen (Art. 23 DSA).',
                    ],
                    after: [
                        'Erhalten wir Kenntnis von Informationen, die den Verdacht begründen, dass eine Straftat, die eine Gefahr für das Leben oder die Sicherheit einer Person darstellt, begangen wurde oder wahrscheinlich begangen wird, informieren wir die zuständigen Behörden (Art. 18 DSA).',
                        'Jede Maßnahme wird begründet und kann angefochten werden (Abschnitt 13).',
                    ],
                },
                {
                    id: 'notices',
                    title: '12. Meldung rechtswidriger Inhalte',
                    paragraphs: [
                        'Jede Person kann Inhalte, die sie für rechtswidrig hält, über die Schaltfläche **„Melden“** neben dem Inhalt oder per E-Mail an {email} melden (Melde- und Abhilfeverfahren, Art. 16 DSA). Damit wir die Meldung zügig bearbeiten können, sollte sie Folgendes enthalten:',
                    ],
                    list: [
                        'eine hinreichend begründete Erläuterung, warum Sie den Inhalt für rechtswidrig halten;',
                        'die genaue elektronische Fundstelle des Inhalts, etwa die URL;',
                        'Ihren Namen und Ihre E-Mail-Adresse, außer bei Meldungen zu Darstellungen sexuellen Missbrauchs von Kindern;',
                        'eine Erklärung, dass Sie in gutem Glauben davon überzeugt sind, dass die Angaben und Behauptungen in der Meldung richtig und vollständig sind.',
                    ],
                    after: [
                        'Wir bestätigen den Eingang Ihrer Meldung per E-Mail und informieren Sie später über unsere Entscheidung und die dagegen bestehenden Rechtsbehelfe. Wir bearbeiten Meldungen zeitnah, sorgfältig, frei von Willkür und objektiv und teilen Ihnen mit, ob dabei automatisierte Mittel eingesetzt wurden.',
                        'Inhalte, die nicht rechtswidrig sind, aber gegen diese Bedingungen verstoßen (zum Beispiel Spam oder nicht markierte Spoiler), können Sie auf dieselbe Weise melden.',
                    ],
                },
                {
                    id: 'complaints',
                    title: '13. Begründung, Beschwerden und Rechtsbehelfe',
                    paragraphs: [
                        'Wenn wir Ihre Inhalte entfernen oder einschränken, Ihre Nutzung von Funktionen einschränken oder Ihr Konto sperren, informieren wir Sie per E-Mail und geben Ihnen eine klare Begründung (Art. 17 DSA), sofern gesetzlich nichts anderes bestimmt ist. Die Begründung enthält:',
                    ],
                    list: [
                        'die ergriffene Maßnahme und gegebenenfalls ihren Umfang und ihre Dauer;',
                        'die Tatsachen und Umstände, auf denen die Entscheidung beruht, einschließlich der Angabe, ob sie aufgrund einer Meldung getroffen wurde;',
                        'die Angabe, ob automatisierte Mittel eingesetzt wurden;',
                        'die betroffene Rechtsvorschrift oder Regel dieser Bedingungen und die Erläuterung, warum der Inhalt oder das Verhalten dagegen verstößt;',
                        'die verfügbaren Rechtsbehelfe.',
                    ],
                    after: [
                        '**Interne Beschwerden (Art. 20 DSA):** Gegen eine Moderationsentscheidung oder gegen unsere Entscheidung, auf Ihre Meldung hin nicht tätig zu werden, können Sie **innerhalb von 6 Monaten** nach der Mitteilung Beschwerde einlegen, indem Sie auf unsere E-Mail antworten oder an {email} schreiben. Beschwerden sind kostenlos und werden von einem Menschen und nicht ausschließlich mit automatisierten Mitteln bearbeitet. Erweist sich die Entscheidung aufgrund der Beschwerde als unbegründet, heben wir sie unverzüglich auf. Über das Ergebnis und Ihre weiteren Möglichkeiten informieren wir Sie.',
                        '**Außergerichtliche Streitbeilegung (Art. 21 DSA):** Sie können sich auch an eine nach dem DSA zertifizierte außergerichtliche Streitbeilegungsstelle wenden. Die Liste der zertifizierten Stellen veröffentlicht die Europäische Kommission. Wir arbeiten mit der von Ihnen gewählten Stelle nach Treu und Glauben zusammen. Ihre Entscheidungen sind nicht bindend, und Ihr Recht, ein Gericht anzurufen, bleibt unberührt.',
                        '**Behörden und Gerichte:** Beschwerden über Verstöße gegen den DSA können Sie beim ungarischen Koordinator für digitale Dienste, der **Nemzeti Média- és Hírközlési Hatóság (NMHH)** (https://nmhh.hu), oder beim Koordinator für digitale Dienste des EU-Mitgliedstaats, in dem Sie wohnen, einreichen. Sie können sich außerdem jederzeit an das zuständige Gericht wenden.',
                    ],
                },
                {
                    id: 'termination',
                    title: '14. Sperrung und Vertragsbeendigung',
                    paragraphs: [
                        '**Sie können den Vertrag jederzeit beenden**, indem Sie die Löschung Ihres Kontos, möglichst von der mit Ihrem Konto verknüpften E-Mail-Adresse aus, unter {email} verlangen (eine Selbstlöschung ist derzeit noch nicht verfügbar). Wir löschen das Konto und die zugehörigen personenbezogenen Daten innerhalb von **30 Tagen** nach Eingang der Anfrage. Ihre öffentlichen Inhalte werden gelöscht oder, bei Bewertungen, anonymisiert. Daten, die wir gesetzlich aufbewahren müssen, bewahren wir nur für die vorgeschriebene Dauer auf.',
                        'Wir können Ihr Konto vorübergehend oder dauerhaft **sperren** oder bestimmte Funktionen einschränken, wenn Sie schwerwiegend oder wiederholt gegen diese Bedingungen oder gegen Gesetze verstoßen oder wenn dies zum Schutz anderer Nutzer, Dritter oder des Dienstes erforderlich ist. Außer in dringenden Fällen oder bei schweren Verstößen warnen wir Sie vorher. Wir teilen Ihnen stets die Gründe und die Möglichkeit der Anfechtung mit (Abschnitt 13). Eine dauerhafte Sperrung beendet den Vertrag, und Sie dürfen sie nicht durch ein neues Konto umgehen.',
                        'Wir können den Dienst insgesamt einstellen. In diesem Fall kündigen wir dies nach Möglichkeit mindestens 15 Tage im Voraus auf der Website an und löschen die Kontodaten gemäß der Datenschutzerklärung.',
                        'Bestimmungen, die ihrer Natur nach über das Vertragsende hinaus gelten (insbesondere die Abschnitte 16, 19 und 20), bleiben in Kraft.',
                    ],
                },
                {
                    id: 'disclaimer',
                    title: '15. Verfügbarkeit und Bereitstellung „wie besehen“',
                    paragraphs: [
                        'Der Dienst wird kostenlos, **„wie besehen“ und „wie verfügbar“** bereitgestellt. Wir bemühen uns um einen störungsfreien und korrekten Betrieb, gewährleisten jedoch nicht, dass der Dienst ohne Unterbrechungen oder Fehler verfügbar ist, dass die angezeigten Daten richtig oder vollständig sind oder dass der Dienst für einen bestimmten Zweck geeignet ist.',
                        'Der Dienst hängt von Drittanbietern ab, etwa Hosting-Diensten, Firebase und Spieldaten-APIs. Wartungen, Ausfälle oder Änderungen bei diesen Anbietern können Teile des Dienstes vorübergehend oder dauerhaft unverfügbar machen. Bitte bewahren Sie für Sie wichtige Informationen, etwa Notizen in Ihrer Bibliothek, nicht ausschließlich im Dienst auf.',
                        'Keine Bestimmung dieses Abschnitts schränkt Ihre zwingenden Rechte als Verbraucher ein.',
                    ],
                },
                {
                    id: 'liability',
                    title: '16. Haftungsbeschränkung',
                    paragraphs: [
                        'Da der Dienst kostenlos ist und seine Daten überwiegend von Dritten stammen, **haftet der Betreiber, soweit gesetzlich zulässig, nicht** für Schäden, die entstehen aus:',
                    ],
                    list: [
                        'unrichtigen, unvollständigen oder veralteten Spieldaten, Preisen, Angeboten oder Benachrichtigungen;',
                        'Käufen oder sonstigen Geschäften mit Shops oder anderen Dritten;',
                        'Inhalten externer Websites sowie von anderen veröffentlichten Nutzerinhalten, nach Maßgabe der DSA-Vorschriften für Hosting-Dienste;',
                        'Unterbrechungen, Fehlern, Datenverlusten oder Sicherheitsvorfällen, die der Betreiber vernünftigerweise nicht verhindern konnte;',
                        'dem Verlust von Nutzerinhalten oder Kontodaten infolge einer gemäß diesen Bedingungen vorgenommenen Sperrung oder Löschung.',
                    ],
                    after: [
                        '**Diese Beschränkungen gelten nicht** für die Haftung für vorsätzlich, grob fahrlässig oder durch eine Straftat verursachte Schäden sowie für Verletzungen des Lebens, des Körpers oder der Gesundheit, da eine solche Haftung nach § 6:152 Ptk. nicht ausgeschlossen werden kann. Ebenso unberührt bleibt jede Haftung, die nach zwingendem Verbraucherschutzrecht nicht beschränkt werden kann.',
                        'Sie haften nach den allgemeinen gesetzlichen Vorschriften für Schäden, die Sie dem Betreiber oder Dritten durch Verstöße gegen diese Bedingungen oder gegen Gesetze zufügen, zum Beispiel durch die Veröffentlichung rechtsverletzender Inhalte.',
                    ],
                },
                {
                    id: 'privacy',
                    title: '17. Datenschutz und Cookies',
                    paragraphs: [
                        'Wie personenbezogene Daten im Zusammenhang mit dem Dienst verarbeitet werden, beschreibt die **Datenschutzerklärung** ({website}/privacy); wie die Website Browser-Speicher (localStorage, IndexedDB und Cache Storage) nutzt, beschreibt die **Cookie-Richtlinie** ({website}/cookies). Diese Dokumente beruhen auf der Datenschutz-Grundverordnung (Verordnung (EU) 2016/679, DSGVO), erläutern Ihre Rechte und deren Ausübung und sind von diesen Bedingungen getrennte Dokumente.',
                        'Der Dienst zeigt keine Werbung und verwendet keine Analyse- oder Tracking-Tools. Push-Benachrichtigungen werden nur gesendet, wenn Sie sie aktivieren, und Sie können sie jederzeit abschalten.',
                    ],
                },
                {
                    id: 'changes',
                    title: '18. Änderungen dieser Bedingungen',
                    paragraphs: [
                        'Wir können diese Bedingungen aus folgenden Gründen ändern:',
                    ],
                    list: [
                        'Änderungen der Rechtslage oder Entscheidungen bzw. Leitlinien von Gerichten und Behörden;',
                        'neue, geänderte oder eingestellte Funktionen des Dienstes;',
                        'Änderungen der Leistungen oder Bedingungen von Drittanbietern, auf die der Dienst angewiesen ist;',
                        'Sicherheitsgründe oder die Verhinderung von Missbrauch;',
                        'die Berichtigung von Fehlern oder die verständlichere Formulierung der Bedingungen.',
                    ],
                    after: [
                        'Wir veröffentlichen die geänderten Bedingungen **mindestens 15 Tage vor ihrem Inkrafttreten** auf der Website und **heben die Änderungen** gegenüber der vorherigen Fassung **deutlich hervor**. Über Änderungen, die Ihre Rechte wesentlich betreffen, informieren wir Sie zusätzlich im Dienst oder per E-Mail. Eine Änderung kann nur dann früher in Kraft treten, wenn das Gesetz dies verlangt.',
                        'Wenn Sie mit den Änderungen nicht einverstanden sind, können Sie den Vertrag vor ihrem Inkrafttreten beenden, indem Sie die Löschung Ihres Kontos verlangen (Abschnitt 14). Nutzen Sie Ihr Konto nach dem Inkrafttreten weiter, gelten für Sie die geänderten Bedingungen. Das Gültigkeitsdatum der aktuellen Fassung ist oben auf dieser Seite angegeben.',
                    ],
                },
                {
                    id: 'law',
                    title: '19. Anwendbares Recht und Gerichtsstand',
                    paragraphs: [
                        'Diese Bedingungen und alle damit zusammenhängenden Streitigkeiten unterliegen **ungarischem Recht**, insbesondere dem Ptk. und dem Eker. tv., sowie dem unmittelbar anwendbaren Unionsrecht wie dem DSA.',
                        'Wenn Sie Verbraucher mit gewöhnlichem Aufenthalt in einem anderen EU-Mitgliedstaat sind, entzieht Ihnen diese Rechtswahl, soweit Art. 6 der Verordnung (EG) Nr. 593/2008 (Rom I) anwendbar ist, nicht den Schutz der zwingenden Bestimmungen des Rechts Ihres Aufenthaltsstaats. **Zwingende unionsrechtliche und nationale Verbraucherschutzvorschriften bleiben unberührt.**',
                        'Über Streitigkeiten entscheidet das nach den allgemeinen Vorschriften des Zivilprozessrechts zuständige ungarische Gericht. Wenn Sie Verbraucher sind, können Sie im Umfang der Verordnung (EU) Nr. 1215/2012 (Brüssel Ia) auch vor den Gerichten des EU-Mitgliedstaats klagen, in dem Sie wohnen, und der Betreiber kann Sie nur dort verklagen.',
                        'Bitte wenden Sie sich vor einer Klage zunächst unter {email} an uns, da sich die meisten Anliegen schnell und unkompliziert klären lassen. Bei Streitigkeiten über die Moderation von Inhalten stehen Ihnen außerdem die in Abschnitt 13 beschriebenen Möglichkeiten offen.',
                    ],
                },
                {
                    id: 'contact',
                    title: '20. Sprachfassungen, Kontakt und Schlussbestimmungen',
                    paragraphs: [
                        'Diese Bedingungen sind auf Ungarisch, Englisch und Deutsch verfügbar. **Bei Abweichungen zwischen den Sprachfassungen ist die ungarische Fassung maßgeblich.**',
                        'Sollte eine Bestimmung dieser Bedingungen unwirksam sein oder werden, bleiben die übrigen Bestimmungen wirksam. Setzen wir eine Bestimmung nicht sofort durch, bedeutet dies keinen Verzicht auf unser Recht dazu.',
                        'Bei Fragen zu diesen Bedingungen, zum Dienst oder zu Ihrem Konto erreichen Sie den Betreiber wie folgt:',
                    ],
                    list: [
                        '**Diensteanbieter:** {operatorName}',
                        '**Postanschrift:** {address}',
                        '**E-Mail:** {email}',
                        '**Website:** {website}',
                    ],
                    after: [
                        'Die E-Mail-Adresse {email} ist zugleich die **zentrale Kontaktstelle nach Art. 11 und 12 DSA** für die Behörden der EU-Mitgliedstaaten, die Europäische Kommission, das Europäische Gremium für digitale Dienste und die Nutzer des Dienstes. Sie können uns auf Ungarisch oder Englisch schreiben.',
                    ],
                },
            ],
        },
    },
};
