const Database = require("better-sqlite3");
const db = new Database("./absences.sqlite");

db.prepare(`
    CREATE TABLE IF NOT EXISTS absences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT,
        username TEXT,
        raison TEXT,
        dateRetour TEXT,
        heureRetour TEXT,
        status TEXT,
        validePar TEXT
    )
`).run();

module.exports = db;
