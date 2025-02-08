import { AppRegistry } from "react-native"; // ✅ Move this to the top
import { enableScreens } from "react-native-screens";

enableScreens();

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./src/screens/HomeScreen";
import ProfileScreen from "./src/screens/ProfileScreen";

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Rememberall" component={HomeScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;  

console.log("✅ App.js is running and navigation is loaded!");

// ✅ Register the app entry point
AppRegistry.registerComponent("main", () => App);
