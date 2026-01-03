# BeerCounter adatbázis terv (MariaDB)

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
- type (pl. sör, cider, stb.)
- abv (alkohol %)
- ...

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

## Ajánlott SQL példák

- Top users:
  ```sql
  SELECT user_id, SUM(count * quantity) AS total
  FROM entries
  GROUP BY user_id
  ORDER BY total DESC
  LIMIT 5;
  ```
- Autocomplete brands:
  ```sql
  SELECT id, name FROM brands WHERE name LIKE 'search%' LIMIT 10;
  ```
- User stat:
  ```sql
  SELECT SUM(count * quantity) FROM entries WHERE user_id = ?;
  ```

## Megjegyzés

- A fenti 3 tábla elég a legtöbb funkcióhoz (user, entry, brand).
- Indexekkel gyors lesz a toplista, autocomplete, statisztika.
- Segédtáblát csak akkor vezess be, ha a lekérdezések lassúak vagy speciális igény van.
