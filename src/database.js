import { openDatabaseSync } from 'expo-sqlite';

const db = openDatabaseSync('rememberall.db');

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
    // ... (rest of your table creation code)
  }, (error) => {
    console.error('❌ Transaction error:', error);
  }, () => {
    console.log('✅ Database setup complete');
  });
};

export default db;
