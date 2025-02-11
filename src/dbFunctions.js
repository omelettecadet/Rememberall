// dbFunctions.js
import SQLite from 'react-native-sqlite-storage';

// Optional: Uncomment for debugging if needed.
// SQLite.DEBUG(true);
// SQLite.enablePromise(false);

const db = SQLite.openDatabase(
  { name: 'rememberall.db', location: 'default' },
  () => console.log('✅ Database opened successfully'),
  (error) => console.error('❌ Error opening database:', error)
);

// Simple promise for initialization.
export const initializeDatabase = () => Promise.resolve(db);

// Set up tables with alphabetical ordering.
export const setupDatabase = () => {
  if (!db || typeof db.transaction !== 'function') {
    console.error("❌ Database is not initialized properly.");
    return;
  }
  db.transaction((tx) => {
    // Groups table ordered alphabetically by name.
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS groups (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         name TEXT NOT NULL
       );`
    );
    // People table (groups stored as comma-separated text) ordered by name.
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS people (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         name TEXT NOT NULL,
         groups TEXT,
         notes TEXT
       );`
    );
    // Notes table.
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS notes (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         person_id INTEGER,
         content TEXT NOT NULL,
         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
       );`
    );
    console.log("✅ Database setup complete");
  },
  (error) => console.error("❌ Transaction error during setup:", error)
  );
};

// --------------------- Group Functions ---------------------

export const getGroups = (callback) => {
  if (!db || typeof db.transaction !== 'function') {
    console.error("❌ Database not initialized properly");
    callback([]);
    return;
  }
  db.transaction((tx) => {
    tx.executeSql(
      `SELECT * FROM groups ORDER BY name ASC;`,
      [],
      (_, results) => {
        let groupsArray = [];
        for (let i = 0; i < results.rows.length; i++) {
          groupsArray.push(results.rows.item(i));
        }
        console.log("Fetched groups:", groupsArray);
        callback(groupsArray);
      },
      (_, error) => {
        console.error("Error fetching groups:", error);
        callback([]);
      }
    );
  });
};

export const addGroup = (name, callback) => {
  if (!db || typeof db.transaction !== 'function') {
    console.error("❌ Database not initialized properly");
    return;
  }
  db.transaction((tx) => {
    tx.executeSql(
      `INSERT INTO groups (name) VALUES (?);`,
      [name],
      (_, results) => callback(results.insertId),
      (_, error) => console.error("Error adding group:", error)
    );
  });
};

// Remove a group from each person’s groups field.
// Using IFNULL ensures we treat a null groups field as an empty string.
export const removeGroupFromPeople = (groupName, callback) => {
  if (!db || typeof db.transaction !== 'function') {
    console.error("❌ Database not initialized properly");
    callback();
    return;
  }
  db.transaction((tx) => {
    tx.executeSql(
      // We first prepend and append a comma so that we can safely replace the substring,
      // then trim any extra commas from the result.
      `UPDATE people
       SET groups = TRIM(BOTH ',' FROM REPLACE(',' || IFNULL(groups, '') || ',', ',' || ? || ',', ','))
       WHERE IFNULL(groups, '') LIKE '%' || ? || '%' COLLATE NOCASE;`,
      [groupName, groupName],
      (_, res) => {
        console.log(`Removed group '${groupName}' from people, rows affected: ${res.rowsAffected}`);
        callback();
      },
      (_, error) => {
        console.error("Error removing group from people:", error);
        callback(); // still call callback so the deleteGroup function can proceed
      }
    );
  });
};

// Delete a group and remove its name from people.
export const deleteGroup = (id, groupName, callback) => {
  if (!db || typeof db.transaction !== 'function') {
    console.error("❌ Database not initialized properly");
    return;
  }
  db.transaction((tx) => {
    tx.executeSql(
      `DELETE FROM groups WHERE id = ?;`,
      [id],
      (_, results) => {
        console.log(`Group with id ${id} deleted successfully.`);
        // Remove the group from people's groups
        removeGroupFromPeople(groupName, () => {
          callback(results.rowsAffected);
        });
      },
      (_, error) => {
        console.error("Error deleting group:", error);
      }
    );
  });
};

// Update a group name in groups and update people's groups.
export const updateGroupName = (oldName, newName, callback) => {
  if (!db || typeof db.transaction !== 'function') {
    console.error("❌ Database not initialized properly");
    return;
  }
  db.transaction((tx) => {
    tx.executeSql(
      `UPDATE groups SET name = ? WHERE name = ?;`,
      [newName, oldName],
      (_, results1) => {
        console.log(`Updated group name in groups table, rows affected: ${results1.rowsAffected}`);
        tx.executeSql(
          `UPDATE people 
           SET groups = REPLACE(IFNULL(groups, ''), ?, ?)
           WHERE IFNULL(groups, '') LIKE '%' || ? || '%';`,
          [oldName, newName, oldName],
          (_, results2) => {
            console.log(`Updated group name in people table, rows affected: ${results2.rowsAffected}`);
            if (callback) callback(results2.rowsAffected);
          },
          (_, error) => {
            console.error("Error updating group name in people table:", error);
          }
        );
      },
      (_, error) => {
        console.error("Error updating group name in groups table:", error);
      }
    );
  });
};

// --------------------- People Functions ---------------------

export const getPeople = (callback) => {
  if (!db || typeof db.transaction !== 'function') {
    console.error("❌ Database not initialized properly");
    callback([]);
    return;
  }
  db.transaction((tx) => {
    tx.executeSql(
      `SELECT * FROM people ORDER BY name ASC;`,
      [],
      (_, results) => {
        let peopleArray = [];
        for (let i = 0; i < results.rows.length; i++) {
          peopleArray.push(results.rows.item(i));
        }
        console.log("Fetched people:", peopleArray);
        callback(peopleArray);
      },
      (_, error) => {
        console.error("Error fetching people:", error);
        callback([]);
      }
    );
  });
};

export const addPerson = (name, groups, callback) => {
  if (!db || typeof db.transaction !== 'function') {
    console.error("❌ Database not initialized properly");
    return;
  }
  db.transaction((tx) => {
    tx.executeSql(
      `INSERT INTO people (name, groups) VALUES (?, ?);`,
      [name, groups],
      (_, results) => callback(results.insertId),
      (_, error) => console.error("Error adding person:", error)
    );
  });
};

export const updatePerson = (id, name, groups, callback) => {
  if (!db || typeof db.transaction !== 'function') {
    console.error("❌ Database not initialized properly");
    return;
  }
  db.transaction((tx) => {
    tx.executeSql(
      `UPDATE people SET name = ?, groups = ? WHERE id = ?;`,
      [name, groups, id],
      (_, results) => {
        console.log("Updated person. Rows affected:", results.rowsAffected);
        callback(results.rowsAffected);
      },
      (_, error) => console.error("Error updating person:", error)
    );
  });
};

export const deletePerson = (id, callback) => {
  if (!db || typeof db.transaction !== 'function') {
    console.error("❌ Database not initialized properly");
    return;
  }
  db.transaction((tx) => {
    tx.executeSql(
      `DELETE FROM people WHERE id = ?;`,
      [id],
      (_, results) => {
        console.log("Deleted person. Rows affected:", results.rowsAffected);
        callback(results.rowsAffected);
      },
      (_, error) => console.error("Error deleting person:", error)
    );
  });
};

// --------------------- Notes Functions ---------------------

export const addNote = (personId, content, callback) => {
  if (!db || typeof db.transaction !== 'function') {
    console.error("❌ Database not initialized properly");
    return;
  }
  db.transaction((tx) => {
    tx.executeSql(
      `INSERT INTO notes (person_id, content) VALUES (?, ?);`,
      [personId, content],
      (_, results) => callback(results.insertId),
      (_, error) => console.error("Error adding note:", error)
    );
  });
};

export const getNotesByPerson = (personId, callback) => {
  if (!db || typeof db.transaction !== 'function') {
    console.error("❌ Database not initialized properly");
    callback([]);
    return;
  }
  db.transaction((tx) => {
    tx.executeSql(
      `SELECT * FROM notes WHERE person_id = ? ORDER BY created_at DESC;`,
      [personId],
      (_, results) => {
        let notesArray = [];
        for (let i = 0; i < results.rows.length; i++) {
          notesArray.push(results.rows.item(i));
        }
        console.log("Fetched notes:", notesArray);
        callback(notesArray);
      },
      (_, error) => {
        console.error("Error fetching notes:", error);
        callback([]);
      }
    );
  });
};

export { db };
