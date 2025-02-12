import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Dimensions,
  Alert,
} from "react-native";
import { 
  addGroup, 
  getGroups, 
  addPerson, 
  updatePerson, 
  deletePerson, 
  getNotesByPerson, 
  addNote 
} from "../dbFunctions";

const screenHeight = Dimensions.get("window").height;

const ProfileScreen = ({ route, navigation }) => {
  const { person } = route.params;
  
  // Convert person.groups to an array if it's a comma‑separated string.
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

  // On mount, fetch groups and notes.
  useEffect(() => {
    fetchGroups();
    fetchNotes();
  }, []);

  // Whenever the group selector modal opens, re-fetch the groups.
  useEffect(() => {
    if (groupSelectorVisible) {
      fetchGroups();
    }
  }, [groupSelectorVisible]);

  const fetchGroups = () => {
    getGroups((groups) => {
      console.log("Fetched groups in ProfileScreen:", groups);
      if (Array.isArray(groups)) {
        const groupNames = groups.map((g) => g.name);
        console.log("Extracted group names:", groupNames);
        setAvailableGroups(groupNames);
      } else {
        console.warn("getGroups did not return an array:", groups);
        setAvailableGroups([]);
      }
    });
  };

  const fetchNotes = () => {
    getNotesByPerson(person.id, (fetchedNotes) => {
      setNotes(fetchedNotes.length ? fetchedNotes[0].content : "");
    });
  };

  const toggleGroupSelection = (group) => {
    setSelectedGroups((prev) =>
      prev.includes(group)
        ? prev.filter((g) => g !== group)
        : [...prev, group]
    );
  };

  const handleSave = () => {
    const groupsString = selectedGroups.join(",");
    if (person.id) {
      updatePerson(person.id, personData.name, groupsString, () => {
        addNote(person.id, notes, () => navigation.goBack());
      });
    } else {
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
        // Refresh groups from the database.
        fetchGroups();
        // Also update available and selected groups locally.
        setAvailableGroups((prev) => [...prev, newGroupName.trim()]);
        setSelectedGroups((prev) => [...prev, newGroupName.trim()]);
        setNewGroupName("");
        setShowNewGroupInput(false);
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
            {/* Wrap the ScrollView in a container with a fixed max height */}
            <View style={{ maxHeight: screenHeight * 0.5, width: "100%" }}>
              <ScrollView contentContainerStyle={{ paddingVertical: 10 }}>
                {availableGroups.length > 0 ? (
                  availableGroups.map((group) => (
                    <TouchableOpacity
                      key={group}
                      style={[
                        styles.groupOption,
                        selectedGroups.includes(group) && styles.selectedGroupOption,
                      ]}
                      onPress={() => toggleGroupSelection(group)}
                    >
                      <Text
                        style={
                          selectedGroups.includes(group)
                            ? styles.selectedGroupText
                            : styles.groupText
                        }
                      >
                        {group}
                      </Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.noGroupsText}>No groups available</Text>
                )}
              </ScrollView>
            </View>

            {/* Add New Group Section */}
            {!showNewGroupInput ? (
              <TouchableOpacity
                style={styles.newGroupButton}
                onPress={() => {
                  setNewGroupName("");
                  setShowNewGroupInput(true);
                }}
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
                <View style={{ flexDirection: "row", justifyContent: "space-around", width: "100%" }}>
                  <TouchableOpacity style={styles.newGroupButton} onPress={handleAddNewGroup}>
                    <Text style={styles.newGroupText}>Add Group</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.newGroupButton}
                    onPress={() => {
                      setNewGroupName("");
                      setShowNewGroupInput(false);
                    }}
                  >
                    <Text style={styles.newGroupText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            <TouchableOpacity 
              onPress={() => setGroupSelectorVisible(false)} 
              style={styles.doneButton}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Text style={styles.label}>Notes:</Text>
      <TextInput
        style={[styles.input, styles.notesInput]}
        multiline
        value={notes}
        onChangeText={setNotes}
      />

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
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: "#fff", 
  },
  label: { 
    fontWeight: "bold", 
    marginTop: 10, 
  },
  input: { 
    borderWidth: 1, 
    borderColor: "#ccc", 
    borderRadius: 8, 
    padding: 10, 
    marginTop: 5,
    marginBottom: 10,
    width: "100%",
  },
  notesInput: { 
    flex: 1, 
    height: Dimensions.get("window").height * 0.3, 
    textAlignVertical: "top", 
  },
  buttonContainer: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginTop: 20, 
  },
  saveButton: { 
    backgroundColor: "#3ab09e", 
    padding: 10, 
    borderRadius: 8, 
  },
  deleteButton: { 
    backgroundColor: "#b6465f", 
    padding: 10, 
    borderRadius: 8, 
  },
  buttonText: { 
    color: "#fff", 
    fontWeight: "bold", 
    textAlign: "center", 
  },
  groupList: { 
    flexDirection: "row", 
    flexWrap: "wrap", 
    marginBottom: 10, 
  },
  groupBadge: { 
    backgroundColor: "#ffc145", 
    paddingVertical: 5, 
    paddingHorizontal: 10, 
    borderRadius: 15, 
    marginRight: 5, 
    marginBottom: 5, 
  },
  groupBadgeText: { 
    color: "#000", 
    fontWeight: "bold", 
  },
  noGroupsText: { 
    fontStyle: "italic", 
    color: "#888", 
    marginBottom: 10, 
  },
  modalContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "rgba(0,0,0,0.5)", 
  },
  modalContent: { 
    width: 300, 
    padding: 20, 
    backgroundColor: "#fff", 
    borderRadius: 10, 
    alignItems: "center", 
  },
  modalButtons: { 
    marginTop: 10, 
    width: "100%", 
  },
  newGroupWrapper: { 
    marginTop: 0, 
    marginBottom: 10, 
  },
  newGroupButton: { 
    padding: 10, 
    backgroundColor: "#ddd", 
    borderRadius: 8, 
    alignSelf: "center", 
    marginTop: 0, 
    marginBottom: 0, 
  },
  newGroupText: { 
    fontWeight: "bold", 
    color: "#000", 
    textAlign: "center", 
  },
  doneButton: { 
    marginTop: 10, 
    padding: 10, 
    backgroundColor: "#3ab09e", 
    borderRadius: 5, 
  },
  doneButtonText: { 
    color: "#fff", 
    fontWeight: "bold", 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: "bold", 
    marginVertical: 10, 
  },
  personItem: { 
    padding: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: "#eee", 
  },
  personName: { 
    fontSize: 16, 
  },
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
  plusIcon: { 
    fontSize: 30, 
    color: "#fff", 
    fontWeight: "bold", 
  },
  groupOption: { 
    padding: 10, 
    width: "100%", 
    backgroundColor: "#f0f0f0", 
    marginVertical: 5, 
    borderRadius: 5, 
  },
  selectedGroupOption: { 
    backgroundColor: "#ffc145", 
  },
  selectedGroupText: { 
    color: "#000", 
    fontWeight: "bold", 
  },
});

export default ProfileScreen;
