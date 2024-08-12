const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

const db = new sqlite3.Database('clicks.db', (err) => {
  if (err) {
    console.error(err);
  } else {
    console.log('Connected to the SQLite database.');

    db.run(`CREATE TABLE IF NOT EXISTS clicks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      click_count INTEGER
    )`);
  }
});

app.use(cors());
app.use(express.json());

app.post('/api/clicks', (req, res) => {
  const { user_id, click_count } = req.body;

  db.run(`INSERT INTO clicks (user_id, click_count) VALUES (?, ?)`, [user_id, click_count], (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error inserting data into the database');
    } else {
      res.status(201).send('Data inserted successfully');
    }
  });
});

app.get('/api/clicks', (req, res) => {
  db.all('SELECT * FROM clicks', (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error retrieving data from the database');
    } else {
      res.json(rows);
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
