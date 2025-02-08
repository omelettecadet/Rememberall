const ProfileScreen = ({ route, navigation }) => {
  const { person } = route.params;
  
  const [name, setName] = useState(person.name);
  const [notes, setNotes] = useState(person.notes || "");
  const [selectedGroups, setSelectedGroups] = useState(person.groups || []);
  const [groupSelectorVisible, setGroupSelectorVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Name:</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      <Text style={styles.label}>Groups:</Text>
      <TouchableOpacity style={styles.groupSelector} onPress={() => setGroupSelectorVisible(true)}>
        <Text>{selectedGroups.length > 0 ? selectedGroups.join(", ") : "Select Groups"}</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Notes:</Text>
      <TextInput
        style={[styles.input, styles.notesInput]}
        value={notes}
        onChangeText={setNotes}
        multiline
      />

      {/* ✅ Move Buttons to Bottom */}
      <View style={styles.buttonContainer}>
        <Button title="Save" onPress={() => navigation.goBack()} />
        <Button
          title="Delete"
          color="red"
          onPress={() => {
            Alert.alert("Delete Person", "Are you sure you want to delete this person?", [
              { text: "Cancel", style: "cancel" },
              { text: "Yes, delete", onPress: () => navigation.goBack() },
            ]);
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  label: { fontWeight: "bold", marginTop: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginTop: 5 },
  notesInput: { flex: 1, textAlignVertical: "top", height: "50%" }, // ✅ Expand Notes Box
  buttonContainer: { position: "absolute", bottom: 20, left: 20, right: 20 }, // ✅ Align Buttons at Bottom
});

export default ProfileScreen;
