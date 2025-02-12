import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import SearchBar from "../components/SearchBar";
import {
  getGroups,
  addGroup,
  deleteGroup,
  getPeople,
  updateGroupName,
} from "../dbFunctions";

const screenHeight = Dimensions.get("window").height;

const HomeScreen = () => {
  const navigation = useNavigation();

  // State variables for search, groups, people, and modals
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groups, setGroups] = useState([]);
  const [people, setPeople] = useState([]);
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const [showNewGroupInput, setShowNewGroupInput] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  // Fetch groups and people when the component mounts or when focused
  useEffect(() => {
    fetchGroups();
    fetchPeople();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchGroups();
      fetchPeople();
    }, [])
  );

  const fetchGroups = () => {
    getGroups((fetchedGroups) => {
      console.log("Fetched groups:", fetchedGroups);
      setGroups(fetchedGroups);
    });
  };

  const fetchPeople = () => {
    getPeople((fetchedPeople) => {
      console.log("Fetched people:", fetchedPeople);
      setPeople(fetchedPeople);
    });
  };

  // Handler for adding a new group from the modal
  const handleAddGroup = () => {
    if (newGroupName.trim()) {
      addGroup(newGroupName.trim(), () => {
        console.log("New group added:", newGroupName.trim());
        setNewGroupName("");
        setShowNewGroupInput(false);
        setGroupModalVisible(false);
        fetchGroups();
      });
    }
  };

  // Long press on a group shows options (delete/edit)
  const handleGroupLongPress = (group) => {
    Alert.alert(
      "Group Options",
      `What would you like to do with "${group.name}"?`,
      [
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteGroup(group.id, group.name, () => {
              fetchGroups();
              fetchPeople();
            });
          },
        },
        {
          text: "Edit",
          onPress: () => {
            // Implement editing if desired; for now you could navigate or open another modal.
            // updateGroupName(group.name, newGroupName, callback) could be called here.
          },
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  // Filter people based on search text and selected group
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
      const notesMatches = ((person.notes || person.allNotes) || "")
        .toLowerCase()
        .includes(lowerSearch);
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
      <SearchBar
        placeholder="Search people..."
        value={search}
        onChangeText={setSearch}
        onClear={() => setSearch("")}
      />

      {/* Groups Section */}
      <Text style={styles.sectionTitle}>Groups</Text>
      <View style={styles.fixedGroupsContainer}>
        <ScrollView
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
                setSelectedGroup(
                  selectedGroup === group.name ? null : group.name
                )
              }
              onLongPress={() => handleGroupLongPress(group)}
            >
              <Text style={styles.groupText}>{group.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* "+ New Group" Button */}
      <View style={styles.newGroupWrapper}>
        <TouchableOpacity
          style={styles.newGroupButton}
          onPress={() => {
            setNewGroupName("");
            // Immediately show the new group input:
            setShowNewGroupInput(true);
            setGroupModalVisible(true);
          }}
        >
          <Text style={styles.newGroupText}>+ New Group</Text>
        </TouchableOpacity>
      </View>

      {/* Add Group Modal */}
      <Modal visible={groupModalVisible} animationType="fade" transparent>
        <View style={styles.modalBackground}>
          <View style={[styles.modalContent, { maxHeight: screenHeight * 0.7 }]}>
            <Text style={styles.label}>Enter New Group Name:</Text>
            {/* Always show the text input and Add/Cancel buttons */}
            <TextInput
              style={styles.input}
              placeholder="New group name..."
              value={newGroupName}
              onChangeText={setNewGroupName}
            />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-around",
                width: "100%",
              }}
            >
              <TouchableOpacity
                style={[styles.customButton, { backgroundColor: "#3ab093" }]}
                onPress={handleAddGroup}
              >
                <Text style={styles.customButtonText}>Add Group</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.customButton, { backgroundColor: "#ddd" }]}
                onPress={() => {
                  // Cancel: reset state and close the modal
                  setNewGroupName("");
                  setShowNewGroupInput(false);
                  setGroupModalVisible(false);
                }}
              >
                <Text style={styles.customButtonText}>Cancel</Text>
              </TouchableOpacity>
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
            onPress={() =>
              navigation.navigate("Profile", { person: item })
            }
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
        <Text style={styles.plusIcon}>+</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: "#fff",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
  },
  fixedGroupsContainer: {
    height: 150,
  },
  groupsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingVertical: 5,
  },
  groupsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
    height: 250,
    maxHeight: 250,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  groupButton: {
    padding: 10,
    margin: 5,
    backgroundColor: "#ddd",
    borderRadius: 8,
    alignItems: "center",
  },
  selectedGroup: { 
    backgroundColor: "#ffc145",
  },
  groupText: { 
    fontWeight: "bold", 
    color: "#000" 
  },
  newGroupWrapper: { 
    marginTop: 0,
  },
  newGroupButton: {
    padding: 10,
    backgroundColor: "#ddd",
    borderRadius: 8,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 0,
  },
  newGroupText: { 
    fontWeight: "bold", 
    color: "#000", 
    textAlign: "center",
  },
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
    marginTop: 10,
  },
  modalButtons: { 
    marginTop: 10,
    width: "40%",
    borderRadius: 20,
    padding: 10,
  },
  customButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  customButtonText: {
    fontWeight: "bold",
    color: "#000",
    textTransform: "none", // Ensures text remains as typed (not all uppercase)
    fontSize: 14,
  },
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
  personName: { 
    fontSize: 16, 
  },
  addPersonButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#ffc145",
    width: 50,
    height: 50,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  plusIcon: { 
    fontSize: 30, 
    color: "#000", 
    fontWeight: "bold",
    marginBottom: 3,
  },
});

export default HomeScreen;
