import { AppRegistry } from "react-native";
import { enableScreens } from "react-native-screens";
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./src/screens/HomeScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import { initializeDatabase, setupDatabase, addGroup, getGroups } from "./src/dbFunctions";

enableScreens();

const Stack = createStackNavigator();

export default function App() {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        await initializeDatabase();
        setupDatabase();
        // A short delay to allow table creation, then fetch groups.
        setTimeout(() => {
          getGroups((groupsFromDB) => setGroups(groupsFromDB));
        }, 500);
      } catch (error) {
        console.error("Database initialization error:", error);
      }
    })();
  }, []);

  const fetchGroups = () => {
    getGroups((fetchedGroups) => setGroups(fetchedGroups));
  };

  const handleAddGroup = (name) => {
    if (name.trim()) {
      addGroup(name.trim(), () => {
        fetchGroups();
      });
    }
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

AppRegistry.registerComponent("main", () => App);
