const sqlite3 = require("sqlite3").verbose();
const express = require("express");

const app = express();

app.set("view engine", "ejs");

let db = new sqlite3.Database("data/thedatabase.db", (err) => {
    if (err) {
        console.error(err)
    };
    
});