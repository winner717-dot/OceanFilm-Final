
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const db = new sqlite3.Database("./oceanfilm.db");

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE, password TEXT)");
  db.run("CREATE TABLE IF NOT EXISTS favorites (userId INTEGER, tmdbId TEXT)");
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  bcrypt.hash(password, 10, (err, hash) => {
    db.run("INSERT INTO users (email, password) VALUES (?, ?)", [email, hash], function(err) {
      if (err) return res.json({ success: false });
      res.json({ success: true, userId: this.lastID });
    });
  });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (!user) return res.json({ success: false });
    bcrypt.compare(password, user.password, (err, result) => {
      if (result) res.json({ success: true, userId: user.id });
      else res.json({ success: false });
    });
  });
});

app.post("/favorites", (req, res) => {
  const { userId, tmdbId } = req.body;
  db.run("INSERT INTO favorites (userId, tmdbId) VALUES (?, ?)", [userId, tmdbId], err => {
    if (err) return res.status(500).json({ error: "Errore" });
    res.json({ success: true });
  });
});

app.get("/favorites/:userId", (req, res) => {
  db.all("SELECT tmdbId FROM favorites WHERE userId = ?", [req.params.userId], (err, rows) => {
    if (err) return res.status(500).json([]);
    res.json(rows.map(r => r.tmdbId));
  });
});

app.listen(3000, () => console.log("OceanFilm backend avviato su http://localhost:3000"));

app.get("/admin/users", (req, res) => {
  db.all("SELECT id, email FROM users", (err, rows) => {
    if (err) return res.status(500).json([]);
    res.json(rows);
  });
});

app.get("/admin/favorites", (req, res) => {
  db.all("SELECT userId, tmdbId FROM favorites", (err, rows) => {
    if (err) return res.status(500).json([]);
    res.json(rows);
  });
});
