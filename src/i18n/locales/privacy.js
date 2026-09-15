// Privacy Policy (GDPR Art. 13, Hungarian Info tv.), rendered by src/legal/LegalDoc.jsx.
// **bold**, placeholders from src/legal/operator.js ({siteName} {website} {operatorName} {address} {email}
// {authorityName} {authorityAddress} {authorityEmail} {authorityUrl}) and [[cookieSettings]] are supported.
// Keep URLs and email placeholders away from a directly following "." or "," (the auto-linker would swallow it).
// All three languages must have the same sections, list items and table rows.
export default {
    en: {
        title: "Privacy Policy",
        intro: "This Privacy Policy explains how **{siteName}** ({website}) processes your personal data, for what purposes, on what legal basis and for how long, and what rights you have. It is provided under Article 13 of the **General Data Protection Regulation** (Regulation (EU) 2016/679, “GDPR”) and the Hungarian **Act CXII of 2011** on informational self-determination and freedom of information (“Info Act”).",
        sections: [
            {
                id: "controller",
                title: "1. Who is responsible for your data",
                paragraphs: [
                    "The controller of your personal data (the “Controller”, “we” or “us”) is the operator of {siteName}, a private individual:",
                ],
                list: [
                    "**Name:** {operatorName}",
                    "**Postal address:** {address}",
                    "**Email (also for data protection requests):** {email}",
                    "**Website:** {website}",
                ],
                after: [
                    "No **data protection officer** has been appointed, because the Controller is not required to appoint one under Article 37 GDPR. Please send any question about your data to the email address above.",
                ],
            },
            {
                id: "summary",
                title: "2. Summary",
                paragraphs: [
                    "{siteName} is a free game information and community site. We only process the data needed to run it:",
                ],
                list: [
                    "**No advertising, no analytics and no tracking pixels.** We do not build marketing profiles, do not send newsletters and do not sell your data.",
                    "You can browse the site **without an account**. An account (email, password and username) is only needed for the personal and community features.",
                    "Your **public profile is visible by default**, and you can switch it to private at any time in Edit profile.",
                    "**Push notifications** are only sent if you turn them on.",
                    "You can request **access to, correction or deletion** of your data by writing to {email} at any time.",
                ],
            },
            {
                id: "processing",
                title: "3. What data we process, why, and on what legal basis",
                paragraphs: [
                    "The table below lists each processing activity. The legal bases refer to Article 6(1) GDPR: **(a)** consent, **(b)** performance of a contract (our Terms of Use, which you accept when you sign up), **(c)** compliance with a legal obligation and **(f)** legitimate interests.",
                ],
                table: {
                    head: ["Activity and purpose", "Personal data", "Legal basis", "Retention", "Source"],
                    rows: [
                        [
                            "**User account:** sign-up, sign-in, email verification and password reset",
                            "Email address, password (handled by Firebase Authentication), username, account identifier",
                            "Art. 6(1)(b)",
                            "Until your account is deleted, then erased within 30 days",
                            "You",
                        ],
                        [
                            "**Profile and personal features:** profile, game library, favourites, price alerts, release reminders, claimed free games, XP, levels, streaks, badges, in-app notifications and settings",
                            "Avatar and banner images, bio, currently played game, social handles (Steam, Discord, Twitch, YouTube), platforms, favourite genres, profile colour, language, notification preferences, PC specifications, library entries (status, rating, note, playtime), XP, level, last active date, active days, badges, alerts, reminders, claimed games, favourites, notifications",
                            "Art. 6(1)(b)",
                            "Until you remove the item or your account is deleted (then within 30 days)",
                            "You; XP, levels, streaks and badges are calculated from your activity",
                        ],
                        [
                            "**Linking gaming accounts:** importing your games from Steam, Xbox or PlayStation at your request",
                            "Steam ID, imported game titles and related library data, achievements and trophies (unlock state, dates, rarity), Steam profile data shown to you (level, badges, friends list, recently played games, wishlist). The Xbox (OpenXBL) key or PlayStation (NPSSO) token is used once for an import; only if you turn on automatic achievement sync is it stored, encrypted (AES-256-GCM), on our server, used solely to refresh your achievements, and deleted when you disconnect the account or it expires",
                            "Art. 6(1)(b)",
                            "Until you remove the link or your account is deleted",
                            "You and the connected platform",
                        ],
                        [
                            "**Public profile and community features:** public profile page, leaderboard, activity feed and follows",
                            "Username, avatar thumbnail, banner, bio, currently played game, platforms, genres, XP and level, streaks, library statistics, badges, social handles, gaming accounts, follows, activity entries",
                            "Art. 6(1)(b); you can switch your profile to private at any time",
                            "Published only while your profile is public; kept until your account is deleted",
                            "You; activity entries are generated from your actions",
                        ],
                        [
                            "**Reviews and other contributions:** reviews, helpful votes, Dead by Daylight builds and likes, tier-list votes, game-fact votes, outage reports",
                            "Review text, star rating, pros and cons, spoiler flag, votes and likes, build content, username and account identifier; the email address stored with a review (never shown publicly)",
                            "Art. 6(1)(b)",
                            "Until you or we delete it, or your account is deleted; reviews may be anonymised instead of deleted",
                            "You",
                        ],
                        [
                            "**Looking for group (LFG):** posts and join requests",
                            "Post content and username; for join requests, your message and the contact details you enter",
                            "Art. 6(1)(b)",
                            "Until you or we delete it, or your account is deleted",
                            "You",
                        ],
                        [
                            "**Push notifications:** price alerts, release reminders, free games and social notifications",
                            "Push subscription endpoint and keys, a device label derived from your browser’s user agent, last-seen time",
                            "Art. 6(1)(a) (consent)",
                            "Until you turn notifications off or the browser reports the subscription as expired",
                            "Your browser",
                        ],
                        [
                            "**Reports and moderation:** handling reports about reviews, LFG posts, builds and profiles, and notices of illegal content",
                            "The reported content and its author, the reason, the reporting account; for notices sent by email, the notifier’s name, email address and message",
                            "Art. 6(1)(f) (a safe community); Art. 6(1)(c) where the Digital Services Act (Regulation (EU) 2022/2065) requires it",
                            "As long as needed to handle the report, plus up to 6 months",
                            "You, other users and notifiers",
                        ],
                        [
                            "**Security and operation:** protection against abuse and attacks, rate limiting, server logs, caching",
                            "IP address and request data (such as time and requested address)",
                            "Art. 6(1)(f)",
                            "Our server keeps IP addresses in memory only for rate limiting and does not store them; hosting providers keep logs according to their own retention (typically up to 30 days). Error reports (error message, technical stack trace, page address, browser type, without IP address or account) are kept for up to 90 days to find and fix bugs",
                            "Your device",
                        ],
                        [
                            "**Loading game data and images:** some data and images are loaded by your browser directly from third parties (RAWG, Steam image servers, TMDB, Fandom/Wikia, the wsrv.nl image proxy)",
                            "IP address and technical request data received by that provider",
                            "Art. 6(1)(f)",
                            "We store nothing; the provider’s own retention applies",
                            "Your device",
                        ],
                        [
                            "**Browser storage:** sign-in session, your storage choice, language, cache and offline use; optional preferences",
                            "Identifiers and settings stored in your browser (see the Cookie Policy)",
                            "Necessary storage: Art. 6(1)(b) and (f); preference storage: Art. 6(1)(a)",
                            "As set out in the Cookie Policy; you can clear it at any time",
                            "Your device",
                        ],
                        [
                            "**Your requests and legal obligations:** answering your messages and data protection requests, responding to authorities, meeting obligations under the Digital Services Act",
                            "Name and email address, the content of your message, the data concerned by the request",
                            "Art. 6(1)(c); for general enquiries Art. 6(1)(f)",
                            "As long as needed to handle the matter and to demonstrate compliance",
                            "You or the authority",
                        ],
                    ],
                },
            },
            {
                id: "public-profile",
                title: "4. Public profile",
                paragraphs: [
                    "Your profile is **public by default**, because sharing your gaming profile with other players is part of the community features described in the Terms of Use. You can switch it to **private** at any time in **Edit profile**. Switching to private is also the simplest way to object to publication.",
                    "While your profile is public, the following information is visible to anyone, including visitors without an account, on your public profile page, on the leaderboard, in the activity feed and in follow lists:",
                ],
                list: [
                    "username, avatar thumbnail, banner and bio",
                    "the game you are currently playing, your platforms and favourite genres",
                    "XP, level, activity streaks, badges and library statistics",
                    "your social handles (Steam, Discord, Twitch, YouTube) and linked gaming accounts",
                    "your activity entries and the users you follow",
                ],
                after: [
                    "**Never public:** your email address, password, PC specifications, library notes, price alerts, release reminders, notification settings and push subscriptions.",
                    "While your profile is private, it is not published and no activity is posted about you. Content you publish in community areas (such as reviews or LFG posts) remains visible as described in section 5.",
                ],
            },
            {
                id: "user-content",
                title: "5. Content you publish",
                paragraphs: [
                    "Content you post in the community features can be seen by other people. Please do not include personal data you do not want to share, especially data about other people.",
                ],
                list: [
                    "**Reviews:** the text, rating, pros and cons and your username are public, and other users can vote reviews helpful. The email address stored with a review is never shown.",
                    "**LFG posts:** public.",
                    "**LFG join requests:** your message and contact details are visible only to you and to the owner of the post.",
                    "**Builds, likes, votes and outage reports:** shared builds are public; likes, tier-list votes, game-fact votes and outage reports are used to show community results.",
                    "**Follows and the activity feed:** public.",
                ],
                after: [
                    "You can delete your content, and we may remove content that breaks the Terms of Use. When your account is deleted, your content is deleted or, in the case of reviews, anonymised so that it can no longer be linked to you.",
                ],
            },
            {
                id: "legitimate-interests",
                title: "6. Legitimate interests (balancing test)",
                paragraphs: [
                    "Where we rely on legitimate interests (Art. 6(1)(f) GDPR), we have weighed our interests against your interests, rights and freedoms:",
                ],
                list: [
                    "**Our interests:** keeping the service secure and available, preventing spam, abuse and attacks, keeping pages fast through caching and directly loaded game images, handling reports so that the community stays safe, and answering general enquiries.",
                    "**Necessity:** these purposes cannot be achieved without technical data such as IP addresses, which every website necessarily receives. We use the minimum: our server holds IP addresses in memory only for rate limiting and does not store them.",
                    "**Impact on you:** low. The data is technical, kept for a short time, not used for profiling or marketing and not combined into user profiles. Users can reasonably expect a website to protect itself and to deal with abuse.",
                    "**Safeguards:** short retention, access limited to the Controller and its processors, no analytics and no advertising.",
                ],
                after: [
                    "We therefore concluded that these interests are not overridden by your interests or fundamental rights. **You have the right to object** to this processing at any time on grounds relating to your particular situation (see section 13).",
                ],
            },
            {
                id: "push-notifications",
                title: "7. Push notifications",
                paragraphs: [
                    "Push notifications are **optional**. They are only activated if you choose to turn them on and allow them in your browser’s permission prompt. The legal basis is your **consent** (Art. 6(1)(a) GDPR).",
                    "We store the subscription endpoint and keys issued by your browser’s push service, a device label derived from your browser’s user agent, and the time the device was last seen. We use them only to send the notifications you selected: price alerts, release reminders, free games and social notifications.",
                    "The messages are delivered by the push service of your browser’s vendor (for example Google Firebase Cloud Messaging for Chrome, Mozilla for Firefox or Apple for Safari).",
                    "**Withdrawing consent:** you can turn notifications off at any time in your notification settings or in your browser’s site settings. We then stop sending notifications and delete the subscription. Withdrawal does not affect the lawfulness of processing carried out before it.",
                ],
            },
            {
                id: "recipients",
                title: "8. Recipients and processors",
                paragraphs: [
                    "We do not sell or rent your personal data. We only share it with the following recipients, to the extent necessary:",
                ],
                list: [
                    "**Netlify, Inc.** (USA): hosts the website and logs requests. Privacy policy: https://www.netlify.com/privacy/",
                    "**Render Services, Inc.** (USA, Oregon region): runs our backend API server and logs requests. Privacy policy: https://render.com/privacy",
                    "**Google Ireland Limited / Google LLC:** Firebase Authentication (sign-in, verification and password-reset emails) and Cloud Firestore (database); data may be processed in the EU and in the USA. Privacy information: https://firebase.google.com/support/privacy",
                    "**Browser push services** (Google Firebase Cloud Messaging, Mozilla autopush, Apple Push Notification service): deliver push messages if you have turned them on.",
                    "**Third-party APIs and image hosts** (for example RAWG, Steam, TMDB, Fandom/Wikia, wsrv.nl): receive your IP address when your browser loads data or images from them directly. They act as independent controllers under their own privacy policies.",
                    "**Other users and the public:** see the public profile information and content described in sections 4 and 5.",
                    "**Authorities and courts:** only where we are legally required to disclose data.",
                ],
                after: [
                    "Netlify, Render and Google act as our **processors** under data processing terms that meet Article 28 GDPR. When you link a gaming account, the identifier or sign-in details needed for the import are used by our server to retrieve your games from that platform.",
                ],
            },
            {
                id: "transfers",
                title: "9. Transfers outside the EU",
                paragraphs: [
                    "Some recipients are located in the **USA** or may access data from there (Netlify, Render, Google and some push services). These transfers are based on the **EU-US Data Privacy Framework** adequacy decision (Art. 45 GDPR) where the recipient is certified under it, and otherwise on the European Commission’s **Standard Contractual Clauses** (Art. 46(2)(c) GDPR).",
                    "You can request a copy of these safeguards by writing to {email} at any time.",
                ],
            },
            {
                id: "automated-decisions",
                title: "10. Automated decisions and moderation",
                paragraphs: [
                    "We do not make decisions based solely on automated processing, including profiling, that produce legal effects concerning you or similarly significantly affect you (Art. 22 GDPR).",
                    "One moderation step is automatic: a **review is hidden automatically once it has received 5 reports** from users, pending review. This is a temporary safety measure, not a final decision. If you wrote the review, you can ask for **human review** at any time by writing to {email} and explaining why it should be restored.",
                    "XP, levels, streaks and badges are calculated automatically from your activity. They only serve the game-like features of the site and have no legal or similarly significant effect.",
                ],
            },
            {
                id: "retention",
                title: "11. How long we keep your data",
                list: [
                    "**Account data:** until your account is deleted, then erased within 30 days.",
                    "**Public content:** until you or we delete it, or your account is deleted; reviews may be anonymised instead of deleted.",
                    "**Push subscriptions:** until you turn notifications off or the browser reports the subscription as expired.",
                    "**Reports:** as long as needed to handle them, plus up to 6 months.",
                    "**Server logs:** according to each hosting provider’s retention, typically up to 30 days.",
                    "**Browser storage:** as set out in the Cookie Policy; you can clear it in your browser at any time.",
                ],
                after: [
                    "If the law requires us to keep certain data for longer (for example because of an ongoing procedure before an authority), we keep it only for that purpose and for the required period.",
                ],
            },
            {
                id: "security",
                title: "12. Security",
                paragraphs: [
                    "We use appropriate technical and organisational measures to protect your data, including:",
                ],
                list: [
                    "encrypted connections (HTTPS) to the website, our server and the database",
                    "sign-in through Firebase Authentication, so your password is never visible to us",
                    "database access rules: your private account data can only be read by you, and only the public profile fields are published",
                    "rate limiting and abuse protection on our server, without storing IP addresses",
                    "Xbox and PlayStation sign-in details are used once for the import and never stored",
                    "data minimisation and access limited to the Controller",
                ],
                after: [
                    "In the event of a personal data breach, we notify the supervisory authority within 72 hours where required and inform you without undue delay if the breach is likely to result in a high risk to your rights (Art. 33-34 GDPR).",
                ],
            },
            {
                id: "your-rights",
                title: "13. Your rights",
                paragraphs: [
                    "Under Articles 15-22 GDPR you have the following rights:",
                ],
                list: [
                    "**Right of access (Art. 15):** to find out whether we process your data and to receive a copy of it, together with the information in this policy.",
                    "**Right to rectification (Art. 16):** to have inaccurate data corrected or incomplete data completed. You can edit most profile data yourself in Edit profile.",
                    "**Right to erasure (Art. 17):** to have your data deleted, for example when it is no longer needed or you withdraw your consent (see section 14 for account deletion).",
                    "**Right to restriction of processing (Art. 18):** for example while the accuracy of your data or your objection is being checked.",
                    "**Notification of recipients (Art. 19):** we inform the recipients of any rectification, erasure or restriction and, if you ask, tell you who they are.",
                    "**Right to data portability (Art. 20):** to receive the data you provided to us and that we process on the basis of consent or contract in a structured, commonly used and machine-readable format, or to have it transmitted to another controller.",
                    "**Right to object (Art. 21):** to object at any time, on grounds relating to your particular situation, to processing based on legitimate interests. We then stop, unless we have compelling legitimate grounds or need the data for legal claims. You can object to the publication of your profile by switching it to private.",
                    "**Automated decisions (Art. 22):** not to be subject to a decision based solely on automated processing that has legal or similarly significant effects (see section 10).",
                    "**Withdrawing consent (Art. 7(3)):** you can withdraw your consent at any time, for example by turning off push notifications or changing your choice in the cookie settings, without affecting the lawfulness of earlier processing.",
                ],
                after: [
                    "**How to exercise your rights:** send an email to {email} (if possible from the email address linked to your account, so that we can identify you). If we have reasonable doubts about your identity, we may ask for additional information.",
                    "We respond **within one month** of receiving your request. Where necessary, taking into account the complexity and number of requests, this period may be extended by **two further months**; we will tell you about the extension and the reasons within the first month. Exercising your rights is free of charge. If a request is manifestly unfounded or excessive, we may charge a reasonable fee or refuse to act on it, and we will explain why.",
                ],
            },
            {
                id: "account-deletion",
                title: "14. Deleting your account",
                paragraphs: [
                    "**Self-service:** signed in, open Profile → Account. **Download my data** gives you a copy of everything we store about you in a machine-readable (JSON) file (Art. 15 and 20 GDPR). **Delete my account** permanently deletes your account and all related data (profile, library, alerts, reviews, posts, follows, synced achievements and stored platform keys) after you confirm your password (Art. 17 GDPR). You can also send either request to {email} from the email address linked to your account.",
                    "We delete your account and personal data **within 30 days**: your sign-in account, profile, public profile, library, alerts, reminders, notifications and push subscriptions. Your reviews are deleted or anonymised, and your other contributions are deleted. Copies in hosting providers’ server logs expire according to their retention. We only keep data where the law requires it.",
                    "In the meantime, you can switch your profile to private, delete individual content and turn off notifications at any time.",
                ],
            },
            {
                id: "complaints",
                title: "15. Complaints and legal remedies",
                paragraphs: [
                    "If you believe that our processing of your data breaches the law, please contact us first at {email} so that we can resolve the issue quickly. Regardless of whether you have contacted us, you can also:",
                ],
                list: [
                    "**lodge a complaint with the Hungarian data protection authority:** {authorityName}, address: {authorityAddress}, email: {authorityEmail}, website: {authorityUrl}",
                    "**lodge a complaint with the supervisory authority** of the EU Member State of your habitual residence, place of work or place of the alleged infringement (Art. 77 GDPR).",
                    "**go to court** (Art. 79 GDPR, Section 23 of the Info Act): in Hungary, the regional court (törvényszék) has jurisdiction, and you may bring the action before the regional court of your place of residence or stay. You can also bring proceedings before the courts of the EU Member State where you habitually reside.",
                ],
            },
            {
                id: "children",
                title: "16. Children",
                paragraphs: [
                    "{siteName} is intended for users aged **16 or over**. A person under 16 may only register with the consent of the holder of parental responsibility (parent or guardian), in accordance with Article 8 GDPR.",
                    "If we become aware that a person under 16 has registered without such consent, we delete the account and its data. Parents or guardians who believe that their child has registered without consent can contact us at {email} at any time.",
                ],
            },
            {
                id: "browser-storage",
                title: "17. Cookies and browser storage",
                paragraphs: [
                    "The site does not set classic cookies. It uses your browser’s local storage, IndexedDB and Cache Storage for strictly necessary functions (sign-in session, remembering your storage choice and language, caching game data, offline use) and, if you allow it, for preferences such as your store price region.",
                    "We do not use analytics or marketing tools. Every stored item is described in our **Cookie Policy** at {website}/cookies and you can change your choice at any time: [[cookieSettings]]",
                    "External sites (such as stores, YouTube or Twitch) only set their own cookies when you follow a link to them.",
                ],
            },
            {
                id: "required-data",
                title: "18. Do you have to provide your data?",
                paragraphs: [
                    "No law requires you to provide personal data, and you can browse {siteName} without an account.",
                    "To create an account, you need to provide an **email address, a password and a username**, because we cannot provide the account under the Terms of Use without them. All other profile information, linking gaming accounts, community contributions and push notifications are voluntary; if you do not provide them, only the related feature is unavailable.",
                ],
            },
            {
                id: "changes",
                title: "19. Changes to this policy",
                paragraphs: [
                    "We update this policy when our processing or the law changes. The current version is always available on this page, with its effective date shown at the top.",
                    "We announce material changes in advance on the site and, where appropriate, by in-app notification or email. If a change requires your consent, we will ask for it again.",
                ],
            },
        ],
    },

    hu: {
        title: "Adatkezelési tájékoztató",
        intro: "Ez a tájékoztató bemutatja, hogy a **{siteName}** ({website}) milyen személyes adatokat, milyen célból, milyen jogalapon és mennyi ideig kezel, valamint hogy Önt milyen jogok illetik meg. A tájékoztató az **általános adatvédelmi rendelet** (az (EU) 2016/679 rendelet, a továbbiakban: „GDPR”) 13. cikke és az **információs önrendelkezési jogról és az információszabadságról szóló 2011. évi CXII. törvény** (a továbbiakban: „Info tv.”) alapján készült.",
        sections: [
            {
                id: "controller",
                title: "1. Az Adatkezelő",
                paragraphs: [
                    "Személyes adatainak kezelője (a továbbiakban: „Adatkezelő”) a {siteName} üzemeltetője, magánszemély:",
                ],
                list: [
                    "**Név:** {operatorName}",
                    "**Postai cím:** {address}",
                    "**E-mail-cím (adatvédelmi kérelmekhez is):** {email}",
                    "**Weboldal:** {website}",
                ],
                after: [
                    "Az Adatkezelő **adatvédelmi tisztviselőt** nem nevezett ki, mivel a GDPR 37. cikke alapján erre nem köteles. Az adatkezeléssel kapcsolatos kérdéseit a fenti e-mail-címre küldheti el.",
                ],
            },
            {
                id: "summary",
                title: "2. Összefoglaló",
                paragraphs: [
                    "A {siteName} ingyenes, játékokkal kapcsolatos információs és közösségi oldal. Csak a működéséhez szükséges adatokat kezeljük:",
                ],
                list: [
                    "**Nincs reklám, nincs webanalitika és nincs követőpixel.** Nem készítünk marketingcélú profilt, nem küldünk hírlevelet, és nem adjuk el az adatait.",
                    "Az oldal **fiók nélkül is böngészhető**. Fiókra (e-mail-cím, jelszó és felhasználónév) csak a személyes és közösségi funkciókhoz van szükség.",
                    "A **nyilvános profil alapértelmezés szerint látható**, de a Profil szerkesztése menüpontban bármikor privátra állítható.",
                    "**Push-értesítést** csak akkor küldünk, ha Ön bekapcsolja.",
                    "Adataihoz való **hozzáférést, azok helyesbítését vagy törlését** bármikor kérheti a {email} címen.",
                ],
            },
            {
                id: "processing",
                title: "3. A kezelt adatok, az adatkezelés célja és jogalapja",
                paragraphs: [
                    "Az alábbi táblázat adatkezelési tevékenységenként foglalja össze az adatkezelést. A jogalapok a GDPR 6. cikk (1) bekezdésére utalnak: **a)** az érintett hozzájárulása, **b)** szerződés teljesítése (a regisztrációkor elfogadott Általános Szerződési Feltételek), **c)** jogi kötelezettség teljesítése, **f)** jogos érdek.",
                ],
                table: {
                    head: ["Adatkezelés és célja", "Kezelt személyes adatok", "Jogalap", "Időtartam", "Az adat forrása"],
                    rows: [
                        [
                            "**Felhasználói fiók:** regisztráció, bejelentkezés, e-mail-cím megerősítése, jelszó-visszaállítás",
                            "E-mail-cím, jelszó (a Firebase Authentication kezeli), felhasználónév, fiókazonosító",
                            "6. cikk (1) b)",
                            "A fiók törléséig, azt követően 30 napon belül töröljük",
                            "Az érintett",
                        ],
                        [
                            "**Profil és személyes funkciók:** profil, játékkönyvtár, kedvencek, árfigyelők, megjelenési emlékeztetők, beváltott ingyenes játékok, XP, szintek, sorozatok, jelvények, alkalmazáson belüli értesítések és beállítások",
                            "Profilkép és borítókép, bemutatkozás, éppen játszott játék, közösségi azonosítók (Steam, Discord, Twitch, YouTube), platformok, kedvenc műfajok, profilszín, nyelv, értesítési beállítások, számítógép-konfiguráció, könyvtárbejegyzések (állapot, értékelés, jegyzet, játékidő), XP, szint, utolsó aktivitás dátuma, aktív napok, jelvények, árfigyelők, emlékeztetők, beváltott játékok, kedvencek, értesítések",
                            "6. cikk (1) b)",
                            "Az adott elem eltávolításáig vagy a fiók törléséig (ekkor 30 napon belül)",
                            "Az érintett; az XP-t, a szinteket, a sorozatokat és a jelvényeket az aktivitása alapján számítjuk",
                        ],
                        [
                            "**Játékfiókok összekapcsolása:** játékai importálása a Steamről, Xboxról vagy PlayStationről az Ön kérésére",
                            "Steam-azonosító, importált játékcímek és a kapcsolódó könyvtáradatok, achievementek és trófeák (megszerzés, dátum, ritkaság), az Önnek megjelenített Steam-profiladatok (szint, jelvények, barátlista, legutóbb játszott játékok, kívánságlista). Az Xbox (OpenXBL) kulcsot vagy PlayStation (NPSSO) tokent egy importáláshoz egyszer használjuk; csak ha bekapcsolja az automatikus achievement-szinkront, akkor tároljuk titkosítva (AES-256-GCM) a szerverünkön, kizárólag az achievementjei frissítésére, és töröljük, ha leválasztja a fiókot vagy a kulcs lejár",
                            "6. cikk (1) b)",
                            "A kapcsolat eltávolításáig vagy a fiók törléséig",
                            "Az érintett és az összekapcsolt platform",
                        ],
                        [
                            "**Nyilvános profil és közösségi funkciók:** nyilvános profiloldal, ranglista, aktivitási hírfolyam, követések",
                            "Felhasználónév, kis profilkép, borítókép, bemutatkozás, éppen játszott játék, platformok, műfajok, XP és szint, sorozatok, könyvtárstatisztika, jelvények, közösségi azonosítók, játékfiókok, követések, aktivitási bejegyzések",
                            "6. cikk (1) b); a profil bármikor privátra állítható",
                            "Csak addig nyilvános, amíg a profil nyilvános; a fiók törléséig őrizzük",
                            "Az érintett; az aktivitási bejegyzések a műveletei alapján jönnek létre",
                        ],
                        [
                            "**Értékelések és egyéb hozzájárulások:** értékelések, hasznossági szavazatok, Dead by Daylight buildek és kedvelések, tier list szavazatok, játékérdekesség-szavazatok, üzemzavar-bejelentések",
                            "Értékelés szövege, csillagos értékelés, előnyök és hátrányok, spoiler-jelölés, szavazatok és kedvelések, build tartalma, felhasználónév és fiókazonosító; az értékeléshez tárolt e-mail-cím (nyilvánosan soha nem jelenik meg)",
                            "6. cikk (1) b)",
                            "Amíg Ön vagy mi nem töröljük, illetve a fiók törléséig; az értékeléseket törlés helyett anonimizálhatjuk",
                            "Az érintett",
                        ],
                        [
                            "**Csapattárs-keresés (LFG):** hirdetések és csatlakozási kérelmek",
                            "A hirdetés tartalma és a felhasználónév; csatlakozási kérelemnél az Ön üzenete és a megadott elérhetőség",
                            "6. cikk (1) b)",
                            "Amíg Ön vagy mi nem töröljük, illetve a fiók törléséig",
                            "Az érintett",
                        ],
                        [
                            "**Push-értesítések:** árfigyelők, megjelenési emlékeztetők, ingyenes játékok és közösségi értesítések",
                            "Push-feliratkozás végpontja és kulcsai, a böngésző felhasználói ügynökéből (user agent) képzett eszközmegnevezés, utolsó aktivitás ideje",
                            "6. cikk (1) a) (hozzájárulás)",
                            "Az értesítések kikapcsolásáig, vagy amíg a böngésző a feliratkozást lejártnak nem jelzi",
                            "Az érintett böngészője",
                        ],
                        [
                            "**Bejelentések és moderálás:** értékelésekkel, LFG-hirdetésekkel, buildekkel és profilokkal kapcsolatos bejelentések, valamint jogellenes tartalomra vonatkozó értesítések kezelése",
                            "A bejelentett tartalom és szerzője, a bejelentés oka, a bejelentő fiók; e-mailben küldött értesítésnél a bejelentő neve, e-mail-címe és üzenete",
                            "6. cikk (1) f) (biztonságos közösség); 6. cikk (1) c), ha a digitális szolgáltatásokról szóló (EU) 2022/2065 rendelet (DSA) előírja",
                            "A bejelentés kezeléséhez szükséges ideig, azt követően legfeljebb 6 hónapig",
                            "Az érintett, más felhasználók és bejelentők",
                        ],
                        [
                            "**Biztonság és üzemeltetés:** visszaélések és támadások elleni védelem, kéréskorlátozás (rate limiting), szervernaplók, gyorsítótárazás",
                            "IP-cím és a kérés adatai (például időpont és a lekért cím)",
                            "6. cikk (1) f)",
                            "Szerverünk az IP-címet csak a kéréskorlátozáshoz, a memóriában tartja, nem tárolja; a tárhelyszolgáltatók saját megőrzési idejük szerint (jellemzően legfeljebb 30 napig) őrzik a naplókat. A hibajelentéseket (hibaüzenet, technikai hívási lánc, oldalcím, böngésző típusa, IP-cím és fiók nélkül) legfeljebb 90 napig őrizzük a hibák felderítéséhez és javításához",
                            "Az érintett eszköze",
                        ],
                        [
                            "**Játékadatok és képek betöltése:** egyes adatokat és képeket a böngészője közvetlenül harmadik felektől tölt be (RAWG, Steam képszerverek, TMDB, Fandom/Wikia, wsrv.nl képproxy)",
                            "IP-cím és az adott szolgáltatóhoz eljutó technikai kérésadatok",
                            "6. cikk (1) f)",
                            "Mi nem tárolunk semmit; a szolgáltató saját megőrzési ideje irányadó",
                            "Az érintett eszköze",
                        ],
                        [
                            "**Böngészőben tárolt adatok:** bejelentkezési munkamenet, tárolási beállítás, nyelv, gyorsítótár és offline használat; opcionális preferenciák",
                            "A böngészőben tárolt azonosítók és beállítások (lásd a Süti-tájékoztatót)",
                            "Szükséges tárolás: 6. cikk (1) b) és f); preferenciák tárolása: 6. cikk (1) a)",
                            "A Süti-tájékoztatóban meghatározottak szerint; bármikor törölheti",
                            "Az érintett eszköze",
                        ],
                        [
                            "**Kérelmek és jogi kötelezettségek:** üzenetek és adatvédelmi kérelmek megválaszolása, hatósági megkeresések teljesítése, a DSA szerinti kötelezettségek teljesítése",
                            "Név és e-mail-cím, az üzenet tartalma, a kérelemmel érintett adatok",
                            "6. cikk (1) c); általános megkereséseknél 6. cikk (1) f)",
                            "Az ügy intézéséhez és a jogszerű eljárás igazolásához szükséges ideig",
                            "Az érintett vagy a hatóság",
                        ],
                    ],
                },
            },
            {
                id: "public-profile",
                title: "4. Nyilvános profil",
                paragraphs: [
                    "Profilja **alapértelmezés szerint nyilvános**, mivel a játékosprofil megosztása más játékosokkal a Általános Szerződési Feltételekben leírt közösségi funkciók része. A profilt a **Profil szerkesztése** menüpontban bármikor **privátra** állíthatja. A privátra állítás egyben a nyilvánosságra hozatal elleni tiltakozás legegyszerűbb módja.",
                    "Amíg profilja nyilvános, az alábbi adatok bárki számára – fiók nélküli látogatók számára is – láthatók a nyilvános profiloldalon, a ranglistán, az aktivitási hírfolyamban és a követési listákban:",
                ],
                list: [
                    "felhasználónév, kis profilkép, borítókép és bemutatkozás",
                    "az éppen játszott játék, a platformok és a kedvenc műfajok",
                    "XP, szint, aktivitási sorozatok, jelvények és könyvtárstatisztika",
                    "közösségi azonosítók (Steam, Discord, Twitch, YouTube) és az összekapcsolt játékfiókok",
                    "aktivitási bejegyzései és az Ön által követett felhasználók",
                ],
                after: [
                    "**Soha nem nyilvános:** e-mail-cím, jelszó, számítógép-konfiguráció, könyvtárjegyzetek, árfigyelők, megjelenési emlékeztetők, értesítési beállítások és push-feliratkozások.",
                    "Privát profil esetén a profil nem kerül közzétételre, és Önről nem jelenik meg aktivitási bejegyzés. A közösségi felületeken közzétett tartalmai (például értékelések vagy LFG-hirdetések) az 5. pontban leírtak szerint továbbra is láthatók.",
                ],
            },
            {
                id: "user-content",
                title: "5. Az Ön által közzétett tartalmak",
                paragraphs: [
                    "A közösségi funkciókban közzétett tartalmakat mások is láthatják. Kérjük, ne adjon meg olyan személyes adatot, amelyet nem kíván megosztani, különösen más személyekre vonatkozó adatot.",
                ],
                list: [
                    "**Értékelések:** a szöveg, a csillagos értékelés, az előnyök és hátrányok, valamint a felhasználóneve nyilvános; más felhasználók hasznosnak jelölhetik az értékelést. Az értékeléshez tárolt e-mail-cím soha nem jelenik meg.",
                    "**LFG-hirdetések:** nyilvánosak.",
                    "**LFG csatlakozási kérelmek:** üzenetét és elérhetőségét csak Ön és a hirdetés tulajdonosa látja.",
                    "**Buildek, kedvelések, szavazatok és üzemzavar-bejelentések:** a megosztott buildek nyilvánosak; a kedveléseket, a tier list és játékérdekesség-szavazatokat, valamint az üzemzavar-bejelentéseket a közösségi eredmények megjelenítésére használjuk.",
                    "**Követések és aktivitási hírfolyam:** nyilvánosak.",
                ],
                after: [
                    "Tartalmait törölheti, és a Általános Szerződési Feltételeket sértő tartalmakat mi is eltávolíthatjuk. A fiók törlésekor tartalmait töröljük, az értékeléseket pedig törlés helyett úgy anonimizálhatjuk, hogy azok Önhöz többé ne legyenek köthetők.",
                ],
            },
            {
                id: "legitimate-interests",
                title: "6. Jogos érdek (érdekmérlegelés)",
                paragraphs: [
                    "Ahol az adatkezelés jogalapja jogos érdek (GDPR 6. cikk (1) bekezdés f) pont), érdekeinket az Ön érdekeivel, jogaival és szabadságaival szemben mérlegeltük:",
                ],
                list: [
                    "**Az Adatkezelő érdeke:** a szolgáltatás biztonságának és elérhetőségének fenntartása, a spam, a visszaélések és a támadások megelőzése, az oldalak gyors működése gyorsítótárazással és közvetlenül betöltött játékképekkel, a bejelentések kezelése a biztonságos közösség érdekében, valamint az általános megkeresések megválaszolása.",
                    "**Szükségesség:** e célok nem érhetők el technikai adatok, például az IP-cím nélkül, amelyet minden weboldal szükségszerűen megkap. A lehető legkevesebb adatot használjuk: szerverünk az IP-címet csak a kéréskorlátozáshoz, a memóriában tartja, és nem tárolja.",
                    "**Az érintettre gyakorolt hatás:** csekély. Az adatok technikai jellegűek, rövid ideig őrizzük őket, nem használjuk profilalkotásra vagy marketingre, és nem kapcsoljuk össze felhasználói profilokkal. A felhasználók észszerűen számíthatnak arra, hogy egy weboldal védekezik a visszaélések ellen.",
                    "**Garanciák:** rövid megőrzési idő, az Adatkezelőre és adatfeldolgozóira korlátozott hozzáférés, webanalitika és reklám mellőzése.",
                ],
                after: [
                    "Mindezek alapján arra jutottunk, hogy az Ön érdekei vagy alapvető jogai nem élveznek elsőbbséget e jogos érdekekkel szemben. **Önt megilleti a tiltakozás joga:** saját helyzetével kapcsolatos okokból bármikor tiltakozhat ez ellen az adatkezelés ellen (lásd a 13. pontot).",
                ],
            },
            {
                id: "push-notifications",
                title: "7. Push-értesítések",
                paragraphs: [
                    "A push-értesítések **nem kötelezők**. Csak akkor aktiválódnak, ha Ön bekapcsolja őket, és a böngésző engedélykérésénél hozzájárul. Az adatkezelés jogalapja az Ön **hozzájárulása** (GDPR 6. cikk (1) bekezdés a) pont).",
                    "Tároljuk a böngésző push-szolgáltatása által kiadott feliratkozási végpontot és kulcsokat, a böngésző felhasználói ügynökéből képzett eszközmegnevezést, valamint az eszköz utolsó aktivitásának idejét. Ezeket kizárólag az Ön által kiválasztott értesítések küldésére használjuk: árfigyelők, megjelenési emlékeztetők, ingyenes játékok és közösségi értesítések.",
                    "Az üzeneteket a böngésző gyártójának push-szolgáltatása kézbesíti (például Chrome esetén a Google Firebase Cloud Messaging, Firefox esetén a Mozilla, Safari esetén az Apple).",
                    "**A hozzájárulás visszavonása:** az értesítéseket bármikor kikapcsolhatja az értesítési beállításokban vagy a böngésző webhely-beállításaiban. Ezt követően nem küldünk értesítést, és töröljük a feliratkozást. A visszavonás nem érinti a visszavonás előtti adatkezelés jogszerűségét.",
                ],
            },
            {
                id: "recipients",
                title: "8. Címzettek és adatfeldolgozók",
                paragraphs: [
                    "Személyes adatait nem adjuk el és nem adjuk bérbe. Kizárólag az alábbi címzettekkel, a szükséges mértékben osztjuk meg:",
                ],
                list: [
                    "**Netlify, Inc.** (USA): a weboldal tárhelyszolgáltatója, naplózza a kéréseket. Adatvédelmi tájékoztató: https://www.netlify.com/privacy/",
                    "**Render Services, Inc.** (USA, Oregon régió): a háttérszerver (API) üzemeltetése, naplózza a kéréseket. Adatvédelmi tájékoztató: https://render.com/privacy",
                    "**Google Ireland Limited / Google LLC:** Firebase Authentication (bejelentkezés, megerősítő és jelszó-visszaállító e-mailek) és Cloud Firestore (adatbázis); az adatkezelés az EU-ban és az USA-ban is történhet. Adatvédelmi információk: https://firebase.google.com/support/privacy",
                    "**Böngészők push-szolgáltatásai** (Google Firebase Cloud Messaging, Mozilla autopush, Apple Push Notification service): a push-üzenetek kézbesítése, ha Ön bekapcsolta azokat.",
                    "**Harmadik felek API-jai és képtárhelyei** (például RAWG, Steam, TMDB, Fandom/Wikia, wsrv.nl): megkapják az IP-címét, amikor böngészője közvetlenül tőlük tölt be adatot vagy képet. Saját adatvédelmi tájékoztatójuk szerint, önálló adatkezelőként járnak el.",
                    "**Más felhasználók és a nyilvánosság:** a 4. és 5. pontban leírt nyilvános profiladatokat és tartalmakat láthatják.",
                    "**Hatóságok és bíróságok:** kizárólag akkor, ha jogszabály kötelez az adatok átadására.",
                ],
                after: [
                    "A Netlify, a Render és a Google a GDPR 28. cikkének megfelelő adatfeldolgozási feltételek alapján, **adatfeldolgozóként** jár el. Játékfiók összekapcsolásakor az importáláshoz szükséges azonosítót vagy bejelentkezési adatokat szerverünk arra használja, hogy lekérje játékait az adott platformról.",
                ],
            },
            {
                id: "transfers",
                title: "9. Adattovábbítás az EU-n kívülre",
                paragraphs: [
                    "Egyes címzettek az **Amerikai Egyesült Államokban** találhatók, vagy onnan férhetnek hozzá az adatokhoz (Netlify, Render, Google és egyes push-szolgáltatások). Az adattovábbítás alapja az **EU–USA adatvédelmi keretrendszerről** (Data Privacy Framework) szóló megfelelőségi határozat (GDPR 45. cikk), ha a címzett rendelkezik ilyen tanúsítással, ennek hiányában az Európai Bizottság által elfogadott **általános szerződési feltételek** (GDPR 46. cikk (2) bekezdés c) pont).",
                    "Ezen garanciák másolatát a {email} címen bármikor kérheti.",
                ],
            },
            {
                id: "automated-decisions",
                title: "10. Automatizált döntéshozatal és moderálás",
                paragraphs: [
                    "Nem hozunk kizárólag automatizált adatkezelésen – ideértve a profilalkotást is – alapuló olyan döntést, amely Önre nézve joghatással járna vagy Önt hasonlóképpen jelentős mértékben érintené (GDPR 22. cikk).",
                    "A moderálás egyetlen lépése automatikus: **az értékelés 5 felhasználói bejelentés után automatikusan elrejtésre kerül** a felülvizsgálatig. Ez ideiglenes biztonsági intézkedés, nem végleges döntés. Ha Ön az értékelés szerzője, a {email} címen bármikor kérheti a döntés **emberi felülvizsgálatát**, megindokolva, miért kellene az értékelést visszaállítani.",
                    "Az XP-t, a szinteket, a sorozatokat és a jelvényeket az aktivitása alapján automatikusan számítjuk. Ezek kizárólag az oldal játékos funkcióit szolgálják, joghatással vagy hasonlóan jelentős hatással nem járnak.",
                ],
            },
            {
                id: "retention",
                title: "11. Az adatkezelés időtartama",
                list: [
                    "**Fiókadatok:** a fiók törléséig, azt követően 30 napon belül töröljük.",
                    "**Nyilvános tartalmak:** amíg Ön vagy mi nem töröljük, illetve a fiók törléséig; az értékeléseket törlés helyett anonimizálhatjuk.",
                    "**Push-feliratkozások:** az értesítések kikapcsolásáig, vagy amíg a böngésző a feliratkozást lejártnak nem jelzi.",
                    "**Bejelentések:** a kezelésükhöz szükséges ideig, azt követően legfeljebb 6 hónapig.",
                    "**Szervernaplók:** az egyes tárhelyszolgáltatók megőrzési ideje szerint, jellemzően legfeljebb 30 napig.",
                    "**Böngészőben tárolt adatok:** a Süti-tájékoztatóban meghatározottak szerint; böngészőjében bármikor törölheti őket.",
                ],
                after: [
                    "Ha jogszabály hosszabb megőrzést ír elő (például folyamatban lévő hatósági eljárás miatt), az érintett adatokat csak erre a célra és a szükséges ideig őrizzük meg.",
                ],
            },
            {
                id: "security",
                title: "12. Adatbiztonság",
                paragraphs: [
                    "Adatai védelme érdekében megfelelő technikai és szervezési intézkedéseket alkalmazunk, többek között:",
                ],
                list: [
                    "titkosított kapcsolat (HTTPS) a weboldal, a szerverünk és az adatbázis felé",
                    "bejelentkezés a Firebase Authentication szolgáltatáson keresztül, így jelszavát mi soha nem láthatjuk",
                    "adatbázis-hozzáférési szabályok: privát fiókadatait csak Ön olvashatja, és csak a nyilvános profil mezői kerülnek közzétételre",
                    "kéréskorlátozás és visszaélések elleni védelem a szerveren, az IP-címek tárolása nélkül",
                    "az Xbox és PlayStation bejelentkezési adatokat csak egyszer, az importáláshoz használjuk, és soha nem tároljuk",
                    "adattakarékosság és az Adatkezelőre korlátozott hozzáférés",
                ],
                after: [
                    "Adatvédelmi incidens esetén – ha szükséges – 72 órán belül bejelentjük azt a felügyeleti hatóságnak, és indokolatlan késedelem nélkül tájékoztatjuk Önt, ha az incidens valószínűsíthetően magas kockázattal jár az Ön jogaira nézve (GDPR 33–34. cikk).",
                ],
            },
            {
                id: "your-rights",
                title: "13. Az érintett jogai",
                paragraphs: [
                    "A GDPR 15–22. cikke alapján Önt az alábbi jogok illetik meg:",
                ],
                list: [
                    "**Hozzáférési jog (15. cikk):** tájékoztatást kérhet arról, hogy kezeljük-e személyes adatait, és másolatot kérhet azokról, az e tájékoztatóban szereplő információkkal együtt.",
                    "**Helyesbítéshez való jog (16. cikk):** kérheti pontatlan adatai helyesbítését, illetve hiányos adatai kiegészítését. A legtöbb profiladatot a Profil szerkesztése menüpontban maga is módosíthatja.",
                    "**Törléshez való jog (17. cikk):** kérheti adatai törlését, például ha azokra már nincs szükség, vagy ha visszavonja hozzájárulását (a fiók törléséről lásd a 14. pontot).",
                    "**Az adatkezelés korlátozásához való jog (18. cikk):** például addig, amíg adatai pontosságát vagy tiltakozását vizsgáljuk.",
                    "**A címzettek tájékoztatása (19. cikk):** a helyesbítésről, törlésről vagy korlátozásról tájékoztatjuk a címzetteket, és kérésére megadjuk, kik ezek a címzettek.",
                    "**Adathordozhatósághoz való jog (20. cikk):** az Ön által megadott, hozzájárulás vagy szerződés alapján kezelt adatait tagolt, széles körben használt, géppel olvasható formátumban megkaphatja, vagy kérheti azok továbbítását egy másik adatkezelőhöz.",
                    "**Tiltakozáshoz való jog (21. cikk):** saját helyzetével kapcsolatos okokból bármikor tiltakozhat a jogos érdeken alapuló adatkezelés ellen. Ekkor az adatkezelést megszüntetjük, kivéve, ha kényszerítő erejű jogos okok vagy jogi igények indokolják. Profilja nyilvánosságra hozatala ellen a profil privátra állításával tiltakozhat.",
                    "**Automatizált döntéshozatal (22. cikk):** joga van ahhoz, hogy ne terjedjen ki Önre kizárólag automatizált adatkezelésen alapuló, joghatással vagy hasonlóan jelentős hatással járó döntés (lásd a 10. pontot).",
                    "**A hozzájárulás visszavonása (7. cikk (3) bekezdés):** hozzájárulását bármikor visszavonhatja, például a push-értesítések kikapcsolásával vagy a süti-beállítások módosításával; ez nem érinti a korábbi adatkezelés jogszerűségét.",
                ],
                after: [
                    "**A jogok gyakorlása:** kérelmét a {email} címre küldheti el (lehetőleg a fiókjához tartozó e-mail-címről, hogy azonosíthassuk). Ha személyazonosságával kapcsolatban megalapozott kétségünk merül fel, további információt kérhetünk.",
                    "Kérelmét a beérkezésétől számított **egy hónapon belül** megválaszoljuk. Ez a határidő – a kérelem összetettségére és a kérelmek számára tekintettel – szükség esetén **további két hónappal** meghosszabbítható; a meghosszabbításról és annak okairól az első hónapon belül tájékoztatjuk. A jogok gyakorlása díjmentes. Egyértelműen megalapozatlan vagy túlzó kérelem esetén észszerű díjat számíthatunk fel, vagy megtagadhatjuk az intézkedést, amelynek okáról tájékoztatjuk.",
                ],
            },
            {
                id: "account-deletion",
                title: "14. A fiók törlése",
                paragraphs: [
                    "**Önkiszolgáló lehetőségek:** bejelentkezve a Profil → Fiók fülön az **Adataim letöltése** gombbal géppel olvasható (JSON) másolatot kaphat minden rólunk tárolt adatáról (GDPR 15. és 20. cikk). A **Fiókom törlése** gombbal jelszava megerősítése után véglegesen törölheti fiókját és minden kapcsolódó adatát (profil, könyvtár, árfigyelők, értékelések, hirdetések, követések, szinkronizált achievementek és tárolt platformkulcsok) (GDPR 17. cikk). Mindkét kérelmet elküldheti a fiókjához tartozó e-mail-címről a {email} címre is.",
                    "Fiókját és személyes adatait **30 napon belül** töröljük: a bejelentkezési fiókot, a profilt, a nyilvános profilt, a könyvtárat, az árfigyelőket, az emlékeztetőket, az értesítéseket és a push-feliratkozásokat. Értékeléseit töröljük vagy anonimizáljuk, egyéb hozzájárulásait töröljük. A tárhelyszolgáltatók szervernaplóiban lévő másolatok azok megőrzési ideje szerint szűnnek meg. Adatot csak akkor őrzünk meg, ha jogszabály előírja.",
                    "Addig is bármikor privátra állíthatja profilját, törölheti egyes tartalmait, és kikapcsolhatja az értesítéseket.",
                ],
            },
            {
                id: "complaints",
                title: "15. Panasz és jogorvoslat",
                paragraphs: [
                    "Ha úgy véli, hogy személyes adatainak kezelése jogszabályt sért, kérjük, először a {email} címen forduljon hozzánk, hogy a problémát gyorsan orvosolhassuk. Ettől függetlenül Ön jogosult:",
                ],
                list: [
                    "**panaszt tenni a magyar adatvédelmi hatóságnál** (Info tv. 52. §): {authorityName}, cím: {authorityAddress}, e-mail: {authorityEmail}, weboldal: {authorityUrl}",
                    "**panaszt tenni** a szokásos tartózkodási helye, munkahelye vagy a feltételezett jogsértés helye szerinti uniós tagállam **felügyeleti hatóságánál** (GDPR 77. cikk).",
                    "**bírósághoz fordulni** (GDPR 79. cikk, Info tv. 23. §): Magyarországon a per elbírálása a **törvényszék** hatáskörébe tartozik, és a per – választása szerint – a lakóhelye vagy tartózkodási helye szerinti törvényszék előtt is megindítható. A pert annak az uniós tagállamnak a bírósága előtt is megindíthatja, ahol szokásos tartózkodási helye van.",
                ],
            },
            {
                id: "children",
                title: "16. Gyermekek",
                paragraphs: [
                    "A {siteName} **16. életévüket betöltött** felhasználóknak szól. 16 év alatti személy a GDPR 8. cikkével összhangban csak a szülői felügyeleti jogot gyakorló személy (szülő vagy gyám) hozzájárulásával regisztrálhat.",
                    "Ha tudomásunkra jut, hogy 16 év alatti személy ilyen hozzájárulás nélkül regisztrált, a fiókot és adatait töröljük. Ha szülőként vagy gyámként úgy gondolja, hogy gyermeke hozzájárulás nélkül regisztrált, a {email} címen bármikor jelezheti.",
                ],
            },
            {
                id: "browser-storage",
                title: "17. Sütik és böngészőben tárolt adatok",
                paragraphs: [
                    "Az oldal hagyományos sütiket nem helyez el. A böngésző helyi tárolóját (localStorage), az IndexedDB-t és a Cache Storage-et a feltétlenül szükséges funkciókhoz (bejelentkezési munkamenet, tárolási beállítás és nyelv megjegyzése, játékadatok gyorsítótárazása, offline használat), valamint – ha engedélyezi – preferenciákhoz, például az áruházi árrégió megjegyzéséhez használja.",
                    "Webanalitikai és marketingeszközt nem használunk. Az egyes tárolt elemek leírását a **Süti-tájékoztató** tartalmazza ({website}/cookies), döntését pedig bármikor módosíthatja: [[cookieSettings]]",
                    "Külső oldalak (például áruházak, a YouTube vagy a Twitch) csak akkor helyeznek el saját sütit, ha Ön egy rájuk mutató hivatkozást követ.",
                ],
            },
            {
                id: "required-data",
                title: "18. Kötelező-e az adatok megadása?",
                paragraphs: [
                    "Személyes adatok megadását jogszabály nem írja elő, és a {siteName} fiók nélkül is böngészhető.",
                    "Fiók létrehozásához meg kell adnia **e-mail-címét, egy jelszót és egy felhasználónevet**, mert ezek nélkül a Általános Szerződési Feltételek szerinti fiókot nem tudjuk biztosítani. Minden további profiladat, a játékfiókok összekapcsolása, a közösségi hozzájárulások és a push-értesítések önkéntesek; ha ezeket nem adja meg, csak az adott funkció nem érhető el.",
                ],
            },
            {
                id: "changes",
                title: "19. A tájékoztató módosítása",
                paragraphs: [
                    "A tájékoztatót módosítjuk, ha adatkezelésünk vagy a jogszabályok változnak. A hatályos változat mindig ezen az oldalon érhető el, a tetején feltüntetett hatálybalépési dátummal.",
                    "A lényeges változásokat előzetesen közzétesszük az oldalon, és szükség esetén alkalmazáson belüli értesítésben vagy e-mailben is jelezzük. Ha a változás az Ön hozzájárulását igényli, azt ismét kérni fogjuk.",
                ],
            },
        ],
    },

    de: {
        title: "Datenschutzerklärung",
        intro: "Diese Datenschutzerklärung erläutert, welche personenbezogenen Daten **{siteName}** ({website}) zu welchen Zwecken, auf welcher Rechtsgrundlage und wie lange verarbeitet und welche Rechte Sie haben. Sie erfolgt gemäß Art. 13 der **Datenschutz-Grundverordnung** (Verordnung (EU) 2016/679, „DSGVO“) und dem ungarischen **Gesetz Nr. CXII von 2011** über das Recht auf informationelle Selbstbestimmung und die Informationsfreiheit („Info-Gesetz“).",
        sections: [
            {
                id: "controller",
                title: "1. Verantwortlicher",
                paragraphs: [
                    "Verantwortlicher für die Verarbeitung Ihrer personenbezogenen Daten („Verantwortlicher“, „wir“ oder „uns“) ist der Betreiber von {siteName}, eine Privatperson:",
                ],
                list: [
                    "**Name:** {operatorName}",
                    "**Postanschrift:** {address}",
                    "**E-Mail (auch für Datenschutzanfragen):** {email}",
                    "**Website:** {website}",
                ],
                after: [
                    "Ein **Datenschutzbeauftragter** wurde nicht benannt, da der Verantwortliche nach Art. 37 DSGVO hierzu nicht verpflichtet ist. Fragen zu Ihren Daten richten Sie bitte an die oben genannte E-Mail-Adresse.",
                ],
            },
            {
                id: "summary",
                title: "2. Zusammenfassung",
                paragraphs: [
                    "{siteName} ist eine kostenlose Informations- und Community-Website rund um Spiele. Wir verarbeiten nur die Daten, die für den Betrieb erforderlich sind:",
                ],
                list: [
                    "**Keine Werbung, keine Webanalyse und keine Tracking-Pixel.** Wir erstellen keine Marketingprofile, versenden keine Newsletter und verkaufen Ihre Daten nicht.",
                    "Sie können die Website **ohne Konto** nutzen. Ein Konto (E-Mail-Adresse, Passwort und Benutzername) ist nur für persönliche und Community-Funktionen erforderlich.",
                    "Ihr **öffentliches Profil ist standardmäßig sichtbar** und kann jederzeit unter „Profil bearbeiten“ auf privat gestellt werden.",
                    "**Push-Benachrichtigungen** senden wir nur, wenn Sie sie aktivieren.",
                    "Sie können jederzeit **Auskunft, Berichtigung oder Löschung** Ihrer Daten unter {email} verlangen.",
                ],
            },
            {
                id: "processing",
                title: "3. Welche Daten wir verarbeiten, wozu und auf welcher Rechtsgrundlage",
                paragraphs: [
                    "Die folgende Tabelle führt jede Verarbeitungstätigkeit auf. Die Rechtsgrundlagen beziehen sich auf Art. 6 Abs. 1 DSGVO: **lit. a** Einwilligung, **lit. b** Vertragserfüllung (unsere Nutzungsbedingungen, die Sie bei der Registrierung akzeptieren), **lit. c** Erfüllung einer rechtlichen Verpflichtung und **lit. f** berechtigte Interessen.",
                ],
                table: {
                    head: ["Tätigkeit und Zweck", "Personenbezogene Daten", "Rechtsgrundlage", "Speicherdauer", "Herkunft"],
                    rows: [
                        [
                            "**Benutzerkonto:** Registrierung, Anmeldung, Bestätigung der E-Mail-Adresse und Zurücksetzen des Passworts",
                            "E-Mail-Adresse, Passwort (verwaltet durch Firebase Authentication), Benutzername, Kontokennung",
                            "Art. 6 Abs. 1 lit. b",
                            "Bis zur Löschung des Kontos, danach Löschung innerhalb von 30 Tagen",
                            "Sie",
                        ],
                        [
                            "**Profil und persönliche Funktionen:** Profil, Spielebibliothek, Favoriten, Preisalarme, Release-Erinnerungen, eingelöste Gratisspiele, XP, Level, Serien, Abzeichen, In-App-Benachrichtigungen und Einstellungen",
                            "Profil- und Bannerbild, Bio, aktuell gespieltes Spiel, Social-Media-Namen (Steam, Discord, Twitch, YouTube), Plattformen, Lieblingsgenres, Profilfarbe, Sprache, Benachrichtigungseinstellungen, PC-Spezifikationen, Bibliothekseinträge (Status, Bewertung, Notiz, Spielzeit), XP, Level, letztes Aktivitätsdatum, aktive Tage, Abzeichen, Alarme, Erinnerungen, eingelöste Spiele, Favoriten, Benachrichtigungen",
                            "Art. 6 Abs. 1 lit. b",
                            "Bis Sie den Eintrag entfernen oder Ihr Konto gelöscht wird (dann innerhalb von 30 Tagen)",
                            "Sie; XP, Level, Serien und Abzeichen werden aus Ihrer Aktivität berechnet",
                        ],
                        [
                            "**Verknüpfung von Spielekonten:** Import Ihrer Spiele von Steam, Xbox oder PlayStation auf Ihren Wunsch",
                            "Steam-ID, importierte Spieletitel und zugehörige Bibliotheksdaten, Erfolge und Trophäen (Freischaltung, Datum, Seltenheit), die Ihnen angezeigten Steam-Profildaten (Level, Abzeichen, Freundesliste, zuletzt gespielte Spiele, Wunschliste). Der Xbox-Schlüssel (OpenXBL) oder das PlayStation-Token (NPSSO) wird einmalig für einen Import verwendet; nur wenn Sie die automatische Erfolge-Synchronisierung aktivieren, wird er verschlüsselt (AES-256-GCM) auf unserem Server gespeichert, ausschließlich zum Aktualisieren Ihrer Erfolge genutzt und gelöscht, wenn Sie das Konto trennen oder er abläuft",
                            "Art. 6 Abs. 1 lit. b",
                            "Bis Sie die Verknüpfung entfernen oder Ihr Konto gelöscht wird",
                            "Sie und die verknüpfte Plattform",
                        ],
                        [
                            "**Öffentliches Profil und Community-Funktionen:** öffentliche Profilseite, Rangliste, Aktivitäts-Feed und Folgen",
                            "Benutzername, Profilbild-Miniatur, Banner, Bio, aktuell gespieltes Spiel, Plattformen, Genres, XP und Level, Serien, Bibliotheksstatistiken, Abzeichen, Social-Media-Namen, Spielekonten, Folgen, Aktivitätseinträge",
                            "Art. 6 Abs. 1 lit. b; Sie können Ihr Profil jederzeit auf privat stellen",
                            "Nur veröffentlicht, solange Ihr Profil öffentlich ist; gespeichert bis zur Löschung des Kontos",
                            "Sie; Aktivitätseinträge entstehen aus Ihren Aktionen",
                        ],
                        [
                            "**Rezensionen und sonstige Beiträge:** Rezensionen, Hilfreich-Stimmen, Dead-by-Daylight-Builds und Likes, Tierlisten-Stimmen, Spielfakten-Stimmen, Störungsmeldungen",
                            "Rezensionstext, Sternebewertung, Vor- und Nachteile, Spoiler-Kennzeichnung, Stimmen und Likes, Build-Inhalte, Benutzername und Kontokennung; die mit einer Rezension gespeicherte E-Mail-Adresse (nie öffentlich angezeigt)",
                            "Art. 6 Abs. 1 lit. b",
                            "Bis Sie oder wir den Beitrag löschen oder Ihr Konto gelöscht wird; Rezensionen können statt gelöscht auch anonymisiert werden",
                            "Sie",
                        ],
                        [
                            "**Mitspielersuche (LFG):** Beiträge und Beitrittsanfragen",
                            "Beitragsinhalt und Benutzername; bei Beitrittsanfragen Ihre Nachricht und die von Ihnen angegebenen Kontaktdaten",
                            "Art. 6 Abs. 1 lit. b",
                            "Bis Sie oder wir den Beitrag löschen oder Ihr Konto gelöscht wird",
                            "Sie",
                        ],
                        [
                            "**Push-Benachrichtigungen:** Preisalarme, Release-Erinnerungen, Gratisspiele und soziale Benachrichtigungen",
                            "Endpunkt und Schlüssel des Push-Abonnements, eine aus dem User-Agent Ihres Browsers abgeleitete Gerätebezeichnung, Zeitpunkt der letzten Aktivität",
                            "Art. 6 Abs. 1 lit. a (Einwilligung)",
                            "Bis Sie die Benachrichtigungen deaktivieren oder der Browser das Abonnement als abgelaufen meldet",
                            "Ihr Browser",
                        ],
                        [
                            "**Meldungen und Moderation:** Bearbeitung von Meldungen zu Rezensionen, LFG-Beiträgen, Builds und Profilen sowie von Hinweisen auf rechtswidrige Inhalte",
                            "Der gemeldete Inhalt und dessen Verfasser, der Grund, das meldende Konto; bei Hinweisen per E-Mail Name, E-Mail-Adresse und Nachricht der meldenden Person",
                            "Art. 6 Abs. 1 lit. f (sichere Community); Art. 6 Abs. 1 lit. c, soweit das Gesetz über digitale Dienste (Verordnung (EU) 2022/2065) dies verlangt",
                            "So lange wie zur Bearbeitung erforderlich, danach höchstens 6 Monate",
                            "Sie, andere Nutzer und meldende Personen",
                        ],
                        [
                            "**Sicherheit und Betrieb:** Schutz vor Missbrauch und Angriffen, Anfragebegrenzung (Rate Limiting), Serverprotokolle, Caching",
                            "IP-Adresse und Anfragedaten (z. B. Zeitpunkt und aufgerufene Adresse)",
                            "Art. 6 Abs. 1 lit. f",
                            "Unser Server hält IP-Adressen nur für die Anfragebegrenzung im Arbeitsspeicher und speichert sie nicht; Hosting-Anbieter speichern Protokolle nach ihren eigenen Fristen (in der Regel bis zu 30 Tage). Fehlerberichte (Fehlermeldung, technischer Stacktrace, Seitenadresse, Browsertyp, ohne IP-Adresse oder Konto) werden bis zu 90 Tage aufbewahrt, um Fehler zu finden und zu beheben",
                            "Ihr Gerät",
                        ],
                        [
                            "**Laden von Spieldaten und Bildern:** einige Daten und Bilder lädt Ihr Browser direkt von Dritten (RAWG, Steam-Bildserver, TMDB, Fandom/Wikia, der Bild-Proxy wsrv.nl)",
                            "IP-Adresse und technische Anfragedaten, die der jeweilige Anbieter erhält",
                            "Art. 6 Abs. 1 lit. f",
                            "Wir speichern nichts; es gilt die Speicherdauer des Anbieters",
                            "Ihr Gerät",
                        ],
                        [
                            "**Speicherung im Browser:** Anmeldesitzung, Ihre Speicherauswahl, Sprache, Cache und Offline-Nutzung; optionale Präferenzen",
                            "In Ihrem Browser gespeicherte Kennungen und Einstellungen (siehe Cookie-Richtlinie)",
                            "Notwendige Speicherung: Art. 6 Abs. 1 lit. b und f; Speicherung von Präferenzen: Art. 6 Abs. 1 lit. a",
                            "Wie in der Cookie-Richtlinie angegeben; Sie können sie jederzeit löschen",
                            "Ihr Gerät",
                        ],
                        [
                            "**Ihre Anfragen und rechtliche Pflichten:** Beantwortung Ihrer Nachrichten und Datenschutzanfragen, Beantwortung behördlicher Anfragen, Erfüllung von Pflichten nach dem Gesetz über digitale Dienste",
                            "Name und E-Mail-Adresse, Inhalt Ihrer Nachricht, die von der Anfrage betroffenen Daten",
                            "Art. 6 Abs. 1 lit. c; bei allgemeinen Anfragen Art. 6 Abs. 1 lit. f",
                            "So lange wie zur Bearbeitung und zum Nachweis der ordnungsgemäßen Bearbeitung erforderlich",
                            "Sie oder die Behörde",
                        ],
                    ],
                },
            },
            {
                id: "public-profile",
                title: "4. Öffentliches Profil",
                paragraphs: [
                    "Ihr Profil ist **standardmäßig öffentlich**, da das Teilen Ihres Spielerprofils mit anderen Spielern Teil der in den Nutzungsbedingungen beschriebenen Community-Funktionen ist. Sie können es jederzeit unter **Profil bearbeiten** auf **privat** stellen. Dies ist zugleich der einfachste Weg, der Veröffentlichung zu widersprechen.",
                    "Solange Ihr Profil öffentlich ist, sind folgende Angaben für jeden – auch für Besucher ohne Konto – auf Ihrer öffentlichen Profilseite, in der Rangliste, im Aktivitäts-Feed und in Folgen-Listen sichtbar:",
                ],
                list: [
                    "Benutzername, Profilbild-Miniatur, Banner und Bio",
                    "das aktuell gespielte Spiel, Ihre Plattformen und Lieblingsgenres",
                    "XP, Level, Aktivitätsserien, Abzeichen und Bibliotheksstatistiken",
                    "Ihre Social-Media-Namen (Steam, Discord, Twitch, YouTube) und verknüpften Spielekonten",
                    "Ihre Aktivitätseinträge und die Nutzer, denen Sie folgen",
                ],
                after: [
                    "**Niemals öffentlich:** Ihre E-Mail-Adresse, Ihr Passwort, PC-Spezifikationen, Bibliotheksnotizen, Preisalarme, Release-Erinnerungen, Benachrichtigungseinstellungen und Push-Abonnements.",
                    "Solange Ihr Profil privat ist, wird es nicht veröffentlicht und es werden keine Aktivitäten über Sie gepostet. Inhalte, die Sie in Community-Bereichen veröffentlichen (z. B. Rezensionen oder LFG-Beiträge), bleiben wie in Abschnitt 5 beschrieben sichtbar.",
                ],
            },
            {
                id: "user-content",
                title: "5. Von Ihnen veröffentlichte Inhalte",
                paragraphs: [
                    "Inhalte, die Sie in den Community-Funktionen veröffentlichen, können von anderen gesehen werden. Bitte geben Sie keine personenbezogenen Daten an, die Sie nicht teilen möchten, insbesondere keine Daten über andere Personen.",
                ],
                list: [
                    "**Rezensionen:** Text, Bewertung, Vor- und Nachteile sowie Ihr Benutzername sind öffentlich; andere Nutzer können Rezensionen als hilfreich markieren. Die mit einer Rezension gespeicherte E-Mail-Adresse wird nie angezeigt.",
                    "**LFG-Beiträge:** öffentlich.",
                    "**LFG-Beitrittsanfragen:** Ihre Nachricht und Kontaktdaten sehen nur Sie und der Ersteller des Beitrags.",
                    "**Builds, Likes, Stimmen und Störungsmeldungen:** geteilte Builds sind öffentlich; Likes, Tierlisten- und Spielfakten-Stimmen sowie Störungsmeldungen dienen der Anzeige von Community-Ergebnissen.",
                    "**Folgen und Aktivitäts-Feed:** öffentlich.",
                ],
                after: [
                    "Sie können Ihre Inhalte löschen, und wir können Inhalte entfernen, die gegen die Nutzungsbedingungen verstoßen. Bei Löschung Ihres Kontos werden Ihre Inhalte gelöscht bzw. Rezensionen so anonymisiert, dass sie Ihnen nicht mehr zugeordnet werden können.",
                ],
            },
            {
                id: "legitimate-interests",
                title: "6. Berechtigte Interessen (Interessenabwägung)",
                paragraphs: [
                    "Soweit wir uns auf berechtigte Interessen stützen (Art. 6 Abs. 1 lit. f DSGVO), haben wir unsere Interessen gegen Ihre Interessen, Grundrechte und Grundfreiheiten abgewogen:",
                ],
                list: [
                    "**Unsere Interessen:** Sicherheit und Verfügbarkeit des Dienstes, Verhinderung von Spam, Missbrauch und Angriffen, schnelle Seiten durch Caching und direkt geladene Spielbilder, Bearbeitung von Meldungen für eine sichere Community sowie Beantwortung allgemeiner Anfragen.",
                    "**Erforderlichkeit:** Diese Zwecke lassen sich nicht ohne technische Daten wie IP-Adressen erreichen, die jede Website zwangsläufig erhält. Wir nutzen nur das Minimum: Unser Server hält IP-Adressen nur für die Anfragebegrenzung im Arbeitsspeicher und speichert sie nicht.",
                    "**Auswirkungen auf Sie:** gering. Die Daten sind technischer Natur, werden kurz gespeichert, nicht für Profiling oder Marketing genutzt und nicht zu Nutzerprofilen zusammengeführt. Nutzer können vernünftigerweise erwarten, dass eine Website sich vor Missbrauch schützt.",
                    "**Schutzmaßnahmen:** kurze Speicherfristen, Zugriff nur für den Verantwortlichen und seine Auftragsverarbeiter, keine Webanalyse und keine Werbung.",
                ],
                after: [
                    "Wir sind daher zu dem Ergebnis gekommen, dass Ihre Interessen oder Grundrechte diese Interessen nicht überwiegen. **Sie haben das Recht, dieser Verarbeitung** aus Gründen, die sich aus Ihrer besonderen Situation ergeben, **jederzeit zu widersprechen** (siehe Abschnitt 13).",
                ],
            },
            {
                id: "push-notifications",
                title: "7. Push-Benachrichtigungen",
                paragraphs: [
                    "Push-Benachrichtigungen sind **freiwillig**. Sie werden nur aktiviert, wenn Sie sie einschalten und in der Berechtigungsabfrage Ihres Browsers zustimmen. Rechtsgrundlage ist Ihre **Einwilligung** (Art. 6 Abs. 1 lit. a DSGVO).",
                    "Wir speichern den vom Push-Dienst Ihres Browsers ausgegebenen Abonnement-Endpunkt und die Schlüssel, eine aus dem User-Agent Ihres Browsers abgeleitete Gerätebezeichnung sowie den Zeitpunkt der letzten Aktivität des Geräts. Wir nutzen diese Daten ausschließlich, um die von Ihnen gewählten Benachrichtigungen zu senden: Preisalarme, Release-Erinnerungen, Gratisspiele und soziale Benachrichtigungen.",
                    "Die Nachrichten werden über den Push-Dienst Ihres Browserherstellers zugestellt (z. B. Google Firebase Cloud Messaging bei Chrome, Mozilla bei Firefox oder Apple bei Safari).",
                    "**Widerruf der Einwilligung:** Sie können Benachrichtigungen jederzeit in Ihren Benachrichtigungseinstellungen oder in den Website-Einstellungen Ihres Browsers deaktivieren. Wir senden dann keine Benachrichtigungen mehr und löschen das Abonnement. Der Widerruf berührt nicht die Rechtmäßigkeit der bis dahin erfolgten Verarbeitung.",
                ],
            },
            {
                id: "recipients",
                title: "8. Empfänger und Auftragsverarbeiter",
                paragraphs: [
                    "Wir verkaufen und vermieten Ihre personenbezogenen Daten nicht. Wir geben sie nur im erforderlichen Umfang an folgende Empfänger weiter:",
                ],
                list: [
                    "**Netlify, Inc.** (USA): Hosting der Website, protokolliert Anfragen. Datenschutzerklärung: https://www.netlify.com/privacy/",
                    "**Render Services, Inc.** (USA, Region Oregon): Betrieb unseres Backend-API-Servers, protokolliert Anfragen. Datenschutzerklärung: https://render.com/privacy",
                    "**Google Ireland Limited / Google LLC:** Firebase Authentication (Anmeldung, Bestätigungs- und Passwort-Zurücksetzungs-E-Mails) und Cloud Firestore (Datenbank); die Verarbeitung kann in der EU und in den USA erfolgen. Datenschutzinformationen: https://firebase.google.com/support/privacy",
                    "**Push-Dienste der Browser** (Google Firebase Cloud Messaging, Mozilla autopush, Apple Push Notification service): Zustellung von Push-Nachrichten, sofern Sie diese aktiviert haben.",
                    "**APIs und Bild-Hosts Dritter** (z. B. RAWG, Steam, TMDB, Fandom/Wikia, wsrv.nl): erhalten Ihre IP-Adresse, wenn Ihr Browser Daten oder Bilder direkt von ihnen lädt. Sie handeln als eigenständige Verantwortliche nach ihren eigenen Datenschutzbestimmungen.",
                    "**Andere Nutzer und die Öffentlichkeit:** sehen die in den Abschnitten 4 und 5 beschriebenen öffentlichen Profilangaben und Inhalte.",
                    "**Behörden und Gerichte:** nur, wenn wir gesetzlich zur Offenlegung verpflichtet sind.",
                ],
                after: [
                    "Netlify, Render und Google handeln als unsere **Auftragsverarbeiter** auf Grundlage von Auftragsverarbeitungsbedingungen gemäß Art. 28 DSGVO. Wenn Sie ein Spielekonto verknüpfen, verwendet unser Server die für den Import erforderliche Kennung bzw. Anmeldedaten, um Ihre Spiele von der jeweiligen Plattform abzurufen.",
                ],
            },
            {
                id: "transfers",
                title: "9. Übermittlungen außerhalb der EU",
                paragraphs: [
                    "Einige Empfänger haben ihren Sitz in den **USA** oder können von dort auf Daten zugreifen (Netlify, Render, Google und einige Push-Dienste). Diese Übermittlungen stützen sich auf den Angemessenheitsbeschluss zum **EU-US Data Privacy Framework** (Art. 45 DSGVO), sofern der Empfänger danach zertifiziert ist, andernfalls auf die **Standardvertragsklauseln** der Europäischen Kommission (Art. 46 Abs. 2 lit. c DSGVO).",
                    "Eine Kopie dieser Garantien können Sie jederzeit unter {email} anfordern.",
                ],
            },
            {
                id: "automated-decisions",
                title: "10. Automatisierte Entscheidungen und Moderation",
                paragraphs: [
                    "Wir treffen keine ausschließlich auf automatisierter Verarbeitung – einschließlich Profiling – beruhenden Entscheidungen, die Ihnen gegenüber rechtliche Wirkung entfalten oder Sie in ähnlicher Weise erheblich beeinträchtigen (Art. 22 DSGVO).",
                    "Ein Moderationsschritt erfolgt automatisch: **Eine Rezension wird nach 5 Meldungen von Nutzern automatisch ausgeblendet**, bis sie geprüft wurde. Dies ist eine vorübergehende Schutzmaßnahme, keine endgültige Entscheidung. Wenn Sie die Rezension verfasst haben, können Sie jederzeit unter {email} eine **Überprüfung durch einen Menschen** verlangen und begründen, warum die Rezension wiederhergestellt werden sollte.",
                    "XP, Level, Serien und Abzeichen werden automatisch aus Ihrer Aktivität berechnet. Sie dienen nur den spielerischen Funktionen der Website und haben keine rechtliche oder ähnlich erhebliche Wirkung.",
                ],
            },
            {
                id: "retention",
                title: "11. Speicherdauer",
                list: [
                    "**Kontodaten:** bis zur Löschung Ihres Kontos, danach Löschung innerhalb von 30 Tagen.",
                    "**Öffentliche Inhalte:** bis Sie oder wir sie löschen oder Ihr Konto gelöscht wird; Rezensionen können statt gelöscht auch anonymisiert werden.",
                    "**Push-Abonnements:** bis Sie Benachrichtigungen deaktivieren oder der Browser das Abonnement als abgelaufen meldet.",
                    "**Meldungen:** so lange wie zur Bearbeitung erforderlich, danach höchstens 6 Monate.",
                    "**Serverprotokolle:** nach den Fristen des jeweiligen Hosting-Anbieters, in der Regel bis zu 30 Tage.",
                    "**Speicherung im Browser:** wie in der Cookie-Richtlinie angegeben; Sie können sie jederzeit in Ihrem Browser löschen.",
                ],
                after: [
                    "Wenn wir gesetzlich verpflichtet sind, bestimmte Daten länger aufzubewahren (z. B. wegen eines laufenden behördlichen Verfahrens), bewahren wir sie nur zu diesem Zweck und für die erforderliche Dauer auf.",
                ],
            },
            {
                id: "security",
                title: "12. Datensicherheit",
                paragraphs: [
                    "Wir schützen Ihre Daten durch geeignete technische und organisatorische Maßnahmen, unter anderem:",
                ],
                list: [
                    "verschlüsselte Verbindungen (HTTPS) zur Website, zu unserem Server und zur Datenbank",
                    "Anmeldung über Firebase Authentication, sodass wir Ihr Passwort nie sehen können",
                    "Zugriffsregeln der Datenbank: Ihre privaten Kontodaten können nur Sie lesen, und nur die öffentlichen Profilfelder werden veröffentlicht",
                    "Anfragebegrenzung und Missbrauchsschutz auf unserem Server, ohne Speicherung von IP-Adressen",
                    "Xbox- und PlayStation-Anmeldedaten werden einmalig für den Import verwendet und nie gespeichert",
                    "Datenminimierung und Zugriff nur durch den Verantwortlichen",
                ],
                after: [
                    "Im Falle einer Verletzung des Schutzes personenbezogener Daten melden wir diese, soweit erforderlich, innerhalb von 72 Stunden der Aufsichtsbehörde und benachrichtigen Sie unverzüglich, wenn voraussichtlich ein hohes Risiko für Ihre Rechte besteht (Art. 33-34 DSGVO).",
                ],
            },
            {
                id: "your-rights",
                title: "13. Ihre Rechte",
                paragraphs: [
                    "Nach Art. 15-22 DSGVO haben Sie folgende Rechte:",
                ],
                list: [
                    "**Auskunftsrecht (Art. 15):** Sie können erfahren, ob wir Ihre Daten verarbeiten, und eine Kopie davon samt den Informationen dieser Erklärung erhalten.",
                    "**Recht auf Berichtigung (Art. 16):** Sie können die Berichtigung unrichtiger oder die Vervollständigung unvollständiger Daten verlangen. Die meisten Profildaten können Sie selbst unter „Profil bearbeiten“ ändern.",
                    "**Recht auf Löschung (Art. 17):** Sie können die Löschung Ihrer Daten verlangen, z. B. wenn sie nicht mehr benötigt werden oder Sie Ihre Einwilligung widerrufen (zur Kontolöschung siehe Abschnitt 14).",
                    "**Recht auf Einschränkung der Verarbeitung (Art. 18):** z. B. solange die Richtigkeit Ihrer Daten oder Ihr Widerspruch geprüft wird.",
                    "**Mitteilung an Empfänger (Art. 19):** Wir teilen Empfängern jede Berichtigung, Löschung oder Einschränkung mit und nennen Ihnen diese Empfänger auf Wunsch.",
                    "**Recht auf Datenübertragbarkeit (Art. 20):** Sie können die von Ihnen bereitgestellten Daten, die wir auf Grundlage einer Einwilligung oder eines Vertrags verarbeiten, in einem strukturierten, gängigen und maschinenlesbaren Format erhalten oder an einen anderen Verantwortlichen übermitteln lassen.",
                    "**Widerspruchsrecht (Art. 21):** Sie können der auf berechtigten Interessen beruhenden Verarbeitung aus Gründen, die sich aus Ihrer besonderen Situation ergeben, jederzeit widersprechen. Wir stellen die Verarbeitung dann ein, es sei denn, es liegen zwingende schutzwürdige Gründe vor oder wir benötigen die Daten für Rechtsansprüche. Der Veröffentlichung Ihres Profils können Sie widersprechen, indem Sie es auf privat stellen.",
                    "**Automatisierte Entscheidungen (Art. 22):** Sie haben das Recht, keiner ausschließlich automatisierten Entscheidung mit rechtlicher oder ähnlich erheblicher Wirkung unterworfen zu werden (siehe Abschnitt 10).",
                    "**Widerruf der Einwilligung (Art. 7 Abs. 3):** Sie können Ihre Einwilligung jederzeit widerrufen, z. B. indem Sie Push-Benachrichtigungen deaktivieren oder Ihre Auswahl in den Cookie-Einstellungen ändern; die Rechtmäßigkeit der bisherigen Verarbeitung bleibt unberührt.",
                ],
                after: [
                    "**So üben Sie Ihre Rechte aus:** Senden Sie eine E-Mail an {email} (möglichst von der mit Ihrem Konto verknüpften E-Mail-Adresse, damit wir Sie identifizieren können). Bei begründeten Zweifeln an Ihrer Identität können wir zusätzliche Informationen anfordern.",
                    "Wir antworten **innerhalb eines Monats** nach Eingang Ihrer Anfrage. Diese Frist kann unter Berücksichtigung der Komplexität und der Anzahl der Anfragen um **weitere zwei Monate** verlängert werden; über eine Verlängerung und die Gründe informieren wir Sie innerhalb des ersten Monats. Die Ausübung Ihrer Rechte ist kostenlos. Bei offenkundig unbegründeten oder exzessiven Anträgen können wir ein angemessenes Entgelt verlangen oder uns weigern, tätig zu werden, und teilen Ihnen die Gründe mit.",
                ],
            },
            {
                id: "account-deletion",
                title: "14. Löschung Ihres Kontos",
                paragraphs: [
                    "**Selbstbedienung:** Angemeldet unter Profil → Konto erhalten Sie mit **Meine Daten herunterladen** eine maschinenlesbare (JSON) Kopie aller über Sie gespeicherten Daten (Art. 15 und 20 DSGVO). Mit **Mein Konto löschen** löschen Sie nach Bestätigung Ihres Passworts Ihr Konto und alle zugehörigen Daten endgültig (Profil, Bibliothek, Alarme, Rezensionen, Beiträge, Follows, synchronisierte Erfolge und gespeicherte Plattformschlüssel) (Art. 17 DSGVO). Beide Anfragen können Sie auch von der mit Ihrem Konto verknüpften E-Mail-Adresse an {email} senden.",
                    "Wir löschen Ihr Konto und Ihre personenbezogenen Daten **innerhalb von 30 Tagen**: Anmeldekonto, Profil, öffentliches Profil, Bibliothek, Alarme, Erinnerungen, Benachrichtigungen und Push-Abonnements. Ihre Rezensionen werden gelöscht oder anonymisiert, Ihre sonstigen Beiträge werden gelöscht. Kopien in den Serverprotokollen der Hosting-Anbieter entfallen nach deren Speicherfristen. Wir bewahren Daten nur auf, soweit dies gesetzlich vorgeschrieben ist.",
                    "Bis dahin können Sie Ihr Profil jederzeit auf privat stellen, einzelne Inhalte löschen und Benachrichtigungen deaktivieren.",
                ],
            },
            {
                id: "complaints",
                title: "15. Beschwerden und Rechtsbehelfe",
                paragraphs: [
                    "Wenn Sie der Ansicht sind, dass die Verarbeitung Ihrer Daten gegen geltendes Recht verstößt, wenden Sie sich bitte zunächst an {email}, damit wir das Problem schnell lösen können. Unabhängig davon haben Sie folgende Möglichkeiten:",
                ],
                list: [
                    "**Beschwerde bei der ungarischen Datenschutzbehörde:** {authorityName}, Anschrift: {authorityAddress}, E-Mail: {authorityEmail}, Website: {authorityUrl}",
                    "**Beschwerde bei der Aufsichtsbehörde** des EU-Mitgliedstaats Ihres gewöhnlichen Aufenthalts, Ihres Arbeitsplatzes oder des Orts des mutmaßlichen Verstoßes (Art. 77 DSGVO).",
                    "**Klage vor Gericht** (Art. 79 DSGVO, § 23 Info-Gesetz): In Ungarn ist das Regionalgericht (törvényszék) zuständig, und Sie können die Klage auch vor dem Regionalgericht Ihres Wohn- oder Aufenthaltsorts erheben. Sie können außerdem vor den Gerichten des EU-Mitgliedstaats klagen, in dem Sie Ihren gewöhnlichen Aufenthalt haben.",
                ],
            },
            {
                id: "children",
                title: "16. Kinder",
                paragraphs: [
                    "{siteName} richtet sich an Nutzer **ab 16 Jahren**. Personen unter 16 Jahren dürfen sich gemäß Art. 8 DSGVO nur mit Einwilligung des Trägers der elterlichen Verantwortung (Eltern oder Vormund) registrieren.",
                    "Erfahren wir, dass sich eine Person unter 16 Jahren ohne diese Einwilligung registriert hat, löschen wir das Konto und die zugehörigen Daten. Eltern oder Vormünder, die glauben, dass sich ihr Kind ohne Einwilligung registriert hat, können sich jederzeit unter {email} an uns wenden.",
                ],
            },
            {
                id: "browser-storage",
                title: "17. Cookies und Speicherung im Browser",
                paragraphs: [
                    "Die Website setzt keine klassischen Cookies. Sie nutzt den lokalen Speicher (localStorage), IndexedDB und Cache Storage Ihres Browsers für unbedingt erforderliche Funktionen (Anmeldesitzung, Speichern Ihrer Speicherauswahl und Sprache, Caching von Spieldaten, Offline-Nutzung) und, wenn Sie es erlauben, für Präferenzen wie Ihre Preisregion.",
                    "Wir verwenden keine Analyse- oder Marketing-Tools. Alle gespeicherten Einträge sind in unserer **Cookie-Richtlinie** unter {website}/cookies beschrieben, und Sie können Ihre Auswahl jederzeit ändern: [[cookieSettings]]",
                    "Externe Websites (z. B. Shops, YouTube oder Twitch) setzen eigene Cookies nur, wenn Sie einem Link dorthin folgen.",
                ],
            },
            {
                id: "required-data",
                title: "18. Sind Sie zur Bereitstellung Ihrer Daten verpflichtet?",
                paragraphs: [
                    "Keine gesetzliche Vorschrift verpflichtet Sie zur Angabe personenbezogener Daten, und Sie können {siteName} ohne Konto nutzen.",
                    "Für die Erstellung eines Kontos benötigen wir **E-Mail-Adresse, Passwort und Benutzername**, da wir das Konto gemäß den Nutzungsbedingungen sonst nicht bereitstellen können. Alle weiteren Profilangaben, die Verknüpfung von Spielekonten, Community-Beiträge und Push-Benachrichtigungen sind freiwillig; ohne sie ist lediglich die jeweilige Funktion nicht verfügbar.",
                ],
            },
            {
                id: "changes",
                title: "19. Änderungen dieser Datenschutzerklärung",
                paragraphs: [
                    "Wir aktualisieren diese Erklärung, wenn sich unsere Verarbeitung oder die Rechtslage ändert. Die aktuelle Fassung ist stets auf dieser Seite mit dem oben angegebenen Gültigkeitsdatum abrufbar.",
                    "Wesentliche Änderungen kündigen wir vorab auf der Website und gegebenenfalls per In-App-Benachrichtigung oder E-Mail an. Erfordert eine Änderung Ihre Einwilligung, holen wir diese erneut ein.",
                ],
            },
        ],
    },
};
