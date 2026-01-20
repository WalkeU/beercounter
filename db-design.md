## Fő táblák

### users

- id (PK, AUTO_INCREMENT)
- username (UNIQUE)
- password_hash
- email
- created_at

### brands

- id (PK, AUTO_INCREMENT)
- name (UNIQUE)
- abv (alkohol %)
- price (INT)
- quanity

### entries

- id (PK, AUTO_INCREMENT)
- user_id (FK -> users.id)
- brand_id (FK -> brands.id)
- count (INT)
- quantity (FLOAT, alap 0.5)
- comment (TEXT)
- created_at (DATETIME)

## Indexek, gyorsítás

- `entries(user_id)` — user statokhoz
- `entries(brand_id)` — brand statokhoz, autocomplete
- `entries(created_at)` — legfrissebb bejegyzésekhez
- `brands(name)` — autocomplete/search

## Segédtáblák

- Nem szükséges, ha csak aggregált statisztikák kellenek (összes, top, ranglista, autocomplete). Ezeket SQL-lel gyorsan lehet lekérni, ha jók az indexek.
- Ha extrém nagy adatmennyiség vagy bonyolult toplisták, lehet materializált view vagy cache tábla (pl. top users, brand statok), de első körben nem szükséges.
