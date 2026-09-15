# GameDataHub – fejlesztési ötletek a közösségnek

Ez a dokumentum azt gyűjti össze, milyen új funkciókkal lehetne a GameDataHubot olyan oldallá tenni, ahova a gamerek **rendszeresen visszajárnak**, mert valódi problémát old meg nekik: pénzt spórol, időt spórol, csapattársat talál, vagy megmondja, hogy egy játék megéri-e.

Az ötletek a jelenlegi kódra épülnek (React + Firebase + Render backend + hub API-k), és mindegyiknél ott van, **miért fontos**, **mire lehet építeni**, és **mekkora munka** (S = pár nap, M = 1–2 hét, L = több hét).

---

## Megvalósítás állapota (2026-09-15)

A 2. pont (magyar felirat/magyarítás) és a magyar nyelvű felület kivételével minden ötlet el van készítve a kódban. A fordítást egy másik munkamenet végzi. Élesítéshez a `COMMUNITY_SETUP.md` lépései kellenek: Firebase szolgáltatásfiók, Render környezeti változók, backend újradeployolása, Firestore szabályok.

| # | Funkció | Hol |
|---|---|---|
| 1 | Árfigyelő, ártörténet, történelmi mélypont | játékoldal oldalsáv, `/alerts` |
| 3 | Elfut a gépemen? + gép megadása | játékoldal, profil szerkesztése |
| 4 | Csapattárs-kereső | `/lfg` |
| 5 | Ingyenes játékok visszaszámlálóval + értesítés | `/free-games` |
| 6 | Játékkönyvtár, Steam import, Wrapped | `/library`, játékoldal gomb |
| 7 | Game Pass kínálat és badge | `/subscriptions`, játékoldal |
| 8 | Steam Deck / ProtonDB | játékoldal badge |
| 9 | Új review rendszer (hasznos szavazat, részletek, spoiler, jelentés) + tartós tárolás | játékoldal |
| 10 | Megjelenési naptár, emlékeztetők, .ics export | `/calendar`, játékoldal gomb |
| 11 | Nyilvános profil, követés, hírfolyam, ranglista | `/u/:név`, `/feed`, `/leaderboard` |
| 12 | Szerverstátusz, közösségi hibajelentés, patch notes | `/status` |
| 13 | Mire számíts + akadálymentesség + közösségi szavazás | játékoldal |
| 14 | Tier listák, DBD buildek | `/tierlist`, `/builds` |
| 15 | Havi kihívások és jelvények | `/challenges` |
| 16 | Letölthető app (PWA), push értesítések telefonra is, értesítési központ | csengő a fejlécben, `/notifications`, `/community` |

---

## Ami már megvan (kiindulópont)

- Főoldal: featured, műfaji karusszelek, ingyenes/akciós játékok, loot giveaway-ek, hírek
- `/hub`: bolti toplisták, akciók (Steam, GOG, ITAD), Coming soon, legtöbbet játszott, speedrunok, game universe oldalak (Valorant, LoL, CS2, Elden Ring …)
- Steam / GOG játékoldal: leírás, screenshot, gépigény, aktív játékosok, Steam értékelések
- Review-k (1–5 csillag), kedvencek
- Profil: avatar, bio, platformok, műfajok, XP / szint, streak, badge-ek
- DBD karakter- és perk-böngésző, filmajánló

Ami **hiányzik**: értesítések, játékosok közötti kapcsolat (barátok, csapatkeresés), nyilvános profilok, magyar nyelvű felület és magyar-specifikus információk, PWA / mobil app élmény.

---

## Összefoglaló – mi hozná a legtöbbet

| # | Funkció | Kinek segít | Méret | Prioritás |
|---|---|---|---|---|
| 1 | Árfigyelő és árriasztás a kedvencekre | mindenkinek, aki akcióra vár | M | ⭐⭐⭐ |
| 2 | „Van magyar felirat / magyarítás?” jelölés | magyar játékosok | S–M | ⭐⭐⭐ |
| 3 | „Elfut a gépemen?” gépigény-ellenőrző | PC-s játékosok | M | ⭐⭐⭐ |
| 4 | Csapattárs-kereső (LFG) | multiplayer játékosok | L | ⭐⭐⭐ |
| 5 | Ingyenes játék értesítő (Epic, GamerPower) | mindenkinek | S–M | ⭐⭐⭐ |
| 6 | Játékkönyvtár / backlog tracker + Steam import | aki sokat vásárol, keveset játszik | M–L | ⭐⭐ |
| 7 | Előfizetés-kereső (Game Pass, PS Plus, EA Play) | konzolos és PC-s előfizetők | M | ⭐⭐ |
| 8 | Steam Deck / Linux kompatibilitás (ProtonDB) | Steam Deck tulajok | S | ⭐⭐ |
| 9 | Jobb review-k (hasznos szavazat, játékidő, spoiler) | olvasók és írók | M | ⭐⭐ |
| 10 | Megjelenési naptár emlékeztetővel | várt játékokra készülők | M | ⭐⭐ |
| 11 | Nyilvános profil, követés, aktivitás feed | közösségépítés | M | ⭐⭐ |
| 12 | Szerver státusz és patch notes figyelő | online játékosok | M | ⭐ |
| 13 | Akadálymentességi és „gyanús tartalom” infó | fogyatékkal élők, szülők | M | ⭐ |
| 14 | Közösségi tier listák, buildek, tippek | kompetitív játékosok | L | ⭐ |
| 15 | Közösségi kihívások, versenyek, havi események | aktív tagok | M | ⭐ |
| 16 | PWA + push értesítések, magyar nyelvű felület | mindenkinek (alap) | M | alap |

---

## 1. Árfigyelő és árriasztás ⭐⭐⭐

**Mi ez:** A kedvencekhez a felhasználó beállíthat egy célárat („szólj, ha 5000 Ft alá megy”). Az oldal figyeli az árakat, és értesít, ha teljesül. A játékoldalon látszik az **ártörténet grafikon** és a **történelmi legalacsonyabb ár**.

**Miért fontos:** A gamerek nagy része akcióra vár. Az „ez most jó ár, vagy volt már olcsóbb?” kérdés az egyik leggyakoribb, és erre jelenleg máshova kell menni (IsThereAnyDeal, SteamDB).

**Mire építhető:**
- A backend már használja az ITAD-ot (`/itad/deals` a [DealsHub.jsx](src/Hub/DealsHub.jsx)-ben) – az ITAD API ad ártörténetet és historical low-t is.
- Kedvencek már vannak (`/getFav`, `/addfav`) – ezt kell kiegészíteni egy `targetPrice` mezővel.
- Árellenőrzés: napi cron job a backenden (Render cron vagy GitHub Actions), értesítés e-mailben / push-ban / Discord webhookon.

**Extra ötletek:**
- „Ez a legjobb ár az elmúlt 1 évben” badge a kártyákon
- Ár HUF-ban is (régiós Steam árak, árfolyamváltással)
- Figyelmeztetés key reseller boltoknál (kulcsárusok kockázata)

**Méret:** M

---

## 2. Magyar felirat / magyarítás jelölés ⭐⭐⭐

**Mi ez:** Minden játéknál egyértelmű jelzés: **van-e hivatalos magyar felirat vagy szinkron**, és ha nincs, **létezik-e rajongói magyarítás** (link a forrásra). Szűrő a keresőben: „csak magyar nyelvű játékok”.

**Miért fontos:** Ez az egyik legnagyobb hiánypótló funkció magyar játékosoknak – sokan (főleg fiatalabbak, szülők) csak magyarul játszanak, és ezt most több oldalon kell összevadászni. Egy nemzetközi oldal ezt soha nem fogja jól megcsinálni, ezért ez a GameDataHub egyedi előnye lehet.

**Mire építhető:**
- A Steam `appdetails` válaszban benne van a `supported_languages` mező – a `/hub/steam/app/:appid` végpont már lehívja, csak meg kell jeleníteni és feldolgozni.
- Rajongói magyarítások: közösségi beküldés (Firestore kollekció, moderálással), link a magyarítást készítő csoport oldalára.

**Méret:** S (Steam adat) + M (közösségi magyarítás adatbázis)

---

## 3. „Elfut a gépemen?” gépigény-ellenőrző ⭐⭐⭐

**Mi ez:** A profilban a felhasználó megadja a gépét (CPU, GPU, RAM, oprendszer). A játékoldalon a gépigény mellett megjelenik: ✅ ajánlott felett / ⚠️ minimum és ajánlott között / ❌ minimum alatt.

**Miért fontos:** Vásárlás előtti legfontosabb kérdés PC-n, és a gépigény-táblázatot a legtöbben nem tudják értelmezni („jobb-e az RTX 3060 mint a GTX 1080?”).

**Mire építhető:**
- Már van [SystemRequirements.jsx](src/Components/SystemRequirements.jsx) – ez jeleníti meg a min/ajánlott gépigényt.
- Profil adatok Firestore-ban (`users/{uid}`) – ide jön egy `pcSpecs` objektum, a szerkesztés az [EditProfileModal.jsx](src/Components/profile/EditProfileModal.jsx)-be.
- Kell egy hardver-pontszám tábla (GPU/CPU benchmark értékek JSON-ban), és egy parser, ami a gépigény szövegből kiszedi a hardver neveket.

**Extra:** A profilban nyilvánosan megjeleníthető „Setup” kártya – a gamerek szeretik megmutatni a gépüket.

**Méret:** M

---

## 4. Csapattárs-kereső (LFG – Looking For Group) ⭐⭐⭐

**Mi ez:** Hirdetőfal, ahol játékosok csapattársat keresnek: játék, platform, rang, nyelv (magyar!), időpont, mikrofon igen/nem, játékstílus (casual / ranked). Jelentkezés gombbal, Discord névvel.

**Miért fontos:** A multiplayer játékok legnagyobb fájdalma a random csapattársak. Magyar nyelvű, magyar idősávban játszó csapattársat találni különösen nehéz. Ez hozza vissza napi szinten az embereket.

**Mire építhető:**
- A game universe oldalak (`/hub/:id` – Valorant, LoL, CS2, Fortnite, Overwatch 2 …) természetes helyei egy „Csapatot keresek” fülnek.
- Firestore kollekció (`lfgPosts`), automatikus lejárat (pl. 24 óra), valós idejű lista `onSnapshot`-tal.
- Discord OAuth bejelentkezés opcióként – a gamerek ott vannak.

**Figyelni kell:** moderálás, jelentés gomb, spam/scam szűrés, kiskorúak védelme (ne legyen publikus elérhetőség, csak az app-on belüli kapcsolatfelvétel).

**Méret:** L

---

## 5. Ingyenes játék értesítő ⭐⭐⭐

**Mi ez:** Értesítés, amikor új ingyenes játék érhető el (Epic heti ingyenes, Steam free weekend, Prime Gaming, GamerPower giveaway), lejárati visszaszámlálóval. A felhasználó bejelölheti, hogy „megszereztem”.

**Miért fontos:** Az ingyenes játékokat rendszeresen elfelejtik az emberek, és utólag bosszankodnak. Egyszerű, de nagyon hasznos – és jó ok arra, hogy valaki feliratkozzon.

**Mire építhető:**
- Már van `/free` és `/loot` végpont (FreeToGame, GamerPower, Epic akciók), és ezek meg is jelennek a főoldalon.
- Hiányzik: lejárati idő kiemelése, értesítés (push / e-mail / **Discord bot vagy webhook**), „megszereztem” lista a profilban.

**Méret:** S (visszaszámláló, jelölés) – M (értesítések)

---

## 6. Játékkönyvtár és backlog tracker ⭐⭐

**Mi ez:** A kedvencek listát egy teljes könyvtárrá bővíteni státuszokkal: *Játszom*, *Kijátszottam*, *Abbahagytam*, *Backlog*, *Kívánságlista*. Mellette **HowLongToBeat** idő („kb. 25 óra végigjátszani”), és **Steam könyvtár importálás**.

**Miért fontos:** A „shame pile” (megvett, de sosem játszott játékok) nagyon ismert jelenség. A tracker segít dönteni, mivel játsszon valaki, és statisztikát ad („idén 12 játékot vittél végig”).

**Mire építhető:**
- Kedvencek végpontok és a profil oldal ([Profile.jsx](src/pages/Profile.jsx)) már megvannak.
- Steam OpenID bejelentkezés + `GetOwnedGames` API (játékidő is jön vele).
- Az XP rendszerbe ([profileUtils.js](src/Components/profile/profileUtils.js), `XP_RULES`) be lehet kötni: pl. „Kijátszottál egy játékot: +50 XP”.
- Év végi összefoglaló („GameDataHub Wrapped”) – megosztható kép a közösségi médiára.

**Méret:** M (státuszok) – L (Steam import, statisztikák)

---

## 7. Előfizetés-kereső (Game Pass, PS Plus, EA Play, Ubisoft+) ⭐⭐

**Mi ez:** A játékoldalon jelzés: „Benne van a Game Pass Ultimate-ben”, „Hamarosan kikerül a Game Passból”. Külön oldal: mi jön be / mi megy ki ebben a hónapban.

**Miért fontos:** Sokan feleslegesen veszik meg azt, ami már benne van az előfizetésükben, vagy lemaradnak róla, mielőtt kikerül.

**Mire építhető:** Nincs hivatalos nyilvános API mindenhez; Xbox katalógus endpointok, közösségi adatforrások vagy saját, heti frissítésű JSON (a meglévő `scripts/snapshot.mjs` mintájára).

**Méret:** M

---

## 8. Steam Deck / Linux kompatibilitás ⭐⭐

**Mi ez:** Steam Deck Verified / Playable / Unsupported jelvény és ProtonDB értékelés (Platinum, Gold …) a Steam játékoldalon.

**Miért fontos:** A Steam Deck és a handheld PC-k (ROG Ally, Legion Go) tulajdonosainak ez az első kérdés vásárlás előtt.

**Mire építhető:** ProtonDB summary API (`/api/v1/reports/summaries/{appid}.json`), Steam Deck compatibility adat – a `/hub/steam/app/:appid` backend végpontba beköthető, a [StoreGamePage.jsx](src/Features/StoreGamePage.jsx) jeleníti meg.

**Méret:** S

---

## 9. Jobb review rendszer ⭐⭐

**Mi ez:** A mostani csillagos review bővítése:
- „Hasznos volt?” szavazás, rendezés hasznosság szerint
- Játékidő és platform megadása („40 órát játszottam, PS5-ön”)
- Pro / kontra lista
- Spoiler jelölés (elrejtett szöveg)
- Jelentés gomb, moderálás
- Szempontok szerinti értékelés: grafika, történet, optimalizáció, ár/érték

**Miért fontos:** A gamerek nem egy átlagpontszámra kíváncsiak, hanem arra, hogy „jól fut-e”, „megéri-e teljes áron”, „van-e benne pay-to-win”. Minél hitelesebbek a review-k, annál inkább ide jönnek olvasni.

**Mire építhető:** `/submit-review`, `/get-all-reviews`, [ReviewsPanel.jsx](src/Components/ReviewsPanel.jsx), [useGameCommunity.js](src/Features/useGameCommunity.js).

**Technikai megjegyzés:** a `useGameCommunity` jelenleg az **összes** review-t lehívja és a kliensen szűr – szavazással és több review-val ezt érdemes backend oldali `?gameId=` szűrésre és lapozásra cserélni.

**Méret:** M

---

## 10. Megjelenési naptár emlékeztetővel ⭐⭐

**Mi ez:** Havi / heti naptárnézet a közelgő megjelenésekről, platform és műfaj szűrővel. „Emlékeztess” gomb: értesítés a megjelenés napján, és ha elérhető az előrendelés vagy az első akció.

**Miért fontos:** A várt játékokat követni kell, és a dátumok gyakran csúsznak – az emlékeztető a csúszást is jelezheti.

**Mire építhető:** A [ComingSoon.jsx](src/Hub/ComingSoon.jsx) már listázza a közelgő játékokat (Steam, IGDB provider), ezt kell naptárnézetbe rendezni. Exportálás Google Naptárba (`.ics` fájl).

**Méret:** M

---

## 11. Nyilvános profilok, követés, aktivitás feed ⭐⭐

**Mi ez:** Jelenleg a `/profile` csak a saját profilt mutatja. Kell egy nyilvános profil URL (`/u/:felhasználónév`), követés, és egy feed: „X írt egy review-t”, „Y kijátszotta az Elden Ringet”, „Z elérte a 10. szintet”.

**Miért fontos:** A közösség attól lesz közösség, hogy látják egymást. A meglévő XP / badge / streak rendszer csak akkor motivál igazán, ha mások is látják.

**Mire építhető:** Firestore `users/{uid}` profil már megvan; kell `username` egyediség, `followers` / `following` kapcsolat, adatvédelmi beállítás (nyilvános / csak követők / privát).

**Extra:** Heti ranglista (legtöbb XP, leghasznosabb reviewer), szezonális badge-ek.

**Méret:** M

---

## 12. Szerver státusz és patch notes figyelő ⭐

**Mi ez:** „Le van állva a szerver?” oldal a népszerű online játékokhoz (Steam, Riot, Epic, PSN, Xbox Live), közösségi bejelentéssel („nekem sem megy” gomb). A kedvenc játékok patch notes-ai egy helyen, rövid összefoglalóval.

**Miért fontos:** Amikor nem indul a játék, az első dolog, hogy az ember megnézi, mindenkinek rossz-e. A patch notes-okat pedig senki nem olvassa végig, de mindenki tudni akarja, mi változott (nerf / buff).

**Mire építhető:** Steam hírek már vannak (`/news`, a játékoldalon is), a game universe oldalak (Valorant, LoL …) már hívják a játékok saját API-jait – több ilyen API ad státusz információt is (pl. Riot status API).

**Méret:** M

---

## 13. Akadálymentességi és „mire számíts” információk ⭐

**Mi ez:** Játékonként gyors áttekintés:
- Akadálymentesség: színvak mód, felirat méret, gombok átállíthatósága, nehézségi opciók
- PEGI korhatár és tartalomleírás (szülőknek)
- Mikrotranzakciók, loot boxok, pay-to-win elemek
- Kernel szintű anti-cheat, állandó internetkapcsolat igény, kötelező külső launcher / fiók

**Miért fontos:** Ezek az infók szétszórva vannak, de vásárlásnál sokaknak döntőek. Az anti-cheat és a kötelező online kapcsolat különösen gyakori panasz.

**Mire építhető:** Steam `appdetails` (kategóriák, content descriptors, DRM megjegyzések), RAWG `esrb_rating`, a többi közösségi beküldéssel (a review űrlapba építve: „Van benne pay-to-win? igen/nem”).

**Méret:** M

---

## 14. Közösségi tier listák, buildek, tippek ⭐

**Mi ez:** Játékonként közösség által szavazott tier listák (karakterek, fegyverek, agentek), mentett buildek, rövid tippek kezdőknek.

**Miért fontos:** Kompetitív játékoknál ez az egyik leggyakrabban keresett tartalom.

**Mire építhető:**
- A DBD oldal már listázza a karaktereket és perkeket ([DbdApp.jsx](src/FeaturesByGame/DBD/DbdApp.jsx)) – egy **perk build készítő + megosztás link** gyors első lépés.
- A game universe oldalak adatai (Valorant agentek, LoL championok, Hearthstone kártyák) alapul szolgálhatnak a tier listákhoz.

**Méret:** L

---

## 15. Közösségi kihívások és események ⭐

**Mi ez:** Havi kihívások („Írj 3 review-t indie játékokról”, „Játssz egy 2010 előtti játékkal”), közösségi versenyek, közös játékestek, nyereményjátékok (kulcsok a partnerboltoktól). Speciális badge a teljesítésért.

**Miért fontos:** Az XP rendszer már megvan, de célok nélkül hamar unalmas lesz. Az események adják a visszatérés okát.

**Mire építhető:** `XP_RULES` és badge rendszer a [profileUtils.js](src/Components/profile/profileUtils.js)-ben, speedrun feed ([SpeedrunFeed.jsx](src/Hub/SpeedrunFeed.jsx)) – közösségi speedrun kihívás is lehet belőle.

**Méret:** M

---

## 16. Alapok, amik több funkcióhoz is kellenek

Ezek önmagukban nem látványosak, de az 1., 4., 5., 10. és 11. pont nélkülük nem működik jól.

### PWA + push értesítések
- Jelenleg nincs manifest és service worker. PWA-val telepíthető lenne telefonra (az oldal már hirdeti a mobil appot, [Mobile.jsx](src/Sections/Mobile.jsx)), és működnének a push értesítések.
- Firebase Cloud Messaging a már használt Firebase projektre építhető.
- Értesítési beállítások a profilban: mit, milyen csatornán (push / e-mail / Discord).

### Magyar nyelvű felület
- A felület jelenleg angol (`<html lang="en">`), a README és a célközönség magyar. Kétnyelvű felület (`react-i18next`) nagyban növelné a magyar közösség elérését, és jobb lenne a magyar Google találatokhoz is.

### Discord integráció
- Discord bejelentkezés, és egy GameDataHub Discord bot: ingyenes játékok, akciók, árriasztások csatornákba. A gamer közösségek Discordon élnek – oda kell vinni az értesítéseket.

### Moderálás és biztonság
- Minden közösségi funkcióhoz (review, LFG, magyarítás beküldés) kell: jelentés gomb, admin felület, alap szűrés (csúnya szavak, linkek), rate limit a backend végpontokon.
- Firestore security rules felülvizsgálata, mielőtt a nyilvános profilok és a követés élesedik.

### Backend stabilitás
- A Render ingyenes szerver alszik, ezt a snapshot megoldás a főoldalon áthidalja, de az értesítésekhez és árfigyeléshez **folyamatosan futó ütemezett feladatok** kellenek (fizetős Render instance, vagy Cloud Functions / GitHub Actions cron).

---

## Javasolt sorrend

**1. fázis – gyors, látványos nyerések (1–2 hét)**
- Steam Deck / ProtonDB jelvény (8.)
- Magyar felirat jelölés Steam adatokból (2. első fele)
- Ingyenes játékok lejárati visszaszámláló + „megszereztem” (5. első fele)
- Történelmi legalacsonyabb ár megjelenítése (1. első fele)

**2. fázis – alapok (2–4 hét)**
- PWA + push értesítések, értesítési beállítások
- Magyar nyelvű felület
- Review lekérdezés szűrése backend oldalon

**3. fázis – visszatérést hozó funkciók (1–2 hónap)**
- Árriasztás a kedvencekre (1.)
- Gépigény-ellenőrző (3.)
- Játékkönyvtár / backlog (6.)
- Megjelenési naptár emlékeztetővel (10.)

**4. fázis – közösség (2+ hónap)**
- Nyilvános profilok és követés (11.)
- Csapattárs-kereső (4.) moderálással
- Jobb review rendszer (9.)
- Közösségi magyarítás adatbázis (2. második fele)
- Kihívások, tier listák, események (14., 15.)
