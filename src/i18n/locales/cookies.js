// Cookie Policy (rendered by src/legal/LegalDoc.jsx, route page: src/TermsAndPrivacy/CookiePolicy.jsx)
// Keep the same sections, list items and table rows in every language.
// Do not put "." right after {email} or a URL: the renderer would include it in the link.
export default {
    en: {
        title: 'Cookie Policy',
        intro: 'This Cookie Policy explains what information **{siteName}** ({website}) stores on your device and reads back, what each item is for, and how you can control it. It supplements the Privacy Policy (/privacy).',
        sections: [
            {
                id: 'about',
                title: '1. Who we are and what this policy covers',
                paragraphs: [
                    'The site is operated by **{operatorName}** ({address}, email: {email}), hereinafter "the operator" or "we". This policy applies to the website {website} and to the installable app (PWA) served from it.',
                    'We do not use analytics, advertising or tracking tools. Almost everything described below is needed for the site to work, or is a convenience that you can switch off.',
                ],
            },
            {
                id: 'what-are-cookies',
                title: '2. What cookies and similar technologies are',
                paragraphs: [
                    '**Cookies** are small text files that a website places in your browser and reads back on later visits. **Similar technologies** do the same job in other ways: they store data on your device (computer, phone, tablet) or access data already stored there.',
                ],
                list: [
                    '**localStorage:** a simple key-value store in the browser, kept until the site or you delete it.',
                    '**IndexedDB:** a database built into the browser for larger, structured data.',
                    '**Cache Storage:** a store for copies of files (pages, scripts, images), so that they load faster or work offline.',
                    '**Service worker:** a small script that the browser runs in the background for this site; it manages the Cache Storage and receives push notifications if you enable them.',
                ],
                after: [
                    'Unlike cookies, this data is not sent to the server automatically with every request; it stays in your browser unless the site reads it and uses it.',
                ],
            },
            {
                id: 'what-we-use',
                title: '3. What this site uses',
                paragraphs: [
                    '**{siteName} does not set any classic cookies.** Instead, it uses localStorage, IndexedDB, Cache Storage and a service worker, as listed in section 6.',
                    'The law does not depend on the technology: the rules on cookies apply in the same way to any storage of information on your device and to any access to it. In this policy the word "cookie" therefore covers all of these technologies.',
                ],
            },
            {
                id: 'legal-framework',
                title: '4. Legal framework',
                list: [
                    '**Article 5(3) of the ePrivacy Directive (2002/58/EC)**, implemented in Hungary by **Section 155 (4) of Act C of 2003 on Electronic Communications (Eht.)**: information may be stored on your device, or read from it, only with your consent given after clear information. The only exception is storage that is **strictly necessary** to transmit a communication or to provide a service that you have explicitly requested.',
                    '**General Data Protection Regulation (GDPR, Regulation (EU) 2016/679)**: where stored data relates to you (for example your sign-in session), it is personal data. Consent must be freely given, specific, informed and unambiguous (Art. 4(11) and Art. 7), and you can withdraw it at any time as easily as you gave it (Art. 7(3)).',
                    '**Guidelines 05/2020 on consent and 2/2023 on the technical scope of Art. 5(3) of the European Data Protection Board (EDPB)**: rejecting must be as easy as accepting, pre-ticked boxes are not consent, and access to the site may not depend on accepting storage that is not necessary (no "cookie wall").',
                ],
                after: [
                    'Accordingly, necessary storage is used without consent, while every optional category **stays off until you switch it on**. You can use the whole site even if you reject all optional categories.',
                ],
            },
            {
                id: 'categories',
                title: '5. Categories',
                list: [
                    '**Necessary** (always active): storage without which the site or a feature you asked for would not work, such as the record of your consent choice, your sign-in session, the offline cache, the language you selected and the working state of the features you use. It cannot be switched off in the settings, but you can clear it in your browser (section 9).',
                    '**Preferences** (optional): conveniences remembered on this device, such as your store price region, the contact detail you last entered in a group search (LFG) post, and when you dismissed the "install app" or "enable notifications" prompts. If you refuse this category or withdraw your consent, these items are deleted and not saved again.',
                    '**Analytics** (optional): would be used to measure how the site is used. **No analytics tool is currently used.**',
                    '**Marketing** (optional): would be used for advertising or cross-site tracking. **No marketing or advertising tool is currently used.**',
                ],
                after: [
                    'The analytics and marketing switches exist for transparency and possible future use. Nothing in these categories runs without your consent. If we ever introduce such a tool, we will update this policy first and ask for your consent again.',
                ],
            },
            {
                id: 'storage-list',
                title: '6. List of stored items',
                paragraphs: [
                    'The table below lists every item the site stores on your device. "First party" means that {siteName} itself creates the item on its own domain; the item marked "Firebase (Google)" is created by the Google Firebase Authentication library to manage sign-in.',
                ],
                table: {
                    head: ['Name', 'Provider', 'Purpose', 'Category', 'Duration'],
                    rows: [
                        ['gdh-consent (localStorage)', 'First party', 'Stores your cookie and storage choice', 'Necessary', '12 months, or until you change it'],
                        ['firebaseLocalStorageDb (IndexedDB)', 'Firebase (Google)', 'Keeps you signed in (Firebase Authentication session)', 'Necessary', 'Until you sign out'],
                        ['gdh-api:v1:* (localStorage)', 'First party', 'Cache of game lists and API responses, so that pages load faster', 'Necessary', 'Up to a few hours, refreshed automatically'],
                        ['gdh-v1-* (Cache Storage, service worker)', 'First party', 'Offline app: cached pages, assets and images', 'Necessary', 'Until the app is updated or you clear it'],
                        ['gdh-lang (localStorage)', 'First party', 'The interface language you chose', 'Necessary (explicitly requested by you)', 'Until you change it'],
                        ['gdh-public-sync-<uid> (localStorage)', 'First party', 'Sync state of your public profile (avoids needless updates)', 'Necessary (functional)', 'Until cleared'],
                        ['gdh-level-<uid> (localStorage)', 'First party', 'The last level you have seen, so that the level-up animation is shown only once', 'Necessary (functional)', 'Until cleared'],
                        ['gdh-installed (localStorage)', 'First party', 'Notes that the app has been installed', 'Necessary (functional)', 'Until cleared'],
                        ['gdh-tierlist:<id> (localStorage)', 'First party', 'Draft of a tier list you are editing', 'Necessary (functional)', 'Until cleared'],
                        ['gdh-status-services:v1 (localStorage)', 'First party', 'Cached service status shown on the status page', 'Necessary (functional)', 'Until cleared'],
                        ['gdh-outage-reports (localStorage)', 'First party', 'Limits how often you can send outage reports', 'Necessary (functional)', 'Until cleared'],
                        ['dbdWikiCheck (localStorage)', 'First party', 'Remembers which Dead by Daylight wiki mirror is reachable (checked at most once a day)', 'Necessary (functional)', 'Until cleared'],
                        ['gdh-pc-specs (localStorage)', 'First party', 'Your PC specifications for system requirement checks while you are signed out', 'Necessary (functional)', 'Until cleared'],
                        ['gdh-price-cc (localStorage)', 'First party', 'The store price region you chose', 'Preferences', 'Until cleared or consent is withdrawn'],
                        ['gdh-lfg-contact (localStorage)', 'First party', 'The contact detail you last entered in a group search (LFG) post', 'Preferences', 'Until cleared or consent is withdrawn'],
                        ['gdh-visits (localStorage)', 'First party', 'Visit counter used to time the "install app" prompt', 'Preferences', 'Until cleared or consent is withdrawn'],
                        ['gdh-install-dismissed (localStorage)', 'First party', 'When you dismissed the "install app" prompt', 'Preferences', 'Until cleared or consent is withdrawn'],
                        ['gdh-push-prompt-dismissed (localStorage)', 'First party', 'When you dismissed the "enable notifications" prompt', 'Preferences', 'Until cleared or consent is withdrawn'],
                    ],
                },
            },
            {
                id: 'third-party',
                title: '7. Third-party cookies',
                paragraphs: [
                    'No third-party cookies are set while you browse {siteName}. There are no embedded players, social media plugins, advertising networks or tracking pixels.',
                    'Links lead to external sites such as game stores, YouTube or Twitch. Those sites can set their own cookies **only once you follow a link to them**, under their own policies, which we do not control.',
                    'Some content is loaded directly from third-party servers: game data from RAWG (api.rawg.io), and images from hosts such as media.rawg.io, Steam (steamstatic), TMDB (image.tmdb.org), Fandom (wikia) and the wsrv.nl image proxy. These requests set no cookies on this site, but like any web request they reveal your **IP address** to that server. Details are in the Privacy Policy (/privacy).',
                ],
            },
            {
                id: 'consent',
                title: '8. Giving, changing and withdrawing consent',
                paragraphs: [
                    'On your first visit a banner asks for your choice. Accepting all, rejecting all and choosing by category are offered with equal prominence. Until you decide, only necessary storage is used.',
                    'You can change or withdraw your consent at any time with this button: [[cookieSettings]]. The same link is available in the footer of every page. Withdrawal does not affect the lawfulness of storage before it; items of a refused category are deleted.',
                    'Your choice is stored in gdh-consent on this device and in this browser. We ask again **every 12 months**, and sooner if this policy changes materially (for example when a new tool or category is added). If you clear your browser data, or use another browser or device, the banner appears again.',
                ],
            },
            {
                id: 'clear-data',
                title: '9. Clearing stored data in your browser',
                paragraphs: [
                    'You can delete everything this site has stored at any time. This signs you out and removes cached data, and the banner appears again on your next visit.',
                ],
                list: [
                    '**Chrome (desktop and Android):** click the icon to the left of the address bar, open **Cookies and site data** (or **Site settings**) and delete the stored data.',
                    '**Firefox:** click the padlock icon in the address bar and choose **Clear cookies and site data**.',
                    '**Microsoft Edge:** click the padlock icon, open **Cookies and site data** and remove the data of this site.',
                    '**Safari (Mac):** **Settings > Privacy > Manage Website Data**, search for the site and click **Remove**.',
                    '**Safari (iPhone, iPad):** **Settings > Safari > Advanced > Website Data**, then swipe to delete the site.',
                ],
                after: [
                    'In some browsers, clearing "cookies" alone does not delete localStorage, IndexedDB or the offline cache, so choose the option that deletes all site data. Menu names may differ between browser versions. Uninstalling the installed app does not always remove its data, so clear the site data in the browser as well.',
                ],
            },
            {
                id: 'contact',
                title: '10. Contact',
                paragraphs: [
                    'If you have questions about this policy or about storage on your device, write to {email}, and we will answer without undue delay. You can also lodge a complaint with the supervisory authority of your place of residence or with the Hungarian data protection authority: {authorityName}, {authorityAddress}, email: {authorityEmail} (website: {authorityUrl}).',
                ],
            },
            {
                id: 'changes',
                title: '11. Changes and related documents',
                paragraphs: [
                    'We update this policy when the stored items or the tools we use change. The effective date at the top of the page shows the current version. If a change affects what you consented to, we ask for your consent again.',
                    'Related documents: the **Privacy Policy** (/privacy), which explains all processing of personal data, and the **Terms of Use** (/terms).',
                    'This policy is available in Hungarian, English and German. In case of any discrepancy, the Hungarian version prevails.',
                ],
            },
        ],
    },

    hu: {
        title: 'Süti (cookie) tájékoztató',
        intro: 'Ez a tájékoztató bemutatja, hogy a **{siteName}** ({website}) milyen adatokat tárol az Ön eszközén és olvas ki onnan, ezek mire szolgálnak, és hogyan rendelkezhet róluk. A tájékoztató az Adatkezelési tájékoztatót (/privacy) egészíti ki.',
        sections: [
            {
                id: 'about',
                title: '1. Kik vagyunk, és mire vonatkozik a tájékoztató',
                paragraphs: [
                    'A weboldalt **{operatorName}** ({address}, e-mail: {email}) üzemelteti (a továbbiakban: „üzemeltető” vagy „mi”). A tájékoztató a {website} weboldalra és az onnan telepíthető alkalmazásra (PWA) vonatkozik.',
                    'Nem használunk látogatottságmérő (analitikai), reklám- vagy követőeszközöket. Az alább ismertetett tárolás szinte teljes egészében a weboldal működéséhez szükséges, vagy olyan kényelmi funkció, amelyet Ön kikapcsolhat.',
                ],
            },
            {
                id: 'what-are-cookies',
                title: '2. Mik a sütik és a hasonló technológiák?',
                paragraphs: [
                    'A **sütik (cookie-k)** kis szöveges fájlok, amelyeket a weboldal az Ön böngészőjében helyez el, és a későbbi látogatásokkor visszaolvas. A **hasonló technológiák** ugyanezt a célt más módon érik el: adatot tárolnak az Ön eszközén (számítógépén, telefonján, táblagépén), vagy hozzáférnek az ott már tárolt adatokhoz.',
                ],
                list: [
                    '**localStorage (helyi tároló):** egyszerű kulcs–érték tároló a böngészőben, amely addig marad meg, amíg a weboldal vagy Ön nem törli.',
                    '**IndexedDB:** a böngészőbe épített adatbázis nagyobb, strukturált adatok tárolására.',
                    '**Cache Storage (gyorsítótár):** fájlok (oldalak, szkriptek, képek) másolatainak tárolója, hogy gyorsabban betöltődjenek, illetve internetkapcsolat nélkül is működjenek.',
                    '**Service worker:** a böngésző által ehhez a weboldalhoz a háttérben futtatott kis program, amely a gyorsítótárat kezeli, és – ha Ön engedélyezi – fogadja a push értesítéseket.',
                ],
                after: [
                    'A sütikkel ellentétben ezek az adatok nem kerülnek automatikusan a szerverre minden kéréssel; a böngészőben maradnak, hacsak a weboldal ki nem olvassa és fel nem használja őket.',
                ],
            },
            {
                id: 'what-we-use',
                title: '3. Mit használ ez a weboldal?',
                paragraphs: [
                    '**A {siteName} nem helyez el hagyományos sütiket.** Ehelyett localStorage-t, IndexedDB-t, Cache Storage-t és service workert használ, amelyeket a 6. pont sorol fel.',
                    'A jogi szabályozás nem függ a technológiától: a sütikre vonatkozó szabályok ugyanúgy alkalmazandók minden olyan esetre, amikor adatot tárolnak az Ön eszközén, vagy hozzáférnek az ott tárolt adathoz. Ebben a tájékoztatóban ezért a „süti” kifejezés mindezeket a technológiákat magában foglalja.',
                ],
            },
            {
                id: 'legal-framework',
                title: '4. Jogi háttér',
                list: [
                    '**Az elektronikus hírközlési adatvédelmi irányelv (2002/58/EK irányelv) 5. cikk (3) bekezdése**, amelyet Magyarországon **az elektronikus hírközlésről szóló 2003. évi C. törvény (Eht.) 155. § (4) bekezdése** ültet át: az Ön eszközén adatot tárolni vagy onnan adatot kiolvasni csak egyértelmű tájékoztatást követően adott hozzájárulása alapján lehet. Ez alól csak az a tárolás kivétel, amely a közlés továbbításához vagy az Ön által kifejezetten kért szolgáltatás nyújtásához **feltétlenül szükséges**.',
                    '**Az általános adatvédelmi rendelet (GDPR, (EU) 2016/679 rendelet)**: ha a tárolt adat Önre vonatkozik (például a bejelentkezési munkamenet), az személyes adatnak minősül. A hozzájárulásnak önkéntesnek, konkrétnak, megfelelő tájékoztatáson alapulónak és egyértelműnek kell lennie (4. cikk 11. pont és 7. cikk), és azt Ön bármikor ugyanolyan egyszerűen visszavonhatja, mint ahogyan megadta (7. cikk (3) bekezdés).',
                    '**Az Európai Adatvédelmi Testület (EDPB) hozzájárulásról szóló 05/2020. számú, valamint az 5. cikk (3) bekezdés technikai hatályáról szóló 2/2023. számú iránymutatása**: az elutasításnak ugyanolyan egyszerűnek kell lennie, mint az elfogadásnak, az előre bejelölt jelölőnégyzet nem hozzájárulás, és a weboldal használata nem tehető függővé a nem szükséges tárolás elfogadásától (nincs „süti-fal”).',
                ],
                after: [
                    'Ennek megfelelően a szükséges tárolást hozzájárulás nélkül alkalmazzuk, míg minden választható kategória **kikapcsolva marad, amíg Ön be nem kapcsolja**. A weboldal teljes egészében használható akkor is, ha minden választható kategóriát elutasít.',
                ],
            },
            {
                id: 'categories',
                title: '5. Kategóriák',
                list: [
                    '**Szükséges** (mindig aktív): olyan tárolás, amely nélkül a weboldal vagy az Ön által kért funkció nem működne, például a süti-választás rögzítése, a bejelentkezési munkamenet, az offline gyorsítótár, a kiválasztott nyelv és az Ön által használt funkciók működési állapota. A beállításokban nem kapcsolható ki, de a böngészőben törölheti (9. pont).',
                    '**Preferenciák** (választható): az eszközön megjegyzett kényelmi adatok, például az áruházi árak régiója, a csapatkereső (LFG) hirdetésben legutóbb megadott elérhetőség, valamint az, hogy mikor zárta be az „alkalmazás telepítése” vagy az „értesítések engedélyezése” ajánlatot. Ha ezt a kategóriát elutasítja vagy a hozzájárulását visszavonja, ezeket az elemeket töröljük, és többé nem mentjük.',
                    '**Analitika** (választható): a weboldal használatának mérésére szolgálna. **Jelenleg semmilyen analitikai eszközt nem használunk.**',
                    '**Marketing** (választható): hirdetésekhez vagy weboldalakon átívelő követéshez szolgálna. **Jelenleg semmilyen marketing- vagy reklámeszközt nem használunk.**',
                ],
                after: [
                    'Az analitikai és a marketing kapcsoló az átláthatóság és az esetleges jövőbeli használat miatt szerepel. Ezekben a kategóriákban semmi sem működik az Ön hozzájárulása nélkül. Ha valaha ilyen eszközt vezetnénk be, előbb frissítjük ezt a tájékoztatót, és újra kikérjük a hozzájárulását.',
                ],
            },
            {
                id: 'storage-list',
                title: '6. A tárolt elemek listája',
                paragraphs: [
                    'Az alábbi táblázat a weboldal által az Ön eszközén tárolt összes elemet tartalmazza. Az „első fél” azt jelenti, hogy az elemet maga a {siteName} hozza létre a saját domainjén; a „Firebase (Google)” jelölésű elemet a Google Firebase Authentication könyvtára hozza létre a bejelentkezés kezeléséhez.',
                ],
                table: {
                    head: ['Név', 'Szolgáltató', 'Cél', 'Kategória', 'Időtartam'],
                    rows: [
                        ['gdh-consent (localStorage)', 'Első fél', 'Az Ön süti- és tárolási választásának rögzítése', 'Szükséges', '12 hónap, vagy amíg meg nem változtatja'],
                        ['firebaseLocalStorageDb (IndexedDB)', 'Firebase (Google)', 'Bejelentkezve tartja Önt (Firebase Authentication munkamenet)', 'Szükséges', 'Kijelentkezésig'],
                        ['gdh-api:v1:* (localStorage)', 'Első fél', 'Játéklisták és API-válaszok gyorsítótára a gyorsabb betöltés érdekében', 'Szükséges', 'Legfeljebb néhány óra, automatikusan frissül'],
                        ['gdh-v1-* (Cache Storage, service worker)', 'Első fél', 'Offline alkalmazás: gyorsítótárazott oldalak, fájlok és képek', 'Szükséges', 'Az alkalmazás frissítéséig vagy az Ön általi törlésig'],
                        ['gdh-lang (localStorage)', 'Első fél', 'Az Ön által választott felületi nyelv', 'Szükséges (Ön által kifejezetten kért)', 'Amíg meg nem változtatja'],
                        ['gdh-public-sync-<uid> (localStorage)', 'Első fél', 'A nyilvános profil szinkronizálási állapota (a felesleges frissítések elkerülésére)', 'Szükséges (működési)', 'Törlésig'],
                        ['gdh-level-<uid> (localStorage)', 'Első fél', 'Az utoljára látott szint, hogy a szintlépési animáció csak egyszer jelenjen meg', 'Szükséges (működési)', 'Törlésig'],
                        ['gdh-installed (localStorage)', 'Első fél', 'Jelzi, hogy az alkalmazás telepítve van', 'Szükséges (működési)', 'Törlésig'],
                        ['gdh-tierlist:<id> (localStorage)', 'Első fél', 'Az Ön által szerkesztett tier lista piszkozata', 'Szükséges (működési)', 'Törlésig'],
                        ['gdh-status-services:v1 (localStorage)', 'Első fél', 'A státuszoldalon megjelenő szolgáltatásállapotok gyorsítótára', 'Szükséges (működési)', 'Törlésig'],
                        ['gdh-outage-reports (localStorage)', 'Első fél', 'Korlátozza, milyen gyakran küldhet üzemzavar-bejelentést', 'Szükséges (működési)', 'Törlésig'],
                        ['dbdWikiCheck (localStorage)', 'Első fél', 'Megjegyzi, hogy a Dead by Daylight wiki melyik tükroldala érhető el (legfeljebb naponta egyszer ellenőrizve)', 'Szükséges (működési)', 'Törlésig'],
                        ['gdh-pc-specs (localStorage)', 'Első fél', 'A számítógépe adatai a gépigény-ellenőrzéshez, ha nincs bejelentkezve', 'Szükséges (működési)', 'Törlésig'],
                        ['gdh-price-cc (localStorage)', 'Első fél', 'Az Ön által választott áruházi árrégió', 'Preferenciák', 'Törlésig vagy a hozzájárulás visszavonásáig'],
                        ['gdh-lfg-contact (localStorage)', 'Első fél', 'A csapatkereső (LFG) hirdetésben legutóbb megadott elérhetőség', 'Preferenciák', 'Törlésig vagy a hozzájárulás visszavonásáig'],
                        ['gdh-visits (localStorage)', 'Első fél', 'Látogatásszámláló az „alkalmazás telepítése” ajánlat időzítéséhez', 'Preferenciák', 'Törlésig vagy a hozzájárulás visszavonásáig'],
                        ['gdh-install-dismissed (localStorage)', 'Első fél', 'Mikor zárta be az „alkalmazás telepítése” ajánlatot', 'Preferenciák', 'Törlésig vagy a hozzájárulás visszavonásáig'],
                        ['gdh-push-prompt-dismissed (localStorage)', 'Első fél', 'Mikor zárta be az „értesítések engedélyezése” ajánlatot', 'Preferenciák', 'Törlésig vagy a hozzájárulás visszavonásáig'],
                    ],
                },
            },
            {
                id: 'third-party',
                title: '7. Harmadik felek sütijei',
                paragraphs: [
                    'A {siteName} böngészése közben harmadik féltől származó sütik nem kerülnek elhelyezésre. Nincsenek beágyazott lejátszók, közösségimédia-bővítmények, reklámhálózatok vagy követőpixelek.',
                    'A hivatkozások külső weboldalakra vezetnek, például játékáruházakba, a YouTube-ra vagy a Twitch-re. Ezek a weboldalak **csak akkor helyezhetnek el saját sütiket, ha Ön a hivatkozást követve meglátogatja őket**, a saját szabályzatuk szerint, amelyre nincs ráhatásunk.',
                    'Egyes tartalmak közvetlenül harmadik felek szervereiről töltődnek be: játékadatok a RAWG-tól (api.rawg.io), képek pedig például a media.rawg.io, a Steam (steamstatic), a TMDB (image.tmdb.org), a Fandom (wikia) és a wsrv.nl képproxy szervereiről. Ezek a kérések nem helyeznek el sütit ezen a weboldalon, de mint minden webes kérés, felfedik az Ön **IP-címét** az adott szerver előtt. A részletek az Adatkezelési tájékoztatóban (/privacy) olvashatók.',
                ],
            },
            {
                id: 'consent',
                title: '8. A hozzájárulás megadása, módosítása és visszavonása',
                paragraphs: [
                    'Első látogatásakor egy sáv kéri a döntését. Az összes elfogadása, az összes elutasítása és a kategóriánkénti választás egyenlő hangsúllyal jelenik meg. Amíg nem dönt, csak a szükséges tárolás működik.',
                    'Hozzájárulását bármikor módosíthatja vagy visszavonhatja ezzel a gombbal: [[cookieSettings]]. Ugyanez a hivatkozás minden oldal láblécében is megtalálható. A visszavonás nem érinti az azt megelőző tárolás jogszerűségét; az elutasított kategória elemeit töröljük.',
                    'Választását ezen az eszközön és ebben a böngészőben a gdh-consent elem tárolja. **12 havonta** újra megkérdezzük, a tájékoztató lényeges változásakor (például új eszköz vagy kategória bevezetésekor) pedig korábban is. Ha törli a böngészőadatokat, vagy másik böngészőt, illetve eszközt használ, a sáv ismét megjelenik.',
                ],
            },
            {
                id: 'clear-data',
                title: '9. A tárolt adatok törlése a böngészőben',
                paragraphs: [
                    'A weboldal által tárolt összes adatot bármikor törölheti. Ezzel kijelentkezik, a gyorsítótárazott adatok törlődnek, és a következő látogatáskor ismét megjelenik a süti-sáv.',
                ],
                list: [
                    '**Chrome (asztali és Android):** kattintson a címsor bal oldalán lévő ikonra, nyissa meg a **Cookie-k és webhelyadatok** (vagy a **Webhelybeállítások**) menüt, és törölje a tárolt adatokat.',
                    '**Firefox:** kattintson a címsorban lévő lakat ikonra, és válassza a **Sütik és oldaladatok törlése** lehetőséget.',
                    '**Microsoft Edge:** kattintson a lakat ikonra, nyissa meg a **Cookie-k és webhelyadatok** menüt, és távolítsa el a weboldal adatait.',
                    '**Safari (Mac):** **Beállítások > Adatvédelem > Webhelyadatok kezelése**, keresse meg a weboldalt, majd kattintson az **Eltávolítás** gombra.',
                    '**Safari (iPhone, iPad):** **Beállítások > Safari > Haladó > Webhelyadatok**, majd húzással törölje a weboldalt.',
                ],
                after: [
                    'Egyes böngészőkben a „sütik” törlése önmagában nem törli a localStorage, az IndexedDB és az offline gyorsítótár tartalmát, ezért az összes webhelyadat törlését válassza. A menük elnevezése böngészőverziónként eltérhet. A telepített alkalmazás eltávolítása nem mindig törli az adatait, ezért a böngészőben is törölje a webhelyadatokat.',
                ],
            },
            {
                id: 'contact',
                title: '10. Kapcsolat',
                paragraphs: [
                    'Ha kérdése van ezzel a tájékoztatóval vagy az eszközén történő tárolással kapcsolatban, írjon a {email} címre, és indokolatlan késedelem nélkül válaszolunk. Panaszt tehet a lakóhelye szerinti felügyeleti hatóságnál vagy a magyar adatvédelmi hatóságnál is: {authorityName}, {authorityAddress}, e-mail: {authorityEmail} (honlap: {authorityUrl}).',
                ],
            },
            {
                id: 'changes',
                title: '11. Változások és kapcsolódó dokumentumok',
                paragraphs: [
                    'A tájékoztatót frissítjük, ha a tárolt elemek vagy az általunk használt eszközök megváltoznak. Az oldal tetején látható hatálybalépési dátum mutatja az aktuális változatot. Ha a változás azt érinti, amihez Ön hozzájárult, újra kikérjük a hozzájárulását.',
                    'Kapcsolódó dokumentumok: az **Adatkezelési tájékoztató** (/privacy), amely minden személyesadat-kezelést ismertet, valamint az **Általános Szerződési Feltételek** (/terms).',
                    'Ez a tájékoztató magyar, angol és német nyelven érhető el. Eltérés esetén a magyar nyelvű változat az irányadó.',
                ],
            },
        ],
    },

    de: {
        title: 'Cookie-Richtlinie',
        intro: 'Diese Cookie-Richtlinie erläutert, welche Informationen **{siteName}** ({website}) auf Ihrem Gerät speichert und dort ausliest, wozu die einzelnen Elemente dienen und wie Sie darüber bestimmen können. Sie ergänzt die Datenschutzerklärung (/privacy).',
        sections: [
            {
                id: 'about',
                title: '1. Wer wir sind und wofür diese Richtlinie gilt',
                paragraphs: [
                    'Die Website wird von **{operatorName}** ({address}, E-Mail: {email}) betrieben (im Folgenden „Betreiber“ oder „wir“). Diese Richtlinie gilt für die Website {website} und die dort installierbare App (PWA).',
                    'Wir verwenden keine Analyse-, Werbe- oder Tracking-Tools. Nahezu alles, was im Folgenden beschrieben wird, ist für den Betrieb der Website erforderlich oder eine Komfortfunktion, die Sie abschalten können.',
                ],
            },
            {
                id: 'what-are-cookies',
                title: '2. Was Cookies und ähnliche Technologien sind',
                paragraphs: [
                    '**Cookies** sind kleine Textdateien, die eine Website in Ihrem Browser ablegt und bei späteren Besuchen wieder ausliest. **Ähnliche Technologien** erfüllen denselben Zweck auf andere Weise: Sie speichern Daten auf Ihrem Endgerät (Computer, Smartphone, Tablet) oder greifen auf dort bereits gespeicherte Daten zu.',
                ],
                list: [
                    '**localStorage:** ein einfacher Schlüssel-Wert-Speicher im Browser, der erhalten bleibt, bis die Website oder Sie ihn löschen.',
                    '**IndexedDB:** eine im Browser integrierte Datenbank für größere, strukturierte Daten.',
                    '**Cache Storage:** ein Speicher für Kopien von Dateien (Seiten, Skripte, Bilder), damit diese schneller laden oder offline funktionieren.',
                    '**Service Worker:** ein kleines Skript, das der Browser für diese Website im Hintergrund ausführt; er verwaltet den Cache Storage und empfängt Push-Benachrichtigungen, sofern Sie diese aktivieren.',
                ],
                after: [
                    'Anders als Cookies werden diese Daten nicht automatisch mit jeder Anfrage an den Server gesendet; sie bleiben in Ihrem Browser, sofern die Website sie nicht ausliest und verwendet.',
                ],
            },
            {
                id: 'what-we-use',
                title: '3. Was diese Website verwendet',
                paragraphs: [
                    '**{siteName} setzt keine klassischen Cookies.** Stattdessen verwendet die Website localStorage, IndexedDB, Cache Storage und einen Service Worker, die in Abschnitt 6 aufgeführt sind.',
                    'Die Rechtslage hängt nicht von der Technik ab: Die Regeln für Cookies gelten ebenso für jede Speicherung von Informationen auf Ihrem Endgerät und jeden Zugriff darauf. In dieser Richtlinie umfasst der Begriff „Cookie“ daher alle diese Technologien.',
                ],
            },
            {
                id: 'legal-framework',
                title: '4. Rechtlicher Rahmen',
                list: [
                    '**Art. 5 Abs. 3 der ePrivacy-Richtlinie (Richtlinie 2002/58/EG)**, in Ungarn umgesetzt durch **§ 155 Abs. 4 des Gesetzes Nr. C von 2003 über die elektronische Kommunikation (Eht.)**: Informationen dürfen nur mit Ihrer Einwilligung, die nach klarer Information erteilt wurde, auf Ihrem Endgerät gespeichert oder von dort ausgelesen werden. Ausgenommen ist nur eine Speicherung, die für die Übertragung einer Nachricht oder für die Bereitstellung eines von Ihnen ausdrücklich gewünschten Dienstes **unbedingt erforderlich** ist.',
                    '**Datenschutz-Grundverordnung (DSGVO, Verordnung (EU) 2016/679)**: Beziehen sich gespeicherte Daten auf Sie (etwa Ihre Anmeldesitzung), handelt es sich um personenbezogene Daten. Eine Einwilligung muss freiwillig, für den bestimmten Fall, in informierter Weise und unmissverständlich erfolgen (Art. 4 Nr. 11 und Art. 7), und Sie können sie jederzeit so einfach widerrufen, wie Sie sie erteilt haben (Art. 7 Abs. 3).',
                    '**Leitlinien 05/2020 zur Einwilligung und 2/2023 zum technischen Anwendungsbereich von Art. 5 Abs. 3 des Europäischen Datenschutzausschusses (EDSA)**: Ablehnen muss so einfach sein wie Zustimmen, vorausgewählte Kästchen sind keine Einwilligung, und der Zugang zur Website darf nicht von der Zustimmung zu nicht erforderlicher Speicherung abhängen (keine „Cookie-Wall“).',
                ],
                after: [
                    'Dementsprechend wird notwendige Speicherung ohne Einwilligung genutzt, während jede optionale Kategorie **ausgeschaltet bleibt, bis Sie sie aktivieren**. Sie können die gesamte Website auch dann nutzen, wenn Sie alle optionalen Kategorien ablehnen.',
                ],
            },
            {
                id: 'categories',
                title: '5. Kategorien',
                list: [
                    '**Notwendig** (immer aktiv): Speicherung, ohne die die Website oder eine von Ihnen gewünschte Funktion nicht funktionieren würde, etwa die Aufzeichnung Ihrer Cookie-Auswahl, Ihre Anmeldesitzung, der Offline-Cache, die gewählte Sprache und der Arbeitsstand der von Ihnen genutzten Funktionen. Sie lässt sich in den Einstellungen nicht abschalten, kann aber in Ihrem Browser gelöscht werden (Abschnitt 9).',
                    '**Präferenzen** (optional): Komfortdaten, die auf diesem Gerät gespeichert werden, etwa Ihre Preisregion für Shops, die zuletzt in einem Gruppensuche-Beitrag (LFG) eingegebene Kontaktangabe und der Zeitpunkt, zu dem Sie die Hinweise „App installieren“ oder „Benachrichtigungen aktivieren“ geschlossen haben. Wenn Sie diese Kategorie ablehnen oder Ihre Einwilligung widerrufen, werden diese Elemente gelöscht und nicht erneut gespeichert.',
                    '**Statistik** (optional): würde der Messung der Websitenutzung dienen. **Derzeit wird kein Analyse-Tool eingesetzt.**',
                    '**Marketing** (optional): würde für Werbung oder websiteübergreifendes Tracking genutzt. **Derzeit wird kein Marketing- oder Werbe-Tool eingesetzt.**',
                ],
                after: [
                    'Die Schalter für Statistik und Marketing sind aus Gründen der Transparenz und für eine mögliche künftige Nutzung vorhanden. In diesen Kategorien läuft nichts ohne Ihre Einwilligung. Sollten wir jemals ein solches Tool einführen, aktualisieren wir zuvor diese Richtlinie und bitten Sie erneut um Ihre Einwilligung.',
                ],
            },
            {
                id: 'storage-list',
                title: '6. Liste der gespeicherten Elemente',
                paragraphs: [
                    'Die folgende Tabelle führt alle Elemente auf, die die Website auf Ihrem Gerät speichert. „Erstanbieter“ bedeutet, dass {siteName} das Element selbst auf der eigenen Domain anlegt; das mit „Firebase (Google)“ gekennzeichnete Element wird von der Bibliothek Google Firebase Authentication zur Verwaltung der Anmeldung angelegt.',
                ],
                table: {
                    head: ['Name', 'Anbieter', 'Zweck', 'Kategorie', 'Speicherdauer'],
                    rows: [
                        ['gdh-consent (localStorage)', 'Erstanbieter', 'Speichert Ihre Cookie- und Speicherauswahl', 'Notwendig', '12 Monate oder bis Sie sie ändern'],
                        ['firebaseLocalStorageDb (IndexedDB)', 'Firebase (Google)', 'Hält Sie angemeldet (Sitzung von Firebase Authentication)', 'Notwendig', 'Bis zur Abmeldung'],
                        ['gdh-api:v1:* (localStorage)', 'Erstanbieter', 'Cache für Spielelisten und API-Antworten, damit Seiten schneller laden', 'Notwendig', 'Bis zu einigen Stunden, automatisch aktualisiert'],
                        ['gdh-v1-* (Cache Storage, Service Worker)', 'Erstanbieter', 'Offline-App: zwischengespeicherte Seiten, Dateien und Bilder', 'Notwendig', 'Bis zur Aktualisierung der App oder bis Sie ihn löschen'],
                        ['gdh-lang (localStorage)', 'Erstanbieter', 'Die von Ihnen gewählte Sprache der Oberfläche', 'Notwendig (von Ihnen ausdrücklich gewünscht)', 'Bis Sie sie ändern'],
                        ['gdh-public-sync-<uid> (localStorage)', 'Erstanbieter', 'Synchronisierungsstand Ihres öffentlichen Profils (vermeidet unnötige Aktualisierungen)', 'Notwendig (funktional)', 'Bis zur Löschung'],
                        ['gdh-level-<uid> (localStorage)', 'Erstanbieter', 'Zuletzt gesehene Stufe, damit die Level-up-Animation nur einmal erscheint', 'Notwendig (funktional)', 'Bis zur Löschung'],
                        ['gdh-installed (localStorage)', 'Erstanbieter', 'Vermerkt, dass die App installiert wurde', 'Notwendig (funktional)', 'Bis zur Löschung'],
                        ['gdh-tierlist:<id> (localStorage)', 'Erstanbieter', 'Entwurf einer Tier-Liste, die Sie gerade bearbeiten', 'Notwendig (funktional)', 'Bis zur Löschung'],
                        ['gdh-status-services:v1 (localStorage)', 'Erstanbieter', 'Zwischengespeicherter Dienststatus für die Statusseite', 'Notwendig (funktional)', 'Bis zur Löschung'],
                        ['gdh-outage-reports (localStorage)', 'Erstanbieter', 'Begrenzt, wie oft Sie Störungsmeldungen senden können', 'Notwendig (funktional)', 'Bis zur Löschung'],
                        ['dbdWikiCheck (localStorage)', 'Erstanbieter', 'Merkt sich, welcher Spiegel des Dead by Daylight-Wikis erreichbar ist (höchstens einmal täglich geprüft)', 'Notwendig (funktional)', 'Bis zur Löschung'],
                        ['gdh-pc-specs (localStorage)', 'Erstanbieter', 'Ihre PC-Daten für den Abgleich mit Systemanforderungen, solange Sie nicht angemeldet sind', 'Notwendig (funktional)', 'Bis zur Löschung'],
                        ['gdh-price-cc (localStorage)', 'Erstanbieter', 'Die von Ihnen gewählte Preisregion für Shops', 'Präferenzen', 'Bis zur Löschung oder zum Widerruf der Einwilligung'],
                        ['gdh-lfg-contact (localStorage)', 'Erstanbieter', 'Die zuletzt in einem Gruppensuche-Beitrag (LFG) eingegebene Kontaktangabe', 'Präferenzen', 'Bis zur Löschung oder zum Widerruf der Einwilligung'],
                        ['gdh-visits (localStorage)', 'Erstanbieter', 'Besuchszähler, um den Hinweis „App installieren“ passend anzuzeigen', 'Präferenzen', 'Bis zur Löschung oder zum Widerruf der Einwilligung'],
                        ['gdh-install-dismissed (localStorage)', 'Erstanbieter', 'Zeitpunkt, zu dem Sie den Hinweis „App installieren“ geschlossen haben', 'Präferenzen', 'Bis zur Löschung oder zum Widerruf der Einwilligung'],
                        ['gdh-push-prompt-dismissed (localStorage)', 'Erstanbieter', 'Zeitpunkt, zu dem Sie den Hinweis „Benachrichtigungen aktivieren“ geschlossen haben', 'Präferenzen', 'Bis zur Löschung oder zum Widerruf der Einwilligung'],
                    ],
                },
            },
            {
                id: 'third-party',
                title: '7. Cookies von Drittanbietern',
                paragraphs: [
                    'Beim Besuch von {siteName} werden keine Cookies von Drittanbietern gesetzt. Es gibt keine eingebetteten Player, Social-Media-Plugins, Werbenetzwerke oder Tracking-Pixel.',
                    'Links führen zu externen Websites wie Spiele-Shops, YouTube oder Twitch. Diese Websites können **erst dann eigene Cookies setzen, wenn Sie einem Link dorthin folgen**, und zwar nach ihren eigenen Richtlinien, auf die wir keinen Einfluss haben.',
                    'Einige Inhalte werden direkt von Servern Dritter geladen: Spieldaten von RAWG (api.rawg.io) sowie Bilder etwa von media.rawg.io, Steam (steamstatic), TMDB (image.tmdb.org), Fandom (wikia) und dem Bild-Proxy wsrv.nl. Diese Anfragen setzen keine Cookies auf dieser Website, übermitteln aber wie jede Webanfrage Ihre **IP-Adresse** an den jeweiligen Server. Einzelheiten finden Sie in der Datenschutzerklärung (/privacy).',
                ],
            },
            {
                id: 'consent',
                title: '8. Einwilligung erteilen, ändern und widerrufen',
                paragraphs: [
                    'Bei Ihrem ersten Besuch fragt ein Banner nach Ihrer Entscheidung. Alles akzeptieren, alles ablehnen und die Auswahl nach Kategorien werden gleichwertig angeboten. Solange Sie nicht entschieden haben, wird nur notwendige Speicherung genutzt.',
                    'Sie können Ihre Einwilligung jederzeit mit dieser Schaltfläche ändern oder widerrufen: [[cookieSettings]]. Derselbe Link befindet sich in der Fußzeile jeder Seite. Der Widerruf berührt nicht die Rechtmäßigkeit der bis dahin erfolgten Speicherung; Elemente einer abgelehnten Kategorie werden gelöscht.',
                    'Ihre Auswahl wird auf diesem Gerät und in diesem Browser im Element gdh-consent gespeichert. Wir fragen **alle 12 Monate** erneut, bei wesentlichen Änderungen dieser Richtlinie (etwa wenn ein neues Tool oder eine neue Kategorie hinzukommt) auch früher. Wenn Sie Ihre Browserdaten löschen oder einen anderen Browser oder ein anderes Gerät verwenden, erscheint das Banner erneut.',
                ],
            },
            {
                id: 'clear-data',
                title: '9. Gespeicherte Daten im Browser löschen',
                paragraphs: [
                    'Sie können alle von dieser Website gespeicherten Daten jederzeit löschen. Dadurch werden Sie abgemeldet, zwischengespeicherte Daten werden entfernt, und beim nächsten Besuch erscheint das Banner erneut.',
                ],
                list: [
                    '**Chrome (Desktop und Android):** Klicken Sie auf das Symbol links neben der Adressleiste, öffnen Sie **Cookies und Websitedaten** (oder **Website-Einstellungen**) und löschen Sie die gespeicherten Daten.',
                    '**Firefox:** Klicken Sie auf das Schloss-Symbol in der Adressleiste und wählen Sie **Cookies und Website-Daten löschen**.',
                    '**Microsoft Edge:** Klicken Sie auf das Schloss-Symbol, öffnen Sie **Cookies und Websitedaten** und entfernen Sie die Daten dieser Website.',
                    '**Safari (Mac):** **Einstellungen > Datenschutz > Websitedaten verwalten**, suchen Sie die Website und klicken Sie auf **Entfernen**.',
                    '**Safari (iPhone, iPad):** **Einstellungen > Safari > Erweitert > Websitedaten**, dann die Website per Wischgeste löschen.',
                ],
                after: [
                    'In manchen Browsern entfernt das Löschen von „Cookies“ allein weder localStorage noch IndexedDB oder den Offline-Cache; wählen Sie daher die Option, die alle Websitedaten löscht. Die Menübezeichnungen können je nach Browserversion abweichen. Das Deinstallieren der installierten App entfernt deren Daten nicht immer; löschen Sie daher auch die Websitedaten im Browser.',
                ],
            },
            {
                id: 'contact',
                title: '10. Kontakt',
                paragraphs: [
                    'Bei Fragen zu dieser Richtlinie oder zur Speicherung auf Ihrem Gerät schreiben Sie an {email}, wir antworten unverzüglich. Sie können sich auch bei der Aufsichtsbehörde Ihres Wohnorts oder bei der ungarischen Datenschutzbehörde beschweren: {authorityName}, {authorityAddress}, E-Mail: {authorityEmail} (Website: {authorityUrl}).',
                ],
            },
            {
                id: 'changes',
                title: '11. Änderungen und weitere Dokumente',
                paragraphs: [
                    'Wir aktualisieren diese Richtlinie, wenn sich die gespeicherten Elemente oder die eingesetzten Tools ändern. Das Datum oben auf der Seite zeigt die aktuelle Fassung. Betrifft eine Änderung das, wozu Sie eingewilligt haben, bitten wir Sie erneut um Ihre Einwilligung.',
                    'Weitere Dokumente: die **Datenschutzerklärung** (/privacy), die alle Verarbeitungen personenbezogener Daten erläutert, und die **Nutzungsbedingungen** (/terms).',
                    'Diese Richtlinie ist auf Ungarisch, Englisch und Deutsch verfügbar. Bei Abweichungen ist die ungarische Fassung maßgeblich.',
                ],
            },
        ],
    },
};
