import { AppRegistry } from "react-native";
import { enableScreens } from "react-native-screens";
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./src/screens/HomeScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import { setupDatabase, addGroup, getGroups } from "./src/dbFunctions";

enableScreens();

const Stack = createStackNavigator();

export default function App() {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    setupDatabase();
    fetchGroups();
  }, []);

  const fetchGroups = () => {
    getGroups(setGroups);
  };

  const handleAddGroup = (name) => {
    addGroup(name, fetchGroups);
  };

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Rememberall">
          {(props) => (
            <HomeScreen
              {...props}
              groups={groups}
              addGroup={handleAddGroup}
              fetchGroups={fetchGroups}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Register the app entry point
AppRegistry.registerComponent("main", () => App);
