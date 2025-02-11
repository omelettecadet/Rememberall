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
  ScrollView,
  Dimensions,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import {
  getGroups,
  addGroup,
  deleteGroup,
  getPeople,
  updateGroupName,
  // removeGroupFromPeople is used internally in dbFunctions.
} from "../dbFunctions";

const screenHeight = Dimensions.get("window").height;

const HomeScreen = () => {
  const navigation = useNavigation();
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const [editGroupModalVisible, setEditGroupModalVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [editGroupName, setEditGroupName] = useState("");
  const [groupToEdit, setGroupToEdit] = useState(null);
  const [groups, setGroups] = useState([]);
  const [people, setPeople] = useState([]);

  useEffect(() => {
    fetchGroups();
    fetchPeople();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchPeople();
    }, [])
  );

  const fetchGroups = () => {
    getGroups((fetchedGroups) => setGroups(fetchedGroups));
  };

  const fetchPeople = () => {
    getPeople((fetchedPeople) => setPeople(fetchedPeople));
  };

  const handleAddGroup = () => {
    if (newGroupName.trim()) {
      addGroup(newGroupName.trim(), () => {
        setNewGroupName("");
        setGroupModalVisible(false);
        fetchGroups();
      });
    }
  };

  const handleGroupLongPress = (group) => {
    Alert.alert(
      "Group Options",
      `What would you like to do with "${group.name}"?`,
      [
        {
          text: "Edit",
          onPress: () => {
            setGroupToEdit(group);
            setEditGroupName(group.name);
            setEditGroupModalVisible(true);
          },
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // Delete from groups table and update people.
            deleteGroup(group.id, group.name, () => {
              fetchGroups();
              fetchPeople();
            });
          },
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const handleEditGroup = () => {
    if (groupToEdit && editGroupName.trim()) {
      updateGroupName(groupToEdit.name, editGroupName.trim(), () => {
        setEditGroupModalVisible(false);
        setGroupToEdit(null);
        fetchGroups();
        fetchPeople();
      });
    }
  };

  const filteredPeople = people.filter((person) => {
    let matchesGroup = true;
    if (selectedGroup) {
      const personGroups = person.groups
        ? person.groups.split(",").map((g) => g.trim().toLowerCase())
        : [];
      matchesGroup = personGroups.includes(selectedGroup.toLowerCase());
    }
    let matchesSearch = true;
    if (search) {
      const lowerSearch = search.toLowerCase();
      const nameMatches = person.name.toLowerCase().includes(lowerSearch);
      const notesMatches = (person.notes || "").toLowerCase().includes(lowerSearch);
      matchesSearch = nameMatches || notesMatches;
    }
    return matchesGroup && matchesSearch;
  });  

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

      {/* Groups Section */}
<Text style={styles.sectionTitle}>Groups</Text>
<ScrollView 
  style={{ maxHeight: screenHeight / 2 }} 
  contentContainerStyle={styles.groupsContainer}
  showsVerticalScrollIndicator={true}
>
  {groups.map((group) => (
    <TouchableOpacity
      key={group.id.toString()}
      style={[
        styles.groupButton,
        selectedGroup === group.name && styles.selectedGroup,
      ]}
      onPress={() =>
        setSelectedGroup(selectedGroup === group.name ? null : group.name)
      }
      onLongPress={() => handleGroupLongPress(group)}
    >
      <Text style={styles.groupText}>{group.name}</Text>
    </TouchableOpacity>
  ))}
</ScrollView>

      {/* "+ New Group" Button */}
      <View style={styles.newGroupWrapper}>
        <TouchableOpacity
          style={styles.newGroupButton}
          onPress={() => setGroupModalVisible(true)}
        >
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

      {/* Edit Group Modal */}
      <Modal visible={editGroupModalVisible} animationType="fade" transparent>
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.label}>Edit Group Name:</Text>
            <TextInput
              style={styles.input}
              placeholder="New group name..."
              value={editGroupName}
              onChangeText={setEditGroupName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <Button title="Save" onPress={handleEditGroup} />
              <Button title="Cancel" onPress={() => setEditGroupModalVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>

      {/* People Section */}
      <Text style={styles.sectionTitle}>People</Text>
      <FlatList
        data={filteredPeople}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.personItem}
            onPress={() => navigation.navigate("Profile", { person: item })}
          >
            <Text style={styles.personName}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Floating Add Person Button */}
      <TouchableOpacity
        style={styles.addPersonButton}
        onPress={() =>
          navigation.navigate("Profile", {
            person: { name: "", groups: [], notes: "" },
          })
        }
      >
        <Text style={styles.plusIcon}>＋</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  searchBar: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
  },
  groupsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },  
  groupButton: {
    padding: 10,
    margin: 5,
    backgroundColor: "#ddd",
    borderRadius: 8,
    alignItems: "center",
  },
  selectedGroup: { backgroundColor: "#4CAF50" },
  groupText: { fontWeight: "bold", color: "#000" },
  newGroupWrapper: { marginTop: 0 },
  newGroupButton: {
    padding: 10,
    backgroundColor: "#ddd",
    borderRadius: 8,
    alignSelf: "center",
    marginTop: 0,
    marginBottom: 0,
  },
  newGroupText: { fontWeight: "bold", color: "#000", textAlign: "center" },
  modalBackground: {
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
  modalButtons: { marginTop: 10, width: "100%" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    width: "100%",
    marginBottom: 10,
  },
  personItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
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
});

export default HomeScreen;
