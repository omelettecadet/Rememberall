import React, { useState } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from "react-native";

export default function App() {
  const [search, setSearch] = useState("");
  const [groups, setGroups] = useState(["Family", "Work Friends", "Childhood Friends"]);
  const [people, setPeople] = useState([
    { id: "1", name: "Alice Johnson", groups: ["Work Friends"] },
    { id: "2", name: "Bob Smith", groups: ["Family"] },
    { id: "3", name: "Charlie Brown", groups: ["Childhood Friends", "Work Friends"] },
  ]);
  const [filteredGroup, setFilteredGroup] = useState(null);

  const filteredPeople = people.filter((person) =>
    filteredGroup ? person.groups.includes(filteredGroup) : true
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search..."
        value={search}
        onChangeText={setSearch}
      />

      {/* Group List */}
      <FlatList
        data={groups}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.groupItem,
              filteredGroup === item && styles.selectedGroup,
            ]}
            onPress={() => setFilteredGroup(filteredGroup === item ? null : item)}
          >
            <Text style={styles.groupText}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      {/* People List */}
      <FlatList
        data={filteredPeople}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.personItem}>
            <Text style={styles.personName}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  searchBar: { height: 40, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, paddingLeft: 10, marginBottom: 10 },
  groupItem: { padding: 10, backgroundColor: "#f0f0f0", marginVertical: 5, borderRadius: 8 },
  selectedGroup: { backgroundColor: "#d0f0ff" },
  groupText: { fontSize: 16 },
  personItem: { padding: 15, borderBottomWidth: 1, borderColor: "#ddd" },
  personName: { fontSize: 18 },
});
