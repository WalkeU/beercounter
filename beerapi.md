# Beer API rövid útmutató

## createEntry

- POST `/api/beer/entry`
- Body: `{ count, brand, comment, quantity }`
- Válasz: létrehozott bejegyzés adatai vagy státusz

## deleteEntry

- DELETE `/api/beer/entry/:entryId`
- Válasz: törlés státusz

## getBrands

- GET `/api/beer/brands?search=...&limit=...`
- Válasz: `[ { brandName, ... }, ... ]` (autocomplete tömb)

## getEntries

- GET `/api/beer/myentries?username=...&limit=...&offset=...`
- Válasz: paginált bejegyzéslista

## getRecentEntries

- GET `/api/beer/recent?limit=...&offset=...`
- Válasz: paginált legfrissebb bejegyzések

## getGlobalStats

- GET `/api/beer/stats`
- Válasz: összesített statisztika (pl. összes megivott, összespénz, brand%)

## getUserStats

- GET `/api/beer/userstats?username=...`
- Válasz: adott user statisztikái

## getAllUsers

- GET `/api/beer/alluser?limit=...&offset=...`
- Válasz: paginált userlista

## getTopUsers

- GET `/api/beer/top`
- Válasz: top 5 user tömb (név, count)

---

Minden válasz JSON, hibák esetén hibaüzenet/státusz. Paginált válaszoknál: tömb + total (összes elem száma).
