const pool = require("./pool")

async function seedNotices() {
  try {
    const connection = await pool.getConnection()

    // Seed the ÁSZF notice (version 1)
    await connection.query(`
      INSERT IGNORE INTO notices (notice_key, version, title, content, button_text) VALUES (
        'aszf', 1, 'Felhasználási feltételek',
        'FELHASZNÁLÁSI FELTÉTELEK\n\nEz az oldal kizárólag szórakoztató célokat szolgál barátok körében.\n\n1. NEM ÖSZTÖNZÉS ALKOHOLFOGYASZTÁSRA\nEz az oldal nem ösztönöz senkit alkohol fogyasztására. A BeerCounter egy vicces, informális nyilvántartó barátok között – semmi több.\n\n2. MIRE JÓ AZ OLDAL?\nBeírod hány sört ittál, mikor és milyen alkalomból. Van toplista és megjegyzés funkció is. Ez az egész lényege.\n\n3. ADATAID\n• Az e-mail-cím megadása kötelező a regisztrációhoz, de semmilyen más célra nem használjuk.\n• A jelszavad titkosítva (hash-elve) tárolódik – mi sem látjuk.\n\n4. FELELŐSSÉG\nA weboldal üzemeltetője nem vállal felelősséget az oldal tartalmából, használatából vagy az azon rögzített adatokból eredő következményekért.\n\nAzzal, hogy regisztrálsz, elfogadod ezeket a feltételeket.',
        'Elfogadom'
      )
    `)

    // Seed the BeerCounter 1.1 update notice
    await connection.query(`
      INSERT IGNORE INTO notices (notice_key, version, title, content, button_text) VALUES (
        'release-1.1', 1, 'BeerCounter 1.1 - Frissítés',
        'BeerCounter 1.1\n\nÚj funkciók és fejlesztések:\n\n🆕 Toplista bővítve\n• Új "Összes felhasználó" oldal a teljes rangsorral\n• Részletes statisztikák megjelenítése\n\n🆕 Top sórlista bővítve\n• Sörmegoszlás dedikált oldal\n• Globális és személyes nézet\n• Részletes adatok és grafikonok\n\n🐛 Bug fixek\n• Több kisebb hiba javítása\n• Teljesítmény optimalizálások\n\nKöszönjük a visszajelzéseket!',
        'OK'
      )
    `)

    connection.release()
    console.log("Notices seeded successfully")
  } catch (error) {
    console.error("Notices seed error:", error)
    process.exit(1)
  }
}

module.exports = seedNotices
