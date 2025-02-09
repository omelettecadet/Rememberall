import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Button,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const HomeScreen = () => {
  const navigation = useNavigation();

  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [groups, setGroups] = useState(["Family", "Work Friends", "Childhood Friends"]);

  const people = [
    { id: "1", name: "Alice Johnson", groups: ["Family"] },
    { id: "2", name: "Bob Smith", groups: ["Work Friends"] },
    { id: "3", name: "Charlie Brown", groups: ["Childhood Friends", "Work Friends"] },
  ];

  const filteredPeople = people.filter((person) => {
    const matchesSearch =
      person.name.toLowerCase().includes(search.toLowerCase()) ||
      person.groups.some((group) => group.toLowerCase().includes(search.toLowerCase()));

    const matchesGroup = selectedGroup ? person.groups.includes(selectedGroup) : true;
    return matchesSearch && matchesGroup;
  });

  const deleteGroup = (group) => {
    Alert.alert(
      "Delete Group",
      `Are you sure you want to delete "${group}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, delete",
          onPress: () => setGroups(groups.filter((g) => g !== group)),
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search people..."
        value={search}
        onChangeText={setSearch}
      />

      {/* Groups List (No extra margin/padding) */}
      <FlatList
        data={groups}
        keyExtractor={(item) => item}
        numColumns={2}
        contentContainerStyle={styles.groupListContainer} 
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.groupButton, selectedGroup === item && styles.selectedGroup]}
            onPress={() => setSelectedGroup(selectedGroup === item ? null : item)}
            onLongPress={() => deleteGroup(item)}
          >
            <Text style={styles.groupText}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      {/* ✅ "+ New Group" button follows groups WITHOUT extra space */}
      <View style={styles.newGroupWrapper}>
        <TouchableOpacity style={styles.newGroupButton} onPress={() => setGroupModalVisible(true)}>
          <Text style={styles.newGroupText}>＋ New Group</Text>
        </TouchableOpacity>
      </View>

      {/* ✅ People List follows immediately after */}
      <FlatList
        data={filteredPeople}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.peopleListContainer} // ✅ No extra space!
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.personItem}
            onPress={() => {
              const newPerson = {
                id: Date.now().toString(),
                name: "",
                groups: [],
                notes: "",
              };
              navigation.navigate("Profile", { person: newPerson });
            }}            
          >
            <Text style={styles.personName}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Add Person Button */}
      <TouchableOpacity
        style={styles.addPersonButton}
        onPress={() =>
          navigation.navigate("Profile", {
            person: { id: Date.now().toString(), name: "", groups: [], notes: "" },
          })
        }
      >
        <Text style={styles.plusIcon}>＋</Text>
      </TouchableOpacity>

      {/* Add Group Modal */}
      <Modal visible={groupModalVisible} animationType="fade" transparent>
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.label}>Enter New Group Name:</Text>
            <TextInput
              style={styles.input}
              placeholder="New group name..."
              value={newGroupName}
              onChangeText={setNewGroupName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <Button
                title="Add"
                onPress={() => {
                  if (newGroupName.trim()) {
                    setGroups([...groups, newGroupName.trim()]);
                    setNewGroupName("");
                    setGroupModalVisible(false);
                  }
                }}
              />
              <Button title="Cancel" onPress={() => setGroupModalVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },

  searchBar: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 10 },

  groupListContainer: { paddingBottom: 0, marginBottom: 0 }, // ✅ NO extra space

  groupButton: { flex: 1, padding: 10, margin: 5, backgroundColor: "#ddd", borderRadius: 8, alignItems: "center" },
  selectedGroup: { backgroundColor: "#4CAF50" },
  groupText: { fontWeight: "bold", color: "#000" },

  newGroupWrapper: { marginTop: 0 }, // ✅ Ensures no extra space!
  newGroupButton: { padding: 10, backgroundColor: "#ddd", borderRadius: 8, alignSelf: "center", marginTop: 0, marginBottom: 0 },
  newGroupText: { fontWeight: "bold", color: "#000", textAlign: "center" },

  peopleListContainer: { paddingTop: 0, marginTop: 0 }, // ✅ NO extra space between Groups & People

  personItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: "#eee" },
  personName: { fontSize: 16 },

  addPersonButton: { position: "absolute", bottom: 20, right: 20, backgroundColor: "#4CAF50", width: 50, height: 50, borderRadius: 25, justifyContent: "center", alignItems: "center" },
  plusIcon: { fontSize: 30, color: "#fff", fontWeight: "bold" },

  modalBackground: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { width: 300, padding: 20, backgroundColor: "#fff", borderRadius: 10, alignItems: "center" },
  modalButtons: { marginTop: 10, width: "100%" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, width: "100%", marginBottom: 10 },
});

export default HomeScreen;
