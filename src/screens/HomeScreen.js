import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Button,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const HomeScreen = () => {
  const navigation = useNavigation();

  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [groups, setGroups] = useState(["Family", "Work Friends", "Childhood Friends"]);
  const inputRef = useRef(null); // ✅ Ref to autofocus input

  const people = [
    { id: "1", name: "Alice Johnson", groups: ["Family"] },
    { id: "2", name: "Bob Smith", groups: ["Work Friends"] },
    { id: "3", name: "Charlie Brown", groups: ["Childhood Friends", "Work Friends"] },
  ];

  // ✅ Filter logic now includes searching groups
  const filteredPeople = people.filter(person => {
    const matchesSearch = person.name.toLowerCase().includes(search.toLowerCase()) ||
                          person.groups.some(group => group.toLowerCase().includes(search.toLowerCase()));
    const matchesGroup = selectedGroup ? person.groups.includes(selectedGroup) : true;
    return matchesSearch && matchesGroup;
  });

  return (
    <View style={styles.container}>
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
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.groupButton, selectedGroup === item && styles.selectedGroup]}
            onPress={() => setSelectedGroup(selectedGroup === item ? null : item)}
          >
            <Text style={styles.groupText}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      {/* + Add Group Button */}
      <TouchableOpacity style={styles.addGroupButton} onPress={() => {
        setGroupModalVisible(true);
        setTimeout(() => inputRef.current?.focus(), 100); // ✅ Autofocus input
      }}>
        <Text style={styles.addGroupText}>＋ Add Group</Text>
      </TouchableOpacity>

      {/* People List */}
      <FlatList
        data={filteredPeople}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.personItem}
            onPress={() => navigation.navigate("Profile", { person: { ...item, groups: item.groups || [] } })}
          >
            <Text style={styles.personName}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      {/* ✅ Group Modal with Autofocus & Outline */}
      <Modal visible={groupModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.label}>Enter New Group Name:</Text>
            <TextInput
              ref={inputRef} // ✅ Autofocus input
              style={styles.input}
              placeholder="New group name..."
              value={newGroupName}
              onChangeText={setNewGroupName}
            />
            <View style={styles.modalButtons}>
              <Button title="Cancel" onPress={() => setGroupModalVisible(false)} />
              <Button
                title="Add"
                onPress={() => {
                  if (newGroupName.trim() && !groups.includes(newGroupName.trim())) {
                    setGroups([...groups, newGroupName.trim()]);
                    setNewGroupName("");
                    setGroupModalVisible(false);
                  }
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  searchBar: { height: 40, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, paddingHorizontal: 10, marginBottom: 10 },
  input: { height: 40, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, paddingHorizontal: 10, marginVertical: 10 },
  addGroupButton: { padding: 10, marginTop: 10, backgroundColor: "#ddd", borderRadius: 8, alignSelf: "center" },
  addGroupText: { fontWeight: "bold", textAlign: "center" },
});

export default HomeScreen;
