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
      (_, results) => {
        console.log("Group added with id:", results.insertId);
        callback(results.insertId);
      },
      (_, error) => {
        console.error("Error adding group:", error ? error.message : "Unknown error");
        return false;
      }
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
    // Get all people whose groups include the groupName (case‑insensitive)
    tx.executeSql(
      `SELECT id, groups FROM people WHERE groups LIKE '%' || ? || '%' COLLATE NOCASE;`,
      [groupName],
      (_, results) => {
        const count = results.rows.length;
        for (let i = 0; i < count; i++) {
          const person = results.rows.item(i);
          // Split the groups string into an array, remove the groupName (ignoring case), then rejoin.
          let groupsArray = person.groups
            ? person.groups.split(',').map((s) => s.trim())
            : [];
          groupsArray = groupsArray.filter(
            (g) => g.toLowerCase() !== groupName.toLowerCase()
          );
          const updatedGroups = groupsArray.join(',');
          // Update the person's groups field
          tx.executeSql(
            `UPDATE people SET groups = ? WHERE id = ?;`,
            [updatedGroups, person.id],
            (_, res) =>
              console.log(`Updated person ${person.id} groups to: ${updatedGroups}`),
            (_, error) =>
              console.error(
                `Error updating person ${person.id}:`,
                error ? error.message : "Unknown error"
              )
          );
        }
        callback();
      },
      (_, error) => {
        console.error(
          "Error fetching people for group removal:",
          error ? error.message : "Unknown error"
        );
        callback();
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
        // Remove this group name from every person's record.
        removeGroupFromPeople(groupName, () => {
          callback(results.rowsAffected);
        });
      },
      (_, error) => {
        console.error("Error deleting group:", error ? error.message : "Unknown error");
      }
    );
  });
};

export const cleanPeopleGroups = (callback) => {
  // First, get the master list of groups from the groups table.
  getGroups((masterGroups) => {
    const masterGroupNames = masterGroups.map(g => g.name.toLowerCase());
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT id, groups FROM people;`,
        [],
        (_, results) => {
          for (let i = 0; i < results.rows.length; i++) {
            const person = results.rows.item(i);
            if (person.groups) {
              // Filter out groups not in the master list.
              const updatedGroups = person.groups.split(",")
                .map(g => g.trim())
                .filter(g => masterGroupNames.includes(g.toLowerCase()))
                .join(",");
              // Update the person's groups field if necessary.
              tx.executeSql(
                `UPDATE people SET groups = ? WHERE id = ?;`,
                [updatedGroups, person.id],
                () => console.log(`Updated person ${person.id} groups to: ${updatedGroups}`),
                (_, error) => console.error(`Error updating person ${person.id}:`, error ? error.message : "Unknown error")
              );
            }
          }
          if (callback) callback();
        },
        (_, error) => {
          console.error("Error cleaning people groups:", error ? error.message : "Unknown error");
          if (callback) callback();
        }
      );
    });
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
      `SELECT p.*, IFNULL(group_concat(n.content, ' '), '') as allNotes
       FROM people p
       LEFT JOIN notes n ON n.person_id = p.id
       GROUP BY p.id
       ORDER BY p.name ASC;`,
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
        console.error("Error fetching people:", error ? error.message : "Unknown error");
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
