const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const bcrypt = require('bcrypt');

(async () => {
    const db = await open({ filename: './school.db', driver: sqlite3.Database });

    // Create a hashed password
    // const hashedPassword = await bcrypt.hash('student123', 10);
    const hashedPassword = await bcrypt.hash('student234', 10);

    // Insert user
    const userResult = await db.run(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        // ['student1', hashedPassword, 'student']
        ['student2', hashedPassword, 'student']
 
    );

    // Insert student info (linked to user_id)
    await db.run(
        'INSERT INTO students (name, grades, user_id) VALUES (?, ?, ?)',
        // ['John Doe', 'A, B+, A-', userResult.lastID]
        ['Anne Sing', 'A, A, A', userResult.lastID]
    );

    console.log('Sample student and user added.');
})();
