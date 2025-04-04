const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
require('dotenv').config();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true }));

let db;
(async () => {
    db = await open({ filename: './school.db', driver: sqlite3.Database });
    await db.exec(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT
    )`);
    await db.exec(`CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        grades TEXT,
        user_id INTEGER,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);
})();

app.get('/', (req, res) => {
    res.send('<form action="/login" method="post">Username: <input name="username"><br>Password: <input type="password" name="password"><br><button type="submit">Login</button></form>');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await db.get('SELECT * FROM users WHERE username = ?', username);
    if (user && await bcrypt.compare(password, user.password)) {
        req.session.user_id = user.id;
        req.session.role = user.role;
        if (user.role === 'student') return res.redirect('/student');
        if (user.role === 'teacher') return res.redirect('/teacher');
        if (user.role === 'admin') return res.redirect('/admin');
    }
    res.redirect('/');
});

app.get('/student', async (req, res) => {
    if (!req.session.user_id || req.session.role !== 'student') return res.redirect('/');
    const student = await db.get('SELECT * FROM students WHERE user_id = ?', req.session.user_id);
    res.send(`<h1>Welcome, ${student.name}</h1><p>Your Grades: ${student.grades}</p>`);
});

app.get('/teacher', async (req, res) => {
    if (!req.session.user_id || req.session.role !== 'teacher') return res.redirect('/');
    const students = await db.all('SELECT * FROM students');
    res.send(`<h1>Student Records</h1><ul>${students.map(s => `<li>${s.name}: ${s.grades}</li>`).join('')}</ul>`);
});

app.get('/admin', async (req, res) => {
    if (!req.session.user_id || req.session.role !== 'admin') return res.redirect('/');
    const users = await db.all('SELECT * FROM users');
    res.send(`<h1>Manage Users</h1><ul>${users.map(u => `<li>${u.username} - ${u.role}</li>`).join('')}</ul>`);
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/'));
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
