import { openDatabase } from 'expo-sqlite';
const db = openDatabase('rememberall.db');

// Debug logs to verify what functions are available
console.log("🔍 SQLite module:", SQLite);
console.log("🔍 openDatabase function:", SQLite.openDatabase);

// Ensure the database is properly initialized
if (!db) {
  console.error("❌ Database failed to open.");
} else {
  console.log("✅ Database opened successfully");
}

// Function to create tables
export const setupDatabase = () => {
  if (!db) {
    console.error("❌ Database is not initialized.");
    return;
  }

  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      );`,
      [],
      () => console.log('✅ Groups table created'),
      (_, error) => console.error('❌ Error creating groups table:', error)
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
      () => console.log('✅ People table created'),
      (_, error) => console.error('❌ Error creating people table:', error)
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
      () => console.log('✅ Notes table created'),
      (_, error) => console.error('❌ Error creating notes table:', error)
    );
  }, (error) => {
    console.error('❌ Transaction error:', error);
  }, () => {
    console.log('✅ Database setup complete');
  });
};

export default db;
