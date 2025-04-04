const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const bcrypt = require('bcrypt');

(async () => {
    const db = await open({ filename: './school.db', driver: sqlite3.Database });

    // Create a hashed password
    const hashedPassword = await bcrypt.hash('teacher123', 10);

    // Insert user
    const userResult = await db.run(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        ['teacher1', hashedPassword, 'teacher']
 
    );

    console.log('Sample teacher added.');
})();
