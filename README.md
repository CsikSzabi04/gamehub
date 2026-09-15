# Game Data Hub (*Fejlesztés alatt áll!*)

A **Game Data Hub** egy React alapú webalkalmazás, ahol videojátékokat fedezhetsz fel, megnézheted a részleteiket, értékeléseket írhatsz és olvashatsz, kedvenceket gyűjthetsz, és megtalálod, melyik online boltban érdemes megvenni őket. Mellette ingyenes játékok, akciók, giveaway-ek és játékhírek is megjelennek egy helyen.

## Bemutató
- Élő oldal: **[Game Data Hub](https://gamehub.hu/)**
- Prezentáció: **[Prezentáció GameDataHub](https://www.canva.com/design/DAGirN-tK6o/X0fcjagcc-oVixcVQAXJvA/edit?utm_content=DAGirN-tK6o&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton)**

![image](https://github.com/user-attachments/assets/1bd3da57-3ad9-499e-a424-28aca90275da)

---

## Funkciók

| Terület | Mit tud |
|---|---|
| **Főoldal** | Kiemelt játék hero szekció, featured játékok, műfaj szerinti karusszelek (Multiplayer, Action, Sci-fi, Exploration), ingyenes és akciós játékok, loot giveaway-ek, Steam és általános játékhírek, közösségi értékelések |
| **Keresés** | Név szerinti keresés a RAWG adatbázisban, lapozható találati lista. Bármelyik oldalról indítható: a keresés a főoldalra visz, és ott mutatja a találatokat |
| **Játék részletek** | Megjelenés dátuma, platformok, boltok, címkék, gépigény (minimum / ajánlott) |
| **Értékelések** | 1–5 csillagos review írása, játékonkénti és összesített review lista (`/review`, `/allreview/:id`) |
| **Steam / GOG játékoldal** | A friss bolti listák (Top sellers, New releases, GOG ...) játékai saját oldalt kapnak (`/game/steam/:appid`, `/game/gog/:id`): leírás, screenshotok, gépigény, aktív játékosok, Steam értékelések, hírek, részletek, kedvencek és GameDataHub review-k. A hiányzó adatokat RAWG-ból egészíti ki név és megjelenési év alapján |
| **Kedvencek** | Kedvencek hozzáadása és törlése, lista a fejlécben (bejelentkezés szükséges) |
| **Boltok** | CheapShark bolt lista, egy kattintással megnyitja a bolt oldalát |
| **Fiók** | Regisztráció, bejelentkezés (Firebase Auth) |
| **Profil** | Avatar és borítókép, bio, platformok és kedvenc műfajok, XP / szint rendszer, napi streak, badge-ek, saját review-k és kedvencek |
| **Extra oldalak** | Dead by Daylight karakter- és perk-böngésző (`/dbd`), filmajánló (`/movies`), Discover, Kapcsolat, ÁSZF, Adatvédelem |

---

## Használt technológiák

- **Frontend:** React 19, Vite 6, React Router 7, Tailwind CSS 4 (`@tailwindcss/vite`), Context API
- **Animációk:** Framer Motion, GSAP (DBD és Movies karusszelek), Lenis (smooth scroll), AOS
- **UI kiegészítők:** MUI (lapozó), React Icons, react-hot-toast
- **Hitelesítés és adatbázis:** Firebase Authentication, Firestore (felhasználói profilok)
- **Backend:** saját Node.js / Express API a Renderen (`https://gamehub-backend-zekj.onrender.com`), külön repóban
- **Külső API-k:** RAWG (játékadatok, keresés), CheapShark (boltok), FreeToGame, GamerPower, Epic Games (akciók), TMDB (filmek)
- **Tesztelés:** Vitest, React Testing Library, jsdom

---

## Architektúra

```
Böngésző (React SPA)
 ├─ Firebase Auth ──────────── bejelentkezés, regisztráció
 ├─ Firestore ──────────────── users/{uid}: profil, streak, XP adatok
 ├─ RAWG API ───────────────── keresés, játék részletek
 └─ Backend API (Render) ───── játéklista, boltok, ingyenes / akciós játékok,
                               hírek, loot, review-k, kedvencek, DBD, filmek
```

### Gyors betöltés
- **API cache (`src/Components/apiCache.js`):** a válaszokat memóriában és `localStorage`-ban tárolja (stale-while-revalidate), így visszatérő látogatónál azonnal megjelennek az adatok, a frissítés a háttérben történik.
- **Build-time snapshot (`scripts/snapshot.mjs`):** build közben a főoldal API válaszai a `public/api-snapshot/` mappába mentődnek. Első látogatáskor a snapshot és az élő API közül az nyer, amelyik hamarabb válaszol, így az alvó Render szerver nem blokkolja az oldalt.
- **Kód-szétválasztás:** a főoldal alatti szekciók és a többi oldal külön chunkokban töltődnek be (`React.lazy` + `LazySection`), amikor a felhasználó a közelükbe görget vagy odanavigál.

### Backend végpontok (a frontend által használtak)

| Végpont | Leírás |
|---|---|
| `GET /fetch-games` | Játéklista a főoldalhoz |
| `GET /stores` | CheapShark bolt lista |
| `GET /free`, `GET /discounted`, `GET /loot` | Ingyenes játékok, akciók, giveaway-ek |
| `GET /news`, `GET /getgamingnews` | Steam hírek, általános játékhírek |
| `GET /get-all-reviews`, `POST /submit-review` | Értékelések |
| `GET /getFav?userId=`, `POST /addfav`, `DELETE /delfav/:gameId` | Kedvencek |
| `GET /characters`, `GET /charactersK`, `GET /perksS/:név`, `GET /perksK/:név` | Dead by Daylight adatok |
| `GET /movies` | Filmajánló |
| `GET /hub/steam/app/:appid`, `GET /hub/gog/game/:id` | Egy Steam / GOG játék részletei (gépigénnyel) a játékoldalhoz |

---

## Projekt felépítése

```
gamehub-main/
├─ index.html
├─ vite.config.js          Vite + Tailwind + Vitest beállítások
├─ firebaseConfig.js       Firebase app + Firestore
├─ firebaseAuth.js         csak Firebase Auth (kisebb bundle)
├─ scripts/snapshot.mjs    API snapshot mentése build előtt
├─ public/                 képek (webp), api-snapshot, _redirects (Netlify SPA)
├─ TEST/                   automatizált tesztek (lásd lent)
└─ src/
   ├─ main.jsx             belépési pont (UserProvider, Lenis, AOS)
   ├─ App.jsx              útvonalak (lazy betöltött oldalak)
   ├─ Body.jsx             főoldal
   ├─ Header.jsx, Footer.jsx
   ├─ Components/          GameCard, LazySection, LazyImage, apiCache, useFetchOnVisible,
   │                       SectionHeader, ReviewsPanel, SystemRequirements, profile/*
   ├─ Features/            Search, SearchFind, Review, AllReview, SearchReview,
   │                       UserContext, StartUp, Contact ...
   ├─ Sections/            főoldali szekciók (MainSection, FeaturedGames, Free, Discounted,
   │                       Loot, News, GamingNews, ReviewsOpenMain, Discover ...)
   ├─ Rotate/              karusszel komponensek
   ├─ FeaturesByGame/      DBD/ és Movies/ aloldalak
   ├─ pages/               Login, SignUp, Profile, Notfound
   ├─ Stores/              bolt lista komponensek
   └─ TermsAndPrivacy/     ÁSZF és Adatvédelem
```

### Útvonalak

| Útvonal | Oldal |
|---|---|
| `/` | Főoldal |
| `/discover` | Felfedezés (teljes katalógus, ingyenes játékok, hírek) |
| `/review` | Közösségi értékelések, review írás |
| `/allreview/:gameId`, `/reviews/:gameId` | Játék oldal értékelésekkel |
| `/searchreview/:gameId` | Keresési találat részletei (RAWG) |
| `/game/steam/:appid`, `/game/gog/:id` | Steam / GOG játékoldal |
| `/login`, `/signup`, `/profile` | Fiók |
| `/dbd`, `/movies` | Extra aloldalak |
| `/contact`, `/terms`, `/privacy` | Információs oldalak |
| bármi más | 404 oldal |

---

## Telepítés és futtatás

### Előfeltételek
- [Node.js](https://nodejs.org/) 20 vagy újabb
- [pnpm](https://pnpm.io/) (vagy npm)

### Lépések

```bash
git clone <repo-url>
cd gamehub-main
pnpm install
pnpm dev
```

Az oldal ezután a `http://localhost:5173` címen érhető el.

### Parancsok

| Parancs | Mit csinál |
|---|---|
| `pnpm dev` | Fejlesztői szerver hot reloaddal |
| `pnpm build` | API snapshot mentése, majd production build a `dist/` mappába |
| `pnpm preview` | A buildelt oldal helyi kiszolgálása |
| `pnpm test` | Az összes teszt lefuttatása egyszer |
| `pnpm lint` | ESLint ellenőrzés |
| `pnpm snapshot` | Csak az API snapshot frissítése |

### Firebase beállítás (saját projekthez)

1. Hozz létre egy projektet a [Firebase Console](https://console.firebase.google.com/)-ban.
2. Kapcsold be az **Authentication** (Email/Password) és a **Firestore** szolgáltatást.
3. Írd át a konfigurációs adatokat a gyökérben lévő **`firebaseConfig.js`** és **`firebaseAuth.js`** fájlban:

    ```javascript
    export const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_AUTH_DOMAIN",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_STORAGE_BUCKET",
      messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
      appId: "YOUR_APP_ID"
    };
    ```

### Deploy
A projekt statikus oldalként deployolható (pl. Netlify). A `public/_redirects` fájl gondoskodik róla, hogy minden útvonal az `index.html`-re essen, így a React Router aloldalai frissítés után is működnek.

---

## Tesztelés

A tesztek a **`TEST/`** mappában vannak, **Vitest** + **React Testing Library** alapon, jsdom környezetben. A hálózati hívások és a Firebase mockolva vannak, így a tesztek internet és backend nélkül, gyorsan futnak.

```bash
pnpm test                  # összes teszt
npx vitest                 # watch mód
npx vitest run TEST/Login  # egy fájl
```

Jelenleg **17 tesztfájl, 159 teszt**:

| Fájl | Mit tesztel |
|---|---|
| `apiCache.test.js` | cache, párhuzamos kérések összevonása, localStorage, háttérfrissítés, snapshot verseny, `useApi` hook |
| `profileUtils.test.js` | szintek és XP, tier-ek, badge-ek, streak számítás (hónapváltásnál is), kép validáció |
| `searchRawgGames.test.js` | RAWG keresés: URL kódolás, mezők, árszűrés, hibakezelés |
| `Search.test.jsx` | debounce, Enter, üres keresés, hibaüzenet, navigáció más oldalakról |
| `SearchFind.test.jsx` | lapozás, oldalszám visszaállítás új keresésnél, linkek, placeholder kép, platform chipek |
| `GameCard.test.jsx` | megjelenítés, kattintás és Enter, a Reviews link nem nyitja a modalt |
| `Rotate.test.jsx` | automatikus és kézi léptetés, körbeérés, üres lista (NaN regresszió), átméretezés |
| `RotateGamingNews.test.jsx` | betöltés állapot, hír linkek, dátum/szerző, léptetés |
| `LazyLoading.test.jsx` | `LazySection`, `LazyImage`, `useFetchOnVisible` (IntersectionObserver mock) |
| `StartUp.test.jsx` | betöltő képernyő, progress, szlogenek, üdvözlő képernyő, timerek takarítása |
| `Stores.test.jsx` | bolt modal megnyitás/bezárás, API hiba kezelése |
| `DbdCards.test.jsx` | DBD karakter modal: fülek, lore fallback, perk lekérés (killer/survivor), hibák |
| `ShowMoviesCards.test.jsx` | film modal, hiányzó adatok, 18+ jelzés, görgetés tiltása |
| `StaticPages.test.jsx` | Footer linkek és e-mail cím, 404 oldal |
| `Login.test.jsx` | sikeres és hibás bejelentkezés, Enter, dupla küldés védelem |
| `SignUp.test.jsx` | jelszó ellenőrzés, fiók létrehozás, Firestore mentés, átirányítás, hibák |
| `UserContext.test.jsx` | auth állapot, profil betöltés és létrehozás, streak mentés, kijelentkezés |

A közös segédfüggvények (router wrapper, fetch és IntersectionObserver mock, teszt adatok) a `TEST/helpers.jsx` fájlban vannak.

![image](https://github.com/user-attachments/assets/2e777005-045a-4806-ac8c-7edc79061849)

---

## Kihívások és megoldások

- **Kihívás:** A Renderen futó backend inaktivitás után akár egy percig is ébredhet.
  - **Megoldás:** Perzisztens API cache és build-time snapshot, így a főoldal a szerver ébredése alatt is azonnal megjelenik.
- **Kihívás:** Több bolt és játék API eltérő adatszerkezettel.
  - **Megoldás:** A backend és a frontend egységes formára alakítja az adatokat, a komponensek pedig a hiányzó mezőket is kezelik.
- **Kihívás:** Nagy JavaScript bundle és lassú első betöltés.
  - **Megoldás:** Lazy betöltött oldalak és szekciók, külön vendor chunkok, webp képek.

---

## Ismert hiányosságok és tervek

- A keresési találatok ára jelenleg véletlenszerű (nincs még valódi árösszehasonlítás).
- A DBD oldal Perks füle üres, mert nincs hozzá backend végpont.
- A RAWG API kulcs a kliens kódban van; érdemes lenne a backenden keresztül hívni.
- Tervek: szűrés műfaj, értékelés és megjelenés szerint; több bolt integrálása; valódi árak.

---

## Készítők

- **Csík Szabolcs** – [GitHub](https://github.com/CsikSzabi04)
- **Balog Bence**
- **Furdan Milán**

## Közreműködés

1. Forkold a repót.
2. Hozz létre egy új branch-et a funkcióhoz vagy hibajavításhoz.
3. Futtasd a teszteket (`pnpm test`) és a lintet (`pnpm lint`).
4. Küldj pull requestet.

Hibajelentést, ötletet és dokumentáció-javítást is szívesen fogadunk.
