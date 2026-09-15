# Közösségi funkciók, app és értesítések – élesítés

Ez a leírás azokat a lépéseket tartalmazza, amik nélkül az új funkciók (értesítések, árfigyelő, könyvtár, csapatkereső stb.) nem működnek élesben. A kód kész, ezek fiók- és szerverbeállítások.

## 1. Firebase

### 1.1 Szolgáltatásfiók a backendnek (kötelező)
A backend ezzel írja az értesítéseket, futtatja az ütemezett feladatokat, és ezzel tárolja tartósan a review-kat és kedvenceket (eddig újraindításkor elvesztek).

1. Firebase console → **Project settings → Service accounts → Generate new private key**.
2. A letöltött JSON teljes tartalmát tedd a backend `FIREBASE_SERVICE_ACCOUNT` környezeti változójába (nyers JSON vagy base64).
3. Ezt a fájlt **ne** tedd gitbe.

### 1.2 Firestore szabályok és indexek (kötelező)
A repóban: `firestore.rules`, `firestore.indexes.json`, `firebase.json`.

- Konzolból: Firestore Database → Rules → másold be a `firestore.rules` tartalmát → Publish.
- Vagy CLI-ből: `firebase deploy --only firestore:rules,firestore:indexes`

Fontos változás: a `users/{uid}` dokumentumot ezután csak a tulajdonosa olvassa. Mások a karcsú `publicProfiles/{uid}` tükröt látják, amit az app magától szinkronizál, amikor a felhasználó belép. Privát profilnál a tükör törlődik.

Az indexfájl tartalma:
- `requests.uid` collection-group index. Ez a csapatkereső „Jelentkezéseim” füléhez kell. Nélküle is működik, csak több olvasással.
- `activity (uid, createdAt)` összetett index. Ez a hírfolyamhoz jó, de nem kötelező.

## 2. Backend (Render)

Add hozzá a Render dashboardon (Environment):

| Változó | Honnan | Kötelező? |
|---|---|---|
| `FIREBASE_SERVICE_ACCOUNT` | 1.1 pont | igen |
| `VAPID_PUBLIC_KEY` | a helyi `gamehub_backend-main/.env` fájlban már le van generálva | igen (push) |
| `VAPID_PRIVATE_KEY` | ugyanott; titkos, soha ne kerüljön a frontendbe | igen (push) |
| `VAPID_SUBJECT` | `mailto:` + kapcsolattartó e-mail | igen (push) |
| `CRON_SECRET` | a `.env`-ben generált véletlen érték | igen (ütemezés) |
| `STEAM_API_KEY` | https://steamcommunity.com/dev/apikey | a Steam könyvtár-importhoz |
| `ITAD_API_KEY` | https://isthereanydeal.com/apps/my/ | ártörténethez, történelmi mélyponthoz |

A `VAPID_PUBLIC_KEY` a frontendben is benne van tartalékként (`src/notifications/push.js`). Ha új kulcspárt generálsz, ott is cseréld le, különben a meglévő feliratkozások érvénytelenek lesznek.

Ezután **deployold újra a backendet**. A Renderen még a régi kód fut, így az új végpontok addig 404-et adnak. A frontend ezt kezeli: a funkciók elrejtik magukat, vagy a régi végpontokra esnek vissza.

## 3. Ütemezett feladatok

A backend 15 percenként magától lefuttatja az esedékes feladatokat, amíg ébren van:

| Feladat | Gyakoriság | Mit csinál |
|---|---|---|
| `priceAlerts` | 6 óra | árfigyelő értesítések |
| `freeGames` | 3 óra | új ingyenes játékok |
| `releaseReminders` | 6 óra | megjelenési emlékeztetők (1–3 nappal előtte és a megjelenés napján) |
| `subscriptionChanges` | 12 óra | új Game Pass játékok a kívánságlistán / backlogban lévőkhöz |
| `statusAlerts` | 15 perc | leállás-értesítés a követett szolgáltatásokra |

Az ingyenes Render példány elalszik, ezért van egy GitHub Actions workflow is: `.github/workflows/community-jobs.yml`. Ez 30 percenként felébreszti a szervert és lefuttatja a feladatokat. Beállítás: GitHub repo → Settings → Secrets and variables → Actions:
- `BACKEND_URL` = `https://gamehub-backend-zekj.onrender.com`
- `CRON_SECRET` = ugyanaz, mint a Renderen

Kézi futtatás: `curl -X POST -H "x-cron-key: <CRON_SECRET>" "<BACKEND_URL>/cron/run?job=freeGames"`

## 4. Frontend (Netlify)

Új környezeti változó nem kell. A `public/_headers` gondoskodik róla, hogy a `sw.js` (service worker) mindig friss legyen.

## 5. Letölthető app és értesítések – mi hol működik

| Eszköz | Telepítés | Push értesítés |
|---|---|---|
| Android (Chrome, Samsung Internet, Edge) | „Telepítés” gomb / banner | igen, bezárt apppal is |
| Windows / macOS (Chrome, Edge) | „App telepítése” a menüben | igen |
| iPhone / iPad (iOS 16.4+) | Safari → Megosztás → Főképernyőhöz adás | igen, de csak a telepített appban |
| Firefox asztali | nem telepíthető | igen (böngészőben) |

Tesztelés: jelentkezz be, nyisd meg az **Értesítések** oldalt (`/notifications`), kapcsold be a push-t, majd nyomd meg a **Teszt értesítés küldése** gombot. Ehhez már élesben kell futnia az 1.1 és a 2. pontnak.

## 6. Ellenőrzőlista élesítés után
- [ ] `GET <BACKEND_URL>/notify/config` → `{"push":true,"community":true,...}`
- [ ] `GET <BACKEND_URL>/cron/jobs` → 5 feladat
- [ ] Teszt értesítés megérkezik telefonra
- [ ] Profil mentése után megjelenik a `publicProfiles` kollekcióban a dokumentum
- [ ] `/lfg`-n létrehozható poszt, egy másik fiókkal lehet jelentkezni, és a tulaj értesítést kap
