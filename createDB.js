// createDB.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Define the path to the database file
const dbPath = path.join(__dirname, 'mySurveyDB.db');

// Open a connection to the database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        return;
    }
    console.log('Database connected successfully.');
});

// SQL command to create the survey table
const createTableSQL = `
CREATE TABLE IF NOT EXISTS survey (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fname TEXT,
    sname TEXT,
    email TEXT,
    date TEXT NOT NULL,
    q1 INTEGER,
    q2 INTEGER,
    q3 INTEGER,
    colour TEXT,
    comment TEXT
)
`;

// Execute the SQL command
db.run(createTableSQL, (err) => {
    if (err) {
        console.error('Error creating table:', err.message);
    } else {
        console.log('Survey table created successfully.');
    }
});

// Close the database connection
db.close((err) => {
    if (err) {
        console.error('Error closing database:', err.message);
    } else {
        console.log('Database connection closed.');
    }
});
