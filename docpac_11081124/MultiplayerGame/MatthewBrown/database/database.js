const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database/data.db');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        uid INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        clicks INTEGER NOT NULL DEFAULT 0
    )`);
});

module.exports = db;