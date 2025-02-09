import { openDatabase } from 'expo-sqlite';  // ✅ Correct import

console.log("🔍 Checking expo-sqlite module...");
console.log("🔍 openDatabase function:", openDatabase);

const db = openDatabase('rememberall.db');

if (!db) {
  console.error("❌ SQLite database failed to open.");
}

// ✅ Initialize database tables
export const setupDatabase = () => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      );`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS people (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        group_id INTEGER,
        notes TEXT,
        FOREIGN KEY (group_id) REFERENCES groups(id)
      );`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        person_id INTEGER,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (person_id) REFERENCES people(id)
      );`
    );
  });
};

// ✅ Add a new group
export const addGroup = (name, callback) => {
  db.transaction(tx => {
    tx.executeSql(
      `INSERT INTO groups (name) VALUES (?);`,
      [name],
      (_, results) => callback(results.insertId),
      (_, error) => console.error("Error adding group:", error)
    );
  });
};

// ✅ Get all groups
export const getGroups = (callback) => {
  db.transaction(tx => {
    tx.executeSql(
      `SELECT * FROM groups;`,
      [],
      (_, results) => callback(results.rows._array),
      (_, error) => console.error("Error fetching groups:", error)
    );
  });
};

// ✅ Add a new person to a group
export const addPerson = (name, groupId, callback) => {
  db.transaction(tx => {
    tx.executeSql(
      `INSERT INTO people (name, group_id) VALUES (?, ?);`,
      [name, groupId],
      (_, results) => callback(results.insertId),
      (_, error) => console.error("Error adding person:", error)
    );
  });
};

// ✅ Get all people in a group
export const getPeopleByGroup = (groupId, callback) => {
  db.transaction(tx => {
    tx.executeSql(
      `SELECT * FROM people WHERE group_id = ?;`,
      [groupId],
      (_, results) => callback(results.rows._array),
      (_, error) => console.error("Error fetching people:", error)
    );
  });
};

// ✅ Add a new note for a person
export const addNote = (personId, content, callback) => {
  db.transaction(tx => {
    tx.executeSql(
      `INSERT INTO notes (person_id, content) VALUES (?, ?);`,
      [personId, content],
      (_, results) => callback(results.insertId),
      (_, error) => console.error("Error adding note:", error)
    );
  });
};

// ✅ Get all notes for a person
export const getNotesByPerson = (personId, callback) => {
  db.transaction(tx => {
    tx.executeSql(
      `SELECT * FROM notes WHERE person_id = ? ORDER BY created_at DESC;`,
      [personId],
      (_, results) => callback(results.rows._array),
      (_, error) => console.error("Error fetching notes:", error)
    );
  });
};

// ✅ Update a group name
export const updateGroup = (id, newName, callback) => {
  db.transaction(tx => {
    tx.executeSql(
      `UPDATE groups SET name = ? WHERE id = ?;`,
      [newName, id],
      (_, results) => callback(results.rowsAffected),
      (_, error) => console.error("Error updating group:", error)
    );
  });
};

// ✅ Delete a group (and its related people and notes)
export const deleteGroup = (id, callback) => {
  db.transaction(tx => {
    tx.executeSql(`DELETE FROM notes WHERE person_id IN (SELECT id FROM people WHERE group_id = ?);`, [id]);
    tx.executeSql(`DELETE FROM people WHERE group_id = ?;`, [id]);
    tx.executeSql(
      `DELETE FROM groups WHERE id = ?;`,
      [id],
      (_, results) => callback(results.rowsAffected),
      (_, error) => console.error("Error deleting group:", error)
    );
  });
};
