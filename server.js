const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const db = new sqlite3.Database('./database.sqlite');

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize database
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        movieId INTEGER,
        rating INTEGER,
        comment TEXT
    )`);
});

// Serve index.html and movie.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/movie.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'movie.html'));
});

// API endpoints
app.get('/api/comments/:movieId', (req, res) => {
    const movieId = req.params.movieId;
    db.all('SELECT * FROM comments WHERE movieId = ?', [movieId], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ comments: rows });
    });
});

app.post('/api/comments', (req, res) => {
    const { movieId, rating, comment } = req.body;
    db.run('INSERT INTO comments (movieId, rating, comment) VALUES (?, ?, ?)', [movieId, rating, comment], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID });
    });
});

app.delete('/api/comments/:id', (req, res) => {
    const id = req.params.id;
    db.run('DELETE FROM comments WHERE id = ?', [id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ deleted: this.changes });
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
