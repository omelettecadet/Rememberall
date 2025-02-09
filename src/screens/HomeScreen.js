import React, { useState, useEffect } from "react";
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
import { getGroups, addGroup, deleteGroup } from "../dbFunctions"; // ✅ Import SQLite functions

const HomeScreen = () => {
  const navigation = useNavigation();

  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [groups, setGroups] = useState([]); // ✅ Now groups come from SQLite

  useEffect(() => {
    fetchGroups();
  }, []);

  // ✅ Fetch groups from the database
  const fetchGroups = () => {
    getGroups((fetchedGroups) => setGroups(fetchedGroups));
  };

  // ✅ Add a new group to SQLite
  const handleAddGroup = () => {
    if (newGroupName.trim()) {
      addGroup(newGroupName.trim(), () => {
        setNewGroupName("");
        setGroupModalVisible(false);
        fetchGroups(); // Refresh list
      });
    }
  };

  // ✅ Delete a group from SQLite
  const handleDeleteGroup = (groupId, groupName) => {
    Alert.alert(
      "Delete Group",
      `Are you sure you want to delete "${groupName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, delete",
          onPress: () => {
            deleteGroup(groupId, fetchGroups);
          },
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

      {/* Groups List */}
      <FlatList
        data={groups}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.groupListContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.groupButton,
              selectedGroup === item.name && styles.selectedGroup,
            ]}
            onPress={() => setSelectedGroup(selectedGroup === item.name ? null : item.name)}
            onLongPress={() => handleDeleteGroup(item.id, item.name)}
          >
            <Text style={styles.groupText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      {/* "+ New Group" button */}
      <View style={styles.newGroupWrapper}>
        <TouchableOpacity style={styles.newGroupButton} onPress={() => setGroupModalVisible(true)}>
          <Text style={styles.newGroupText}>＋ New Group</Text>
        </TouchableOpacity>
      </View>

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
              <Button title="Add" onPress={handleAddGroup} />
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

  groupListContainer: { paddingBottom: 0, marginBottom: 0 },

  groupButton: { flex: 1, padding: 10, margin: 5, backgroundColor: "#ddd", borderRadius: 8, alignItems: "center" },
  selectedGroup: { backgroundColor: "#4CAF50" },
  groupText: { fontWeight: "bold", color: "#000" },

  newGroupWrapper: { marginTop: 0 },
  newGroupButton: { padding: 10, backgroundColor: "#ddd", borderRadius: 8, alignSelf: "center", marginTop: 0, marginBottom: 0 },
  newGroupText: { fontWeight: "bold", color: "#000", textAlign: "center" },

  modalBackground: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { width: 300, padding: 20, backgroundColor: "#fff", borderRadius: 10, alignItems: "center" },
  modalButtons: { marginTop: 10, width: "100%" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, width: "100%", marginBottom: 10 },
});

export default HomeScreen;
