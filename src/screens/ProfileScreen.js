import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Button,
  Dimensions,
  Alert,
} from "react-native";
import { getGroups, addPerson, updatePerson, deletePerson, getNotesByPerson, addNote } from "../dbFunctions";

const ProfileScreen = ({ route, navigation }) => {
  const { person } = route.params;
  // Convert person.groups to an array if it's a string.
  const initialGroups =
    person.groups && typeof person.groups === "string"
      ? person.groups.split(",").filter(Boolean)
      : Array.isArray(person.groups)
      ? person.groups
      : [];
  const [selectedGroups, setSelectedGroups] = useState(initialGroups);
  const [groupSelectorVisible, setGroupSelectorVisible] = useState(false);
  const [showNewGroupInput, setShowNewGroupInput] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [availableGroups, setAvailableGroups] = useState([]);
  const [personData, setPersonData] = useState(person);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchGroups();
    fetchNotes();
  }, []);

  const fetchGroups = () => {
    getGroups((groups) => setAvailableGroups(groups.map((g) => g.name)));
  };

  const fetchNotes = () => {
    getNotesByPerson(person.id, (fetchedNotes) => {
      setNotes(fetchedNotes.length ? fetchedNotes[0].content : "");
    });
  };

  const toggleGroupSelection = (group) => {
    setSelectedGroups((prev) =>
      Array.isArray(prev) && prev.includes(group)
        ? prev.filter((g) => g !== group)
        : [...(Array.isArray(prev) ? prev : []), group]
    );
  };

  const handleSave = () => {
    // Convert selectedGroups array to a comma-separated string.
    const groupsString = selectedGroups.join(",");
    if (person.id) {
      // Update existing person.
      updatePerson(person.id, personData.name, groupsString, () => {
        addNote(person.id, notes, () => navigation.goBack());
      });
    } else {
      // Add new person.
      addPerson(personData.name, groupsString, (newId) => {
        addNote(newId, notes, () => navigation.goBack());
      });
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this person?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Delete",
          onPress: () => {
            deletePerson(person.id, () => navigation.goBack());
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleAddNewGroup = () => {
    if (newGroupName.trim()) {
      addGroup(newGroupName.trim(), (newGroupId) => {
        // Optionally update the person's selected groups locally
        // Then refresh the groups list for HomeScreen
        refreshGroups();  // Make sure this function calls getGroups() and updates state.
      });
    }
  };  

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Name:</Text>
      <TextInput
        style={styles.input}
        value={personData.name}
        onChangeText={(text) => setPersonData({ ...personData, name: text })}
      />

      <Text style={styles.label}>Groups:</Text>
      <TouchableOpacity onPress={() => setGroupSelectorVisible(true)}>
        <View style={styles.groupList}>
          {selectedGroups.length > 0 ? (
            selectedGroups.map((group) => (
              <View key={group} style={styles.groupBadge}>
                <Text style={styles.groupBadgeText}>{group}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noGroupsText}>No groups selected</Text>
          )}
        </View>
      </TouchableOpacity>

      {/* Group Selector Modal */}
      <Modal visible={groupSelectorVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.label}>Select Groups</Text>
            {availableGroups.map((group) => (
              <TouchableOpacity
                key={group}
                style={[
                  styles.groupOption,
                  selectedGroups.includes(group) && styles.selectedGroupOption,
                ]}
                onPress={() => toggleGroupSelection(group)}
              >
                <Text style={selectedGroups.includes(group) ? styles.selectedGroupText : null}>
                  {group}
                </Text>
              </TouchableOpacity>
            ))}

            {/* Add New Group within Profile */}
            {!showNewGroupInput ? (
              <TouchableOpacity
                style={styles.newGroupButton}
                onPress={() => setShowNewGroupInput(true)}
              >
                <Text style={styles.newGroupText}>+ New Group</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="New group name..."
                  value={newGroupName}
                  onChangeText={setNewGroupName}
                />
                <TouchableOpacity
                  style={styles.newGroupButton}
                  onPress={() => {
                    if (newGroupName.trim()) {
                      setAvailableGroups([...availableGroups, newGroupName.trim()]);
                      setSelectedGroups([...selectedGroups, newGroupName.trim()]);
                      setNewGroupName("");
                      setShowNewGroupInput(false);
                    }
                  }}
                >
                  <Text style={styles.newGroupText}>Add Group</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity onPress={() => setGroupSelectorVisible(false)} style={styles.doneButton}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Notes Section */}
      <Text style={styles.label}>Notes:</Text>
      <TextInput style={[styles.input, styles.notesInput]} multiline value={notes} onChangeText={setNotes} />

      {/* Save & Delete Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  label: { fontWeight: "bold", marginTop: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginTop: 5 },
  notesInput: { flex: 1, height: Dimensions.get("window").height * 0.3, textAlignVertical: "top" },
  buttonContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  saveButton: { backgroundColor: "#4CAF50", padding: 10, borderRadius: 5 },
  deleteButton: { backgroundColor: "#D9534F", padding: 10, borderRadius: 5 },
  buttonText: { color: "#fff", fontWeight: "bold", textAlign: "center" },
  groupList: { flexDirection: "row", flexWrap: "wrap", marginBottom: 10 },
  groupBadge: { backgroundColor: "#4CAF50", paddingVertical: 5, paddingHorizontal: 10, borderRadius: 15, marginRight: 5, marginBottom: 5 },
  groupBadgeText: { color: "#fff", fontWeight: "bold" },
  noGroupsText: { fontStyle: "italic", color: "#888", marginBottom: 10 },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { width: 300, padding: 20, backgroundColor: "#fff", borderRadius: 10, alignItems: "center" },
  modalButtons: { marginTop: 10, width: "100%" },
  newGroupWrapper: { marginTop: 0 },
  newGroupButton: { padding: 10, backgroundColor: "#ddd", borderRadius: 8, alignSelf: "center", marginTop: 0, marginBottom: 0 },
  newGroupText: { fontWeight: "bold", color: "#000", textAlign: "center" },
  doneButton: { marginTop: 10, padding: 10, backgroundColor: "#007BFF", borderRadius: 5 },
  doneButtonText: { color: "#fff", fontWeight: "bold" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginVertical: 10 },
  personItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: "#eee" },
  personName: { fontSize: 16 },
  addPersonButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#4CAF50",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  plusIcon: { fontSize: 30, color: "#fff", fontWeight: "bold" },
  groupOption: {
    padding: 10,
    width: "100%",
    backgroundColor: "#f0f0f0",
    marginVertical: 5,
    borderRadius: 5,
  },
  selectedGroupOption: {
    backgroundColor: "#4CAF50",
  },
  selectedGroupText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default ProfileScreen;
