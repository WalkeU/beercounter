## Fejlesztői környezet (dev)

- **Indítás:**
  docker-compose -f docker-compose.dev.yml up --build

  - Fejlesztői környezet indítása, konténerek építése és futtatása.

- **Leállítás:**
  docker-compose -f docker-compose.dev.yml down

  - Konténerek leállítása, adatok megőrzésével.

- **Leállítás volume-okkal:**
  docker-compose -f docker-compose.dev.yml down -v
  - Konténerek és minden adat (volume) törlése.

## Éles környezet (prod)

- **Indítás:**
  docker-compose -f docker-compose.prod.yml up --build

  - Éles környezet indítása, konténerek építése és futtatása.

- **Leállítás:**
  docker-compose -f docker-compose.prod.yml down

  - Konténerek leállítása, adatok megőrzésével.

- **Leállítás volume-okkal:**
  docker-compose -f docker-compose.prod.yml down -v
  - Konténerek és minden adat (volume) törlése.
