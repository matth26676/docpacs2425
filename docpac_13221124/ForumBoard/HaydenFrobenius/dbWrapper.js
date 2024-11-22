const sqlite3 = require('sqlite3').verbose();

function run(db, sql, params) {
    return new Promise(async (resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            resolve(this.lastID);
        });
    });
}

function get(db, sql, params) {
    return new Promise(async (resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            resolve(row);
        });
    });
}

function all(db, sql, params) {
    return new Promise(async (resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            resolve(rows);
        });
    });
}

module.exports = {
    run,
    get,
    all,
}