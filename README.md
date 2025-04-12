# Game Data Hub

A **Game Data Hub** egy webalkalmazás, amely lehetővé teszi a felhasználók számára, hogy felfedezzék és felfedezzék a videojátékokat, részletes játékinformációkat tekintsenek meg, és játékokat vásároljanak különböző online boltokból. A platform emellett felhasználói hitelesítést is tartalmaz, amely lehetővé teszi a felhasználók számára a bejelentkezést, kedvenc játékaik kezelését és személyre szabott ajánlásokat kapjanak.

## Bemutató:
Az alkalmazást itt érheted el: **[Game Data Hub](https://gamehub.hu/)**

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

---

## Alkalmazás Felépítése

### 1. **Body komponens (`Body.jsx`)**

A `Body` komponens a fő felhasználói felület, ahol a felhasználók böngészhetnek a játékok között és megtekinthetik azok részleteit.

#### Funkciók:
- Kategorizált játékok megjelenítése (Többjátékos, Sci-Fi, Akció stb.).
- Játékokra kattintva a részletes információk megtekintése.
- Hitelesítés és felhasználói műveletek kezelése (bejelentkezés/kijelentkezés, kedvencek hozzáadása).
- Külső áruházak listázása, ahol a játékok megvásárolhatók.

#### Főbb függvények:
- `categorizeGames()`: A játékokat különböző műfajok szerint kategorizálja.
- `showGameDetails()`: Megjeleníti a kiválasztott játék részletes adatait.
- `handleLogout()`: Kijelentkezteti a felhasználót az alkalmazásból.
- `openStoreUrl()`: Megnyit egy adott játékáruházat új böngészőfülön.

### 2. **Login komponens (`Login.jsx`)**

a `Login` komponens a felhasználói hitelesítésért felel.

#### Funkciók:
- Bejelentkezési űrlap e-mail és jelszó mezőkkel.
- Hibakezelés helytelen adatok esetén.
- Sikeres bejelentkezés után átirányítja a felhasználót.
- Regisztrációs oldalra mutató hivatkozás új felhasználók számára.

#### Főbb függvények:
- `login()`: A Firebase hitelesítési folyamatát kezeli.

---

## Tesztelési Stratégia

- **Egységtesztelés:** React komponensek tesztelése Jest segítségével.
- **Integrációs tesztelés:** API hívások és adatbázis-műveletek tesztelése.
- **Felhasználói elfogadási tesztelés:** Felhasználói tesztelés a használhatóság és élmény érdekében.

---

## Kihívások és Megoldások

- **Kihívás:** Az adatok szinkronizálása a frontend és backend között.
  - **Megoldás:** A React Context API és Firebase Firestore használata valós idejű frissítésekhez.
- **Kihívás:** Több áruház API integrálása, eltérő adatstruktúrákkal.
  - **Megoldás:** Egységesített függvények létrehozása az áruházi információk feldolgozásához és megjelenítéséhez.

---

## Jövőbeli Fejlesztések

- További szűrési lehetőségek hozzáadása a jobb játékfelfedezés érdekében.
- A felhasználói visszajelzések alapján a felhasználói felület és élmény fejlesztése.
- Több játékáruház integrálása a kínálat bővítéséhez.

---

## Közreműködés 

Szívesen fogadunk hozzájárulásokat a Game Data Hub projekthez! Így csatlakozhatsz:

1. **Töltsd** le a repót.
2. **Hozz** létre egy új branch-et a funkcióhoz vagy hibajavításhoz.
3. **Csináld** commitot és push-old a változtatásokat.
4. **Küldj** pull request-et a fő repóhoz.

Hogyan segíthetsz:
- Hibák jelentése és javítása.
- Új funkciók javaslata.
- Dokumentáció fejlesztése.
- Pull request-ek átnézése.


---

Ha bármilyen kérdésed vagy ötleted van, írj bátran! 🚀
