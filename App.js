import { AppRegistry } from "react-native";
import { enableScreens } from "react-native-screens";
import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { View, Text } from "react-native";
import HomeScreen from "./src/screens/HomeScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import { setupDatabase } from "./src/database";

enableScreens();

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    setupDatabase();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Rememberall" component={HomeScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Register the app entry point
AppRegistry.registerComponent("main", () => App);
