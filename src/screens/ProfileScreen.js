import React, { useState } from "react";
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

const ProfileScreen = ({ route, navigation }) => {
  const { person } = route.params;

  const [selectedGroups, setSelectedGroups] = useState(person.groups || []);
  const [groupSelectorVisible, setGroupSelectorVisible] = useState(false);
  const [showNewGroupInput, setShowNewGroupInput] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [availableGroups, setAvailableGroups] = useState(["Family", "Work Friends", "Childhood Friends"]);
  const [personData, setPersonData] = useState(person);
  const toggleGroupSelection = (group) => {
    setSelectedGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Name:</Text>
      <TextInput
        style={styles.input}
        value={personData.name}
        onChangeText={(text) => setPersonData({ ...personData, name: text })} // ✅ Updates name field
      />

      <Text style={styles.label}>Groups:</Text>
      {/* Display Selected Groups as Badges */}
      <TouchableOpacity onPress={() => setGroupSelectorVisible(true)}>
        <View style={styles.groupList}>
          {selectedGroups.length > 0 ? (
            selectedGroups.map((group) => (
              <View key={group} style={styles.groupBadge}>
                <Text style={styles.groupBadgeText}>{group}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noGroupsText}>No groups selected</Text> // If no groups, show this placeholder
          )}
        </View>
      </TouchableOpacity>

      {/* Only One `Modal` */}
      <Modal visible={groupSelectorVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.label}>Select Groups</Text>

            {availableGroups.map((group) => (
              <TouchableOpacity
                key={group}
                style={[styles.groupOption, selectedGroups.includes(group) && styles.selectedGroupOption]}
                onPress={() => toggleGroupSelection(group)}
              >
                <Text>{group}</Text>
              </TouchableOpacity>
            ))}

            {/* "+ New Group" Button (Hidden Until Clicked) */}
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
      <TextInput style={[styles.input, styles.notesInput]} multiline />

      {/* Save & Delete Buttons */}
      <View style={styles.buttonContainer}>
      <TouchableOpacity
          style={styles.deleteButton}
          onPress={() =>
            Alert.alert(
              "Confirm Delete", // Title
              "Are you sure you want to delete this person?", // Message
              [
                {
                  text: "Cancel",
                  style: "cancel",
                },
                {
                  text: "Yes, Delete",
                  onPress: () => navigation.goBack(), // ✅ Only deletes after confirmation
                  style: "destructive",
                },
              ]
            )
          }
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Style Sheet
const screenHeight = Dimensions.get("window").height;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  label: { fontWeight: "bold", marginTop: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginTop: 5 },
  notesInput: {
    flex: 1, // ✅ Expands to fill available space
    height: screenHeight * 0.3, // ✅ Takes up 30% of screen height
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
  },
  buttonContainer: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  saveButton: { backgroundColor: "#4CAF50", padding: 10, borderRadius: 5 },
  deleteButton: { backgroundColor: "#D9534F", padding: 10, borderRadius: 5 },
  buttonText: { color: "#fff", fontWeight: "bold", textAlign: "center" },

  // Selected Groups Display
  groupList: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },

  groupBadge: {
    backgroundColor: "#4CAF50",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
    marginRight: 5,
    marginBottom: 5,
  },

  groupBadgeText: {
    color: "#fff",
    fontWeight: "bold",
  },

  noGroupsText: {
    fontStyle: "italic",
    color: "#888",
    marginBottom: 10,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)", // ✅ Fixes dark overlay
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
  },
  groupOption: {
    padding: 10,
    width: "100%",
    textAlign: "center",
    backgroundColor: "#f0f0f0",
    marginVertical: 5,
    borderRadius: 5,
  },
  selectedGroupOption: {
    backgroundColor: "#4CAF50",
    color: "#fff",
  },
  newGroupButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#4CAF50",
    borderRadius: 5,
  },
  newGroupText: {
    color: "#fff",
    fontWeight: "bold",
  },
  doneButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#007BFF",
    borderRadius: 5,
  },
  doneButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default ProfileScreen;
