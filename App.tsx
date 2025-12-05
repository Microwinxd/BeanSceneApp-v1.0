import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";
import InternetStatus from "./src/services/internetConnectivity";

export default function App() {
  return (
    <>
      {/*  INTERNET OFFLINE BANNER */}
      <InternetStatus />

      {/* APP NAVIGATION */}

        <AppNavigator />
      
    </>
  );
}
