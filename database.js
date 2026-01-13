const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./gtm.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS gtms (
      passaporte TEXT PRIMARY KEY,
      posto TEXT,
      nome TEXT,
      funcao TEXT,
      pontos INTEGER DEFAULT 0,
      horas REAL DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS avisos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      texto TEXT,
      data TEXT
    )
  `);
});

module.exports = db;
