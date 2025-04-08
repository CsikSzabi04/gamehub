# Game Data Hub

A **Game Data Hub** egy webalkalmazás, amely lehetővé teszi a felhasználók számára, hogy felfedezzék és felfedezzék a videojátékokat, részletes játékinformációkat tekintsenek meg, és játékokat vásároljanak különböző online boltokból. A platform emellett felhasználói hitelesítést is tartalmaz, amely lehetővé teszi a felhasználók számára a bejelentkezést, kedvenc játékaik kezelését és személyre szabott ajánlásokat kapjanak.

## Bemutató:
Az alkalmazást itt érheted el: **[Game Data Hub](https://gamdatahub.netlify.app/)**

---

## Jellemzők

- **Keresés**: Böngéssz a játékok hatalmas listájában, melyek műfajok szerint vannak kategorizálva, mint például Akció, Sci-Fi, Multiplayer és még sok más.
- **Felhasználói hitelesítés**: A felhasználók bejelentkezhetnek adataikkal, és válogathatnak kedvenc játékaik között.
- **Játék leírás**: Részletes információkat szerezhetnek meg minden játékról, beleértve a számítógép igényt és a leírást.
- **Kedvenc játékok**: Jelöld meg kedvenc játékaidat, hogy könnyedén nézdhesd meg őket később.
- **Boltintegráció**:  Elérheted a különböző online boltokat, ahol játékokat vásárolhatsz.
- **Keresési funkció**: Kereshetsz játékokat név szerint, és felfedezheted a játékok kategóriáit és műfajait.
- **Reszponzív dizájn**: A platform teljesen reszponzív és optimalizált asztali és mobil eszközök használatára is.

---

## Használt technologiák

- **Frontend:** React, TailwindCSS, React Router, Context API
- **Backend:** Node.js, Express.js (API hívásokhoz és játékadatok kezeléséhez)
- **Adatbázis:** Firebase Firestore (felhasználói hitelesítéshez és kedvencek kezeléséhez)
- **Külső API-k:** Játékadatok API a játék részleteinek és bolt információinak lekérésére
- **Verziókezelés:** Git & GitHub

---

## Rendszer áttekintés

### Alap architektúra
- **Frontend:** React alapú, UI megjelenítést és API hívásokat kezel.
- **Backend:** Express.js API, amely lekéri a játékadatokat és a felhasználói preferenciákat.
- **Adatbázis:** Firebase Firestore a hitelesítéshez és a kedvenc játékok tárolásához.
- **Külső API-k:** Külső játékadatbázisok és bolt API-k integrálása valós idejű információkhoz.
