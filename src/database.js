import * as SQLite from 'expo-sqlite';

// Open or create the database
const db = SQLite.openDatabase('rememberall.db');

// Function to create tables
export const setupDatabase = () => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      );`,
      [],
      () => console.log('Groups table created'),
      (error) => console.error('Error creating groups table:', error)
    );

    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS people (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        group_id INTEGER,
        notes TEXT,
        FOREIGN KEY (group_id) REFERENCES groups(id)
      );`,
      [],
      () => console.log('People table created'),
      (error) => console.error('Error creating people table:', error)
    );

    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        person_id INTEGER,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (person_id) REFERENCES people(id)
      );`,
      [],
      () => console.log('Notes table created'),
      (error) => console.error('Error creating notes table:', error)
    );
  });
};

export default db;
